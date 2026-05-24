# Relevo: storage

## Estado actual
Se implementó el historial estructurado agrupado por prueba (`quizSessions`) con soporte para exportación en Markdown y JSON desde el panel lateral.

## Hecho en la última etapa
- Registrado dominio en `doc/instrucciones/mapa_dominios.md`.
- Creado log de storage en `doc/logs/backend_modulos/storage.md`.
- Implementado el guardado en `chrome.storage.local` agrupando preguntas bajo sesiones con ID y título de cuestionario extraídos del DOM.
- Diseñada e implementada la UI interactiva en la pestaña de Historial para expandir cuestionarios y exportar reportes.

## No hecho / pendiente
- Falta política concreta de cifrado/ocultación si se guardan claves.

## Riesgos o trampas conocidas
- No guardar secretos en repo.
- No imprimir secretos en consola.
- No duplicar configuración entre módulos.

## Archivos clave
- `AGENTS.md`
- `doc/instrucciones/uso_autorizado_y_privacidad.md`
- `doc/instrucciones/mapa_dominios.md`

## Validaciones ejecutadas
- Validación documental.

## Validaciones pendientes
- Validar lectura/escritura cuando exista código.

## Siguiente micro-paso recomendado
Crear `src/storage/` o ruta equivalente con API mínima `getConfig`, `saveConfig`, `getSafeConfigSummary`.
