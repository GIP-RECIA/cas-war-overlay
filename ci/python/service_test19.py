"""
Serveur python simulant un service web.
Il n'est pas là pour faire les requêtes (ce sont les scripts de test qui les font) mais pour pour faire valider des ST et le SLO.
Utilisé comme service pour tester si le CAS envoie bien une requête de SLO lors de la déconnexion.
"""

import urllib3
from http.server import BaseHTTPRequestHandler, HTTPServer
from constants import CAS_BASE_URL, SERVICE_SLO_URL
from utils import validate_ticket_to_cas, handle_logout_request, send_logout_status

urllib3.disable_warnings()

data={}

class RequestHandler(BaseHTTPRequestHandler):

    def do_GET(self):
        if "checkLogout" in self.path:
            send_logout_status(self, data["logged_in"])
        else:
            validate_ticket_to_cas(self, SERVICE_SLO_URL, CAS_BASE_URL)
            data["logged_in"] = True
    
    def do_POST(self):
        data["logged_in"] = handle_logout_request(self)

def run(server_class=HTTPServer, handler_class=RequestHandler, port=8019):
    server_address = ('', port)
    httpd = server_class(server_address, handler_class)
    print(f'Starting server on port {port}...')
    httpd.serve_forever()

if __name__ == '__main__':
    run()
