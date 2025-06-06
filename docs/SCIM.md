# Provisionning SCIM
 
CAS met en place un mécanique qui permet de créer des comptes en mode **JIT** (Just In Time) lorsqu'un utilisateur se connecte à un service donné. Cette mécanique est normée par le protocole SCIM qui consiste en un de requêtes sur une API.
 
## Fonctionnalités natives

Pour activer le provisionning SCIM il suffit d'ajouter le module `org.apereo.cas:cas-server-support-scim`. Ce module se base sur la librairie `de.captaingoldfish:scim-sdk` pour les créations d'objets en envois de requêtes.

Il suffit ensuite de paramétrer correctement le client SCIM pour qu'il puisse communiquer avec le serveur :
```json
cas.scim.target=http://URL_SERVEUR/scim/v2
cas.scim.oauth-token=token_pour_lauthentification
```

## Modifications apportées

### Provisionning par service

De base CAS ne permet pas d'activer/désactiver le provisonning SCIM par service : soit il est activé pour tous les services, soit il est désactivé pour tous les services. Pour résoudre ce problème une modification a été apportée dans le `PrincipalProvisionerAction` en ajoutant une propriété custom par service qui permet d'activer le SCIM (le comportement par défaut est de désactiver).

Ainsi, pour activer le provisionning SCIM pour un service donné, il faut que le service définisse la propriété suivante :
```json
"properties" : {  
  "@class" : "java.util.HashMap",  
  "scimEnabled" : {  
    "@class" : "org.apereo.cas.services.DefaultRegisteredServiceProperty",  
    "values" : [ "java.util.HashSet", [ true ] ]  
  }  
}
```

### Logique globale de provisionning

La logique pour la création des utilisateurs et groupes a été refaite entièrement dans le `ScimPrincipalProvisioner`. Les éléments qui ont été modifiés sont notamment :
- Quelles informations sont récupérées depuis le LDAP ;
- Quelles requêtes sont envoyées sous quelles conditions et dans quel ordre ;
- Quelles informations sont envoyées dans le corps des requêtes ;

La logique principale se trouve dans la méthode `provision`, tandis que les méthodes `mapEstablishmentResource`, `mapClassResource` et `mapUserResource` servent à créer les objets SCIM qui seront envoyés dans le corps des requêtes. Un certain nombre de propriétés custom ont également été ajoutées afin de ne pas avoir à recompiler le CAS si jamais le nom d'un attribut change. Pour en avoir la liste, consulter le fichier `CONFIGURATION.md`.
