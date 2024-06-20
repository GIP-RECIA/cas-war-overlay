#!/bin/bash

cd docker-sentinel1
docker compose up &

cd ../docker-sentinel2
docker compose up &

cd ../docker-sentinel3
docker compose up &
