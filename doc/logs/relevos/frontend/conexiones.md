# Relevo: conexiones

## Estado actual
Dominio documental creado para la pantalla visible de Conexión/Conexiones.

Este dominio reemplaza el uso visible de `options`, `opciones` o `ajustes` cuando la pantalla solo gestiona conexiones con proveedores IA.

## Hecho en la última etapa
- Renombrado conceptual de `options/ajustes` a `conexiones`.
- Creado log nuevo en `doc/logs/frontend/conexiones.md`.
- Pendiente de retirar los archivos antiguos `options.md` tras actualizar referencias.
- Corregida la conexión del gateway de Hermes local en config.yaml, cambiando el proveedor/modelo de openai-codex/gpt-5.5 a openrouter/z-ai/glm-4.5-air:free y reiniciando el servicio de gateway para restablecer la API.

## No hecho / pendiente
- Falta pantalla real de Conexiones.
- Falta storage wrapper.
- Falta decisión de proveedor inicial.
- Falta eliminar o dejar obsoleto el relevo antiguo `doc/logs/relevos/frontend/options.md` si ya no se usa.

## Riesgos o trampas conocidas
- No llamar “Ajustes” a una pantalla que solo sirve para conectar proveedor IA.
- No mostrar claves completas en logs/UI secundaria.
- No guardar secretos en archivos versionados.
- No duplicar configuración entre popup y Conexiones.

## Archivos clave
- `AGENTS.md`
- `doc/instrucciones/mapa_dominios.md`
- `doc/instrucciones/uso_autorizado_y_privacidad.md`
- `doc/logs/frontend/conexiones.md`

## Validaciones ejecutadas
- Validación documental.

## Validaciones pendientes
- Validar guardado/lectura de conexión cuando exista código.

## Siguiente micro-paso recomendado
Crear pantalla `Conexiones` con campos de proveedor y credencial protegida, usando storage wrapper compartido.
