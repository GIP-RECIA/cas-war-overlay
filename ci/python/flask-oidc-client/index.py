import argparse

# Parser les arguments données sur la ligne de commande
parser = argparse.ArgumentParser()
parser.add_argument("--port")
parser.add_argument("--clientid")
parser.add_argument("--clientsecret")
parser.add_argument("--scopes")
args = parser.parse_args()

import urllib3
from flask import Flask, redirect, url_for, session, jsonify, request, Response
from authlib.integrations.flask_client import OAuth
from authlib.oauth2.rfc6749.errors import OAuth2Error
from functools import wraps
import base64
import json

urllib3.disable_warnings()

# Constantes à modifier si besoin
CLIENT_ID = args.clientid
CLIENT_SECRET = args.clientsecret
PROVIDER_METADATA_URL = "https://localhost:8443/cas/oidc/.well-known"
CLIENT_CALLBACK_URL = "http://localhost:"+args.port+"/oidc/authorize"
SCOPES = args.scopes

# Initialisation de l'app flask
app = Flask(__name__)
app.secret_key = "7f2d013e-1bfe-4a7a-9734-b40f50a95bbf"

# Initialisation de l'OIDC avec Authlib
oauth = OAuth(app)

# Dictionnaire servant à stocker des infos
other_infos = {}

# Configuration pour communiquer avec l'IDP OIDC
oauth.register(
    name='oidc',
    client_id=CLIENT_ID,
    client_secret=CLIENT_SECRET,
    server_metadata_url=PROVIDER_METADATA_URL,
    client_kwargs={
        'scope': SCOPES,
        'verify': False
    }
)

# Annotation à poser pour une route protégée par OIDC
def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if "oidc" not in session:
            return redirect(url_for('login'))
        return f(*args, **kwargs)
    return decorated_function

# Affiche les informations de l'utilisateur
@app.route('/oidc/protected')
@login_required
def protected():
    return jsonify(session.get("oidc"))

# Redirection vers le fournisseur OIDC avec la bonne URL de callback
@app.route('/oidc/login')
def login():
    return oauth.oidc.authorize_redirect(CLIENT_CALLBACK_URL)

# Callback après authentification (GET)
# Callback après logout (POST)
@app.route('/oidc/authorize', methods=['GET', 'POST'])
def authorize():
    try:
        # Récupérer AT, RT, ID Token et décoder l'ID Token dans le champ userinfo
        token_response = oauth.oidc.authorize_access_token(**{'scope':SCOPES})
        # Stocker les tokens et infos utilisateur dans la session
        session["oidc"] = token_response
        return redirect(url_for("protected"))
    except OAuth2Error as error:
        return f"Erreur d'authentification : {error}"

# Route pour récupérer les informations de l'utilisateur via l'endpoint UserInfo
@app.route('/oidc/userinfo')
@login_required
def userinfo():
    try:
        # Récupérer l'access token stocké dans la session
        token_response = session.get("oidc")
        # Utiliser l'access token pour faire une requête au l'endpoint userinfo et la stocker en session
        user_info = oauth.oidc.userinfo(token=token_response)
        session["oidc"] = {**user_info, **session["oidc"].copy()}
        return redirect(url_for("protected"))
    except OAuth2Error as error:
        return jsonify({"error": f"Erreur lors de la récupération des informations utilisateur : {error}"}), 400


# Route de déconnexion initiée par le client
@app.route('/oidc/logout')
def logout():
    session.pop("oidc", None)
    return redirect(url_for("protected"))

# Endpoint utilisé par les requêtes de SLO envoyées depuis le CAS
@app.route('/oidc/slo', methods=['GET', 'POST'])
def slo():
    session.pop("oidc", None)
    token = request.form["logout_token"]
    token_payload = token.split(".")[1]
    token_payload_decoded = str(base64.b64decode(token_payload + "=="), "utf-8")
    other_infos["slo"] = json.loads(token_payload_decoded)
    return Response(status=200)

# Route utile pour les tests afin de savoir quel principal a été déconnecté
@app.route('/checkLogout')
def checkLogout():
    return other_infos["slo"]

# Démarrer l'application Flask
if __name__ == '__main__':
    app.run(host="0.0.0.0", port=args.port)