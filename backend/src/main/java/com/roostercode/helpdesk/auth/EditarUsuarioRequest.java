package com.roostercode.helpdesk.auth;

import jakarta.validation.constraints.NotBlank;

public record EditarUsuarioRequest(
        @NotBlank String nombre,
        RolUsuario rol
) {}
