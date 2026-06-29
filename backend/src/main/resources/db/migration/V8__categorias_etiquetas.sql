CREATE TABLE categoria (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre     VARCHAR(100) NOT NULL UNIQUE,
    activo     BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE etiqueta (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre     VARCHAR(100) NOT NULL UNIQUE,
    color      VARCHAR(7)  NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE ticket_etiqueta (
    ticket_id   UUID NOT NULL REFERENCES ticket(id) ON DELETE CASCADE,
    etiqueta_id UUID NOT NULL REFERENCES etiqueta(id) ON DELETE CASCADE,
    PRIMARY KEY (ticket_id, etiqueta_id)
);

ALTER TABLE ticket ADD COLUMN categoria_id UUID REFERENCES categoria(id) ON DELETE SET NULL;
