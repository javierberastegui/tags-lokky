# Log de superficie frontend: atajos

## Propósito
Registrar decisiones sobre la pestaña Atajos, teclas programables y acciones rápidas de la extensión.

## Entradas

### 2026-05-24 — Rediseño del icono de extensión para hiperfoco en Modo escucha
- Contexto: El usuario reportó que los colores del badge y el estilo de ondas del Modo escucha le quitaban el foco.
- Objetivo: Diseñar un icono minimalista y monocromático que mantenga el hiperfoco.
- Archivos tocados: `background.js`, `doc/logs/frontend/atajos.md`.
- Decisiones tomadas:
  - Cambiar el fondo del icono dynamic canvas para que siempre sea de color `#383838`.
  - El Modo escucha activo se representa como un punto en el centro de color `#383838`.
  - Al recibir una respuesta (letra), esta se dibuja en el centro del icono en color `#383838` en lugar del badge de Chrome.
  - La letra se muestra durante exactamente 1 segundo (1000ms) y luego el icono vuelve automáticamente al punto `#383838` en el centro.
  - Se deshabilita el texto del badge de Chrome (`setBadgeText("")`) para evitar superposiciones de colores y marcos.
- Validaciones ejecutadas: Comprobación visual lógica y recarga de funciones canvas.
- Siguiente paso: Validar recargando en el navegador y probando el flujo.

### 2026-05-24 — Corrección del error de exclamación en Modo escucha bajo Hermes
- Contexto: Al usar el Modo escucha con la conexión configurada en el Gateway de Hermes local, la resolución de respuesta corta (`resolveAnswerLetter` en `background.js`) fallaba porque intentaba usar la interfaz genérica de OpenAI en el puerto de Hermes, causando un error de conexión (HTTP 404) y mostrando un signo de exclamación (`!`) en la insignia del icono.
- Objetivo: Evitar el error de conexión y el badge de exclamación resolviendo correctamente las llamadas rápidas a través de la API específica de Hermes local en segundo plano.
- Archivos tocados: `background.js`, `doc/logs/frontend/atajos.md`.
- Decisiones tomadas:
  - Implementar la función `callHermesLocalLetter(prompt, url)` en `background.js` para comunicarse con la API de Hermes.
  - Actualizar `resolveAnswerLetter` para usar `callHermesLocalLetter` si el modo de conexión es `gateway` y el proveedor es `hermes`.
- Mensajería revisada: `LISTEN_SELECTION`.
- Validaciones ejecutadas: Comprobación de la firma de la petición a Hermes local y su correcta integración.
- Siguiente paso: Recargar la extensión en `chrome://extensions` y comprobar el Modo escucha con Hermes activo.

### 2026-05-24 — Panel de diagnóstico para Modo escucha
- Contexto: el usuario pide un diagnóstico visible para poder copiar el estado real cuando el icono no muestre `A/B/C/D` o el panel no reciba la pregunta.
- Objetivo: añadir un bloque de diagnóstico en la pestaña Atajos sin depender de consola ni service worker.
- Archivos tocados: `sidepanel/sidepanel.html`, `sidepanel/shortcuts.js`, `sidepanel/shortcuts.css`, `doc/logs/frontend/atajos.md`.
- Decisiones tomadas:
  - Se añade una tarjeta `Diagnóstico Modo escucha` dentro de Atajos.
  - Se añaden botones `Actualizar diagnóstico` y `Copiar diagnóstico`.
  - El diagnóstico muestra `shortcuts`, configuración sin secretos, `lastError`, `listenResultInbox`, `pendingAnalysis`, último elemento del historial y estado visible del panel.
  - Los secretos se redactan como `[REDACTED:n chars]`.
  - El diagnóstico usa también el último historial para que los datos no desaparezcan si la bandeja `listenResultInbox` ya fue consumida.
