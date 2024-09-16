# Affichage d'un message d'erreur dynamique sur la page d'erreur d'authentification déléguée

L'objectif est de pouvoir afficher un message d'erreur en rapport avec l'erreur rencontrée lors d'un problème d'authentification. Par exemple, dans le cadre de la rentrée scolaire quand l'accès à certains services est bloqué, il faut bien afficher que c'est l'accès au service qui est impossible.

## Contexte

Si CAS sait gérer les erreurs d'authentification dans un flot normal, il ne possède pas de mécanisme suffisament judificieux pour afficher les erreurs d'authentification lorsqu'on est dans un flot d'authentification déléguée.

Concrètement, à partir du moment ou on délégue l'authentification, peu importe l'exception levée c'est toujours un message d'erreur générique `"Delegated Authentication Failure"` qui sera affiché. CAS indique donc à l'utilisateur que c'est la requête d'authentification déléguée qui a échouée, ce qui n'est pas forcément vrai.

De base, lorsqu'il y a une erreur pendant le flot d'authentification déléguée, CAS affiche la vue `CasWebflowConstants.VIEW_ID_DELEGATED_AUTHENTICATION_STOP_WEBFLOW` qui correspond au template `casDelegatedAuthnSopWebflow.html`. Cette vue est rendue avec un modèle qui contient seulement comme information le code d'erreur (401) de la réponse à la requête d'authentification déléguée.

Pourtant, si l'IDP auquel on délegue l'authentification répond positivement mais que l'authentification échoue ensuite parcequ'on ne peut pas accéder au service, on lève bien une exception `PrincipalException` qui est gérée dans le `resolveInternal` du `DefaultCasDelegatingWebflowEventResolver`. Mais cette information n'est jamais passée au `DefaultDelegatedClientAuthenticationFailureEvaluator` qui rend la vue d'erreur.

## Solution mise en place

**1- Ajout d'une information supplémentaire**

A l'endroit ou on `catch` l'exception, dans la méthode `resolveInternal` de la classe `DefaultCasDelegatingWebflowEventResolver`, on ajoute une information supplémentaire à la requête dans le webflow en ajoutant l'exception aux attributs :

```java
val request = WebUtils.getHttpServletRequestFromExternalWebflowContext(context);
request.setAttribute("extra_exception_info", exception);
```

Ici on a appellé l'attribut supplémentaire qu'on passe `extra_exception_info`, et on lui passe un objet, l'exception en elle-même. Au vu du bloc `catch` dans lequel on se situe la seule certitude qu'on a sur le type de l'objet est qu'il est `Throwable`.

**2- Récupération de l'information**

On doit récupérer l'information avant de pouvoir l'envoyer dans le modèle. Cela se passe dans la méthode `evaluate` de la classe `DefaultDelegatedClientAuthenticationFailureEvaluator`, on peut facilement récupérer l'attribut qu'on vient de passer grâce à :

```java
request.getAttribute("extra_exception_info")
```

Ensuite avant de pouvoir s'en servir il faut vérifier que c'est bien un Throwable (car on récupère juste un objet) et qu'on a bien un attribut pour cette clé là. C'est pourquoi on a les deux `if` suivants :

```java
if(request.getAttribute("extra_exception_info") != null){
    if(request.getAttribute("extra_exception_info") instanceof Throwable exception){
```

**3- Envoi de l'information dans le modèle**

Envoyer l'information dans le modèle est simple, il suffit d'ajouter les lignes suivantes dans `DefaultDelegatedClientAuthenticationFailureEvaluator` :

```java
final  String  errorName  =  exception.getClass().getName();
model.put("extra_exception_info_i18n_key","screeen.pac4j.unauthz.exception."+errorName.substring(errorName.lastIndexOf('.') + 1));
```

L'information qu'on passe au modèle n'est pas un message, ou simplement le nom de l'exception : c'est une clé i18n qu'on génère `screeen.pac4j.unauthz.exception.nomException` qui remplacera le texte `extra_exception_info_i18n_key` dans le template de la page html. Pour récupérer  `nomException` on utilise le nom de la classe de l'exception (car la seule chose dont on est sûr est que l'objet exception est `Thowable`).

**4- Affichage du message final grâce à la clé i18n**

 Le template à surcharger est donc `casDelegatedAuthnSopWebflow.html`. On le trouve dans `templates/delegated_authn`.  On ajoute un élément qui ressemble à :
```html
<span th:if="${extra_exception_info_i18n_key}" th:text="#{${extra_exception_info_i18n_key}}">Exception Info</span>
```

L'objectif final est d'écrire dans le `#{}` la valeur de la clé i18n. Pour cela on utilise `${}` qui va venir remplacer `extra_exception_info_i18n_key` par la valeur qu'on a passé au modèle (voir partie 3). Une fois le texte remplacé, on obtient alors `th:text="#{screeen.pac4j.unauthz.exception.nomException}` ce qui va aller mettre dans le span la valeur de la clé i18n `screeen.pac4j.unauthz.exception.nomException`.

Pour chaque exception pour laquelle on veut afficher un message particulier, il faut donc ajouter une nouvelle clé i18n. Cela se fait dans les fichiers `custom_messages.properties` et `custom_messages_fr.properties` dans le dossier `resources`. Par exemple pour gérer les exceptions de type `PrincipalException` on pourra ajouter la ligne suivante :
```java
screeen.pac4j.unauthz.exception.PrincipalException=Vous n'êtes pas autorisé à accéder à ce service. Cela peut être dû soit à des permissions insuffisantes soit à une restriction d'accès par date.
```

Le `th:if="${extra_exception_info_i18n_key}"` permet de ne rien afficher si jamais la clé i18n pour l'exception n'existe pas. Dans ce cas, on aura donc encore le message d'erreur par défaut et non pas un message d'erreur incompréhensible.

## Ajouter une nouvelle exception

Comme les messages finaux sont définis en i18n en fonction du nom des exceptions levées, il est très facile d'ajouter un nouveau message personnalisé pour une exception en particulier.

Il suffit d'ajouter dans les fichiers i18 (`custom_messages.properties`, `custom_messages_fr.properties`) la ligne:
```
screeen.pac4j.unauthz.exception.NOMEXCEPTION=MESSAGE
```

## Améliorations possibles

Actuellement, le message est dynamique en fonction du type d'exception mais pas dynamique en fonction de ce qui fait que l'exception se lève (on sait que l'utilisateur ne peut pas accéder au service mais on ne sait pas pourquoi). 

On pourrait cast l'exception passée en un type moins générique, comme `AuthenticationException` par exemple, ce qui permettrait d'avoir accès aux `handlerErrors` qui donnent plus d'informations. Le principal problème est que cela nécéssiterait des conditionnelles `instanceof` pour vérifier qu'on peut bien cast l'exception dans ce type en particulier.