package com.roostercode.helpdesk.wiki;

import java.util.List;

public record WikiNodo(
        String nombre,
        NodoTipo tipo,
        String ruta,
        List<WikiNodo> hijos
) {}
