"""
Serveur python simulant un service web.
Il n'est pas là pour faire les requêtes (ce sont les scripts de test qui les font) mais pour pour faire valider des ST.
Il simule aussi une API SCIM et affiche des informations en fonction des requêtes qu'il a reçu.
"""

import urllib3
import json
from http.server import BaseHTTPRequestHandler, HTTPServer
from constants import CAS_BASE_URL, SERVICE_SCIM_URL
from utils import validate_ticket_to_cas

urllib3.disable_warnings()

# Tracker les résultats des différentes requêtes nécéssaires
results={"USER_GET": False,
    "USER_POST": False,
    "ETAB_GET": False,
    "ETAB_POST": False,
    "CLASS_GET": False,
    "CLASS_POST": False,
    "ETAB_PATCH": False,
    "CLASS_PATCH": False}

class RequestHandler(BaseHTTPRequestHandler):

    def do_GET(self):
        if "/Users" in self.path or "/Groups" in self.path:
            response_data = {"schemas":["urn:ietf:params:scim:api:messages:2.0:ListResponse"],"totalResults":0,"Resources":[],"startIndex":1,"itemsPerPage":20}
            send_json_reponse(self, 200, json.dumps(response_data))
            if self.path == "/scim/v2/Users?filter=userName+eq+%22test1%22":
                results["USER_GET"] = True
            if self.path == "/scim/v2/Groups?filter=displayName+eq+%220290009C%22":
                results["ETAB_GET"] = True
            if self.path == "/scim/v2/Groups?filter=displayName+eq+%220290009C%2FTS2%22":
                results["CLASS_GET"] = True
        elif "/status" in self.path:
            send_json_reponse(self, 200, json.dumps(results))
        else:
            validate_ticket_to_cas(self, SERVICE_SCIM_URL, CAS_BASE_URL)
    
    def do_POST(self):
        if "/Users" in self.path:
            post_data = self.rfile.read(int(self.headers['Content-Length']))
            response_data = {"schemas":["urn:ietf:params:scim:schemas:core:2.0:User","urn:ietf:params:scim:schemas:extension:idruide:education:2.0:User"],"id":"00000000000000000000000","meta":{"resourceType":"User","location":"http://localhost:8036/scim/v2/Users/00000000000000000000000"},"userName":"test1","name":{"familyName":"TEST","givenName":"Test"},"active":True,"emails":[{"value":"test.test@test.com","type":"work"}],"urn:ietf:params:scim:schemas:extension:idruide:education:2.0:User":{"educationUserType":"student"}}
            send_json_reponse(self, 201, json.dumps(response_data))
            if post_data.decode('utf-8') == '{"schemas":["urn:ietf:params:scim:schemas:extension:idruide:education:2.0:User","urn:ietf:params:scim:schemas:core:2.0:User"],"userName":"test1","emails":[{"primary":true,"value":"test.test@test.com"}],"name":{"givenName":"Test","familyName":"TEST"},"meta":{"resourceType":"User"},"active":true,"urn:ietf:params:scim:schemas:extension:idruide:education:2.0:User":{"educationUserType":"student"}}':
                results["USER_POST"] = True
        elif "/Groups" in self.path:
            post_data = self.rfile.read(int(self.headers['Content-Length']))
            data = json.loads(post_data.decode('utf-8'))
            if data["urn:ietf:params:scim:schemas:extension:idruide:education:2.0:Group"]["educationGroupType"] == "establishment":
                response_data = {"schemas":["urn:ietf:params:scim:schemas:core:2.0:Group","urn:ietf:params:scim:schemas:extension:idruide:education:2.0:Group"],"id":"est.1111111111111111111","meta":{"resourceType":"Group","location":"http://localhost:8036/scim/v2/Groups/est.1111111111111111111"},"displayName":"0290009C","urn:ietf:params:scim:schemas:extension:idruide:education:2.0:Group":{"educationGroupType":"establishment","establishment":{"identifier":"0290009C","address":{"streetAddress":"","locality":"","postalCode":"","country":""}}}}
                send_json_reponse(self, 201, json.dumps(response_data))
                if post_data.decode('utf-8') == '{"schemas":["urn:ietf:params:scim:schemas:core:2.0:Group","urn:ietf:params:scim:schemas:extension:idruide:education:2.0:Group"],"displayName":"0290009C","meta":{"resourceType":"Group"},"urn:ietf:params:scim:schemas:extension:idruide:education:2.0:Group":{"educationGroupType":"establishment","establishment":{"identifier":"0290009C","address":{"streetAddress":"","locality":"","postalCode":"","country":""}}}}':
                    results["ETAB_POST"] = True
            elif data["urn:ietf:params:scim:schemas:extension:idruide:education:2.0:Group"]["educationGroupType"] == "class":
                response_data = {"schemas":["urn:ietf:params:scim:schemas:core:2.0:Group","urn:ietf:params:scim:schemas:extension:idruide:education:2.0:Group"],"id":"cls.22222222222222222222","meta":{"resourceType":"Group","location":"http://localhost:8036/scim/v2/Groups/cls.22222222222222222222"},"displayName":"0290009C/TS2","urn:ietf:params:scim:schemas:extension:idruide:education:2.0:Group":{"educationGroupType":"class"}}
                send_json_reponse(self, 201, json.dumps(response_data))
                if post_data.decode('utf-8') == '{"schemas":["urn:ietf:params:scim:schemas:core:2.0:Group","urn:ietf:params:scim:schemas:extension:idruide:education:2.0:Group"],"displayName":"0290009C/TS2","meta":{"resourceType":"Group"},"urn:ietf:params:scim:schemas:extension:idruide:education:2.0:Group":{"educationGroupType":"class","class":{"grade":""}}}':
                    results["CLASS_POST"] = True
            else:
                self.send_response(500)
                self.end_headers()
                self.wfile.write(b'Internal server error')

    def do_PATCH(self):
        if "/Groups" in self.path:
            post_data = self.rfile.read(int(self.headers['Content-Length']))
            data = json.loads(post_data.decode('utf-8'))
            if data["Operations"][0]["value"][0]["value"] == "cls.22222222222222222222":
                response_data = {"schemas":["urn:ietf:params:scim:schemas:core:2.0:Group","urn:ietf:params:scim:schemas:extension:idruide:education:2.0:Group"],"id":"est.1111111111111111111","meta":{"resourceType":"Group","location":"http://localhost:8036/scim/v2/Groups/est.1111111111111111111"},"displayName":"0290009C","members":[{"value":"cls.22222222222222222222","$ref":"http://localhost:8036/scim/v2/Groups/cls.22222222222222222222","type":"Group"}],"urn:ietf:params:scim:schemas:extension:idruide:education:2.0:Group":{"educationGroupType":"establishment","establishment":{"identifier":"0290009C","address":{"streetAddress":"","locality":"","postalCode":"","country":""}}}}
                send_json_reponse(self, 200, json.dumps(response_data))
                if post_data.decode('utf-8') == '{"schemas":["urn:ietf:params:scim:api:messages:2.0:PatchOp"],"Operations":[{"path":"members","op":"add","value":[{"value":"cls.22222222222222222222"}]}]}':
                    results["ETAB_PATCH"] = True
            elif data["Operations"][0]["value"][0]["value"] == "00000000000000000000000":
                response_data = {"schemas":["urn:ietf:params:scim:schemas:core:2.0:Group","urn:ietf:params:scim:schemas:extension:idruide:education:2.0:Group"],"id":"cls.22222222222222222222","meta":{"resourceType":"Group","location":"http://localhost:8036/scim/v2/Groups/cls.22222222222222222222"},"displayName":"0290009C/TS2","members":[{"value":"cls.00000000000000000000000","$ref":"http://localhost:8036/scim/v2/Users/00000000000000000000000","type":"Group"}],"urn:ietf:params:scim:schemas:extension:idruide:education:2.0:Group":{"educationGroupType":"class"}}
                send_json_reponse(self, 200, json.dumps(response_data))
                if post_data.decode('utf-8') == '{"schemas":["urn:ietf:params:scim:api:messages:2.0:PatchOp"],"Operations":[{"path":"members","op":"add","value":[{"value":"00000000000000000000000"}]}]}':
                    results["CLASS_PATCH"] = True
            else:
                self.send_response(500)
                self.end_headers()
                self.wfile.write(b'Internal server error')

def run(server_class=HTTPServer, handler_class=RequestHandler, port=8048):
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