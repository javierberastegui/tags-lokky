# README instrucciones

## Propósito
Esta carpeta contiene las normas operativas estables de Tags Lokky.

No sustituye a `AGENTS.md`.
Lo desarrolla y lo hace más ejecutable para trabajo por dominios dentro de una extensión de navegador.

## Jerarquía
1. `AGENTS.md`
2. este archivo
3. instrucciones específicas aplicables al cambio
4. `doc/estado_actual.md`
5. `doc/protocolo_relevo.md`
6. relevo del dominio afectado
7. logs del dominio afectado
8. incidencias abiertas relacionadas
9. prompt activo si existe

## Lectura mínima obligatoria
Según el tipo de cambio, el agente debe leer además de `AGENTS.md`:

- `doc/instrucciones/mapa_dominios.md`
- `doc/instrucciones/micro-refactor.md`
- `doc/instrucciones/leyes_documentacion_operativa.md`
- `doc/instrucciones/uso_autorizado_y_privacidad.md`

## Regla de aplicación
No se debe tocar código ni documentación viva ignorando estas instrucciones cuando apliquen al cambio solicitado.

## Qué resuelve esta carpeta
Esta carpeta existe para que el agente pueda:
- resolver dominios usando lenguaje natural
- aplicar micro-refactor local sin cambiar arquitectura
- crear trazabilidad nueva si aparecen módulos o superficies nuevas
- escribir logs, incidencias y relevos sin mezclarlo todo en un único archivo
- proteger permisos, privacidad, claves y uso autorizado
- continuar tareas con órdenes como “sigue con popup”, “sigue con content script”, “sigue con IA” o “sigue con permisos”

## Ejemplos de uso diario
Órdenes naturales esperadas:
- `Sigue con manifest`
- `Sigue con permisos`
- `Sigue con content script`
- `Sigue con popup`
- `Sigue con options`
- `Sigue con IA`
- `Sigue con eventos`
- `Sigue con storage`
- `Sigue con build`

Secuencia esperada del agente:
1. resolver alias en `doc/instrucciones/mapa_dominios.md`
2. abrir relevo del dominio correcto
3. abrir log del dominio correcto
4. revisar incidencias relacionadas
5. continuar desde el siguiente micro-paso ya documentado

## Regla de crecimiento
Si una norma operativa importante empieza a crecer demasiado dentro de un archivo existente, debe extraerse a un nuevo `.md` dentro de esta carpeta con nombre claro y estable.
