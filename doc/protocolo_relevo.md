# protocolo_relevo.md

## Propósito
Definir cómo debe dejarse continuidad operativa en Tags Lokky.

Este archivo no sustituye los relevos por dominio.
Sirve como protocolo común para que cualquier agente pueda continuar sin reiniciar el proyecto.

## Secuencia obligatoria al entrar
Antes de tocar código o documentación viva:

1. leer `AGENTS.md`
2. leer `doc/instrucciones/README.md`
3. resolver dominio en `doc/instrucciones/mapa_dominios.md`
4. leer `doc/estado_actual.md`
5. leer este protocolo
6. leer relevo del dominio afectado
7. leer log del dominio afectado
8. revisar incidencias abiertas relacionadas
9. revisar prompt activo en `doc/prompts/` si existe

## Secuencia obligatoria al cerrar
Al terminar una etapa:

1. validar proporcionalmente el cambio
2. registrar decisión y archivos tocados en el log del dominio
3. actualizar relevo del dominio si quedan pasos abiertos
4. actualizar incidencias si se detectó error, deuda, bloqueo o validación pendiente
5. actualizar `doc/estado_actual.md` si cambia la foto operativa real
6. dejar siguiente micro-paso claro

## Formato mínimo de relevo por dominio
Cada relevo debe incluir:

- estado actual
- hecho en la última etapa
- no hecho / pendiente
- riesgos o trampas conocidas
- archivos clave
- validaciones ejecutadas
- validaciones pendientes
- siguiente micro-paso recomendado

## Regla de continuidad
No usar un único histórico global como bitácora principal.
Los relevos vivos deben estar separados por dominio:

- `doc/logs/relevos/backend_modulos/`
- `doc/logs/relevos/frontend/`
- `doc/logs/relevos/compartidos/`

## Regla de seguridad específica de extensión
Si el relevo afecta permisos, IA, storage o extracción de contenido, debe indicar explícitamente:

- permisos implicados
- datos capturados
- datos enviados a IA
- datos persistidos
- claves o secretos afectados, sin mostrar valores
- validación manual o automática pendiente
