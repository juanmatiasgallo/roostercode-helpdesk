# Especificación: SLA (tiempos objetivo y vencimientos)

> Para implementar con Claude Code. Seguir las reglas de `CLAUDE.md`.

## Objetivo

Definir un **tiempo objetivo de resolución por prioridad** (configurable),
calcular la **fecha límite** de cada ticket y mostrar un **indicador de SLA**
(en tiempo / por vencer / vencido). Es la base de los widgets "SLA próximos a
vencer" del dashboard.

## Alcance

**Incluye:** tiempos objetivo por prioridad (editables), fecha límite, indicador
de SLA, KPIs y filtro.
**No incluye:** horarios hábiles/feriados (se calcula en horas corridas; queda
para más adelante), SLA de primera respuesta.

## Backend

- Tabla nueva `sla_objetivo` (prioridad, horas_objetivo). Migración nueva
  (siguiente número disponible) que la cree y la **siembre** con valores por
  defecto (ej. URGENTE 4, ALTA 24, MEDIA 72, BAJA 120 horas; ajustables).
- Cálculo por ticket (puede ser derivado, sin guardar):
  - `fechaLimite = createdAt + horas_objetivo(prioridad)`.
  - `estadoSla`:
    - Resuelto/cerrado → "CUMPLIDO" o "INCUMPLIDO" según `resueltoEn` vs `fechaLimite`.
    - Abierto/en progreso → "EN_TIEMPO", "POR_VENCER" (queda poco margen) o
      "VENCIDO" (ya pasó la fecha límite).
- Endpoints (bajo `/api/v1`, protegidos):
  - `GET /sla` y `PUT /sla` — leer/editar los tiempos objetivo (solo ADMIN).
  - `GET /tickets`: sumar filtro opcional por estado de SLA (ej. `sla=POR_VENCER`).
  - `GET /tickets/resumen`: agregar conteos "porVencer" y "vencidos".
- La respuesta del ticket incluye `fechaLimite` y `estadoSla`.

## Frontend

- En **Configuración**, sección "SLA": editar las horas objetivo por prioridad.
- En la **lista** y el **detalle** del ticket: mostrar la fecha límite y un
  indicador de color (verde en tiempo, ámbar por vencer, rojo vencido).
- En el **dashboard**: tarjetas "SLA próximos a vencer" y "vencidos".
- En **reportes**: columna/filtro por estado de SLA.
- Heredar la identidad visual; usar el token.

## Restricciones (de CLAUDE.md)

- Migración nueva (siguiente número), no editar las anteriores.
- API bajo `/api/v1`; validación en el servidor; reutilizar componentes.
- No agregar dependencias pesadas (el cálculo de fechas es simple).

## Criterios de aceptación

- [ ] Puedo configurar las horas objetivo por prioridad.
- [ ] Cada ticket muestra su fecha límite y un indicador (en tiempo/por vencer/vencido).
- [ ] El dashboard muestra cuántos tickets están por vencer y vencidos.
- [ ] Puedo filtrar por estado de SLA en reportes.
- [ ] Nada de lo existente se rompió.

## Cómo pedírselo a Claude Code

> Implementá lo que está en `docs/sla.md`. Seguí las reglas de `CLAUDE.md`.
> Tiempos objetivo por prioridad configurables (tabla sembrada con defaults),
> cálculo de fecha límite e indicador de SLA, KPIs y filtro. Horas corridas (sin
> calendario hábil). Antes de editar archivos, mostrame el plan paso a paso.
