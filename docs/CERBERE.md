# Validation de la charte ENT - Redirection sur cerbere

## Principe

Lorsqu'un utilisateur se connecte au CAS, il faut que son compte soit dans un état valide pour qu'il puisse établir une session. Si le compte est dans un état invalide, alors il faut rediriger l'utilisateur sur une URL particulière (cerbere), et laisser l'utilisateur créer une session sur cerbere car c'est une application cassifiée.

L'idée est d'intégrer dans le webflow une étape de vérification de la validité du compte. On ne peut pas se servir d'un Interrupt car il s'active après l'établissement de la session SSO : donc même sans rien valider la deuxième fois l'interrupt ne s'activera pas car l'utilisateur aura déjà une session.

La vérification a donc été intégrée juste avant la création du service ticket, dans l'action `GenerateServiceTicketAction`. Ainsi, même si l'utilisateur peut établir une session sur le CAS, il ne pourra jamais établir de session applicative sans avoir validé son compte.

## Fonctionnement

Le morceau de code rajouté se résume de la manière suivante :

```java
if(authentification_deleguée){
	if(compte_invalide){
		if(service_demandé == cerbere){
			rediriger_vers_cerbere();
		}
	}
}
```

Ce qui fait que  :
- Dans le cas où on redirige vers cerbere alors on interrompt le flot et on fait un `requestExternalRedirect`. Il faut faire attention à rediriger sur le bon domaine pour faire valider la bonne charte ;
- Dans le cas où on ne redirige pas vers cerbere on continue le flot normalement.

## Paramètres

Pour activer la redirection sur cerbere il faut à minima définir les properties custom suivantes :
- `cerbere.validation.enabled` à True pour activer le fonctionnement global ;
- `cerbere.validation.attribute-to-evaluate` et `cerbere.validation.value-to-excpect` pour indiquer sur quel attribut et quelle valeur se base la vérification  de l'activation ;
- `cerbere.validation.redirect-url` pour donner l'endpoint où rediriger quand le service n'est pas activé ;
- `cerbere.validation.service-id` une regex qui doit matcher le serviceId de cerbere pour laisser l'utilisateur s'authentifier sur cerbere.