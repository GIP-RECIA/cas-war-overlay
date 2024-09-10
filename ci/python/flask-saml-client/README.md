# Python Flask SAML Client

Projet basé sur l'exemple `demo-flask` de https://github.com/SAML-Toolkits/python3-saml

Installation de l'envrionnement avec pyenv :
- pyenv install 3.11.5
- pyenv virtualenv 3.11.5 saml
- pyenv activate saml
- pip install Flask
- pip install python3-saml

Générer des certificats pour le SP dans le dossier certs : `openssl req -new -x509 -days 3652 -nodes -out sp.crt -keyout sp.key`
Les paramètres se trouvent dans le fichier `saml/certs/settings.json` ou directement dans le code du `index.py`

Lancer le client : `python3 index.py`