# Relevo: atajos

## Estado actual
Dominio creado para la pestaña Atajos y el primer atajo: Modo escucha.

## Hecho en la última etapa
- Añadida pestaña `Atajos` al sidepanel.
- Añadido `Modo escucha` como tarjeta configurable.
- Añadido `F8` como tecla por defecto.
- Añadido campo de tecla programable.
- Añadido `sidepanel/shortcuts.js` separado para no engordar `sidepanel.js`.
- Añadido `sidepanel/shortcuts.css` separado para estilos del dominio.
- Añadido comando nativo `toggle-listen-mode` en `manifest.json`.
- Añadido envío automático de selección desde `content/content.js` cuando el Modo escucha está activo.
- Añadida coordinación en `background.js` para abrir sidepanel y enviar el texto seleccionado.

## No hecho / pendiente
- Falta validación manual real en Chrome.
- Falta comprobar si F8 entra en conflicto con el navegador, sistema operativo o página activa.
- Falta valorar si el icono de la pestaña Atajos debe ajustarse visualmente.

## Riesgos o trampas conocidas
- `content_scripts.matches` usa `<all_urls>` para que el Modo escucha funcione en cualquier página. Esto es funcional, pero debe mantenerse vigilado por privacidad.
- El texto seleccionado se envía automáticamente solo si el Modo escucha está activo.
- Algunas páginas internas de Chrome o webs protegidas no permiten content scripts.
- Si Chrome no toma F8 como comando nativo, usar `chrome://extensions/shortcuts` o la tecla programable interna.

## Archivos clave
- `manifest.json`
- `background.js`
- `content/content.js`
- `sidepanel/sidepanel.html`
- `sidepanel/shortcuts.js`
- `sidepanel/shortcuts.css`
- `doc/logs/frontend/atajos.md`

## Validaciones ejecutadas
- Revisión documental.
- Revisión de rutas relativas del sidepanel: `shortcuts.js` y `shortcuts.css` se cargan desde la carpeta `sidepanel/`.

## Validaciones pendientes
- Recargar extensión en `chrome://extensions`.
- Abrir sidepanel y comprobar que aparece la pestaña Atajos.
- Activar Modo escucha desde la pestaña.
- Subrayar texto en una página permitida y confirmar que llega automáticamente al panel.
- Pulsar F8 y confirmar que alterna activo/inactivo.
- Cambiar tecla programable y confirmar que la nueva tecla funciona.

## Siguiente micro-paso recomendado
Validar manualmente en Chrome y, si funciona, añadir un pequeño feedback visual persistente en el badge del sidepanel indicando si Modo escucha está activo.
