#!/bin/bash

# Vérifier et récupérer la version est passée en argument 
if [ -z "$1" ]; then
    echo "Usage: $0 <version>"
    echo "Exemple: $0 7.1.1"
    exit 1
fi
VERSION=$1

# Liste des fichiers à traiter sous le format "local_path remote_path"
FILES=(
    "src/main/java/org/apereo/cas/services/TimeBasedRegisteredServiceAccessStrategy.java core/cas-server-core-services-api/src/main/java/org/apereo/cas/services/TimeBasedRegisteredServiceAccessStrategy.java"
    "src/main/java/org/apereo/cas/web/flow/error/DefaultDelegatedClientAuthenticationFailureEvaluator.java support/cas-server-support-pac4j-core/src/main/java/org/apereo/cas/web/flow/error/DefaultDelegatedClientAuthenticationFailureEvaluator.java"
    "src/main/java/org/apereo/cas/web/flow/resolver/impl/DefaultCasDelegatingWebflowEventResolver.java core/cas-server-core-webflow-api/src/main/java/org/apereo/cas/web/flow/resolver/impl/DefaultCasDelegatingWebflowEventResolver.java"
    "src/main/java/org/apereo/cas/web/flow/BaseServiceAuthorizationCheckAction.java support/cas-server-support-actions-core/src/main/java/org/apereo/cas/web/flow/BaseServiceAuthorizationCheckAction.java"
    "src/main/java/org/apereo/cas/oidc/token/OidcIdTokenGeneratorService.java support/cas-server-support-oidc-core-api/src/main/java/org/apereo/cas/oidc/token/OidcIdTokenGeneratorService.java"
    "src/main/java/org/apereo/cas/oidc/slo/OidcSingleLogoutMessageCreator.java support/cas-server-support-oidc-core-api/src/main/java/org/apereo/cas/oidc/slo/OidcSingleLogoutMessageCreator.java"
    "src/main/java/org/apereo/cas/support/saml/idp/metadata/generator/BaseSamlIdPMetadataGenerator.java support/cas-server-support-saml-idp-core/src/main/java/org/apereo/cas/support/saml/idp/metadata/generator/BaseSamlIdPMetadataGenerator.java"
    "src/main/java/org/apereo/cas/web/flow/actions/DelegatedClientAuthenticationRedirectAction.java support/cas-server-support-pac4j-webflow/src/main/java/org/apereo/cas/web/flow/actions/DelegatedClientAuthenticationRedirectAction.java"
    "src/main/java/org/apereo/cas/config/CasCoreLogoutAutoConfiguration.java core/cas-server-core-logout/src/main/java/org/apereo/cas/config/CasCoreLogoutAutoConfiguration.java"
    "src/main/java/org/apereo/cas/logout/DefaultSingleLogoutMessageCreator.java core/cas-server-core-logout-api/src/main/java/org/apereo/cas/logout/DefaultSingleLogoutMessageCreator.java"
)

# Créer un dossier diff dans lequel on va copier les fichier locaux et nouveaux
echo "Création du dossier diff"
mkdir diff

# Copier les fichiers locaux dans diff
echo "Recopie des fichiers locaux dans diff"
cp build.gradle diff/
cp gradle.properties diff/
for file_info in "${FILES[@]}"; do
    local_path=$(echo "$file_info" | cut -d ' ' -f 1)
    cp "$local_path" "diff/$(basename "$local_path")"
done

# Télécharger les fichiers de la nouvelle version et les placer dans le dossier 'diff'
echo "Téléchargement des fichiers de la nouvelle version"
for file_info in "${FILES[@]}"; do
    local_path=$(echo "$file_info" | cut -d ' ' -f 1)
    remote_path=$(echo "$file_info" | cut -d ' ' -f 2)
    filename=$(basename "$local_path")
    wget -q -O "diff/${filename}_$VERSION" "https://raw.githubusercontent.com/apereo/cas/refs/tags/v$VERSION/$remote_path"
done

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
for file_info in "${FILES[@]}"; do
    local_path=$(echo "$file_info" | cut -d ' ' -f 1)
    filename=$(basename "$local_path")
    meld "diff/$filename" "diff/${filename}_$VERSION"
done

# Une fois la comparaison finie remplacer les fichiers dans src/ par ceux modifiés dans diff/
echo "Recopie des fichiers mis à jour dans src"
cp build.gradle ./
cp diff/gradle.properties ./
for file_info in "${FILES[@]}"; do
    local_path=$(echo "$file_info" | cut -d ' ' -f 1)
    filename=$(basename "$local_path")
    cp "diff/$filename" "$local_path"
done

# Supprimer le dossier diff une fois qu'on a fini de faire les modifs
echo "Suppression du dosser diff pour prochaine màj"
rm -r diff