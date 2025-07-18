"""
Fichier python contenant des méthodes utiles aux différents serveurs de test.
"""

import requests

def validate_ticket_to_cas(request_handler, service_url, cas_url):
    """
    Méthode pour faire valider un ST au serveur CAS et répondre un 200 au client de test dans le cas ou il est valide
    """
    if 'ticket' in request_handler.path:
        # On fait valider le ST au serveur CAS : si le serveur CAS répond OK alors on répondra OK aussi
        ST = request_handler.path.split('ticket')[1]
        ST = ST[1:len(ST)]
        request_url = cas_url+"/serviceValidate?service="+service_url+"&ticket="+ST
        response = requests.get(request_url, verify=False)
        # Si on a cas:authenticationSuccess alors c'est OK
        if ('cas:authenticationSuccess' in response.text) and (response.status_code==200):
            request_handler.send_response(200)
            request_handler.send_header('Content-type', 'text/html')
            request_handler.end_headers()
            request_handler.wfile.write(f"SUCCESS SERVICE={service_url}".encode('utf-8'))
        # Sinon on a eu un problème donc on retourne un 404
        else:
            request_handler.send_response(404)
            request_handler.end_headers()
            request_handler.wfile.write(b'404 Not Found')
    else:
        request_handler.send_response(404)
        request_handler.end_headers()
        request_handler.wfile.write(b'404 Not Found')


def validate_ticket_to_cas_and_return_attributes(request_handler, service_url, cas_url):
    """
    Méthode pour faire valider un ST au serveur CAS et répondre un 200 au client de test dans le cas ou il est valide
    Retourne aussi les attributs donnés par le CAS au service directement dans le body de la page sous format xml
    """
    if 'ticket' in request_handler.path:
        # On fait valider le ST au serveur CAS : si le serveur CAS répond OK alors on répondra OK aussi
        ST = request_handler.path.split('ticket')[1]
        ST = ST[1:len(ST)]
        request_url = cas_url+"/serviceValidate?service="+service_url+"&ticket="+ST
        response = requests.get(request_url, verify=False)
        # Si on a cas:authenticationSuccess alors c'est OK
        if ('cas:authenticationSuccess' in response.text) and (response.status_code==200):
            response_text = response.text + f"<!-- SERVICE={service_url} -->"
            request_handler.send_response(200)
            request_handler.send_header("Content-type", "application/xml")
            request_handler.send_header("Content-Length", str(len(response_text.encode('utf-8'))))
            request_handler.end_headers()
            request_handler.wfile.write(response_text.encode('utf-8'))
        # Sinon on a eu un problème donc on retourne le problème
        else:
            request_handler.send_response(response.status_code)
            request_handler.send_header("Content-type", "application/xml")
            request_handler.send_header("Content-Length", str(len(response.text.encode('utf-8'))))
            request_handler.end_headers()
            request_handler.wfile.write(response.text.encode('utf-8'))
    else:
        request_handler.send_response(404)
        request_handler.end_headers()
        request_handler.wfile.write(b'404 Not Found')

def handle_logout_request(request_handler):
    """
    Méthode pour traiter une requête de logout envoyée par le serveur CAS.
    Retourne le nom du principal déconnecté si la déconnexion a été réalisée, sinon None.
    """
    # Récupérer le contenu de la requête pour voir le principal
    try:
        content_length = int(request_handler.headers['Content-Length'])
        post_data = request_handler.rfile.read(content_length)
        post_data = post_data.decode('utf-8')
        post_data_nameid = post_data.split("%3C%2Fsaml%3ANameID%3E%3C")[0]
        nameid = post_data_nameid[post_data_nameid.rindex('%3E')+3:]
        # Si logoutRequest est dans le contenu alors c'est OK
        if "logoutRequest" in post_data:
            return nameid
        return None
    except:
        return None
    
def send_logout_status(request_handler, is_logged_in, principal):
    """
    Méthode pour envoyer au client de test le statut actuel de la session (connecté ou non).
    Se base sur le paramètre is_logged_in qui tracke la connexion.
    """
    request_handler.send_response(200)
    request_handler.send_header('Content-type', 'text/html')
    request_handler.end_headers()
    request_handler.wfile.write(f"LOGGED IN={is_logged_in} PRINCIPAL={principal}".encode('utf-8'))