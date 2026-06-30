CREATE TABLE sla_objetivo (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    prioridad      VARCHAR(20) NOT NULL UNIQUE CHECK (prioridad IN ('BAJA', 'MEDIA', 'ALTA', 'URGENTE')),
    horas_objetivo INTEGER NOT NULL CHECK (horas_objetivo > 0),
    created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO sla_objetivo (prioridad, horas_objetivo) VALUES
    ('URGENTE', 4),
    ('ALTA', 24),
    ('MEDIA', 72),
    ('BAJA', 120);
