package org.apereo.cas.web.flow.actions.logout;

import org.apereo.cas.authentication.principal.ClientCredential;
import org.apereo.cas.authentication.principal.ClientCustomPropertyConstants;
import org.apereo.cas.authentication.principal.Service;
import org.apereo.cas.pac4j.client.DelegatedIdentityProviders;
import org.apereo.cas.support.pac4j.authentication.DelegatedAuthenticationClientLogoutRequest;
import org.apereo.cas.ticket.TicketGrantingTicket;
import org.apereo.cas.ticket.registry.TicketRegistry;
import org.apereo.cas.web.flow.DelegationWebflowUtils;
import org.apereo.cas.web.flow.actions.BaseCasWebflowAction;
import org.apereo.cas.web.support.WebUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import lombok.val;
import org.pac4j.core.client.BaseClient;
import org.pac4j.core.client.Client;
import org.pac4j.core.context.CallContext;
import org.pac4j.core.context.session.SessionStore;
import org.pac4j.core.exception.http.RedirectionAction;
import org.pac4j.core.exception.http.WithLocationAction;
import org.pac4j.core.profile.ProfileManager;
import org.pac4j.core.profile.UserProfile;
import org.pac4j.jee.context.JEEContext;
import org.pac4j.jee.http.adapter.JEEHttpActionAdapter;
import org.springframework.webflow.execution.Event;
import org.springframework.webflow.execution.RequestContext;
import java.util.Optional;

/**
 * This is {@link DelegatedAuthenticationClientLogoutAction}.
 * <p>
 * The action takes into account the currently used PAC4J client which is stored
 * in the user profile. If the client is found, its logout action is executed.
 * <p>
 * Assumption: The PAC4J user profile should be in the user session during
 * logout, accessible with PAC4J Profile Manager. The Logout web flow should
 * make sure the user profile is present.
 *
 * @author Misagh Moayyed
 * @since 5.1.0
 */
@Slf4j
@RequiredArgsConstructor
public class DelegatedAuthenticationClientLogoutAction extends BaseCasWebflowAction {
    protected final DelegatedIdentityProviders identityProviders;

    protected final SessionStore sessionStore;

    protected final TicketRegistry ticketRegistry;

    @Override
    protected Event doPreExecute(final RequestContext requestContext) {
        val request = WebUtils.getHttpServletRequestFromExternalWebflowContext(requestContext);
        val response = WebUtils.getHttpServletResponseFromExternalWebflowContext(requestContext);
        val context = new JEEContext(request, response);

        val currentProfile = findCurrentProfile(context);
        val clientResult = findCurrentClient(currentProfile);
        if (clientResult.isPresent()) {
            val client = clientResult.get();
            LOGGER.debug("Handling logout for delegated authentication client [{}]", client);
            DelegationWebflowUtils.putDelegatedAuthenticationClientName(requestContext, client.getName());
        }
        return null;
    }

    @Override
    protected Event doExecuteInternal(final RequestContext requestContext) {

        val request = WebUtils.getHttpServletRequestFromExternalWebflowContext(requestContext);
        val response = WebUtils.getHttpServletResponseFromExternalWebflowContext(requestContext);
        val context = new JEEContext(request, response);

        val currentProfile = findCurrentProfile(context);
        Optional<Client> clientResult = findCurrentClient(currentProfile);

        // Customisation : fallback to TGT to retrieve client if TST is unable to retrieve client
        if(clientResult.isEmpty() && requestContext.getRequestScope().contains(WebUtils.PARAMETER_TICKET_GRANTING_TICKET_ID)){
            LOGGER.debug("Could not retrieve the current client by TST. Trying by TGT...");
            val ticket = (TicketGrantingTicket) ticketRegistry.getTicket((String) requestContext.getRequestScope().get(WebUtils.PARAMETER_TICKET_GRANTING_TICKET_ID));
            if(ticket.getAuthentication().getAttributes().containsKey(ClientCredential.AUTHENTICATION_ATTRIBUTE_CLIENT_NAME)){
                val clientName = (String) ticket.getAuthentication().getAttributes().get(ClientCredential.AUTHENTICATION_ATTRIBUTE_CLIENT_NAME).getFirst();
                clientResult = identityProviders.findClient(clientName);
                LOGGER.debug("Current [{}] client found by TGT", clientName);
            } else {
                LOGGER.debug("No clientName in TGT : this is not a delegation scenario for logout");
            }
        }
        
        // Customisation : do not logout but put a link to a custom url by external idp in html
        if(clientResult.isPresent()){
            if(clientResult.get() instanceof BaseClient){
                if(((BaseClient) clientResult.get()).getCustomProperties().containsKey(ClientCustomPropertyConstants.CLIENT_CUSTOM_PROPERTY_DISPLAY_NAME)){
                    LOGGER.debug("Logout is disabled for external idp : using custom link in html view");
                    requestContext.getFlashScope().put("logoutLink", ((BaseClient) clientResult.get()).getCustomProperties().get(ClientCustomPropertyConstants.CLIENT_CUSTOM_PROPERTY_DISPLAY_NAME));
                    requestContext.getFlashScope().put("logoutName", "screen.logout.display.button."+clientResult.get().getName());
                    requestContext.getFlowScope().put("delegatedAuthenticationClientName", clientResult.get().getName());
                    return null;
                } else {
                    LOGGER.debug("No displayName is defined for external idp : using native method to handle logout");
                }
            }
        }

        if (clientResult.isPresent()) {
            val client = clientResult.get();
            LOGGER.trace("Located client [{}]", client);
            val service = WebUtils.getService(requestContext);
            val targetUrl = Optional.ofNullable(service).map(Service::getId).orElse(null);
            LOGGER.debug("Logout target url based on service [{}] is [{}]", service, targetUrl);

            val callContext = new CallContext(context, sessionStore);
            val actionResult = client.getLogoutAction(callContext, currentProfile, targetUrl);
            actionResult.ifPresent(action -> {
                captureDelegatedAuthenticationLogoutRequest(requestContext, action, targetUrl);
                LOGGER.debug("Adapting logout action [{}] for client [{}]", action, client);
                JEEHttpActionAdapter.INSTANCE.adapt(action, context);
            });
        } else {
            LOGGER.debug("The current client cannot be found; No logout action can execute");
        }

        return null;
    }

    protected DelegatedAuthenticationClientLogoutRequest captureDelegatedAuthenticationLogoutRequest(
        final RequestContext requestContext, final RedirectionAction action, final String targetUrl) {
        val logoutActionBuilder = DelegatedAuthenticationClientLogoutRequest.builder()
            .status(action.getCode())
            .message(action.getMessage())
            .target(targetUrl);
        if (action instanceof final WithLocationAction location) {
            logoutActionBuilder.location(location.getLocation());
        }
        val logoutAction = logoutActionBuilder.build();
        DelegationWebflowUtils.putDelegatedAuthenticationLogoutRequest(requestContext, logoutAction);
        return logoutAction;
    }

    protected UserProfile findCurrentProfile(final JEEContext webContext) {
        val pm = new ProfileManager(webContext, this.sessionStore);
        val profile = pm.getProfile();
        return profile.orElse(null);
    }

    protected Optional<Client> findCurrentClient(final UserProfile currentProfile) {
        return currentProfile == null
            ? Optional.empty()
            : identityProviders.findClient(currentProfile.getClientName());
    }
}
