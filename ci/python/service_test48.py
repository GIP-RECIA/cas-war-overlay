"""
Serveur python simulant un service web.
Il n'est pas là pour faire les requêtes (ce sont les scripts de test qui les font) mais pour pour faire valider des ST.
Il simule aussi une API SCIM et affiche des informations en fonction des requêtes qu'il a reçu.
"""

import urllib3
from http.server import BaseHTTPRequestHandler, HTTPServer
from constants import CAS_BASE_URL, SERVICE_SCIM_CREATE_URL
from utils import validate_ticket_to_cas

urllib3.disable_warnings()

class RequestHandler(BaseHTTPRequestHandler):

    def do_GET(self):
        validate_ticket_to_cas(self, SERVICE_SCIM_CREATE_URL, CAS_BASE_URL)

def run(server_class=HTTPServer, handler_class=RequestHandler, port=8048):
    server_address = ('', port)
    httpd = server_class(server_address, handler_class)
    print(f'Starting server on port {port}...')
    httpd.serve_forever()

if __name__ == '__main__':
    run()