# CAS properties

The following tables lists all the properties that are useful in this CAS deployment :

## CAS Server
| Property | Description | Example value |
|----------|-------------|---------------|
| cas.server.name | CAS server URL | `https://localhost:8443` |
| cas.server.prefix | CAS server URL (with path) | `https://localhost:8443/cas` |

## Ticket Registry
| Property | Description | Example value |
|----------|-------------|---------------|
| cas.ticket.registry.redis.host | Redis master node host (necessary but unused) | localhost |
| cas.ticket.registry.redis.password | Redis master password | password |
| cas.ticket.registry.redis.port | Redis master node port (necessary but unused) | 6379 |
| cas.ticket.registry.redis.sentinel.master | Name of sentinel master | mymaster |
| cas.ticket.registry.redis.sentinel.node[i] | List of sentinel adress in the form of host:port | localhost:26379 |
| cas.ticket.registry.redis.sentinel.password | Sentinel password | password |
| cas.ticket.registry.redis.pool.enabled | Enable the pooling configuration | true |
| cas.ticket.registry.redis.pool.max-idle | Max number of "idle" connections in the pool | 512 |
| cas.ticket.registry.redis.pool.max-active | Max number of connections that can be allocated by the pool at a given time | 512 |
| cas.ticket.registry.redis.cache.cache-size | Size of CAS cache for redis ticket registry (0 to disable) | 0 |

## JSON Service Registry
| Property | Description | Example value |
|----------|-------------|---------------|
| cas.service-registry.core.init-from-json | False to disable default service registry | false |
| cas.service-registry.core.init-default-service |Indicates whether service definitions that ship with CAS should be imported into CAS service registry | false |
| cas.service-registry.json.location | The location of the folder containing all the JSON service definition files | file:/path |

## LDAP Auth
| Property | Description | Example value |
|----------|-------------|---------------|
| cas.authn.accept.enabled | Disable default authentication | false |
| cas.authn.ldap[0].ldap-url | LDAP url to the server | ldap://localhost:389 |
| cas.authn.ldap[0].base-dn | Base DN to use when connecting to LDAP | ou=people,dc=esco-centre,dc=fr |
| cas.authn.ldap[0].bind-dn | Bind DN to use when connecting to LDAP | cn=admin,ou=administrateurs,dc=esco-centre,dc=fr |
| cas.authn.ldap[0].bind-credential | Bind credential to use when connecting to LDAP | password |
| cas.authn.ldap[0].search-filter | User filter to use for searching ({user} will be replaced by the login entered in CAS) | `(ENTPersonLogin={user})` |
| cas.authn.ldap[0].type | Authentication type | AUTHENTICATED |
| cas.authn.ldap[0].principal-attribute-id | Principal attribute CAS will return after a successful authentication (as an identifier) | uid |

## LDAP attribute repository
| Property | Description | Example value |
|----------|-------------|---------------|
| cas.person-directory.active-attribute-repository-ids | IDS of enabled attribute repositories | ldap |
| cas.person-directory.use-existing-principal-id | Use principal id returned by authentication | true |
| cas.authn.attribute-repository.ldap[0].id | ID of this attribute repository | ldap |
| cas.authn.ldap[0].ldap-url | LDAP url to the server | ldap://localhost:389 |
| cas.authn.ldap[0].base-dn | Base DN to use when connecting to LDAP | ou=people,dc=esco-centre,dc=fr |
| cas.authn.ldap[0].bind-dn | Bind DN to use when connecting to LDAP | cn=admin,ou=administrateurs,dc=esco-centre,dc=fr |
| cas.authn.ldap[0].bind-credential | Bind credential to use when connecting to LDAP | password |
| cas.authn.ldap[0].search-filter | User filter to use for searching | `uid={0}` |
| cas.authn.attribute-repository.ldap[0].attributes.X | Map each attribute in LDAP to attribute in attribute repository | X |
| cas.authn.attribute-repository.core.expiration-time | Caching duration (0 to disable caching) | 0 |

## SAML IDP
| Property | Description | Example value |
|----------|-------------|---------------|
| cas.authn.saml-idp.core.entity-id | The SAML entityId for the CAS server | https://cas.example.org/idp |
| cas.authn.saml-idp.metadata.file-system.location | Where the CAS server will store the metadata that he generated for himself | file:/path/to/directory |
| cas.authn.saml-idp.logout.sign-logout-response | If logout reponses need to be signed for all SP | false |
| cas.server.scope | Scope of the server (useful for scoped attributes) | domaine.fr |
| cas.authn.saml-idp.core.session-storage-type | Storage type for SAML authn sessions (TST) | TICKET_REGISTRY |

