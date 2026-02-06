package org.apereo.cas.logout.slo;

import org.apereo.cas.authentication.principal.attribute.PersonAttributeDao;
import org.apereo.cas.authentication.principal.attribute.PersonAttributes;
import org.apereo.cas.configuration.CasConfigurationProperties;
import org.apereo.cas.persondir.LdaptivePersonAttributeDao;
import org.apereo.cas.logout.LogoutManager;
import org.apereo.cas.logout.LogoutRequestStatus;
import org.apereo.cas.support.events.ticket.CasTicketGrantingTicketDestroyedEvent;
import org.apereo.cas.ticket.Ticket;
import org.apereo.cas.ticket.TicketGrantingTicket;
import org.apereo.cas.ticket.registry.TicketRegistry;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import lombok.val;
import org.apereo.cas.util.spring.beans.BeanContainer;
import org.apereo.inspektr.common.web.ClientInfoHolder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationContext;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;
import java.util.List;
import java.util.Optional;

/**
 * This is {@link DefaultSingleLogoutRequestExecutor}.
 *
 * @author Misagh Moayyed
 * @since 6.5.0
 */
@Slf4j
@RequiredArgsConstructor
public class DefaultSingleLogoutRequestExecutor implements SingleLogoutRequestExecutor {
    private final TicketRegistry ticketRegistry;

    private final LogoutManager logoutManager;

    private final ApplicationContext applicationContext;

    @Autowired
    private CasConfigurationProperties casProperties;

    @Override
    public List<SingleLogoutRequestContext> execute(final String ticketId,
                                                    final HttpServletRequest request,
                                                    final HttpServletResponse response) {
        try {
            val ticket = ticketRegistry.getTicket(ticketId, Ticket.class);
            LOGGER.debug("Ticket [{}] found. Processing logout requests and then deleting the ticket...", ticket.getId());
            val clientInfo = ClientInfoHolder.getClientInfo();
            val logoutRequests = new ArrayList<SingleLogoutRequestContext>();
            if (ticket instanceof final TicketGrantingTicket tgt) {
                val results = logoutManager.performLogout(
                        SingleLogoutExecutionRequest.builder()
                                .ticketGrantingTicket(tgt)
                                .httpServletRequest(Optional.of(request))
                                .httpServletResponse(Optional.of(response))
                                .build());
                results.stream().filter(r -> r.getStatus() == LogoutRequestStatus.FAILURE)
                        .forEach(r -> LOGGER.warn("Logout request for [{}] and [{}] has failed", r.getTicketId(), r.getLogoutUrl()));
                logoutRequests.addAll(results);
            }

            // Customization : partial logout
            if(request.getParameter(casProperties.getCustom().getProperties().get("partial-logout.parameter-name")) != null){
                LOGGER.debug("Partial logout : updating ticket from registry");
                if (ticket instanceof final TicketGrantingTicket tgt) {
                    // First step : find the correct attribute repository to get attributes from ldap
                    BeanContainer<PersonAttributeDao> container = applicationContext.getBean("ldapAttributeRepositories", BeanContainer.class);
                    List<PersonAttributeDao> daos = container.toList();
                    LOGGER.debug("Configured daos are {}", daos);
                    LdaptivePersonAttributeDao ldapPersonAttributeDao = null;
                    for(PersonAttributeDao dao : daos){
                        if(Arrays.asList(dao.getId()).getFirst().equals(casProperties.getCustom().getProperties().get("partial-logout.attribute-repository"))){
                            ldapPersonAttributeDao = (LdaptivePersonAttributeDao) dao;
                        }
                    }
                    if(ldapPersonAttributeDao != null){
                        LOGGER.debug("Found ldapPersonAttributeDao to refresh attributes : {}", ldapPersonAttributeDao);
                        // Second step : request ldap with uid obtained from actual principal
                        val attributes = tgt.getAuthentication().getPrincipal().getAttributes();
                        Map<String, List<Object>> requestAttributes = new HashMap<>();
                        requestAttributes.put("username", attributes.get(casProperties.getCustom().getProperties().get("partial-logout.attribute-id")));
                        Set<PersonAttributes> personAttributesSet =  ldapPersonAttributeDao.getPeopleWithMultivaluedAttributes(
                                requestAttributes, null ,new HashSet<>());
                        // Third step : update principal and TGT in registry with new attributes
                        val newAttributes = personAttributesSet.iterator().next().getAttributes();
                        LOGGER.debug("New attributes are {}", newAttributes);
                        tgt.getAuthentication().getPrincipal().getAttributes().clear();
                        tgt.getAuthentication().getPrincipal().getAttributes().putAll(newAttributes);
                        ticketRegistry.updateTicket(tgt);
                    } else {
                        LOGGER.error("No attribute repository was found to update attributes");
                    }
                }
            } else {
                LOGGER.trace("Removing ticket [{}] from registry...", ticketId);
                ticketRegistry.deleteTicket(ticketId);
                if (ticket instanceof final TicketGrantingTicket tgt) {
                    applicationContext.publishEvent(new CasTicketGrantingTicketDestroyedEvent(this, tgt, clientInfo));
                }
            }
            return logoutRequests;
        } catch (final Exception e) {
            val msg = String.format("Ticket-granting ticket [%s] cannot be found in the ticket registry.", ticketId);
            LOGGER.debug(msg, e);
        }
        return new ArrayList<>();
    }
}
