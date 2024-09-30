"""
Fichier python regroupant les constantes utilisées dans les différents scripts.
"""

# Url de base du serveur CAS
CAS_BASE_URL = "https://localhost:8443/cas"

# Url du service faisant valider un simple ST
SERVICE_VALIDATE_ST_URL = "http://localhost:8001/test"

# Url du service sur lequel on est redirigé quand on test le multidomaine
SERVICE_REDIRECT_URL = "http://localhost:8002/test"

# Url du service utilisé pour tester la release d'attributs (externalid)
SERVICE_ATTRIBUTE_RELEASE_URL = "http://localhost:8010/test"

# Url du service avec lequel on doit pouvoir se connecter quand on teste la redirection token portail après connexion
SERVICE_TOKEN_NOREDIRECT_URL = "http://localhost:8016/test"