## OIDC IDP
| Property | Description | Example value |
|----------|-------------|---------------|
| cas.authn.oidc.core.issuer | URL of the issuer to uniquely identify the CAS server | https://cas.example/cas/oidc|
| cas.authn.oidc.jwks.file-system.jwks-file | Path to the JWKS file resource used to handle signing/encryption of authentication tokens | /etc/cas/keystore.jwks |
| cas.authn.oidc.core.claims-map.X | Map fixed claims to CAS attributes. Key is the existing claim name for a scope and value is the new attribute that should take its place and value | Y |
| cas.authn.oidc.core.user-defined-scopes.X | Mapping of user-defined scopes. Key is the new scope name and value is a comma-separated list of claims mapped to the scope | Y1, Y2, ... |
| cas.authn.oidc.discovery.scopes | List of supported scopes | openid, profile, ... |
| cas.authn.oidc.discovery.claims |  List of supported claims | sub, name, ... |
| cas.authn.oidc.id-token.include-id-token-claims | Setting this flag to true will force CAS to include claims in the ID token regardless of the response type | false |

## Attribute definition
| Property | Description | Example value |
|----------|-------------|---------------|
| cas.authn.attribute-repository.attribute-definition-store.json.location | JSON file containing all attribute definitions | file:/chemin/vers/fichier.json |
| cas.authn.attribute-repository.stub.attributes.X | Static attribute definition | Y |

## SSO
| Property | Description | Example value |
|----------|-------------|---------------|
| cas.sso.services.allow-missing-service-parameter | Whether to allow SSO session with a missing target service | false |

## SLO
| Property | Description | Example value |
|----------|-------------|---------------|
| cas.logout.follow-service-redirects | Whether the user should be redirected after logout | true |
| cas.logout.redirect-parameter | Parameter in the logout URL used to redirect the user | url |

## Ticket expiration policy
| Property | Description | Example value |
|----------|-------------|---------------|
| cas.ticket.tgt.primary.max-time-to-live-in-seconds | Maximum time in seconds TGT would be live in CAS server | PT8H |
| cas.ticket.tgt.primary.time-to-kill-in-seconds | Time in seconds after which TGT would be destroyed after a period of inactivity | PT2H |

## Delegated authentication (CAS)
| Property | Description | Example value |
|----------|-------------|---------------|
| cas.authn.pac4j.cas[0].login-url | The CAS server login url | `https://cas-server.com` |
| cas.authn.pac4j.cas[0].client-name | Name of the client mostly for UI purposes and uniqueness | CASDELEGCLIENT |

## Crypto
| Property | Description | Example value |
|----------|-------------|---------------|
| cas.tgc.crypto.enabled | Whether crypto operations are enabled on the TGC | true |
| cas.tgc.crypto.encryption.key | Encryption key used to encrypt the TGC | |
| cas.tgc.crypto.signing.key | Signing key used to sign the TGC | |
| cas.ticket.registry.redis.crypto.enabled | Whether crypto operations are enabled on the redis ticket registry | true |
| cas.ticket.registry.redis.crypto.encryption.key | Encryption key used to encrypt the tickets stored in the registry | |
| cas.ticket.registry.redis.crypto.signing.key | Signing key used to sign the tickets stored in the registry | |
| cas.webflow.crypto.enabled | hether crypto operations are enabled on the webflow | true |
| cas.webflow.crypto.encryption.key | Encryption key used to encrypt the webflow | |
| cas.webflow.crypto.signing.key | Signing key used to sign the webflow | |
| cas.authn.oauth.access-token.crypto.encryption.key | Encryption key used to encrypt Oauth tokens | |
| cas.authn.oauth.access-token.crypto.signing.key | Signing key used to sign Oauth tokens | |
| cas.authn.oauth.session-replication.cookie.crypto.encryption.key | Encryption key used to encrypt the Oauth session replication cookie | |
| cas.authn.oauth.session-replication.cookie.crypto.signing.key| Signing key used to sign the Oauth session replication cookie | |
| cas.authn.pac4j.core.session-replication.cookie.crypto.encryption.key | Encryption key used to encrypt the Pac4j session replication cookie | |
| cas.authn.pac4j.core.session-replication.cookie.crypto.signing.key | Signing key used to sign the Pac4j session replication cookie | |
| cas.authn.oauth.crypto.signing.key | Encryption key used to encrypt the Oauth protocol | |
| cas.authn.oauth.crypto.signing.key | Signing key used to sign the Oauth protocol | |
| cas.authn.saml-idp.core.session-replication.cookie.crypto.encryption.key | Encryption key used to encrypt the SAML session replication cookie | |
| cas.authn.saml-idp.core.session-replication.cookie.crypto.signing.key | Signing key used to sign the SAML session replication cookie | |

## Logging
| Property | Description | Example value |
|----------|-------------|---------------|
| logging.config | Log4j2 file path | file:/path/log4j2.xml |

## Audit
| Property | Description | Example value |
|----------|-------------|---------------|
| cas.audit.slf4j.auditable-fields | List of field that will be tracked and saved in the audit files | who,action,client_ip |
| cas.audit.slf4j.use-single-line | Indicates whether audit logs should be recorded as a single-line | true |
| cas.audit.engine.supported-actions| List of actions that will be tracked and saved in the audit files | TICKET_GRANTING_TICKET_CREATED,LOGOUT_SUCCESS |

