package org.apereo.cas.web.flow;

import org.apereo.cas.CasProtocolConstants;
import org.apereo.cas.CentralAuthenticationService;
import org.apereo.cas.authentication.AuthenticationException;
import org.apereo.cas.authentication.AuthenticationResult;
import org.apereo.cas.authentication.AuthenticationServiceSelectionPlan;
import org.apereo.cas.authentication.AuthenticationSystemSupport;
import org.apereo.cas.authentication.Credential;
import org.apereo.cas.authentication.principal.Service;
import org.apereo.cas.configuration.CasConfigurationProperties;
import org.apereo.cas.services.ServicesManager;
import org.apereo.cas.ticket.InvalidTicketException;
import org.apereo.cas.ticket.ServiceTicketGeneratorAuthority;
import org.apereo.cas.ticket.registry.TicketRegistrySupport;
import org.apereo.cas.util.function.FunctionUtils;
import org.apereo.cas.web.flow.actions.BaseCasWebflowAction;
import org.apereo.cas.web.support.WebUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import lombok.val;
import org.jooq.lambda.Unchecked;
import org.springframework.core.annotation.AnnotationAwareOrderComparator;
import org.springframework.webflow.action.EventFactorySupport;
import org.springframework.webflow.core.collection.LocalAttributeMap;
import org.springframework.webflow.execution.Event;
import org.springframework.webflow.execution.RequestContext;

import java.net.URI;
import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

/**
 * Action to generate a service ticket for a given Ticket Granting Ticket and
 * Service.
 *
 * @author Scott Battaglia
 * @since 3.0.0
 */
@Slf4j
@RequiredArgsConstructor
public class GenerateServiceTicketAction extends BaseCasWebflowAction {

    private final AuthenticationSystemSupport authenticationSystemSupport;

    private final CentralAuthenticationService centralAuthenticationService;

    private final TicketRegistrySupport ticketRegistrySupport;

    private final AuthenticationServiceSelectionPlan authenticationRequestServiceSelectionStrategies;

    private final ServicesManager servicesManager;

    private final List<ServiceTicketGeneratorAuthority> serviceTicketAuthorities;

    private final CasWebflowCredentialProvider casWebflowCredentialProvider;

    private final CasConfigurationProperties casConfigurationProperties;

    private Set<String> authorizedDomains;

