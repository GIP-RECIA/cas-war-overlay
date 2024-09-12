# CAS properties

The following tables lists all the properties that are used in this CAS deployment (test and production):

## CAS Server
| Property | Description | Example value |
|----------|-------------|---------------|
| cas.server.name | CAS server URL | `https://localhost:8443` |
| cas.server.prefix | CAS server URL (with path) | `https://localhost:8443/cas` |

## Ticket Registry
| Property | Description | Example value |
|----------|-------------|---------------|
| cas.ticket.registry.redis.host | Redis master node host (necessary but unused) | localhost |
| cas.ticket.registry.redis.port | Redis master node port (necessary but unused) | 6379 |
| cas.ticket.registry.redis.sentinel.master | Name of sentinel master | mymaster |
| cas.ticket.registry.redis.sentinel.node[i] | List of sentinel adress in the form of host:port | localhost:26379 |
| cas.authn.accept.enabled | False to disable default authentication | false |

## Service registry
| Property | Description | Example value |
|----------|-------------|---------------|
| cas.service-registry.core.init-from-json | False to disable default service registry | false |
| cas.service-registry.git.repository-url | URL of the git repository to clone | `https://github.com/GIP-RECIA/cas-git-service-registry-test.git` |
| cas.service-registry.git.active-branch | Branch to checkout and activate | master |
| cas.service-registry.git.branches-to-clone | Branches to clone | master |
| cas.service-registry.git.root-directory=services_definitions | Directory in the git repository used to store the service definitions | definitions |
| cas.service-registry.git.clone-directory.location | Location where the git project will be copied | `file:/tmp/cas-service-registry-test` |
| cas.service-registry.schedule.start-delay | Start delay of loading data | PT15S |
| cas.service-registry.schedule.repeat-interval | Repeat interval of re-loading data (e.g fetching and merging) | PT2M |
| cas.service-registry.cache.duration |  Fixed duration for an entry to be automatically removed from the cache after its creation | PT15M |

## LDAP
| Property | Description | Example value |
|----------|-------------|---------------|
| cas.authn.ldap[0].ldap-url | LDAP url to the server | ldap://localhost:389 |
| cas.authn.ldap[0].base-dn | Base DN to use when connecting to LDAP | ou=people,dc=esco-centre,dc=fr |
| cas.authn.ldap[0].bind-dn | Bind DN to use when connecting to LDAP | cn=admin,ou=administrateurs,dc=esco-centre,dc=fr |
| cas.authn.ldap[0].bind-credential | Bind credential to use when connecting to LDAP | admin |
| cas.authn.ldap[0].search-filter | User filter to use for searching ({user} will be replaced by the login entered in CAS) | `(ENTPersonLogin={user})` |
| cas.authn.ldap[0].type | Authentication type | AUTHENTICATED |
| cas.authn.ldap[0].principal-attribute-id | Principal attribute CAS will return after a successful authentication (as an identifier) | uid |
| cas.authn.ldap[0].principal-attribute-list | List of attributes CAS will return after a successful authentication (separated by commas) | uid,isMemberOf,cn,sn,givenName |

## SAML IDP
| Property | Description | Example value |
|----------|-------------|---------------|
| cas.authn.saml-idp.core.entity-id | The SAML entityId for the CAS server | https://cas.example.org/idp |
| cas.authn.saml-idp.metadata.file-system.location | Where the CAS server will store the metadata that he generated for himself | file:/path/to/directory |
| cas.authn.saml-idp.logout.sign-logout-response | If logout reponses need to be signed for all SP | false |

## SLO
| Property | Description | Example value |
|----------|-------------|---------------|
| cas.logout.follow-service-redirects | Whether the user should be redirected after logout | true |
| cas.logout.redirect-parameter | Parameter in the logout URL used to redirect the user | url |

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

## Audit
| Property | Description | Example value |
|----------|-------------|---------------|
| cas.audit.slf4j.auditable-fields | List of field that will be tracked and saved in the audit files | who,action,client_ip |
| cas.audit.slf4j.use-single-line | Indicates whether audit logs should be recorded as a single-line | true |
| cas.audit.engine.supported-actions| List of actions that will be tracked and saved in the audit files | TICKET_GRANTING_TICKET_CREATED,LOGOUT_SUCCESS |

## Interrupt
| Property | Description | Example value |
|----------|-------------|---------------|
| cas.interrupt.core.force-execution | Whether execution of the interrupt inquiry query should be always forced | true |
| cas.interrupt.core.trigger-mode | How interrupt notifications should be triggered in the authentication flow | AFTER_SSO |

## Custom properties

There is also a number of custom properties that are defined for some custom enhancements:

### Interrupt redirections
| Property | Description | Default value |
|----------|-------------|---------------|
| cas.custom.properties.interrupt.structs-base-api-url | The base url for the structs info API |  |
| cas.custom.properties.interrupt.structs-api-path | The path for the structs info API |  |
| cas.custom.properties.interrupt.structs-replace-domain-regex | The regex used to replace the domain name in the URL | (\\?service=https://)[^/]+(/) |
| cas.custom.properties.interrupt.structs-refresh-cache-interval | Description | PT6H |

### ExternalId Attribute Release
| Property | Description | Default value |
|----------|-------------|---------------|
| cas.custom.properties.externalid.base-api-url | The base url for the externalid API |  |
| cas.custom.properties.externalid.api-path | The path for the externalid API |  |
| cas.custom.properties.externalid.attribute-name-response | The path for the externalid API | externalId |
| cas.custom.properties.externalid.attribute-name-ldap | The name of the LDAP attribute that contains the list of external ids | ESCOPersonExternalIds |
| cas.custom.properties.externalid.split-character | The character splitting the service name and the external id in LDAP | $ |