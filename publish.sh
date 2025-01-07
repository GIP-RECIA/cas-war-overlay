#!/bin/bash

./gradlew clean build -Pprofile=prod
./gradlew publish