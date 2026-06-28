# RoosterCode — Help Desk

Contexto permanente del proyecto para Claude Code. Mantener corto y estable.
El plan y el roadmap viven en Obsidian ("007 - Diseño Técnico", "Bitácora de
Cambios — Help Desk" y el "Tablero Kanban"), no acá.

## Qué es este proyecto

- RoosterCode es una plataforma modular. Primer producto: módulo **Help Desk**
  (gestión de tickets de soporte).
- **Estrategia (ADR-001): producto primero.** RoosterCore (lo reutilizable) se
  **extrae** de lo que se repite. No diseñar abstracciones genéricas por adelantado.
- **Estado actual (en producción):**
  - Tickets: crear, listar, cambiar de estado (iniciar/resolver/cerrar/reabrir).
  - Login / seguridad: usuarios rol ADMIN, JWT, endpoints protegidos.
  - Comentarios en el ticket, con autoría y visibilidad (interna/pública).
  - Proveedores: entidad (empresa, RUT, dirección, departamento, etc.) + pantalla.
  - Clientes: entidad (persona: nombre, celular, email) + pantalla.
  - Vínculo opcional Ticket → Cliente (buscar o crear al crear el ticket).

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
- Base de datos: PostgreSQL.
- Despliegue: GitHub → EasyPanel (Docker) en VPS. Push a `main` redespliega.
  Si hay migración nueva: desplegar primero `api`, luego `web`.

## Estructura del repo

```
backend/   com.roostercode.helpdesk con subpaquetes:
           ticket/, auth/, comentario/, proveedor/, cliente/, config/
frontend/  Next.js (app/; pantallas: tickets, proveedores, clientes, login)
docs/      Especificaciones de funcionalidades (para implementar)
backend/Dockerfile, frontend/Dockerfile, CLAUDE.md
```

## Build y ejecución

- Backend: `mvn -DskipTests clean package` → `app.jar` (puerto 8080).
- Frontend: `npm install && npm run build && npm start` (puerto 3000).
- Variables de entorno (en EasyPanel, NUNCA en el repo):
  `SPRING_DATASOURCE_URL`, `SPRING_DATASOURCE_USERNAME`,
  `SPRING_DATASOURCE_PASSWORD`, `CORS_ALLOWED_ORIGINS`,
  `JWT_SECRET` (≥32 caracteres; si falta o es corto, la app NO arranca a propósito),
  `ADMIN_EMAIL`, `ADMIN_PASSWORD`, y en frontend `NEXT_PUBLIC_API_URL`.

## Convenciones de código (IMPORTANTE)

- Claves primarias UUID (`GenerationType.UUID`).
- **Flyway es el dueño del esquema.** Migraciones en
  `backend/src/main/resources/db/migration`. **Para una migración nueva, revisar
  la carpeta y usar el siguiente número disponible.** NUNCA editar una ya aplicada.
- Hibernate `ddl-auto = none`.
- Enums Java con `@Enumerated(EnumType.STRING)`; en la base `varchar` + `CHECK`.
  (El enum `Departamento` —19 de Uruguay— lo usa Proveedor; reutilizar, no duplicar.)
- API bajo `/api/v1`.
- **Seguridad:** todo `/api/v1` protegido salvo `POST /api/v1/auth/login`.
  JWT stateless, header `Authorization: Bearer`. El **autor/actor de una acción
  se toma del usuario autenticado, NUNCA del body.**
- **Validación en el servidor** con Bean Validation. Hay un
  `ValidacionExceptionHandler` global que devuelve 400 con
  `{ "errores": { "campo": "mensaje" } }`. Reutilizarlo.
- Errores: 404 = no encontrado, 409 = conflicto (transición inválida / duplicado).
- Fechas en `timestamptz`.

## Qué NO hacer

- NO construir RoosterCore como framework genérico todavía (ADR-001).
- NO romper el límite entre módulos (Principio 4).
- NO poner secretos en el código ni en el repo.
- NO duplicar lo que ya existe; reutilizar entidades, enums, formularios y handlers.

## Modelo de dominio

- **Ticket:** id, numero, titulo, descripcion, prioridad (BAJA|MEDIA|ALTA|URGENTE),
  estado (ABIERTO|EN_PROGRESO|RESUELTO|CERRADO), resueltoEn, cerradoEn, createdAt,
  cliente (opcional → Cliente). (`clienteNombre` legacy se conserva para tickets viejos.)
- **Usuario:** id, nombre, email (único), passwordHash, rol (ADMIN), activo, fechas.
- **Comentario:** id, ticket, autor (Usuario), cuerpo, visibilidad (INTERNA|PUBLICA), createdAt.
- **Proveedor:** id, empresa, rut (único), telefono, direccion, departamento (enum), email (único), createdAt.
- **Cliente (persona):** id, nombreCompleto, celular, email (único), createdAt.

### Endpoints (bajo `/api/v1`)

- `POST/GET /tickets` ; `POST /tickets/{id}/iniciar|resolver|cerrar|reabrir`
- `POST/GET /tickets/{id}/comentarios`
- `POST /auth/login` (público) ; `GET /auth/me`
- `POST/GET /proveedores`
- `POST/GET /clientes` (GET admite `?q=` para buscar)

## Roadmap

Diseño y orden en Obsidian (007 + Kanban); avance en la Bitácora. Próximas:
editar/eliminar Clientes y Proveedores; página de tickets con dashboard (KPIs por
estado) y ocultar resueltos; reportes/análisis cruzado; pulido de UX.
Implementar de a una, chica y completa.
