"""
Serveur python simulant l'API donnant les infos d'une structure.
Permet de renvoyer des faux domaines pour des tests sur des structures données.
"""

import json
from http.server import BaseHTTPRequestHandler, HTTPServer

# Dictionnaire mémorisant les domaines spécifiques à renvoyer pour un siren donné
# Si un siren n'est pas spécifié ici DEFAULT_DOMAIN sera renvoyé
SIREN_TO_DOMAIN = {"11111111111111": ["localhost:8002"], "22222222222222": ["localhost:8028"], "33333333333333": ["localhost:8001"],
                   "44444444444444": ["localhost:8029"], "6666666666": ["localhost:8040"], "77777777777777": ["localhost:8039"],
                   "9999999999999": ["localhost:8041"], "123456789": ["localhost:8002", "localhost:8001"]}
DEFAULT_DOMAIN = "localhost:8001"

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
                    "displayName": "NOM ETAB NUMERO "+siren,
                    "otherAttributes":{
                        "ESCODomaines": domain
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

def run(server_class=HTTPServer, handler_class=RequestHandler, port=7001):
    server_address = ('', port)
    httpd = server_class(server_address, handler_class)
    print(f'Starting server on port {port}...')
    httpd.serve_forever()

if __name__ == '__main__':
    run()
