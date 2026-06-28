# Especificación: Vista de tickets — dashboard, página principal y reportes

> Para implementar con Claude Code. Seguir las reglas de `CLAUDE.md`.

## Objetivo

Reorganizar la experiencia de tickets: una página principal enfocada (solo lo que
necesita atención) con un dashboard de KPIs, y una pantalla aparte para buscar,
filtrar y sacar reportes de todos los tickets.

## Alcance

**Incluye:**

- Página principal: dashboard de KPIs + solo tickets **ABIERTOS** + crear ticket.
- Pantalla nueva de búsqueda / reportes (filtros, tabla, export CSV, métricas).

**No incluye:** asignación de agentes (queda para más adelante).

## Parte 1 — Página principal

- Mostrar **solo los tickets en estado ABIERTO** (nuevos, sin empezar). Al
  iniciar un ticket (pasa a EN_PROGRESO) o resolverlo, **desaparece** de la
  principal y se ve desde la pantalla de búsqueda.
- Arriba, un **dashboard** con tarjetas de KPIs:
  - Cantidad de tickets por estado: Abiertos, En progreso, Resueltos, Cerrados.
  - Total de tickets.
  - Tiempo promedio de resolución (usando `resueltoEn` − `createdAt`).
- Mantener el formulario de crear ticket (con el autocompletado de cliente que ya
  funciona).

### Backend (parte 1)

- Extender `GET /api/v1/tickets` para aceptar filtros opcionales por query param
  (ver parte 2). La principal lo llama con `?estado=ABIERTO`.
- Endpoint de resumen para el dashboard:
  `GET /api/v1/tickets/resumen` → `{ abiertos, enProgreso, resueltos, cerrados,
  total, tiempoPromedioResolucion }`.

## Parte 2 — Pantalla de búsqueda / reportes

Pantalla nueva (ej. `/tickets/buscar` o `/reportes`), accesible desde la
navegación.

### Filtros

- Por **cliente** (elegir de los clientes existentes).
- Por **rango de fechas** (desde / hasta, sobre la fecha de creación).
- Por **estado** (ABIERTO / EN_PROGRESO / RESUELTO / CERRADO / todos).
- **Búsqueda por texto** (título o número de ticket).

### Resultados

- Tabla con: número, título, cliente, estado, prioridad, fecha de creación,
  fecha de resolución y de cierre.
- Poder **ordenar** por fecha y por prioridad.
- **Exportar** la tabla a **CSV** (que Excel abre directamente). Generar el CSV en
  el frontend a partir de los resultados; no agregar librerías pesadas.

### Métricas (en la misma pantalla)

- Cantidad de tickets por estado y por cliente (según los filtros aplicados).
- Tiempo promedio de resolución.

### Backend (parte 2)

- `GET /api/v1/tickets` con filtros opcionales: `estado`, `clienteId`, `desde`,
  `hasta`, `q` (texto), y orden. Devuelve la lista filtrada con los datos de la
  tabla (incluido el cliente).
- (Las métricas pueden calcularse en el frontend a partir de los resultados, o
  reutilizar `/tickets/resumen` con filtros si es simple. Elegir lo más limpio.)

## Restricciones (de CLAUDE.md)

- No hace falta migración nueva (no cambia el esquema; son consultas).
- API bajo `/api/v1`. Endpoints protegidos. No agregar dependencias pesadas
  (el CSV se arma a mano en el frontend).
- Reutilizar lo que ya existe (la lista de tickets, el componente de cliente).

## Criterios de aceptación

- [ ] La página principal muestra solo tickets ABIERTOS, con el dashboard de KPIs
  arriba y el formulario de crear.
- [ ] Al iniciar o resolver un ticket, deja de aparecer en la principal.
- [ ] La pantalla de búsqueda permite filtrar por cliente, fechas, estado y texto,
  y muestra los resultados en una tabla ordenable.
- [ ] Puedo exportar la tabla a CSV.
- [ ] Veo métricas: cantidad por estado, por cliente y tiempo promedio de resolución.
- [ ] Nada de lo anterior (crear, comentarios, transiciones) se rompió.

## Cómo pedírselo a Claude Code

> Implementá lo que está en `docs/tickets-vista-y-reportes.md`. Seguí las reglas
> de `CLAUDE.md`. La página principal muestra solo tickets ABIERTOS y un dashboard
> de KPIs; el resto se ve en una pantalla nueva de búsqueda/reportes con filtros,
> tabla, export CSV y métricas. El CSV se genera en el frontend, sin librerías
> nuevas. Antes de editar archivos, mostrame el plan paso a paso.
