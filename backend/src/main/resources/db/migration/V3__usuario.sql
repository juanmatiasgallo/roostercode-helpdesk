CREATE TABLE usuario (
    id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre        VARCHAR(160) NOT NULL,
    email         VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    rol           VARCHAR(20)  NOT NULL DEFAULT 'ADMIN'
                    CHECK (rol IN ('ADMIN')),
    activo        BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ  NOT NULL DEFAULT now()
);
