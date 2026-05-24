# Relevo: content_script

## Estado actual
Dominio documental creado para extracción de cuestionarios y adaptación de página mediante content script.

## Hecho en la última etapa
- Definido content script como adaptador de página.
- Registrado dominio en `doc/instrucciones/mapa_dominios.md`.
- Creado log inicial en `doc/logs/frontend/content_script.md`.

## No hecho / pendiente
- Falta content script real.
- Falta extractor DOM no invasivo.
- Falta definir selectores genéricos y fallback manual.

## Riesgos o trampas conocidas
- No autoenviar formularios.
- No capturar HTML completo sin necesidad.
- No mezclar extracción DOM con llamadas IA.

## Archivos clave
- `AGENTS.md`
- `doc/logs/frontend/content_script.md`
- `doc/instrucciones/uso_autorizado_y_privacidad.md`

## Validaciones ejecutadas
- Validación documental.

## Validaciones pendientes
- Validar en navegador cuando exista content script.
- Validar que solo captura pregunta/opciones necesarias.

## Siguiente micro-paso recomendado
Crear extractor simple que detecte texto seleccionado o bloque de pregunta activo, sin automatizar respuesta.
