package com.roostercode.helpdesk.categoria;

import jakarta.validation.constraints.NotBlank;

public record CategoriaRequest(
        @NotBlank String nombre,
        Boolean activo
) {}
