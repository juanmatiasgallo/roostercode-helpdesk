package com.roostercode.helpdesk.sla;

import com.roostercode.helpdesk.ticket.Prioridad;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record SlaObjetivoItem(
        @NotNull Prioridad prioridad,
        @NotNull @Min(1) Integer horasObjetivo
) {}
