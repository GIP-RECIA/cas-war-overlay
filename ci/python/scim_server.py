"""
Serveur python simulant un serveur SCIM
Permet de renvoyer des fausses réponses pour des tests sur des services données.
"""

import urllib3
import json
from http.server import BaseHTTPRequestHandler, HTTPServer

urllib3.disable_warnings()

# Enregistrer les résultats des différentes requêtes nécéssaires
results48={"USER_GET": False,
    "USER_POST": False,
    "ETAB_GET": False,
    "ETAB_POST": False,
    "CLASS_GET": False,
    "CLASS_POST": False,
    "ETAB_PATCH": False,
    "CLASS_PATCH": False}

results49={"USER_GET": False,
    "ETAB_GET": False,
    "CLASS_GET": False,
    "CLASS_ADD": False,
    "CLASS_REMOVE": False}

class RequestHandler(BaseHTTPRequestHandler):

    def do_GET(self):
        """
        Réponse à une requete GET, utile pour la création et la modification
        """
        if "/Users" in self.path or "/Groups" in self.path:
            # GET pour la création => ne retourne pas de données
            if(self.headers["Authorization"] == "Basic dXNlcm5hbWUxOnBhc3N3b3JkMQ=="):
                response_data = {"schemas":["urn:ietf:params:scim:api:messages:2.0:ListResponse"],"totalResults":0,"Resources":[],"startIndex":1,"itemsPerPage":20}
                send_json_reponse(self, 200, json.dumps(response_data))
                if self.path == "/scim/v2/Users?filter=userName+eq+%22test1%22":
                    results48["USER_GET"] = True
                if self.path == "/scim/v2/Groups?filter=displayName+eq+%220290009C%22":
                    results48["ETAB_GET"] = True
                if self.path == "/scim/v2/Groups?filter=displayName+eq+%220290009C%2FTS2%22":
                    results48["CLASS_GET"] = True
            # GET pour la modification => retourne des données existantes 
            if(self.headers["Authorization"] == "Basic dXNlcm5hbWUyOnBhc3N3b3JkMg=="):
                if self.path == "/scim/v2/Users?filter=userName+eq+%22test1%22":
                    response_data = {"schemas":["urn:ietf:params:scim:api:messages:2.0:ListResponse"],"totalResults":1,"Resources":[{"schemas":["urn:ietf:params:scim:schemas:core:2.0:User","urn:ietf:params:scim:schemas:extension:idruide:education:2.0:User"],"id":"33333333333333333333333333","meta":{"resourceType":"User","location":"https://scim.v1.idruide.eu/scim/v2/Users/33333333333333333333333333"},"userName":"test1","name":{"familyName":"TEST","givenName":"Test"},"active":True,"emails":[{"value":"test.test@test.com","type":"work"}],"groups":[{"value":"cls.5555555555555555555555555555","$ref":"https://scim.v1.idruide.eu/scim/v2/Groups/cls.5555555555555555555555555555","type":"direct"},{"value":"est.4444444444444444444444444444","$ref":"https://scim.v1.idruide.eu/scim/v2/Groups/est.4444444444444444444444444444","type":"indirect"}],"urn:ietf:params:scim:schemas:extension:idruide:education:2.0:User":{"educationUserType":"student"}}],"startIndex":1,"itemsPerPage":20}
                    send_json_reponse(self, 200, json.dumps(response_data))
                    results49["USER_GET"] = True
                if self.path == "/scim/v2/Groups?filter=displayName+eq+%220290009C%22":
                    response_data = {"schemas":["urn:ietf:params:scim:api:messages:2.0:ListResponse"],"totalResults":1,"Resources":[{"schemas":["urn:ietf:params:scim:schemas:core:2.0:Group","urn:ietf:params:scim:schemas:extension:idruide:education:2.0:Group"],"id":"est.66666666666666666666666","meta":{"resourceType":"Group","location":"https://scim.v1.idruide.eu/scim/v2/Groups/est.66666666666666666666666"},"displayName":"0290009C","urn:ietf:params:scim:schemas:extension:idruide:education:2.0:Group":{"educationGroupType":"establishment","establishment":{"identifier":"0290009C","address":{"streetAddress":"","locality":"","postalCode":"","country":""}}}}],"startIndex":1,"itemsPerPage":1}
                    send_json_reponse(self, 200, json.dumps(response_data))
                    results49["ETAB_GET"] = True
                if self.path == "/scim/v2/Groups?filter=displayName+eq+%220290009C%2FTS2%22":
                    response_data = {"schemas":["urn:ietf:params:scim:api:messages:2.0:ListResponse"],"totalResults":1,"Resources":[{"schemas":["urn:ietf:params:scim:schemas:core:2.0:Group","urn:ietf:params:scim:schemas:extension:idruide:education:2.0:Group"],"id":"cls.777777777777777777777","meta":{"resourceType":"Group","location":"https://scim.v1.idruide.eu/scim/v2/Groups/cls.777777777777777777777"},"displayName":"0290009C/TS2","urn:ietf:params:scim:schemas:extension:idruide:education:2.0:Group":{"educationGroupType":"class"}}],"startIndex":1,"itemsPerPage":1}
                    send_json_reponse(self, 200, json.dumps(response_data))
                    results49["CLASS_GET"] = True
        # /status permet de savoir si les bonnes requêtes ont été faites
        elif "/status/48" in self.path:
            send_json_reponse(self, 200, json.dumps(results48))
        elif "/status/49" in self.path:
            send_json_reponse(self, 200, json.dumps(results49))

    def do_POST(self):
        """
        Réponse à une requete POST, utile pour la création seulement
        """
        if(self.headers["Authorization"] == "Basic dXNlcm5hbWUxOnBhc3N3b3JkMQ=="):
            # Création d'un utilisateur
            if "/Users" in self.path:
                post_data = self.rfile.read(int(self.headers['Content-Length']))
                response_data = {"schemas":["urn:ietf:params:scim:schemas:core:2.0:User","urn:ietf:params:scim:schemas:extension:idruide:education:2.0:User"],"id":"00000000000000000000000","meta":{"resourceType":"User","location":"http://localhost:8036/scim/v2/Users/00000000000000000000000"},"userName":"test1","name":{"familyName":"TEST","givenName":"Test"},"active":True,"emails":[{"value":"test.test@test.com","type":"work"}],"urn:ietf:params:scim:schemas:extension:idruide:education:2.0:User":{"educationUserType":"student"}}
                send_json_reponse(self, 201, json.dumps(response_data))
                if post_data.decode('utf-8') == '{"schemas":["urn:ietf:params:scim:schemas:extension:idruide:education:2.0:User","urn:ietf:params:scim:schemas:core:2.0:User"],"userName":"test1","emails":[{"primary":true,"value":"test.test@test.com"}],"name":{"givenName":"Test","familyName":"TEST"},"meta":{"resourceType":"User"},"active":true,"urn:ietf:params:scim:schemas:extension:idruide:education:2.0:User":{"educationUserType":"student"}}':
                    results48["USER_POST"] = True
            elif "/Groups" in self.path:
                post_data = self.rfile.read(int(self.headers['Content-Length']))
                data = json.loads(post_data.decode('utf-8'))
                # Création d'un établissement
                if data["urn:ietf:params:scim:schemas:extension:idruide:education:2.0:Group"]["educationGroupType"] == "establishment":
                    response_data = {"schemas":["urn:ietf:params:scim:schemas:core:2.0:Group","urn:ietf:params:scim:schemas:extension:idruide:education:2.0:Group"],"id":"est.1111111111111111111","meta":{"resourceType":"Group","location":"http://localhost:8036/scim/v2/Groups/est.1111111111111111111"},"displayName":"0290009C","urn:ietf:params:scim:schemas:extension:idruide:education:2.0:Group":{"educationGroupType":"establishment","establishment":{"identifier":"0290009C","address":{"streetAddress":"","locality":"","postalCode":"","country":""}}}}
                    send_json_reponse(self, 201, json.dumps(response_data))
                    if post_data.decode('utf-8') == '{"schemas":["urn:ietf:params:scim:schemas:core:2.0:Group","urn:ietf:params:scim:schemas:extension:idruide:education:2.0:Group"],"displayName":"0290009C","meta":{"resourceType":"Group"},"urn:ietf:params:scim:schemas:extension:idruide:education:2.0:Group":{"educationGroupType":"establishment","establishment":{"identifier":"0290009C","address":{"streetAddress":"","locality":"","postalCode":"","country":""}}}}':
                        results48["ETAB_POST"] = True
                # Création d'une classe
                elif data["urn:ietf:params:scim:schemas:extension:idruide:education:2.0:Group"]["educationGroupType"] == "class":
                    response_data = {"schemas":["urn:ietf:params:scim:schemas:core:2.0:Group","urn:ietf:params:scim:schemas:extension:idruide:education:2.0:Group"],"id":"cls.22222222222222222222","meta":{"resourceType":"Group","location":"http://localhost:8036/scim/v2/Groups/cls.22222222222222222222"},"displayName":"0290009C/TS2","urn:ietf:params:scim:schemas:extension:idruide:education:2.0:Group":{"educationGroupType":"class"}}
                    send_json_reponse(self, 201, json.dumps(response_data))
                    if post_data.decode('utf-8') == '{"schemas":["urn:ietf:params:scim:schemas:core:2.0:Group","urn:ietf:params:scim:schemas:extension:idruide:education:2.0:Group"],"displayName":"0290009C/TS2","meta":{"resourceType":"Group"},"urn:ietf:params:scim:schemas:extension:idruide:education:2.0:Group":{"educationGroupType":"class","class":{"grade":""}}}':
                        results48["CLASS_POST"] = True
                else:
                    self.send_response(500)
                    self.end_headers()
                    self.wfile.write(b'Wrong parameter for POST /Groups')
            else:
                self.send_response(500)
                self.end_headers()
                self.wfile.write(b'Wrong parameter for POST /Users')
        else:
            self.send_response(500)
            self.end_headers()
            self.wfile.write(b'No POST should be sent for'+self.headers["Authorization"])

    def do_PATCH(self):
        """
        Réponse à une requete PATCH, utile pour la création et la modification (en partie)
        """
        # PATCH suite à une création
        if(self.headers["Authorization"] == "Basic dXNlcm5hbWUxOnBhc3N3b3JkMQ=="):
            if "/Groups" in self.path:
                post_data = self.rfile.read(int(self.headers['Content-Length']))
                data = json.loads(post_data.decode('utf-8'))
                # Ajout de la classe dans l'établissement
                if data["Operations"][0]["value"][0]["value"] == "cls.22222222222222222222":
                    response_data = {"schemas":["urn:ietf:params:scim:schemas:core:2.0:Group","urn:ietf:params:scim:schemas:extension:idruide:education:2.0:Group"],"id":"est.1111111111111111111","meta":{"resourceType":"Group","location":"http://localhost:8036/scim/v2/Groups/est.1111111111111111111"},"displayName":"0290009C","members":[{"value":"cls.22222222222222222222","$ref":"http://localhost:8036/scim/v2/Groups/cls.22222222222222222222","type":"Group"}],"urn:ietf:params:scim:schemas:extension:idruide:education:2.0:Group":{"educationGroupType":"establishment","establishment":{"identifier":"0290009C","address":{"streetAddress":"","locality":"","postalCode":"","country":""}}}}
                    send_json_reponse(self, 200, json.dumps(response_data))
                    if post_data.decode('utf-8') == '{"schemas":["urn:ietf:params:scim:api:messages:2.0:PatchOp"],"Operations":[{"path":"members","op":"add","value":[{"value":"cls.22222222222222222222"}]}]}':
                        results48["ETAB_PATCH"] = True
                # Ajout de l'utilisateur dans la classe
                elif data["Operations"][0]["value"][0]["value"] == "00000000000000000000000":
                    response_data = {"schemas":["urn:ietf:params:scim:schemas:core:2.0:Group","urn:ietf:params:scim:schemas:extension:idruide:education:2.0:Group"],"id":"cls.22222222222222222222","meta":{"resourceType":"Group","location":"http://localhost:8036/scim/v2/Groups/cls.22222222222222222222"},"displayName":"0290009C/TS2","members":[{"value":"00000000000000000000000","$ref":"http://localhost:8036/scim/v2/Users/00000000000000000000000","type":"User"}],"urn:ietf:params:scim:schemas:extension:idruide:education:2.0:Group":{"educationGroupType":"class"}}
                    send_json_reponse(self, 200, json.dumps(response_data))
                    if post_data.decode('utf-8') == '{"schemas":["urn:ietf:params:scim:api:messages:2.0:PatchOp"],"Operations":[{"path":"members","op":"add","value":[{"value":"00000000000000000000000"}]}]}':
                        results48["CLASS_PATCH"] = True
                else:
                    self.send_response(500)
                    self.end_headers()
                    self.wfile.write(b'Wrong parameter for PATCH /Groups')
        # PATCH suite à une modification
        elif(self.headers["Authorization"] == "Basic dXNlcm5hbWUyOnBhc3N3b3JkMg=="):
            if "/Groups" in self.path:
                post_data = self.rfile.read(int(self.headers['Content-Length']))
                data = json.loads(post_data.decode('utf-8'))
                # Ajout de l'utilisateur dans sa nouvelle classe
                if data["Operations"][0]["value"][0]["value"] == "33333333333333333333333333" and "cls.777777777777777777777" in self.path\
                    and post_data.decode('utf-8') == '{"schemas":["urn:ietf:params:scim:api:messages:2.0:PatchOp"],"Operations":[{"path":"members","op":"add","value":[{"value":"33333333333333333333333333"}]}]}':
                    response_data = {"schemas":["urn:ietf:params:scim:schemas:core:2.0:Group","urn:ietf:params:scim:schemas:extension:idruide:education:2.0:Group"],"id":"cls.777777777777777777777","meta":{"resourceType":"Group","location":"http://localhost:8036/scim/v2/Groups/cls.777777777777777777777"},"displayName":"0290009C/TS2","members":[{"value":"33333333333333333333333333","$ref":"http://localhost:8036/scim/v2/Users/33333333333333333333333333","type":"User"}],"urn:ietf:params:scim:schemas:extension:idruide:education:2.0:Group":{"educationGroupType":"class"}}
                    send_json_reponse(self, 200, json.dumps(response_data))
                    results49["CLASS_REMOVE"] = True
                # Suppression de l'utilisateur de son ancienne classe
                elif data["Operations"][0]["value"][0]["value"] == "33333333333333333333333333" and "cls.5555555555555555555555555555" in self.path\
                    and post_data.decode('utf-8') == '{"schemas":["urn:ietf:params:scim:api:messages:2.0:PatchOp"],"Operations":[{"path":"members","op":"remove","value":[{"value":"33333333333333333333333333"}]}]}':
                    response_data = {"schemas":["urn:ietf:params:scim:schemas:core:2.0:Group","urn:ietf:params:scim:schemas:extension:idruide:education:2.0:Group"],"id":"cls.5555555555555555555555555555","meta":{"resourceType":"Group","location":"http://localhost:8036/scim/v2/Groups/cls.5555555555555555555555555555"},"displayName":"0290009C/TS3","members":[],"urn:ietf:params:scim:schemas:extension:idruide:education:2.0:Group":{"educationGroupType":"class"}}
                    send_json_reponse(self, 200, json.dumps(response_data))
                    results49["CLASS_ADD"] = True                    
                else:
                    self.send_response(500)
                    self.end_headers()
                    self.wfile.write(b'Wrong parameter for PATCH /Groups')
        else:
            self.send_response(500)
            self.end_headers()
            self.wfile.write(b'Unknown client for PATCH request')

def run(server_class=HTTPServer, handler_class=RequestHandler, port=7003):
    server_address = ('', port)
    httpd = server_class(server_address, handler_class)
    print(f'Starting server on port {port}...')
    httpd.serve_forever()

def send_json_reponse(request_handler, return_code, json_data):
    request_handler.send_response(return_code)
    request_handler.send_header("Content-type", "application/scim+json")
    request_handler.end_headers()
    request_handler.wfile.write(json_data.encode("utf-8"))

if __name__ == '__main__':
    run()