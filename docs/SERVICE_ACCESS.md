# Restriction d'accès conditionnelle aux services

## En fonction de la date et de l'heure
[https://apereo.github.io/cas/7.0.x/services/Service-Access-Strategy-Time.html](https://apereo.github.io/cas/7.0.x/services/Service-Access-Strategy-Time.html)

Exemple :
```json
"accessStrategy" : {
	"@class" : "org.apereo.cas.services.TimeBasedRegisteredServiceAccessStrategy",
	"startingDateTime" : "2024-07-23T09:52:00.132+02:00",
	"endingDateTime" : "2024-07-23T10:05:00.132+02:00",
	"zoneId" : "UTC+2"
}
```

`startingDateTime` et `endingDateTime` sont de la forme :
- `YYYY-MM-DD` année mois et jour
- `T` un séparateur
- `HH:MM:SS.MSS` heure minutes secondes et millisecondes
- `+XX:XX` le décalage par rapport à l'UTC (+2 ou +1 en fonction de l'heure d'été/d'hiver)

`zoneId` est le fuseau horaire qui sera pris pour récupérer l'heure actuelle lorsqu'on va la comparer aux startingDateTime et endingDateTime :
- `UTC+X` ou X est +1 ou +2 en fonction de l'heure d'été/d'hiver


## En fonction de la valeur des attributs LDAP
[https://apereo.github.io/cas/7.0.x/services/Service-Access-Strategy-ABAC.html](https://apereo.github.io/cas/7.0.x/services/Service-Access-Strategy-ABAC.html)

Exemple :
```json
"accessStrategy" : {
	"@class" : "org.apereo.cas.services.DefaultRegisteredServiceAccessStrategy",
	"enabled" : true,
	"ssoEnabled" : true,
	"requiredAttributes" : {
		"@class" : "java.util.HashMap",
		"sn" : [ "java.util.HashSet", [ "CUNAFO" ] ],
		"mail" : [ "java.util.HashSet", [ "didier.cunafo@ac-demo.fr" ] ]
	}
}
```
De base c'est un `ET` qui est fait entre les différents attributs, autrement dit dans ce cas on ne poura se connecter que si sn ET mail ont les valeurs demandées.

`"requireAllAttributes": false` permet de faire un OU à la place d'un ET

On peut aussi bloquer l'accès si on a certains attributs :
```json
"rejectedAttributes" : {
	"@class" : "java.util.HashMap",
	"cn" : [ "java.util.HashSet", [ "admin" ] ]
}
```

Les valeurs des attributs supportent les expressions régulières. Par exemple pour les groupes du `isMemberOf` on peut imaginer quelquechose comme ça :
```json
"requiredAttributes" : {
	"@class" : "java.util.HashMap",
	"isMemberOf" : [ "java.util.HashSet", [ "esco:admin.*" ] ]
}
```
On arrive sur le formulaire de login et si on n'est pas autorisé à se connecter alors on reçoit un message d'erreur `Accès au service refusé en raison de privilèges manquants`.


## Chainer les conditions d'accès
[https://apereo.github.io/cas/7.0.x/services/Service-Access-Strategy-Chain.html](https://apereo.github.io/cas/7.0.x/services/Service-Access-Strategy-Chain.html)

Exemple :
```json
"accessStrategy": {
	"@class": "org.apereo.cas.services.ChainingRegisteredServiceAccessStrategy",
	"strategies": [
		"java.util.ArrayList",
		[
			{
				"@class": "org.apereo.cas.services.TimeBasedRegisteredServiceAccessStrategy",
				"startingDateTime": "2024-07-23T09:52:00.132+02:00",
				"endingDateTime": "2024-07-23T10:05:00.132+02:00",
				"zoneId": "UTC+2"
			},
			{
				"@class": "org.apereo.cas.services.DefaultRegisteredServiceAccessStrategy",
				"requiredAttributes": {
					"@class": "java.util.HashMap",
					"sn": [ "java.util.HashSet", [ "CUNAFO" ] ]
				}
			}
		]
	],
	"operator": "OR"
}
```

Les opérateurs disponibles sont de type `LogicalOperatorTypes`. On dipose du `AND` et du `OR`, mais on ne dispose **pas** du `NOT`.

On peut chainer sans problème des `ChainingRegisteredServiceAccessStrategy` dans d'autres `ChainingRegisteredServiceAccessStrategy` afin de faire des conditions complexes.


## Point important : pourquoi le chaînage entre une stratégie basée sur le temps et une stratégie basée sur les attributs ne fonctionne pas sans modification ?
Lorsqu'on vérifie l'accès à un service on le fait avec 3 méthodes différentes pour n'importe quelle `BaseRegisteredServiceAccessStrategy` (qui implémente `RegisteredServiceAccessStrategy`)
- `isServiceAccessAllowed` qui vérifie si le service auquel on tente d'accéder est activé dans CAS (correspond à l'attribut `enabled` des définitions de service)
- `isServiceAccessAllowedForSso` qui vérifie si le service auquel on tente d'accéder à le droit d'utiliser le SSO (correspond à l'attribut `ssoEnabled`). Si non, on pourra se connecter mais il faudra retaper ses idenfitiants à chaque accès au service
- `authorizeRequest` qui vérifie si le principal à le droit d'accéder au service (correspond à l'attribut `requiredAttributes` des définitions de service). Celui-ci se vérifie donc **après** la connection à l'inverse des deux autres

Chaque stratégie peut donc surcharger ces 3 méthodes afin de définir son comportement personnalisé. Les méthodes de base se contentent de retourner `true` (donc d'autoriser l'accès au service) et ont le profil suivant (exemple avec  `authorizeRequest`) :
```java
default boolean authorizeRequest(final RegisteredServiceAccessStrategyRequest request) throws Throwable {
	return true;
}
```

Lorsqu'on chaîne une stratégie basée sur le temps `TimeBasedRegisteredServiceAccessStrategy`, et une stratégie basée sur les attributs `DefaultRegisteredServiceAccessStrategy`, on teste si on a le droit d'accéder aux services à des moments **différents !**

En effet, `ChainingRegisteredServiceAccessStrategy` se contente de faire un AND ou un OR sur les valeurs de retours de toutes ses stratégies pour chacune des 3 méthodes, or :
- `TimeBasedRegisteredServiceAccessStrategy` surchage la méthode `isServiceAccessAllowed` mais **pas** la méthode `authorizeRequest`
- `DefaultRegisteredServiceAccessStrategy` surchage la méthode `authorizeRequest` mais **pas** la méthode `isServiceAccessAllowed`
Autrement dit, dès qu'on fait un OR, on se rend compte qu'il y a un problème car il y a toujours au moins une des deux stratégies qui retourne `true` (même si elle devrait retourner `false`)

Comme on ne peut pas vérifier les attributs de l'utilisateur avant la connexion, surcharger la méthode `isServiceAccessAllowed` dans `DefaultRegisteredServiceAccessStrategy` n'a **pas** de sens.

La solution est donc de vérifier même après connexion si la date et l'heure pour accéder au service sont corrects, en surchargant la méthode adéquate dans `TimeBasedRegisteredServiceAccessStrategy` :
```java
@Override
public boolean authorizeRequest(final RegisteredServiceAccessStrategyRequest request) throws Throwable {
	return isServiceAccessAllowed(request.getRegisteredService(), request.getService());
}
```
On a juste à se servir de la méthode `isServiceAccessAllowed` qui est déjà surchargée et vérifie déjà correctement si l'utilisateur à le droit d'accéder a service en fonction de la date de début/fin.