FROM osixia/openldap:1.2.2
LABEL maintainer="GIP RECIA - Julien Gribonvald <julien.gribonvald@recia.fr>"

RUN rm -Rf /container/service/slapd/assets/config/bootstrap/schema/mmc

ADD bootstrap /container/service/slapd/assets/config/bootstrap
#ADD init-db /container/service/slapd/assets/init-db
#ADD certs /container/service/slapd/assets/certs
#ADD environment /container/environment/01-custom

RUN ls -la /container/service/slapd/assets/config/bootstrap/ldif/*
RUN ls -la /container/service/slapd/assets/config/bootstrap/schema/*