package org.apereo.cas.web.flow.actions;

import module java.base;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.apereo.cas.authentication.principal.DelegatedAuthenticationCandidateProfile;
import org.apereo.cas.web.flow.CasWebflowConstants;
import org.apereo.cas.web.flow.DelegatedClientAuthenticationConfigurationContext;
import org.apereo.cas.web.flow.DelegationWebflowUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import lombok.val;
import org.jspecify.annotations.Nullable;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.webflow.core.collection.LocalAttributeMap;
import org.springframework.webflow.execution.Event;
import org.springframework.webflow.execution.RequestContext;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

/**
 * This is {@link DelegatedClientAuthenticationCredentialSelectionAction}.
 *
 * @author Misagh Moayyed
 * @since 6.6.0
 */
@Slf4j
@EnableScheduling
@RequiredArgsConstructor
public class DelegatedClientAuthenticationCredentialSelectionAction extends BaseCasWebflowAction {

    protected final DelegatedClientAuthenticationConfigurationContext configContext;
    /**
     * HTTPClient to make requests to structs info api
     */
    private final HttpClient httpClient;
    /**
     * Map used to cache the displayNames corresponding to a certain siren
     * It looks like {siren1: name1, siren2: name2, ...}
     */
    private Map<String, String> nameBySirenCache;

    public DelegatedClientAuthenticationCredentialSelectionAction(DelegatedClientAuthenticationConfigurationContext configContext){
        super();
        this.configContext = configContext;
        this.httpClient = HttpClient.newHttpClient();
        this.nameBySirenCache = new HashMap<>();
    }

    @Override
    protected @Nullable Event doExecuteInternal(final RequestContext requestContext) throws Exception {
        val profiles = DelegationWebflowUtils.getDelegatedClientAuthenticationResolvedCredentials(requestContext,
            DelegatedAuthenticationCandidateProfile.class);
        if (profiles.size() == 1) {
            val profile = profiles.getFirst();
            DelegationWebflowUtils.putDelegatedClientAuthenticationCandidateProfile(requestContext, profile);
            return new Event(this, CasWebflowConstants.TRANSITION_ID_FINALIZE,
                new LocalAttributeMap<>("profile", profile));
        }

        val structInfoAttributeIdentifierName = configContext.getCasProperties().getCustom().getProperties().get("profile-selection.structinfo-attribute-identifier-name");
        val structInfoURL = configContext.getCasProperties().getCustom().getProperties().get("profile-selection.structinfo-url");
        val structInfoAttributeToDisplay = configContext.getCasProperties().getCustom().getProperties().get("profile-selection.structinfo-attribute-to-display");
        val structInfoWebflowAttributeName = configContext.getCasProperties().getCustom().getProperties().get("profile-selection.structinfo-webflow-attribute-name");

        // Custom modification : add etab displayName based on current siren
        for(DelegatedAuthenticationCandidateProfile delegatedAuthenticationCandidateProfile: profiles){
            final String siren = ((List<String>) delegatedAuthenticationCandidateProfile.getAttributes().get(structInfoAttributeIdentifierName)).getFirst();

            // Check if name is in cache
            if(this.nameBySirenCache.containsKey(siren)){
                final String displayName = this.nameBySirenCache.get(siren);
                LOGGER.debug("Name [{}] found in cache for siren [{}]", displayName, siren);
                delegatedAuthenticationCandidateProfile.getAttributes().put(structInfoWebflowAttributeName, displayName);
            }
            else {
                // Otherwise we need to get it from the API
                final String apiUrl = structInfoURL + "?ids=" + siren;
                LOGGER.debug("Name not found in cache for siren [{}], URL to call is : [{}]", siren, apiUrl);
                try {
                    // Construct the HTTP request
                    HttpRequest request = HttpRequest.newBuilder().uri(URI.create(apiUrl)).build();
                    HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
                    LOGGER.trace("HTTP response to structs info request [{}] ", response.body());

                    // Parse the JSON response
                    ObjectMapper mapper = new ObjectMapper();
                    JsonNode jsonResponse = mapper.readTree(response.body());

                    // Extract the name from the JSON response
                    String displayName = jsonResponse.path(siren).path(structInfoAttributeToDisplay).asText();
                    LOGGER.debug("Name extracted from json is [{}] for [{}]: putting it in the webflow and in cache", displayName, siren);

                    // Prepare to put result in webflow for profile selection view
                    delegatedAuthenticationCandidateProfile.getAttributes().put(structInfoWebflowAttributeName, displayName);
                    this.nameBySirenCache.put(siren, displayName);
                } catch (Exception e) {
                    LOGGER.error("An error has occurred trying to retrieve the structure name for [{}] siren, exception message is [{}]",
                            siren, e.getMessage());
                }
            }
        }
        DelegationWebflowUtils.putDelegatedClientAuthenticationResolvedCredentials(requestContext, profiles);
        return new Event(this, CasWebflowConstants.TRANSITION_ID_SELECT);
    }

    /**
     * Reload the cache at specific interval by resetting the map containing the domains associated with the sirens
     */
    @Scheduled(fixedDelayString = "${cas.custom.properties.profile-selection.structinfo.refresh-cache-interval:PT24H}")
    public void resetNameBySirenCache(){
        this.nameBySirenCache.clear();
    }
}