## Monitoring
| Property | Description | Example value |
|----------|-------------|---------------|
| management.endpoints.web.exposure.include | List of all exposed monitor endpoints | health, X, Y, ... |
| management.endpoint.X.enabled | Whether to enable this endpoint | true |
| cas.monitor.endpoints.endpoint.X.access | Define the security access level of the endpoint | ANONYMOUS |
| cas.monitor.endpoints.endpoint.prometheus.required-ip-addresses | Required IP addresses (CIDR ranges are accepted) | W.X.Y.Z/A |
| management.prometheus.metrics.export.enabled | Enable prometheus metrics export | true |

## Interrupt
| Property | Description | Example value |
|----------|-------------|---------------|
| cas.interrupt.core.force-execution | Whether execution of the interrupt inquiry query should be always forced | true |
| cas.interrupt.core.trigger-mode | How interrupt notifications should be triggered in the authentication flow | AFTER_SSO |

## MFA
| Property | Description | Example value |
|----------|-------------|---------------|
| cas.authn.mfa.triggers.global.global-provider-id | This setting holds the value of an MFA provider that shall be activated for all requests | mfa-gauth |
| cas.authn.mfa.triggers.principal.global-principal-attribute-name-triggers | Trigger MFA based on a principal attribute(s) whose value(s) matches a regex pattern | AttributeName |
| cas.authn.mfa.triggers.principal.global-principal-attribute-value-regex | The regular expression that is cross matches against the principal attribute to determine if the account is qualified for multifactor authentication | AttributeValue |
| cas.authn.mfa.gauth.core.multiple-device-registration-enabled | Allows the user/system to accept multiple accounts and device registrations per user | true |
| cas.authn.mfa.gauth.core.issuer | Issuer used in the barcode when dealing with device registration events | CASIssuer |
| cas.authn.mfa.gauth.core.label | Label used in the barcode when dealing with device registration events | CASLabel |
| cas.authn.mfa.gauth.redis.sentinel.master | Name of sentinel master | mymaster |
| cas.authn.mfa.gauth.redis.sentinel.node[i] | List of sentinel adress in the form of host:port | localhost:26379 |
| cas.authn.mfa.gauth.redis.sentinel.password | Sentinel password | password |
| cas.authn.mfa.gauth.redis.password | Redis password | password |
| cas.authn.mfa.gauth.core.trusted-device-enabled | Indicates whether this provider should support trusted devices | true |
| cas.authn.mfa.trusted.core.auto-assign-device-name | Indicate whether a device name should be automatically selected and assigned by CAS | false |
| cas.authn.mfa.trusted.core.device-registration-enabled | Indicates whether CAS should ask for device registration consent or execute it automatically | true |
| cas.authn.mfa.trusted.device-fingerprint.cookie.enabled | Enable device fingerprint cookie (default) | true |
| cas.authn.mfa.trusted.redis.sentinel.master | Name of sentinel master | mymaster |
| cas.authn.mfa.trusted.redis.sentinel.node[i] | List of sentinel adress in the form of host:port | localhost:26379 |
| cas.authn.mfa.trusted.redis.sentinel.password | Sentinel password | password |
| cas.authn.mfa.trusted.redis.password | Redis password | password |

## Feature activation
| Property | Description | Example value |
|----------|-------------|---------------|
| CasFeatureModule.AccountManagement.enabled | Enable account management page | true |

## Custom Properties

There is also a number of custom properties that are defined for some custom enhancements:

### Interrupt Redirections
| Property | Description | Default value |
|----------|-------------|---------------|
| cas.custom.properties.interrupt.structs-base-api-url | The base url for the structs info API |  |
| cas.custom.properties.interrupt.structs-api-path | The path for the structs info API |  |
| cas.custom.properties.interrupt.structs-replace-domain-regex | The regex used to replace the domain name in the URL | (\\?service=https://)[^/]+(/) |
| cas.custom.properties.interrupt.structs-refresh-cache-interval | The duration of the cache on structs info | PT6H |

### ExternalId Attribute Release
| Property | Description | Default value |
|----------|-------------|---------------|
| cas.custom.properties.externalid.base-api-url | The base url for the externalid API |  |
| cas.custom.properties.externalid.api-path | The path for the externalid API |  |
| cas.custom.properties.externalid.attribute-name-response | The path for the externalid API | externalId |
| cas.custom.properties.externalid.attribute-name-ldap | The name of the LDAP attribute that contains the list of external ids | ESCOPersonExternalIds |
| cas.custom.properties.externalid.split-character | The character splitting the service name and the external id in LDAP | $ |

### Portal Token Redirection
| Property | Description | Default value |
|----------|-------------|---------------|
| cas.custom.properties.token.domain-list | The list of known domains who can be used for redirect | domain1,domain2,domain3 |
| cas.custom.properties.token.redirect-portal-context | The path of the portal | /portail |
| cas.custom.properties.token.redirect-unknown-domain | Where to redirect if the domain is unknown | https://exempledomain.fr |
| cas.custom.properties.token.domain-mapping-startswith | The prefix used for keys in domain mapping | "DOMAIN-RED:" |