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
import org.springframework.core.io.DefaultResourceLoader;
import org.springframework.core.io.Resource;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.webflow.action.EventFactorySupport;
import org.springframework.webflow.core.collection.LocalAttributeMap;
import org.springframework.webflow.execution.Event;
import org.springframework.webflow.execution.RequestContext;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Instant;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
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
     * Date formatter to read Instant given from LDAP attribute
     */
    private final DateTimeFormatter formatterLDAP;

    /**
     * Date formatter to read Instant given from file
     */
    private final DateTimeFormatter formatterFile;

    /**
     * Map used to cache the date of the charters for each domain
     */
    private Map<String, Instant> chartersDateByDomain;

    /**
     * Resource loader to load CSV file for cerbere
     */
    private final DefaultResourceLoader resourceLoader;

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
        this.formatterLDAP = DateTimeFormatter.ofPattern("yyyyMMddHHmmssX");
        this.formatterFile = DateTimeFormatter.ofPattern("yyyyMMdd");
        this.resourceLoader = new DefaultResourceLoader();
        loadChartersDateByDomain();
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
            val principalId = authentication.getPrincipal().getId();

            // Customisation (1): redirect to correct domain
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
                            LOGGER.trace("The current domain for [{}] is [{}]", principalId, domain);
                            // If there is an error trying to retrieve the domain just skip and don't change the domain
                            if(domain != null){
                                final HttpServletRequest nativeRequest = (HttpServletRequest) context.getExternalContext().getNativeRequest();
                                final String requestURL = nativeRequest.getRequestURL().toString();
                                // If service.getId() does not contain the user domain, that means we need to redirect the user
                                if (!service.getId().contains(domain)) {
                                    final String newURL = requestURL + replaceServiceDomain(domain, "?service="+service.getOriginalUrl());
                                    LOGGER.debug("Multidomain : redirecting user [{}] from [{}] to [{}]", principalId, service.getOriginalUrl(), newURL);
                                    context.getExternalContext().requestExternalRedirect(newURL);
                                    return result("error");
                                }
                            }
                        } else {
                            LOGGER.warn("ESCOSIRENCourant is null for [{}]", principalId);
                        }
                    } else {
                        LOGGER.warn("ESCOSIRENCourant is not in attributes for [{}]", principalId);
                    }
                }
            }

            // Continue if there is no need to be redirected

            // Customisation (2) : redirect to cerbere for account activation
            if(casConfigurationProperties.getCustom().getProperties().containsKey("cerbere.validation.enabled")){
                val cerbereEnabled = Boolean.parseBoolean(casConfigurationProperties.getCustom().getProperties().get("cerbere.validation.enabled"));
                if(cerbereEnabled){
                    val cerbereProtocol = casConfigurationProperties.getCustom().getProperties().get("cerbere.validation.protocol");
                    val attributeToEvaluate = casConfigurationProperties.getCustom().getProperties().get("cerbere.validation.attribute-to-evaluate");
                    val cerbereDefaultUrl = casConfigurationProperties.getCustom().getProperties().get("cerbere.validation.default-url");
                    val cerbereIdRegex = Pattern.compile(casConfigurationProperties.getCustom().getProperties().get("cerbere.validation.service-id"));
                    val cerberePath = casConfigurationProperties.getCustom().getProperties().get("cerbere.validation.redirect-path");
                    if(authorizedDomains == null){
                        if(casConfigurationProperties.getCustom().getProperties().get("cerbere.validation.authorized-domains") == null){
                            LOGGER.error("No authorized domains were provided in configuration for cerbere link generation");
                            this.authorizedDomains = new HashSet<>();
                        } else {
                            authorizedDomains = Arrays.stream(casConfigurationProperties.getCustom().getProperties().get("cerbere.validation.authorized-domains").split(","))
                                    .map(String::trim)
                                    .collect(Collectors.toSet());
                        }
                    }
                    LOGGER.trace("Login flow was interrupted for [{}] by cerbere check", principalId);
                    if (service != null) {
                        // If service is cerbere, do not interrupt the flow
                        final Matcher matcher = cerbereIdRegex.matcher(service.getId());
                        if(matcher.find()) {
                            LOGGER.info("Service is cerbere for [{}]. Continuing...", principalId);
                        } else {
                            // If service is not cerbere, check if charte is validated
                            boolean hasSignedCharter = false;
                            // Get current domain of user (do not obtain it from service)
                            final String sirenCourant = (String) authentication.getPrincipal().getAttributes().get("ESCOSIRENCourant").getFirst();
                            String userDomain = getUserDomain(sirenCourant);
                            // If multidomain, then use default domain to check signing
                            if(userDomain == null){
                                LOGGER.info("User [{}] with multidomain etab, choosing default domain", principalId);
                                userDomain = casConfigurationProperties.getCustom().getProperties().get("cerbere.validation.default-domain");
                            }
                            LOGGER.debug("Domain of user [{}] : [{}]", principalId, userDomain);
                            if(authentication.getPrincipal().getAttributes().containsKey(attributeToEvaluate)) {
                                for (Object signature : authentication.getPrincipal().getAttributes().get(attributeToEvaluate)) {
                                    final String[] tab = ((String) signature).split("\\$");
                                    final String signatureDomain = tab[0];
                                    LOGGER.debug("Domain of charter signed by user [{}] : [{}]", principalId, signatureDomain);
                                    if(signatureDomain.equals(userDomain)) {
                                        final String signatureDate = tab[1];
                                        LOGGER.debug("Date of charter signed by user [{}] : [{}]", principalId, signatureDate);
                                        final Instant dateSignature = OffsetDateTime.parse(signatureDate, this.formatterLDAP).toInstant();
                                        if(this.chartersDateByDomain.containsKey(userDomain)){
                                            final Instant startingDate = this.chartersDateByDomain.get(userDomain);
                                            if (dateSignature.isBefore(startingDate) || dateSignature.equals(startingDate)) {
                                                LOGGER.info("Charted signature date for user [{}] domain [{}] is invalid", principalId, userDomain);
                                            } else {
                                                LOGGER.info("Charted signature date for user [{}] domain [{}] is valid", principalId, userDomain);
                                                hasSignedCharter = true;
                                            }
                                        } else {
                                            // Si on a un domaine qu'on ne connait pas dans le fichier : on vérifie juste que la charte est signée pour ce domaine sans checker la date
                                            LOGGER.warn("Charter was signed for user [{}] domain [{}] but domain wasn't found in file !", principalId, userDomain);
                                            hasSignedCharter = true;
                                        }
                                    }
                                }
                            } else {
                                LOGGER.info("No charter was signed for user [{}]", principalId);
                            }
                            LOGGER.info("hasSignedCharter for user [{}] is [{}]", principalId, hasSignedCharter);
                            if(!hasSignedCharter){
                                // If account is invalid and service is not cerbere, redirect to cerbere
                                LOGGER.info("Redirecting user [{}] to cerbere for account validation", principalId);
                                String finalRedirectUrl = cerbereDefaultUrl;
                                if(authorizedDomains.contains(userDomain)){
                                    finalRedirectUrl = cerbereProtocol + userDomain + cerberePath;
                                    LOGGER.info("Domain [{}] is authorized for user [{}], redirecting to : {}", userDomain, principalId, finalRedirectUrl);
                                } else {
                                    LOGGER.info("Domain [{}] is not authorized for user [{}], redirecting to default domain : {}", userDomain, principalId, finalRedirectUrl);
                                }
                                context.getExternalContext().requestExternalRedirect(finalRedirectUrl);
                                return result("error");
                            }
                        }
                    } else {
                        LOGGER.warn("Cerbere valiation: service should not be null");
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
            LOGGER.error("An error has occurred trying to retrieve the user domain for [{}] siren", siren, e);
        }
        return null;
    }

    /**
     * Loads the date of charters for each domain from CSV file
     */
    private void loadChartersDateByDomain() {
        // First loading
        if(this.chartersDateByDomain == null){
            this.chartersDateByDomain = new HashMap<>();
        }

        final String csvPath = casConfigurationProperties.getCustom().getProperties().get("cerbere.validation.csv-path");
        if (csvPath == null) {
            LOGGER.error("No CSV path configured for Cerbere validation dates");
            return;
        }

        final Resource resource = resourceLoader.getResource(csvPath);
        if (!resource.exists()) {
            LOGGER.error("Cerbere validation CSV does not exist: [{}]", csvPath);
            return;
        }

        // Read each line of file
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(resource.getInputStream(), StandardCharsets.UTF_8))) {
            String line = reader.readLine();
            while (line != null) {
                final String[] columns = line.split(";", -1);
                if (columns.length < 2) {
                    LOGGER.warn("Invalid Cerbere CSV line, too long: [{}]", line);
                    continue;
                }
                final String domain = columns[0].trim();
                final String dateValue = columns[1].trim();
                if (domain.isEmpty() || dateValue.isEmpty()) {
                    LOGGER.warn("Invalid Cerbere CSV line, empty value: [{}]", line);
                }
                // Update date in cache for this domain
                try {
                    final Instant date = LocalDate.parse(dateValue, this.formatterFile).atStartOfDay(ZoneOffset.UTC).toInstant();
                    this.chartersDateByDomain.put(domain, date);
                } catch (Exception e) {
                    LOGGER.warn("Unable to parse Cerbere line [{}]", line);
                }
                line = reader.readLine();
            }
        } catch (IOException e) {
            LOGGER.error("Unable to load Cerbere validation CSV [{}]", csvPath, e);
        }
        LOGGER.info("Cerbere validation dates cache reloaded: {}", this.chartersDateByDomain);

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
     * Reload the cache for charters date domains each night
     */
    @Scheduled(cron = "${cas.custom.properties.cerbere.validation.csv-refresh-cron:0 0 0 * * *}")
    public void reloadCerbereValidationDates() {
        LOGGER.info("Reloading Cerbere validation dates cache");
        loadChartersDateByDomain();
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
