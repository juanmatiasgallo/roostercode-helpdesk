package com.roostercode.helpdesk.ticket;

import jakarta.validation.constraints.NotBlank;

/**
 * Datos que llegan desde el frontend para crear un ticket.
 * prioridad puede venir null; en ese caso se usa MEDIA por defecto.
 */
public record CrearTicketRequest(
        @NotBlank String titulo,
        @NotBlank String descripcion,
        String clienteNombre,
        Prioridad prioridad
) {}
