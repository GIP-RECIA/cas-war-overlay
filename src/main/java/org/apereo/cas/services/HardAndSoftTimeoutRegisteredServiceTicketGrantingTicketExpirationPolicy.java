package org.apereo.cas.services;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonTypeInfo;
import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;
import lombok.experimental.Accessors;
import org.apereo.cas.ticket.ExpirationPolicy;
import org.apereo.cas.ticket.expiration.TicketGrantingTicketExpirationPolicy;

import java.io.Serial;
import java.util.Optional;

/**
 * Custom ServiceTicketGrantingTicketExpirationPolicy to be able to configure a soft/hard timeout per service
 */
@Getter
@Setter
@EqualsAndHashCode
@AllArgsConstructor
@NoArgsConstructor
@JsonTypeInfo(use = JsonTypeInfo.Id.CLASS)
@ToString
@Accessors(chain = true)
@JsonInclude(JsonInclude.Include.NON_DEFAULT)
public class HardAndSoftTimeoutRegisteredServiceTicketGrantingTicketExpirationPolicy implements RegisteredServiceTicketGrantingTicketExpirationPolicy {
    @Serial
    private static final long serialVersionUID = 5650357629137763575L;

    /**
     * Maximum time this ticket is valid.
     */
    private long maxTimeToLiveInSeconds;

    /**
     * Time to kill in seconds.
     */
    private long timeToKillInSeconds;

    @Override
    public Optional<ExpirationPolicy> toExpirationPolicy() {
        if (getMaxTimeToLiveInSeconds() > 0 && getTimeToKillInSeconds() > 0) {
            return Optional.of(new TicketGrantingTicketExpirationPolicy(getMaxTimeToLiveInSeconds(), getTimeToKillInSeconds()));
        }
        return Optional.empty();
    }
}
