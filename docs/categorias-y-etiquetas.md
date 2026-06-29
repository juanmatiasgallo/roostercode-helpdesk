# Especificación: Categorías y Etiquetas del ticket

> Para implementar con Claude Code. Seguir las reglas de `CLAUDE.md`.
> **Esta es la única de las tres que lleva migración de base de datos.**

## Objetivo

Agregar al ticket una **categoría** (clasificación única, administrable) y
**etiquetas de colores** (varias por ticket, para comprensión rápida), con una
pantalla de configuración para crearlas, y filtros por categoría y etiqueta en
reportes.

## Modelo

- **Categoría:** id (UUID), nombre (único), activo (boolean), createdAt.
  Un ticket tiene **una** categoría (opcional).
- **Etiqueta:** id (UUID), nombre (único), color (hex, ej. `#C0392B`), createdAt.
  Un ticket puede tener **varias** etiquetas (relación muchos-a-muchos).

## Backend

### Migración

- Crear una migración Flyway nueva con el **siguiente número de versión
  disponible** (revisá la carpeta `db/migration`):
  - Tabla `categoria`.
  - Tabla `etiqueta` (con columna `color`).
  - Tabla de unión `ticket_etiqueta` (ticket ↔ etiqueta).
  - Columna `categoria_id` (UUID, NULL) en `ticket`, FK a `categoria`
    **ON DELETE SET NULL** (borrar una categoría no borra los tickets).
- No editar migraciones anteriores.

### Endpoints (bajo `/api/v1`, protegidos)

- Categorías: `POST`, `GET`, `PUT /{id}`, `DELETE /{id}`.
- Etiquetas: `POST`, `GET`, `PUT /{id}`, `DELETE /{id}` (incluye `color`).
- Crear/editar ticket: aceptar `categoriaId` (opcional) y `etiquetaIds` (lista,
  opcional).
- `GET /api/v1/tickets`: sumar a los filtros existentes `categoriaId` y
  `etiquetaId`.
- Validación en el servidor (nombre requerido; color con formato hex válido).

## Frontend

- **Pantalla "Configuración":** crear, editar y borrar **categorías** y
  **etiquetas**. Las etiquetas se crean eligiendo un **color** (selector de
  color / paleta). Agregar "Configuración" a la navegación.
- **Al crear/editar un ticket:** elegir la categoría (desplegable de las creadas)
  y las etiquetas (selección múltiple, mostradas con su color).
- **Mostrar** la categoría y las etiquetas (como chips de colores) en la lista
  principal, en el detalle del ticket y en la tabla de reportes.
- **En reportes:** agregar filtros por **categoría** y por **etiqueta**.
- Heredar la identidad visual.

## Restricciones (de CLAUDE.md)

- Migración nueva (siguiente número), no editar las anteriores.
- Enums/colores validados en el servidor. API bajo `/api/v1`.
- No agregar dependencias pesadas para el selector de color (alcanza con un
  input de color HTML o una paleta simple).

## Criterios de aceptación

- [ ] En Configuración puedo crear, editar y borrar categorías.
- [ ] En Configuración puedo crear etiquetas eligiendo un color.
- [ ] Al crear/editar un ticket puedo asignarle una categoría y varias etiquetas.
- [ ] La categoría y las etiquetas (con color) se ven en la lista, el detalle y reportes.
- [ ] En reportes puedo filtrar por categoría y por etiqueta.
- [ ] Borrar una categoría no borra los tickets (quedan sin categoría).

## Cómo pedírselo a Claude Code

> Implementá lo que está en `docs/categorias-y-etiquetas.md`. Seguí las reglas de
> `CLAUDE.md`. Lleva una migración nueva (categoría, etiqueta con color, unión
> ticket-etiqueta y categoria_id en ticket con ON DELETE SET NULL). Pantalla de
> Configuración para administrarlas y filtros en reportes. Sin librerías pesadas
> para el color. Antes de editar archivos, mostrame el plan paso a paso.
