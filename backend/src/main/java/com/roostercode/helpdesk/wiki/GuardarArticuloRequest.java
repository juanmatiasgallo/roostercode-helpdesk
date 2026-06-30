package com.roostercode.helpdesk.wiki;

import jakarta.validation.constraints.NotNull;

public record GuardarArticuloRequest(@NotNull String contenido) {}
