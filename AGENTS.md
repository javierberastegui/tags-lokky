# AGENTS.md

# 🏷️ Tags Lokky

## Propósito del proyecto
Tags Lokky es una extensión de navegador orientada a ayudar al usuario a trabajar con cuestionarios mediante IA en contextos permitidos: estudio, autoevaluación, práctica, repaso, accesibilidad o formularios propios/autorizados.

El sistema debe evolucionar con una lógica práctica, modular y mantenible, priorizando:
- extensión ligera y segura
- permisos mínimos del navegador
- trazabilidad técnica por dominio
- privacidad de datos y claves
- explicación razonada de respuestas
- control humano antes de cualquier acción sensible
- separación clara entre captura, análisis, proveedor IA, UI y almacenamiento

## Límite de uso obligatorio
Este repositorio no debe orientarse a hacer trampas en exámenes, pruebas oficiales, evaluaciones académicas no autorizadas ni sistemas de terceros donde el uso de IA esté prohibido.

Regla de producto:
- la extensión puede asistir, explicar, resumir, comparar opciones y preparar una respuesta sugerida
- la extensión no debe autoenviar respuestas ni completar cuestionarios sensibles sin acción explícita del usuario
- si una funcionalidad puede usarse en contexto dudoso, debe diseñarse con fricción responsable, explicación y control manual
- no se deben añadir mecanismos para ocultar el uso de IA, evadir supervisión, saltar restricciones de plataformas o automatizar fraude

## Arquitectura base obligatoria
Este proyecto debe mantenerse sobre una base de extensión de navegador.

Base esperada:
- Manifest V3 como referencia principal salvo decisión documentada
- content scripts para leer/interactuar con la página activa dentro de permisos declarados
- background service worker para coordinación, eventos y tareas transversales
- popup/options para configuración visible del usuario
- módulo de proveedores IA separado del DOM y de la UI
- almacenamiento mediante APIs del navegador (`chrome.storage` / `browser.storage`) o capa wrapper equivalente
- eventos estructurados internos antes de logs o notificaciones
- sin secretos reales hardcodeados en el repositorio

Si en el futuro aparece backend propio, proxy, API o panel externo, debe documentarse como dominio separado y no mezclarse con la extensión base.

## Restricciones obligatorias
El agente debe respetar siempre estas reglas:

- no empezar desde cero si ya existe estructura válida
- no cambiar la arquitectura base de extensión sin instrucción expresa
- no cambiar rutas base existentes sin necesidad real
- no simplificar artificialmente el proyecto
- no cambiar nomenclatura base ya asentada sin motivo fuerte
- no mezclar dominios que deban seguir separados
- no entregar pseudocódigo
- no dar teoría cuando se han pedido cambios aplicables
- entregar siempre archivos completos cuando se proporcionen cambios de código o documentación
- mantener archivos pequeños y conectados entre sí siempre que sea razonable
- no introducir claves API, tokens ni secretos reales en archivos versionados
- no ampliar permisos del navegador sin justificarlo y documentarlo
- no añadir automatismos de envío o evasión en cuestionarios
- si una mejora requiere tests, deben añadirse o ajustarse
- si una mejora afecta documentación viva, debe actualizarse
- no dar por cerrada una etapa de extensión sin validación razonable de build/carga/manual

## Guardarraíles obligatorios de modularidad y anti-monolitos
El agente debe evitar que content scripts, background, popup, options, hooks o módulos auxiliares se conviertan en archivos-monstruo.

Preferencia estructural obligatoria:
- se prefieren muchos archivos pequeños, coherentes y bien nombrados
- se prefiere separar responsabilidades por capas
- se deben reutilizar carpetas y dominios ya existentes del repo antes de crear estructuras paralelas

No se permite:
- concentrar en un único archivo lectura del DOM, estado, proveedor IA, render, almacenamiento y transformaciones
- mover o envolver código sin reducir realmente el tamaño o la complejidad del archivo principal
- “simplificar” creando archivos nuevos pero dejando casi toda la responsabilidad en el archivo original
- reemplazar un content script gigante por un helper gigante equivalente

### Umbrales prácticos obligatorios
El agente debe proponer división real si se cumple una o más de estas condiciones:
- archivo por encima de 300-400 líneas y sigue creciendo
- archivo por encima de 600 líneas: división obligatoria
- más de 3 responsabilidades claras en el mismo archivo
- más de 5 estados importantes en una misma unidad
- DOM parsing + llamadas IA + render + storage en el mismo archivo
- necesidad de scroll excesivo para entender el flujo principal

