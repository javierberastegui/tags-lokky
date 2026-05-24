# Log de módulo de extensión: ai_provider

## Propósito
Registrar decisiones sobre proveedores IA, prompts, errores, privacidad y contratos de entrada/salida.

## Entradas

### 2026-05-24 — Alta documental inicial
- Contexto: Tags Lokky se inicia como extensión de navegador asistida por IA para cuestionarios autorizados.
- Objetivo: dejar trazabilidad inicial del dominio IA.
- Archivos tocados: `AGENTS.md`, `doc/instrucciones/*`, `doc/estado_actual.md`.
- Decisiones tomadas: la IA debe sugerir y explicar; no autoenviar ni facilitar evasión o fraude.
- Eventos estructurados revisados/emitidos: previsto `ai_request_created`, `ai_response_received`, `ai_provider_error`.
- Permisos/datos/claves afectados: no se guardan secretos reales; las claves deberán vivir en configuración segura.
- Validaciones ejecutadas: documental.
- Incidencias detectadas: falta base técnica de proveedor IA.
- Siguiente paso: crear interfaz común de proveedor IA con mock seguro antes de conectar APIs reales.
