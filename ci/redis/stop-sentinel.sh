#!/bin/bash

cd docker-sentinel1
docker compose stop

cd ../docker-sentinel2
docker compose stop

cd ../docker-sentinel3
docker compose stop
