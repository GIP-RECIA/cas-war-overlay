# Protocole OIDC

## Identity Provider

Le serveur CAS est configuré pour pouvoir agir en tant qu'IDP via le protocole OIDC. Concrètement, cela signifie qu'un client OIDC peut communiquer avec le serveur CAS et lui déléguer son authentification au travers du protocole OIDC.

Le protocole OIDC est basé sur le protocole OAuth2.0 qui est donc aussi implémenté et fonctionnel dans CAS. Ce document a pour but de détailler l'utilisation du protocole OIDC dans le cadre de la mise en place avec un serveur CAS. Pour avoir plus d'infos sur la spec OIDC avec le flot qu'on utilisera on peut se référer au document suivant : [https://openid.net/specs/openid-connect-basic-1_0.html](https://openid.net/specs/openid-connect-basic-1_0.html)

### 1. Modes de communications supportés par CAS

Le protocole OIDC permet de transmettre les tokens au client de plusieurs manières en fonction des cas d'usage (coté CAS cela correspond au paramètre `supportedResponseTypes`). Actuellement, CAS gère 3 modes de transmissions différents (voir [https://apereo.github.io/cas/7.0.x/authentication/OIDC-Authentication.html](https://apereo.github.io/cas/7.0.x/authentication/OIDC-Authentication.html) et [https://apereo.github.io/cas/7.0.x/authentication/OAuth-Authentication.html](https://apereo.github.io/cas/7.0.x/authentication/OAuth-Authentication.html)) :

**Authorization Code Flow (code)**
Sépare les étapes d'authentification et d'obtention de jetons en deux :
1. L'application redirige l'utilisateur vers le l'IDP pour s'authentifier, et reçoit un code en retour.
2. L'application échange ensuite ce code contre les tokens.

Le client doit disposer d'un secret pour réaliser cette étape, ce qui peut poser problème pour les clients publiques quand le secret ne peut pas être gardé secret. Pour pallier à ce problème on peut utiliser **PKCE (Proof Key Code Exchange)**, qui consiste à créer un secret au début du flot un secret échangé avec le serveur qui sera réutilisé plus tard pour obtenir les jetons. De cette manière même si le code est intercepté comme le secret change à chaque fois une personne tierce ne pourra pas récupérer les jetons. C'est le flot qu'on devrait utiliser dans notre cas (avec ou sans PKCE).

**Implicit Flow (token, id_token, id_token token)**

L'utilisateur est redirigé vers le serveur d'autorisation, qui renvoie directement au client l'Access Token, l'ID Token, ou les deux. Ici il n'y a pas d'étape où le client échange un code contre les jetons à l'inverse du Authorization Code Flow. Ce flux est moins sécurisé et ne devrait pas être utilisé dans notre cas.

**Device Authorization Flow (device_code)**

Sépare les étapes d'authentification et d'obtention de jetons en deux :
1. L'appareil demande un Device Code à l'IDP et affiche à l'utilisateur un lien vers lequel il doit se rendre 
2. L'utilisateur s'authentifie via le lien fourni sur un appareil ayant un navigateur. Pendant ce temps, l'appareil demande régulièrement l'accès au serveur pour savoir si l'utilisateur a validé l'authentification. Une fois l'utilisateur authentifié, le serveur retourne les tokens.

Ce flux est conçu pour les appareils qui n'ont pas de navigateur ou de capacité d'entrée utilisateur, ce qui ne devrait pas être utile dans notre cas.

**Important** : Pour CAS, les `supportedResponseTypes` sont utilisés lors de la demande d’autorisation initiale (sur le `authorization_endpoint`). Pour ce qui est du `token_endpoint` (là où on obtient les tokens), il ne faut pas oublier de spécifier le `supportedGrantTypes` parmi :
- `authorization_code` pour le Authorization Code Flow
- `password` pour le Implicit Flow
- `device_code` pour le Device Authorization Flow
- `refresh_token` pour renouveller un AT avec un RT

Ces deux paramètres sont à préciser par service dans les définitions de service.

### 2. Flot de login détaillé avec Authorization Code Flow sans PKCE

Pour une demande de SSO avec le protocole OIDC les requêtes sont les suivantes :

