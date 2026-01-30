package org.apereo.cas.services;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.apache.hc.core5.net.URIBuilder;
import org.apereo.cas.configuration.CasConfigurationProperties;
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
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Custom ServiceAttributeReleasePolicy to add to principal and release an externalid for OIDC services.
 *
 * @author Nathan Cailbourdin
 * @since 7.1.3
 */
@Slf4j
@ToString(callSuper = true)
@Getter
@Setter
@EqualsAndHashCode(callSuper = true)
@AllArgsConstructor
@Accessors(chain = true)
@JsonInclude(JsonInclude.Include.NON_DEFAULT)
public class ReturnExternalIDOidcAttributeReleasePolicy extends AbstractRegisteredServiceAttributeReleasePolicy {

    @Serial
    private static final long serialVersionUID = -1688026656195261790L;

    @JsonProperty
    private String internalServiceId;

    private String externalIdAttributeName;
    private boolean notReleased = false;

    @JsonIgnore
    private transient HttpClient httpClient;

    public ReturnExternalIDOidcAttributeReleasePolicy(){
        super();
    }

    @Override
    public Map<String, List<Object>> getAttributesInternal(final RegisteredServiceAttributeReleasePolicyContext context,
                                                           final Map<String, List<Object>> resolvedAttributes) {

        val properties = context.getApplicationContext().getBean(CasConfigurationProperties.class);
        val externalIdAttributeNameLDAP = properties.getCustom().getProperties().get("externalid.attribute-name-ldap");
        val splitCharacter = properties.getCustom().getProperties().get("externalid.split-character");
        val principalId = context.getPrincipal().getId();
        
        // Special modification for OIDC : if principal is serviceid and not user, do not try to get the externalid
        if(resolvedAttributes.isEmpty()){
            return new HashMap<String, List<Object>>();
        }

        // Override global setting for externalIdAttributeNameResponse if defined for this specific service
        String externalIdAttributeNameResponse = properties.getCustom().getProperties().get("externalid.attribute-name-response");
        if(externalIdAttributeName != null){
            externalIdAttributeNameResponse = externalIdAttributeName;
        }

        // We don't want to make another call to the externalId API if we already have generated one externalId
        // The trick here is to add the attribute to the principal so we know when it is already ready to be released
        // Because each time this policy is called resolvedAttributes is reset to the principal attributes
        if(!resolvedAttributes.containsKey(externalIdAttributeNameResponse)) {

            // Get the externalId for this service and this user
            LOGGER.debug("Trying to retrieve externalid for user [{}] and service [{}]", principalId, context.getRegisteredService().getName());
            String externalUserId = null;
            List<Object> externalIds = resolvedAttributes.get(externalIdAttributeNameLDAP);
            if(externalIds != null){
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
                externalUserId = getOrInsertExternalIdForService(context.getPrincipal().getId(), this.internalServiceId, properties);
            }

            if (externalUserId != null) {
                externalUserId = externalUserId.substring(externalUserId.lastIndexOf(splitCharacter) + 1);
                resolvedAttributes.put(externalIdAttributeNameResponse, Collections.singletonList(externalUserId));
                context.getPrincipal().getAttributes().put(externalIdAttributeNameResponse, Collections.singletonList(externalUserId));
                LOGGER.debug("Added externalid [{}] to principal and released attributes for user [{}] and service [{}]",
                        externalUserId, principalId, context.getRegisteredService().getName());
            } else {
                LOGGER.error("No externalUserId found for service [{}] and user [{}]", context.getRegisteredService().getName(), principalId);
            }
        }

        // At the end before returning we keep only externalid if it is allowed to be released
        Map<String, List<Object>> resolvedAllowedAttributes = new HashMap<>();
        if(!notReleased){
            LOGGER.debug("Adding attribute [{}] to the response because it is allowed to be released", externalIdAttributeNameResponse);
            resolvedAllowedAttributes.put(externalIdAttributeNameResponse, resolvedAttributes.get(externalIdAttributeNameResponse));
        }
        return resolvedAllowedAttributes;
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