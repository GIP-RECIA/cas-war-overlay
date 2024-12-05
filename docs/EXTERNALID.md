# Génération et release d'un attribut externalId par service

## Externalid en tant que username

**Nouveau ServiceUsernameProvider**

Un nouveau ServiceUsernameProvider a été ajouté pour prendre en compte la génération dynamique d'un externalId en fonction du service.
La classe java en question est `PrincipalExternalIdRegisteredServiceUsernameProvider` qui étend `BaseRegisteredServiceUsernameAttributeProvider` comme les autres ServiceUsernameProvider.

Elle implémente la méthode `resolveUsernameInternal` qui doit retourner un String qui est la valeur du principal qui va être release au service.

**Appels à l'API**

Dans le cas on ou n'a pas récupéré d'attribut externalId pour le bon service via les attributs LDAP alors cela veut dire que l'attribut n'a pas encore été généré pour le service en question. Il faut donc faire appel à une API externe qui va se charger de générer l'externalId, l'insérer dans le LDAP et dans la base de données, puis retourner l'externalId qui a été généré.

Pour cela on a la méthode `getOrInsertExternalIdForService` qui s'occupe de faire une requête POST sur une route spécifique grâce a un `HttpClient` avec comme paramètres d'entrée l'uid de l'utilisateur et le service pour lequel on veut générer l'externalid.

**Déclaration du service**

Un service avec un `PrincipalExternalIdRegisteredServiceUsernameProvider` se déclare de la manière suivante en JSON dans le service registry :
```json
"usernameAttributeProvider" : {
    "@class" : "org.apereo.cas.services.PrincipalExternalIdRegisteredServiceUsernameProvider",
    "internalServiceId": "MONSERVICE"
}
```

- `internalServiceId` est l'id de service interne, autrement dit celui qu'on retrouve dans l'attribut externalid du ldap qui est de la forme `service$externalid` ;

**Cas particulier : attribut principal introuvable**

