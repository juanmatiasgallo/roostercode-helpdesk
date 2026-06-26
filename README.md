# RoosterCode · Help Desk (Walking Skeleton v0.1)

Primer producto de RoosterCode. Esta versión es el "esqueleto que camina":
lo mínimo de punta a punta para probar que todo el stack funciona y despliega.

Diseño completo: ver documento `007 - Diseño Técnico del Módulo Help Desk` en Obsidian.

## Qué hace esta versión

- Crear un ticket (título, descripción, cliente, prioridad).
- Listar los tickets existentes.

Nada más todavía: sin login, sin comentarios, sin historial. Eso viene después,
sobre este esqueleto que ya respira.

## Estructura

```
roostercode-helpdesk/
├── backend/    Spring Boot (Java 21) + PostgreSQL + Flyway
└── frontend/   Next.js (TypeScript)
```

## Endpoints

| Método | Ruta                | Qué hace          |
|--------|---------------------|-------------------|
| GET    | /api/v1/tickets     | Lista los tickets |
| POST   | /api/v1/tickets     | Crea un ticket    |

## Variables de entorno

### Backend (servicio de la API en EasyPanel)

| Variable                   | Ejemplo                                          |
|----------------------------|--------------------------------------------------|
| SPRING_DATASOURCE_URL      | jdbc:postgresql://HOST_INTERNO:5432/helpdesk     |
| SPRING_DATASOURCE_USERNAME | helpdesk                                         |
| SPRING_DATASOURCE_PASSWORD | (la que defina EasyPanel al crear el Postgres)   |
| CORS_ALLOWED_ORIGINS       | https://app.tudominio.com  (la URL del frontend) |

> `HOST_INTERNO` es el nombre interno que EasyPanel le da al servicio Postgres.
> Lo tomamos de la pantalla del servicio de base de datos al momento de configurar.

### Frontend (servicio web en EasyPanel)

| Variable             | Ejemplo                        |
|----------------------|--------------------------------|
| NEXT_PUBLIC_API_URL  | https://api.tudominio.com      |

> Importante: Next.js "hornea" esta variable en el build, así que en EasyPanel
> debe estar seteada antes de desplegar el frontend.

## Despliegue en EasyPanel (resumen)

1. Crear un proyecto (ej. `roostercode`).
2. Agregar un servicio **Postgres** (base: `helpdesk`).
3. Agregar un servicio **App** para el backend:
   - Fuente: este repo de GitHub.
   - Build: Dockerfile, ruta `backend/Dockerfile`.
   - Variables: las del backend (arriba).
4. Agregar un servicio **App** para el frontend:
   - Fuente: el mismo repo.
   - Build: Dockerfile, ruta `frontend/Dockerfile`.
   - Variables: `NEXT_PUBLIC_API_URL`.
5. Asignar dominios a backend y frontend (EasyPanel pone el HTTPS).
6. Deploy.

Los pasos detallados, pantalla por pantalla, los hacemos juntos.

## Criterios de aceptación

- [ ] Puedo crear un ticket desde la web y, al recargar, aparece en la lista.
- [ ] El dato persiste en Postgres (sobrevive a reiniciar el backend).
- [ ] Backend y frontend accesibles por HTTPS en tu dominio.
