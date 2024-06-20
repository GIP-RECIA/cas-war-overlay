#!/bin/bash

cd docker-redis1
docker compose up &

cd ../docker-redis2
docker compose up &

cd ../docker-redis3
docker compose up &
