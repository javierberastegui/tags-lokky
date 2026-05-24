# errores_detectados.md

## Propósito
Registrar errores reales detectados durante el desarrollo.

## Entradas

### 2026-05-24 — Error de API 404 de Hermes local en background.js (Badge de Exclamación '!')
- Contexto: Al usar el Modo escucha con Hermes configurado como proveedor del Gateway, el icono de la extensión mostraba una exclamación `!` debido a una excepción no controlada en el service worker.
- Causa: `resolveAnswerLetter` en `background.js` hacía un POST al endpoint `/chat/completions` (OpenAI format) en la URL de Hermes (`http://127.0.0.1:9119`), lo cual devolvía un error HTTP 404 ya que Hermes utiliza `/api/companion/chat`.
- Resolución: Se implementó `callHermesLocalLetter` en `background.js` que realiza la petición POST con `{ message: prompt }` al endpoint correcto de Hermes y devuelve el texto de la respuesta directa de manera limpia.
- Estado: Corregido y listo para verificación.
