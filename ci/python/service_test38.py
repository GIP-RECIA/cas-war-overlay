"""
Serveur python simulant un service web.
Il n'est pas là pour faire les requêtes (ce sont les scripts de test qui les font) mais pour pour faire valider des ST.
Utilisé comme service pour tester la délégation SAML.
"""

import urllib3
from http.server import BaseHTTPRequestHandler, HTTPServer
from constants import CAS_BASE_URL, SERVICE_DELEGATION_SAML_2
from utils import validate_ticket_to_cas_and_return_attributes

urllib3.disable_warnings()

class RequestHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        validate_ticket_to_cas_and_return_attributes(self, SERVICE_DELEGATION_SAML_2, CAS_BASE_URL)

def run(server_class=HTTPServer, handler_class=RequestHandler, port=8038):
    server_address = ('', port)
    httpd = server_class(server_address, handler_class)
    print(f'Starting server on port {port}...')
    httpd.serve_forever()

if __name__ == '__main__':
    run()
