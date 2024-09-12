# Protocole SAML2

## Identity Provider

Le serveur CAS est configuré pour pouvoir agir en tant qu'IDP via le protocole SAML. Concrètement, cela signifie qu'un client SAML (SP) peut communiquer avec le serveur CAS et lui déléguer son authentification au travers du protocole SAML.

Le protocole SAML contient des échanges de messages complexes via différents mécanismes de transmission. Le flot peut être initié par le client (SP initiated) ou par le serveur (IDP initiated). Ce document a pour but de détailler l'utilisation du protocole SAML dans le cadre de la mise en place avec un serveur CAS.

### 1. Flot de login

Pour une demande de SSO avec le protocole SAML les échanges de messages sont les suivants :

1. Le SP récupère les métadonnées de l'IDP et y cherche l'endpoint `<SingleSignOnService>`
2. Requête de type `SAMLRequest` du SP vers l'IDP sur l'endpoint SSO 
3. L'IDP récupère les métadonnées du SP et y cherche l'endpoint `<AssertionConsumerService>`
4. Requête de type `Response` de l'IDP vers le SP sur l'endpoint ACS

La dernière requête que reçoit le SP contient les informations nécessaires pour établir une session applicative : authentification réussie ou non, attributs retournés par le CAS, etc..

### 2. Flot de logout

Pour une demande de SLO avec le protocole SAML les échanges de messages sont les suivants :

1. Le SP récupère dans les métadonnées de l'IDP l'endpoint `<SingleLogoutService>`
2. Requête `LogoutRequest` du SP vers l'IDP sur l'endpoint SLO 
3. L'IDP récupère dans les métadonnées du SP l'endpoint `<SingleLogoutService>` (facultatif)
4. Requête `LogoutResponse` de l'IDP vers le SP sur l'endpoint SLS (facultatif)

La dernière requête est facultative dans la mesure ou on peut renvoyer une `LogoutRequest` ou non.

### 3. Requêtes 

Toutes les requêtes contiennent un xml avec au moins les trois attributs suivants :
- `Destination` qui doit correspondre à l'endpoint qu'on va requêter
- `ID` pour identifier de manière unique cette requête
- Si c'est une réponse, `InResponseTo` pour identifier à quelle 

Toutes les requêtes peuvent aussi contenir un paramètre `RelayState` : il indique ou le client doit revenir une fois que le flot (SSO ou SLO) est terminé. On peut retrouver des exemples du XML des requêtes plus bas dans la partie "Exemple complet d'un flot de login/logout".

### 4. Métadonnées

Les métadonnées sont des fichiers xml échangés entre l'IDP et le SP. Elles qui contiennent toutes les informations nécessaires au bon déroulement du protocole : où et comment envoyer les requêtes, à quoi doivent ressembler les requêtes, quelles informations vont être transmises par les requêtes, etc...

La doc coté CAS est trouvable ici : [https://apereo.github.io/cas/7.1.x/installation/Configuring-SAML2-DynamicMetadata.html](https://apereo.github.io/cas/7.1.x/installation/Configuring-SAML2-DynamicMetadata.html)

Les métadonnées peuvent être chargées de 2 manières différentes à la fois par le SP et l'IDP :
- Soit elles sont exposées sur un endpoint en particulier (souvent `/metadata`) et une simple requête `GET` suffit pour les récupérer ;
- Soit elles ne sont pas exposées : dans ce cas il faut que les parties échangent entre elles leurs métadonnées une seule fois avant la première communication pour les sauvegarder en local. Dans ce cas il faut faire attention au paramètre `cas.authn.saml-idp.metadata.file-system.location` du serveur CAS car il ira chercher automatiquement la métadata des services en fonction de leur nom.
- Dans le second cas, la doc de cas dit précisément : For example, if global metadata artifacts are managed on disk at `/etc/cas/config/saml/metadata`, then metadata applicable to a service definition whose name is configured as `SampleService` with an id of `1000` are expected to be found at `/etc/cas/config/saml/metadata/SampleService-1000`).

A noter qu'on peut très bien mélanger les deux procédés : l'IDP peut exposer ses métadonnées sur un endpoint alors que le SP ne les expose pas mais lui donne au préalable.

