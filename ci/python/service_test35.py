"""
Serveur python simulant un service web.
Il n'est pas là pour faire les requêtes (ce sont les scripts de test qui les font) mais pour pour faire valider des ST et le SLO.
Utilisé comme service pour tester si le CAS envoie bien une requête de SLO lors de la déconnexion.
"""

import urllib3
from http.server import BaseHTTPRequestHandler, HTTPServer
from constants import CAS_BASE_URL, SERVICE_SLO_CUSTOM_PRINCIPAL_URL
from utils import validate_ticket_to_cas, handle_logout_request, send_logout_status

urllib3.disable_warnings()

data={"principal": None}

class RequestHandler(BaseHTTPRequestHandler):

    def do_GET(self):
        if "checkLogout" in self.path:
            send_logout_status(self, data["logged_in"], data["principal"])
        else:
            validate_ticket_to_cas(self, SERVICE_SLO_CUSTOM_PRINCIPAL_URL, CAS_BASE_URL)
            data["logged_in"] = True
    
    def do_POST(self):
        if "logout" in self.path:
            logout_reponse = handle_logout_request(self)
            if logout_reponse != None:
                data["logged_in"] = False
                data["principal"] = logout_reponse

def run(server_class=HTTPServer, handler_class=RequestHandler, port=8035):
    server_address = ('', port)
    httpd = server_class(server_address, handler_class)
    print(f'Starting server on port {port}...')
    httpd.serve_forever()

if __name__ == '__main__':
    run()
