import java.util.*

def run(final Object... args) {
    def (currentAttributes,logger,principal,service) = args
    logger.error("Current attributes received are {}", currentAttributes)
    // Dans ce cas spécifique on veut retourner un vecteur d'indentité qui n'existe pas dans le LDAP pour lever une exception
    if(currentAttributes.get("mail")[0] == "test11.test@test.com"){
        return ["FrEduCtRefId":['AAF50000', 'AAF60000', 'ECT10000', 'ECT-ENT20000'], "FrEduCtId":['10000'], 'FrEduCtOpaqueId': ['10000']]
    }
    // Dans les autres cas on retourne un vecteur d'identité qui existe vraiment en fonction de l'utilisateur qu'on demande
    if(currentAttributes.get("mail")[0] == "test12.test@test.com"){
        return ["FrEduCtRefId":['AAF12', 'ECT120', 'ECT-ENT121'], "FrEduCtId":['120'], 'FrEduCtOpaqueId': ['120']]
    }
    // Par défaut on retourne ce vecteur d'identité là
    return ["FrEduCtRefId":['AAF5', 'AAF6', 'ECT1', 'ECT-ENT2'], "FrEduCtId":['1'], 'FrEduCtOpaqueId': ['1']]
    
}
