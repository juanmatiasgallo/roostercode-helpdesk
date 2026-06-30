package com.roostercode.helpdesk.ticket;

import jakarta.validation.constraints.NotBlank;
import java.util.List;
import java.util.UUID;

/**
 * Datos que llegan desde el frontend para crear un ticket.
 * prioridad puede venir null; en ese caso se usa MEDIA por defecto.
 * categoriaId y etiquetaIds son opcionales.
 */
public record CrearTicketRequest(
        @NotBlank String titulo,
        @NotBlank String descripcion,
        String clienteNombre,
        Prioridad prioridad,
        UUID clienteId,
        UUID responsableId,
        UUID categoriaId,
        List<UUID> etiquetaIds
) {}