- Mensajería revisada: `LISTEN_RESULT_READY`, `SHORTCUTS_UPDATED` y cambios de `chrome.storage.local/session`.
- Datos tratados: estado de atajos, modo de conexión, pregunta detectada, opciones detectadas, respuesta rápida, último error y último historial.
- Permisos afectados: sin permisos nuevos.
- Validaciones ejecutadas: revisión de flujo y commits aplicados; pendiente prueba manual real en Chrome.
- Siguiente paso: recargar extensión, reproducir fallo, abrir Atajos, pulsar `Actualizar diagnóstico`, copiar JSON y revisarlo.

### 2026-05-24 — Reparación de llegada de Modo escucha al panel
- Contexto: el usuario reporta que las preguntas/respuestas del Modo escucha no llegan al panel.
- Causa detectada: `sidepanel.js` consume y elimina `pendingAnalysis` al abrir el panel, pero solo entiende el flujo antiguo `free_text`. Eso hacía que los resultados `listen_quick_result` pudieran descartarse antes de ser pintados.
- Objetivo: separar la bandeja del Modo escucha de `pendingAnalysis` para que el panel no pierda resultados.
- Archivos tocados: `background.js`, `sidepanel/shortcuts.js`, `doc/logs/frontend/atajos.md`.
- Decisiones tomadas:
  - `background.js` publica cada resultado rápido en `chrome.storage.local.listenResultInbox`.
  - También mantiene `pendingAnalysis` como compatibilidad, pero ya no es la fuente principal para Modo escucha.
  - `sidepanel/shortcuts.js` lee `listenResultInbox` al abrir el panel.
  - `sidepanel/shortcuts.js` escucha cambios en `chrome.storage.local` para pintar resultados si el panel ya está abierto.
  - El evento estructurado interno queda representado como `listen_result_ready` dentro del payload.
- Mensajería revisada: `LISTEN_SELECTION`, `LISTEN_RESULT_READY`, `TOGGLE_LISTEN_MODE`, `SHORTCUTS_UPDATED`.
- Datos tratados: pregunta seleccionada, opciones detectadas, letra recomendada y resultado rápido normalizado.
- Permisos afectados: sin permisos nuevos.
- Validaciones ejecutadas: revisión de flujo y commits aplicados; pendiente validación manual real en Chrome.
- Incidencias detectadas: riesgo de duplicados mitigado con `lastConsumedListenResultKey`.
- Siguiente paso: recargar extensión, activar Modo escucha, seleccionar pregunta, comprobar badge del icono y abrir panel para confirmar que se pinta la última pregunta/respuesta.

### 2026-05-24 — Modo escucha sin cambio de foco e icono activo
- Contexto: el usuario indica que el Modo escucha no capturaba bien el texto y además el panel lateral interrumpía el flujo.
- Objetivo: procesar la selección desde la página activa sin abrir automáticamente el sidepanel.
- Archivos tocados: `background.js`, `content/content.js`, `content/content.css`, `doc/logs/frontend/atajos.md`.
- Decisiones tomadas:
  - El procesamiento de `LISTEN_SELECTION` pasa por `background.js`.
  - El sidepanel deja de abrirse automáticamente en Modo escucha.
  - El icono de extensión cambia dinámicamente: gris inactivo y verde con punto central cuando Modo escucha está activo.
  - El resultado rápido debe mostrarse como badge del icono; no como burbuja sobre la página.
  - El detalle completo queda disponible mediante el panel/historial.
- Mensajería revisada: `GET_SHORTCUTS`, `SAVE_SHORTCUTS`, `TOGGLE_LISTEN_MODE`, `LISTEN_SELECTION`, `SHORTCUTS_UPDATED`.
- Datos tratados: texto seleccionado por el usuario y, si existen, opciones cercanas detectadas en la página activa.
- Permisos afectados: sin permisos nuevos en esta etapa.
- Validaciones ejecutadas: revisión de flujo y rutas; pendiente prueba manual real en Chrome.
- Incidencias detectadas: la versión anterior fallaba por `commands.default: F8`; ya se retiró y F8 queda como tecla interna del content script.
- Siguiente paso: recargar extensión, activar Modo escucha, confirmar icono verde, seleccionar texto y verificar badge del icono.

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
