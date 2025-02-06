package org.apereo.cas.config;

import org.apereo.cas.scim.v2.CustomScimPrincipalAttributeMapper;
import org.apereo.cas.scim.v2.ScimV2PrincipalAttributeMapper;
import org.springframework.boot.autoconfigure.AutoConfiguration;
import org.springframework.context.annotation.Bean;

@AutoConfiguration
public class ScimV2PrincipalAttributeMapperConfiguration {

    @Bean
    public ScimV2PrincipalAttributeMapper scim2PrincipalAttributeMapper() {
        return new CustomScimPrincipalAttributeMapper();
    }

}
