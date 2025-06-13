package org.apereo.cas.web.flow;

import lombok.extern.slf4j.Slf4j;
import lombok.val;
import org.apereo.cas.authentication.principal.Service;
import org.apereo.cas.authentication.principal.WebApplicationService;
import org.apereo.cas.authentication.principal.provision.DelegatedAuthenticationFailureException;
import org.apereo.cas.util.function.FunctionUtils;
import org.apereo.cas.util.spring.beans.BeanSupplier;
import org.apereo.cas.web.DelegatedClientIdentityProviderConfiguration;
import org.apereo.cas.web.DelegatedClientIdentityProviderConfigurationFactory;
import org.apereo.cas.web.support.WebUtils;
import org.jooq.lambda.Unchecked;
import org.pac4j.core.client.Client;
import org.pac4j.core.client.IndirectClient;
import org.pac4j.core.context.WebContext;
import org.pac4j.jee.context.JEEContext;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.http.HttpStatus;
import org.springframework.webflow.execution.RequestContext;

import java.util.Arrays;
import java.util.Comparator;
import java.util.HashSet;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

/**
 * This is {@link DefaultDelegatedClientIdentityProviderConfigurationProducer}.
 *
 * @author Misagh Moayyed
 * @since 6.2.0
 */
@Slf4j
public class DefaultDelegatedClientIdentityProviderConfigurationProducer implements DelegatedClientIdentityProviderConfigurationProducer {
    private final ObjectProvider<DelegatedClientAuthenticationConfigurationContext> configurationContext;
    private Set<String> authorizedDomains;
    private final Pattern domainExtractorPattern;

    public DefaultDelegatedClientIdentityProviderConfigurationProducer(ObjectProvider<DelegatedClientAuthenticationConfigurationContext> configurationContext) {
        this.configurationContext = configurationContext;
        this.domainExtractorPattern = Pattern.compile("^(https?://[^/]+)");
        this.authorizedDomains = null;
    }

    @Override
    public Set<DelegatedClientIdentityProviderConfiguration> produce(final RequestContext context) throws Throwable {
        
        // Initialize list of domains only once for performance
        if(authorizedDomains == null){
            if(configurationContext.getObject().getCasProperties().getCustom().getProperties().get("delegation.cerbere.authorized-domains") == null){
                LOGGER.error("No authorized domains were provided in configuraiton for cerbere link generation");
                this.authorizedDomains = new HashSet<>();
            } else {
                authorizedDomains = Arrays.stream(configurationContext.getObject().getCasProperties().getCustom().getProperties().get("delegation.cerbere.authorized-domains")
                    .split(","))
                    .map(String::trim)
                    .collect(Collectors.toSet());
            }
        }

        val currentService = WebUtils.getService(context);

        val selectionStrategies = configurationContext.getObject().getAuthenticationRequestServiceSelectionStrategies();
        val service = selectionStrategies.resolveService(currentService, WebApplicationService.class);
        val request = WebUtils.getHttpServletRequestFromExternalWebflowContext(context);
        val response = WebUtils.getHttpServletResponseFromExternalWebflowContext(context);
        val webContext = new JEEContext(request, response);

        LOGGER.debug("Initialized context with request parameters [{}]", webContext.getRequestParameters());

        val allClients = findAllClients(service, webContext);
        val providers = allClients
            .stream()
            .filter(client -> client instanceof IndirectClient
                && isDelegatedClientAuthorizedForService(client, service, context))
            .map(IndirectClient.class::cast)
            .map(Unchecked.function(client -> produce(context, client)))
            .filter(Optional::isPresent)
            .map(Optional::get)
            .sorted(Comparator.comparing(DelegatedClientIdentityProviderConfiguration::getName))
            .collect(Collectors.toCollection(LinkedHashSet::new));

        val delegatedClientIdentityProviderRedirectionStrategy = configurationContext.getObject().getDelegatedClientIdentityProviderRedirectionStrategy();
        delegatedClientIdentityProviderRedirectionStrategy.select(context, service, providers)
            .ifPresent(p -> DelegationWebflowUtils.putDelegatedAuthenticationProviderPrimary(context, p));

        if (!providers.isEmpty()) {
            val casProperties = configurationContext.getObject().getCasProperties();
            val selectionType = casProperties.getAuthn().getPac4j().getCore().getDiscoverySelection().getSelectionType();
            switch (selectionType) {
                case DYNAMIC -> {
                    DelegationWebflowUtils.putDelegatedAuthenticationProviderConfigurations(context, new HashSet<>());
                    DelegationWebflowUtils.putDelegatedAuthenticationDynamicProviderSelection(context, Boolean.TRUE);
                }
                case MENU -> {
                    // Customization : do not put any provider if local auth is requested
                    // and put local_url in webflow in order to generate urls for other providers when necessary
                    val delegationIdpIdParameter = configurationContext.getObject().getCasProperties().getCustom().getProperties().get("delegation.idp-id.parameter");
                    val delegationIdpIdRemotePattern = configurationContext.getObject().getCasProperties().getCustom().getProperties().get("delegation.idp-id.remote-pattern");
                    val providerSelectionWebflowUrlParameter = configurationContext.getObject().getCasProperties().getCustom().getProperties().get("delegation.provider-selection.webflow-url.parameter");
                    val defaultDomain = configurationContext.getObject().getCasProperties().getCustom().getProperties().get("delegation.cerbere.default-domain");
                    if (request.getParameterMap().containsKey(delegationIdpIdParameter)) {
                        if (!request.getParameterMap().get(delegationIdpIdParameter)[0].contains(delegationIdpIdRemotePattern)) {
                            DelegationWebflowUtils.putDelegatedAuthenticationProviderConfigurations(context, null);
                            // Customization : put domain name in webflow in local auth context
                            if (service != null) {
                                val serviceDomain = extractDomainFromServiceURL(service.getOriginalUrl());
                                if (authorizedDomains.contains(serviceDomain)) {
                                    LOGGER.trace("Domain [{}] is in authorized domains [{}], creating cerbere link", serviceDomain, authorizedDomains);
                                    context.getRequestScope().put("domain_name", serviceDomain);
                                } else {
                                    LOGGER.trace("Domain [{}] is not in authorized domains [{}], creating cerbere link with default domain [{}]",
                                            serviceDomain, authorizedDomains, defaultDomain);
                                    context.getRequestScope().put("domain_name", defaultDomain);
                                }
                            }
                            // If there is no service, then use CAS domain as url
                            else {
                                LOGGER.trace("No domain is provided, creating cerbere link with default domain [{}]", defaultDomain);
                                context.getRequestScope().put("domain_name", defaultDomain);
                            }
                            DelegationWebflowUtils.putDelegatedAuthenticationProviderConfigurations(context, null);
                        } else {
                            DelegationWebflowUtils.putDelegatedAuthenticationProviderConfigurations(context, providers);
                            DelegationWebflowUtils.putDelegatedAuthenticationDynamicProviderSelection(context, Boolean.FALSE);
                        }
                    } else {
                        // TODO : better encoding and decoding of urls
                        if(webContext.getFullRequestURL().contains("?")){
                            context.getRequestScope().put(providerSelectionWebflowUrlParameter, webContext.getFullRequestURL());
                        } else {
                            context.getRequestScope().put(providerSelectionWebflowUrlParameter, webContext.getFullRequestURL()+"?");
                        }
                        DelegationWebflowUtils.putDelegatedAuthenticationProviderConfigurations(context, providers);
                        DelegationWebflowUtils.putDelegatedAuthenticationDynamicProviderSelection(context, Boolean.FALSE);
                    }
                }
            }

        } else if (response.getStatus() != HttpStatus.UNAUTHORIZED.value()) {
            LOGGER.warn("No delegated authentication providers could be determined based on the provided configuration. "
                + "Either no identity providers are configured, or the current access strategy rules prohibit CAS from using authentication providers");
        }
        return providers;
    }

