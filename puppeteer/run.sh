#!/bin/bash

ROOT_DIRECTORY="${PWD}"
CAS_ARGS="${CAS_ARGS:-}"

RED="\e[31m"
GREEN="\e[32m"
YELLOW="\e[33m"
ENDCOLOR="\e[0m"

function printgreen() {
  printf "${GREEN}$1${ENDCOLOR}\n"
}
function printyellow() {
  printf "${YELLOW}$1${ENDCOLOR}\n"
}
function printred() {
  printf "${RED}$1${ENDCOLOR}\n"
}

# Faire un clean avant tout pour s'assurer qu'on rebuild bien le CAS s'il y a eu des modifs
echo "Cleaning last deployment..."
./gradlew clean

# Remplacer appServer= par appServer=-tomcat
casGradlePropertiesFile="${ROOT_DIRECTORY}/gradle.properties"
if grep -q 'appServer=' "$casGradlePropertiesFile"; then
    echo "Replacing 'appServer=' with 'appServer=-tomcat' in $casGradlePropertiesFile"
    sed -i '/^appServer=/c\appServer=-tomcat' "$casGradlePropertiesFile"
else
    echo "'appServer=' not found or already replaced in $casGradlePropertiesFile"
fi

# Build le war du CAS
casWebApplicationFile="${ROOT_DIRECTORY}/build/libs/cas.war"
if [[ ! -f "$casWebApplicationFile" ]]; then
    echo "Building CAS"
    ./gradlew clean build -x test -x javadoc --no-configuration-cache
    if [ $? -ne 0 ]; then
        printred "Failed to build CAS"
        exit 1
    fi
fi

# Une fois le build fini on peut remettre le gradle.properties dans son état d'origine
if grep -q 'appServer=-tomcat' "$casGradlePropertiesFile"; then
    echo "Replacing 'appServer=-tomcat' with 'appServer=' in $casGradlePropertiesFile"
    sed -i 's/appServer=-tomcat/appServer=/' "$casGradlePropertiesFile"
else
    echo "'appServer=-tomcat' not found or already replaced in $casGradlePropertiesFile"
fi

# Installation de puppeteer s'il n'est pas enore installé
if [[ ! -d "${ROOT_DIRECTORY}/puppeteer/node_modules/puppeteer" ]]; then
    echo "Installing Puppeteer"
    (cd "${ROOT_DIRECTORY}/puppeteer" && npm install puppeteer)
else
    echo "Using existing Puppeteer modules..."
fi

echo -n "NPM version: " && npm --version
echo -n "Node version: " && node --version

# Installation des dépendances python
cd "${ROOT_DIRECTORY}"
pip install -r ci/python/flask-saml-client/requirements.txt
pip install -r ci/python/flask-oidc-client/requirements.txt

# Démarrage des dockers redis et ldap
cd "${ROOT_DIRECTORY}/ci/ldap"
./run-ldap.sh
cd "${ROOT_DIRECTORY}/ci/redis"
./start-all.sh

# Démarrage des serveurs python
cd "${ROOT_DIRECTORY}/ci/python"
python3 service_test1.py &
pid_python_service_test1=$!
python3 service_test2.py &
pid_python_service_test2=$!
python3 service_test10.py &
pid_python_service_test10=$!
python3 service_test16.py &
pid_python_service_test16=$!
python3 service_test19.py &
pid_python_service_test19=$!
python3 service_test22.py &
pid_python_service_test22=$!
python3 service_test23.py &
pid_python_service_test23=$!
python3 service_test27.py &
pid_python_service_test27=$!
python3 service_test28.py &
pid_python_service_test28=$!
python3 service_test29.py &
pid_python_service_test29=$!
python3 service_test35.py &
pid_python_service_test35=$!
python3 service_test47.py &
pid_python_service_test47=$!
python3 service_test48.py &
pid_python_service_test48=$!
python3 structs_info_api.py &
pid_python_structs_info_api=$!
python3 externalid_api.py &
pid_python_externalid_api=$!
cd "flask-saml-client"
python3 index.py --port 8011 --settings "saml/settings11.json" &
pid_python_saml_client=$!
python3 index.py --port 8024 --settings "saml/settings24.json" &
pid_python_saml_client2=$!
python3 index.py --port 8025 --settings "saml/settings25.json" &
pid_python_saml_client3=$!
python3 index.py --port 8026 --settings "saml/settings26.json" &
pid_python_saml_client4=$!
python3 index.py --port 8033 --settings "saml/settings33.json" &
pid_python_saml_client5=$!
python3 index.py --port 8034 --settings "saml/settings34.json" &
pid_python_saml_client6=$!
cd "../flask-oidc-client"
python3 index.py --port 8018 --scopes "openid profile test" --clientid "client-testcas" --clientsecret "secret-testcas" &
pid_python_oidc_client=$!
python3 index.py --port 8020 --scopes "openid" --clientid "client2-testcas" --clientsecret "secret2-testcas" &
pid_python_oidc_client2=$!
python3 index.py --port 8021 --scopes "openid" --clientid "client3-testcas" --clientsecret "secret3-testcas" &
pid_python_oidc_client3=$!
python3 index.py --port 8031 --scopes "openid" --clientid "client4-testcas" --clientsecret "secret4-testcas" &
pid_python_oidc_client4=$!
python3 index.py --port 8032 --scopes "openid" --clientid "client5-testcas" --clientsecret "secret5-testcas" &
pid_python_oidc_client5=$!
rm -r /tmp/oidc
mkdir /tmp/oidc
cd "${ROOT_DIRECTORY}"

