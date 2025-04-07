Apereo CAS WAR Overlay
=====================================

Deploy a CAS server using the WAR Overlay method without having to downoad all the source code from the CAS project.

This CAS server uses the following modules :
- **cas-server-support-ldap** as an authentication method
- **cas-server-support-redis-ticket-registry** as the ticket registry
- **cas-server-support-json-service-registry** as the service registry
- **cas-server-support-interrupt-webflow** to interrupt the webflow during the login phase
- **cas-server-support-oidc** to enable the OIDC protocol
- **cas-server-support-saml-idp** to act as an SAML2 identity provider
- **cas-server-support-pac4j-webflow** to enable delegated authentication
- **cas-server-support-pac4j-cas** to enable CAS delegated authentication
- **cas-server-support-pac4j-saml** to enable SAML delegated authentication
- **cas-server-core-scripting** for groovy scripting

And has a number of custom enhancements :
- CI pipeline with end-to-end tests using **puppeteer** and **docker**
- Multidomain and dynamic redirection on a specific domain
- Portal forced redirection with token check
- Time and attribute service access strategy chaining
- Dynamic attribute username provider and dynamic attribute release(externalid)
- Fix for concurrent access to service index map (see [this](https://groups.google.com/a/apereo.org/g/cas-user/c/pI9l9aT1gtU))
- Soft/Hard timeout expiration policy **per service**
- Custom <md:Info> SAML idp metadata generation
- Custom parameter in url for delegation depending on service
- Custom SAML attribute generation (pairwise-id and eduPersonTargetedId)
- Change subject in SLO request based on usernameAttributeProvider per service
- Better compatibility with SAML clients (see `SamlProfileSaml2ResponseBuilder.java`) 
- Association between delegated IdP and attribute repository
- Custom WAYF with local login page at another place
- Custom LDAP filter based on all principal attributes for profile selection 

Current CAS Base version : **7.1.4**

# Project Structure

All the important parts of the project are listed below:

```
.
├── .github
│   ├── workflows
│   │   └── build.yml
│   └── ...
|
├── ci
│   ├── ldap
│   |   └── ...
│   ├── python
│   |   └── ...
│   └── redis
│       └── ...
|
├── docs
│   └── ...
|
├── etc
│   └── cas
│       └── config
│           └── log4j2.xml
|
├── puppeteer
│   ├── scenarios
|   |   ├── scenario1.js
|   |   ├── scenario2.js
|   |   └── ...
│   ├── package.json
│   └── run.sh
|
├── src
│   └── main
│       ├── java
│       │   └── org
│       │       └── apereo
│       │           └── cas
│       │               ├── authentication
│       │               │   └── principal
│       │               │       ├── ldap
│       │               │       │   └── LdapDelegatedClientAuthenticationCredentialResolver.java
│       │               │       └── BaseDelegatedClientAuthenticationCredentialResolver.java
│       │               ├── config
│       │               │   ├── CasCoreLogoutAutoConfiguration.java
│       │               │   └── CustomInterruptConfiguration.java
│       │               ├── interrupt
│       │               │   └── DomainChangeInterruptInquirer.java
│       │               ├── logout
│       │               │   └── DefaultSingleLogoutMessageCreator.java
│       │               ├── oidc
│       │               │   └── slo
│       │               │   │   └── OidcSingleLogoutMessageCreator.java
│       │               │   └── token
│       │               │       └── OidcIdTokenGeneratorService.java
│       │               ├── persondir
│       │               │   └── DefaultAttributeRepositoryResolver.java
│       │               ├── services
│       │               │   ├── mgmt
│       │               │   │   └── AbstractServicesManager.java
│       │               │   ├── HardAndSoftTimeoutRegisteredServiceTicketGrantingTicketExpirationPolicy.java
│       │               │   ├── PrincipalExternalIdRegisteredServiceUsernameProvider.java
│       │               │   ├── PrincipalExternalIdRegisteredOidcServiceUsernameProvider.java
│       │               │   ├── ReturnExternalIDAttributeReleasePolicy.java
│       │               │   ├── ReturnExternalIDOidcAttributeReleasePolicy.java
│       │               │   └── TimeBasedRegisteredServiceAccessStrategy.java
│       │               ├── support/saml/idp/metadata/generator
│       │               │   ├── idp/metadata/generator
│       │               │   │   └── BaseSamlIdPMetadataGenerator.java
│       │               │   └── services
│       │               │       ├── PairwiseIdSamlRegisteredServiceAttributeReleasePolicy.java
│       │               │       └── TargetedIdSamlRegisteredServiceAttributeReleasePolicy.java
│       │               ├── util
│       │               │   └── LdapUtils.java
│       │               └── web
│       │                   ├── flow
│       │                   │   ├── actions
│       │                   │   │   ├── DelegatedClientAuthenticationCredentialSelectionAction.java
│       │                   │   │   └── DelegatedClientAuthenticationRedirectAction.java
│       │                   │   ├── error
│       │                   │   │   └── DefaultDelegatedClientAuthenticationFailureEvaluator.java
│       │                   │   ├── resolver/impl
│       │                   │   │   └── DefaultCasDelegatingWebflowEventResolver.java
│       │                   │   ├── BaseServiceAuthorizationCheckAction.java
│       │                   │   └── DefaultDelegatedClientIdentityProviderConfigurationProducer.java
│       │                   └── idp/profile/builders/response
│       │                       └── SamlProfileSaml2ResponseBuilder.java
|       | 
|       └── resources
|           ├── META-INF
|           |   └── spring
|           |       └── org.springframework.boot.autoconfigure.AutoConfiguration.imports
|           ├── services-test
|           |   └── ...
|           ├── templates
|           |   ├── delegated-authn
|           |   |   └── casDelegatedAuthnStopWebflow.html
|           |   ├── interrupt
|           |   |   └── casInterruptView.html
|           |   └── login
|           |       └── casGenericSuccessView.html
|           ├── application-test.yml
|           ├── application.yml
|           ├── custom_messages_fr.properties
|           ├── custom_messages.properties
|           ├── log4j2.xml
|           └── template-idp-metadata.vm.yml
|
├── build.gradle
├── README.md
├── gradle.properties
├── settings.gradle
└── start-ci.sh
```


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

All the properties used in this CAS deployment can be found in `docs/CONFIGURATION.md`.


# CI Pipeline

## Puppeteer

> [Puppeteer](https://pptr.dev/) is a Node.js library which provides a high-level API to control Chrome/Chromium over the DevTools Protocol.
> Puppeteer runs in headless mode by default, but can be configured to run in full (non-headless) Chrome/Chromium.

Puppeteer scenarios, used here as a form of acceptance testing, allow you to verify CAS functionality to address a particular authentication flow. The scenarios, which may be
found inside the `./puppeteer/scenarios` directory are designed as small Node.js scripts that spin up a headless browser and walk through a test scenario. You may
design your own test scenarios that verify functionality specific to your CAS deployment or feature.

To execute Puppeteer scenarios, run:

```bash
./start-ci.sh
```

This will first attempt to build your CAS deployment, will install Puppeteer and all other needed libraries. It will then start needed docker containers, launch the CAS server, and upon its availability, will iterate through defined scenarios and will execute them one at a time.

 ## Github actions

 A github workflow is executed at each push on the repository. See [this file](.github/workflows/build.yml)