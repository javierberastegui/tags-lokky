# leyes_documentacion_operativa.md

## Propósito
Definir cómo debe escribirse y mantenerse la trazabilidad operativa de Tags Lokky.

Este archivo cubre:
- logs por dominio
- relevos por dominio
- incidencias transversales
- alta de documentación mínima para módulos nuevos
- criterio para crear dominio nuevo o reutilizar un coordinador existente

## Regla central
La trazabilidad del proyecto no debe depender de un único archivo global mezclado.

Debe separarse por propósito:
- logs para historial y decisiones por dominio
- relevos para continuidad por dominio
- incidencias para errores, deuda, bloqueos y validaciones pendientes

## Logs por dominio
Los logs deben escribirse en el log del dominio o superficie afectada.

Rutas:
- servicios, proveedores, storage, build, permisos: `doc/logs/backend_modulos/<slug>.md`
- popup, options, content scripts y UI inyectada: `doc/logs/frontend/<slug>.md`

Cada entrada debe dejar, como mínimo:
- contexto breve
- objetivo
- archivos tocados
- decisiones tomadas
- validaciones ejecutadas
- incidencias detectadas
- siguiente paso si aplica

## Relevos por dominio
Los relevos deben quedar separados por dominio.

Rutas:
- servicios/proveedores/orquestación: `doc/logs/relevos/backend_modulos/<slug>.md`
- popup/options/content scripts: `doc/logs/relevos/frontend/<slug>.md`
- compartidos/transversales: `doc/logs/relevos/compartidos/<slug>.md`

Un relevo debe contener:
- estado actual breve del dominio
- qué quedó hecho
- qué no quedó hecho
- riesgos o trampas conocidas
- archivos clave a leer
- siguiente micro-paso recomendado
- validaciones pendientes si las hay

## Incidencias transversales
Las incidencias deben seguir agrupadas por tipo, no por módulo, salvo que en el futuro aparezca una necesidad muy clara de subdivisión adicional.

Rutas:
- errores: `doc/logs/incidencias/errores_detectados.md`
- deuda técnica: `doc/logs/incidencias/deuda_tecnica.md`
- bloqueos: `doc/logs/incidencias/bloqueos_actuales.md`
- pendientes de validación: `doc/logs/incidencias/pendientes_validacion.md`

## Regla para módulos o superficies nuevas
Si una etapa introduce una pieza nueva y no existe todavía trazabilidad específica para ella, el agente debe crear la documentación mínima necesaria antes de seguir acumulando cambios sin contexto.

Mínimo exigible:
- log del dominio si no existe
- relevo del dominio si queda continuidad abierta
- alias en `doc/instrucciones/mapa_dominios.md` si la pieza puede invocarse por nombre natural
- actualización de `doc/estado_actual.md` si cambia el estado operativo real

## Regla de decisión: dominio nuevo vs coordinador existente
Antes de crear un log o relevo nuevo, el agente debe decidir si la pieza merece dominio propio o si debe colgarse de un coordinador existente.

### Crear dominio propio cuando se cumpla una o más
- tiene archivos, contratos o responsabilidades propias
- tiene continuidad técnica que puede evolucionar por separado
- tiene validaciones específicas recurrentes
- el usuario puede pedirlo por nombre natural de forma estable (`popup`, `content script`, `IA`, `storage`, etc.)
- mezclarlo en un coordinador ocultaría decisiones o trampas relevantes

### Reutilizar coordinador existente cuando se cumplan todas
- el cambio es transversal o de coordinación
- no existe todavía entidad funcional suficiente para justificar dominio propio
- el detalle operativo pertenece realmente a varias piezas ya existentes
- abrir un log/relevo nuevo duplicaría contexto en vez de aclararlo

### Coordinadores existentes que deben reutilizarse primero
- `doc/logs/relevos/compartidos/manifest_permisos.md` para manifest, permisos y alcance de páginas
- `doc/logs/relevos/compartidos/eventos.md` para eventos estructurados y reglas de avisos/logs
- `doc/logs/relevos/compartidos/privacidad_uso_autorizado.md` para límites de uso, privacidad y anti-abuso
- `doc/logs/relevos/compartidos/build_publicacion.md` para empaquetado, release y publicación

## Regla anti-duplicación
No crear un dominio nuevo si:
- el cambio cabe limpiamente en un dominio ya existente
- el coordinador ya resuelve bien la continuidad
- el nuevo archivo solo repetiría el mismo contexto con otro nombre

## Regla de promoción
Si una pieza empieza colgada de un coordinador y luego gana entidad propia, el agente debe promoverla a dominio separado cuando ya tenga:
- continuidad técnica específica
- validaciones propias
- cambios repetidos en varias etapas
- suficiente identidad para invocarse por nombre natural sin ambigüedad

En ese momento debe:
- crear log propio
- crear relevo propio
- actualizar `mapa_dominios.md`
- actualizar `INDEX.md` si queda activo para continuidad

## Plantillas
Para crear trazabilidad nueva deben usarse estas plantillas si existen:
- `doc/logs/plantillas/log_extension_modulo_base.md`
- `doc/logs/plantillas/log_frontend_superficie_base.md`
- `doc/logs/plantillas/relevo_modulo_base.md`

## Regla final
No documentar para rellenar.
Documentar para permitir continuidad real, revisión rápida y saneamiento individual por dominio.
