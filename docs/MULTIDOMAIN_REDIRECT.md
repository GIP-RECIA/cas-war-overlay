# Gestion Multidomaine

## Objectif : rediriger sur un domaine X si on arrive sur le domaine Y si l'utilisateur est connecté sur l'établissement lié au domaine X.

**Modifications apportées**

L'idée est de rediriger l'utilisateur sur le `/cas/login` une fois l'utilisateur connecté mais avec le service partant du bon domaine : comme le `TGC` sera présent lors de la redirection dans les cookies alors l'utilisateur ne se rendra compte de rien. La seule différence coté CAS est dans l'action d'émission des tickets `GenerateServiceTicketAction` où on rajoute une vérification avant de créer un `ST`.

Les propriétés à définir sont les suivantes :
```properties
cas.custom.properties.interrupt.structs-base-api-url=https://test-lycee.giprecia.net
cas.custom.properties.interrupt.structs-api-path=/change-etablissement/rest/v2/structures/structs/
cas.custom.properties.interrupt.replace-domain-regex=(\\?service=https://)[^/]+(/)
```

La logique de la vérification est assez simple : 
- On récupère d'où vient l'utilisateur grâce a spring webflow et au `RequestContext` ;
- On récupère le vrai domaine de l'utilisateur via son SIRENCourant qu'on à grâce à l'object `authentication` et au `principal`. On fait alors une requête API sur `https://.../change-etablissement/rest/v2/structures/structs/` ;
- On regarde si le vrai domaine est contenu dans l'url par laquelle est arrivée l'utilisateur, si oui on le laisse passer, sinon on le redirige sur la bonne url avec un `requestExternalRedirect()`.

**Gestion du cache**

Pour éviter de refaire une requête à chaque fois, un cache est mis en place. Il s'agit en réalité d'un dictionnaire qui associe le siren aux domaines associés, et qui s'actualise tous les X minutes.
```java
private Map<String, String> domainBySirenCache;
```
On se contente de remettre à zéro le dictionnaire à un interval donné :
```java
@Scheduled(fixedDelayString = "${cas.custom.properties.interrupt.refresh-cache-interval:PT6H}")
    public void resetDomainBySirenCache(){
        this.domainBySirenCache.clear();
    }
```
Attention à bien annoter la classe avec `@EnableScheduling`

**Gestion par service**

On peut forcer un service particulier à ne pas prendre en compte les interruptions :
```json
"properties" : {
    "@class" : "java.util.HashMap",
    "skipDomainRedirect" : {
        "@class" : "org.apereo.cas.services.DefaultRegisteredServiceProperty",
        "values" : [ "java.util.HashSet", [ true ] ]
    }
}
```
Par défaut tous les autres services prendront en compte les interruptions.

**Définition de service multidomaine**

Les services sont définis à l'aide d'une expression régulière avec un `|` pour prendre en compte les différentes domaines possibles pour un même service.

Exemple : `^https:\/\/(lycees|clg18|clg28|clg36|clg37|clg41|clg45|cfa|ef2s|recia|webocentre).test.recia.dev\/.*`
