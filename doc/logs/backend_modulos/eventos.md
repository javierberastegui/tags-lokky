# Log de módulo de extensión: eventos

## Propósito
Registrar decisiones sobre eventos estructurados, reglas centrales de logs/notificaciones y trazabilidad operativa.

## Entradas

### 2026-05-24 — Alta documental inicial
- Contexto: el proyecto hereda la filosofía de eventos estructurados y documentación por dominio.
- Objetivo: evitar avisos sueltos acoplados módulo a módulo.
- Archivos tocados: `AGENTS.md`, `doc/instrucciones/*`.
- Decisiones tomadas: primero evento estructurado; después regla central decide si se registra, muestra o notifica.
- Eventos estructurados revisados/emitidos: catálogo inicial previsto en `AGENTS.md`.
- Permisos/datos/claves afectados: los eventos no deben incluir secretos ni datos sensibles sin redacción.
- Validaciones ejecutadas: documental.
- Incidencias detectadas: falta implementación técnica de event bus interno.
- Siguiente paso: crear módulo central de eventos antes de dispersar logs en content/background/popup.
