# Relevo: manifest_permisos

## Estado actual
Dominio documental creado para `manifest.json`, permisos, host permissions y declaración MV3.

## Hecho en la última etapa
- Definido que Tags Lokky debe usar permisos mínimos.
- Registrado dominio en `doc/instrucciones/mapa_dominios.md`.
- Creado log inicial en `doc/logs/backend_modulos/manifest_permisos.md`.

## No hecho / pendiente
- Falta crear `manifest.json` real.
- Falta decidir navegador objetivo inicial: Chrome/Chromium primero salvo cambio explícito.
- Falta validación manual de carga de extensión.

## Riesgos o trampas conocidas
- No ampliar `host_permissions` de forma global sin necesidad.
- No pedir permisos de lectura de todas las páginas si no hace falta.
- No mezclar permisos con lógica de negocio.

## Archivos clave
- `AGENTS.md`
- `doc/instrucciones/mapa_dominios.md`
- `doc/logs/backend_modulos/manifest_permisos.md`

## Validaciones ejecutadas
- Validación documental.

## Validaciones pendientes
- Validar manifest con carga manual en navegador cuando exista.
- Revisar permisos antes de cualquier release.

## Siguiente micro-paso recomendado
Crear `manifest.json` MV3 mínimo con popup, options, background y content script solo si se implementan en la misma etapa.
