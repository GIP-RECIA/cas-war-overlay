# Logout Partiel

## Principe

Lorsque les attributs LDAP d'un utilisateur change, on peut avoir envie de rafraîchir sa session CAS et ses sessions applicatives de manière transparentre. C'est notamment le cas lors du changement d'établissement.

L'idée est de lancer l'ensemble des requêtes de SLO depuis le CAS mais sans invalider le TGT. On va ensuite rafrâichir les attributs LDAP de l'utilisateur et les mettre à jour dans le TGT. Comme l'utilisateur est toujours connecté au CAS, il pourra obtenir de nouvelles sessions applicatives sans avoir à se reconnecter, mais avec ses nouveaux attributs.

Le rafraichissement des attributs se fait via un attribute repository dédié avec un filtre LDAP basé sur le principal id.

Le point d'entrée pour déclencher ce nouveau logout est le même que pour un logout classique `/cas/logout` mais avec un paramètre d'url supplémentaire (configurable, par exemple `partialLogout`) qu'il faut mettre à `true`.

## Fonctionnement

Deux morceaux de code ont été rajoutés pour faire fonctionner le logout partiel :

- Dans le `DefaultSingleLogoutRequestExecutor` pour empêcher la suppression du TGT et mettre à jour ses attributs
- Dans le `TerminateSessionAction` pour empêcher la suppression du cookie TGC

## Paramètres

Pour activer le logout partiel il faut à minima définir les properties suivantes :

- `cas.custom.properties.partial-logout.parameter-name` est le nom du paramètre URL pour déclencher le logout partiel
- `cas.custom.properties.partial-logout.attribute-id` est le principal id qui sera utilisé pour le filtre de recherche pour le rafraîchissement des attributs
- `cas.custom.properties.partial-logout.attribute-repository` est le nom de l'attribute repository dédié au rafraîchissement des attributs

Il faut donc également définir un attribute repository dédié avec le bon nom et le bon filtre, comme par exemple :
```
cas.authn.attribute-repository.ldap[X].id: attributeUpdate
cas.authn.attribute-repository.ldap[X].state: STANDBY 
cas.authn.attribute-repository.ldap[X].search-filter: uid={0}
cas.authn.attribute-repository.ldap[X].attributes.Y: Y
...
```