
# Authentification multi-facteur avec TOTP

Pour ajouter de la MFA dans le processus d'authentification, on utilise le module gauth de CAS avec quelques modifications :
```
implementation "org.apereo.cas:cas-server-support-gauth"
implementation "org.apereo.cas:cas-server-support-gauth-redis"
```
On utilise Redis comme registry pour stocker les tokens des utilisateurs (et leurs trusted devices).

Attention, CAS dans sa documentation utilise le mot *Device* à la fois pour parler :
- Du support où est sauvegardé le token (exemple le téléphone ou est installé google authenticator) ;
- De l'appareil sur lequel on entre le code pour se connecter (la machine qu'on utilise pour accéder aux services). 

## Activation du MFA

Pour une activation globale on a les paramètres suivants :
```
cas.authn.mfa.triggers.global.global-provider-id=mfa-gauth
cas.authn.mfa.triggers.principal.global-principal-attribute-name-triggers=NomAttribut
cas.authn.mfa.triggers.principal.global-principal-attribute-value-regex=ValeurAttribut
```
Le MFA s'activera sur tous les services si l'attribut `NomAttribut` vaut `ValeurAttribut` pour l'utilisateur connecté.

Pour une activation service par service cela se fait dans les définitions de service (pas besoin de définition globale) :
```json
"multifactorPolicy" : {
	"@class" : "org.apereo.cas.services.DefaultRegisteredServiceMultifactorPolicy",
	"multifactorAuthenticationProviders" : [ "java.util.LinkedHashSet", [ "mfa-gauth" ] ],
	"principalAttributeNameTrigger" : "NomAttribut",
	"principalAttributeValueToMatch" : "ValeurAttribut"
}
```

## Gestion des devices (supports)

Si on veut pouvoir ajouter/supprimer des devices il faut activer le mutli-device :
```
cas.authn.mfa.gauth.core.multiple-device-registration-enabled=true
```
Attention cela à pour conséquence de permettre à l'utilisateur d'ajouter/supprimer des nouvelles devices avant connexion, ce qui rend le MFA inutile. Si on active ce paramètre il faut modifier les templates en conséquence pour enlever cette possibilité à l'utilisateur (et ne la laisser que dans une interface de gestion dédiée accessible après connexion).

Pour avoir une interface de gestion des devices MFA il faut activer le module `Account Management` en ajoutant cette propriété :
```
CasFeatureModule.AccountManagement.enabled=true
```

Pour voir la liste des paramètres restants (redis, chiffrement, etc..) se référer au CONFIGURATION.md

## Trusted devices

On utilise ces modules pour activer les trusted devices :
```
implementation "org.apereo.cas:cas-server-support-trusted-mfa"
implementation "org.apereo.cas:cas-server-support-trusted-mfa-redis"
```

On déclare les paramètres suivants :
```
cas.authn.mfa.trusted.core.device-registration-enabled=true
cas.authn.mfa.trusted.core.auto-assign-device-name=false
```

Si on veut truster automatiquement les devices de l'utilisateur pour un certain temps, il faudra mettre `auto-assign-device-name` à `True` et régler le temps avec le paramètre suivant (en secondes, exemple pour 7 jours) :
```
cas.authn.mfa.trusted.device-fingerprint.cookie.max-age=604800
```

Au niveau du fingerprint, CAS utilise un cookie qu'il place dans le navigateur et l'adresse IP (voir https://apereo.github.io/cas/development/mfa/Multifactor-TrustedDevice-Authentication-DeviceFingerprint.html). Cela revient à activer le paramètre ci-dessous :
```
cas.authn.mfa.trusted.device-fingerprint.cookie.enabled=true
```

## Modification : Double validation de code

De base CAS intègre un mécanisme qui sauvegarde les codes utilisés pour éviter qu'ils soient réutilisés pendant leur période de validité. Ce mécanisme pose problème lors de l'enregistrement de la device puisque le code sera demandé 2 fois (une fois pour la validation de l'enregistrement puis une fois pour l'accès au service), ce qui force l'utilisateur à attendre qu'un nouveau code soit régénéré. 

Pour résoudre ce problème on va modifier l'action d'enregistrement d'une nouvelle device (`GoogleAuthenticatorSaveRegistrationAction.java`) afin de ne pas ajouter le code dans le registry. Il suffit de commenter les lignes suivantes :
```java
val googleAuthenticatorToken = new GoogleAuthenticatorToken(token, account.getUsername());
validator.getTokenRepository().store(googleAuthenticatorToken);
```
Le comportement reste inchangé pour les codes autres que ceux utiliser pour valider l'enregistrement d'une nouvelle device.