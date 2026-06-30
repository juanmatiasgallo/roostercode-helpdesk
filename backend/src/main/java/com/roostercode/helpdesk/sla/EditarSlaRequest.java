package com.roostercode.helpdesk.sla;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;

import java.util.List;

public record EditarSlaRequest(
        @NotEmpty @Valid List<SlaObjetivoItem> items
) {}
