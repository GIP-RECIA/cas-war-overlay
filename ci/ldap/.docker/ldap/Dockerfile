FROM osixia/openldap:1.2.4
LABEL maintainer="GIP RECIA - Julien Gribonvald <julien.gribonvald@recia.fr>"

RUN rm -Rf /container/service/slapd/assets/config/bootstrap/schema/mmc

ADD bootstrap /container/service/slapd/assets/config/bootstrap

RUN ls -la /container/service/slapd/assets/config/bootstrap/ldif/*
RUN ls -la /container/service/slapd/assets/config/bootstrap/schema/*