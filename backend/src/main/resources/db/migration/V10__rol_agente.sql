DO $$
DECLARE r record;
BEGIN
  FOR r IN (
    SELECT conname FROM pg_constraint
    WHERE conrelid = 'usuario'::regclass AND contype = 'c'
      AND pg_get_constraintdef(oid) LIKE '%rol%'
  ) LOOP
    EXECUTE 'ALTER TABLE usuario DROP CONSTRAINT ' || quote_ident(r.conname);
  END LOOP;
END $$;

ALTER TABLE usuario ADD CONSTRAINT usuario_rol_check CHECK (rol IN ('ADMIN', 'AGENTE'));
