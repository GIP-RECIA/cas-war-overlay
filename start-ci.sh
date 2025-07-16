#!/bin/bash

SCENARIO_FOLDER="${1:-scenarios}"

CAS_ARGS="--spring.profiles.active=test" CAS_DELEG_ARGS="--spring.profiles.active=deleg" SCENARIO_FOLDER="$SCENARIO_FOLDER" ./puppeteer/run.sh
