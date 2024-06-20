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

# Démarrage des dockers redis et ldap
cd "${ROOT_DIRECTORY}/ci/ldap"
./run-ldap.sh
cd "${ROOT_DIRECTORY}/ci/redis"
./start-all.sh
cd "${ROOT_DIRECTORY}"

# Lancement du serveur CAS grâce au war qu'on a construit plus haut
echo "Launching CAS at $casWebApplicationFile with options $CAS_ARGS"
java -jar "$casWebApplicationFile" $CAS_ARGS &
pid=$!
echo "Waiting for CAS under process id ${pid}"
sleep 45
casLogin="${PUPPETEER_CAS_HOST:-https://localhost:8443}/cas/login"
echo "Checking CAS status at ${casLogin}"
curl -k -L --output /dev/null --silent --fail "$casLogin"
if [[ $? -ne 0 ]]; then
    printred "Unable to launch CAS instance under process id ${pid}."
    printred "Killing process id $pid and exiting"
    kill -9 "$pid"
    exit 1
fi

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
    sleep 1
done;

# On kill le serveur CAS avant de terminer le script
kill -9 "$pid"
exit 0
