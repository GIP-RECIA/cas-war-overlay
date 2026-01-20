package org.apereo.cas.web.flow;

import module java.base;
import org.apereo.cas.authentication.AuthenticationServiceSelectionPlan;
import org.apereo.cas.configuration.CasConfigurationProperties;
import org.apereo.cas.services.RegisteredServiceProperty;
import org.apereo.cas.services.ServicesManager;
import org.apereo.cas.services.UnauthorizedServiceException;
import org.apereo.cas.util.function.FunctionUtils;
import org.apereo.cas.web.flow.actions.BaseCasWebflowAction;
import org.apereo.cas.web.support.WebUtils;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import lombok.val;
import org.jspecify.annotations.Nullable;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.util.StringUtils;
import org.springframework.webflow.execution.Event;
import org.springframework.webflow.execution.RequestContext;

/**
 * This is {@link BaseServiceAuthorizationCheckAction}.
 *
 * @author Misagh Moayyed
 * @since 6.1.0
 */
@Slf4j
@RequiredArgsConstructor(access = AccessLevel.PROTECTED)
public abstract class BaseServiceAuthorizationCheckAction extends BaseCasWebflowAction {
    private final ServicesManager servicesManager;

    private final AuthenticationServiceSelectionPlan authenticationRequestServiceSelectionStrategies;

    @Autowired
    private CasConfigurationProperties casProperties;

    @Override
    protected @Nullable Event doExecuteInternal(final RequestContext context) {
        val serviceInContext = WebUtils.getService(context);
        val service = FunctionUtils.doUnchecked(() -> authenticationRequestServiceSelectionStrategies.resolveService(serviceInContext));
        if (service == null) {
            return success();
        }
        val registeredService = servicesManager.findServiceBy(service);
        if (registeredService == null) {
            val msg = String.format("Service [%s] is not found in service registry.", service.getId());
            LOGGER.warn(msg);
            throw UnauthorizedServiceException.denied(msg);
        }
        if (!registeredService.getAccessStrategy().isServiceAccessAllowed(registeredService, service)) {
            val msg = String.format("Service Management: Unauthorized Service Access. "
                + "Service [%s] is not allowed access via the service registry.", service.getId());
            LOGGER.warn(msg);
            WebUtils.putUnauthorizedRedirectUrlIntoFlowScope(context,
                registeredService.getAccessStrategy().getUnauthorizedRedirectUrl());
            throw UnauthorizedServiceException.denied(msg);
        }
        val delegatedPolicy = registeredService.getAccessStrategy().getDelegatedAuthenticationPolicy();
        WebUtils.putCasLoginFormViewable(context, delegatedPolicy == null || !delegatedPolicy.isExclusive());

        // Custom enhancement : make sure user log in via portal service at least once a day (Policy defined by service)
        // If needed, redirects to portal if domain is recognized, or to generic page if domain is not recognized
        Map<String, RegisteredServiceProperty> servicePropertyMap = registeredService.getProperties();
        if(servicePropertyMap != null) {
            if (servicePropertyMap.containsKey("portalRedirectionNeeded") && servicePropertyMap.get("portalRedirectionNeeded").getBooleanValue()) {
                final String serviceUrl = context.getRequestParameters().get("service");
                final String token = context.getRequestParameters().get("token");
                LOGGER.debug("Service [{}] requires to check token validy", serviceUrl);

                // If there is no token -> redirect to portal
                if (token == null) {
                    LOGGER.debug("No token was found for service [{}]", serviceUrl);
                    try {
                        return redirectToPortal(context, serviceUrl, servicePropertyMap);
                    } catch (URISyntaxException e) {
                        LOGGER.error("An error occured while trying to redirect to portal", e);
                    }
                }
                // If token -> Check validity
                else {
                    LOGGER.debug("Token found for service [{}]", serviceUrl);
                    // If token but not valid -> redirect to portal
                    if (!isTokenValid(token)) {
                        LOGGER.info("Token [{}] for service [{}] is invalid", token, serviceUrl);
                        try {
                            return redirectToPortal(context, serviceUrl, servicePropertyMap);
                        } catch (URISyntaxException e) {
                            LOGGER.error("An error occured while trying to redirect to portal", e);
                        }
                    }
                    LOGGER.debug("Token [{}] for service [{}] is valid", token, serviceUrl);
                }
            }
        }
        // If token and token is valid, or if service does not require portal redirection, continue normal flow
        return success();
    }

    /**
     * Check token validity for current day and previous day.
     * @param token The token in the URL
     * @return True if the token is valid for at least one of the days, False otherwise
     */
    private boolean isTokenValid(final String token){
        long currentPeriod = (System.currentTimeMillis() + 14400000L) / 86400000L;
        return checkTokenTimeValidity(token, currentPeriod) || checkTokenTimeValidity(token, currentPeriod - 1L);
    }

