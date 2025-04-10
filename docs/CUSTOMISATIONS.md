# Index des fichiers sources ajoutés/modifiés

| Fonctionnalité | Fichier(s) |
|--|--|
| Redirection multidomaine | CustomInterruptConfiguration + DomainChangeInterruptInquirer |
| Redirection portail | BaseServiceAuthorizationCheckAction |
| Chaînage access strategy | TimeBasedRegisteredServiceAccessStrategy |
| ExternalID | ReturnExternalIDAttributeReleasePolicy + ReturnExternalIDOidcAttributeReleasePolicy + PrincipalExternalIdRegisteredServiceUsernameProvider + PrincipalExternalIdRegisteredOidcServiceUsernameProvider |
| Accès concurrent service map | AbstractServicesManager |
| Soft/Hard timeout par service | HardAndSoftTimeoutRegisteredServiceTicketGrantingTicketExpirationPolicy |
| Metadata SAML custom | BaseSamlIdPMetadataGenerator |
| Paramètre supplémentaire délégation | DelegatedClientAuthenticationRedirectAction |
| Remontée d'erreur flot délégation | DefaultDelegatedClientAuthenticationFailureEvaluator + DefaultCasDelegatingWebflowEventResolver |
| Pairwise-id/eduPersonTargetedId | PairwiseIdSamlRegisteredServiceAttributeReleasePolicy + TargetedIdSamlRegisteredServiceAttributeReleasePolicy |
| SLO par principal | DefaultSingleLogoutMessageCreator + OidcSingleLogoutMessageCreator + CasCoreLogoutAutoConfiguration |
| IDToken custom acr | OidcIdTokenGeneratorService |
| Meilleur compatibilité clients SAML | SamlProfileSaml2ResponseBuilder |
| Lien entre attribute repository et IDP SAML | DefaultAttributeRepositoryResolver |
| Fonctionnement du WAYF avec préselection des IDP | DefaultDelegatedClientIdentityProviderConfigurationProducer |
| Activation séléctive de la profile selection | BaseDelegatedClientAuthenticationCredentialResolver |
| Filtre LDAP custom avec tous les attributs (via script groovy) | LdapDelegatedClientAuthenticationCredentialResolver + LdapUtils |
| Affichage attribut custom choix du profil | DelegatedClientAuthenticationCredentialSelectionAction |