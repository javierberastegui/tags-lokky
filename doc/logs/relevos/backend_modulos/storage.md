# Relevo: storage

## Estado actual
Dominio documental creado para almacenamiento local/configuración.

## Hecho en la última etapa
- Registrado dominio en `doc/instrucciones/mapa_dominios.md`.
- Definido que claves y preferencias deben pasar por wrapper seguro.

## No hecho / pendiente
- Falta log específico de storage si se empieza a implementar.
- Falta wrapper técnico para `chrome.storage` / `browser.storage`.
- Falta política concreta de cifrado/ocultación si se guardan claves.

## Riesgos o trampas conocidas
- No guardar secretos en repo.
- No imprimir secretos en consola.
- No duplicar configuración entre módulos.

## Archivos clave
- `AGENTS.md`
- `doc/instrucciones/uso_autorizado_y_privacidad.md`
- `doc/instrucciones/mapa_dominios.md`

## Validaciones ejecutadas
- Validación documental.

## Validaciones pendientes
- Validar lectura/escritura cuando exista código.

## Siguiente micro-paso recomendado
Crear `src/storage/` o ruta equivalente con API mínima `getConfig`, `saveConfig`, `getSafeConfigSummary`.
