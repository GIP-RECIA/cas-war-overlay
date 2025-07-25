package org.apereo.cas.persondir;

import lombok.extern.slf4j.Slf4j;
import org.apereo.cas.authentication.attribute.AttributeRepositoryResolver;
import org.apereo.cas.authentication.principal.ClientCredential;
import org.apereo.cas.authentication.principal.RegisteredServicePrincipalAttributesRepository;
import org.apereo.cas.authentication.principal.attribute.PersonAttributeDao;
import org.apereo.cas.configuration.CasConfigurationProperties;
import org.apereo.cas.services.RegisteredService;
import org.apereo.cas.services.RegisteredServiceAttributeReleasePolicy;
import org.apereo.cas.services.ServicesManager;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.val;
import org.springframework.util.StringUtils;
import java.util.HashSet;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;

/**
 * This is {@link DefaultAttributeRepositoryResolver}.
 *
 * @author Misagh Moayyed
 * @since 7.0.0
 */
@Slf4j
@RequiredArgsConstructor
@Getter
public class DefaultAttributeRepositoryResolver implements AttributeRepositoryResolver {
    private final ServicesManager servicesManager;
    private final CasConfigurationProperties casProperties;

    @Override
    public Set<String> resolve(final AttributeRepositoryQuery query) {
        val repositoryIds = new HashSet<String>();

        // Customization : select attribute repository based on delegated clientName
        if(query.getAuthenticationHandler() != null){
            if(query.getAuthenticationHandler().getName().equals("DelegatedClientAuthenticationHandler")){
                if(!query.getPrincipal().getAttributes().get(ClientCredential.AUTHENTICATION_ATTRIBUTE_CLIENT_NAME).getFirst().toString().contains(casProperties.getCustom().getProperties().get("profile-selection.client-name"))){
                    repositoryIds.add(query.getPrincipal().getAttributes().get(ClientCredential.AUTHENTICATION_ATTRIBUTE_CLIENT_NAME).getFirst().toString());
                    return repositoryIds;
                } else {
                    return repositoryIds;
                }
            // Local auth case : do not select any attribute repo
            } else {
                return repositoryIds;
            }
        }

        // This is not needed anymore, but kept for update purposes
        determineRegisteredService(query)
            .map(RegisteredService::getAttributeReleasePolicy)
            .map(RegisteredServiceAttributeReleasePolicy::getPrincipalAttributesRepository)
            .map(RegisteredServicePrincipalAttributesRepository::getAttributeRepositoryIds)
            .filter(identifiers -> !identifiers.isEmpty())
            .ifPresentOrElse(repositoryIds::addAll,
                () -> {
                    val selectionMap = casProperties.getPersonDirectory().getAttributeRepositorySelection();
                    if (Objects.nonNull(query.getAuthenticationHandler()) && selectionMap.containsKey(query.getAuthenticationHandler().getName())) {
                        val assignedRepositories = StringUtils.commaDelimitedListToSet(selectionMap.get(query.getAuthenticationHandler().getName()));
                        repositoryIds.addAll(assignedRepositories);
                    } else if (Objects.nonNull(query.getActiveRepositoryIds())) {
                        repositoryIds.addAll(query.getActiveRepositoryIds());
                    }
                });

        if (repositoryIds.isEmpty()) {
            repositoryIds.add(PersonAttributeDao.WILDCARD);
        }
        return repositoryIds;
    }

    protected Optional<RegisteredService> determineRegisteredService(final AttributeRepositoryQuery query) {
        val result = Optional.ofNullable(query.getService()).map(servicesManager::findServiceBy).orElseGet(query::getRegisteredService);
        return Optional.ofNullable(result);
    }
}