Le comportement par défaut de CAS vis-à-vis de la gestion de l’attribut principal ne convient pas dans le cadre de l'utilisation de l’externalid. En effet, si l'identifiant externe ne peut pas être retourné, alors CAS remplace le principal par le principal par défaut (l'uid), alors que c'est justement ce qu'on veut éviter. Dans le ServiceUsernameProvider implémenté, la logique est de lever une exception dans le cas ou l'externalid ne peut pas être trouvé.

**Cas particulier : service OIDC**

Pour les services OIDC la classe à utiliser est `PrincipalExternalIdRegisteredOidcServiceUsernameProvider` qui est une version legèrement modifiée de `PrincipalExternalIdRegisteredServiceUsernameProvider`. La modification est nécéssaire car pour les services OIDC on essaie de récupérer le principal à 2 moments : une fois pour le user authentifié, et une fois pour le service oidc. L'objectif est donc de ne pas chercher d'externalid lorsqu'on cherche le principal du service (`if(((AbstractWebApplicationService)context.getService()).getPrincipal() == null)`).



## Externalid en tant qu'attribut

**Nouvelle AttributeReleasePolicy**

Une nouvelle AttributeReleasePolicy a été ajoutée pour prendre en compte la génération dynamique d'un externalId en fonction du service.
La classe java en question est `ReturnExternalIDAttributeReleasePolicy` qui étend `AbstractRegisteredServiceAttributeReleasePolicy` comme les autres AttributeReleasePolicy.

Elle implémente la méthode `getAttributesInternal` qui doit retourner une `Map<String, List<Object>>` qui représente tous les attributs qui vont être release au service. Cette map associe le nom d'un attribut à la liste de ses valeurs.

**Problème :** La méthode `getAttributesInternal` est en réalité appelée plusieurs fois lorsqu'on essaie de se connecter à un serice depuis le CAS, avec en à chaque fois **en entrée les attributs du principal**. Or, la Map des attributs qu'on retourne ne modifie pas les attributs du principal et ne sera donc "utilisée" que lors du dernier appel. Ainsi, lorsqu'on fait un appel à l'API pour générer un externalid, on fait en réalité plusieurs appels car l'AttributeReleasePolicy n'a pas connaissance de l'externalid, puisque même s'il est ajouté dans le LDAP, il n'est pas ajouté dans les attributs du principal avant la prochaine connection.

**Solution :** La solution choisie pour résoudre ce problème a été d'ajouter l'externallid dans les attributs du principal la première fois qu'on le génère grâce à la ligne :
```java
context.getPrincipal().getAttributes().put(externalIdAttributeNameResponse, Collections.singletonList(externalUserId));
```
Ensuite il suffit de vérifier qu'on à pas déja l'attribut dans la Map d'entrée grâce au `if(!resolvedAttributes.containsKey(externalIdAttributeNameResponse))` pour éviter d'en regénérer un nouveau à chaque appel.

**Déclaration du service**

Un service avec une `ReturnExternalIDAttributeReleasePolicy` se déclare de la manière suivante en JSON dans le service registry :
```json
"attributeReleasePolicy": {
    "@class": "org.apereo.cas.services.ReturnExternalIDAttributeReleasePolicy",
    "internalServiceId": "MONSERVICE",
    "externalIdAttributeName": "externalIdTest",
    "notReleased": false
}
```

- `internalServiceId` est l'id de service interne, autrement dit celui qu'on retrouve dans l'attribut externalid du ldap qui est de la forme `service$externalid` ;
- `externexternalIdAttributeNamealIdAttributeName` est le nom de l'attribut qui va être retourné au final. Cela permet de surcharger le paramètre global `externalid.attribute-name-response` par service.
- `notReleased` est à utiliser si on veut uniquement ajouter l'attribut aux attributs du principal afin qu'il soit utilisé par une autre attribute release policy (via attribute-definition par exemple).

Si on veut retourner d'autres attributs en plus du externalId, il faut utiliser une `ChainingAttributeReleasePolicy` :
```json
"attributeReleasePolicy": {
    "@class": "org.apereo.cas.services.ChainingAttributeReleasePolicy",
    "policies": [ "java.util.ArrayList",
        [
            {
                "@class": "org.apereo.cas.services.ReturnAllowedAttributeReleasePolicy",
                "allowedAttributes": [ "java.util.ArrayList", [ "cn", "mail", "sn" ] ],
                "order": 0
            },
            {
                "@class" : "org.apereo.cas.services.ReturnExternalIDAttributeReleasePolicy",
                "order": 1,
                "internalServiceId": "MONSERVICE",
            }
        ]
    ]
}
```

Si on veut se servir du externalId sans le release directement via la policy, on peut faire l'`attribute-definition` suivante :
```json
"newIdMappedFromExternal": {
    "@class": "org.apereo.cas.support.saml.web.idp.profile.builders.attr.SamlIdPAttributeDefinition",
    "key": "newIdMappedFromExternal",
    "name": "newIdMappedFromExternal",
    "scoped": false,
    "encrypted": false,
    "friendlyName": "newIdMappedFromExternal",
    "attribute": "externalId",
    "persistent": false
} 
```

Avec comme définition de service :
```json
"attributeReleasePolicy": {
    "@class": "org.apereo.cas.services.ChainingAttributeReleasePolicy",
    "policies": [ "java.util.ArrayList",
        [
            {
                "@class": "org.apereo.cas.services.ReturnAllowedAttributeReleasePolicy",
                "allowedAttributes": [ "java.util.ArrayList", [ "cn", "mail", "sn", "newIdMappedFromExternal" ] ],
                "order": 0
            },
            {
                "@class" : "org.apereo.cas.services.ReturnExternalIDAttributeReleasePolicy",
                "order": 1,
                "internalServiceId": "MONSERVICE",
                "notReleased": true
            }
        ]
    ]
}
```

Il faut bien faire correspondre le `attribute` de la definition avec le nom d'attribut retourné par la policy.