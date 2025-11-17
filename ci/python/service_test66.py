"""
Serveur python simulant un service web.
Il n'est pas là pour faire les requêtes (ce sont les scripts de test qui les font) mais pour pour faire valider des ST et le SLO.
Utilisé comme service pour tester si le partial logout fonctionne bien sur le CAS.
"""

import urllib3
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from constants import CAS_BASE_URL, SERVICE_PARTIAL_SLO_URL
from utils import validate_ticket_to_cas_and_return_attributes, handle_logout_request, send_logout_status
from ldap3 import Server, Connection, MODIFY_REPLACE

urllib3.disable_warnings()

data={"principal": None}
server = Server('ldap://localhost:389')
conn = Connection(server, user='cn=admin,ou=administrateurs,dc=esco-centre,dc=fr', password='admin')
conn.bind()

class RequestHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        if "checkLogout" in self.path:
            send_logout_status(self, data["logged_in"], data["principal"])
        elif "modifyLdap" in self.path:
            conn.modify("uid=F15abc,ou=people,dc=esco-centre,dc=fr", {"mail": [(MODIFY_REPLACE, ["test15.test15@test.com"])]})
            self.send_response(200)
            self.send_header('Content-type', 'text/html')
            self.end_headers()
            self.wfile.write(f"{str(conn.result)}".encode('utf-8'))
        else:
            validate_ticket_to_cas_and_return_attributes(self, SERVICE_PARTIAL_SLO_URL, CAS_BASE_URL)
            data["logged_in"] = True
    
    def do_POST(self):
        if "logout" in self.path:
            logout_reponse = handle_logout_request(self)
            if logout_reponse != None:
                data["logged_in"] = False
                data["principal"] = logout_reponse

# Attention ici on utilise ThreadingHTTPServer car on a des requêtes qui viennent de plusieurs clients en se mélangeant
def run(server_class=ThreadingHTTPServer, handler_class=RequestHandler, port=8066):
    server_address = ('', port)
    httpd = server_class(server_address, handler_class)
    print(f'Starting server on port {port}...')
    httpd.serve_forever()

if __name__ == '__main__':
    run()
