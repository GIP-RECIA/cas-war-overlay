Apereo CAS WAR Overlay
=====================================

Deploy a CAS server using the WAR Overlay method without having to downoad all the source code from the CAS project.

This CAS server uses the following modules :
- **cas-server-support-ldap** as an authentication method
- **cas-server-support-redis-ticket-registry** as the ticket registry
- **cas-server-support-git-service-registry** as the service registry
- **cas-server-support-interrupt-webflow** to interrupt the webflow during the login phase
- **cas-server-support-oauth-webflow** to enable the Oauth2.0 protocol


And has a number of custom enhancements :
- Bugfix for the redis ticket registry (metaspace leak, see this [commit](https://github.com/GIP-RECIA/cas-war-overlay/commit/3d5f61cdf4edcece7cf2c6ced70f1203f689b246))
- CI pipeline with end-to-end tests using **puppeteer** and **docker**
- Multidomain and dynamic redirection on a specific domain


# Build

To build the project, use:

```bash
./gradlew clean build
```

To see what commands/tasks are available to the build script, run:

```bash
./gradlew tasks
```

If you need to, on Linux/Unix systems, you can delete all the existing artifacts
(artifacts and metadata) Gradle has downloaded using:

```bash
rm -rf $HOME/.gradle/caches/
```

## Keystore

For the server to run locally, you need to create a keystore file.
This can be done via the following command:

```bash
./gradlew[.bat] createKeystore
```

## Extension Modules

Extension modules are specified under the `dependencies` block of the [Gradle build script](build.gradle):

```gradle
dependencies {
    implementation "org.apereo.cas:cas-server-some-module"
    ...
}
```

To collect the list of all project modules and dependencies in the overlay:

```bash
./gradlew[.bat] dependencies
```                                                                       

# Run

Cas can be runned two ways : in an embedded container (tomcat) or directly in a tomcat server (building the project produces a war).


## Executable WAR (local deployment)

Just run:

```bash
./gradlew[.bat] run
```

Debug the CAS web application as an executable WAR:

```bash
./gradlew[.bat] debug
```

## External (production deployment)

Deploy the binary web application file in `build/libs` after a successful build to the tomcat servlet container.

# Configuration

CAS is configured with an external directory containing the configuration files. The path of this directory is specified in `src/main/resources/application.yml`. 


Regarding the tests, the properties are written directly in `src/main/resources/application-test.yml`.

## CAS properties

The following tables lists all the properties that are used in this CAS deployment:

### CAS Server
| Property | Description | Example value |
|----------|-------------|---------------|
| cas.server.name | CAS server URL | `https://localhost:8443` |
| cas.server.prefix | CAS server URL (with path) | `https://localhost:8443/cas` |

### Ticket Registry
| Property | Description | Example value |
|----------|-------------|---------------|
| cas.ticket.registry.redis.host | Redis master node host (necessary but unused) | localhost |
| cas.ticket.registry.redis.port | Redis master node port (necessary but unused) | 6379 |
| cas.ticket.registry.redis.sentinel.master | Name of sentinel master | mymaster |
| cas.ticket.registry.redis.sentinel.node[i] | List of sentinel adress in the form of host:port | localhost:26379 |
| cas.authn.accept.enabled | False to disable default authentication | false |

### Service registry
| Property | Description | Example value |
|----------|-------------|---------------|
| cas.service-registry.core.init-from-json | False to disable default service registry | false |
| cas.service-registry.git.repository-url | URL of the git repository to clone | `https://github.com/GIP-RECIA/cas-git-service-registry-test.git` |
| cas.service-registry.git.active-branch | Branch to checkout and activate | master |
| cas.service-registry.git.branches-to-clone | Branches to clone | master |
| cas.service-registry.git.clone-directory.location | Location where the git project will be copied | `file:/tmp/cas-service-registry-test` |
| cas.service-registry.schedule.start-delay | Start delay of loading data | PT15S |
| cas.service-registry.schedule.repeat-interval | Repeat interval of re-loading data (e.g fetching and merging) | PT2M |
| cas.service-registry.cache.duration |  Fixed duration for an entry to be automatically removed from the cache after its creation | PT15M |

### LDAP
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

### Interrupt
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


# CI Pipeline

## Puppeteer

> [Puppeteer](https://pptr.dev/) is a Node.js library which provides a high-level API to control Chrome/Chromium over the DevTools Protocol.
> Puppeteer runs in headless mode by default, but can be configured to run in full (non-headless) Chrome/Chromium.

Puppeteer scenarios, used here as a form of acceptance testing, allow you to verify CAS functionality to address a particular authentication flow. The scenarios, which may be
found inside the `./puppeteer/scenarios` directory are designed as small Node.js scripts that spin up a headless browser and walk through a test scenario. You may
design your own test scenarios that verify functionality specific to your CAS deployment or feature.

To execute Puppeteer scenarios, run:

```bash
CAS_ARGS="-Dcom.sun.net.ssl.checkRevocation=false --spring.profiles.active=test" ./puppeteer/run.sh
```

This will first attempt to build your CAS deployment, will install Puppeteer and all other needed libraries. It will start needed docker containers, then launch the CAS server, and upon its availability, will iterate through defined scenarios and will execute them one at a time.

 ## Github actions

 A github workflow is executed at each push on the repository. See this [file](.github/workflows/build.yml)