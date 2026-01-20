package org.apereo.cas.oidc.slo;

import module java.base;
import org.apereo.cas.logout.slo.SingleLogoutMessage;
import org.apereo.cas.logout.slo.SingleLogoutMessageCreator;
import org.apereo.cas.logout.slo.SingleLogoutRequestContext;
import org.apereo.cas.oidc.OidcConfigurationContext;
import org.apereo.cas.oidc.OidcConstants;
import org.apereo.cas.services.OidcRegisteredService;
import org.apereo.cas.services.RegisteredServiceLogoutType;
import org.apereo.cas.services.RegisteredServiceUsernameProviderContext;
import org.apereo.cas.support.oauth.services.OAuthRegisteredService;
import org.apereo.cas.util.DigestUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import lombok.val;
import org.apache.commons.lang3.StringUtils;
import org.jose4j.jwt.JwtClaims;
import org.jspecify.annotations.NonNull;
import org.springframework.beans.factory.ObjectProvider;

/**
 * The message creator for the OIDC protocol.
 *
 * @author Jerome LELEU
 * @since 6.2.0
 */
@Slf4j
@RequiredArgsConstructor
public class OidcSingleLogoutMessageCreator implements SingleLogoutMessageCreator {

    protected final ObjectProvider<@NonNull OidcConfigurationContext> configurationProvider;

    @Override
    public SingleLogoutMessage create(final SingleLogoutRequestContext request) throws Throwable {
        val configurationContext = configurationProvider.getObject();

        val builder = SingleLogoutMessage.builder();
        LOGGER.trace("Building logout token for [{}]", request.getRegisteredService());
        val claims = buildJwtClaims(request);
        val logoutToken = configurationContext.getIdTokenSigningAndEncryptionService()
            .encode((OAuthRegisteredService) request.getRegisteredService(), claims);
        return builder.payload(logoutToken).build();
    }

    protected JwtClaims buildJwtClaims(final SingleLogoutRequestContext request) throws Throwable {
        val executionRequest = request.getExecutionRequest();
        val configurationContext = configurationProvider.getObject();
        val claims = new JwtClaims();
        // Customization : change subject based on usernameAttributeProvider defined for service
        // See this commit (https://github.com/apereo/cas/commit/7e370f704117992b24b742673bbb38d259ea2283#diff-3e92af2e4f122dbd3710153d6da76455567f35b1e7b76bf7789711ea3558efa0)
        val service = (OAuthRegisteredService) request.getRegisteredService();
        val usernameContext = RegisteredServiceUsernameProviderContext
                .builder()
                .registeredService(service)
                .service(request.getService())
                .principal(request.getExecutionRequest().getTicketGrantingTicket().getAuthentication().getPrincipal())
                .applicationContext(configurationContext.getApplicationContext())
                .build();
        val subject = request.getRegisteredService().getUsernameAttributeProvider().resolveUsername(usernameContext);
        claims.setSubject(subject);
        val sid = DigestUtils.sha(DigestUtils.sha512(executionRequest.getTicketGrantingTicket().getId()));
        claims.setClaim(OidcConstants.CLAIM_SESSION_ID, sid);
        claims.setIssuer(determineIssuer(request));
        claims.setAudience(((OAuthRegisteredService) request.getRegisteredService()).getClientId());
        claims.setIssuedAtToNow();
        claims.setJwtId(UUID.randomUUID().toString());
        claims.setExpirationTimeMinutesInTheFuture(1);
        val events = new HashMap<String, Object>();
        events.put("http://schemas.openid.net/event/backchannel-logout", new HashMap<>());
        claims.setClaim("events", events);
        return claims;
    }

    protected String determineIssuer(final SingleLogoutRequestContext sloRequest) {
        val configurationContext = configurationProvider.getObject();
        if (sloRequest.getRegisteredService() instanceof OidcRegisteredService oidcRegisteredService) {
            return configurationContext.getIssuerService().determineIssuer(Optional.of(oidcRegisteredService));
        }
        return configurationContext.getIssuerService().determineIssuer(Optional.empty());
    }
}
