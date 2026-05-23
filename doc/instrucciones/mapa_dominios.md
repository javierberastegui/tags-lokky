# mapa_dominios.md

## Propósito
Este archivo traduce nombres naturales usados por el usuario a dominios documentales y operativos de Tags Lokky.

Su objetivo es permitir continuidad con órdenes breves como:
- “sigue con manifest”
- “sigue con popup”
- “sigue con content script”
- “sigue con IA”
- “sigue con eventos”
- “sigue con storage”

## Regla de uso
Cuando el usuario use un nombre natural, el agente debe resolver aquí el dominio antes de seguir.

Después debe leer:
1. el relevo del dominio
2. el log del dominio si existe
3. las incidencias relacionadas

## Alias actuales

### manifest / permisos
- alias: `manifest`, `manifest v3`, `mv3`, `permisos`, `permissions`, `host permissions`, `content_scripts`
- relevo principal: `doc/logs/relevos/compartidos/manifest_permisos.md`
- logs esperados: `doc/logs/backend_modulos/manifest_permisos.md`
- nota: cualquier permiso nuevo debe justificarse y documentarse.

### content script / extracción
- alias: `content script`, `content scripts`, `extractor`, `captura`, `leer cuestionario`, `detectar cuestionario`, `dom parser`, `parser dom`
- relevo principal: `doc/logs/relevos/frontend/content_script.md`
- logs esperados: `doc/logs/frontend/content_script.md`
- nota: debe limitarse a adaptación de página, extracción controlada e inyección mínima.

### popup
- alias: `popup`, `ventana`, `panel rápido`, `ui principal`, `botón extensión`
- relevo principal: `doc/logs/relevos/frontend/popup.md`
- logs esperados: `doc/logs/frontend/popup.md`

### options / configuración
- alias: `options`, `opciones`, `configuración`, `settings`, `ajustes`, `api key`, `clave ia`
- relevo principal: `doc/logs/relevos/frontend/options.md`
- logs esperados: `doc/logs/frontend/options.md`
- nota: nunca documentar ni guardar claves reales en repo.

### proveedor IA / prompts
- alias: `ia`, `ai`, `proveedor ia`, `provider`, `openai`, `gemini`, `ollama`, `prompt`, `prompts`, `resolver cuestionario`, `sugerir respuesta`
- relevo principal: `doc/logs/relevos/backend_modulos/ai_provider.md`
- logs esperados: `doc/logs/backend_modulos/ai_provider.md`
- nota: debe sugerir/explicar, no automatizar fraude ni autoenviar respuestas.

### storage
- alias: `storage`, `almacenamiento`, `chrome.storage`, `browser.storage`, `persistencia`, `config local`
- relevo principal: `doc/logs/relevos/backend_modulos/storage.md`
- logs esperados: `doc/logs/backend_modulos/storage.md`

### eventos
- alias: `eventos`, `eventos estructurados`, `logs internos`, `telemetría`, `sistema vivo`, `notificaciones`
- relevo principal: `doc/logs/relevos/compartidos/eventos.md`
- logs esperados: `doc/logs/backend_modulos/eventos.md`

### privacidad / uso autorizado
- alias: `privacidad`, `seguridad`, `uso autorizado`, `exámenes`, `cuestionarios`, `compliance`, `abuso`
- relevo principal: `doc/logs/relevos/compartidos/privacidad_uso_autorizado.md`
- logs esperados: `doc/logs/backend_modulos/privacidad_uso_autorizado.md`

### build / publicación
- alias: `build`, `empaquetado`, `release`, `publicación`, `chrome web store`, `firefox`, `zip extensión`
- relevo principal: `doc/logs/relevos/compartidos/build_publicacion.md`
- logs esperados: `doc/logs/backend_modulos/build_publicacion.md`

## Ejemplos de resolución rápida
- “sigue con IA” → relevo `doc/logs/relevos/backend_modulos/ai_provider.md` + log `doc/logs/backend_modulos/ai_provider.md`
- “sigue con popup” → relevo `doc/logs/relevos/frontend/popup.md` + log `doc/logs/frontend/popup.md`
- “sigue con permisos” → relevo `doc/logs/relevos/compartidos/manifest_permisos.md` + log `doc/logs/backend_modulos/manifest_permisos.md`
- “sigue con eventos” → relevo `doc/logs/relevos/compartidos/eventos.md` + log `doc/logs/backend_modulos/eventos.md`

## Regla para dominios nuevos
Si aparece un módulo, superficie o dominio nuevo que el usuario pueda invocar por nombre natural, el agente debe añadir aquí su alias y sus rutas documentales mínimas.

## Regla de nomenclatura
- usar slugs simples y estables
- evitar renombrados de dominios ya asentados sin motivo fuerte
- preferir un nombre de dominio corto, claro y reutilizable