On retrouve une description exhaustive des métadonnées avec des exemples concrets dans ce pdf : [https://docs.oasis-open.org/security/saml/v2.0/saml-metadata-2.0-os.pdf](https://docs.oasis-open.org/security/saml/v2.0/saml-metadata-2.0-os.pdf). On va ici se concentrer sur les métadonnées utiles pour la mise en place du SAML avec un serveur CAS.

IDP comme SP ont le tag racine `<EntityDescriptor>` qui contient un attribut `entityID`. Celui-ci est l'identifiant unique (une URL) permettant d'identifier l'entité (l'IDP ou le SP). Souvent, on met l'URL sur laquelle est exposée la métadata de l'entité.

**Coté IDP :**

- Tag : `<IDPSSODescriptor>`
- Attributs :`WantAuthnRequestsSigned` : Indique si les `AuthnRequest` reçues par l'IDP doivent être signées. Valeur par défaut `false`
- Enfants :
	- Un ou des `<KeyDescriptor>` de type `KeyDescriptorType` pour le ou les certificats de l'IDP.
	- `<SingleSignOnService>` de type `EndpointType`. C'est l'endpoint ou vont arriver les requêtes de login du SP.
	- `<SingleLogoutService>` de type `EndpointType`. C'est l'endpoint ou vont arriver les requêtes de logout du SP.

**Coté SP :** 

- Tag : `<SPSSODescriptor>`
- Attributs : 
	- `AuthnRequestsSigned` : Indique si les `AuthnRequest` envoyées par le SP seront signées. Valeur par défault `false`
	- `WantAssertionsSigned` : Indique si les `Assertion` reçues par le SP doivent être signées. Valeur par défaut `false`
- Enfants :
	- Un ou des `<KeyDescriptor>` de type `KeyDescriptorType` pour le ou les certificats du SP.
	- `<AssertionConsumerService>` de type `EndpointType`. C'est l'endpoint ou vont arriver les réponses de l'IDP aux requêtes de login.
	- `<SingleLogoutService>` de type `EndpointType`. C'est l'endpoint ou vont arriver les réponses de l'IDP aux requêtes de logout.

**Types :**

Le type `KeyDescriptorType` définit un attribut et plusieurs enfants  :
- L'attribut `use` qui peut avoir deux valeurs : `signing` si le certificat définit plus bas est celui utilisé pour signer les requêtes, `encryption` si c'est celui utilisé chiffrer les requêtes.
- Les enfants `<KeyInfo> <X509Data> <X509Certificate>` dont la valeur finale est le certificat en question.

Le type `EndpointType` définit deux attributs :
- `Binding` : Le mécanisme utilisé pour transmettre les messages SAML.
- `Location` : L'URL sur laquelle envoyer la requête.

### 5. Bindings

