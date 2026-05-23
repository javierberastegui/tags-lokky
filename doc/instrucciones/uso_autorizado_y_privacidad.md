# uso_autorizado_y_privacidad.md

## Propósito
Definir los límites de uso, privacidad y seguridad de Tags Lokky como extensión de navegador asistida por IA.

## Uso permitido
La extensión puede ayudar en contextos como:
- estudio personal
- autoevaluación
- cuestionarios propios
- cuestionarios de práctica
- formularios internos autorizados
- accesibilidad o apoyo de lectura
- explicación de por qué una opción puede ser correcta o incorrecta
- generación de apuntes a partir de preguntas permitidas

## Uso no permitido dentro del proyecto
No se debe diseñar ni ampliar la extensión para:
- hacer trampas en exámenes o evaluaciones no autorizadas
- saltarse normas de plataformas educativas
- ocultar el uso de IA ante supervisión
- evadir detecciones, bloqueos o restricciones de terceros
- autoenviar respuestas en pruebas sensibles
- robar, interceptar o exfiltrar datos de páginas
- recopilar información privada innecesaria

## Regla funcional base
La extensión debe ayudar a razonar, no sustituir el control humano.

Preferencia de producto:
- mostrar sugerencia y explicación
- permitir copiar manualmente si procede
- pedir confirmación explícita para acciones sensibles
- mantener trazabilidad local sin exponer secretos

No se debe implementar por defecto:
- click automático en respuestas
- envío automático de formularios
- ocultación de UI
- mecanismos anti-supervisión
- scraping masivo fuera del contexto activo autorizado

## Privacidad y datos
Principios obligatorios:
- capturar solo el texto necesario para resolver o explicar la pregunta
- evitar enviar datos personales al proveedor IA si no son necesarios
- sanitizar datos sensibles cuando sea razonable
- no registrar claves, tokens ni respuestas con datos sensibles en logs persistentes
- no guardar capturas completas de páginas salvo justificación explícita
- no ampliar `host_permissions` sin necesidad real

## Claves y proveedores IA
Reglas obligatorias:
- no guardar claves reales en el repo
- no imprimir claves en consola
- no incluir claves en ejemplos reales
- usar placeholders claros como `TU_API_KEY_AQUI`
- documentar si la clave vive en `chrome.storage`, `browser.storage`, variable de entorno, backend o configuración externa
- centralizar llamadas IA en un proveedor o servicio común

## Eventos estructurados
Los eventos pueden registrar actividad operativa, pero deben evitar datos sensibles.

Ejemplo de payload seguro:
```json
{
  "type": "ai_request_created",
  "domain": "ai_provider",
  "severity": "info",
  "source": "popup",
  "questionLength": 180,
  "optionsCount": 4,
  "provider": "configured_provider"
}
```

Ejemplo de payload no aceptable:
```json
{
  "apiKey": "valor-real",
  "fullPageHtml": "...",
  "studentName": "...",
  "examToken": "..."
}
```

## Revisión antes de cerrar cambios
Si una etapa toca extracción, IA, permisos, storage o eventos, el agente debe declarar explícitamente:
- qué datos se capturan
- dónde se guardan
- a qué proveedor se envían
- qué permisos se usan
- qué validación se ejecutó
- qué riesgo residual queda si aplica
