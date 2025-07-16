package org.apereo.cas.interrupt;

import java.util.regex.Pattern;
import java.util.regex.Matcher;
import org.apereo.cas.authentication.Authentication;
import org.apereo.cas.authentication.Credential;
import org.apereo.cas.authentication.credential.UsernamePasswordCredential;
import org.apereo.cas.authentication.principal.Service;
import org.apereo.cas.configuration.CasConfigurationProperties;
import org.apereo.cas.services.RegisteredService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.webflow.execution.RequestContext;

import java.util.Map;

public class CerbereValidationInterruptInquirer extends BaseInterruptInquirer {

    /**
     * Logger instance.
     */
    Logger LOGGER = LoggerFactory.getLogger(CerbereValidationInterruptInquirer.class);

    private String attributeToEvalute;
    private String valueToExpect;
    private String cerbereRedirectUrl;
    private Pattern cerbereIdRegex;

    /**
     * Constructor
     * @param casProperties configuration properties
     */
    public CerbereValidationInterruptInquirer(CasConfigurationProperties casProperties){
        this.attributeToEvalute = casProperties.getCustom().getProperties().get("cerbere.validation.attribute-to-evaluate");
        this.valueToExpect = casProperties.getCustom().getProperties().get("cerbere.validation.value-to-excpect");
        this.cerbereRedirectUrl = casProperties.getCustom().getProperties().get("cerbere.validation.redirect-url");
        if(casProperties.getCustom().getProperties().get("cerbere.validation.service-id") != null){
            this.cerbereIdRegex = Pattern.compile(casProperties.getCustom().getProperties().get("cerbere.validation.service-id"));
        }
    }

    /**
     * Method called when the login flow is interrupted
     * @param authentication The authentication of the user (principal, attributes, ...)
     * @param registeredService The registered service (in the service registry)
     * @param service The "real" service from where the cas is queried
     * @param credential The credentials of the user
     * @param requestContext The request context in Spring Webflow
     * @return An Interrupt Response if the login flow needs to be interrupted, null otherwise
     */
    @Override
    protected InterruptResponse inquireInternal(Authentication authentication,
                                                RegisteredService registeredService,
                                                Service service,
                                                Credential credential,
                                                RequestContext requestContext) {
        LOGGER.trace("Login flow was interrupted for [{}] by cerbere check", authentication.getPrincipal().getId());
        // If local auth don't check account validation
        if(credential instanceof UsernamePasswordCredential){
            LOGGER.trace("Local authentication : account validation not checked for [{}]", authentication.getPrincipal().getId());
            return null;
        }
        if(!authentication.getPrincipal().getAttributes().get(attributeToEvalute).getFirst().equals(valueToExpect)){
            if(service != null){
                final Matcher matcher = this.cerbereIdRegex.matcher(service.getId());
                // If account is invalid but cerbere is cerbere, do not interrupt the flow
                if(matcher.find()){
                    LOGGER.info("Account [{}] needs to be validated but service is cerbere. Continuing...", authentication.getPrincipal().getId());
                    return null;
                }
            }
            // If account is invalid and service is not cerbere, redirect to cerbere
            LOGGER.info("Redirecting user [{}] to cerbere for account validation", authentication.getPrincipal().getId());
            InterruptResponse interrupt = new InterruptResponse("Validation de la charte", Map.of("Continuer", cerbereRedirectUrl), false, true);
            interrupt.setAutoRedirect(true);
            return interrupt;
        }
        return null;
    }

}
