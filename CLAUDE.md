# RoosterCode — Help Desk

Contexto permanente del proyecto para Claude Code. Mantener este archivo corto y
estable. El plan y el roadmap NO van acá: viven en Obsidian (documento
"007 - Diseño Técnico del Módulo Help Desk").

## Qué es este proyecto

- RoosterCode es una plataforma modular. El primer producto es el módulo
  **Help Desk**: gestión de tickets de soporte.
- **Estrategia (ADR-001): producto primero.** RoosterCore (la base reutilizable)
  se **extrae** de lo que se repite entre productos. NO se diseña por adelantado.
  No crear abstracciones genéricas "por si acaso".
- **Estado actual:** walking skeleton en producción. Solo se pueden **crear** y
  **listar** tickets. Todavía NO hay login, comentarios, historial ni
  transiciones de estado (eso viene después, ver doc 007).

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
- **Base de datos:** PostgreSQL.
- **Despliegue:** GitHub → EasyPanel (Docker) en VPS. Push a `main` redespliega.

## Estructura del repo

```
backend/    Spring Boot (paquete com.roostercode.helpdesk; subpaquetes ticket/, config/)
frontend/   Next.js (carpeta app/)
backend/Dockerfile, frontend/Dockerfile
```

## Build y ejecución

- Backend: `mvn -DskipTests clean package` produce `app.jar` (escucha en 8080).
  Variables: `SPRING_DATASOURCE_URL`, `SPRING_DATASOURCE_USERNAME`,
  `SPRING_DATASOURCE_PASSWORD`, `CORS_ALLOWED_ORIGINS`.
- Frontend: `npm install && npm run build && npm start` (escucha en 3000).
  Variable: `NEXT_PUBLIC_API_URL` (se "hornea" en el build de Next).

## Convenciones de código (IMPORTANTE)

- Claves primarias UUID (`GenerationType.UUID`).
- **Flyway es el dueño del esquema.** Las migraciones van en
  `backend/src/main/resources/db/migration`, nombradas `V2__...`, `V3__...`
  (la `V1` ya existe). NUNCA editar una migración ya aplicada; siempre crear una
  nueva.
- Hibernate `ddl-auto = none` (Hibernate no crea ni modifica tablas).
- Enums de Java mapeados con `@Enumerated(EnumType.STRING)`; en la base son
  columnas `varchar` con `CHECK`.
- La API va versionada bajo `/api/v1`.
- CORS se configura por variable de entorno; no hardcodear dominios.
- Fechas en `timestamptz`.

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
  clienteNombre, prioridad (BAJA | MEDIA | ALTA | URGENTE),
  estado (ABIERTO | EN_PROGRESO | RESUELTO | CERRADO), createdAt.
- Endpoints actuales: `POST /api/v1/tickets`, `GET /api/v1/tickets`.

## Roadmap

El diseño completo y el orden de las funcionalidades están en Obsidian, documento
"007 - Diseño Técnico del Módulo Help Desk". Próximas funcionalidades previstas:
asignar agente, comentarios, historial, transiciones de estado, login.
Implementar de a una, chica y completa.