Estos umbrales no deben usarse para apurar el límite.
La división debe hacerse antes de que el archivo se vuelva difícil de mantener.

### Regla especial para content scripts
Los content scripts deben actuar como adaptadores de página.

Un content script debe preferentemente:
- detectar contexto mínimo
- extraer preguntas/opciones de forma controlada
- inyectar UI mínima si aplica
- comunicarse con background o servicios compartidos
- evitar lógica pesada de IA, prompts y almacenamiento persistente

Un content script no debe acumular:
- lógica de negocio grande
- prompts complejos
- proveedores IA
- configuración global
- almacenamiento sensible
- automatismos de envío

### Regla especial para background/service worker
El background debe actuar como coordinador, no como cajón desastre.

Debe poder coordinar:
- mensajes entre UI/content scripts
- eventos estructurados
- llamadas a proveedores IA mediante servicios separados
- reglas centrales de permisos, privacidad y errores

No debe mezclar sin separación:
- parsing DOM específico de una web
- render UI
- prompts de producto dispersos
- claves o tokens hardcodeados

### Regla especial para proveedores IA
Los proveedores IA deben estar aislados.

Deben tener:
- interfaz clara de entrada/salida
- manejo de errores
- redacción/sanitización de contexto si aplica
- control de claves mediante configuración segura
- trazabilidad de eventos sin exponer secretos

No se permite:
- llamar a proveedores IA desde cualquier punto del código sin capa común
- duplicar lógica de prompts por pantalla o content script
- registrar respuestas completas si contienen datos sensibles sin criterio explícito

### Orden obligatorio de extracción
Cuando un archivo crece, el agente debe dividir en este orden si aplica:
1. constantes y configuración inicial
2. helpers puros
3. extractores/parsers de DOM
4. servicios de mensajería
5. proveedores IA
6. almacenamiento/configuración
7. componentes visuales de popup/options/inyección
8. acciones/mutaciones
9. render complejo en subcomponentes separados

## Separación obligatoria de dominios
Debe mantenerse esta separación de dominio salvo orden explícita en contra:

- manifest/permisos
- content scripts y extracción de cuestionarios
- background/orquestación
- popup/options UI
- proveedores IA y prompts
- almacenamiento/configuración
- eventos estructurados/logs internos
- privacidad/seguridad
- build/empaquetado/publicación
- documentación operativa

No se deben mezclar responsabilidades de estos dominios sin justificación explícita.

## Capa estratégica obligatoria de eventos, logs y sistema vivo
Este proyecto debe evolucionar con una capa central de eventos internos, pensada para trazabilidad operativa real.

Principios obligatorios:
- los módulos relevantes deben poder emitir eventos estructurados
- las notificaciones, logs o avisos deben decidirse en una capa central de reglas
- no introducir avisos sueltos acoplados módulo a módulo
- primero debe emitirse un evento interno estructurado y después decidir si se registra, resume, muestra o ignora
- los eventos no deben incluir secretos ni datos sensibles sin redacción explícita

Casos de uso que esta capa debe poder cubrir progresivamente:
- extensión instalada/cargada
- popup abierto
- options actualizadas sin exponer secretos
- cuestionario detectado
- pregunta extraída
- solicitud IA creada
- respuesta IA recibida
- error de proveedor IA
- permiso insuficiente
- storage corrupto o configuración incompleta
- build/empaquetado validado

Guardarraíles obligatorios:
- no duplicar la misma notificación en UI, content script y background a la vez
- no acoplar Telegram, consola, popup o logs de forma desordenada en cada módulo
- no convertir los eventos en spam
- distinguir entre debug, evento informativo, aviso y alerta real
- diseñar payloads estables y revisables

## Instrucciones normativas del proyecto
Además de este archivo, el agente debe obedecer obligatoriamente los documentos de `doc/instrucciones/`.

Jerarquía operativa:
1. `AGENTS.md`
2. `doc/instrucciones/README.md`
3. instrucciones específicas aplicables al cambio
4. `doc/estado_actual.md`
5. `doc/protocolo_relevo.md`
6. relevo del dominio afectado
7. logs del dominio afectado
8. incidencias abiertas relacionadas
9. prompt activo si existe en `doc/prompts/`

