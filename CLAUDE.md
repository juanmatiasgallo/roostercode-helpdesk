# RoosterCode — Help Desk

Contexto permanente del proyecto para Claude Code. Mantener corto y estable.
El plan y el roadmap viven en Obsidian ("007 - Diseño Técnico", "Bitácora de
Cambios — Help Desk" y el "Tablero Kanban"), no acá.

## Qué es este proyecto

- RoosterCode es una plataforma modular. Primer producto: módulo **Help Desk**.
- **Estrategia (ADR-001): producto primero.** Lo reutilizable se **extrae** de lo
  que se repite; no se diseñan abstracciones genéricas por adelantado.
- **Estado actual (en producción):** Tickets (crear, listar, estados, editar,
  detalle), login/seguridad, comentarios con autoría, proveedores (ABM),
  clientes como persona (ABM), categorías y etiquetas de colores, dashboard con
  KPIs, y pantalla de reportes/búsqueda.

## Arquitectura — reglas que no se rompen

- Monolito modular: backend Spring Boot + frontend Next.js, un repo.
- Los módulos se comunican por API o eventos, **NUNCA por la base de otro módulo**
  (Principio 4).
- Prioridades ante dudas (RCDF): 1) Seguridad 2) Integridad de datos
  3) Valor al cliente 4) Arquitectura/mantenibilidad.
- Toda tecnología debe justificarse (Principio 18).
- Si algo es ambiguo: **declararlo y preguntar, no inventar** (Principio 10).

## Stack

- Backend: Java 21, Spring Boot 3.3.x (Web, Data JPA, Validation, Security),
  Flyway, PostgreSQL, Maven.
- Frontend: Next.js 14 (App Router), TypeScript.
- Despliegue: GitHub → EasyPanel (Docker) en VPS. Push a `main` redespliega.
  Si hay migración nueva: desplegar primero `api`, luego `web`.

## Estructura del repo

```
backend/   com.roostercode.helpdesk con subpaquetes:
           ticket/, auth/, comentario/, proveedor/, cliente/, categoria/,
           etiqueta/, config/
frontend/  app/ con pantallas: tickets, tickets/[id], clientes, clientes/[id],
           proveedores, reportes, configuracion, login, components/
docs/      Especificaciones de funcionalidades
backend/Dockerfile, frontend/Dockerfile, CLAUDE.md
```

## Build y ejecución

- Backend: `mvn -DskipTests clean package` → `app.jar` (puerto 8080).
- Frontend: `npm install && npm run build && npm start` (puerto 3000).
- Variables de entorno (en EasyPanel, NUNCA en el repo):
  `SPRING_DATASOURCE_URL`, `SPRING_DATASOURCE_USERNAME`,
  `SPRING_DATASOURCE_PASSWORD`, `CORS_ALLOWED_ORIGINS`,
  `JWT_SECRET` (≥32 caracteres; si falta/corto, la app NO arranca a propósito),
  `ADMIN_EMAIL`, `ADMIN_PASSWORD`, y en frontend `NEXT_PUBLIC_API_URL`.

## Convenciones de código (IMPORTANTE)

- Claves primarias UUID.
- **Flyway es el dueño del esquema.** Migraciones en
  `backend/src/main/resources/db/migration` (van por la **V8**). Para una
  migración nueva, usar el **siguiente número disponible**; NUNCA editar una ya
  aplicada.
- Hibernate `ddl-auto = none`.
- Enums Java con `@Enumerated(EnumType.STRING)`; en la base `varchar` + `CHECK`.
  El enum `Departamento` (19 de Uruguay) lo usa Proveedor; reutilizar.
- API bajo `/api/v1`.
- **Seguridad:** todo `/api/v1` protegido salvo `POST /api/v1/auth/login`.
  JWT stateless, header `Authorization: Bearer`. El **autor/actor de una acción
  se toma del usuario autenticado, NUNCA del body.**
- **Validación en el servidor** con Bean Validation. Hay un
  `ValidacionExceptionHandler` global (400 con `{ "errores": {...} }`). Reutilizarlo.
- Errores: 404 = no encontrado, 409 = conflicto/duplicado. Fechas en `timestamptz`.

## Qué NO hacer

- NO construir RoosterCore como framework genérico todavía (ADR-001).
- NO romper el límite entre módulos (Principio 4).
- NO poner secretos en el código ni en el repo.
- NO duplicar lo que ya existe; reutilizar entidades, enums, formularios, handlers.

## Modelo de dominio

- **Ticket:** id, numero, titulo, descripcion, **clienteNombre (texto libre)**,
  categoria (FK opcional → Categoria), etiquetas (N:M → Etiqueta), prioridad
  (BAJA|MEDIA|ALTA|URGENTE), estado (ABIERTO|EN_PROGRESO|RESUELTO|CERRADO),
  createdAt, resueltoEn, cerradoEn.
  - **PENDIENTE conocido:** el ticket todавía NO está vinculado por FK a la
    entidad Cliente; usa `clienteNombre` como texto. Vincularlo de verdad
    (cliente_id) es la próxima mejora de fondo.
- **Usuario:** id, nombre, email (único), passwordHash, rol (ADMIN), activo, fechas.
- **Comentario:** id, ticket, autor (Usuario), cuerpo, visibilidad (INTERNA|PUBLICA), createdAt.
- **Proveedor:** id, empresa, rut (único), telefono, direccion, departamento (enum), email (único), createdAt.
- **Cliente (persona):** id, nombreCompleto, celular, email (único), createdAt.
- **Categoria:** id, nombre, activo, createdAt.
- **Etiqueta:** id, nombre, color (hex), createdAt.

### Endpoints (bajo `/api/v1`)

- `POST/GET /tickets`, `GET /tickets/{id}`, `PUT /tickets/{id}`,
  `POST /tickets/{id}/iniciar|resolver|cerrar|reabrir`, `GET /tickets/resumen`
- `POST/GET /tickets/{id}/comentarios`
- `POST /auth/login` (público), `GET /auth/me`
- `POST/GET/PUT/DELETE /proveedores`
- `POST/GET/PUT/DELETE /clientes` (GET admite `?q=`)
- `POST/GET/PUT/DELETE /categorias`
- `POST/GET/PUT/DELETE /etiquetas`

## Roadmap

Diseño y avance en Obsidian (007, Kanban, Bitácora). Próximo de fondo: vincular
el ticket a la entidad Cliente (FK, migrando el texto libre). Visión más grande
(módulo Wiki/Base de Conocimiento; dashboard tipo Jira con asignación de agentes
y SLA): planificar por fases, una funcionalidad chica por vez.
