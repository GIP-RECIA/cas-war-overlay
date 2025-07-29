package org.apereo.cas.interrupt;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import org.apereo.cas.authentication.Authentication;
import org.apereo.cas.authentication.Credential;
import org.apereo.cas.authentication.principal.Service;
import org.apereo.cas.configuration.CasConfigurationProperties;
import org.apereo.cas.services.RegisteredService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.webflow.execution.RequestContext;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;


@EnableScheduling
public class DomainChangeInterruptInquirer extends BaseInterruptInquirer {

    /**
     * Logger instance.
     */
    Logger LOGGER = LoggerFactory.getLogger(DomainChangeInterruptInquirer.class);

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
     * @param casProperties configuration properties
     */
    public DomainChangeInterruptInquirer(CasConfigurationProperties casProperties){
        this.httpClient = HttpClient.newHttpClient();
        this.structsBaseAPIUrl = casProperties.getCustom().getProperties().get("interrupt.structs-base-api-url");
        this.baseAPIPath = casProperties.getCustom().getProperties().get("interrupt.structs-api-path");
        this.replaceDomainRegex = casProperties.getCustom().getProperties().get("interrupt.replace-domain-regex");
        this.domainBySirenCache = new HashMap<>();
    }

    /**
     * Method called when the login flow is interrupted
     * @param authentication The authentication of the user (principal, attributes, ...)
     * @param registeredService The registered service (in the service registry)
     * @param service The "real" service from where the cas is queried
     * @param credential The credentials of the user
     * @param requestContext The request context in Spring Webflow
     * @return An InterruptResponse if the login flow needs to be interrupted, null otherwise
     */
    @Override
    protected InterruptResponse inquireInternal(Authentication authentication,
                                                RegisteredService registeredService,
                                                Service service,
                                                Credential credential,
                                                RequestContext requestContext) {
        // A null service means that the request is coming directly from the cas (so no redirection needed)
        if (service != null) {
            // Verify that redirection is not disabled for this service
            if (!registeredService.getProperties().isEmpty()) {
                if (registeredService.getProperties().containsKey("skipDomainRedirect") && registeredService.getProperties().get("skipDomainRedirect").getBooleanValue()){
                    return null;
                }
            }
            if(authentication.getPrincipal().getAttributes().containsKey("ESCOSIRENCourant")){
                final String sirenCourant = (String) authentication.getPrincipal().getAttributes().get("ESCOSIRENCourant").getFirst();
                if(sirenCourant != null){
                    final String domain = getUserDomain(sirenCourant);
                    LOGGER.trace("The current domain for [{}] is [{}]", authentication.getPrincipal().getId(), domain);
                    // If there is an error trying to retrieve the domain just skip and don't change the domain
                    if(domain != null){
                        final HttpServletRequest nativeRequest = (HttpServletRequest) requestContext.getExternalContext().getNativeRequest();
                        final String requestURL = nativeRequest.getRequestURL().toString();
                        // If service.getId() does not contain the user domain, that means we need to redirect the user
                        if (!service.getId().contains(domain)) {
                            final String newURL = requestURL + replaceServiceDomain(domain, "?service="+service.getOriginalUrl());
                            LOGGER.debug("Multidomain : redirecting user [{}] from [{}] to [{}]", authentication.getPrincipal().getId(), service.getOriginalUrl(), newURL);
                            InterruptResponse interrupt = new InterruptResponse("Changement de domaine", Map.of("Continuer", newURL), false, true);
                            interrupt.setAutoRedirect(true);
                            LOGGER.trace("Returning an interrupt response to redirect the user to [{}]", newURL);
                            return interrupt;
                        }
                    }
                } else {
                    LOGGER.warn("ESCOSIRENCourant is null for [{}]", authentication.getPrincipal().getId());
                }
            } else {
                LOGGER.warn("ESCOSIRENCourant is not in attributes for [{}]", authentication.getPrincipal().getId());
            }
        }
        // Return null if there is no need to interrupt the flow
        return null;
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

}
