package com.roostercode.helpdesk.ticket;

import jakarta.persistence.*;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "ticket")
public class Ticket {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    // Generado por la base de datos (IDENTITY). Solo lectura desde Java.
    @Column(name = "numero", insertable = false, updatable = false)
    private Long numero;

    @Column(nullable = false)
    private String titulo;

    @Column(nullable = false, columnDefinition = "text")
    private String descripcion;

    @Column(name = "cliente_nombre")
    private String clienteNombre;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Prioridad prioridad;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EstadoTicket estado;

    // Generado por la base de datos (DEFAULT now()). Solo lectura desde Java.
    @Column(name = "created_at", insertable = false, updatable = false)
    private OffsetDateTime createdAt;

    protected Ticket() {
        // requerido por JPA
    }

    public Ticket(String titulo, String descripcion, String clienteNombre, Prioridad prioridad) {
        this.titulo = titulo;
        this.descripcion = descripcion;
        this.clienteNombre = clienteNombre;
        this.prioridad = prioridad;
        this.estado = EstadoTicket.ABIERTO;
    }

    public UUID getId() { return id; }
    public Long getNumero() { return numero; }
    public String getTitulo() { return titulo; }
    public String getDescripcion() { return descripcion; }
    public String getClienteNombre() { return clienteNombre; }
    public Prioridad getPrioridad() { return prioridad; }
    public EstadoTicket getEstado() { return estado; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
}