    /**
     * {@inheritDoc}
     * <p>
     * In the initial primary authentication flow, credentials are cached and available.
     * Since they are authenticated as part of submission first, there is no need to doubly
     * authenticate and verify credentials.
     * <p>
     * In subsequent authentication flows where a TGT is available and only an ST needs to be
     * created, there are no cached copies of the credential, since we do have a TGT available.
     * So we will grab the available authentication and produce the final result based on that.
     */
    @Override
    protected Event doExecuteInternal(final RequestContext context) throws Exception {
        val service = WebUtils.getService(context);
        LOGGER.trace("Service asking for service ticket is [{}]", service);

        val ticketGrantingTicket = WebUtils.getTicketGrantingTicketId(context);
        LOGGER.debug("Ticket-granting ticket found in the context is [{}]", ticketGrantingTicket);

        try {
            val authentication = ticketRegistrySupport.getAuthenticationFrom(ticketGrantingTicket);
            if (authentication == null) {
                val authn = new AuthenticationException("No authentication found for ticket " + ticketGrantingTicket);
                throw new InvalidTicketException(authn, ticketGrantingTicket);
            }

            val selectedService = authenticationRequestServiceSelectionStrategies.resolveService(service);
            val registeredService = servicesManager.findServiceBy(selectedService);
            LOGGER.debug("Registered service asking for service ticket is [{}]", registeredService);
            WebUtils.putRegisteredService(context, registeredService);
            WebUtils.putServiceIntoFlowScope(context, service);

            if (registeredService != null) {
                val url = registeredService.getAccessStrategy().getUnauthorizedRedirectUrl();
                if (url != null) {
                    LOGGER.debug("Registered service may redirect to [{}] for unauthorized access requests", url);
                }
                WebUtils.putUnauthorizedRedirectUrlIntoFlowScope(context, url);
            }
            if (WebUtils.getWarningCookie(context)) {
                LOGGER.debug("Warning cookie is present in the request context. Routing result to [{}] state", CasWebflowConstants.STATE_ID_WARN);
                return result(CasWebflowConstants.STATE_ID_WARN);
            }

            val credentials = casWebflowCredentialProvider.extract(context);
            val builder = authenticationSystemSupport.establishAuthenticationContextFromInitial(authentication,
                credentials.toArray(Credential.EMPTY_CREDENTIALS_ARRAY));
            val authenticationResult = builder.build(service);

            // Customisation : redirect to cerbere for account activation
            if(casConfigurationProperties.getCustom().getProperties().containsKey("cerbere.validation.enabled")){
                val cerbereEnabled = Boolean.parseBoolean(casConfigurationProperties.getCustom().getProperties().get("cerbere.validation.enabled"));
                if(cerbereEnabled){
                    val attributeToEvalute = casConfigurationProperties.getCustom().getProperties().get("cerbere.validation.attribute-to-evaluate");
                    val valueToExpect = casConfigurationProperties.getCustom().getProperties().get("cerbere.validation.value-to-excpect");
                    val cerbereDefaultUrl = casConfigurationProperties.getCustom().getProperties().get("cerbere.validation.default-url");
                    val cerbereIdRegex = Pattern.compile(casConfigurationProperties.getCustom().getProperties().get("cerbere.validation.service-id"));
                    val cerberePath = casConfigurationProperties.getCustom().getProperties().get("cerbere.validation.redirect-path");
                    if(authorizedDomains == null){
                        if(casConfigurationProperties.getCustom().getProperties().get("cerbere.validation.authorized-domains") == null){
                            LOGGER.error("No authorized domains were provided in configuraiton for cerbere link generation");
                            this.authorizedDomains = new HashSet<>();
                        } else {
                            authorizedDomains = Arrays.stream(casConfigurationProperties.getCustom().getProperties().get("cerbere.validation.authorized-domains")
                                .split(","))
                                .map(String::trim)
                                .collect(Collectors.toSet());
                        }
                    }
                    LOGGER.trace("Login flow was interrupted for [{}] by cerbere check", authentication.getPrincipal().getId());
                    // If local auth don't check account validation
                    if(!authentication.getAttributes().containsKey("clientName")){
                        LOGGER.trace("Local authentication : account validation not checked for [{}]", authentication.getPrincipal().getId());
                    } else {
                        if(authentication.getPrincipal().getAttributes().containsKey(attributeToEvalute)){
                            if(!authentication.getPrincipal().getAttributes().get(attributeToEvalute).getFirst().equals(valueToExpect)){
                                if(service != null){
                                    final Matcher matcher = cerbereIdRegex.matcher(service.getId());
                                    // If account is invalid but service is cerbere, do not interrupt the flow
                                    if(matcher.find()){
                                        LOGGER.info("Account [{}] needs to be validated but service is cerbere. Continuing...", authentication.getPrincipal().getId());
                                    } else {
                                        // If account is invalid and service is not cerbere, redirect to cerbere
                                        LOGGER.info("Redirecting user [{}] to cerbere for account validation", authentication.getPrincipal().getId());

                                        URI uri = new URI(service.getOriginalUrl());
                                        String domain = uri.getHost();
                                        if(uri.getPort() != -1){
                                            domain += ":"+uri.getPort();
                                        }
                                        String finalRedirectUrl = cerbereDefaultUrl;
                                        if(authorizedDomains.contains(domain)){
                                            finalRedirectUrl = uri.getScheme() + "://" + domain + cerberePath;
                                            LOGGER.info("Domain {} is authorized, redirecting to : {}", domain, finalRedirectUrl);
                                        } else {
                                            LOGGER.info("Domain {} is not authorized, redirecting to default domain : {}", domain, finalRedirectUrl);
                                        }
                                        context.getExternalContext().requestExternalRedirect(finalRedirectUrl);
                                        return result("error");
                                    }
                                }
                            }
                        } else {
                            LOGGER.error("Could not redirect to cerbere, no attribute {} was found in principal {}",
                             attributeToEvalute, authentication.getPrincipal().getId());
                        }

                    }
                }
            }
            
            LOGGER.trace("Built the final authentication result [{}] to grant service ticket to [{}]", authenticationResult, service);
            grantServiceTicket(authenticationResult, service, context);
            return success();

        } catch (final Throwable e) {
            if (e instanceof InvalidTicketException) {
                LOGGER.debug("CAS has determined ticket-granting ticket [{}] is invalid and must be destroyed", ticketGrantingTicket);
                ticketRegistrySupport.getTicketRegistry().deleteTicket(ticketGrantingTicket);
            }
            if (isGatewayPresent(context)) {
                LOGGER.debug("Request indicates that it is gateway. Routing result to [{}] state", CasWebflowConstants.TRANSITION_ID_GATEWAY);
                return result(CasWebflowConstants.TRANSITION_ID_GATEWAY);
            }
            LOGGER.warn("Could not grant service ticket [{}]. Routing to [{}]", e.getMessage(), CasWebflowConstants.TRANSITION_ID_AUTHENTICATION_FAILURE);
            return newEvent(CasWebflowConstants.TRANSITION_ID_AUTHENTICATION_FAILURE, e);
        }
    }

    private void grantServiceTicket(final AuthenticationResult authenticationResult,
                                    final Service service,
                                    final RequestContext requestContext) {
        serviceTicketAuthorities
            .stream()
            .sorted(AnnotationAwareOrderComparator.INSTANCE)
            .filter(auth -> auth.supports(authenticationResult, service))
            .findFirst()
            .ifPresent(Unchecked.consumer(auth -> {
                if (auth.shouldGenerate(authenticationResult, service)) {
                    FunctionUtils.doUnchecked(__ -> {
                        val ticketGrantingTicket = WebUtils.getTicketGrantingTicketId(requestContext);
                        val serviceTicketId = centralAuthenticationService.grantServiceTicket(ticketGrantingTicket, service, authenticationResult);
                        WebUtils.putServiceTicketInRequestScope(requestContext, serviceTicketId);
                        LOGGER.debug("Granted service ticket [{}] and added it to the request scope", serviceTicketId);
                    });
                }
            }));
    }

    protected boolean isGatewayPresent(final RequestContext context) {
        return WebUtils.getRequestParameterOrAttribute(context, CasProtocolConstants.PARAMETER_GATEWAY).isPresent();
    }

    private Event newEvent(final String id, final Throwable error) {
        return new EventFactorySupport().event(this, id, new LocalAttributeMap<>("error", error));
    }
}
