#!/bin/bash

# Vérifier et récupérer la version est passée en argument 
if [ -z "$1" ]; then
    echo "Usage: $0 <version>"
    echo "Exemple: $0 7.1.1"
    exit 1
fi
VERSION=$1

# Créer un dossier diff dans lequel on va copier les fichier locaux et nouveaux
echo "Création du dossier diff"
mkdir diff

# Copier les fichiers locaux dans diff
echo "Recopie des fichiers locaux dans diff"
cp build.gradle diff/
cp gradle.properties diff/
cp src/main/java/org/apereo/cas/services/TimeBasedRegisteredServiceAccessStrategy.java diff/
cp src/main/java/org/apereo/cas/web/flow/error/DefaultDelegatedClientAuthenticationFailureEvaluator.java diff/
cp src/main/java/org/apereo/cas/web/flow/resolver/impl/DefaultCasDelegatingWebflowEventResolver.java diff/
cp src/main/java/org/apereo/cas/web/flow/BaseServiceAuthorizationCheckAction.java diff/
cp src/main/java/org/apereo/cas/oidc/token/OidcIdTokenGeneratorService.java diff/
cp src/main/java/org/apereo/cas/support/saml/idp/metadata/generator/BaseSamlIdPMetadataGenerator.java diff/
cp src/main/java/org/apereo/cas/web/flow/actions/DelegatedClientAuthenticationRedirectAction.java diff/

# Télécharger les fichiers de la nouvelle version et les placer dans le dossier 'diff'
echo "Téléchargement des fichiers de la nouvelle version"
wget -q -O diff/TimeBasedRegisteredServiceAccessStrategy_$VERSION.java https://raw.githubusercontent.com/apereo/cas/refs/tags/v$VERSION/core/cas-server-core-services-api/src/main/java/org/apereo/cas/services/TimeBasedRegisteredServiceAccessStrategy.java
wget -q -O diff/DefaultDelegatedClientAuthenticationFailureEvaluator_$VERSION.java https://raw.githubusercontent.com/apereo/cas/refs/tags/v$VERSION/support/cas-server-support-pac4j-core/src/main/java/org/apereo/cas/web/flow/error/DefaultDelegatedClientAuthenticationFailureEvaluator.java
wget -q -O diff/DefaultCasDelegatingWebflowEventResolver_$VERSION.java https://raw.githubusercontent.com/apereo/cas/refs/tags/v$VERSION/core/cas-server-core-webflow-api/src/main/java/org/apereo/cas/web/flow/resolver/impl/DefaultCasDelegatingWebflowEventResolver.java
wget -q -O diff/BaseServiceAuthorizationCheckAction_$VERSION.java https://raw.githubusercontent.com/apereo/cas/refs/tags/v$VERSION/support/cas-server-support-actions-core/src/main/java/org/apereo/cas/web/flow/BaseServiceAuthorizationCheckAction.java
wget -q -O diff/OidcIdTokenGeneratorService_$VERSION.java https://raw.githubusercontent.com/apereo/cas/refs/tags/v$VERSION/support/cas-server-support-oidc-core-api/src/main/java/org/apereo/cas/oidc/token/OidcIdTokenGeneratorService.java
wget -q -O diff/BaseSamlIdPMetadataGenerator_$VERSION.java https://raw.githubusercontent.com/apereo/cas/refs/tags/v$VERSION/support/cas-server-support-saml-idp-core/src/main/java/org/apereo/cas/support/saml/idp/metadata/generator/BaseSamlIdPMetadataGenerator.java
wget -q -O diff/DelegatedClientAuthenticationRedirectAction_$VERSION.java https://raw.githubusercontent.com/apereo/cas/refs/tags/v$VERSION/support/cas-server-support-pac4j-webflow/src/main/java/org/apereo/cas/web/flow/actions/DelegatedClientAuthenticationRedirectAction.java

