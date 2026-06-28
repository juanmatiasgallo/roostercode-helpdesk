# RoosterCode — Help Desk

Sistema de gestión de tickets de soporte. Primer producto de **RoosterCode**, una
plataforma modular. Construido con un enfoque de "producto primero": las piezas
reutilizables se extraen de lo que se repite, no se diseñan por adelantado.

- **App:** https://apphelp.roostercode.tech
- **API:** https://apihelp.roostercode.tech

## Funcionalidades

- Tickets: crear, listar y cambiar de estado (abierto → en progreso → resuelto →
  cerrado, con reapertura).
- Autenticación con login (JWT) y endpoints protegidos.
- Comentarios en cada ticket, con autoría y visibilidad interna/pública.
- Proveedores: alta y listado, con validación.
- Clientes (personas): alta y listado.
- Vínculo opcional entre ticket y cliente (buscar uno existente o crear uno nuevo
  al crear el ticket).

## Stack

- **Backend:** Java 21, Spring Boot 3.3 (Web, Data JPA, Validation, Security),
  Flyway, PostgreSQL, Maven.
- **Frontend:** Next.js 14 (App Router), TypeScript.
- **Infraestructura:** Docker, desplegado en EasyPanel sobre una VPS.

## Estructura

```
backend/    API Spring Boot (paquete com.roostercode.helpdesk)
frontend/   Aplicación Next.js
docs/        Especificaciones de cada funcionalidad
CLAUDE.md    Contexto del proyecto para asistencia con IA
```

## Desarrollo local

Requisitos: Java 21, Node.js, PostgreSQL.

```bash
# Backend
cd backend
mvn -DskipTests clean package
java -jar target/app.jar        # puerto 8080

# Frontend
cd frontend
npm install
npm run dev                     # puerto 3000
```

### Variables de entorno

Backend: `SPRING_DATASOURCE_URL`, `SPRING_DATASOURCE_USERNAME`,
`SPRING_DATASOURCE_PASSWORD`, `CORS_ALLOWED_ORIGINS`, `JWT_SECRET`
(mínimo 32 caracteres), `ADMIN_EMAIL`, `ADMIN_PASSWORD`.
Frontend: `NEXT_PUBLIC_API_URL`.

Los secretos van en el entorno de despliegue, nunca en el repositorio.

## Base de datos

El esquema lo gestiona **Flyway**. Las migraciones están en
`backend/src/main/resources/db/migration` y se aplican automáticamente al
arrancar el backend. Para un cambio de esquema, se agrega una migración nueva con
el siguiente número de versión; nunca se editan las ya aplicadas.

## Despliegue

Push a la rama `main` dispara el redespliegue en EasyPanel. Cuando hay una
migración nueva, se despliega primero el servicio `api` (que la aplica) y luego
el `web`.

## Estado

Proyecto en desarrollo activo. El diseño y el avance se documentan en un vault de
Obsidian (diseño técnico, bitácora de cambios y tablero Kanban).
EOF
echo "README.md listo"