    /**
     * Check token validity for one day
     * Based on <a href="https://github.com/GIP-RECIA/cas/blob/EduConnect/cas-server-support-multidomain/src/main/java/org/esco/cas/web/flow/IndexRedirectByTokenAction.java#L163">this</a>
     * @param token The token in the URL
     * @param period The day to test
     * @return True if the token is valid for that day, False otherwise
     */
    private boolean checkTokenTimeValidity(final String token, final long period){
        String periodToken = null;
        if (StringUtils.hasText(token)) {
            try {
                MessageDigest md5Digester = MessageDigest.getInstance("MD5");
                byte[] hashedPeriod = md5Digester.digest(String.valueOf(period).getBytes());
                if ((hashedPeriod != null) && (hashedPeriod.length > 0)) {
                    StringBuilder sb = new StringBuilder(32);
                    for (byte b : hashedPeriod) {
                        String hex = Integer.toHexString(b);
                        if (hex.length() == 1) {
                            sb.append("0");
                            sb.append(hex);
                        } else {
                            sb.append(hex.substring(hex.length() - 2));
                        }
                    }
                    periodToken = sb.toString();
                }
            } catch (NoSuchAlgorithmException e) {
                LOGGER.error("Error while attempting to hash token with MD5 !", e);
            }
        }
        boolean test = (periodToken != null) && (periodToken.equals(token));
        if (LOGGER.isDebugEnabled()) {
            if (test) {
                LOGGER.debug("Token [{}] is valid on period [{}]", token, period);
            } else {
                LOGGER.debug("Token [{}] is not valid on period [{}]", token, period);
            }
        }
        return test;
    }

    /**
     * Redirect to portal corresponding to domain if domain is known
     * Else, redirect to generic page with all portals
     * @param context The request context
     * @param serviceUrl The service parameter
     * @param servicePropertyMap The service custom properties
     * @return A success event in for the Webflow
     */
    private Event redirectToPortal(final RequestContext context, final String serviceUrl, Map<String, RegisteredServiceProperty> servicePropertyMap) throws URISyntaxException {
        final String domain = extractDomainFromService(serviceUrl);
        LOGGER.debug("Domain [{}] extracted from serviceUrl", domain);
        final Set<String> domainsKnown = Arrays.stream(casProperties.getCustom().getProperties().get("token.domain-list")
                .split(","))
                .map(String::trim)
                .collect(Collectors.toSet());
        String redirectUrl;
        // If domain is known, we can redirect directly
        if(domainsKnown.contains(domain)){
            redirectUrl = new URI(extractProtocolFromService(serviceUrl), domain,
                    casProperties.getCustom().getProperties().get("token.redirect-portal-context"), null).toString();
            LOGGER.debug("Redirecting to portal at [{}]", redirectUrl);
        // If domain is not known, we need to search if it is not mapped with another domain
        } else {
            final String domainRedirectionPrefix =  casProperties.getCustom().getProperties().get("token.domain-mapping-startswith");
            if(servicePropertyMap.containsKey("domainRedirectionNeeded") && servicePropertyMap.get("domainRedirectionNeeded").getBooleanValue()){
                List<String> mappedDomains = servicePropertyMap.keySet().stream()
                        .filter(cle -> cle.startsWith(domainRedirectionPrefix))
                        .map(cle -> cle.substring(domainRedirectionPrefix.length()))
                        .toList();
                if(mappedDomains.contains(domain)){
                    redirectUrl = new URI(extractProtocolFromService(serviceUrl),
                            servicePropertyMap.get(domainRedirectionPrefix+domain).value(),
                            casProperties.getCustom().getProperties().get("token.redirect-portal-context"), null).toString();
                    LOGGER.debug("Mapped domain found ! Redirecting to portal at [{}]", redirectUrl);
                } else {
                    redirectUrl = casProperties.getCustom().getProperties().get("token.redirect-unknown-domain");
                    LOGGER.debug("Domain should be mapped but can't be found in service definition ! Redirecting by default to [{}]", redirectUrl);
                }
            } else {
                redirectUrl = casProperties.getCustom().getProperties().get("token.redirect-unknown-domain");
                LOGGER.debug("Can't recognize domain ! Redirecting to [{}]", redirectUrl);
            }
        }
        // Do the redirect
        context.getExternalContext().requestExternalRedirect(redirectUrl);
        return success();
    }

    /**
     * Extract domain name from serviceid
     * @param serviceUrl The service parameter
     * @return The domain, or an empty string if there is an error in the URL
     */
    private String extractDomainFromService(String serviceUrl) {
        try {
            return new URI(serviceUrl).toURL().getHost();
        } catch (Exception e) {
            LOGGER.error("An error occured trying to extract domain from service url !", e);
            return "";
        }
    }

    /**
     * Extract protocol from serviceid
     * @param serviceUrl The service parameter
     * @return The protocol, or an empty string if there is an error in the URL
     */
    private String extractProtocolFromService(String serviceUrl) {
        try {
            return new URI(serviceUrl).toURL().getProtocol();
        } catch (Exception e) {
            LOGGER.error("An error occured trying to extract protocol from service url !", e);
            return "";
        }
    }
}