1. Le client récupère les métadonnées du serveur CAS exposées sur l'endpoint `/oidc/.well-known` ;
2. Le client fait une requête sur le `authorization_endpoint` avec comme paramètres le `response_type`, la `redirect_uri`  et le `scope` ;
3. Le serveur CAS identifie le service grâce à la `redirect_uri` et vérifie qu'il est autorisé à faire de l'OIDC. Si c'est le cas l'utilisateur est redirigé sur la page de connexion. L'utilisateur entre alors ses identifiants et clique sur connexion ce déclenche une requête POST ;
4. Le serveur CAS valide les identifiants et génère un TGT et un ST (comme dans le protocole CAS classique). Il répond avec une redirection sur l'endpoint `callbackAuthorize` avec notamment le ST en paramètre ;
5. Le service fait valider le ST comme dans un protocole CAS classique avec une requête GET, et reçoit comme réponse une nouvelle redirection du serveur CAS. Cette redirection pointe de nouveau sur le `authorization_endpoint` avec un POST, mais comme on a le TGT cette fois ci le serveur CAS va agir différement ;
6. Le client fait donc un GET sur cette URL et le serveur CAS lui répond avec une redirction `token_endpoint` pour faire valider un OC token qui se trouve dans l'url sous le paramètre `code` ;
7. Le client fait un GET sur l'url de validation de l'OC Token et le serveur CAS lui répond avec les tokens : un access token (AT), un id token, et potentiellement un refresh token (RT) si le service est autorisé à en recevoir un.

