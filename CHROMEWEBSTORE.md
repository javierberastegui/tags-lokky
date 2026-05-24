# Chrome Web Store Listing — Canvas Study Partner

> Last Updated: 2026-05-24

## Store Listing

**Extension Name**  
Canvas Study Partner

**Short Description**  
Asistente inteligente para estudiar y resolver cuestionarios de Canvas utilizando la APIs, agentes o modelos locales.

**Detailed Description**  
Canvas Study Partner es tu compañero de estudio definitivo para cuestionarios y exámenes de Canvas. Diseñado para optimizar tu aprendizaje en pruebas no evaluatorias, esta extensión te permite enviar preguntas directamente a la inteligencia artificial de Gemini para obtener respuestas recomendadas y explicaciones educativas estructuradas paso a paso.

Características principales:
- Integración en la interfaz de Canvas: Añade un botón elegante "Estudiar con Gemini" directamente en cada pregunta.
- Panel Lateral Glassmorphic: Visualiza las explicaciones detalladas, conceptos teóricos clave y el nivel de confianza de la IA sin perder de vista tu examen.
- Selección Libre de Texto: Selecciona cualquier texto, haz clic derecho y envíalo para analizarlo en segundos.
- Auto-selección inteligente: Marca la respuesta correcta en Canvas con un solo clic desde el panel lateral.
- Historial de estudio local: Repasa tus preguntas analizadas en cualquier momento desde una pestaña dedicada.

Cómo usarla:
1. Instala la extensión y haz clic en su icono para abrir el Panel Lateral.
2. Ve a la pestaña "Ajustes" e ingresa tu API Key gratuita de Gemini (obtenida de Google AI Studio).
3. Abre un cuestionario en Canvas. Verás aparecer un botón flotante "Estudiar con Gemini" en cada pregunta.
4. Haz clic en él para ver el análisis instantáneo.

Nota de Privacidad:
Tu API Key y todo el historial de cuestionarios se guardan localmente en tu navegador. Tus datos no se comparten con ningún servidor intermedio, la comunicación se realiza directamente entre tu extensión y la API oficial de Google Gemini.

**Category**  
Productivity

**Single Purpose**  
Ayuda a los estudiantes a analizar y estudiar preguntas de cuestionarios de Canvas mediante explicaciones de IA.

**Primary Language**  
Spanish

## Graphics & Assets

| Asset | Dimensions | Status | Filename |
|-------|-----------|--------|----------|
| Store Icon | 128×128 PNG | ⬜ Omitido (Default) | |
| Screenshot 1 | 1280×800 or 640×400 | ⬜ Pendiente | |
| Screenshot 2 | 1280×800 or 640×400 | ⬜ Pendiente | |

### Screenshot Notes
- Captura 1: Muestra el botón "Estudiar con Gemini" integrado en una pregunta de un cuestionario de Canvas.
- Captura 2: Muestra el panel lateral interactivo con una respuesta, la explicación paso a paso y los conceptos clave generados por Gemini.

## Permissions Justification

| Permission | Type | Justification |
|------------|------|---------------|
| `storage` | permissions | Permite guardar de manera segura en el navegador local la clave de API de Gemini, el modelo preferido y el historial de estudio. |
| `sidePanel` | permissions | Permite abrir el panel lateral dedicado donde se muestra el análisis interactivo de las preguntas sin interrumpir el flujo del examen en la pestaña activa. |
| `scripting` | permissions | Necesario para ejecutar la función de selección automática en la pestaña del cuestionario cuando el usuario hace clic en "Seleccionar en Canvas". |
| `contextMenus` | permissions | Registra la opción en el menú contextual "Analizar con Gemini" cuando el usuario selecciona un texto en cualquier página web. |
| `tabs` | permissions | Permite detectar la pestaña activa para enviar mensajes y comandos de selección de opciones desde el panel lateral al script de contenido. |
| `https://*.instructure.com/*` | host_permissions | Permite inyectar el script de contenido que dibuja los botones de ayuda de Gemini en los cuestionarios de Canvas hospedados en el dominio oficial de Instructure. |
| `https://*.edu/*` | host_permissions | Permite inyectar el script de contenido en cuestionarios de Canvas que utilicen dominios universitarios e instituciones educativas finalizadas en .edu. |
| `https://generativelanguage.googleapis.com/*` | host_permissions | Permite que el panel lateral de la extensión realice llamadas HTTPS directas a la API oficial de Google Gemini para procesar las preguntas. |

## Privacy & Data Use

### Data Collection

**Does the extension collect user data?** No  
(Toda la información se procesa localmente en el dispositivo del usuario y se transmite directamente a la API de Gemini a través de la API Key proporcionada por el usuario. No existe un servidor central secundario).

### Data Use Certification
- [x] Data is NOT sold to third parties
- [x] Data is NOT used for purposes unrelated to the extension's core functionality
- [x] Data is NOT used for creditworthiness or lending purposes

## Privacy Policy

**Privacy Policy URL**  
https://github.com/javierberastegui/tags-lokky/blob/main/PRIVACY.md

## Distribution

**Visibility**: Unlisted  
**Regions**: All regions  
**Pricing**: Free

## Developer Info

**Publisher Name**  
Javier Berastegui

**Contact Email**  
javier@example.com

## Version History

| Version | Date | Changes | Status |
|---------|------|---------|--------|
| 1.0.0 | 2026-05-24 | Versión inicial de la extensión con integración de Gemini. | Draft |

## Review Notes

### Known Issues / Limitations
- Solo funciona de forma automática en Classic Quizzes de Canvas. Para New Quizzes (que corren dentro de iframe LTI cerrados) se recomienda utilizar la selección de texto + clic derecho para analizar.
