# Especificación: Editar el estado del ticket

> Para implementar con Claude Code. Seguir las reglas de `CLAUDE.md`.
> Diseño de referencia: documento "007 - Diseño Técnico del Módulo Help Desk".

## Contexto

Módulo Help Desk de RoosterCode. Hoy un ticket solo se puede crear y listar, y su
estado queda siempre en `ABIERTO`. No hay forma de cambiarlo.

## Objetivo

Permitir cambiar el estado de un ticket a lo largo de su ciclo de vida, mediante
endpoints de transición explícitos y botones en la interfaz, validando que las
transiciones sean válidas.

## Alcance

**Incluye:**

- Endpoints de transición en el backend.
- Validación de transiciones inválidas.
- Migración Flyway para registrar las fechas de resolución y cierre.
- Botones en la lista del frontend para cambiar el estado.

**No incluye (queda para otras especificaciones):**

- Comentarios, historial de cambios y eventos de dominio.
- Asignar agente.
- Estado "ARCHIVADO" (va en otra funcionalidad).

## Máquina de estados

Estados: `ABIERTO`, `EN_PROGRESO`, `RESUELTO`, `CERRADO`.

| Acción     | Estado requerido        | Estado resultante                         |
|------------|-------------------------|-------------------------------------------|
| `iniciar`  | ABIERTO                 | EN_PROGRESO                               |
| `resolver` | ABIERTO o EN_PROGRESO   | RESUELTO (setea `resuelto_en` = ahora)    |
| `cerrar`   | RESUELTO                | CERRADO (setea `cerrado_en` = ahora)      |
| `reabrir`  | RESUELTO o CERRADO      | si venía de CERRADO → ABIERTO; si venía de RESUELTO → EN_PROGRESO |

Al reabrir, limpiar las fechas que correspondan (`cerrado_en` siempre; `resuelto_en`
si vuelve a EN_PROGRESO).

Cualquier transición fuera de esta tabla es inválida y debe rechazarse.

## Backend

### Endpoints (todos bajo `/api/v1`)

| Método | Ruta                          | Efecto                |
|--------|-------------------------------|-----------------------|
| POST   | `/tickets/{id}/iniciar`       | ABIERTO → EN_PROGRESO |
| POST   | `/tickets/{id}/resolver`      | → RESUELTO            |
| POST   | `/tickets/{id}/cerrar`        | RESUELTO → CERRADO    |
| POST   | `/tickets/{id}/reabrir`       | → ABIERTO / EN_PROGRESO |

Cada endpoint devuelve el ticket actualizado (200 OK).

### Validación y errores

- Ticket inexistente → 404 Not Found.
- Transición inválida (el estado actual no la permite) → 409 Conflict, con un
  cuerpo JSON tipo `{ "error": "mensaje claro de por qué no se puede" }`.
- La lógica de validación de transiciones debe vivir en un solo lugar (un método
  o componente reutilizable), no repartida por el controlador. Es candidata a
  primitivo de RoosterCore más adelante.

### Migración de base de datos

- Nueva migración Flyway `V2__ticket_fechas_estado.sql` que agregue dos columnas a
  la tabla `ticket`: `resuelto_en TIMESTAMPTZ NULL` y `cerrado_en TIMESTAMPTZ NULL`.
- NO editar la migración `V1`.

### Entidad

- Agregar a `Ticket` los campos `resueltoEn` y `cerradoEn` (mapeados a esas
  columnas). El backend los setea/limpia en las transiciones.

## Frontend

En la lista de tickets, según el estado actual, mostrar los botones de acción
disponibles:

| Estado      | Botones a mostrar       |
|-------------|-------------------------|
| ABIERTO     | Iniciar, Resolver       |
| EN_PROGRESO | Resolver                |
| RESUELTO    | Cerrar, Reabrir         |
| CERRADO     | Reabrir                 |

- Al tocar un botón, llamar al endpoint correspondiente y refrescar la lista.
- Mostrar el estado actual del ticket de forma clara (un badge).
- Si el backend responde con error (409), mostrar el mensaje al usuario.
- El diseño visual fino no es parte de esta tarea (va en una funcionalidad
  posterior). Acá alcanza con que sea claro y funcional.

## Restricciones (de CLAUDE.md)

- API versionada bajo `/api/v1`.
- Flyway es el dueño del esquema; crear migración nueva, no editar las aplicadas.
- Enums con `@Enumerated(EnumType.STRING)`.
- CORS por variable de entorno; no hardcodear dominios.
- No agregar librerías nuevas si no son imprescindibles.

## Criterios de aceptación

- [ ] Puedo iniciar, resolver, cerrar y reabrir un ticket desde la lista.
- [ ] Las transiciones inválidas se rechazan con un error claro (no rompen la app).
- [ ] Al resolver se guarda la fecha de resolución; al cerrar, la de cierre.
- [ ] El estado y los cambios persisten en la base (sobreviven a reiniciar el backend).
- [ ] El estado actual se ve claramente en cada ticket de la lista.

## Cómo pedírselo a Claude Code

Abrí el proyecto en VS Code y escribí:

> Implementá lo que está en `docs/editar-estado.md`. Seguí las reglas de
> `CLAUDE.md`. Antes de editar archivos, mostrame el plan paso a paso.

Revisá el plan, y si está bien, decile que avance.