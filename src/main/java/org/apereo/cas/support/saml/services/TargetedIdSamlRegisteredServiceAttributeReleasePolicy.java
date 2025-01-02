package org.apereo.cas.support.saml.services;

import org.apache.commons.lang3.StringUtils;
import org.apereo.cas.configuration.CasConfigurationProperties;
import org.apereo.cas.services.RegisteredServiceAttributeReleasePolicyContext;
import org.apereo.cas.support.saml.services.idp.metadata.SamlRegisteredServiceMetadataAdaptor;
import org.apereo.cas.support.saml.services.idp.metadata.cache.SamlRegisteredServiceCachingMetadataResolver;
import org.apereo.cas.util.EncodingUtils;
import org.apereo.cas.util.function.FunctionUtils;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.extern.slf4j.Slf4j;
import lombok.val;
import org.opensaml.saml.saml2.metadata.EntityDescriptor;

import java.io.Serial;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * This is {@link TargetedIdSamlRegisteredServiceAttributeReleasePolicy}.
 *
 * @author Nathan Cailbourdin
 * @since 7.1.3
 */
@Slf4j
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class TargetedIdSamlRegisteredServiceAttributeReleasePolicy extends BaseSamlRegisteredServiceAttributeReleasePolicy {

    @Serial
    private static final long serialVersionUID = 2387874851513467956L;

    private String salt;
    private String attributeName;
    private String releaseName = "eduPersonTargetedID";
    private String separator = "!";
    private String algorithm = "SHA";

    @Override
    protected Map<String, List<Object>> getAttributesForSamlRegisteredService(
        final Map<String, List<Object>> attributes,
        final SamlRegisteredServiceCachingMetadataResolver resolver,
        final SamlRegisteredServiceMetadataAdaptor facade,
        final EntityDescriptor entityDescriptor,
        final RegisteredServiceAttributeReleasePolicyContext context) {

        val casProperties = context.getApplicationContext().getBean(CasConfigurationProperties.class);

        val attribute = attributes.get(attributeName).getFirst().toString();
        LOGGER.debug("Attribute is [{}] based on attribute name [{}]", attribute, attributeName);

        val sp = entityDescriptor.getEntityID();
        LOGGER.debug("SP entityId is [{}]", sp);

        val idp = casProperties.getAuthn().getSamlIdp().getCore().getEntityId();
        LOGGER.debug("IDP entityId is [{}]", idp);

        return FunctionUtils.doUnchecked(() -> {

            val md = MessageDigest.getInstance(algorithm);
            if (StringUtils.isNotBlank(sp)) {
                md.update(sp.getBytes(StandardCharsets.UTF_8));
                md.update(separator.getBytes());
            }
            md.update(attribute.getBytes(StandardCharsets.UTF_8));
            md.update(separator.getBytes());

            val digestedMessage = md.digest(salt.getBytes(StandardCharsets.UTF_8));
            val encodedMessage = EncodingUtils.encodeBase32(digestedMessage, false);
            LOGGER.trace("Encoded digested message to base32 : [{}]", encodedMessage);
            val finalValue = idp + separator + sp + separator + encodedMessage;
            LOGGER.debug("Final value for pairwise-id is [{}]", finalValue);

            Map<String, List<Object>> toRelease = new HashMap<>(1);
            toRelease.put(releaseName, Collections.singletonList(finalValue));
            return toRelease;
        });

    }
}
