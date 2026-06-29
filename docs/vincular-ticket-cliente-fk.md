# Especificación: Vínculo real Ticket → Cliente (FK)

> Para implementar con Claude Code. Seguir las reglas de `CLAUDE.md`.

## Contexto

Hoy el ticket guarda al cliente como **texto libre** (`clienteNombre`); no está
vinculado a la entidad Cliente. Por eso "los tickets de un cliente" y los
reportes por cliente funcionan por coincidencia de nombre, que es frágil.
Queremos un **vínculo real (FK)**. Decisión tomada: los **tickets viejos quedan
como están** (con su texto); el vínculo real se usa **de ahora en más**.

## Objetivo

Agregar un vínculo real y **opcional** Ticket → Cliente (`cliente_id`), y hacer
que el autocompletado, la vista "cliente y sus tickets" y los reportes por
cliente usen ese vínculo en vez del texto.

## Backend

### Modelo y migración

- Agregar a `Ticket` una relación **opcional** `@ManyToOne` a `Cliente` (nullable).
- **Conservar** la columna `clienteNombre` (para los tickets viejos).
- Migración Flyway nueva con el **siguiente número disponible** (V9):
  `ALTER TABLE ticket ADD COLUMN cliente_id UUID NULL REFERENCES cliente(id)
  ON DELETE SET NULL`. No tocar los tickets existentes (su `cliente_id` queda
  NULL y conservan su `cliente_nombre`).

### Endpoints

- `POST /api/v1/tickets`: aceptar `clienteId` **opcional**. Si viene, validar que
  el cliente exista (si no, 400/404) y vincularlo. Puede crearse un ticket sin
  cliente.
- `PUT /api/v1/tickets/{id}`: permitir asignar o cambiar el `clienteId`.
- `GET /api/v1/tickets` (filtros): el filtro por `clienteId` debe usar la FK real.
- La respuesta del ticket incluye, si tiene cliente vinculado, `{ id,
  nombreCompleto }` del cliente.

### Ajustar lo que hoy usa el texto

- La vista "cliente y sus tickets" (`clientes/[id]`) debe traer los tickets por
  **`cliente_id`** (FK), no por nombre.
- El filtro/búsqueda por cliente en reportes debe usar la FK.

## Frontend

- **Al crear/editar un ticket:** el selector de cliente (autocompletado que ya
  existe) debe guardar el **`clienteId` real** al seleccionar un cliente
  existente, no solo el texto. Opción "Nuevo cliente" → pantalla de alta y luego
  seleccionarlo. Se puede dejar sin cliente.
- **Mostrar el cliente del ticket:** si tiene cliente vinculado, mostrar su
  `nombreCompleto`; si no, mostrar el `clienteNombre` viejo si existe; si no,
  "Sin cliente".
- Heredar la identidad visual; usar el token como el resto.

## Restricciones (de CLAUDE.md)

- Migración nueva (siguiente número), no editar las anteriores.
- Conservar `clienteNombre` (no borrar datos de los tickets viejos).
- `ON DELETE SET NULL` (borrar un cliente no borra sus tickets).
- Reutilizar el autocompletado y el alta de cliente existentes; no duplicar.
- API bajo `/api/v1`; validación en el servidor.

## Criterios de aceptación

- [ ] Al crear un ticket puedo seleccionar un cliente y queda vinculado por FK
  (no solo como texto).
- [ ] Puedo dejar un ticket sin cliente, y puedo asignarlo/cambiarlo desde el detalle.
- [ ] "Cliente y sus tickets" y los reportes por cliente usan el vínculo real y
  son confiables.
- [ ] Los tickets viejos siguen mostrando su nombre de cliente (texto).
- [ ] Borrar un cliente no borra sus tickets (quedan sin cliente).
- [ ] Nada de lo existente (crear, estados, comentarios, categorías) se rompió.

## Notas

- No requiere variables de entorno nuevas.
- Este vínculo deja la base lista para reportes por cliente confiables.

## Cómo pedírselo a Claude Code

> Implementá lo que está en `docs/vincular-ticket-cliente-fk.md`. Seguí las
> reglas de `CLAUDE.md`. Agregá un vínculo FK opcional Ticket → Cliente
> (cliente_id), conservando clienteNombre para los tickets viejos. Actualizá el
> autocompletado, la vista de tickets del cliente y los reportes para usar la FK.
> ON DELETE SET NULL. Antes de editar archivos, mostrame el plan paso a paso.

Revisá el plan antes de dejar que avance (toca la creación de tickets y una
migración).
