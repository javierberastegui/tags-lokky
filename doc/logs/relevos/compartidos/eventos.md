# Relevo: eventos

## Estado actual
Dominio documental creado para eventos estructurados y reglas centrales de logs/notificaciones.

## Hecho en la última etapa
- Definida regla central: primero evento estructurado, luego decisión de registro/aviso.
- Registrado dominio en `doc/instrucciones/mapa_dominios.md`.
- Creado log inicial en `doc/logs/backend_modulos/eventos.md`.

## No hecho / pendiente
- Falta crear módulo técnico de eventos.
- Falta catálogo inicial de tipos en código.
- Falta decidir persistencia local de eventos, si procede.

## Riesgos o trampas conocidas
- No meter `console.log` dispersos como sustituto de eventos.
- No registrar secretos ni datos sensibles.
- No duplicar avisos en popup/background/content script.

## Archivos clave
- `AGENTS.md`
- `doc/logs/backend_modulos/eventos.md`
- `doc/instrucciones/uso_autorizado_y_privacidad.md`

## Validaciones ejecutadas
- Validación documental.

## Validaciones pendientes
- Validar emisión de eventos cuando exista código.

## Siguiente micro-paso recomendado
Crear `src/shared/events/` o ruta equivalente con tipos/event emitter simple y payloads seguros.