Si dos documentos parecen entrar en conflicto:
- prevalece `AGENTS.md`
- después prevalece la instrucción más específica y más cercana al dominio afectado
- si sigue habiendo conflicto, debe elegirse la opción más conservadora y dejarlo documentado

## Resolución obligatoria de dominio antes de continuar
Si la instrucción del usuario hace referencia a un módulo, superficie o área por nombre natural, el agente debe:

1. resolver el dominio usando `doc/instrucciones/mapa_dominios.md`
2. leer el relevo del dominio afectado
3. leer el log del dominio afectado si existe
4. revisar incidencias relacionadas
5. continuar desde el último estado conocido sin reiniciar el trabajo

Si el dominio no existe todavía:
- debe decidir primero si merece dominio propio o si debe reutilizar un coordinador existente según `doc/instrucciones/leyes_documentacion_operativa.md`
- debe crear la estructura documental mínima necesaria solo si realmente no existe trazabilidad suficiente
- debe crear el log del nuevo dominio si no existe
- debe crear el relevo del nuevo dominio si queda trabajo abierto
- debe dejar la trazabilidad mínima en `doc/estado_actual.md` si cambia el estado operativo real del proyecto

## Lectura obligatoria antes de tocar nada
Antes de empezar cualquier etapa, el agente debe leer:

1. `AGENTS.md`
2. `doc/instrucciones/README.md`
3. las instrucciones específicas aplicables al cambio
4. `doc/estado_actual.md`
5. `doc/protocolo_relevo.md`
6. el relevo del dominio afectado
7. los logs del dominio afectado si existen
8. incidencias abiertas relacionadas
9. el prompt activo si existe en `doc/prompts/`

## Forma de trabajo obligatoria
Para cada etapa o solicitud:

1. entender el estado real actual antes de modificar nada
2. identificar el dominio afectado
3. revisar instrucciones aplicables
4. tocar solo lo necesario, sin rehacer lo ya válido
5. aplicar micro-refactor local con el criterio de `doc/instrucciones/micro-refactor.md`
6. mantener consistencia con arquitectura, naming y rutas
7. aplicar cambios completos
8. validar con pruebas razonables según impacto
9. documentar resultado y decisiones
10. actualizar el relevo del dominio si quedan pasos abiertos
11. dejar siguiente paso claro si la etapa no cierra todo

## Corrección oportunista controlada
Si durante una etapa el agente detecta un defecto real relacionado con el área que está tocando, debe hacer una de estas tres cosas:

- corregirlo en la misma etapa si es seguro, coherente y entra razonablemente en alcance
- registrarlo como incidencia en `doc/logs/incidencias/errores_detectados.md`
- dejarlo reflejado en el relevo del dominio correspondiente si condiciona la continuación

Nunca debe ignorarlo silenciosamente.

## Privacidad, permisos y secretos
Cuando un cambio afecte datos, permisos, proveedores IA o almacenamiento:

- aplicar principio de mínimos permisos
- documentar cualquier nuevo permiso en manifest
- no guardar claves en código fuente
- no imprimir secretos en consola, logs o eventos
- no mandar al proveedor IA más contexto del necesario
- sanitizar o resumir datos sensibles cuando sea viable
- dejar claro si una función funciona localmente, con API externa o con backend propio

## Validación obligatoria
Toda etapa debe terminar con validación proporcional al impacto:

- build si existe empaquetador (`npm run build`, `pnpm build`, etc.)
- lint/test si existe configuración
- validación manual de carga de extensión si no hay prueba automatizada razonable
- revisión de `manifest.json` si se tocan permisos, content scripts o background
- prueba de popup/options si se toca UI
- prueba de mensajería si se toca content/background
- si algo no se pudo validar, debe quedar dicho con claridad

## Actualización obligatoria de estado vivo
`doc/estado_actual.md` debe reflejar siempre la foto operativa real del proyecto.

Debe actualizarse obligatoriamente cuando una etapa introduzca o cambie cualquiera de estos elementos:
- módulos activos
- superficies de extensión
- proveedores IA
- integraciones
- permisos
- restricciones vivas
- dirección funcional relevante del producto
- capacidades ya consolidadas del sistema

