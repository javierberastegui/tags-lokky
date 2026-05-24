# Log de superficie frontend: conexiones

## Propósito
Registrar decisiones sobre la pantalla de Conexión/Conexiones: proveedor IA, credenciales, endpoints y almacenamiento local asociado.

## Entradas

### 2026-05-24 — Corrección visible en sidepanel
- Contexto: aunque la documentación ya usaba `conexiones`, la UI real de la extensión seguía mostrando la pestaña como `Ajustes`.
- Objetivo: corregir el texto visible del sidepanel para que coincida con la decisión funcional del proyecto.
- Archivos tocados: `sidepanel/sidepanel.html`, `doc/logs/frontend/conexiones.md`.
- Decisiones tomadas: la pestaña visible pasa a `Conexiones`; el título interno pasa a `Conexiones`; el botón pasa a `Guardar Conexión`; el toast pasa a `Conexión guardada con éxito`.
- Eventos estructurados revisados/emitidos: no aplica, cambio visual de texto.
- Datos visibles/capturados: sin cambios.
- Validaciones ejecutadas: revisión documental y cambio directo en HTML.
- Incidencias detectadas: queda pendiente recargar la extensión en `chrome://extensions` para ver el cambio en navegador.
- Siguiente paso: pulsar `Actualizar` en `chrome://extensions` o quitar/cargar de nuevo la extensión descomprimida.

### 2026-05-24 — Renombrado de options/ajustes a conexiones
- Contexto: el usuario aclara que la pantalla no debe llamarse “ajustes” porque solo contiene conexiones.
- Objetivo: dejar el dominio funcional con el nombre correcto: `conexiones`.
- Archivos tocados: `doc/instrucciones/mapa_dominios.md`, `doc/instrucciones/README.md`, `doc/estado_actual.md`, `doc/logs/relevos/INDEX.md`, `doc/logs/frontend/conexiones.md`, `doc/logs/relevos/frontend/conexiones.md`.
- Decisiones tomadas: usar “Conexión” o “Conexiones” como nombre visible; mantener `options` solo como alias técnico cuando se hable de la página interna de extensión.
- Eventos estructurados revisados/emitidos: previsto `connections_opened`, `connections_saved`, `provider_connection_missing`.
- Datos visibles/capturados: proveedor IA, endpoint si aplica y credenciales protegidas.
- Validaciones ejecutadas: validación documental.
- Incidencias detectadas: ninguna.
- Siguiente paso: cuando exista UI real, nombrar el botón/pantalla como `Conexión` o `Conexiones`, no como `Ajustes`.
