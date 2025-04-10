import argparse

# Parser les arguments données sur la ligne de commande
parser = argparse.ArgumentParser()
parser.add_argument("--port")
parser.add_argument("--settings")
args = parser.parse_args()

import json
import base64
import zlib

from flask import Flask, request, render_template, redirect, session, make_response, Response

from onelogin.saml2.auth import OneLogin_Saml2_Auth
from onelogin.saml2.utils import OneLogin_Saml2_Utils
from onelogin.saml2.idp_metadata_parser import OneLogin_Saml2_IdPMetadataParser

# Constantes à modifier si besoin
SP_CERTIFICATE_PATH ="saml/certs/sp.crt"
SP_PRIVATEKEY_PATH = "saml/certs/sp.key"
SETTINGS_PATH = args.settings
IDP_METADATA_URL = "https://localhost:8443/cas/idp/metadata"

# Initialisation de l'app flask
app = Flask(__name__)
app.config["SECRET_KEY"] = "af5cb14a-c87d-4232-88df-dd01660284d7"

# Dictionnaire servant à stocker des infos
other_infos = {}

def load_idp_data():
    """
    Charge les différentes informations contenues dans les fichiers et la métadata de l'IDP.
    Fusionne toutes les informations dans un dictionnaire.
    :return: Un dictionnaire qui contient tout le paramétrage pour la requête SAML
    """
    # Chargement des fichiers : certificat, clé privée et paramètres
    certificate_file = open(SP_CERTIFICATE_PATH)
    privatekey_file = open(SP_PRIVATEKEY_PATH)
    settings_file = open(SETTINGS_PATH)
    sp_cert = certificate_file.read()
    sp_key = privatekey_file.read()
    settings_data = json.load(settings_file)
    certificate_file.close()
    privatekey_file.close()
    settings_file.close()
    # Récupération de la métadata de l'IDP
    idp_data = OneLogin_Saml2_IdPMetadataParser.parse_remote(IDP_METADATA_URL, validate_cert=False)
    # Fusion de toutes les informations en prenant comme base la métadata de l'IDP
    for k,v in settings_data.items():
        idp_data[k] = v
    idp_data["sp"]["x509cert"] = sp_cert
    idp_data["sp"]["privateKey"] = sp_key
    return idp_data

def init_saml_auth(req):
    """
    :param req:
    :return:
    """
    idp_data = load_idp_data()
    auth = OneLogin_Saml2_Auth(req, idp_data)
    return auth

def prepare_flask_request(request):
    """
    :param request:
    :return:
    """
    return {
        "https": "off",
        "http_host": request.host,
        "script_name": request.path,
        "get_data": request.args.copy(),
        "post_data": request.form.copy(),
    }

@app.route("/", methods=["GET", "POST"])
def index():
    req = prepare_flask_request(request)
    auth = init_saml_auth(req)
    errors = []
    error_reason = None
    not_auth_warn = False
    success_slo = False
    attributes = False
    paint_logout = False

    # SSO = appuyer sur le bouton login
    if "sso" in request.args:
        l = auth.login()
        return redirect(l)

    # SLO = appuyer sur le bouton logout une fois connecté
    elif "slo" in request.args:
        name_id = session_index = name_id_format = name_id_nq = name_id_spnq = None
        if "samlNameId" in session:
            name_id = session["samlNameId"]
        if "samlSessionIndex" in session:
            session_index = session["samlSessionIndex"]
        if "samlNameIdFormat" in session:
            name_id_format = session["samlNameIdFormat"]
        if "samlNameIdNameQualifier" in session:
            name_id_nq = session["samlNameIdNameQualifier"]
        if "samlNameIdSPNameQualifier" in session:
            name_id_spnq = session["samlNameIdSPNameQualifier"]
        return redirect(auth.logout(name_id=name_id, session_index=session_index, nq=name_id_nq, name_id_format=name_id_format, spnq=name_id_spnq))

    # ACS = endpoint ou le client reçoit la réponse du serveur CAS pour le SSO
    elif "acs" in request.args:
        request_id = None
        if "AuthNRequestID" in session:
            request_id = session["AuthNRequestID"]
        auth.process_response(request_id=request_id)
        errors = auth.get_errors()
        not_auth_warn = not auth.is_authenticated()
        if len(errors) == 0:
            if "AuthNRequestID" in session:
                del session["AuthNRequestID"]
            session["samlUserdata"] = auth.get_attributes()
            session["samlNameId"] = auth.get_nameid()
            session["samlNameIdFormat"] = auth.get_nameid_format()
            session["samlNameIdNameQualifier"] = auth.get_nameid_nq()
            session["samlNameIdSPNameQualifier"] = auth.get_nameid_spnq()
            session["samlSessionIndex"] = auth.get_session_index()
            self_url = OneLogin_Saml2_Utils.get_self_url(req)
            if "RelayState" in request.form and self_url != request.form["RelayState"]:
                return redirect(auth.redirect_to(request.form["RelayState"]))
        elif auth.get_settings().is_debug_active():
            error_reason = auth.get_last_error_reason()

    # SLS = endpoint ou le client reçoit la réponse du serveur CAS pour le SLO
    elif "sls" in request.args:
        request_id = None
        if "LogoutRequestID" in session:
            request_id = session["LogoutRequestID"]
        dscb = lambda: session.clear()
        url = auth.process_slo(request_id=request_id, delete_session_cb=dscb)
        errors = auth.get_errors()
        if len(errors) == 0:
            if url is not None:
                return redirect(url)
            else:
                success_slo = True
        elif auth.get_settings().is_debug_active():
            error_reason = auth.get_last_error_reason()

    if "samlUserdata" in session:
        paint_logout = True
        if len(session["samlUserdata"]) > 0:
            attributes = session["samlUserdata"].items()

    return render_template("index.html", errors=errors, error_reason=error_reason, not_auth_warn=not_auth_warn, success_slo=success_slo, attributes=attributes, paint_logout=paint_logout)


@app.route("/metadata/")
def metadata():
    req = prepare_flask_request(request)
    auth = init_saml_auth(req)
    settings = auth.get_settings()
    metadata = settings.get_sp_metadata()
    errors = settings.validate_metadata(metadata)

    if len(errors) == 0:
        resp = make_response(metadata, 200)
        resp.headers["Content-Type"] = "text/xml"
    else:
        resp = make_response(", ".join(errors), 500)
    return resp

# Endpoint utilisé par les requêtes de SLO envoyées depuis le CAS
@app.route('/saml/slo', methods=['GET', 'POST'])
def slo():
    samlrequest = str(zlib.decompress(base64.b64decode(request.args["SAMLRequest"]), -zlib.MAX_WBITS), "utf-8")
    other_infos["slo"] = samlrequest
    return Response(status=200)

# Route utile pour les tests afin de savoir quel principal a été déconnecté
@app.route('/checkLogout')
def checkLogout():
    return other_infos["slo"]

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=args.port)
