package org.apereo.cas.trusted.web.flow;

import org.apereo.cas.audit.AuditableExecution;
import org.apereo.cas.authentication.Authentication;
import org.apereo.cas.configuration.model.support.mfa.trusteddevice.TrustedDevicesMultifactorProperties;
import org.apereo.cas.trusted.authentication.MultifactorAuthenticationTrustedDeviceBypassEvaluator;
import org.apereo.cas.trusted.authentication.api.MultifactorAuthenticationTrustRecord;
import org.apereo.cas.trusted.authentication.api.MultifactorAuthenticationTrustStorage;
import org.apereo.cas.trusted.util.MultifactorAuthenticationTrustUtils;
import org.apereo.cas.trusted.web.flow.fingerprint.DeviceFingerprintStrategy;
import org.apereo.cas.web.flow.CasWebflowConstants;
import org.apereo.cas.web.flow.actions.BaseCasWebflowAction;
import org.apereo.cas.web.support.CookieUtils;
import org.apereo.cas.web.support.WebUtils;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import lombok.val;
import org.apache.commons.lang3.StringUtils;
import org.springframework.webflow.execution.Event;
import org.springframework.webflow.execution.RequestContext;
import java.time.temporal.ChronoUnit;

/**
 * This is {@link MultifactorAuthenticationSetTrustAction}.
 *
 * @author Misagh Moayyed
 * @since 5.0.0
 */
@Slf4j
@RequiredArgsConstructor
@Getter
public class MultifactorAuthenticationSetTrustAction extends BaseCasWebflowAction {

    private final MultifactorAuthenticationTrustStorage storageService;

    private final DeviceFingerprintStrategy deviceFingerprintStrategy;

    private final TrustedDevicesMultifactorProperties trustedProperties;

    private final AuditableExecution registeredServiceAccessStrategyEnforcer;

    private final MultifactorAuthenticationTrustedDeviceBypassEvaluator bypassEvaluator;

    @Override
    protected Event doExecuteInternal(final RequestContext requestContext) throws Throwable {
        val authentication = WebUtils.getAuthentication(requestContext);
        if (authentication == null) {
            LOGGER.error("Could not determine authentication from the request context");
            return error();
        }

        val registeredService = WebUtils.getRegisteredService(requestContext);
        val service = WebUtils.getService(requestContext);

        if (bypassEvaluator.shouldBypassTrustedDevice(registeredService, service, authentication)) {
            LOGGER.debug("Trusted device registration is disabled for [{}]", registeredService);
            return success();
        }

        val deviceBean = MultifactorAuthenticationTrustUtils.getMultifactorAuthenticationTrustRecord(requestContext, MultifactorAuthenticationTrustBean.class);
        if (deviceBean.isEmpty()) {
            LOGGER.debug("No device information is provided. Trusted authentication record is not stored and tracked");
            return success();
        }
        val deviceRecord = deviceBean.get();
        if (StringUtils.isBlank(deviceRecord.getDeviceName())) {
            LOGGER.debug("No device name is provided. Trusted authentication record is not stored and tracked");
            return success();
        }

        if (!MultifactorAuthenticationTrustUtils.isMultifactorAuthenticationTrustedInScope(requestContext)) {
            val stored = storeTrustedAuthenticationRecord(requestContext, authentication, deviceRecord);
            trackTrustedMultifactorAuthentication(requestContext, authentication);
            return success(stored);
        }
        trackTrustedMultifactorAuthentication(requestContext, authentication);
        return success();
    }

    protected void trackTrustedMultifactorAuthentication(final RequestContext requestContext, final Authentication authn) {
        LOGGER.debug("Trusted authentication session exists for [{}]", authn.getPrincipal().getId());
        MultifactorAuthenticationTrustUtils.trackTrustedMultifactorAuthenticationAttribute(
            authn, trustedProperties.getCore().getAuthenticationContextAttribute());
        WebUtils.putAuthentication(authn, requestContext);
    }

    protected MultifactorAuthenticationTrustRecord storeTrustedAuthenticationRecord(
        final RequestContext requestContext,
        final Authentication authentication,
        final MultifactorAuthenticationTrustBean deviceRecord) {
        if (storageService.isAvailable()) {
            val principal = authentication.getPrincipal().getId();
            LOGGER.debug("Attempting to store trusted authentication record for [{}] as device [{}]", principal, deviceRecord.getDeviceName());
            val request = WebUtils.getHttpServletRequestFromExternalWebflowContext(requestContext);
            val response = WebUtils.getHttpServletResponseFromExternalWebflowContext(requestContext);
            val fingerprint = deviceFingerprintStrategy.determineFingerprint(authentication, request, response);
            val record = MultifactorAuthenticationTrustRecord.newInstance(principal,
                MultifactorAuthenticationTrustUtils.generateGeography(), fingerprint);
            record.setName(deviceRecord.getDeviceName());
            record.setMultifactorAuthenticationProvider(requestContext.getFlowScope().get(CasWebflowConstants.VAR_ID_MFA_PROVIDER_ID, String.class));
            // Customization : auto assign device time to cookie max age if defined
            val cookieMaxAge = CookieUtils.getCookieMaxAge(trustedProperties.getDeviceFingerprint().getCookie().getMaxAge());
            if (cookieMaxAge != -1){
                record.expireIn(cookieMaxAge, ChronoUnit.SECONDS);
            } else {
                if (deviceRecord.getTimeUnit() != ChronoUnit.FOREVER && deviceRecord.getExpiration() > 0) {
                    record.expireIn(deviceRecord.getExpiration(), deviceRecord.getTimeUnit());
                } else {
                    record.neverExpire();
                }
            }

            LOGGER.debug("Trusted authentication record will expire at [{}]", record.getExpirationDate());
            val stored = storageService.save(record);
            LOGGER.debug("Saved trusted authentication record for [{}] under [{}]", principal, stored.getName());
            return stored;
        }
        return null;
    }
}
