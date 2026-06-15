package org.apereo.cas.web.flow.actions;

import org.apereo.cas.pac4j.client.DelegatedClientAuthenticationFailureEvaluator;
import org.apereo.cas.web.support.WebUtils;

import lombok.RequiredArgsConstructor;
import lombok.val;
import lombok.extern.slf4j.Slf4j;
import org.springframework.webflow.execution.Event;
import org.springframework.webflow.execution.RequestContext;

import java.util.UUID;

/**
 * This is {@link DelegatedClientAuthenticationFailureAction}.
 *
 * @author Misagh Moayyed
 * @since 6.6.0
 */
@Slf4j
@RequiredArgsConstructor
public class DelegatedClientAuthenticationFailureAction extends BaseCasWebflowAction {
    private final DelegatedClientAuthenticationFailureEvaluator evaluator;

    @Override
    protected Event doExecuteInternal(final RequestContext requestContext) {
        val request = WebUtils.getHttpServletRequestFromExternalWebflowContext(requestContext);
        val response = WebUtils.getHttpServletResponseFromExternalWebflowContext(requestContext);
        var errorId = UUID.randomUUID().toString();
        LOGGER.error("Authentication flow failure Error Id : {}. See error above ", errorId);
        requestContext.getFlashScope().put("errorId", errorId);
        val mv = evaluator.evaluate(request, response.getStatus());
        mv.ifPresent(modelAndView -> modelAndView.getModel().forEach((k, v) -> requestContext.getFlowScope().put(k, v)));
        return null;
    }
}
