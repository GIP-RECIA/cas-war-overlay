package org.apereo.cas.config;

import org.apereo.cas.interrupt.InterruptInquirer;
import org.apereo.cas.interrupt.InterruptInquiryExecutionPlanConfigurer;
import org.apereo.cas.interrupt.DomainChangeInterruptInquirer;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.autoconfigure.AutoConfiguration;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;

import org.apereo.cas.configuration.CasConfigurationProperties;

@AutoConfiguration
@EnableConfigurationProperties(CasConfigurationProperties.class)
public class CustomInterruptConfiguration {

    @Autowired
    private CasConfigurationProperties casProperties;

    @Bean
    public InterruptInquirer domainChangeInterruptInquirer() {
        return new DomainChangeInterruptInquirer(casProperties);
    }

    @Bean
    public InterruptInquiryExecutionPlanConfigurer customInterruptConfigurer(@Qualifier("domainChangeInterruptInquirer") InterruptInquirer domainChangeInterruptInquirer) {
        return plan -> {
            plan.registerInterruptInquirer(domainChangeInterruptInquirer);
        };
    }

}