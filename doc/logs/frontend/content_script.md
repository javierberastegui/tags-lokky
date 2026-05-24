# Log de superficie frontend: content_script

## Propósito
Registrar decisiones sobre lectura de página activa, extracción de preguntas/opciones e inyección controlada de UI.

## Entradas

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