# Lancement du serveur CAS grâce au war qu'on a construit plus haut
# Attention à avoir un délai suffisant pour attendre que le serveur CAS soit démarré
# On lance d'abord le serveur de délagation
echo "Launching CAS delegation server at $casWebApplicationFile with options $CAS_DELEG_ARGS"
java -jar "$casWebApplicationFile" $CAS_DELEG_ARGS &
pid_cas_deleg=$!
sleep 30
# Puis le serveur sur lequel on va faire les tests
echo "Launching CAS at $casWebApplicationFile with options $CAS_ARGS"
java -jar "$casWebApplicationFile" $CAS_ARGS &
pid_cas=$!
sleep 120

exit_ci () {
    kill -9 "$pid_cas"
    kill -9 "$pid_cas_deleg"
    kill -9 "$pid_python_service_test1"
    kill -9 "$pid_python_service_test2"
    kill -9 "$pid_python_service_test10"
    kill -9 "$pid_python_service_test16"
    kill -9 "$pid_python_service_test19"
    kill -9 "$pid_python_service_test22"
    kill -9 "$pid_python_service_test23"
    kill -9 "$pid_python_service_test27"
    kill -9 "$pid_python_service_test28"
    kill -9 "$pid_python_service_test29"
    kill -9 "$pid_python_service_test35"
    kill -9 "$pid_python_service_test47"
    kill -9 "$pid_python_service_test48"
    kill -9 "$pid_python_structs_info_api"
    kill -9 "$pid_python_externalid_api"
    kill -9 "$pid_python_saml_client"
    kill -9 "$pid_python_saml_client2"
    kill -9 "$pid_python_saml_client3"
    kill -9 "$pid_python_saml_client4"
    kill -9 "$pid_python_saml_client5"
    kill -9 "$pid_python_saml_client6"
    kill -9 "$pid_python_oidc_client"
    kill -9 "$pid_python_oidc_client2"
    kill -9 "$pid_python_oidc_client3"
    kill -9 "$pid_python_oidc_client4"
    kill -9 "$pid_python_oidc_client5"
    cd "${ROOT_DIRECTORY}/ci/ldap"
    ./stop-ldap.sh
    cd "${ROOT_DIRECTORY}/ci/redis"
    ./stop-all.sh
    cd "${ROOT_DIRECTORY}"
}

casLogin="${PUPPETEER_CAS_HOST:-https://localhost:8443}/cas/login"
echo "Checking CAS status at ${casLogin}"
curl -k -L --output /dev/null --silent --fail "$casLogin"
if [[ $? -ne 0 ]]; then
    printred "Unable to launch CAS instance under process id ${pid_cas}."
    printred "Killing and exiting"
    exit_ci
    exit 1
fi

# Tableau pour stocker les résultats des scénarios
results=()

# Si on est sûr que le serveur CAS est lancé, alors on éxécute les scénarios puppeteer un par un
export NODE_TLS_REJECT_UNAUTHORIZED=0
echo "Executing puppeteer scenarios..."
for scenario in "${PWD}"/puppeteer/scenarios/*; do
    scenarioName=$(basename "$scenario")
    echo "=========================="
    echo "- Scenario $scenarioName "
    echo -e "==========================\n"
    node "$scenario"
    rc=$?
    echo -e "\n"
    if [[ $rc -ne 0 ]]; then
        printred "🔥 Scenario $scenarioName FAILED"
    else 
        printgreen "✅ Scenario $scenarioName PASSED"
    fi
    echo -e "\n"
    results+=("$scenarioName:$rc")
    sleep 1
done;

# Affichage du récapitulatif
echo -e "\n=========================="
echo "Scenarios summary:"
echo "=========================="
overall_status=0
for result in "${results[@]}"; do
    IFS=":" read -r scenarioName rc <<< "$result"
    if [[ $rc -ne 0 ]]; then
        printred "🔥 Scenario $scenarioName FAILED"
        overall_status=1
    else
        printgreen "✅ Scenario $scenarioName PASSED"
    fi
done
echo -e "\n"

# On kill les process avant de terminer le script (utile pour test en local)
exit_ci

# Terminer le script en erreur si un des scénarios a échoué
if [[ $overall_status -ne 0 ]]; then
    echo -e "\nSome scenarios failed. Exiting with error."
    exit 1
else
    echo -e "\nAll scenarios passed successfully."
    exit 0
fi