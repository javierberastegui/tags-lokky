# Relevo: ai_provider

## Estado actual
Dominio documental creado para proveedores IA, prompts y contrato de respuesta sugerida.

## Hecho en la última etapa
- Definido que la IA debe sugerir y explicar.
- Registrado dominio en `doc/instrucciones/mapa_dominios.md`.
- Creado log inicial en `doc/logs/backend_modulos/ai_provider.md`.

## No hecho / pendiente
- Falta interfaz técnica de proveedor IA.
- Falta mock seguro.
- Falta decidir proveedor inicial real.
- Falta options/config para claves sin secretos en repo.

## Riesgos o trampas conocidas
- No llamar proveedores IA directamente desde content script o popup sin capa común.
- No enviar HTML completo ni datos sensibles innecesarios.
- No registrar prompts con datos sensibles si no hay sanitización.

## Archivos clave
- `AGENTS.md`
- `doc/instrucciones/uso_autorizado_y_privacidad.md`
- `doc/logs/backend_modulos/ai_provider.md`

## Validaciones ejecutadas
- Validación documental.

## Validaciones pendientes
- Tests de proveedor/mock cuando exista código.
- Validación manual de flujo pregunta → sugerencia → explicación.

## Siguiente micro-paso recomendado
Crear `src/ai/` o ruta equivalente con contrato común: entrada de pregunta/opciones y salida con sugerencia, confianza opcional y explicación.
