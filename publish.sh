#!/bin/bash

./gradlew clean build -Pprofile=prod
publish_version=$(grep "^publishNexusVersion=" gradle.properties | awk -F= '{print $2}')
./gradlew publish
git add gradle.properties
git commit -m "chore: release $publish_version"
git tag $publish_version
git push --atomic origin master $publish_version