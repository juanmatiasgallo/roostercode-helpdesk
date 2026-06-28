CREATE TABLE proveedor (
    id           UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    empresa      VARCHAR(200) NOT NULL,
    rut          VARCHAR(12)  NOT NULL,
    telefono     VARCHAR(30)  NOT NULL,
    direccion    TEXT         NOT NULL,
    departamento VARCHAR(50)  NOT NULL
        CHECK (departamento IN (
            'ARTIGAS', 'CANELONES', 'CERRO_LARGO', 'COLONIA', 'DURAZNO',
            'FLORES', 'FLORIDA', 'LAVALLEJA', 'MALDONADO', 'MONTEVIDEO',
            'PAYSANDU', 'RIO_NEGRO', 'RIVERA', 'ROCHA', 'SALTO',
            'SAN_JOSE', 'SORIANO', 'TACUAREMBO', 'TREINTA_Y_TRES'
        )),
    email        VARCHAR(255) NOT NULL,
    created_at   TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX uidx_proveedor_rut   ON proveedor(rut);
CREATE UNIQUE INDEX uidx_proveedor_email ON proveedor(email);