# Pour les fichiers de l'overlay c'est un peu différent il faut générer un nouvel overlay, l'extraire puis les recopier
mkdir tmp
cd tmp
wget -O cas.tar.gz "https://getcas.apereo.org/starter.tgz?artifactId=cas&casVersion=$VERSION&commandlineShellSupported=true&dependencies=webapp-tomcat&deploymentType=executable&description=WAR overlay to use as a starting template for Apereo CAS deployments.&dockerSupported=true&githubActionsSupported=true&groupId=org.apereo.cas&helmSupported=false&herokuSupported=false&javaVersion=21&language=java&name=cas&nativeImageSupported=false&openRewriteSupported=true&packageName=org.apereo&packaging=war&puppeteerSupported=true&sbomSupported=false&type=cas-overlay&version=1.0.0"
tar -xzvf cas.tar.gz
cd ..
mv tmp/build.gradle diff/build_$VERSION.gradle
mv tmp/gradle.properties diff/gradle_$VERSION.properties
rm -r tmp

# Vérifier si les téléchargements ont réussi
if [ $? -eq 0 ]; then
    echo "Les fichiers ont bien été téléchargés et placés dans le dossier diff avec la version $VERSION"
else
    echo "Erreur lors du téléchargement des fichiers."
fi

# Comparer les fichiers un par un avec meld
echo "Comparaison des fichiers avec meld..."
meld diff/build.gradle diff/build_$VERSION.gradle
meld diff/gradle.properties diff/gradle_$VERSION.properties
meld diff/TimeBasedRegisteredServiceAccessStrategy.java diff/TimeBasedRegisteredServiceAccessStrategy_$VERSION.java
meld diff/DefaultDelegatedClientAuthenticationFailureEvaluator.java diff/DefaultDelegatedClientAuthenticationFailureEvaluator_$VERSION.java
meld diff/DefaultCasDelegatingWebflowEventResolver.java diff/DefaultCasDelegatingWebflowEventResolver_$VERSION.java
meld diff/BaseServiceAuthorizationCheckAction.java diff/BaseServiceAuthorizationCheckAction_$VERSION.java
meld diff/OidcIdTokenGeneratorService.java diff/OidcIdTokenGeneratorService_$VERSION.java
meld diff/BaseSamlIdPMetadataGenerator.java diff/BaseSamlIdPMetadataGenerator_$VERSION.java
meld diff/DelegatedClientAuthenticationRedirectAction.java diff/DelegatedClientAuthenticationRedirectAction_$VERSION.java

# Une fois la comparaison finie remplacer les fichiers dans src/ par ceux modifiés dans diff/
echo "Recopie des fichiers mis à jour dans src"
cp build.gradle ./
cp diff/gradle.properties ./
cp diff/TimeBasedRegisteredServiceAccessStrategy.java src/main/java/org/apereo/cas/services/TimeBasedRegisteredServiceAccessStrategy.java
cp diff/DefaultDelegatedClientAuthenticationFailureEvaluator.java src/main/java/org/apereo/cas/web/flow/error/DefaultDelegatedClientAuthenticationFailureEvaluator.java
cp diff/DefaultCasDelegatingWebflowEventResolver.java src/main/java/org/apereo/cas/web/flow/resolver/impl/DefaultCasDelegatingWebflowEventResolver.java
cp diff/BaseServiceAuthorizationCheckAction.java src/main/java/org/apereo/cas/web/flow/BaseServiceAuthorizationCheckAction.java
cp diff/OidcIdTokenGeneratorService.java src/main/java/org/apereo/cas/oidc/token/OidcIdTokenGeneratorService.java
cp diff/BaseSamlIdPMetadataGenerator.java src/main/java/org/apereo/cas/support/saml/idp/metadata/generator/BaseSamlIdPMetadataGenerator.java
cp diff/DelegatedClientAuthenticationRedirectAction.java src/main/java/org/apereo/cas/web/flow/actions/DelegatedClientAuthenticationRedirectAction.java

# Supprimer le dossier diff une fois qu'on a fini de faire les modifs
echo "Suppression du dosser diff pour prochaine màj"
rm -r diff