    @Override
    public Optional<DelegatedClientIdentityProviderConfiguration> produce(final RequestContext requestContext,
                                                                          final IndirectClient client) {
        return FunctionUtils.doAndHandle(() -> {
            val request = WebUtils.getHttpServletRequestFromExternalWebflowContext(requestContext);
            val response = WebUtils.getHttpServletResponseFromExternalWebflowContext(requestContext);
            val webContext = new JEEContext(request, response);

            val currentService = WebUtils.getService(requestContext);
            LOGGER.debug("Initializing client [{}] with request parameters [{}] and service [{}]",
                client, requestContext.getRequestParameters(), currentService);
            initializeClientIdentityProvider(client);

            val customizers = configurationContext.getObject().getDelegatedClientAuthenticationRequestCustomizers();
            if (customizers.isEmpty() || customizers.stream()
                .filter(BeanSupplier::isNotProxy)
                .anyMatch(Unchecked.predicate(clientConfig -> clientConfig.isAuthorized(webContext, client, currentService)))) {
                return DelegatedClientIdentityProviderConfigurationFactory.builder()
                    .client(client)
                    .webContext(webContext)
                    .service(currentService)
                    .casProperties(configurationContext.getObject().getCasProperties())
                    .build()
                    .resolve();
            }
            return Optional.<DelegatedClientIdentityProviderConfiguration>empty();
        }, throwable -> Optional.<DelegatedClientIdentityProviderConfiguration>empty()).get();
    }

    protected void initializeClientIdentityProvider(final IndirectClient client) throws Throwable {
        if (!client.isInitialized()) {
            client.init(true);
        }
        FunctionUtils.throwIf(!client.isInitialized(), DelegatedAuthenticationFailureException::new);
    }

    protected boolean isDelegatedClientAuthorizedForService(final Client client,
                                                            final Service service,
                                                            final RequestContext context) {
        return configurationContext.getObject().getDelegatedClientIdentityProviderAuthorizers()
            .stream()
            .allMatch(Unchecked.predicate(authz -> authz.isDelegatedClientAuthorizedForService(client, service, context)));
    }

    protected List<Client> findAllClients(final WebApplicationService service, final WebContext webContext) {
        val clients = configurationContext.getObject().getIdentityProviders();
        return clients.findAllClients(service, webContext);
    }

    private String extractDomainFromServiceURL(String serviceUrl) {
        Matcher matcher = domainExtractorPattern.matcher(serviceUrl);
        if (matcher.find()) {
            return matcher.group(1);
        } else {
            LOGGER.warn("No domain was extracted for [{}]", serviceUrl);
        }
        return "";
    }
}
