# Gestion des attributs 

Dans CAS les attributs peuvent être manipulés à trois niveaux différents : lors de la récupération depuis la source, au moment de leur définition, ou bien au moment de leur release aux services.

## 1- Récupération 

CAS peut être configuré de sorte à aller chercher les attributs dans une source qui n'est pas la source utilisée pour l'authentification. C'est ce mécanisme qui est utilisé dans le cas d'une délégation d'authentification si l’identity provider ne retourne pas tous les attributs dont les différents services auront besoin. Pour déclarer un attribute repository on commence par lui donner un ID :
```
cas.authn.attribute-repository.ldap[0].id: ldap
```

Ensuite, il faut spécifier le filtre de recherche par rapport au principal retourné par l'identity provider :
```
cas.authn.attribute-repository.ldap[0].search-filter: uid={0}
```

Enfin, comme pour une authentification classique on précise la liste des attributs qui seront disponibles pour le CAS :
```
cas.authn.attribute-repository.ldap[0].attributes.attributA: attributA
cas.authn.attribute-repository.ldap[0].attributes.attributB: attributB
```

Une fois la source configurée il suffit de l'activer et de préciser qu'on se servira du principal retourné par l’identity provider :
```
cas.person-directory.active-attribute-repository-ids: ldap
cas.person-directory.use-existing-principal-id: true
```

## 2- Définition

CAS propose un système de définition d'attributs afin de pouvoir modifier différentes caractéristiques des attributs : leur nom, leur valeur, ou bien d'ajouter de la métadata qui serait utile à d'autres protocoles que le protocole CAS (ex : `friendlyName`).

Le fichier qui recense toutes les définitions d'attribut est un fichier JSON qui se présente de la manière suivante :

```json
{
  "@class": "java.util.TreeMap",
  "uid": {
    "@class": "org.apereo.cas.support.saml.web.idp.profile.builders.attr.SamlIdPAttributeDefinition",
    "key": "uid",
    "name": "uid",
    "scoped": false,
    "encrypted": false,
    "friendlyName": "uid",
    "attribute": "uid",
    "persistent": false
  }
}
```
- `key` et `name` sont le nom de l'attribut qui sera utilisé dans les définitions de services, etc.. (autrement dit le nom en sortie de la définition d'attribut) ;
- `friendlyName` est un décorateur supplémentaire utilisé dans le protocole SAML ;
- `attribute` est le nom de l'attribut source (celui de base dans l'attribute repository). Si c'est le même que la key on peut ne pas le préciser.

Pour que le fichier soit pris en compte il suffit de donner son chemin dans les properties :
```
cas.authn.attribute-repository.attribute-definition-store.json.location=file:/chemin/vers/fichier.json
```

Si on veut modifier la valeur d’un attribut dynamiquement, le plus simple est de passer par un script groovy externe. Pour pouvoir utiliser un script groovy on ajoute la dépendance permettant de compiler le script :
```
implementation "org.apereo.cas:cas-server-core-scripting"
```

Ensuite, dans la définition d'attribut on précise le chemin du script qui sera utilisé :
```
"script": "file:/chemin/vers/script.groovy"
```

Le script doit retourner un tableau de valeurs (si on a un seul élément on retourne un tableau d'un élément). Ci-dessous est donné un exemple de script qui garde la valeur de l’attribut jusqu'à un certain délimiteur :

```groovy
def run(Object[] args) {
    def (attributeName,attributeValues,logger,registeredService,attributes) = args
    return [attributeValues[0].split('\\$')[0]]
}
```

## 3- Release

Une fois les attributs récupérés et définis il faut les donner aux différents services. Pour cela on utilise le système de release d'attribut : il va permettre de sélectionner les attributs qu'on veut renvoyer au service en fonction des définitions de service. 

On peut si besoin faire des modifications sur les attributs à ce niveau-là, la différence étant qu'elles ne seront pas globales à l'inverse du système de définition d'attribut, mais spécifiques pour un service donné. 

La logique pour cette partie se situe dans la `attributeReleasePolicy` des définition de service, comme celui donné en exemple ci-dessous : 

```json
"attributeReleasePolicy" : {
    "@class" : "org.apereo.cas.services.ReturnAllowedAttributeReleasePolicy",
    "allowedAttributes" : [ "java.util.ArrayList", [ "mail", "displayName" ] ]
}
```

La logique mise en place est de ne donner aucun attribut par défaut aux services (hormis le principal) et de donner les attributs définition de service par définition de service (grâce à la policy `ReturnAllowedAttributeReleasePolicy`).