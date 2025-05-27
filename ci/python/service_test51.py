"""
Serveur python simulant un service web.
Il n'est pas là pour faire les requêtes (ce sont les scripts de test qui les font) mais pour pour faire valider des ST.
Utilisé comme service pour un test de connexion avec le TOTP MFA quand il y a un paramètre token dans l'url.
"""

import urllib3
from http.server import BaseHTTPRequestHandler, HTTPServer
from constants import CAS_BASE_URL, SERVICE_TOTP_WITH_TOKEN_PARAMETER_URL
from utils import validate_ticket_to_cas

urllib3.disable_warnings()

class RequestHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        validate_ticket_to_cas(self, SERVICE_TOTP_WITH_TOKEN_PARAMETER_URL, CAS_BASE_URL)

def run(server_class=HTTPServer, handler_class=RequestHandler, port=8051):
    server_address = ('', port)
    httpd = server_class(server_address, handler_class)
    print(f'Starting server on port {port}...')
    httpd.serve_forever()

if __name__ == '__main__':
    run()
