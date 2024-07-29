# Génération et release d'un attribut externalId par service

## Coté CAS

**Nouvelle AttributeReleasePolicy**

Une nouvelle AttributeReleasePolicy a été ajoutée pour prendre en compte la génération dynamique d'un externalId en fonction du service.
La classe java en question est `ReturnExternalIDAttributeReleasePolicy` qui étend `AbstractRegisteredServiceAttributeReleasePolicy`  comme les autres AttributeReleasePolicy.

Elle implémente la méthode `getAttributesInternal` qui doit retourner une `Map<String, List<Object>>` qui représente tous les attributs qui vont être release au service. Cette map associe le nom d'un attribut à la liste de ses valeurs.

**Problème :** La méthode `getAttributesInternal` est en réalité appelée plusieurs fois lorsqu'on essaie de se connecter à un serice depuis le CAS, avec en à chaque fois **en entrée les attributs du principal**. Or, la Map des attributs qu'on retourne ne modifie pas les attributs du principal et ne sera donc "utilisée" que lors du dernier appel. Ainsi, lorsqu'on fait un appl à l'API pour générer un externalid, on fait en réalité plusieurs appels car l'AttributeReleasePolicy n'a pas connaissance de l'externalid, puisque même s'il est ajouté dans le LDAP, il n'est pas ajouté dans les attributs du principal avant la prochaine connection.

**Solution :** La solution choisie pour résoudre ce problème a été d'ajouter l'externallid dans les attributs du principal la première fois qu'on le génère grâce à la ligne :
```java
context.getPrincipal().getAttributes().put(externalIdAttributeNameResponse, Collections.singletonList(externalUserId));
```
Ensuite il suffit de vérifier qu'on à pas déja l'attribut dans la Map d'entrée grâce au `if(!resolvedAttributes.containsKey(externalIdAttributeNameResponse))` pour éviter d'en regénérer un nouveau à chaque appel.

**Appels à l'API**

Dans le cas on ou n'a pas récupéré d'attribut externalId pour le bon service via les attributs LDAP alors cela veut dire que l'attribut n'a pas encore été généré pour le service en question. Il faut donc faire appel à une API externe qui va se charger de générer l'externalId, l'insérer dans le LDAP et dans la base de données, puis retourner l'externalId qui a été généré.

Pour cela on a la méthode `getOrInsertExternalIdForService` qui s'occupe de faire une requête POST sur une route spécifique grâce a un `HttpClient` avec comme paramètres d'entrée l'uid de l'utilisateur et le service pour lequel on veut générer l'externalid.

**Déclaration du service**

Un service avec une `ReturnExternalIDAttributeReleasePolicy` se déclare de la manière suivante en JSON dans le service registry :
```json
"attributeReleasePolicy": {
    "@class": "org.apereo.cas.services.ReturnExternalIDAttributeReleasePolicy",
    "internalServiceId": "WEBGEREST",
    "allowedAttributes": [ "java.util.ArrayList", [ "cn", "mail", "sn" ] ],
    "externalIdAttributeName": "externalIdTest"
}
```

- `internalServiceId` est l'id de service interne, autrement dit celui qu'on retrouve dans l'attribut externalid du ldap qui est de la forme `service$externalid` ;
- `allowedAttributes` est la liste des attributs qui vont être release **en plus** du externalid. Basé sur le même principe que `ReturnAllowedAttributeReleasePolicy` ;
- `externexternalIdAttributeNamealIdAttributeName` est le nom de l'attribut qui va être retourné au final. Cela permet de surcharger le paramètre global `externalid.attribute-name-response` par service.


## Coté API

Voir la doc du projet externalid-api : []