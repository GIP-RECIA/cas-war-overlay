"""
Serveur python simulant un service web.
Il n'est pas là pour faire les requêtes (ce sont les scripts de test qui les font) mais il est là
pour avoir une réponse aux redirections et pour faire valider des ST.
"""

import urllib3
import requests
from http.server import BaseHTTPRequestHandler, HTTPServer

urllib3.disable_warnings()

CAS_BASE_URL = "https://localhost:8443/cas"
SERVICE_URL = "http://localhost:8002/test"

class RequestHandler(BaseHTTPRequestHandler):
    """
    Classe RequestHandler pour répondre aux différentes requêtes
    """
    def do_GET(self):
        """
        Réponse aux requêtes GET.
        """
        if 'ticket' in self.path:
            # On fait valider le ST au serveur CAS : si le serveur CAS répond OK alors on répondra OK aussi
            ST = self.path.split('ticket')[1]
            ST = ST[1:len(ST)]
            request_url = CAS_BASE_URL+"/serviceValidate?service="+SERVICE_URL+"&ticket="+ST
            response = requests.get(request_url, verify=False)
            # Si on a cas:authenticationSuccess alors c'est OK
            if ('cas:authenticationSuccess' in response.text) and (response.status_code==200):
                self.send_response(200)
                self.send_header('Content-type', 'text/html')
                self.end_headers()
                self.wfile.write("SUCCESS".encode('utf-8'))
            # Sinon on a eu un problème donc on retourne un 404
            else:
                self.send_response(404)
                self.end_headers()
                self.wfile.write(b'404 Not Found')
        else:
            self.send_response(404)
            self.end_headers()
            self.wfile.write(b'404 Not Found')

def run(server_class=HTTPServer, handler_class=RequestHandler, port=8002):
    server_address = ('', port)
    httpd = server_class(server_address, handler_class)
    print(f'Starting server on port {port}...')
    httpd.serve_forever()

if __name__ == '__main__':
    run()
