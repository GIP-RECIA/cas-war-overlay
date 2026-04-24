"""
Serveur python simulant l'API de restriction de rentrée scolaire.
Permet de renvoyer des fausses validations pour des tests sur des utilisateurs précis.
"""

from http.server import BaseHTTPRequestHandler, HTTPServer

class RequestHandler(BaseHTTPRequestHandler):
    """
    Classe RequestHandler pour répondre aux différentes requêtes
    """
    def do_POST(self):
        """
        Réponse aux requêtes POST.
        """       
        # Vérification qu'on transmet la api-key
        ok_api_key = False
        for header, value in self.headers.items():
            if(header == "x-api-key"):
                if(value == "KEY_456"):
                    ok_api_key = True

        # Vérification qu'on transmet l'uid dans le path (pas utilisé)
        ok_path = "username=F1abc" in self.path

        # Vérification qu'on transmet les bons attributs dans le body
        content_length = int(self.headers.get('Content-Length', 0))
        body = self.rfile.read(content_length)
        decoded_body = body.decode('utf-8', errors='replace')
        ok_body = ("ESCOUAICourant" in decoded_body) and ("isMemberOf" in decoded_body)

        if(ok_api_key and ok_path and ok_body):
            print("Restriction rentee - OK")
            self.send_response(200)
            self.end_headers()
            self.wfile.write(b'OK')
        else:
            print("Restriction rentee - Locked")
            self.send_response(400)
            self.end_headers()
            self.wfile.write(b'Locked')

def run(server_class=HTTPServer, handler_class=RequestHandler, port=7004):
    server_address = ('', port)
    httpd = server_class(server_address, handler_class)
    print(f'Starting server on port {port}...')
    httpd.serve_forever()

if __name__ == '__main__':
    run()
