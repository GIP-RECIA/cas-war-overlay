package org.apereo.cas.services;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.apache.hc.core5.net.URIBuilder;
import org.apereo.cas.authentication.principal.AbstractWebApplicationService;
import org.apereo.cas.configuration.CasConfigurationProperties;
import org.apereo.cas.ticket.UnsatisfiedAuthenticationContextTicketValidationException;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;
import lombok.experimental.Accessors;
import lombok.extern.slf4j.Slf4j;
import lombok.val;

import java.io.Serial;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.List;
import java.util.TreeMap;

/**
 * Determines the username for this registered service based on an externalid.
 * If the externalid is not found, an exception is thrown.
 *
 * @author Nathan Cailbourdin
 * @since 7.1.1
 */
@Slf4j
@ToString
@Getter
@Setter
@AllArgsConstructor
@Accessors(chain = true)
@EqualsAndHashCode(callSuper = true)
@JsonInclude(JsonInclude.Include.NON_DEFAULT)
public class PrincipalExternalIdRegisteredOidcServiceUsernameProvider extends BaseRegisteredServiceUsernameAttributeProvider {

    @Serial
    private static final long serialVersionUID = 6481759871666720069L;
    
    @JsonProperty
    private String internalServiceId;

    @JsonIgnore
    private transient HttpClient httpClient;

    public PrincipalExternalIdRegisteredOidcServiceUsernameProvider(){
        super();
    }

    /**
     * Gets the externalid based on user and service and returns it as the principal name.
     * @param context The RegisteredServiceUsernameProviderContext context
     * @return The principal name.
     */
    @Override
    public String resolveUsernameInternal(final RegisteredServiceUsernameProviderContext context) {

        val properties = context.getApplicationContext().getBean(CasConfigurationProperties.class);
        val externalIdAttributeNameLDAP = properties.getCustom().getProperties().get("externalid.attribute-name-ldap");
        val splitCharacter = properties.getCustom().getProperties().get("externalid.split-character");

        // Get resolved attributes for principal
        var principalId = context.getPrincipal().getId();
 
        // Special modification for OIDC : if principal is serviceid and not user, do not try to get the externalid
        if(((AbstractWebApplicationService)context.getService()).getPrincipal() == null){
            return principalId;
        }
    
        val originalPrincipalAttributes = new TreeMap<>(String.CASE_INSENSITIVE_ORDER);
        originalPrincipalAttributes.putAll(context.getPrincipal().getAttributes());
        LOGGER.debug("Original principal attributes available for selection of username attribute are [{}].",
                originalPrincipalAttributes);

        // Get the externalId for this service and this user
        LOGGER.debug("Trying to retrieve externalid for user [{}] and service [{}]", principalId, context.getRegisteredService().getName());
        String externalUserId = null;
        // First, get all externalids for this user
        List<Object> externalIds = (List<Object>) originalPrincipalAttributes.get(externalIdAttributeNameLDAP);
        if(externalIds != null){
            // Then, search if externalid exists for this service
            for (Object externalId : externalIds) {
                String stringExternalId = (String) externalId;
                if (stringExternalId.startsWith(internalServiceId)) {
                    externalUserId = stringExternalId;
                    LOGGER.debug("Externalid [{}] found for user [{}] and service [{}]",
                            externalUserId, principalId, context.getRegisteredService().getName());
                }
            }
        }

        // If the externalId does not exist, insert it with the externalId API
        if (externalUserId == null) {
            LOGGER.debug("Externalid not found for user [{}] and service [{}]", principalId, context.getRegisteredService().getName());
            externalUserId = getOrInsertExternalIdForService(context.getPrincipal().getId(), internalServiceId, properties);
        }

        if (externalUserId != null) {
            principalId = externalUserId.substring(externalUserId.lastIndexOf(splitCharacter) + 1);
        } else {
            LOGGER.debug("No externalUserId found for service [{}] and user [{}]", context.getRegisteredService().getName(), principalId);
            throw new UnsatisfiedAuthenticationContextTicketValidationException(context.getService());
        }

        LOGGER.debug("Principal id to return for [{}] is [{}]. The default principal id is [{}].", context.getService().getId(),
            principalId, context.getPrincipal().getId());
        return principalId;
    }

    /**
     * Retrieve (and insert if necessary) an external id for a given service with an API call
     * @param internalUserid The internal user id used in the API
     * @param internalServiceId The internal service id used in the API
     * @param properties The cas configuration properties
     * @return The external id
     */
    private String getOrInsertExternalIdForService(final String internalUserid, final String internalServiceId,
                                                   final CasConfigurationProperties properties) {

        val externalIdBaseAPIUrl = properties.getCustom().getProperties().get("externalid.base-api-url");
        val externalIdAPIPath = properties.getCustom().getProperties().get("externalid.api-path");
        val apiUrl = externalIdBaseAPIUrl + externalIdAPIPath;

        try {
            // Construct the POST HTTP request
            final URI requestUri = new URIBuilder(apiUrl).addParameter("internalUserId", internalUserid)
                    .addParameter("serviceId", internalServiceId)
                    .build();
            final HttpRequest request = HttpRequest.newBuilder().uri(requestUri).POST(HttpRequest.BodyPublishers.noBody()).build();
            LOGGER.trace("Sending a request at url [{}] to generate a new externalid", requestUri);
            if (this.httpClient == null) {
                this.httpClient = HttpClient.newHttpClient();
            }
            final HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            LOGGER.trace("HTTP response to generateExternalId request [{}] ", response.body());

            // Parse and extract the JSON response
            ObjectMapper mapper = new ObjectMapper();
            JsonNode jsonResponse = mapper.readTree(response.body());
            final boolean isError = jsonResponse.path("error").asBoolean();
            if(!isError){
                final String generatedId = jsonResponse.path("generatedId").asText();
                LOGGER.trace("Found generatedId [{}] in response", generatedId);
                return generatedId;
            } else {
                LOGGER.error("An error has occurred trying to get the externalid for user [{}] and service [{}]. Returned response is [{}]",
                        internalUserid, internalServiceId, response.body());
            }

        } catch (Exception e) {
            LOGGER.error("An error has occurred trying to get the externalid for user [{}] and service [{}], exception message is [{}]",
                    internalUserid, internalServiceId, e.getMessage());
        }
        return null;
    }
}
