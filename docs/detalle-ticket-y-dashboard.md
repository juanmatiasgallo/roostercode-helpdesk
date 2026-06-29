# Especificación: Detalle del ticket + dashboard interactivo

> Para implementar con Claude Code. Seguir las reglas de `CLAUDE.md`.

## Objetivo

Poder abrir cualquier ticket en una vista de detalle (sin importar su estado),
ver y editar sus datos, cambiar su estado y ver/agregar comentarios. Y hacer el
dashboard de KPIs más visible y clickeable. Resuelve el problema de "cuando
cambio el estado, el ticket desaparece y no puedo volver a él".

## Backend

- `GET /api/v1/tickets/{id}` — devolver un ticket con todos sus datos (cliente,
  fechas, prioridad, estado, etc.). 404 si no existe.
- `PUT /api/v1/tickets/{id}` — editar datos del ticket: titulo, descripcion,
  prioridad y clienteId. Con validación. **El estado NO se cambia por acá**, se
  sigue cambiando con los endpoints de transición existentes.

## Frontend

- **Vista de detalle del ticket** (ej. `/tickets/{id}`):
  - Muestra todos los datos del ticket.
  - Permite **editar** título, descripción, prioridad y cliente.
  - Permite **cambiar el estado** con los botones de transición (iniciar,
    resolver, cerrar, reabrir) ya existentes.
  - Muestra y permite agregar **comentarios** (ya existe la funcionalidad).
  - Desde acá se puede entrar a cualquier ticket, esté abierto, en progreso,
    resuelto o cerrado.
- **Acceso al detalle:** clickear un ticket (en la página principal, en la lista
  de búsqueda/reportes o en cualquier listado) abre su detalle.
- **Dashboard de KPIs:** hacer las tarjetas más prominentes y visuales (color por
  estado). Al **clickear** una tarjeta (ej. "En progreso"), llevar a la pantalla
  de búsqueda/lista **filtrada por ese estado**, desde donde se abre el detalle.
- **Colores de prioridad:** mostrar la prioridad con colores tanto al elegirla
  (al crear/editar) como en las listas y el detalle (ej. URGENTE rojo, ALTA
  naranja, MEDIA ámbar, BAJA gris/verde).

## Restricciones (de CLAUDE.md)

- No hace falta migración nueva.
- Validación en el servidor. API bajo `/api/v1`. Endpoints protegidos.
- Reutilizar los componentes existentes (transiciones, comentarios).

## Criterios de aceptación

- [ ] Puedo abrir cualquier ticket (incluso resuelto o cerrado) en su detalle.
- [ ] Desde el detalle puedo cambiar el estado y volver a verlo después.
- [ ] Puedo editar título, descripción, prioridad y cliente del ticket.
- [ ] Las tarjetas del dashboard son clickeables y llevan a los tickets de ese estado.
- [ ] La prioridad se ve con colores.

## Cómo pedírselo a Claude Code

> Implementá lo que está en `docs/detalle-ticket-y-dashboard.md`. Seguí las
> reglas de `CLAUDE.md`. Quiero una vista de detalle del ticket para abrir
> cualquiera (incluidos resueltos/cerrados), editar sus datos y cambiar su estado;
> y un dashboard de KPIs clickeable que filtre por estado. La prioridad con
> colores. Antes de editar archivos, mostrame el plan paso a paso.
