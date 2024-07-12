"""
Serveur python simulant l'API donnant les infos d'une structure.
Ppermet de renvoyer des faux domaines pour des tests sur des structures données.
"""

import json
from http.server import BaseHTTPRequestHandler, HTTPServer

# Dictionnaire mémorisant les domaines spécifiques à renvoyer pour un siren donné
# Si un siren n'est pas spécifié ici DEFAULT_DOMAIN sera renvoyé
SIREN_TO_DOMAIN = {}
DEFAULT_DOMAIN = "localhost:8002"

class RequestHandler(BaseHTTPRequestHandler):
    """
    Classe RequestHandler pour répondre aux différentes requêtes
    """
    def do_GET(self):
        """
        Réponse aux requêtes GET.
        On reçoit en paramètre de requête le siren d'une structure, on doit renvoyer un JSON contenant notamment le domaine correspondant.
        """
        # On suppose que le path sur lequel on va être appelé est /structsinfo
        if '/structsinfo' in self.path:
            siren = self.path.split("?ids=")[1]
            domain = DEFAULT_DOMAIN
            if siren in SIREN_TO_DOMAIN:
                domain = SIREN_TO_DOMAIN[siren]
            response_map = {
                siren: {
                    "id":siren,
                    "otherAttributes":{
                        "ESCODomaines": [domain]
                    }
                }
            }
            json_reponse = json.dumps(response_map)
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Content-Length', len(json_reponse))
            self.end_headers()
            self.wfile.write(json_reponse.encode('utf-8'))
        # Autrement on renvoie un 404 
        else:
            self.send_response(404)
            self.end_headers()
            self.wfile.write(b'404 Not Found')

def run(server_class=HTTPServer, handler_class=RequestHandler, port=8001):
    server_address = ('', port)
    httpd = server_class(server_address, handler_class)
    print(f'Starting server on port {port}...')
    httpd.serve_forever()

if __name__ == '__main__':
    run()
