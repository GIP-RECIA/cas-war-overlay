# Déployer le war sur nexus

Le plugin gradle `maven-publish` permet de déployer le `cas.war` sur un nexus.

Dans le `gradle.properties`, renseingner les paramètres :
- `publishNexusUrl` l'url du nexus
- `publishNexusVersion` la version sous la forme `VERSION_CAS-esco-VERSION_LOCALE`

Un script `publish.sh` permet ensuite de publier facilement une nouvelle version. Il suffit d'entrer le nouveau numéro de version dans le `gradle.properties`.

Il fait le commit, tag et push nécéssaire sur git puis constuit un war avec le profil prod avec `./gradlew clean build -Pprofile=prod`, et le publie sur le nexus avec `./gradlew publish`.