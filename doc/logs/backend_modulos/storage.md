# Log de módulo de extensión: storage

## Propósito
Registrar historial, decisiones y validaciones del módulo storage (almacenamiento local, persistencia de configuración e historial de pruebas).

## Entradas

### 2026-05-24 — Almacenamiento estructurado agrupado por Prueba y exportación
- Contexto: El usuario solicita guardar las preguntas y respuestas agrupadas por prueba/cuestionario en lugar de una lista plana, y tener la capacidad de exportarlas al finalizar.
- Objetivo: Diseñar e implementar la estructura de almacenamiento `quizSessions` en `chrome.storage.local` y proporcionar mecanismos de exportación en formato Markdown y JSON.
- Archivos tocados: `content/content.js`, `background.js`, `sidepanel/sidepanel.js`, `sidepanel/sidepanel.css`, `doc/logs/backend_modulos/storage.md`.
- Decisiones tomadas:
  - Estructurar el almacenamiento bajo la clave `quizSessions` en `chrome.storage.local` como un diccionario mapeado por `quizId`.
  - El content script extrae dinámicamente el título y el identificador de la prueba del DOM/URL de Canvas y los adjunta a los mensajes.
  - El background script y la lógica de panel salvan tanto en `solveHistory` (plano para compatibilidad) como en `quizSessions` (agrupado).
  - La interfaz de historial se rediseñó para mostrar tarjetas de sesiones que se pueden colapsar y expandir para ver sus preguntas.
  - Se añadieron botones de exportación en Markdown y JSON que se ejecutan enteramente del lado del cliente.
- Eventos estructurados revisados/emitidos: `quiz_session_created`, `question_added_to_session`, `session_exported`.
- Permisos/datos/claves afectados: Estructuración del historial en local storage; no se tocan API keys ni secretos.
- Validaciones ejecutadas: Comprobación del guardado de objetos en local storage.
- Incidencias detectadas: Ninguna.
- Siguiente paso: Validar la recarga y prueba en navegador.
