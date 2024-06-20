#!/bin/bash

echo "Starting Redis Sentinel docker image..."

./remove-redis.sh
./remove-sentinel.sh

./init-sentinel.sh

./start-redis.sh
sleep 15
./start-sentinel.sh
sleep 15

COUNT_REDIS=$(docker ps | grep "redis" | wc -l)
if [ "$COUNT_REDIS" -eq 6 ]; then
    echo "Redis + sentinel docker images are running."
else
    echo "Redis + sentinel docker images failed to start."
    exit 1
fi