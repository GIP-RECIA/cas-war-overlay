# Déployer le war sur nexus

Le plugin gradle `maven-publish` permet de déployer le `cas.war` sur un nexus.

Dans le `gradle.properties`, renseingner les paramètres :
- `publishNexusUrl` l'url du nexus
- `publishNexusUsername` le username pour se connecter au nexus
- `publishNexusVersion` la version sous la forme `VERSION_CAS-esco-VERSION_LOCALE`

Puis faire un simple `./gradlew publish` après avoir fait un `./gradlew clean build`.