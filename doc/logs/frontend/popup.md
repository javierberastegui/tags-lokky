# Log de superficie frontend: popup

## Propósito
Registrar decisiones sobre la UI principal de la extensión: popup, acciones rápidas, estado visible y errores mostrados al usuario.

## Entradas

### 2026-05-24 — Alta documental inicial
- Contexto: Tags Lokky necesitará una superficie simple para activar análisis y ver sugerencias.
- Objetivo: dejar trazabilidad inicial de popup.
- Archivos tocados: `AGENTS.md`, `doc/instrucciones/mapa_dominios.md`.
- Decisiones tomadas: popup debe mostrar control manual, sugerencias y estado; no debe autoenviar respuestas.
- Eventos estructurados revisados/emitidos: previsto `popup_opened`, `analysis_requested`, `suggestion_displayed`.
- Datos visibles/capturados: texto resumido de pregunta/opciones y respuesta sugerida.
- Validaciones ejecutadas: documental.
- Incidencias detectadas: falta implementación técnica.
- Siguiente paso: crear popup mínimo conectado a background mediante mensajes.

### 2026-05-27 — Fondo transparente de la aplicación
- Contexto: El usuario solicitó que el fondo de la aplicación sea totalmente transparente.
- Objetivo: Hacer transparente el fondo principal de la interfaz del panel lateral (sidepanel).
- Archivos tocados: `sidepanel/sidepanel.css`.
- Decisiones tomadas: Se modificó la regla `body` en `sidepanel.css` para establecer `background-color: transparent` en lugar de la variable oscura `var(--bg-primary)`.
- Validaciones ejecutadas: Modificación CSS.

