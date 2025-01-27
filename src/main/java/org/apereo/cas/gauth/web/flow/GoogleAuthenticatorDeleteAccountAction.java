package org.apereo.cas.gauth.web.flow;

import lombok.extern.slf4j.Slf4j;
import org.apereo.cas.authentication.Authentication;
import org.apereo.cas.authentication.principal.Principal;
import org.apereo.cas.otp.repository.credentials.OneTimeTokenCredentialRepository;
import org.apereo.cas.otp.web.flow.OneTimeTokenAccountConfirmSelectionRegistrationAction;
import org.apereo.cas.web.flow.actions.BaseCasWebflowAction;

import lombok.RequiredArgsConstructor;
import lombok.val;
import org.apereo.cas.web.support.WebUtils;
import org.springframework.boot.logging.LoggerGroup;
import org.springframework.webflow.execution.Event;
import org.springframework.webflow.execution.RequestContext;

/**
 * This is {@link GoogleAuthenticatorDeleteAccountAction}.
 *
 * @author Misagh Moayyed
 * @since 6.4.0
 */
@RequiredArgsConstructor
@Slf4j
public class GoogleAuthenticatorDeleteAccountAction extends BaseCasWebflowAction {
    private final OneTimeTokenCredentialRepository repository;

    @Override
    protected Event doExecuteInternal(final RequestContext requestContext) {
        val accoundId = requestContext.getRequestParameters().getRequired("key", Long.class);
        val principalId = WebUtils.getAuthentication(requestContext).getPrincipal().getId();
        LOGGER.debug("Deleting account {} for principal {}", accoundId, principalId);
        repository.delete(accoundId, principalId);
        return success();
    }
}