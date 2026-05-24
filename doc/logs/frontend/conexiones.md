# Log de superficie frontend: conexiones

## Propósito
Registrar decisiones sobre la pantalla de Conexión/Conexiones: proveedor IA, credenciales, endpoints y almacenamiento local asociado.

## Entradas

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
