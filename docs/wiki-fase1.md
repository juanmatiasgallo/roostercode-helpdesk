# Especificación: Módulo Wiki / Base de Conocimiento — Fase 1

> Para implementar con Claude Code. Seguir las reglas de `CLAUDE.md`.
> Es un **módulo nuevo** (paquete `wiki/`). Respetar el Principio 4 (no acceder a
> la base de otros módulos).

## Objetivo (Fase 1, mínima pero útil)

Poder **crear, organizar, leer y editar** artículos de documentación en Markdown,
en un **árbol jerárquico sin límite de profundidad**. El contenido se guarda como
**archivos `.md`** en el servidor.

## Decisiones tomadas

- Estructura: árbol con sub-niveles sin límite (carpetas dentro de carpetas, y
  artículos dentro de cualquier carpeta).
- Almacenamiento: **archivos `.md` en el filesystem** (sin sincronizar con Git por
  ahora). Las carpetas del árbol = directorios; los artículos = archivos `.md`.

## Fuera del alcance (fases siguientes)

Búsqueda por contenido, favoritos, historial, etiquetas, Mermaid, resaltado de
código, adjuntos, videos, vínculo con tickets, IA, sincronización con Git.
(La Fase 1 deja la base lista para todo eso.)

## Almacenamiento e infraestructura (IMPORTANTE)

- Los archivos viven bajo un directorio raíz configurable por variable de entorno
  **`WIKI_DIR`** (ej. `/data/wiki`).
- Ese directorio **debe ser un volumen persistente** en EasyPanel (si no, el
  contenido se pierde en cada redeploy). Es un paso de configuración aparte.
- **Seguridad (crítico):** todas las rutas que llegan por la API deben validarse y
  quedar **confinadas dentro de `WIKI_DIR`**. Rechazar cualquier intento de salir
  (`..`, rutas absolutas) y permitir solo directorios y archivos `.md`. Esto evita
  que alguien lea/escriba archivos fuera del wiki (path traversal).

## Backend (paquete `wiki/`, endpoints bajo `/api/v1/wiki`, protegidos)

- `GET /wiki/arbol` — devuelve el árbol (carpetas y artículos) recorriendo
  `WIKI_DIR`. Cada nodo: nombre, tipo (CARPETA | ARTICULO), ruta relativa, hijos.
- `GET /wiki/articulo?ruta=...` — devuelve el contenido Markdown del artículo.
- `PUT /wiki/articulo?ruta=...` — guarda (sobrescribe) el contenido del artículo.
- `POST /wiki/carpeta` — crea una carpeta (ruta del padre + nombre).
- `POST /wiki/articulo` — crea un artículo `.md` vacío (ruta del padre + nombre).
- `DELETE /wiki/nodo?ruta=...` — elimina un artículo o una carpeta (con confirmación
  en el front).
- Validar nombres (sin caracteres raros) y confinar rutas a `WIKI_DIR` en TODOS
  los endpoints.
- No requiere migración de base de datos (es filesystem).

## Frontend

- Nueva pantalla **"Base de Conocimiento"** (agregar a la navegación):
  - **Árbol lateral** de navegación, expandible, con las carpetas y artículos.
  - **Breadcrumb** que muestre la ruta del artículo abierto.
  - Al seleccionar un artículo, mostrarlo **renderizado** (Markdown → HTML):
    títulos, listas, tablas, bloques de código, enlaces, imágenes.
  - Botón **Editar**: editor de Markdown con **vista previa** (lado a lado o
    alternable). Al guardar, llama a `PUT`.
  - Botones para **crear carpeta**, **crear artículo** (en el nodo seleccionado) y
    **eliminar** (con confirmación).
- Usar una **librería estándar de Markdown** (ej. `react-markdown` con
  `remark-gfm` para tablas). El resaltado de código y Mermaid quedan para la
  Fase 2.
- Heredar la identidad visual; usar el token; cuidar buena experiencia.

## Restricciones (de CLAUDE.md)

- Módulo nuevo, sin romper el Principio 4.
- Sin migración (filesystem). Nueva variable `WIKI_DIR`.
- Seguridad de rutas obligatoria (confinar a `WIKI_DIR`, sin path traversal).
- La librería de Markdown está justificada (es el núcleo del módulo); no agregar
  más dependencias de las necesarias.

## Criterios de aceptación

- [ ] Veo un árbol con carpetas y artículos, con sub-niveles sin límite.
- [ ] Puedo crear carpetas y artículos en cualquier nivel.
- [ ] Puedo escribir y editar el contenido de un artículo en Markdown y verlo
  renderizado (con vista previa al editar).
- [ ] El contenido se guarda como archivo `.md` y **persiste tras un redeploy**
  (con el volumen configurado).
- [ ] No se puede acceder a archivos fuera del directorio del wiki.
- [ ] Nada de lo existente se rompió.

## Pasos de despliegue (recordatorio)

1. Crear/montar un **volumen persistente** en el servicio `api` de EasyPanel,
   apuntando al directorio de `WIKI_DIR` (ej. `/data/wiki`).
2. Definir la variable `WIKI_DIR` con esa ruta.
3. Desplegar `api`, luego `web`.

## Cómo pedírselo a Claude Code

> Implementá lo que está en `docs/wiki-fase1.md`. Seguí las reglas de `CLAUDE.md`.
> Es un módulo nuevo (wiki/) basado en archivos .md en el filesystem bajo WIKI_DIR;
> sin migración. Árbol jerárquico sin límite, crear/leer/editar/borrar, editor
> Markdown con vista previa y render con una librería estándar. Confiná todas las
> rutas dentro de WIKI_DIR (sin path traversal). Antes de editar archivos,
> mostrame el plan paso a paso.

Revisá el plan antes de avanzar (es un módulo nuevo y maneja archivos).
