package org.apereo.cas.authentication.principal.ldap;

import org.apereo.cas.authentication.principal.BaseDelegatedClientAuthenticationCredentialResolver;
import org.apereo.cas.authentication.principal.ClientCredential;
import org.apereo.cas.authentication.principal.DelegatedAuthenticationCandidateProfile;
import org.apereo.cas.configuration.model.support.pac4j.Pac4jDelegatedAuthenticationLdapProfileSelectionProperties;
import org.apereo.cas.util.LdapConnectionFactory;
import org.apereo.cas.util.LdapUtils;
import org.apereo.cas.web.flow.DelegatedClientAuthenticationConfigurationContext;
import lombok.extern.slf4j.Slf4j;
import lombok.val;
import org.apache.commons.lang3.ArrayUtils;
import org.jooq.lambda.Unchecked;
import org.ldaptive.LdapAttribute;
import org.pac4j.core.profile.UserProfile;
import org.springframework.webflow.execution.RequestContext;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * This is {@link LdapDelegatedClientAuthenticationCredentialResolver}.
 *
 * @author Misagh Moayyed
 * @since 7.0.0
 */
@Slf4j
public class LdapDelegatedClientAuthenticationCredentialResolver extends BaseDelegatedClientAuthenticationCredentialResolver {
    public LdapDelegatedClientAuthenticationCredentialResolver(final DelegatedClientAuthenticationConfigurationContext configContext) {
        super(configContext);
    }

    @Override
    public List<DelegatedAuthenticationCandidateProfile> resolve(final RequestContext context, final ClientCredential credentials) throws Throwable {
        val profile = resolveUserProfile(context, credentials).orElseThrow();
        val ldapServers = configContext.getCasProperties().getAuthn().getPac4j().getProfileSelection().getLdap();
        return ldapServers
            .stream()
            .map(Unchecked.function(props -> queryLdap(props, profile)))
            .flatMap(List::stream)
            .collect(Collectors.toList());
    }

    protected List<DelegatedAuthenticationCandidateProfile> queryLdap(final Pac4jDelegatedAuthenticationLdapProfileSelectionProperties ldap,
                                                                      final UserProfile profile) throws Exception {

        val connectionFactory = LdapUtils.newLdaptiveConnectionFactory(ldap);
        LOGGER.debug("Configured LDAP delegated authentication profile selection via [{}]", ldap.getLdapUrl());
        try (val factory = new LdapConnectionFactory(connectionFactory)) {
            // Customization : pass all attributes info to ldap filter and not only principal id
            List<String> paramNames = new ArrayList<>();
            List<String> values = new ArrayList<>();
            for(String key : profile.getAttributes().keySet()){
                if(profile.getAttributes().get(key) instanceof List){
                    List<Object> key_values = (List<Object>) profile.getAttributes().get(key);
                    for(int i=0; i<key_values.size(); i++){
                        paramNames.add(key);
                        values.add(key_values.get(i).toString());
                    }
                } else {
                    paramNames.add(key);
                    values.add(profile.getAttributes().get(key).toString());
                }
            }
            val filter = LdapUtils.newLdaptiveSearchFilter(ldap.getSearchFilter(), paramNames, values);
            LOGGER.debug("Fetching user attributes [{}] for [{}] via [{}]", ldap.getAttributes(), profile, filter);
            val result = factory.executeSearchOperation(ldap.getBaseDn(), filter, 0,
                ldap.getAttributes().toArray(ArrayUtils.EMPTY_STRING_ARRAY));
            LOGGER.debug("Found entries: [{}]", result.getEntries().size());
            return result
                .getEntries()
                .stream()
                .map(entry -> {
                    LOGGER.trace("Found entry [{}]", entry);
                    var attributes = new HashMap<>(profile.getAttributes());
                    for (val attr : entry.getAttributes()) {
                        attributes.put(attr.getName(), attr.getStringValues());
                    }
                    val name = Optional.ofNullable(entry.getAttribute(ldap.getProfileIdAttribute()))
                        .map(LdapAttribute::getStringValue)
                        .orElseGet(profile::getId);
                    LOGGER.debug("Adding attributes [{}] to the selected profile: [{}]", attributes, name);
                    return DelegatedAuthenticationCandidateProfile.builder()
                        .attributes(attributes)
                        .id(name)
                        .key(UUID.randomUUID().toString())
                        .linkedId(profile.getId())
                        .build();
                })
                .collect(Collectors.toList());
        }
    }

}
