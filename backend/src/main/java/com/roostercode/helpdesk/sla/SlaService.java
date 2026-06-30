package com.roostercode.helpdesk.sla;

import com.roostercode.helpdesk.ticket.Prioridad;
import com.roostercode.helpdesk.ticket.Ticket;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class SlaService {

    private final SlaObjetivoRepository repository;

    public SlaService(SlaObjetivoRepository repository) {
        this.repository = repository;
    }

    private Map<Prioridad, Integer> horasPorPrioridad() {
        return repository.findAll().stream()
                .collect(Collectors.toMap(SlaObjetivo::getPrioridad, SlaObjetivo::getHorasObjetivo));
    }

    public void aplicar(Ticket ticket) {
        aplicar(List.of(ticket));
    }

    public void aplicar(List<Ticket> tickets) {
        Map<Prioridad, Integer> mapa = horasPorPrioridad();
        for (Ticket t : tickets) {
            Integer horas = mapa.get(t.getPrioridad());
            if (horas != null) t.calcularSla(horas);
        }
    }
}
