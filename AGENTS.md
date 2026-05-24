# AGENTS.md

## 📌 1. Objetivo del Producto
**Tags Lokky** es una extensión de navegador diseñada para asistir al usuario en la resolución de pruebas tipo test mediante Inteligencia Artificial.
* **Alcance:** Captura la pregunta/opciones, las analiza, llama a la IA, muestra la respuesta con la letra correcta.
* **Fricción de Control:** El sistema **nunca** automatiza el envío del test ni marca respuestas de forma autónoma. Requiere siempre acción y validación humana explícita.

---

## 🛠️ 2. Arquitectura Base (Anti-Monolitos)
Queda prohibido centralizar todo en un único script. El código se divide estrictamente por responsabilidades:

* **Content Scripts (Adaptadores):** Solo leen el DOM (preguntas/opciones) e inyectan la interfaz mínima. No procesan prompts ni guardan configuraciones.
* **Background (Service Worker):** Orquesta los mensajes entre la interfaz y el extractor, y gestiona las llamadas a las APIs de IA.
* **Módulo IA:** Aislado de la interfaz y del DOM. Formatea los prompts, maneja errores de la API y gestiona las conexiones.
* **Almacenamiento:** Uso exclusivo de `chrome.storage` o `browser.storage` para credenciales y configuraciones locales.

---

## 🛑 3. Restricciones de Desarrollo Obligatorias
* **Umbrales de refactorización:** Si un archivo supera las **300 líneas** o acumula más de 3 responsabilidades distintas, **debe dividirse** inmediatamente en helpers o servicios independientes.
* **Seguridad de Secretos:** Prohibido hardcodear API keys o tokens en el código fuente.
* **Código Limpio:** No se acepta pseudocódigo. Las entregas de código o documentación deben ser archivos completos y funcionales.
* **Principio de Mínimo Permiso:** No expandir los permisos del `manifest.json` a menos que sea estrictamente necesario para la lectura de un nuevo dominio de pruebas.

---

## 📊 4. Sistema de Eventos y Trazabilidad
Toda la extensión se comunica mediante un sistema centralizado de **Eventos Estructurados**. 
* Cualquier hito (detección de test, petición a la IA, respuesta recibida o error de conexión) genera un evento interno.
* Una capa central decide si ese evento se registra en logs, genera un aviso visual o se ignora, evitando alertas duplicadas o intrusivas.
* Se creara un log por cada prueba tipo test que se realice. 

---

## 📂 5. Flujo de Trabajo y Documentación Operativa
Antes de modificar cualquier módulo, el flujo de desarrollo sigue estos tres pasos:
1. **Identificar Dominio:** Localizar el área afectada en `doc/instrucciones/mapa_dominios.md`.
2. **Revisar Historial:** Leer el log y el último estado del dominio en `doc/logs/`.
3. **Entrega y Cierre:** Actualizar el estado del proyecto en `doc/estado_actual.md` tras validar la correcta compilación y carga manual de la extensión.
