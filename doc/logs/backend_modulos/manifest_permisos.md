# Log de módulo de extensión: manifest_permisos

## Propósito
Registrar decisiones sobre `manifest.json`, permisos, host permissions, content scripts y superficie de acceso de la extensión.

## Entradas

### 2026-05-24 — Alta documental inicial
- Contexto: Tags Lokky se plantea como extensión de navegador Manifest V3.
- Objetivo: dejar regla base para permisos mínimos y revisión obligatoria.
- Archivos tocados: `AGENTS.md`, `doc/instrucciones/mapa_dominios.md`, `doc/estado_actual.md`.
- Decisiones tomadas: no ampliar permisos sin justificación; revisar permisos al cerrar cada etapa que toque manifest/content scripts.
- Eventos estructurados revisados/emitidos: previsto `permission_missing`, `extension_loaded`, `manifest_validated`.
- Permisos/datos/claves afectados: ninguno todavía.
- Validaciones ejecutadas: documental.
- Incidencias detectadas: falta `manifest.json` real.
- Siguiente paso: crear `manifest.json` MV3 con permisos mínimos.
