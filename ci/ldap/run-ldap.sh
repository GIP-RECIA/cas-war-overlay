#!/bin/bash

echo "Starting LDAP docker image..."

docker compose down
docker volume rm ldap_ldap-config
docker volume rm ldap_ldap-data
docker compose build --no-cache
docker compose up &

sleep 10

docker ps | grep "openldap"
retVal=$?
if [ $retVal == 0 ]; then
    echo "LDAP docker container is running."
else
    echo "LDAP docker container failed to start."
    exit $retVal
fi