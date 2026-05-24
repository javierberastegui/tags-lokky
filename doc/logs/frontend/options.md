# Log de superficie frontend: options

## Propósito
Registrar decisiones sobre configuración visible: proveedor IA, preferencias, claves y almacenamiento local.

## Entradas

### 2026-05-24 — Alta documental inicial
- Contexto: la extensión necesitará una pantalla de configuración para proveedor IA y preferencias.
- Objetivo: dejar reglas iniciales sobre claves y opciones.
- Archivos tocados: `AGENTS.md`, `doc/instrucciones/uso_autorizado_y_privacidad.md`.
- Decisiones tomadas: no guardar claves reales en repo; no mostrar claves completas en logs o eventos.
- Eventos estructurados revisados/emitidos: previsto `options_opened`, `options_saved`, `provider_config_missing`.
- Datos visibles/capturados: configuración local del usuario, con secretos protegidos.
- Validaciones ejecutadas: documental.
- Incidencias detectadas: falta implementación técnica.
- Siguiente paso: crear options mínimo con placeholders y storage wrapper.
