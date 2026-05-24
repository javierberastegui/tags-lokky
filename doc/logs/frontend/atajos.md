# Log de superficie frontend: atajos

## Propósito
Registrar decisiones sobre la pestaña Atajos, teclas programables y acciones rápidas de la extensión.

## Entradas

### 2026-05-24 — Alta de Atajos y Modo escucha
- Contexto: el usuario pide un apartado de Atajos y el primer atajo llamado Modo escucha.
- Objetivo: permitir activar/desactivar el Modo escucha con F8 por defecto y con tecla programable desde la app.
- Archivos tocados: `manifest.json`, `background.js`, `content/content.js`, `sidepanel/sidepanel.html`, `sidepanel/shortcuts.js`, `sidepanel/shortcuts.css`, `doc/instrucciones/mapa_dominios.md`, `doc/logs/frontend/atajos.md`.
- Decisiones tomadas:
  - Se crea una nueva pestaña visible `Atajos`.
  - Se añade `Modo escucha` como primer atajo.
  - `F8` queda como tecla por defecto.
  - La tecla se puede modificar desde el panel.
  - Se registra también comando nativo `toggle-listen-mode` en `manifest.json` para compatibilidad con `chrome://extensions/shortcuts`.
  - El texto seleccionado se envía al panel solo cuando el modo escucha está activo.
- Eventos estructurados revisados/emitidos: todavía no existe event bus formal; se usa mensajería Chrome centralizada `GET_SHORTCUTS`, `SAVE_SHORTCUTS`, `TOGGLE_LISTEN_MODE`, `LISTEN_SELECTION`, `SHORTCUTS_UPDATED`.
- Datos visibles/capturados: texto seleccionado por el usuario en la página activa cuando Modo escucha está activo.
- Permisos afectados: `content_scripts.matches` pasa a `<all_urls>` para que el modo escucha pueda funcionar fuera de Canvas/edu. El repo ya tenía `host_permissions` con `<all_urls>`.
- Validaciones ejecutadas: revisión de archivos y rutas relativas; pendiente validación manual en Chrome.
- Incidencias detectadas: Chrome debe recargar la extensión desde `chrome://extensions` para aplicar manifest, content script y sidepanel nuevos.
- Siguiente paso: recargar extensión, abrir sidepanel, entrar en Atajos, activar Modo escucha, subrayar texto y comprobar que llega al panel.