A chaque endpoint est associé un `Binding`, qui représente le mécanisme de transmission qui va être utilisé pour transmettre les messages. Il existe 4 bindings dans le protocole SAML supportés par CAS (en fonction des endpoints) : 
- HTTP-POST
- HTTP-Redirect
- HTTP-POST-SimpleSign (pas utilisé pour l'instant)
- SOAP (pas utilisé pour l'instant)

Pour le SSO dans le cadre du web, on utilise en général les bindings HTTP-POST et HTTP-Redirect. A noter que le choix ds bindings est réalisé par chaque partie de manière indépendante : le SP peut très bien choisir d'envoyer sa requête avec un HTTP-Redirect alors que l'IDP va choisir d'envoyer sa réponse avec un HTTP-POST. Le tableau ci-dessous compare les deux bindings :
|  | Binding HTTP-POST | Binding HTTP-Redirect |
|--|--|--|
|**Méthode de transmission** | Message envoyé dans le corps d'une requête POST | Message envoyé dans l’URL via une redirection HTTP |
**Encodage** |Base64 sans compression | Compression DEFLATE + Base64 |
**Taille des messages** |Pas de limite stricte | Limité par la longueur maximale de l'URL |
**Visibilité des messages** | Message non visible dans l'URL | Message visible dans l'URL |
**Sécurité** | Généralement plus sécurisé pour des messages sensibles | Doit souvent être signé pour garantir l'intégrité et éviter les injections
**Utilisation typique** | Réponses SAML (assertions) | Requêtes SAML (AuthnRequest)

Chaque entité donne la liste des bindings qu'il supporte pour chaque endpoint. Par exemple le serveur CAS supporte les bindings suivants : 
```xml
<SingleSignOnService Binding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST" Location="https://cas.test.recia.dev/cas/idp/profile/SAML2/POST/SSO"/>
<SingleSignOnService Binding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST-SimpleSign" Location="https://cas.test.recia.dev/cas/idp/profile/SAML2/POST-SimpleSign/SSO"/>
<SingleSignOnService Binding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-Redirect" Location="https://cas.test.recia.dev/cas/idp/profile/SAML2/Redirect/SSO"/>
<SingleSignOnService Binding="urn:oasis:names:tc:SAML:2.0:bindings:SOAP" Location="https://cas.test.recia.dev/cas/idp/profile/SAML2/SOAP/ECP"/>
<SingleLogoutService Binding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST" Location="https://cas.test.recia.dev/cas/idp/profile/SAML2/POST/SLO"/>
<SingleLogoutService Binding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-Redirect" Location="https://cas.test.recia.dev/cas/idp/profile/SAML2/Redirect/SLO"/>
```

### 6. Exemple complet d'un flot de login/logout

**Première requête du SP vers l'IDP sur l'endpoint SSO**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<samlp:AuthnRequest
	xmlns:samlp="urn:oasis:names:tc:SAML:2.0:protocol"
	xmlns:saml="urn:oasis:names:tc:SAML:2.0:assertion" AssertionConsumerServiceURL="https://URL_SP/ENDPOINT_ACS" Destination="https://cas.test.recia.dev/cas/idp/profile/SAML2/Redirect/SSO" ID="ONELOGIN_4f0dca526e26a3c82e9423f65eb9f516e43585ec" IssueInstant="2024-09-12T08:18:47Z" ProtocolBinding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST" Version="2.0">
	<saml:Issuer>https://URL_SP</saml:Issuer>
	<samlp:NameIDPolicy AllowCreate="true" Format="urn:oasis:names:tc:SAML:1.1:nameid-format:unspecified"/>
	<samlp:RequestedAuthnContext Comparison="exact">
		<saml:AuthnContextClassRef>urn:oasis:names:tc:SAML:2.0:ac:classes:PasswordProtectedTransport</saml:AuthnContextClassRef>
	</samlp:RequestedAuthnContext>
</samlp:AuthnRequest>
```
On remarque qu'on donne à la fois la destination `https://cas.test.recia.dev/cas/idp/profile/SAML2/Redirect/SSO` mais aussi le binding `ProtocolBinding` qu'on va utiliser pour nous répondre. Ici cette requête est faite avec le binding HTTP-Redirect mais la réponse sera un HTTP-POST.

**Réponse de l'IDP vers le SP sur l'endpoint ACS**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<saml2p:Response xmlns:saml2p="urn:oasis:names:tc:SAML:2.0:protocol" Destination="https://URL_SP/ENDPOINT_ACS" ID="_3023431026434980864" InResponseTo="ONELOGIN_4f0dca526e26a3c82e9423f65eb9f516e43585ec" IssueInstant="2024-09-12T08:20:25.272Z" Version="2.0">
    <saml2:Issuer xmlns:saml2="urn:oasis:names:tc:SAML:2.0:assertion" Format="urn:oasis:names:tc:SAML:2.0:nameid-format:entity">https://cas.test.recia.dev/cas/idp/metadata</saml2:Issuer>
    <saml2p:Status>
        <saml2p:StatusCode Value="urn:oasis:names:tc:SAML:2.0:status:Success"/>
    </saml2p:Status>
    <saml2:Assertion xmlns:saml2="urn:oasis:names:tc:SAML:2.0:assertion" ID="_71293524374549504" IssueInstant="2024-09-12T08:20:25.245Z" Version="2.0">
        <saml2:Issuer>https://cas.test.recia.dev/cas/idp/metadata</saml2:Issuer>
        <saml2:Subject>
            <saml2:NameID Format="urn:oasis:names:tc:SAML:1.1:nameid-format:unspecified" NameQualifier="https://cas.test.recia.dev/cas/idp/metadata" SPNameQualifier="https://URL_SP">F00000X</saml2:NameID>
            <saml2:SubjectConfirmation Method="urn:oasis:names:tc:SAML:2.0:cm:bearer">
                <saml2:SubjectConfirmationData Address="X.X.X.X" InResponseTo="ONELOGIN_4f0dca526e26a3c82e9423f65eb9f516e43585ec" NotOnOrAfter="2024-09-12T08:20:55.246Z" Recipient="https://URL_SP/ENDPOINT_ACS"/>
            </saml2:SubjectConfirmation>
        </saml2:Subject>
        <saml2:Conditions NotBefore="2024-09-12T08:19:55.256Z" NotOnOrAfter="2024-09-12T08:20:55.256Z">
            <saml2:AudienceRestriction>
                <saml2:Audience>https://URL_SP</saml2:Audience>
            </saml2:AudienceRestriction>
        </saml2:Conditions>
        <saml2:AuthnStatement AuthnInstant="2024-09-12T08:20:24.373Z" SessionIndex="ST-1-********RDZ-604-cas-test1" SessionNotOnOrAfter="2024-09-12T09:20:55.192Z">
            <saml2:SubjectLocality Address="X.X.X.X"/>
            <saml2:AuthnContext>
                <saml2:AuthnContextClassRef>urn:oasis:names:tc:SAML:2.0:ac:classes:PasswordProtectedTransport</saml2:AuthnContextClassRef>
                <saml2:AuthenticatingAuthority>https://cas.test.recia.dev/cas/idp/metadata</saml2:AuthenticatingAuthority>
            </saml2:AuthnContext>
        </saml2:AuthnStatement>
        <saml2:AttributeStatement>
            <saml2:Attribute FriendlyName="mail" Name="urn:oid:0.9.2342.19200300.100.1.3" NameFormat="urn:oasis:names:tc:SAML:2.0:attrname-format:uri">
                <saml2:AttributeValue>exemple.mail@mail.com</saml2:AttributeValue>
            </saml2:Attribute>
            <saml2:Attribute FriendlyName="ESCOPersonExternalIds" Name="ESCOPersonExternalIds" NameFormat="urn:oasis:names:tc:SAML:2.0:attrname-format:uri">
                <saml2:AttributeValue>Exemple attribut multivalué 1</saml2:AttributeValue>
                <saml2:AttributeValue>Exemple attribut multivalué 2</saml2:AttributeValue>
                <saml2:AttributeValue>Exemple attribut multivalué 3</saml2:AttributeValue>
            </saml2:Attribute>
            <saml2:Attribute FriendlyName="displayName" Name="urn:oid:2.16.840.1.113730.3.1.241" NameFormat="urn:oasis:names:tc:SAML:2.0:attrname-format:uri">
                <saml2:AttributeValue>Exemple valeur</saml2:AttributeValue>
            </saml2:Attribute>
            ...
        </saml2:AttributeStatement>
    </saml2:Assertion>
</saml2p:Response>
```
On observe bien la liste des attributs retournés. On retrouve le principal est dans `NameID` et on retrouve même le ST associé à cette connexion SSO dans `SessionIndex`.

**Initiation d'un logout par le SP vers l'IDP sur l'endpoint SLO**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<samlp:LogoutRequest
	xmlns:samlp="urn:oasis:names:tc:SAML:2.0:protocol"
	xmlns:saml="urn:oasis:names:tc:SAML:2.0:assertion" Destination="https://cas.test.recia.dev/cas/idp/profile/SAML2/Redirect/SLO" ID="ONELOGIN_0c5a5bdb12272a1579308c6d61c8c83f2ac69107" IssueInstant="2024-09-12T08:23:57Z" Version="2.0">
	<saml:Issuer>https://URL_SP</saml:Issuer>
	<saml:NameID NameQualifier="https://cas.test.recia.dev/cas/idp/metadata" SPNameQualifier="https://URL_SP">F00000X</saml:NameID>
	<samlp:SessionIndex>ST-1-********RDZ-604-cas-test1</samlp:SessionIndex>
</samlp:LogoutRequest>
```
On remarque que CAS possède deux informations pour savoir quelle session il doit détruire : le principal avec le `Issuer` et le ST avec le `SessionIndex` (à partir d'un ST on peut facilement retrouver le TGT).

**Réponse de l'IDP au SP à sa demande de logout**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<saml2p:LogoutResponse
	xmlns:saml2p="urn:oasis:names:tc:SAML:2.0:protocol" Destination="https://URL_SP/ENDPOINT_SLS" ID="_2052014077243031552" InResponseTo="ONELOGIN_0c5a5bdb12272a1579308c6d61c8c83f2ac69107" IssueInstant="2024-09-12T08:23:57.725Z" Version="2.0">
	<saml2:Issuer
		xmlns:saml2="urn:oasis:names:tc:SAML:2.0:assertion">https://cas.test.recia.dev/cas/idp/metadata
	</saml2:Issuer>
	<ds:Signature
		xmlns:ds="http://www.w3.org/2000/09/xmldsig#">
		<ds:SignedInfo>
			<ds:CanonicalizationMethod Algorithm="http://www.w3.org/2001/10/xml-exc-c14n#"/>
			<ds:SignatureMethod Algorithm="http://www.w3.org/2001/04/xmldsig-more#rsa-sha256"/>
			<ds:Reference URI="#_2052014077243031552">
				<ds:Transforms>
					<ds:Transform Algorithm="http://www.w3.org/2000/09/xmldsig#enveloped-signature"/>
					<ds:Transform Algorithm="http://www.w3.org/2001/10/xml-exc-c14n#"/>
				</ds:Transforms>
				<ds:DigestMethod Algorithm="http://www.w3.org/2001/04/xmlenc#sha256"/>
				<ds:DigestValue>...</ds:DigestValue>
			</ds:Reference>
		</ds:SignedInfo>
		<ds:SignatureValue>...</ds:SignatureValue>
		<ds:KeyInfo>
			<ds:X509Data>
				<ds:X509Certificate>...</ds:X509Certificate>
			</ds:X509Data>
		</ds:KeyInfo>
	</ds:Signature>
	<saml2p:Status>
		<saml2p:StatusCode Value="urn:oasis:names:tc:SAML:2.0:status:Success"/>
		<saml2p:StatusMessage>Success</saml2p:StatusMessage>
	</saml2p:Status>
</saml2p:LogoutResponse>
```
On remarque le `StatusMessage` à `Success` pour indiquer la déconnexion s'est bien déroulée.

### 7. Configuration

Le configuration nécéssaire pour activer et utiliser le protocole SAML est la suivante :

- Dans le `build.gradle` :

On ajoute la ligne `implementation "org.apereo.cas:cas-server-support-saml-idp"`

- Dans les fichiers de properties (voir [https://apereo.github.io/cas/7.1.x/authentication/Configuring-SAML2-Authentication.html](https://apereo.github.io/cas/7.1.x/authentication/Configuring-SAML2-Authentication.html)) :

On utilise notamment `cas.authn.saml-idp.core.entity-id` et `cas.authn.saml-idp.metadata.file-system.location` (voir PROPERTIES.md pour plus d'informations).

- Au niveau des définitions de services (voir [https://apereo.github.io/cas/7.1.x/services/SAML2-Service-Management.html](https://apereo.github.io/cas/7.1.x/services/SAML2-Service-Management.html)) :

On a juste à ajouter un service qui correspond au SP qu'on veut autoriser à communiquer en SAML avec le serveur CAS dans le service registry :
```json
{
  "@class": "org.apereo.cas.support.saml.services.SamlRegisteredService",
  "serviceId": "^https:\/\/URL_REGEX_SP",
  "name": "SP SAML",
  "id": 1,
  "metadataLocation": "https://URL_SP/metadata"
}
```
A noter qu'on peut soit donner une URL pour récupérer la métadata du SP, soit donner directement un fichier stocké en local.

## Service Provider

Pour l'instant le serveur CAS n'agit pas en tant que SP via le protocole SAML. Agir en tant que SP signifierait que le serveur CAS déléguerait son authentification à un IDP SAML. C'est par exemple le cas pour EduConnect (mais pas encore implémenté).
