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
| Logout URL par service | DefaultLogoutRedirectionStrategy |
| IDToken custom acr | OidcIdTokenGeneratorService |
| Meilleur compatibilité clients SAML | SamlProfileSaml2ResponseBuilder |
| Modification paramètre token TOTP | GoogleAuthenticatorTokenCredential + GoogleAuthenticatorMultifactorWebflowConfigurer + GoogleAuthenticatorSaveRegistrationAction + templates html |
| Modifications UI TOTP | casGoogleAuthenticatorRegistrationView + casGoogleAuthenticatorLoginView + cas.css |
| Fix expiration trusted devices | MultifactorAuthenticationSetTrustAction |
| Fix TOTP registration réutilisable | GoogleAuthenticatorSaveRegistrationAction |
| Filtre LDAP custom avec tous les attributs (via script groovy) | LdapDelegatedClientAuthenticationCredentialResolver + LdapUtils |
| WAYF | DefaultDelegatedClientIdentityProviderConfigurationProducer + script groovy + casLoginView |
| Attribute repository par guichet | DefaultAttributeRepositoryResolver + PersonDirectoryPrincipalResolver |
| Profile selection | BaseDelegatedClientAuthenticationCredentialResolver + LdapDelegatedClientAuthenticationCredentialResolver + LdapUtils + script groovy |
| UI choix du profil | DelegatedClientAuthenticationCredentialSelectionAction + casDelegatedAuthnSelectionView |
| Remontée des erreurs de délégation | LdaptivePersonAttributeDao + LdapDelegatedClientAuthenticationCredentialResolver + casLoginView |
| Logout custom par IDP delegation | DelegatedAuthenticationClientLogoutAction + FinishLogoutAction + casLogoutView |
| SCIM | ScimPrincipalProvisioner + CasScimAutoConfiguration |
| Fix TOTP scratch code login | RedisGoogleAuthenticatorTokenCredentialRepository |
| Fix TOTP scratch code registration | GoogleAuthenticatorOneTimeTokenCredentialValidator + OneTimeTokenCredentialValidator + GoogleAuthenticatorSaveRegistrationAction |
| Fix SAML2 IDP unauthorized service | AbstractServiceFactory |
| Validation charte redirection cerbere | GenerateServiceTicketAction + CasSupportActionsAutoConfiguration |
| Fix SAML IDP Initiated TGT existant | DefaultSingleSignOnBuildingStrategy |