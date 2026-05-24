# Log de superficie frontend: atajos

## Propósito
Registrar decisiones sobre la pestaña Atajos, teclas programables y acciones rápidas de la extensión.

## Entradas

### 2026-05-24 — Modo escucha sin cambio de foco e icono activo
- Contexto: el usuario indica que el Modo escucha no capturaba bien el texto y además el panel lateral interrumpía el flujo.
- Objetivo: procesar la selección desde la página activa sin abrir automáticamente el sidepanel.
- Archivos tocados: `background.js`, `content/content.js`, `content/content.css`, `doc/logs/frontend/atajos.md`.
- Decisiones tomadas:
  - El procesamiento de `LISTEN_SELECTION` pasa por `background.js`.
  - El sidepanel deja de abrirse automáticamente en Modo escucha.
  - `content/content.js` muestra una burbuja visual sobre la página con el resultado resumido.
  - El icono de extensión cambia dinámicamente: gris inactivo y verde con punto central cuando Modo escucha está activo.
  - El detalle completo queda disponible mediante el panel/historial.
- Mensajería revisada: `GET_SHORTCUTS`, `SAVE_SHORTCUTS`, `TOGGLE_LISTEN_MODE`, `LISTEN_SELECTION`, `SHORTCUTS_UPDATED`.
- Datos tratados: texto seleccionado por el usuario y, si existen, opciones cercanas detectadas en la página activa.
- Permisos afectados: sin permisos nuevos en esta etapa.
- Validaciones ejecutadas: revisión de flujo y rutas; pendiente prueba manual real en Chrome.
- Incidencias detectadas: la versión anterior fallaba por `commands.default: F8`; ya se retiró y F8 queda como tecla interna del content script.
- Siguiente paso: recargar extensión, activar Modo escucha, confirmar icono verde, seleccionar texto y verificar que aparece la burbuja sin abrir el panel.

### 2026-05-24 — Alta de Atajos y Modo escucha
- Contexto: el usuario pide un apartado de Atajos y el primer atajo llamado Modo escucha.
- Objetivo: permitir activar/desactivar el Modo escucha con F8 por defecto y con tecla programable desde la app.
- Archivos tocados: `manifest.json`, `background.js`, `content/content.js`, `sidepanel/sidepanel.html`, `sidepanel/shortcuts.js`, `sidepanel/shortcuts.css`, `doc/instrucciones/mapa_dominios.md`, `doc/logs/frontend/atajos.md`.
- Decisiones tomadas:
  - Se crea una nueva pestaña visible `Atajos`.
  - Se añade `Modo escucha` como primer atajo.
  - `F8` queda como tecla por defecto.
  - La tecla se puede modificar desde el panel.
  - Se retiró el comando nativo de Chrome porque `F8` no es válido como `commands.suggested_key.default`.
  - El texto seleccionado se procesa solo cuando el modo escucha está activo.
- Mensajería revisada: `GET_SHORTCUTS`, `SAVE_SHORTCUTS`, `TOGGLE_LISTEN_MODE`, `LISTEN_SELECTION`, `SHORTCUTS_UPDATED`.
- Datos tratados: texto seleccionado por el usuario en la página activa cuando Modo escucha está activo.
- Permisos afectados: `content_scripts.matches` pasa a `<all_urls>` para que el modo escucha pueda funcionar fuera de Canvas/edu. El repo ya tenía `host_permissions` con `<all_urls>`.
- Validaciones ejecutadas: revisión de archivos y rutas relativas; pendiente validación manual en Chrome.
- Incidencias detectadas: Chrome debe recargar la extensión desde `chrome://extensions` para aplicar manifest, content script y sidepanel nuevos.
- Siguiente paso: recargar extensión, abrir sidepanel, entrar en Atajos, activar Modo escucha y validar selección.
