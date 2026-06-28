-- Paso 1: agregar columnas nuevas como nullable para permitir el backfill
ALTER TABLE cliente ADD COLUMN nombre_completo VARCHAR(255);
ALTER TABLE cliente ADD COLUMN celular VARCHAR(30);

-- Paso 2: backfill — preservar los datos ya cargados
UPDATE cliente SET nombre_completo = empresa, celular = telefono;

-- Paso 3: aplicar NOT NULL ahora que todas las filas tienen valor
ALTER TABLE cliente ALTER COLUMN nombre_completo SET NOT NULL;
ALTER TABLE cliente ALTER COLUMN celular SET NOT NULL;

-- Paso 4: eliminar índice único de rut (ya no existe el campo)
DROP INDEX uidx_cliente_rut;

-- Paso 5: eliminar columnas del modelo viejo
ALTER TABLE cliente
    DROP COLUMN empresa,
    DROP COLUMN rut,
    DROP COLUMN telefono,
    DROP COLUMN direccion,
    DROP COLUMN departamento;
