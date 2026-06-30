package com.roostercode.helpdesk.sla;

import com.roostercode.helpdesk.ticket.Prioridad;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "sla_objetivo")
public class SlaObjetivo {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, unique = true)
    private Prioridad prioridad;

    @Column(name = "horas_objetivo", nullable = false)
    private int horasObjetivo;

    @Column(name = "created_at", insertable = false, updatable = false)
    private OffsetDateTime createdAt;

    protected SlaObjetivo() {
        // requerido por JPA
    }

    public UUID getId() { return id; }
    public Prioridad getPrioridad() { return prioridad; }
    public int getHorasObjetivo() { return horasObjetivo; }
    public OffsetDateTime getCreatedAt() { return createdAt; }

    public void setHorasObjetivo(int horasObjetivo) { this.horasObjetivo = horasObjetivo; }
}
