package com.roostercode.helpdesk.sla;

import java.util.UUID;

public record SlaObjetivoResponse(UUID id, String prioridad, int horasObjetivo) {
    public static SlaObjetivoResponse from(SlaObjetivo o) {
        return new SlaObjetivoResponse(o.getId(), o.getPrioridad().name(), o.getHorasObjetivo());
    }
}
