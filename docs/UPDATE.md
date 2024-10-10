# Mettre à jour le serveur CAS

La procédure pour mettre à jour le serveur CAS en cas de montée de version est assistée par un script prévu à cet effet. Pour le lancer il suffit de se placer à la racine du projet et de faire un `./update.sh` (attention à bien avoir meld d'installé). 

Le script va alors ouvrir meld ce qui va permettre d'intégrer les modifiactions des nouveaux fichiers (fichiers avec _version dans le nom) dans les anciens fichiers (fichiers avec le nom de base). Dans les grandes lignes, les différentes étapes d'une mise à jour sont donc les suivantes :

1- Mise à jour du `gradle.properties` et du `build.gradle` par rapport aux fichiers d'un overlay nouvellement généré. Ne pas oublier non plus de mettre à jour dans le README la nouvelle version de base du serveur CAS.

2- Mise à jour des fichiers du code source de base qui sont modifiés localement. L'objecif est de reporter les modifications si il y en a eu avec une nouvelle version.

3- Tester que le code compile bien et passe la CI avec un `./start-ci`.

4- Déployer en test la nouvelle version du serveur CAS. Redémarrer le serveur et vérifier que tout fonctionne encore correctement. Vérifier la connexion aux différents services avec différents protocoles et l'authentification locale et déléguée.

5- Vérifier que les tests de montée en charge passent. Pour savoir quelles sont les étapes à réaliser, on peut regarder le projet [https://github.com/GIP-RECIA/cas-load-testing](https://github.com/GIP-RECIA/cas-load-testing).