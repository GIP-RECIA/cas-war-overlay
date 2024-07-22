# Gestion Multidomaine

## Objectif : rediriger sur un domaine X si on arrive sur le domaine Y si l'utilisateur est connecté sur l'établissement lié au domaine X.

**Modifications apportées**

Activer le module des interruptions dans le build.gradle :
```gradle
implementation "org.apereo.cas:cas-server-support-interrupt-webflow"
```

Activer les différents modules permettant de compiler le code java :
 ```gradle
compileOnly "org.apereo.cas:cas-server-support-interrupt-core"
compileOnly "org.apereo.cas:cas-server-support-interrupt-api"
```

Mettre les bonnes properties pour activer les interruptions :
```properties
cas.interrupt.core.force-execution=true
cas.interrupt.core.trigger-mode=AFTER_SSO
```
`AFTER_SSO` permet d'attendre qu'on ai déjà établi le TGT. Pour choisir le bon trigger mode voir : `https://apereo.github.io/cas/7.0.x/webflow/Webflow-Customization-Interrupt-TriggerModes.html`.

L'objectif est de rediriger l'utilisateur sur le `/cas/login` mais avec le service partant du bon domaine. Comme le `TGC` sera cette fois-ci présent dans les cookies alors l'utilisateur ne se rendra compte de rien. La seule différence coté CAS sera la génération de deux `ST` (un pour le premier login et un autre pour le second).

On a 2 fichiers java : un qui sert à enregistrer une nouvelle interruption, et l'autre qui est l'interruption en tant que tel (`CustomInterruptConfiguration` et `DomainChangeInterruptInquirer`)
On enregstre l'interruption avec :
```java
plan.registerInterruptInquirer(domainChangeInterruptInquirer);
```
Ce qui appelera la méthode `inquireInternal` de `DomainChangeInterruptInquirer`

Parmi les paramètres de la méthode inquireInternal, attention à bien faire la différence entre :
```
service 	           The Service object representing the requesting application.
registeredService 	  The RegisteredService object representing the service definition in the registry.
```

Les scripts utilisent des propriétés customs, il ne faut pas oublier de les définir : 
```properties
cas.custom.properties.interrupt.structs-base-api-url=https://test-lycee.giprecia.net
cas.custom.properties.interrupt.structs-api-path=/change-etablissement/rest/v2/structures/structs/
cas.custom.properties.interrupt.replace-domain-regex=(\\?service=https://)[^/]+(/)
```

La logique du script est la suivante : 
- On récupère d'ou vient l'utilisateur grâce a spring webflow et au `requestContext` ;
- On récupère le vrai domaine de l'utilisateur via son SIRENCourant qu'on à grâce à l'object `authentication` et au `principal`. On fait alors une requête API sur `https://test-lycee.giprecia.net/change-etablissement/rest/v2/structures/structs/` ;
- On regarde si le vrai domaine est contenu dans l'url par laquelle est arrivée l'utilisateur, si oui on le laisse passer, sinon on lève une `InterruptResponse` en redirigeant sur le bon domaine (on revient au début de la phase de login, mais avec le TGC cette fois-ci).

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

**Page de redirection custom**

Lorsque l'utilisateur change de domaine, l'interruption lève une notification. Cette notification affiche une page avec un bouton sur lequel on peut cliquer pour être redirigé (comportement de CAS de base).
Comme dans notre cas la redirection est instantannée grâce à `interrupt.setAutoRedirect(true)`, on ne doit pas voir la page. 

Malgré tout, une page custom a été créée si un problème venait à se produire.
Pour cela on a modifié le template `casInterruptView.html` en simplifiant l'affichage à un texte avec un bouton en dessous, et ajouté un texte custom dans `messages_fr.properties` et `messages.properties`.

**Par service**

On peut forcer un service particulier à ne pas prendre en compte les interruptions :
```json
"webflowInterruptPolicy" : {
    "@class" : "org.apereo.cas.services.DefaultRegisteredServiceWebflowInterruptPolicy",
    "enabled": true
}
```
Par défaut tous les autres services prendront en compte les interruptions.

**Définition de service multidomaine**

Les services sont définis à l'aide d'une expression régulière avec un `|` pour prendre en compte les différentes domaines possibles pour un même service.

Exemple : `^https:\/\/(lycees|clg18|clg28|clg36|clg37|clg41|clg45|cfa|ef2s|recia|webocentre).test.recia.dev\/.*`