**Attention :** si le response_type est `code` (donc dans le cadre d'une authentification avec OC), les claims (attributs) **ne sont pas envoyés** avec l'id token. La seule info utilisateur présente est le `sub` qui correspond au principal. Si le client a besoin d'obtenir les attributs utilisateur, il peut faire une requête sur l'endpoint  `userinfo_endpoint` qui lui retournera tous les claims dans un champ `attributes`.

Il faut aussi noter que le serveur CAS peut répondre de plusieurs manières en fonction du `responseMode` ([https://apereo.github.io/cas/development/authentication/OAuth-Authentication-Clients-ResponseMode.html](https://apereo.github.io/cas/development/authentication/OAuth-Authentication-Clients-ResponseMode.html)), même si de base il est configuré pour répondre en mode `Query` avec des redirections.

### 3. Exemple concret de login

**Demande initiale de connexion :**
- Requête : GET sur `https://URL_CAS/cas/oidc/oidcAuthorize?response_type=code&redirect_uri=https://client-oidc/test&client_id=client2&scope=openid+profile+testScope`
- Réponse : Code 302 sur l'url suivante
- Set-cookie : `DISSESSIONOauthOidcServerSupport` et `XSRF-TOKEN`

**Affichage de la page de connexion :**
- Requête : GET sur `https://URL_CAS/cas/login?service=https://URL_CAS/cas/oauth2.0/callbackAuthorize?client_id=client2&scope=openid+profile+testScope&redirect_uri=https%253A%252F%252Fclient-oidc%252Ftest&response_type=code&client_name=CasOAuthClient`
- Réponse : 200 avec la page de login du CAS

**Envoi des identifiants :**
- Requête : POST sur `https://URL_CAS/cas/login?service=https://URL_CAS/cas/oauth2.0/callbackAuthorize?client_id=client2&scope=openid+profile+testScope&redirect_uri=https%253A%252F%252Fclient-oidc%252Ftest&response_type=code&client_name=CasOAuthClient`
- Réponse : 302 sur l'url suivante
- Set-cookie : `TGC`

**Validation du ST :**
- Requête : GET sur `https://URL_CAS/cas/oauth2.0/callbackAuthorize?client_id=client2&scope=openid%20profile%20testScope&redirect_uri=https://client-oidc/test&response_type=code&client_name=CasOAuthClient&ticket=ST-3-zh2vOQPGwsw-CiCxqZUikpauwhI-cas-test1`
- Réponse : 302 sur l'url suivante

**Obtention de l'OC token :**
- Requête : GET sur `https://URL_CAS/cas/oidc/oidcAuthorize?response_type=code&redirect_uri=https://client-oidc/test&client_id=client2&scope=openid+profile+testScope`
- Réponse : 302 sur l'url suivante

**Obtention des AC, RT et ID Token :**
- Requête : POST sur `https://URL_CAS/cas/oidc/token?client_id=client2&client_secret=secret2&redirect_uri=https://client-oidc/test&grant_type=authorization_code&code=OC-XX&scope=openid+profile+testScope`
- Réponse : 200 avec `{"access_token":"AT-XXX","id_token":"id.tok.en","refresh_token":"RT-YY","token_type":"Bearer","expires_in":X,"scope":"openid testScope profile"}`

En décodant le champ id_token on obtient ce genre de JSON (avec donc seulement le `sub` pour identifier l'utilisateur):
```json
({'alg': 'RS256', 'typ': 'JWT', 'kid': 'XXX'}, {'jti': 'YYY', 'sid': 'ZZZ', 'iss': 'https://URL_CAS/cas/oidc', 'aud': 'client2', 'exp': 1728510816, 'iat': 1728482016, 'nbf': 1728481716, 'sub': 'X', 'amr': ['LdapAuthenticationHandler'], 'client_id': 'client2', 'auth_time': 1728482016, 'at_hash': 'III', 'txn': 'LLL'})
``` 

**Récupération des infos utilisateur :**
- Requête : POST sur `https://URL_CAS/cas/oidc/oidcProfile` avec comme header `Authorization: Bearer AT-XXX`
- Réponse : 200 avec `{"sub":"X","service":"https://client-oidc/test","auth_time":1728482016,"attributes":{"uid":["X"],"mail":["Y"], ...},"id":"Z","client_id":"client2"}`

### 4. Attribute release (scopes et claims)

Dans le protocole OIDC, les attributs utilisateurs ne sont pas directement renvoyés au client lors de l'authentification (comme vu dans le Authorization Code Flow) afin de respecter la spécification OIDC. Les attributs prennent la forme de claims qui sont regroupés dans des scopes :
- Les scopes sont donc des ensembles de claims. Un service demande un scope mais jamais directement des claims. Le protocole OIDC contient un ensemble de scopes de base (openud, profile, email, adress, phone, offline_access) qui sans modification dans la configuration du serveur CAS seront les seuls scopes qu'un service pourra demander. Au minimum **le scope openid doit être présent** dans chaque requête OIDC.
- Claims : Ce sont les attributs utilisateurs (sub, name, email, etc..) contenus dans le JWT (ID Token) renvoyé par le CAS. De la même manière que pour les scopes, la spécification OIDC définit un ensemble de claims qui seront les seuls utilisables sans modification dans le serveur CAS. Pour voir la liste des claims par défaut on peut regarder la spec OIDC ici : [https://openid.net/specs/openid-connect-basic-1_0.html#StandardClaims](https://openid.net/specs/openid-connect-basic-1_0.html#StandardClaims)

Le principal problème de ce système si on le garde tel quel est qu'il faut utiliser les claims par défaut pour transmettre des infos utilisateurs. Or, on peut avoir besoin de transmettre des attributs qui ne correspondent pas du tout au nom et à la fonction des claims par défaut. Pour corriger cela, CAS propose deux solutions :

**Mapping de claims** : on peut mapper un attribut retourné par le LDAP (ex: displayName) sur un claim par défaut d'OIDC (ex: nickname). Cela se fait facilement avec une seule ligne de config : 
```properties
cas.authn.oidc.core.claims-map.nickname=displayName
```

**Custom scopes** : si on a vraiment besoin d'ajouter un nouveau claim, on peut passer par des custom scopes. Pour cela il faut faire un peu plus de configuration. Tout d'abord on déclare le nouveau scope et le nom des claims qu'il va retourner :
```properties
cas.authn.oidc.core.user-defined-scopes.testScope=uid,isMemberOf
```
Ensuite on déclare le nouveau scope parmi les scopes existants :
```properties
cas.authn.oidc.discovery.scopes=openid,profile,...,testScope
```
Ensuite on déclare les nouveaux claims parmi les claims existants :
```properties
cas.authn.oidc.discovery.claims=sub,name,...,uid,isMemberOf
```
Ensuite on pourra utiliser ce scope dans les requêtes OIDC comme on aurait utilisé le scope openid ou profile.

### 5.Utilisation des tokens

**Access Token**

C’est un jeton opaque (pas nécessairement au format JWT) qui permet de prouver que le client a la permission d’accéder à certaines ressources au nom de l'utilisateur. Concrètement, le client envoie l'AT lors de chaque requête sur une API protégée. L'API qui reçoit l'AT le vérifie (soit en le validant elle-même si c’est un JWT, soit en le vérifiant auprès du CAS sur l'endpoint `introspect` sinon).  L'AT n'est pas destiné à avoir une durée de vie importante. CAS enverra forcément un AT à la fin du flot de login qu'on soit en protocole OIDC ou OAuth2.0.

**ID Token**

C'est un jeton toujours au format JWT qui contient des informations sur l'utilisateur (les claims) signé par le serveur d'autorisation pour garantir son authenticité et son intégrité. Il permet au client de vérifier qui est l'utilisateur mais il n'est pas destiné à être envoyé à des API pour accéder à des ressources. Il est destiné à avoir une durée de vie courte. CAS n'enverra l'ID Token que pour le protocole OIDC.

**Refresh Token**

C’est un jeton opaque (pas nécessairement au format JWT) qui permet d'obtenir des nouveaux access token sans avoir besoin de se ré-authentifier (une sorte de rememberme). Lorsqu'un AT expire, le client envoie le RT au CAS sur l'endpoint `token` pour obtenir un nouveau AT. Le RT a donc une durée de vie beaucoup plus longue que les autres tokens. Pour que CAS envoie le RT il faut bien préciser dans la déclaration du service deux élements :
- `generateRefreshToken` à `true`
- `refresh_token` dans les `supportedGrantTypes`.

A noter qu'on peut faire en sorte que CAS regénère un nouveau RT en même temps que l'AT avec le paramètre `renewRefreshToken` à `true`.

### 6. SLO

Le serveur CAS gère le SLO des services qui sont connectés via le protocole OIDC. De la même manière qu'avec le protocole CAS classique, une simple requête est transmise aux services en question lorsque l'utilisateur se déconnecte du CAS. La requête est un POST sur la route de logout déclarée par le service avec un paramètre `logout_token` qui contient le informations ci-dessous encodées sous la forme d'un JWT :
```json
{
  "iss": "https://URL_CAS/cas/oidc",
  "sub": "X",
  "aud": "client2",
  "iat": 123456789,
  "jti": "XX",
  "events": {
    "http://schemas.openid.net/event/backchannel-logout": {}
  },
  "sid": "YY"
}
```

L'important pour le service est le `sub` car c'est grâce à cet attribut qu'il sait quel utilisateur déconnecter.

### 7. Configuration

Pour activer le protocole OIDC il suffit d'ajouter dans le `build.gradle` la ligne suivante :
```gradle
implementation "org.apereo.cas:cas-server-support-oidc"
```
A noter qu'à partir du moment où on inclut cette ligne il n'y a plus besoin d'inclure le protocole OAuth car il sera inclus avec automatiquement.

Ensuite il faut configurer correctement le fichier de properties, on utilisera obligatoirement :
- `cas.authn.oidc.core.issuer` pour définir l'id du serveur CAS ;
- `cas.authn.oidc.jwks.file-system.jwks-file` pour stocker le fichier jwks au bon endroit (les différentes instances du CAS doivent partager cet endroit) ;
- `cas.authn.oidc.id-token.include-id-token-claims` à `false` pour bien respecter la spec OIDC.
 
 Voir le PROPERTIES.md pour avoir la liste des properties utiles à régler.

Pour les définitions de service, il faut aller voir https://apereo.github.io/cas/7.0.x/authentication/OIDC-Authentication-Clients.html et https://apereo.github.io/cas/7.0.x/authentication/OAuth-Authentication-Clients.html. Un exemple minimal de définition de service est donné ci-dessous :
```json
{  
    "@class" : "org.apereo.cas.services.OidcRegisteredService",
    "clientId": "id-client",
    "clientSecret": "secret-client",
    "serviceId" : "SERVICE_REGEX",
    "bypassApprovalPrompt": true,
    "name" : "OIDC",
    "id" : 123456789,
    "generateRefreshToken": "true",
    "scopes": [ "java.util.HashSet", [ "openid", "profile", "testScope" ] ],
    "supportedGrantTypes": [ "java.util.HashSet", [ "authorization_code", "refresh_token" ] ],
    "supportedResponseTypes": [ "java.util.HashSet", [ "code" ] ]
}
```

A noter que `"bypassApprovalPrompt": true` est important si on ne veut pas que l'utilisateur ait une fenêtre supplémentiare le forçant à accepter que ses informations soient transmises au service à chaque connexion.

## Service Provider

Pour l'instant le serveur CAS n'agit pas en tant que SP via le protocole OIDC. Agir en tant que SP signifierait que le serveur CAS déléguerait son authentification à un IDP OIDC.
