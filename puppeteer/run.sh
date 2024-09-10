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
    sed -i 's/appServer=/appServer=-tomcat/' "$casGradlePropertiesFile"
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
python3 structs_info_api.py &
pid_python_structs_info_api=$!
python3 externalid_api.py &
pid_python_externalid_api=$!
cd "flask-saml-client"
python3 index.py &
cd "${ROOT_DIRECTORY}"

# Lancement du serveur CAS grâce au war qu'on a construit plus haut
echo "Launching CAS at $casWebApplicationFile with options $CAS_ARGS"
java -jar "$casWebApplicationFile" $CAS_ARGS &
pid_cas=$!
echo "Waiting for CAS under process id ${pid_cas}"
# Attention à avoir un délai suffisant ici, il faut bien attendre que le serveur CAS soit démarré
sleep 60
casLogin="${PUPPETEER_CAS_HOST:-https://localhost:8443}/cas/login"
echo "Checking CAS status at ${casLogin}"
curl -k -L --output /dev/null --silent --fail "$casLogin"
if [[ $? -ne 0 ]]; then
    printred "Unable to launch CAS instance under process id ${pid_cas}."
    printred "Killing process id $pid_cas and exiting"
    kill -9 "$pid_cas"
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

# On kill le serveur CAS et les docker avant de terminer le script
kill -9 "$pid_cas"
kill -9 "$pid_python_service_test1"
kill -9 "$pid_python_service_test2"
kill -9 "$pid_python_service_test10"
kill -9 "$pid_python_structs_info_api"
kill -9 "$pid_python_externalid_api"
ps -aux | grep "python3 index.py" | head -n 2 | awk '{print $2}' | xargs kill -9
cd "${ROOT_DIRECTORY}/ci/ldap"
./stop-ldap.sh
cd "${ROOT_DIRECTORY}/ci/redis"
./stop-all.sh
cd "${ROOT_DIRECTORY}"

# Terminer le script en erreur si un des scénarios a échoué
if [[ $overall_status -ne 0 ]]; then
    echo -e "\nSome scenarios failed. Exiting with error."
    exit 1
else
    echo -e "\nAll scenarios passed successfully."
    exit 0
fi