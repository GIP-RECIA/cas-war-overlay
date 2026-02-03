package org.apereo.cas.web.flow;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
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
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.webflow.action.EventFactorySupport;
import org.springframework.webflow.core.collection.LocalAttributeMap;
import org.springframework.webflow.execution.Event;
import org.springframework.webflow.execution.RequestContext;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.Arrays;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
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
@EnableScheduling
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
     * HTTPClient to make requests to structs info api
     */
    private final HttpClient httpClient;

    /**
     * The regex used to replace the domain name in the URL
     */
    private final String replaceDomainRegex;

    /**
     * The base URL for the structs info API
     */
    private final String structsBaseAPIUrl;

    /**
     * The path for the structs info API
     */
    private final String baseAPIPath;

    /**
     * Map used to cache the domains corresponding to a certain siren
     * It looks like {siren1: domain1, siren2: domain2, ...}
     */
    private Map<String, String> domainBySirenCache;

    /**
     * Constructor
     * @param casConfigurationProperties configuration properties
     */
    public GenerateServiceTicketAction(AuthenticationSystemSupport authenticationSystemSupport, CentralAuthenticationService centralAuthenticationService, TicketRegistrySupport ticketRegistrySupport, AuthenticationServiceSelectionPlan authenticationRequestServiceSelectionStrategies, ServicesManager servicesManager, List<ServiceTicketGeneratorAuthority> serviceTicketAuthorities, CasWebflowCredentialProvider casWebflowCredentialProvider, CasConfigurationProperties casConfigurationProperties){
        this.authenticationSystemSupport = authenticationSystemSupport;
        this.centralAuthenticationService = centralAuthenticationService;
        this.ticketRegistrySupport = ticketRegistrySupport;
        this.authenticationRequestServiceSelectionStrategies = authenticationRequestServiceSelectionStrategies;
        this.servicesManager = servicesManager;
        this.serviceTicketAuthorities = serviceTicketAuthorities;
        this.casWebflowCredentialProvider = casWebflowCredentialProvider;
        this.casConfigurationProperties = casConfigurationProperties;
        this.httpClient = HttpClient.newHttpClient();
        this.structsBaseAPIUrl = casConfigurationProperties.getCustom().getProperties().get("interrupt.structs-base-api-url");
        this.baseAPIPath = casConfigurationProperties.getCustom().getProperties().get("interrupt.structs-api-path");
        this.replaceDomainRegex = casConfigurationProperties.getCustom().getProperties().get("interrupt.replace-domain-regex");
        this.domainBySirenCache = new HashMap<>();
    }

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

            // Customisation : redirect to correct domain
            // A null service means that the request is coming directly from the cas (so no redirection needed)
            if (service != null) {
                // Verify that redirection is not disabled for this service
                if (!registeredService.getProperties().isEmpty() && registeredService.getProperties().containsKey("skipDomainRedirect") && registeredService.getProperties().get("skipDomainRedirect").getBooleanValue()) {
                    LOGGER.trace("Redirection is disabled for service {}", registeredService.getServiceId());
                } else {
                    if(authentication.getPrincipal().getAttributes().containsKey("ESCOSIRENCourant")){
                        final String sirenCourant = (String) authentication.getPrincipal().getAttributes().get("ESCOSIRENCourant").getFirst();
                        if(sirenCourant != null){
                            final String domain = getUserDomain(sirenCourant);
                            LOGGER.trace("The current domain for [{}] is [{}]", authentication.getPrincipal().getId(), domain);
                            // If there is an error trying to retrieve the domain just skip and don't change the domain
                            if(domain != null){
                                final HttpServletRequest nativeRequest = (HttpServletRequest) context.getExternalContext().getNativeRequest();
                                final String requestURL = nativeRequest.getRequestURL().toString();
                                // If service.getId() does not contain the user domain, that means we need to redirect the user
                                if (!service.getId().contains(domain)) {
                                    final String newURL = requestURL + replaceServiceDomain(domain, "?service="+service.getOriginalUrl());
                                    LOGGER.debug("Multidomain : redirecting user [{}] from [{}] to [{}]", authentication.getPrincipal().getId(), service.getOriginalUrl(), newURL);
                                    context.getExternalContext().requestExternalRedirect(newURL);
                                    return result("error");
                                }
                            }
                        } else {
                            LOGGER.warn("ESCOSIRENCourant is null for [{}]", authentication.getPrincipal().getId());
                        }
                    } else {
                        LOGGER.warn("ESCOSIRENCourant is not in attributes for [{}]", authentication.getPrincipal().getId());
                    }
                }
            }

            // Continue if there is no need to be redirected

            // Customisation : redirect to cerbere for account activation
            if(casConfigurationProperties.getCustom().getProperties().containsKey("cerbere.validation.enabled")){
                val cerbereEnabled = Boolean.parseBoolean(casConfigurationProperties.getCustom().getProperties().get("cerbere.validation.enabled"));
                if(cerbereEnabled){
                    val attributeToEvalute = casConfigurationProperties.getCustom().getProperties().get("cerbere.validation.attribute-to-evaluate");
                    val valueToAvoid = casConfigurationProperties.getCustom().getProperties().get("cerbere.validation.value-to-avoid");
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
                            if(authentication.getPrincipal().getAttributes().get(attributeToEvalute).getFirst().equals(valueToAvoid)){
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


    /**
     * Gets the user domain from an external API
     * First we get the establishment based on the siren and then we look at the domain of the establishment
     * @param siren The current siren of the user
     * @return The user domain
     */
    private String getUserDomain(String siren) {
        // If domain is already in cache, just return it
        if(this.domainBySirenCache.containsKey(siren)){
            final String domain = this.domainBySirenCache.get(siren);
            LOGGER.trace("Domain [{}] found in cache for siren [{}]", domain, siren);
            return domain;
        }
        // Otherwise we need to get it from the API
        final String apiUrl = this.structsBaseAPIUrl + this.baseAPIPath + "?ids=" + siren;
        LOGGER.trace("Finding user domain: API URL is [{}]", apiUrl);
        try {
            // Construct the HTTP request
            HttpRequest request = HttpRequest.newBuilder().uri(URI.create(apiUrl)).build();
            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            LOGGER.trace("HTTP response to structs info request [{}] ", response.body());

            // Parse the JSON response
            ObjectMapper mapper = new ObjectMapper();
            JsonNode jsonResponse = mapper.readTree(response.body());

            // Extract the domain name from the JSON response
            JsonNode otherAttributes = jsonResponse.path(siren).path("otherAttributes").path("ESCODomaines");
            if (otherAttributes.isArray()) {
                Iterator<JsonNode> elements = otherAttributes.elements();
                int count = 0;
                String firstDomain = null;
                // Keep first domain name
                while (elements.hasNext()) {
                    JsonNode node = elements.next();
                    count++;
                    if (count == 1) {
                        firstDomain = node.asText();
                    }
                }
                // If only one domain, return this domain
                if (count == 1) {
                    return firstDomain;
                }
                // If multiple domains, return null so the domain will not change
                else if (count > 1) {
                    return null;
                }
            }
        } catch (Exception e) {
            LOGGER.error("An error has occurred trying to retrieve the user domain for [{}] siren, exception message is [{}]",
                    siren, e.getMessage());
        }
        return null;
    }

    /**
     * Method used to replace the bad domain in the url by the good domain
     * @param domain The new domain to put in the url
     * @param originalUrl The original URL of the request
     * @return The final URL the user will be redirected to
     */
    private String replaceServiceDomain(String domain, String originalUrl) {
        return originalUrl.replaceAll(this.replaceDomainRegex, "$1" + domain + "$2");
    }

    /**
     * Reload the cache at specific interval by resetting the map containing the domains associated with the sirens
     */
    @Scheduled(fixedDelayString = "${cas.custom.properties.interrupt.refresh-cache-interval:PT6H}")
    public void resetDomainBySirenCache(){
        this.domainBySirenCache.clear();
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
