"""
Fichier python regroupant les constantes utilisées dans les différents scripts.
"""

# Url de base du serveur CAS
CAS_BASE_URL = "https://localhost:8443/cas"

# Url du service faisant valider un simple ST
SERVICE_VALIDATE_ST_URL = "http://localhost:8001/test"

# Url du service sur lequel on est redirigé quand on test le multidomaine
SERVICE_REDIRECT_URL = "http://localhost:8002/test"

# Url du service utilisé pour tester la release de l'externalid en tant que principal
SERVICE_ATTRIBUTE_RELEASE_URL = "http://localhost:8010/test"

# Url du service avec lequel on doit pouvoir se connecter quand on teste la redirection token portail après connexion
SERVICE_TOKEN_NOREDIRECT_URL = "http://localhost:8016/test"

# Url du service pour tester la déconnexion globale
SERVICE_SLO_URL = "http://localhost:8019/test"

# Url du service pour tester une erreur dans la récupération de l'externalid
SERVICE_EXTERNALID_ERROR_URL = "http://localhost:8022/test"

# Url du service utilisé pour tester la release de l'externalid en tant qu'attribut
SERVICE_EXTERNALID_ATTRIBUTE_RELEASE_URL = "http://localhost:8023/test"

# Url du service pour tester la déconnexion globale avec principal different
SERVICE_SLO_CUSTOM_PRINCIPAL_URL = "http://localhost:8035/test"

# Url du service pour tester la déconnexion avec redirection forcée pour un service donné
SERVICE_SLO_REDIRECTION_URL = "http://localhost:8047/test"

# Url du service pour tester la déconnexion avec redirection via paramètre url pour un service donné
SERVICE_SLO_REDIRECTION_CLASSIC_URL = "http://localhost:8048/test"

# Url du service avec MFA TOTP, cas spécial ou il y a un paramètre token dans l'url
SERVICE_TOTP_WITH_TOKEN_PARAMETER_URL = "http://localhost:8051/test&token=aaaaa"

# Url du service pour tester la profile selection dans le cas d'une auth déléguée
SERVICE_PROFILE_SELECTION_URL = "http://localhost:8036/test"

# Url du service pour tester la délégation d'authentication vers un IDP SAML
SERVICE_DELEGATION_SAML_1 = "http://localhost:8037/test"

# Url du second service pour tester la délégation d'authentication vers un IDP SAML
SERVICE_DELEGATION_SAML_2 = "http://localhost:8038/test"

# Url du service sur lequel on est redirigé quand on test le multidomaine avec la délégation
SERVICE_REDIRECT_DELEGATION_URL = "http://localhost:8039/test"

# Url du service sur lequel on est redirigé quand on test le multidomaine avec la délégation et profile selection
SERVICE_REDIRECT_DELEGATION_PROFILE_SELECTION_URL = "http://localhost:8040/test"

# Url du service sur lequel on est redirigé quand on test le multidomaine avec un paramètre d'url
SERVICE_REDIRECT_WITH_PARAMS_URL = "http://localhost:8041/test?param1=valeur2"

# Url du service avec MFA TOTP
SERVICE_TOTP_URL = "http://localhost:8046/test"

# Url du service pour tester le SCIM (create)
SERVICE_SCIM_CREATE_URL = "http://localhost:8048/test"

# Url du service pour tester le SCIM (update)
SERVICE_SCIM_UPDATE_URL = "http://localhost:8049/test"

# Url du service avec MFA TOTP, cas spécial ou il y a un paramètre token dans l'url
SERVICE_TOTP_WITH_TOKEN_PARAMETER_URL = "http://localhost:8051/test&token=aaaaa"

# Url du service pour tester la déconnexion globale avec redirection
SERVICE_SLO_REDIRECTION_URL = "http://localhost:8057/test"

# Url du service pour tester la profile selection dans le cas d'une auth déléguée (IdP 2)
SERVICE_PROFILE_2_SELECTION_URL = "http://localhost:8060/test"

# Url du service cerbere pour gérer la validation de la charte
SERVICE_CERBERE_URL = "http://localhost:8062/test"

# Url du service cerbere pour gérer la validation de la charte (autre domaine)
SERVICE_CERBERE_URL_OTHER_DOMAIN = "http://localhost:8064/test"

# Url du service cerbere pour tester l'authentification déléguée quand un TGT existe déjà
SERVICE_DELEGATED_AUTHN_EXISTING_TGT = "http://localhost:8065/test"

