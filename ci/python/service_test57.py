"""
Serveur python simulant un service web.
Il n'est pas là pour faire les requêtes (ce sont les scripts de test qui les font) mais pour pour faire valider des ST et le SLO.
Utilisé comme service pour tester si le CAS redirige au bon endroit après un logout.
"""

import urllib3
from http.server import BaseHTTPRequestHandler, HTTPServer
from constants import CAS_BASE_URL, SERVICE_SLO_REDIRECTION_URL
from utils import validate_ticket_to_cas, handle_logout_request

urllib3.disable_warnings()

data={"principal": None}

class RequestHandler(BaseHTTPRequestHandler):

    def do_GET(self):
        if "endpoint_to_redirect" in self.path:
            self.send_response(200)
            self.end_headers()
            self.wfile.write(b'Redirected to endpoint_to_redirect')
        else:
            validate_ticket_to_cas(self, SERVICE_SLO_REDIRECTION_URL, CAS_BASE_URL)
            data["logged_in"] = True
    
    def do_POST(self):
        if "logout" in self.path:
            handle_logout_request(self)

def run(server_class=HTTPServer, handler_class=RequestHandler, port=8057):
    server_address = ('', port)
    httpd = server_class(server_address, handler_class)
    print(f'Starting server on port {port}...')
    httpd.serve_forever()

if __name__ == '__main__':
    run()
