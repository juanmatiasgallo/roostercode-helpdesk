# RoosterCode — Help Desk

Contexto permanente del proyecto para Claude Code. Mantener este archivo corto y
estable. El plan y el roadmap NO van acá: viven en Obsidian (documento
"007 - Diseño Técnico del Módulo Help Desk" y la "Bitácora de Cambios — Help Desk").

## Qué es este proyecto

- RoosterCode es una plataforma modular. El primer producto es el módulo
  **Help Desk**: gestión de tickets de soporte.
- **Estrategia (ADR-001): producto primero.** RoosterCore (la base reutilizable)
  se **extrae** de lo que se repite entre productos. NO se diseña por adelantado.
  No crear abstracciones genéricas "por si acaso".
- **Estado actual:** en producción. Se pueden **crear**, **listar** y **cambiar
  el estado** de los tickets (iniciar / resolver / cerrar / reabrir). Todavía NO
  hay login, comentarios, ni clientes como entidad (ver roadmap en doc 007).

## Arquitectura — reglas que no se rompen

- Monolito modular: backend Java/Spring Boot + frontend Next.js, un solo repo.
- **Los módulos se comunican por API o eventos. NUNCA por acceso directo a la
  base de datos de otro módulo.** (Constitución del Software, Principio 4)
- Ante cualquier duda, este es el orden de prioridades (RCDF):
  1) Seguridad  2) Integridad de los datos  3) Valor para el cliente
  4) Arquitectura y mantenibilidad.
- Las decisiones importantes se documentan como ADR.
- Toda tecnología debe justificar su existencia. No agregar librerías por moda
  (Principio 18).

## Stack

- **Backend:** Java 21, Spring Boot 3.3.x (Web, Data JPA, Validation), Flyway,
  PostgreSQL. Build con Maven.
- **Frontend:** Next.js 14 (App Router), TypeScript.
- **Base de datos:** PostgreSQL. Versión de esquema actual: **V2**.
- **Despliegue:** GitHub → EasyPanel (Docker) en VPS. Push a `main` redespliega.

## Estructura del repo

```
backend/    Spring Boot (paquete com.roostercode.helpdesk; subpaquetes ticket/, config/)
frontend/   Next.js (carpeta app/)
docs/       Especificaciones de funcionalidades (para implementar)
backend/Dockerfile, frontend/Dockerfile, CLAUDE.md
```

## Build y ejecución

- Backend: `mvn -DskipTests clean package` produce `app.jar` (escucha en 8080).
  Variables: `SPRING_DATASOURCE_URL`, `SPRING_DATASOURCE_USERNAME`,
  `SPRING_DATASOURCE_PASSWORD`, `CORS_ALLOWED_ORIGINS`.
- Frontend: `npm install && npm run build && npm start` (escucha en 3000).
  Variable: `NEXT_PUBLIC_API_URL` (se "hornea" en el build de Next).

## Convenciones de código (IMPORTANTE)

- Claves primarias UUID (`GenerationType.UUID`).
- **Flyway es el dueño del esquema.** Migraciones en
  `backend/src/main/resources/db/migration`, nombradas `V3__...`, `V4__...`
  (ya existen `V1` y `V2`). NUNCA editar una migración ya aplicada; crear una nueva.
- Hibernate `ddl-auto = none` (Hibernate no crea ni modifica tablas).
- Enums de Java con `@Enumerated(EnumType.STRING)`; en la base, `varchar` + `CHECK`.
- La API va versionada bajo `/api/v1`.
- CORS por variable de entorno; no hardcodear dominios.
- Fechas en `timestamptz`.
- Errores con excepciones dedicadas y `@ExceptionHandler` (404 = no encontrado,
  409 = conflicto/transición inválida). La validación de transiciones de estado
  vive en un solo lugar; reutilizarla, no duplicarla.

## Qué NO hacer

- NO construir RoosterCore como framework genérico todavía. Primero el producto;
  lo común se extrae después (ADR-001).
- NO romper el límite entre módulos (Principio 4).
- NO poner secretos (contraseñas, tokens) en el código ni en el repo. Van en las
  variables de entorno de EasyPanel.
- Si falta información o algo es ambiguo, **declararlo y preguntar. No inventar**
  (Constitución de Agentes, Principio 10).

## Modelo de dominio actual

- **Ticket:** id (UUID), numero (autogenerado), titulo, descripcion,
  clienteNombre (texto libre por ahora), prioridad (BAJA | MEDIA | ALTA | URGENTE),
  estado (ABIERTO | EN_PROGRESO | RESUELTO | CERRADO), resueltoEn, cerradoEn,
  createdAt.
- Endpoints actuales:
  - `POST /api/v1/tickets` — crear
  - `GET  /api/v1/tickets` — listar
  - `POST /api/v1/tickets/{id}/iniciar` — ABIERTO -> EN_PROGRESO
  - `POST /api/v1/tickets/{id}/resolver` — -> RESUELTO
  - `POST /api/v1/tickets/{id}/cerrar` — RESUELTO -> CERRADO
  - `POST /api/v1/tickets/{id}/reabrir` — -> ABIERTO / EN_PROGRESO

## Roadmap

El diseño y el orden de las funcionalidades están en Obsidian (doc 007) y el
avance se registra en la "Bitácora de Cambios — Help Desk". Próximas:
identidad visual, login/seguridad, notas con autoría, archivar, clientes como
entidad, tipo/categoría, filtros, reportes. Implementar de a una, chica y completa.
