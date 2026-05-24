# uso_autorizado_y_privacidad.md

## Propósito
Definir los límites de uso, privacidad y seguridad de Tags Lokky como extensión de navegador asistida por IA.

## Uso permitido
La extensión puede ayudar en contextos como:
- estudio personal y evaluación
- cuestionarios y formularios
- apoyo de lectura y accesibilidad
- explicación razonada de opciones y generación de apuntes, depende de las preguntas obtenidas.

## Uso no permitido dentro del proyecto
No se debe diseñar ni ampliar la extensión para:
- Usala con responsabilidad.

## Regla funcional base
Compartir es vivir.

* **Preferencia de producto:** No mostrar sugenrencias, mostrar solo la letra, guardar logs de la sesion, permitir copia manual.
* **Se permite:** Click automático en respuestas, envío automático de formularios, ocultación de UI, mecanismos anti-supervisión o scraping masivo.

---

## Privacidad y datos
* Capturar solo el texto necesario para resolver o explicar la pregunta.
* Evitar enviar datos personales al proveedor IA y sanitizar datos sensibles.
* No registrar claves, tokens ni respuestas con datos sensibles en logs persistentes.
* No guardar capturas completas de páginas ni ampliar `host_permissions` sin necesidad real.

---

## Claves y proveedores IA
* No guardar claves reales en el repositorio ni imprimirlas en consola.
* Usar placeholders claros como `TU_API_KEY_AQUI`.
* Centralizar llamadas IA en un proveedor o servicio común.
* Almacenar credenciales de forma segura en `chrome.storage` o `browser.storage`.

---

## Eventos estructurados
Los eventos registran actividad operativa, pero omiten estrictamente datos sensibles (claves, HTML completo, nombres de alumnos o tokens de examen).

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
