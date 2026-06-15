# Passage automatique par le DNMA

## Principe

Lorsqu'un utilisateur se connecte à l'ENT, il doit créer une session DNMA afin que le dispositif de marquage fonctionne. L'idée est d'intégrer dans le webflow, juste avant la validation du ticket une redirection vers le service DNMA, qui sera chargé de valider un ticket puis de rediriger vers l'url d'origine (pour que l'utilisateur ne s'en rende pas compte.)

Le flot des requêtes est le suivant :
1. Le service redirige vers le CAS ;
2. Au lieu d'établir un ticket pour le service, le CAS redirige vers lui-même avec comme service le DNMA en gardant dans l'url l'info de l'url d'appel initiale ;
3. Le CAS établi un ticket pour le DNMA et redirige ;
4. Le DNMA établi la session en faisant valider le ticket et redirige vers l'url d'appel initiale ;
5. Le CAS établi un ticket pour le service et redirige, on reprend le flot normal ;
6. Le service établi la session en faisant valider le ticket.

## Fonctionnement

Le morceau de code rajouté dans `GenerateServiceTicketAction` se résume de la manière suivante :

```java
if(pas dejà passé par le DNMA){
	if(service_demandé != dnma){
		rediriger_vers_dnma();
	}
}
```

Notes :
 - Pour savoir si on est déjà passé par le DNMA on regarde dans la liste des services du TGT ;
 - Le paramètre qui contient l'url d'origine s'appelle `originalUrl` ;
 - Le système est capable de s'auto désactiver pour éviter de tout bloquer si le DNMA est injoignable ;
 - Le fonctionnement est désactivé pour les services OIDC et SAML car la redirection finale n'est possible qu'avec le protocole CAS.

## Paramètres

Pour activer le passage vers le DNMA il faut à minima définir les properties custom suivantes :
- `dnma.enabled` à True pour activer le fonctionnement global ;
- `dnma.service-id` pour le serviceId du DNMA pour la redirection ;
- `nma.status-url` pour l'url du health-check du DNMA.