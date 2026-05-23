# micro-refactor.md

## Propósito
Este documento define la política obligatoria de micro-refactor local de Tags Lokky.

Su función no es autorizar refactors amplios.
Su función es obligar a que cada cambio deje mejor el área tocada sin romper arquitectura, rutas, contratos, permisos ni nomenclatura asentada.

## Relación con AGENTS.md
`AGENTS.md` es la norma marco.
`doc/instrucciones/micro-refactor.md` concreta cómo debe aplicarse la mejora interna continua dentro del alcance real de cada etapa.

## Regla central
Toda tarea debe cumplir dos cosas a la vez:
1. implementar el objetivo pedido
2. mejorar localmente la calidad interna de los archivos realmente tocados

No basta con que “funcione”.
Debe quedar mejor construido que antes dentro de un alcance razonable.

## Qué se considera micro-refactor válido
Se considera micro-refactor válido, dentro del alcance real del cambio:

- extraer helpers puros pequeños
- dividir bloques largos en funciones privadas o utilidades locales
- separar extractores/parsers DOM repetidos
- separar prompts y proveedores IA de UI/content scripts
- eliminar duplicación evidente
- ordenar imports y dependencias locales
- mejorar nombres internos ambiguos sin romper contratos públicos
- mover lógica repetida a servicios, helpers o utilidades ya coherentes con la arquitectura existente
- reforzar manejo de errores y eventos estructurados
- revisar permisos o payloads cuando el área tocada lo requiera
- simplificar condicionales excesivas si mejora legibilidad real
- reducir tamaño de archivos que se estén degradando claramente
- añadir o ajustar tests del área tocada
- corregir pequeños defectos colindantes si son seguros y razonablemente del mismo alcance

## Qué NO se considera micro-refactor válido
No se considera micro-refactor válido:

- rehacer la extensión entera no pedido
- abrir un refactor transversal del proyecto
- cambiar arquitectura
- cambiar rutas base porque sí
- renombrar entidades base ya consolidadas
- mover carpetas masivamente
- sustituir tecnologías sin decisión documentada
- simplificar el proyecto recortando capacidades existentes
- aprovechar una tarea pequeña para imponer una reorganización global
- tocar dominios no relacionados con la etapa
- ampliar permisos del navegador sin necesidad real
- introducir automatismos de envío o evasión bajo excusa de mejora técnica

## Regla de alcance
El micro-refactor debe ser siempre:
- local
- pequeño
- reversible
- trazable
- coherente con el cambio pedido
- seguro respecto al comportamiento existente

Si una mejora detectada excede ese alcance, no debe meterse de forma encubierta en la tarea actual.

## Regla específica sobre eventos estructurados
Cuando el área tocada genere actividad relevante del sistema, el micro-refactor debe revisar si:
- el módulo emite eventos estructurados
- el payload es coherente con otros módulos
- la notificación no está acoplada de forma caótica al módulo
- la lógica de avisado puede seguir centralizada
- no se registran secretos ni datos sensibles sin redacción explícita

No se deben introducir avisos sueltos módulo a módulo si existe una capa común o intención formal de consolidarla.

## Regla específica sobre archivos grandes
Si el archivo tocado ya está degradado y la etapa entra en él, no se debe seguir ampliando sin criterio.

En ese caso, debe aplicarse al menos una mejora real:
- extraer helpers
- extraer extractores DOM
- extraer servicios de IA
- extraer almacenamiento/configuración
- extraer componentes UI
- reducir responsabilidades mezcladas
- separar render y lógica
- acotar side effects

No cuenta como mejora:
- mover pocas líneas sin bajar complejidad real
- crear un archivo nuevo dejando casi toda la responsabilidad igual
- envolver sin desacoplar

## Qué hacer si aparece una mejora mayor
Si el agente detecta una mejora importante que no cabe limpiamente en la etapa actual, debe hacer una de estas cosas:
- dejarla registrada en `doc/logs/incidencias/errores_detectados.md`
- dejarla registrada en `doc/logs/incidencias/deuda_tecnica.md`
- dejarla preparada en el relevo del dominio correspondiente
- dejarla anotada en el log del dominio correspondiente como continuación recomendada

Nunca debe ignorarla en silencio.
Nunca debe ejecutarla sin control bajo la etiqueta de micro-refactor.

## Criterio de cierre
Una etapa no se considera bien cerrada solo porque compila o parece funcionar.

Debe cerrar con estas condiciones:
- funcionalidad pedida implementada
- micro-refactor local aplicado si toca código existente
- comportamiento previo relevante preservado
- permisos y privacidad revisados si aplica
- validación proporcional ejecutada
- documentación y relevo actualizados si aplica
