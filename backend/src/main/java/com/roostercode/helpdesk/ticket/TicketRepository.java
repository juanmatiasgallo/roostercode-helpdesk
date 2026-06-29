package com.roostercode.helpdesk.ticket;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface TicketRepository extends JpaRepository<Ticket, UUID> {
    List<Ticket> findAllByOrderByCreatedAtDesc();
    long countByEstado(EstadoTicket estado);
    List<Ticket> findByResueltoEnIsNotNull();
}
