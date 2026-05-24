# Relevo: privacidad_uso_autorizado

## Estado actual
Dominio documental creado para límites de uso, privacidad, claves y anti-abuso.

## Hecho en la última etapa
- Creado `doc/instrucciones/uso_autorizado_y_privacidad.md`.
- Adaptado `AGENTS.md` para extensión de navegador y cuestionarios autorizados.
- Registrado dominio en `doc/instrucciones/mapa_dominios.md`.

## No hecho / pendiente
- Falta implementar UI/flujo que haga visible el control humano.
- Falta decidir cómo se guardarán claves si hay proveedor externo.
- Falta validar que la extensión no autoenvía ni oculta uso de IA.

## Riesgos o trampas conocidas
- El objetivo “resolver cuestionarios” puede derivar en uso indebido si no se documenta y diseña bien.
- Evitar funciones de ocultación, evasión o autoenvío.
- Evitar capturar más datos de los necesarios.

## Archivos clave
- `AGENTS.md`
- `doc/instrucciones/uso_autorizado_y_privacidad.md`
- `doc/logs/incidencias/pendientes_validacion.md`

## Validaciones ejecutadas
- Validación documental.

## Validaciones pendientes
- Revisar permisos y flujo real cuando exista implementación.

## Siguiente micro-paso recomendado
Al crear el primer flujo técnico, asegurar que la IA devuelve sugerencia y explicación, con acción manual del usuario.
