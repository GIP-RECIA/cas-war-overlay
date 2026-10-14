"""
Serveur python simulant le DNMA authentification
"""

import urllib3
from http.server import BaseHTTPRequestHandler, HTTPServer
from constants import CAS_BASE_URL, SERVICE_DNMA_AUTH_URL, SERVICE_DNMA_URL, SERVICE_DNMA_ALREADY_AUTH_URL
import requests

urllib3.disable_warnings()

auth_count_success = 0

class RequestHandler(BaseHTTPRequestHandler):
    """
    Classe RequestHandler pour répondre aux différentes requêtes
    """
    def do_GET(self):
        """
        Réponse aux requêtes GET.
        On reçoit une requete avec un ticket à valider et une URL sur laquelle il faut rediriger
        """
        global auth_count_success
        if '/dnma/auth/health-check' in self.path:
            self.send_response(200)
            self.end_headers()
        elif '/dnma/auth/cas/login' in self.path:
                if 'ticket' in self.path:
                    ST = self.path.split('ticket')[1]
                    ST = ST[1:len(ST)]
                    service_url = SERVICE_DNMA_AUTH_URL + self.path.split('ticket')[0]
                    request_url = CAS_BASE_URL+"/serviceValidate?service="+service_url+"&ticket="+ST
                    response = requests.get(request_url, verify=False)
                    # Si on a cas:authenticationSuccess alors c'est OK, on redirige vers la originalUrl
                    if ('cas:authenticationSuccess' in response.text) and (response.status_code==200):
                        auth_count_success += 1
                        original_url = self.path.split('originalUrl')[1]
                        original_url = original_url.split('ticket')[0]
                        original_url = original_url[1:len(original_url)-1]
                        self.send_response(302)
                        self.send_header("Location", original_url)
                        self.end_headers()
                else:
                    self.send_response(404)
                    self.end_headers()
                    self.wfile.write(b'404 Not Found')
        # Route pour vérifier qu'on est bien authentifié
        elif '/dnma/auth/status' in self.path:
            self.send_response(200)
            self.send_header('Content-type', 'text/html')
            self.end_headers()
            self.wfile.write(f"auth: {auth_count_success}".encode('utf-8'))
        # Route pour authentifier sur le service n°1 qui est sur le même domaine que le DNMA mais n'est pas le DNMA
        elif '/service1' in self.path:
            if 'ticket' in self.path:
                # On fait valider le ST au serveur CAS : si le serveur CAS répond OK alors on répondra OK aussi
                ST = self.path.split('ticket')[1]
                ST = ST[1:len(ST)]
                request_url = CAS_BASE_URL+"/serviceValidate?service="+SERVICE_DNMA_URL+"&ticket="+ST
                response = requests.get(request_url, verify=False)
                # Si on a cas:authenticationSuccess alors c'est OK
                if ('cas:authenticationSuccess' in response.text) and (response.status_code==200):
                    response_text = response.text + f"<!-- SERVICE={SERVICE_DNMA_URL} -->"
                    self.send_response(200)
                    self.send_header("Content-type", "application/xml")
                    self.send_header("Content-Length", str(len(response_text.encode('utf-8'))))
                    self.end_headers()
                    self.wfile.write(response_text.encode('utf-8'))
                # Sinon on a eu un problème donc on retourne le problème
                else:
                    self.send_response(response.status_code)
                    self.send_header("Content-type", "application/xml")
                    self.send_header("Content-Length", str(len(response.text.encode('utf-8'))))
                    self.end_headers()
                    self.wfile.write(response.text.encode('utf-8'))
            else:
                self.send_response(404)
                self.end_headers()
                self.wfile.write(b'404 Not Found')
        # Route pour authentifier sur le service n°2 qui est sur le même domaine que le DNMA mais n'est pas le DNMA
        elif '/service2' in self.path:
            if 'ticket' in self.path:
                # On fait valider le ST au serveur CAS : si le serveur CAS répond OK alors on répondra OK aussi
                ST = self.path.split('ticket')[1]
                ST = ST[1:len(ST)]
                request_url = CAS_BASE_URL+"/serviceValidate?service="+SERVICE_DNMA_ALREADY_AUTH_URL+"&ticket="+ST
                response = requests.get(request_url, verify=False)
                # Si on a cas:authenticationSuccess alors c'est OK
                if ('cas:authenticationSuccess' in response.text) and (response.status_code==200):
                    response_text = response.text + f"<!-- SERVICE={SERVICE_DNMA_ALREADY_AUTH_URL} -->"
                    self.send_response(200)
                    self.send_header("Content-type", "application/xml")
                    self.send_header("Content-Length", str(len(response_text.encode('utf-8'))))
                    self.end_headers()
                    self.wfile.write(response_text.encode('utf-8'))
                # Sinon on a eu un problème donc on retourne le problème
                else:
                    self.send_response(response.status_code)
                    self.send_header("Content-type", "application/xml")
                    self.send_header("Content-Length", str(len(response.text.encode('utf-8'))))
                    self.end_headers()
                    self.wfile.write(response.text.encode('utf-8'))
            else:
                self.send_response(404)
                self.end_headers()
                self.wfile.write(b'404 Not Found')            
        # Autrement on renvoie un 404 
        else:
            self.send_response(404)
            self.end_headers()
            self.wfile.write(b'404 Not Found')

def run(server_class=HTTPServer, handler_class=RequestHandler, port=7005):
    server_address = ('', port)
    httpd = server_class(server_address, handler_class)
    print(f'Starting server on port {port}...')
    httpd.serve_forever()

if __name__ == '__main__':
    run()
