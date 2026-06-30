package com.roostercode.helpdesk.wiki;

import jakarta.validation.constraints.NotBlank;

public record CrearNodoRequest(String rutaPadre, @NotBlank String nombre) {}
