# Especificación: Asignar responsable al ticket

> Para implementar con Claude Code. Seguir las reglas de `CLAUDE.md`.
> **Requisito previo:** tener desplegada la "Gestión de agentes" (debe haber
> usuarios para asignar).

## Objetivo

Poder asignar un **responsable** (un usuario/agente) a cada ticket, de forma
opcional, y filtrar por responsable. Es la base de los widgets "tickets
asignados" y "por técnico" del dashboard futuro.

## Backend

- Agregar a `Ticket` una relación **opcional** `@ManyToOne` a `Usuario`
  (`responsable`, nullable).
- Migración nueva (siguiente número disponible):
  `ALTER TABLE ticket ADD COLUMN responsable_id UUID NULL REFERENCES usuario(id)
  ON DELETE SET NULL`.
- `POST` y `PUT /api/v1/tickets/{id}`: aceptar `responsableId` opcional; si viene,
  validar que el usuario exista y vincularlo.
- `GET /api/v1/tickets`: sumar filtro opcional `responsableId`.
- La respuesta del ticket incluye, si tiene responsable, `{ id, nombre }`.

## Frontend

- En el **detalle del ticket** y al **crear/editar**: un selector para elegir el
  responsable entre los usuarios (puede quedar sin asignar).
- Mostrar el responsable en la lista de tickets y en reportes.
- En **reportes**: filtro por responsable.
- Heredar la identidad visual; usar el token.

## Restricciones (de CLAUDE.md)

- Migración nueva (siguiente número), no editar las anteriores.
- `ON DELETE SET NULL` (borrar un usuario no borra sus tickets; quedan sin responsable).
- API bajo `/api/v1`; validación en el servidor; reutilizar componentes.

## Criterios de aceptación

- [ ] Puedo asignar un responsable a un ticket (al crear o desde el detalle).
- [ ] Puedo dejar un ticket sin responsable.
- [ ] Veo el responsable en la lista y en reportes.
- [ ] Puedo filtrar tickets por responsable en reportes.
- [ ] Borrar un usuario no borra sus tickets (quedan sin responsable).

## Cómo pedírselo a Claude Code

> Implementá lo que está en `docs/asignar-responsable.md`. Seguí las reglas de
> `CLAUDE.md`. Agregá un responsable opcional (FK a Usuario) al ticket, con
> selector en creación/detalle y filtro en reportes. ON DELETE SET NULL. Antes de
> editar archivos, mostrame el plan paso a paso.
