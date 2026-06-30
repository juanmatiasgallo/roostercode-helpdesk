package com.roostercode.helpdesk.sla;

import com.roostercode.helpdesk.ticket.Prioridad;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface SlaObjetivoRepository extends JpaRepository<SlaObjetivo, UUID> {
    Optional<SlaObjetivo> findByPrioridad(Prioridad prioridad);
}
