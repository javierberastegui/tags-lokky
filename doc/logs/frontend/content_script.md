# Log de superficie frontend: content_script

## Propósito
Registrar decisiones sobre lectura de página activa, extracción de preguntas/opciones e inyección controlada de UI.

## Entradas

### 2026-05-24 — Corrección de extracción y concatenación errónea de opciones
- Contexto: El usuario reportó que las opciones extraídas en el Modo escucha aparecían concatenadas en una sola opción (ej. Artroplastia + Osteosíntesis...) y mezcladas con botones de la barra lateral de Canvas ("Calendario", "Chat").
- Causa:
  1. Los inputs de selección nativos en temas personalizados de Canvas New Quizzes a veces están ocultos con `opacity: 0` o tamaños `0x0`, lo cual hacía que `isVisibleElement` los descartara.
  2. Al no detectar los inputs, el sistema usaba el fallback `document.querySelectorAll("label, li, div, button")`. Al incluir `"div"` de forma genérica, extraía el contenedor principal que tiene todas las opciones concatenadas en su interior, además de divs fuera del área del test (sidebar).
  3. `getInputOptionText` usaba `closest("div")` directamente, lo que en ausencia de clases específicas podía emparejar con el contenedor padre general.
- Objetivo: Garantizar la correcta identificación de opciones sin mezclas ni concatenaciones en cualquier tema y estructura.
- Archivos tocados: `content/content.js`, `doc/logs/frontend/content_script.md`.
- Decisiones tomadas:
  - Flexibilizar `isVisibleElement` para que siempre retorne `true` si el elemento es un `INPUT` (ya que los inputs customizados suelen ocultarse por opacidad).
  - Modificar `getInputOptionText` para que valide que el contenedor `.closest` seleccionado no contenga múltiples inputs (evitando emparejar agrupadores).
  - Retirar `"div"` del query fallback de `extractOptionsFromVisibleRows` y reemplazarlo por elementos semánticos de opción (`[class*='option']`, `[class*='answer']`, `[role='radio']`, `[role='checkbox']`).
- Validaciones ejecutadas: Inspección lógica del árbol DOM de cuestionarios y verificación del flujo.
- Siguiente paso: Validar recargando en navegador.

### 2026-05-24 — Alta documental inicial
- Contexto: la extensión necesitará un content script para detectar cuestionarios autorizados.
- Objetivo: separar extracción DOM de proveedor IA, storage y popup.
- Archivos tocados: `AGENTS.md`, `doc/instrucciones/mapa_dominios.md`.
- Decisiones tomadas: content script como adaptador de página; sin lógica pesada de IA ni autoenvío de formularios.
- Eventos estructurados revisados/emitidos: previsto `quiz_detected`, `question_extracted`, `content_script_error`.
- Datos visibles/capturados: solo texto necesario de preguntas/opciones cuando el usuario active el flujo.
- Validaciones ejecutadas: documental.
- Incidencias detectadas: falta implementación técnica.
- Siguiente paso: crear extractor no invasivo con control manual del usuario.

### 2026-05-27 — Estilo transparente y discreto del botón inyectado
- Contexto: El usuario solicitó hacer el botón inyectado en la página ("Estudiar con Gemini") más discreto y transparente.
- Objetivo: Reemplazar el fondo de gradiente sólido por un diseño minimalista con bordes y fondo transparente, mejorando la integración visual en Canvas.
- Archivos tocados: `content/content.css`.
- Decisiones tomadas:
  - Cambiar el background a `transparent` y usar un color de texto/borde basado en el tema índigo de la aplicación.
  - Diseñar estados de hover/active/success/error acordes al estilo transparente de forma sutil.
  - Oscurecer los tonos del texto e iconos (de `#818cf8` a `#4338ca` / `#3730a3`) y bordes para asegurar una legibilidad y contraste óptimos sobre el fondo claro de Canvas.
- Validaciones ejecutadas: Modificación CSS y restauración previa del fondo del sidepanel.


