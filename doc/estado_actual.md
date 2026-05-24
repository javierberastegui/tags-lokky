# estado_actual.md

## Foto operativa actual
Tags Lokky queda iniciado como proyecto de extensión de navegador asistida por IA para apoyar el trabajo con cuestionarios en contextos permitidos.

Estado actual:
- repositorio documental base creado
- arquitectura objetivo: extensión de navegador basada en Manifest V3
- dominios operativos definidos en `doc/instrucciones/mapa_dominios.md`
- reglas de uso autorizado y privacidad definidas
- logs/relevos por dominio como sistema principal de continuidad

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
- options para configuración de proveedor IA y preferencias
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

## Pendiente inmediato recomendado
Crear la base técnica mínima de extensión:
1. `manifest.json`
2. estructura `src/` separada por dominios
3. popup/options mínimos
4. content script de detección no invasiva
5. background service worker
6. capa de eventos estructurados
7. capa storage/config sin secretos
8. proveedor IA mock o placeholder seguro
9. validación de carga manual en navegador
