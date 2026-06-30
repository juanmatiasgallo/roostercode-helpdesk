package com.roostercode.helpdesk.ticket;

public record TicketResumenResponse(
        long abiertos,
        long enProgreso,
        long resueltos,
        long cerrados,
        long total,
        Double tiempoPromedioResolucionHoras,
        long porVencer,
        long vencidos
) {}
