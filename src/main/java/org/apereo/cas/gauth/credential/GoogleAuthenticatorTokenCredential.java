package org.apereo.cas.gauth.credential;

import module java.base;
import org.apereo.cas.authentication.credential.OneTimeTokenCredential;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

/**
 * This is {@link GoogleAuthenticatorTokenCredential}.
 *
 * @author Misagh Moayyed
 * @since 5.0.0
 */
@NoArgsConstructor(force = true)
@Getter
@Setter
@ToString(callSuper = true)
public class GoogleAuthenticatorTokenCredential extends OneTimeTokenCredential {

    @Serial
    private static final long serialVersionUID = -7570600701132111037L;

    private Long accountId;
    // Customization : add new field to avoid collision with portal parameter
    private String otpToken;

    public GoogleAuthenticatorTokenCredential(final String token, final Long accountId) {
        super(token);
        setAccountId(accountId);
    }
    
    // Field is only used in model to get the value, then we use the normal CAS parameter
    public void setOtpToken(String token) {
        super.setToken(token);
    }

}
