#!/bin/bash

cd docker-redis1
docker compose down

cd ../docker-redis2
docker compose down

cd ../docker-redis3
docker compose down
