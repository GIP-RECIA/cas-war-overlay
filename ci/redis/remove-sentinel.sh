#!/bin/bash
sudo rm -rf docker-sentinel1/config
sudo rm -rf docker-sentinel2/config
sudo rm -rf docker-sentinel3/config

cd docker-sentinel1
docker compose down

cd ../docker-sentinel2
docker compose down

cd ../docker-sentinel3
docker compose down
