package com.roostercode.helpdesk.ticket;

public class TransicionInvalidaException extends RuntimeException {
    public TransicionInvalidaException(String mensaje) {
        super(mensaje);
    }
}
