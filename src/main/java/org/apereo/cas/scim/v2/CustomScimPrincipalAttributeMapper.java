package org.apereo.cas.scim.v2;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import de.captaingoldfish.scim.sdk.common.resources.User;
import de.captaingoldfish.scim.sdk.common.resources.complex.Meta;
import de.captaingoldfish.scim.sdk.common.resources.complex.Name;
import de.captaingoldfish.scim.sdk.common.resources.multicomplex.Email;
import lombok.extern.slf4j.Slf4j;
import lombok.val;
import org.apache.commons.lang3.StringUtils;
import org.apereo.cas.authentication.Credential;
import org.apereo.cas.authentication.principal.Principal;
import org.apereo.cas.util.CollectionUtils;

/**
 * This is {@link CustomScimPrincipalAttributeMapper}.
 *
 * @author Misagh Moayyed
 * @since 5.1.0
 */
@Slf4j
public class CustomScimPrincipalAttributeMapper implements ScimV2PrincipalAttributeMapper {
    @Override
    public void map(final User user, final Principal principal, final Credential credential) {
        // Custom Schema
        user.addSchema("urn:ietf:params:scim:schemas:extension:idruide:education:2.0:User");
        // Username
        user.setUserName(getPrincipalAttributeValue(principal, "mail"));
        // Email
        val email = new Email();
        email.setPrimary(Boolean.TRUE);
        email.setValue(getPrincipalAttributeValue(principal, "mail"));
        user.setEmails(CollectionUtils.wrap(email));
        //GivenName et FamilyName
        val name = new Name();
        name.setGivenName(getPrincipalAttributeValue(principal, "givenName"));
        name.setFamilyName(getPrincipalAttributeValue(principal, "sn"));
        user.setName(name);
        // Meta
        if (user.getMeta().isEmpty()) {
            val meta = new Meta();
            meta.setResourceType("User");
            user.setMeta(meta);
        }
        // Active
        user.setActive(true);
        // urn:ietf:params:scim:schemas:extension:idruide:education:2.0:User
        ObjectMapper mapper = new ObjectMapper();
        ObjectNode rootNode = mapper.createObjectNode();
        if(getPrincipalAttributeValue(principal, "ENTPersonProfils").contains("National_ENS")){
            rootNode.put("educationUserType", "teacher");
        } else {
            rootNode.put("educationUserType", "student");
        }
        user.set("urn:ietf:params:scim:schemas:extension:idruide:education:2.0:User", rootNode);
    }

    /**
     * Gets principal attribute value.
     *
     * @param principal     the principal
     * @param attributeName the attribute name
     * @param defaultValue  the default value
     * @return the principal attribute value
     */
    protected String getPrincipalAttributeValue(final Principal principal,
                                                final String attributeName,
                                                final String defaultValue) {
        return StringUtils.defaultIfBlank(getPrincipalAttributeValue(principal, attributeName), defaultValue);
    }

    /**
     * Gets principal attribute value.
     *
     * @param principal     the principal
     * @param attributeName the attribute name
     * @return the principal attribute value
     */
    protected String getPrincipalAttributeValue(final Principal principal,
                                                final String attributeName) {
        val attributes = principal.getAttributes();
        if (attributes.containsKey(attributeName)) {
            return CollectionUtils.toCollection(attributes.get(attributeName)).iterator().next().toString();
        }
        return null;
    }
}
