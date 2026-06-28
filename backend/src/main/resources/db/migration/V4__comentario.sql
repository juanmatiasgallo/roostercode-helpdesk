CREATE TABLE comentario (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id   UUID        NOT NULL REFERENCES ticket(id) ON DELETE CASCADE,
    autor_id    UUID        NOT NULL REFERENCES usuario(id),
    cuerpo      TEXT        NOT NULL,
    visibilidad VARCHAR(20) NOT NULL CHECK (visibilidad IN ('INTERNA', 'PUBLICA')),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_comentario_ticket ON comentario(ticket_id);
