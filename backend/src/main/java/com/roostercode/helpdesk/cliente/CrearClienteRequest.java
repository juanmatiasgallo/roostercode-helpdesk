package com.roostercode.helpdesk.cliente;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record CrearClienteRequest(

    @NotBlank(message = "El nombre completo es obligatorio")
    String nombreCompleto,

    @NotBlank(message = "El celular es obligatorio")
    @Pattern(regexp = "\\+?\\d[\\d\\s\\-]{4,18}", message = "Formato de celular inválido (dígitos, +, espacios o guiones)")
    String celular,

    @NotBlank(message = "El email es obligatorio")
    @Email(message = "Formato de email inválido")
    String email
) {}
