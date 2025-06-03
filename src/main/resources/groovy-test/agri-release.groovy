import java.util.*

def run(final Object... args) {
    def (currentAttributes,logger,principal,service) = args
    logger.error("Current attributes received are {}", currentAttributes)
    // Dans ce cas spécifique on veut retourner un mail qui n'existe pas dans le LDAP pour lever une exception
    if(currentAttributes.get("mail")[0] == "test10.test@idp1.com"){
        return [mail:["invalid.test@nodomain.com"]]
    }
    // Dans les autres cas on retourne un mail qui existe vraiment
    return [mail:["test7.test@idp1.com"]]
}
