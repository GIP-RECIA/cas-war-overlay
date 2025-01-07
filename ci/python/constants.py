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

# Url du service faisant valider un ST via delegation CAS
SERVICE_DELEGATION_CAS_URL = "http://localhost:8027/test"

# Url du service faisant valider un ST via delegation CAS après redirect de domaine
SERVICE_DELEGATION_CAS_REDIRECT_URL = "http://localhost:8028/test"