## Alta obligatoria de trazabilidad documental
Si una etapa introduce un módulo nuevo, una superficie nueva o un dominio nuevo y no existe todavía trazabilidad documental específica para esa pieza, el agente debe crearla obligatoriamente.

Reglas:
- antes de crear un dominio nuevo, decidir si la pieza debe tener log/relevo propio o si debe reutilizar un coordinador existente
- para proveedores IA, coordinación o servicios sin UI: usar `doc/logs/backend_modulos/<slug>.md` salvo que exista carpeta específica futura
- para popup, options, content scripts o superficies visuales: usar `doc/logs/frontend/<slug>.md`
- para piezas compartidas o transversales: usar `doc/logs/relevos/compartidos/<slug>.md`
- si queda continuación abierta, crear o actualizar el relevo correspondiente
- si el dominio puede invocarse por nombre natural, actualizar `doc/instrucciones/mapa_dominios.md`
- si el nuevo dominio queda activo para continuidad, añadirlo también a `doc/logs/relevos/INDEX.md`

## Plantillas base de logs y relevos
Para crear trazabilidad nueva, el agente debe reutilizar estas plantillas base si existen:

- módulo de extensión/servicio: `doc/logs/plantillas/log_extension_modulo_base.md`
- superficie UI: `doc/logs/plantillas/log_frontend_superficie_base.md`
- relevos: `doc/logs/plantillas/relevo_modulo_base.md`

Si no existen, debe seguir la estructura estándar ya usada en los documentos existentes del proyecto.

## Relevos por dominio obligatorios
El proyecto no debe depender de un único archivo de relevo global como bitácora principal.

Reglas:
- servicios/proveedores/orquestación → `doc/logs/relevos/backend_modulos/<slug>.md`
- popup/options/content scripts → `doc/logs/relevos/frontend/<slug>.md`
- piezas compartidas o transversales → `doc/logs/relevos/compartidos/<slug>.md`
- `doc/logs/relevos/INDEX.md` actúa como índice, no como relevo operativo principal

## Documentación obligatoria al cerrar etapa
Al cerrar una etapa, el agente debe actualizar lo que aplique:

- `doc/estado_actual.md` si cambia el estado vivo del proyecto
- log del dominio correspondiente
- relevo del dominio correspondiente si quedan pasos abiertos o trampas conocidas
- `doc/logs/incidencias/errores_detectados.md` si detecta defectos relevantes
- `doc/logs/incidencias/deuda_tecnica.md` si detecta deuda no urgente
- `doc/logs/incidencias/bloqueos_actuales.md` si existe bloqueo real
- `doc/logs/incidencias/pendientes_validacion.md` si algo queda sin comprobar
- `doc/protocolo_*` solo si se detecta una mejora estructural real del propio sistema documental

## Formato de entrega esperado
Cuando entregue cambios, debe indicar con claridad:

- archivos nuevos
- archivos modificados
- instrucciones aplicadas
- micro-refactor aplicado si procede
- permisos de navegador añadidos o revisados si aplica
- proveedores IA afectados si aplica
- tests nuevos o modificados si aplica
- validaciones ejecutadas
- decisiones tomadas
- pendientes reales
- relevo actualizado
- siguiente paso recomendado

## Guardarraíles obligatorios antes de push/publicación
Antes de proponer push, release o publicación de extensión, el agente debe confirmar que la rama local está alineada con remoto o indicar claramente que hace falta rebase o merge.

Secuencia mínima:
- comprobar estado git
- comprobar build/lint/test si existen
- comprobar carga manual de extensión si aplica
- revisar permisos del manifest si se tocaron
- no dar por “listo para publicar” un cambio que no ha pasado validación local razonable

## Change Log del agente
### Entrada
- Motivo: alta inicial de reglas operativas de Tags Lokky a partir del modelo documental del repo de fisioterapia, adaptado a extensión de navegador.
- Impacto: obliga a trabajar por dominios, mantener logs/relevos separados, emitir eventos estructurados y proteger privacidad, permisos y uso autorizado.
- Reversión: simplificar esta sección solo si el repositorio incorpora un sistema documental superior que preserve la misma trazabilidad.

## Regla final
La prioridad no es hacer cambios rápidos.
La prioridad es hacer cambios coherentes, trazables, mantenibles y acumulables sin romper el proyecto ni convertir la extensión en una herramienta de abuso.
