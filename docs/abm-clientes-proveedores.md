# Especificación: Editar y eliminar Clientes y Proveedores (ABM)

> Para implementar con Claude Code. Seguir las reglas de `CLAUDE.md`.
> **Requisito previo:** tener desplegado el modelo nuevo de Cliente (persona:
> nombre completo, celular, email).

## Objetivo

Completar el ABM: poder **editar** y **eliminar** tanto Clientes como Proveedores
desde sus pantallas.

## Alcance

**Incluye:** editar y eliminar Cliente; editar y eliminar Proveedor.
**No incluye:** cambios en tickets (van en otra spec).

## Backend

### Clientes

- `PUT /api/v1/clientes/{id}` — editar (nombreCompleto, celular, email).
  - Misma validación que el alta (Bean Validation, server-side).
  - Email único **excluyendo el propio registro** (ej. `existsByEmailAndIdNot`).
  - 404 si no existe; 409 si el email ya es de otro cliente.
- `DELETE /api/v1/clientes/{id}` — eliminar.
  - Si el cliente está vinculado a tickets, esos tickets **NO se borran**:
    quedan sin cliente (la FK ya es ON DELETE SET NULL). No romper esto.
  - 404 si no existe.

### Proveedores

- `PUT /api/v1/proveedores/{id}` — editar (empresa, rut, telefono, direccion,
  departamento, email).
  - Misma validación que el alta.
  - RUT y email únicos **excluyendo el propio registro**.
  - 404 si no existe; 409 si RUT o email ya son de otro proveedor.
- `DELETE /api/v1/proveedores/{id}` — eliminar. 404 si no existe.

## Frontend

- En la pantalla de **Clientes**: cada fila de la lista tiene botones
  **Editar** y **Eliminar**.
  - Editar abre el formulario con los datos precargados; al guardar, actualiza.
  - Eliminar pide **confirmación** antes de borrar.
- En la pantalla de **Proveedores**: lo mismo (Editar / Eliminar con confirmación).
- Reutilizar los formularios de alta existentes (no duplicar): el mismo formulario
  sirve para crear y para editar.
- Mostrar errores de validación y el 409 de duplicado.
- Heredar la identidad visual; usar el token como el resto.

## Restricciones (de CLAUDE.md)

- No hace falta migración nueva (no cambia el esquema).
- Validación en el servidor. API bajo `/api/v1`. No agregar dependencias.
- No duplicar formularios ni lógica; reutilizar.

## Criterios de aceptación

- [ ] Puedo editar un cliente y ver el cambio reflejado.
- [ ] Puedo eliminar un cliente (con confirmación); si tenía tickets, esos
  tickets quedan sin cliente y NO se borran.
- [ ] Puedo editar un proveedor y eliminarlo (con confirmación).
- [ ] Las validaciones y la unicidad funcionan también al editar (sin chocar con
  el propio registro).

## Cómo pedírselo a Claude Code

> Implementá lo que está en `docs/abm-clientes-proveedores.md`. Seguí las reglas
> de `CLAUDE.md`. Reutilizá los formularios de alta existentes para editar. La
> unicidad al editar debe excluir el propio registro. Eliminar un cliente no debe
> borrar sus tickets. Antes de editar archivos, mostrame el plan.
