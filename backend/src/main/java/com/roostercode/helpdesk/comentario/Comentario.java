package com.roostercode.helpdesk.comentario;

import com.roostercode.helpdesk.auth.Usuario;
import com.roostercode.helpdesk.ticket.Ticket;
import jakarta.persistence.*;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "comentario")
public class Comentario {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "ticket_id", nullable = false)
    private Ticket ticket;

    @ManyToOne(optional = false)
    @JoinColumn(name = "autor_id", nullable = false)
    private Usuario autor;

    @Column(nullable = false, columnDefinition = "text")
    private String cuerpo;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Visibilidad visibilidad;

    // Generado por la base de datos (DEFAULT now()). Solo lectura desde Java.
    @Column(name = "created_at", insertable = false, updatable = false)
    private OffsetDateTime createdAt;

    protected Comentario() {}

    public Comentario(Ticket ticket, Usuario autor, String cuerpo, Visibilidad visibilidad) {
        this.ticket = ticket;
        this.autor = autor;
        this.cuerpo = cuerpo;
        this.visibilidad = visibilidad;
    }

    public UUID getId()               { return id; }
    public Ticket getTicket()         { return ticket; }
    public Usuario getAutor()         { return autor; }
    public String getCuerpo()         { return cuerpo; }
    public Visibilidad getVisibilidad() { return visibilidad; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
}
