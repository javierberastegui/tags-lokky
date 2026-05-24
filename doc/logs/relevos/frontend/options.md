# Relevo: options

## Estado actual
Dominio documental creado para configuración de proveedor IA, preferencias y claves.

## Hecho en la última etapa
- Definido que options debe gestionar configuración sin secretos en repo.
- Creado log inicial en `doc/logs/frontend/options.md`.
- Registrado dominio en `doc/instrucciones/mapa_dominios.md`.

## No hecho / pendiente
- Falta pantalla options real.
- Falta storage wrapper.
- Falta decisión de proveedor inicial.

## Riesgos o trampas conocidas
- No mostrar claves completas en logs/UI secundaria.
- No guardar secretos en archivos versionados.
- No duplicar configuración entre popup y options.

## Archivos clave
- `AGENTS.md`
- `doc/instrucciones/uso_autorizado_y_privacidad.md`
- `doc/logs/frontend/options.md`

## Validaciones ejecutadas
- Validación documental.

## Validaciones pendientes
- Validar guardado/lectura de configuración cuando exista código.

## Siguiente micro-paso recomendado
Crear options mínimo con campos de proveedor y clave placeholder, usando storage wrapper compartido.
