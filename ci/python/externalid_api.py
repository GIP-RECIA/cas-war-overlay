"""
Serveur python simulant l'API gérant les externalid
Permet de renvoyer des faux externalid pour des tests sur des services données.
"""

import json
from http.server import BaseHTTPRequestHandler, HTTPServer

# Dictionnaire mémorisant les externalids spécifiques à renvoyer pour un service donné
# Si un service n'est pas spécifié ici DEFAULT_EXTERNALID sera renvoyé
SERVICE_TO_EXTERNALID = {"SERVICE1":"SERVICE1$00000000-0000-0000-0000-000000000001",
                         "SERVICE2":"SERVICE2$00000000-0000-0000-0000-000000000002"}
DEFAULT_EXTERNALID = "SERVICE$00000000-0000-0000-0000-000000000000"

# Liste des services à retourner en erreur
SERVICE_ERROR = ["SERVICE3"]

class RequestHandler(BaseHTTPRequestHandler):
    """
    Classe RequestHandler pour répondre aux différentes requêtes
    """
    def do_POST(self):
        """
        Réponse aux requêtes POST.
        On reçoit en paramètre de requête l'uid de l'utilisateur et le service, on doit renvoyer un JSON contenant l'externalid correspondant.
        """
        # On suppose que le path sur lequel on va être appelé est /externalid/api/generateExternalId
        if '/externalid/api' in self.path:
            service = self.path.split("serviceId=")[1]
            externalid = DEFAULT_EXTERNALID
            if service in SERVICE_TO_EXTERNALID:
                externalid = SERVICE_TO_EXTERNALID[service]
            response_map = {"generatedId":externalid,"error":False,
                            "jdbcresult":{"error":False,"errorMessage":"","exceptionType":""},
                            "ldapresult":{"error":False,"errorMessage":"","exceptionType":""}}
            if service in SERVICE_ERROR:
                response_map = {"generatedId":externalid,"error":True,
                "jdbcresult":{"error":True,"errorMessage":"Error","exceptionType":""},
                "ldapresult":{"error":True,"errorMessage":"Error","exceptionType":""}}
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

def run(server_class=HTTPServer, handler_class=RequestHandler, port=7002):
    server_address = ('', port)
    httpd = server_class(server_address, handler_class)
    print(f'Starting server on port {port}...')
    httpd.serve_forever()

if __name__ == '__main__':
    run()
