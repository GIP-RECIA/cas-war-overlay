import org.apereo.cas.web.*
import org.pac4j.core.context.*
import org.apereo.cas.pac4j.*
import org.apereo.cas.web.support.*
import java.util.stream.*
import java.util.*
import org.apereo.cas.configuration.model.support.delegation.*

def run(Object[] args) {
    def (requestContext,service,registeredService,providers,applicationContext,logger) = args
    providers.forEach(provider -> {
        logger.info("Checking ${provider.name}...")
        if (provider.name.equals(requestContext.getRequestParameters().get("idpId"))) {
            provider.autoRedirectType = DelegationAutoRedirectTypes.SERVER
            return provider
        }
    })
    return null
}
