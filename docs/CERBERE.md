# Validation de la charte ENT par domaine - Redirection sur cerbere

## Principe

Lorsqu'un utilisateur se connecte au CAS, il faut que son compte soit dans un état valide pour qu'il puisse établir une session. Si le compte est dans un état invalide, alors il faut rediriger l'utilisateur sur une URL particulière (cerbere), et laisser l'utilisateur créer une session sur cerbere car c'est une application cassifiée.

L'idée est d'intégrer dans le webflow une étape de vérification de la validité du compte. On ne peut pas se servir d'un Interrupt car il s'active après l'établissement de la session SSO : donc même sans rien valider la deuxième fois l'interrupt ne s'activera pas car l'utilisateur aura déjà une session.

La vérification a donc été intégrée juste avant la création du service ticket, dans l'action `GenerateServiceTicketAction`. Ainsi, même si l'utilisateur peut établir une session sur le CAS, il ne pourra jamais établir de session applicative sans avoir validé son compte.

## Fonctionnement

Le morceau de code rajouté se résume de la manière suivante :

```java
if(compte_invalide){
	if(service_demandé != cerbere){
		rediriger_vers_cerbere();
	}
}
```

Ce qui fait que  :
- Dans le cas où on redirige vers cerbere alors on interrompt le flot et on fait un `requestExternalRedirect`. Il faut faire attention à rediriger sur le bon domaine pour faire valider la bonne charte ;
- Dans le cas où on ne redirige pas vers cerbere on continue le flot normalement.

**Calcul de la validité du compte**

Pour savoir si on doit rediriger où non, on se base sur la signature des chartes par l'utilisateur en fonction de son domaine courant :
- Si l'utilisateur a signé la charte à jour de son domaine, il est valide
- Sinon, qu'il n'ait signé aucune charte, des chartes d'un autre domaine, ou une ancienne charte de son domaine, il est considéré comme invalide.

Pour savoir si la charte de son domaine est à jour, CAS prend en entrée un fichier CSV qui associe un domaine avec une date d'entée en vigueur. Si la date de signature est supérieur à la date d'entée en vigueur, alors c'est la charte à jour qui a été signée. Si un domaine n'est pas connu dans le fichier CSV, alors on considère que la charte est à jour.

Le fichier est rechargé tous les jours à une date donnée (synchronisée avec cerbere).

## Tests d'intégration

Par utilisateur :
- F14abc (valide) -> accès direct a cerbere
- F16abc (valide) -> charte validée pour le bon domaine avec le bon temps
- F20abc (valide) -> charte signée mais pour le bon domaine mais domaine inconnu dans le fichier
- F21abc (valide) -> charte pour un utilisateur multidomaine
- F17abc (invalide) -> charte validée pour le bon domaine mais avec le mauvais temps
- F18abc (invalide) -> charte validée mais pour le mauvais domaine
- F19abc (invalide) -> pas du tout de charte validée

## Paramètres

Pour activer la redirection sur cerbere il faut à minima définir les properties custom suivantes :
- `cerbere.validation.enabled` à True pour activer le fonctionnement global ;
- `cerbere.validation.attribute-to-evaluate` et `cerbere.validation.value-to-excpect` pour indiquer sur quel attribut et quelle valeur se base la vérification  de l'activation ;
- `cerbere.validation.service-id` une regex qui doit matcher le serviceId de cerbere pour laisser l'utilisateur s'authentifier sur cerbere ;
- `cerbere.validation.default-url`  l'url par défaut sur laquelle on redirige si le domaine courant de l'utilisateur n'est pas parmi les domaines connus de cerbere ;
- `cerbere.validation.authorized-domains` la liste des domaines connus de cerbere ;
- `cerbere.validation.redirect-path` le path pour constuire l'url vers cerbere ;
- `cerbere.validation.protocol` le protocole pour constuire l'url vers cerbere (utile en test car http) ;
- `cerbere.validation.default-domain` le domaine par défaut qu'on affecte à l'utilisateur si son établissement a plusieurs domaines ;
- `cerbere.validation.csv-path` le chemin vers le fichier qui indique les dates d'entrée en vigueur pour les chartes des différents domaines ;
- `cerbere.validation.csv-refresh-cron` une expression cron pour configurer le rechargement du fichier.