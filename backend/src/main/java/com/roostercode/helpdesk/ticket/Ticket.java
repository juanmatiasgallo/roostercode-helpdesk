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

    @Column(name = "resuelto_en")
    private OffsetDateTime resueltoEn;

    @Column(name = "cerrado_en")
    private OffsetDateTime cerradoEn;

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

    public void aplicarTransicion(String accion) {
        switch (accion) {
            case "iniciar" -> {
                if (estado != EstadoTicket.ABIERTO)
                    throw new TransicionInvalidaException("Solo se puede iniciar un ticket ABIERTO (estado actual: " + estado + ")");
                estado = EstadoTicket.EN_PROGRESO;
            }
            case "resolver" -> {
                if (estado != EstadoTicket.ABIERTO && estado != EstadoTicket.EN_PROGRESO)
                    throw new TransicionInvalidaException("Solo se puede resolver un ticket ABIERTO o EN_PROGRESO (estado actual: " + estado + ")");
                estado = EstadoTicket.RESUELTO;
                resueltoEn = OffsetDateTime.now();
            }
            case "cerrar" -> {
                if (estado != EstadoTicket.RESUELTO)
                    throw new TransicionInvalidaException("Solo se puede cerrar un ticket RESUELTO (estado actual: " + estado + ")");
                estado = EstadoTicket.CERRADO;
                cerradoEn = OffsetDateTime.now();
            }
            case "reabrir" -> {
                if (estado == EstadoTicket.CERRADO) {
                    estado = EstadoTicket.ABIERTO;
                    cerradoEn = null;
                    resueltoEn = null;
                } else if (estado == EstadoTicket.RESUELTO) {
                    estado = EstadoTicket.EN_PROGRESO;
                    resueltoEn = null;
                } else {
                    throw new TransicionInvalidaException("Solo se puede reabrir un ticket RESUELTO o CERRADO (estado actual: " + estado + ")");
                }
            }
            default -> throw new TransicionInvalidaException("Acción desconocida: " + accion);
        }
    }

    public UUID getId() { return id; }
    public Long getNumero() { return numero; }
    public String getTitulo() { return titulo; }
    public String getDescripcion() { return descripcion; }
    public String getClienteNombre() { return clienteNombre; }
    public Prioridad getPrioridad() { return prioridad; }
    public EstadoTicket getEstado() { return estado; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
    public OffsetDateTime getResueltoEn() { return resueltoEn; }
    public OffsetDateTime getCerradoEn() { return cerradoEn; }
}
