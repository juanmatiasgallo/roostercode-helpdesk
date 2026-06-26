-- Garantiza la función gen_random_uuid() incluso en Postgres viejos.
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE ticket (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    numero         BIGINT GENERATED ALWAYS AS IDENTITY UNIQUE, -- número legible (#1, #2, ...)
    titulo         VARCHAR(200) NOT NULL,
    descripcion    TEXT NOT NULL,
    cliente_nombre VARCHAR(160),
    prioridad      VARCHAR(20) NOT NULL DEFAULT 'MEDIA'
                     CHECK (prioridad IN ('BAJA','MEDIA','ALTA','URGENTE')),
    estado         VARCHAR(20) NOT NULL DEFAULT 'ABIERTO'
                     CHECK (estado IN ('ABIERTO','EN_PROGRESO','RESUELTO','CERRADO')),
    created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_ticket_estado ON ticket(estado);
