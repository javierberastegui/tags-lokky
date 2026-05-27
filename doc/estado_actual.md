# estado_actual.md

## Foto operativa actual
Tags Lokky queda iniciado como proyecto de extensión de navegador asistida por IA para apoyar el trabajo con cuestionarios en contextos permitidos.

Estado actual:
- repositorio documental base creado
- arquitectura objetivo: extensión de navegador basada en Manifest V3
- dominios operativos definidos en `doc/instrucciones/mapa_dominios.md`
- reglas de uso autorizado y privacidad definidas
- logs/relevos por dominio como sistema principal de continuidad
- pantalla visible de conexiones nombrada como `Conexión` o `Conexiones`, no como `Ajustes`
- botón inyectado "Estudiar con Gemini" en Canvas modificado a estilo transparente y discreto
- corregido el error de conexión del gateway Hermes reconfigurando su proveedor a OpenRouter y modelo activo a z-ai/glm-4.5-air:free


## Dirección funcional
La extensión debe ayudar a:
- detectar preguntas y opciones en una página activa
- enviar contexto mínimo a una capa IA configurada
- recibir sugerencia razonada
- mantener control manual del usuario

## Arquitectura objetivo inicial
Superficies previstas:
- `manifest.json` para permisos y declaración MV3
- content script para extracción/inyección controlada
- background service worker para coordinación
- popup para interacción rápida
- Conexiones para proveedor IA, credenciales y endpoints
- servicios IA aislados
- storage/config wrapper
- eventos estructurados internos

## Restricciones vivas
- leer siempre `AGENTS.md` antes de tocar el proyecto
- no empezar desde cero si ya existe estructura válida
- no ampliar permisos sin justificación
- no guardar secretos reales en repo
- no acoplar notificaciones o logs sueltos por módulo
- emitir eventos estructurados cuando aplique
- documentar por dominio al cerrar cada etapa
- no llamar `Ajustes` a la pantalla si solo contiene conexiones

## Pendiente inmediato recomendado
Crear la base técnica mínima de extensión:
1. `manifest.json`
2. estructura `src/` separada por dominios
3. popup mínimo
4. pantalla Conexiones mínima
5. content script de detección no invasiva
6. background service worker
7. capa de eventos estructurados
8. capa storage/config sin secretos
9. proveedor IA mock o placeholder seguro
10. validación de carga manual en navegador
