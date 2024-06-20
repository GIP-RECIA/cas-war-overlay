#!/bin/bash

cd docker-redis1
docker compose stop

cd ../docker-redis2
docker compose stop

cd ../docker-redis3
docker compose stop
