# Redirection portail par service  

## Objectif : forcer l'utilisateur à passer par le portail au moins une fois dans la journée

### Principe de fonctionnement

Le principe de fonctionnement est le suivant : si le service demande la redirection et que l'utilisateur n'est pas encore connecté :
- Si on a un token dans l'URL (URL du portail), on vérifie que le token correspond au token de la journée, cas dans lequel on n'a pas besoin de faire de redirection ;
- Si le domaine est connu, alors on redirige l'utilisateur sur le domaine de ce portail ;
- Si le domaine est mappé par un autre domaine, alors on redirige l'utilisateur sur le portail du domaine mappé ;
- Si le domaine est inconnu, alors on redirige l'utilisateur sur une page générique ou il peut choisir son portail parmi tous les portails.

Si le service ne demande pas la redirection ou que l'utilisateur est déjà connecté, le fonctionnement normal reste inchangé.

Dans tous les cas on réalise ces opérations avant connexion, au moment de la vérification du service accédé.

### Modifications apportées dans le webflow

Pour intégrer cette mécanique un seul fichier a été modifié `BaseServiceAuthorizationCheckAction.java`. Il se situe dans `cas-server-support-actions-core/src/main/java/org/apereo/cas/web/flow`. Ce fichier est l'action qui vérifie que l'utilisateur peut accéder au service demandé. 
Deux choses sont à noter sur cette action :
- Comme l'utilisateur n'est pas encore connecté, on n'a pas accès à ses attributs ;
- Si l'utilisateur est déjà connecté, on ne rentre tout simplement pas dans cette action, autrement dit cette action n'est appelée que si l'utilisateur n'est pas encore connecté.

C'est dans la méthode `doExecuteInternal` qu'est implémentée la logique de la redirection. Dans les grandes lignes, elle peut se décrire de la manière suivante :
- On vérifie si le service demande la redirection sur le portail grâce à la propriété de service personnalisée `portalRedirectionNeeded` ;
- On vérifie si l'URL contient un token : si elle n'en contient pas, on sait d'avance qu'il faudra faire une redirection. Si elle en contient un, il suffit de vérifier qu'il est valide. La vérification se fait à l'aide de la méthode `isTokenValid` qui fait elle même appel à la méthode `checkTokenTimeValidity` ;
- Dans le cas ou on doit faire une redirection, il faut vérifier si le domaine est :
	- Connu : on peut alors directement rediriger sur le domaine du service.
	- Mappé : on redirige alors sur le domaine associé. Le mapping est fait par service grâce à la propriété `domainRedirectionNeeded`. Pour mapper un domaine il faut ajouter des propriété dont la clé est constituée du `token.domain-mapping-startswith` puis du domaine à tester, et dont la valeur est le domaine sur lequel il faut rediriger.
	- Inconnu : on redirige sur le domaine prédéfini par la propriété `token.redirect-unknown-domain`.

Comme `doExecuteInternal` doit retourner un `Event`, une fois qu'on a fait les vérifications on retourne : 
- Soit un `success()` si on veut continuer le flot normalement ;
- Soit on fait un `context.getExternalContext().requestExternalRedirect(redirectUrl)` en retournant un `result(CasWebflowConstants.TRANSITION_ID_REDIRECT)` si on a fait une redirection.


### Configuration

**Définition de service**

Pour définir un service qui demande la redirection sur le portail, il suffit d'ajouter certaines propriétés particulières. En voici un exemple :
```json
{
	"@class": "org.apereo.cas.services.CasRegisteredService",
	"serviceId": "^https:\/\/(domain1|domain2)\/path.*",
	"name": "Service Exemple Redirection Portail",
	"id": 100,
	...
	"properties" : {
		"@class" : "java.util.HashMap",
		"portalRedirectionNeeded" : {
			"@class" : "org.apereo.cas.services.DefaultRegisteredServiceProperty",
			"values" : [ "java.util.HashSet", [ true ] ]
		},
		"domainRedirectionNeeded" : {
			"@class" : "org.apereo.cas.services.DefaultRegisteredServiceProperty",
			"values" : [ "java.util.HashSet", [ true ] ]
		},
		"DOMAIN-RED:domain1" : {
			"@class" : "org.apereo.cas.services.DefaultRegisteredServiceProperty",
			"values" : [ "java.util.HashSet", [ "mappeddomaine1" ] ]
		},
		"DOMAIN-RED:domain2" : {
			"@class" : "org.apereo.cas.services.DefaultRegisteredServiceProperty",
			"values" : [ "java.util.HashSet", [ "mappeddomaine2" ] ]
		}
	}
}
```
`portalRedirectionNeeded` indique que le service demande la redirection.

`domainRedirectionNeeded` indique que le service contient un domaine mappé (si il n'en contient pas il suffit de ne pas déclarer la propriété, ce n'est pas nécéssaire de la mettre à false).

`DOMAIN-RED:domainX` déclare un domaine mappé : 
- `DOMAIN-RED:` est un préfixe définit dans la configuration du CAS
- `domainX` est le domaine du service
- `mappeddomaineY` est le domaine vers lequel on va rediriger


**Propriétés du CAS**

Coté CAS, il faut à minima définir les propriétés `token.domain-list`, `token.redirect-portal-context`, `token.redirect-unknown-domain` et `token.domain-mapping-startswith`. Voir le CONFIGURATION.md de la doc pour plus d'infos.

### Astuce sur les tests d'intégration

Dans les tests on cherche surtout à savoir si la redirection va se faire, le problème étant que les domaines utilisés dans les tests n’existent pas car ce sont des domaines arbitraires. Pour cela, on utilise dans les tests un `setRequestInterception` qui va permettre à la fois de stopper les requêtes de redirection (`page.on('request', request =>`), mais aussi de vérifier le résultat des réponses pour voir si on est censé être redirigé au bon endroit (`page.on('response', response =>`).

En stoppant la requête vers le domaine arbitraire puppeteer lèvera une erreur `net::ERR_FAILED` qu'on pourra simplement `catch`, l'objectif étant uniquement de vérifier vers quel domaine cette requête aura du être faite.
