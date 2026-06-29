# Especificación: Cliente y sus tickets

> Para implementar con Claude Code. Seguir las reglas de `CLAUDE.md`.

## Objetivo

Poder buscar un cliente y ver todos sus tickets, mejorar el alta de cliente al
crear un ticket, y poder buscar por cliente en la pantalla de reportes.

## Alcance

**Incluye:**

- Buscador de clientes que, al seleccionar uno, trae todos sus tickets.
- Al crear un ticket: elegir un cliente existente o crear uno nuevo (yendo a la
  pantalla de alta).
- Buscador por cliente en la pantalla de reportes.

## Backend

- Reutilizar `GET /api/v1/tickets?clienteId=...` (ya existe) para traer los
  tickets de un cliente.
- `GET /api/v1/clientes/{id}` — datos de un cliente (para mostrarlos en su vista).
- Reutilizar `GET /api/v1/clientes?q=...` para el buscador.

## Frontend

- **Vista "cliente y sus tickets":** un buscador de clientes (escribir nombre y
  elegir de la lista). Al seleccionar un cliente, mostrar sus datos y la lista de
  **todos sus tickets**, con link al detalle de cada uno.
- **Al crear un ticket:** el selector de cliente ofrece dos caminos claros:
  1. **Seleccionar un cliente existente** (autocompletar, que ya funciona).
  2. **Nuevo cliente** → llevar a la pantalla de alta de cliente; al crearlo,
     poder volver al ticket y seleccionarlo.
- **En reportes:** un buscador/filtro por cliente para traer todos sus tickets en
  la tabla (el filtro por `clienteId` ya existe; reforzar el buscador por nombre).
- Heredar la identidad visual; usar el token como el resto.

## Restricciones (de CLAUDE.md)

- No hace falta migración nueva.
- Reutilizar los endpoints y componentes existentes (no duplicar).
- API bajo `/api/v1`. Endpoints protegidos.

## Criterios de aceptación

- [ ] Puedo buscar un cliente y ver la lista de todos sus tickets.
- [ ] Desde esa lista puedo abrir el detalle de cada ticket.
- [ ] Al crear un ticket puedo elegir un cliente existente o ir a crear uno nuevo.
- [ ] En reportes puedo buscar por cliente y ver todos sus tickets.

## Cómo pedírselo a Claude Code

> Implementá lo que está en `docs/cliente-y-sus-tickets.md`. Seguí las reglas de
> `CLAUDE.md`. Reutilizá los endpoints existentes (tickets por clienteId,
> búsqueda de clientes). Al crear ticket, opción de cliente existente o ir a la
> pantalla de alta de uno nuevo. Antes de editar archivos, mostrame el plan.
