package com.roostercode.helpdesk.ticket;

import java.util.UUID;

public class TicketNoEncontradoException extends RuntimeException {
    public TicketNoEncontradoException(UUID id) {
        super("Ticket no encontrado: " + id);
    }
}
