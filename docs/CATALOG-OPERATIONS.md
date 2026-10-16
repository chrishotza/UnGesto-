# Curaduría y chequeos automáticos de fuentes

UnGesto contiene 24 causas en `catalog/causes.json`, con identificador, título, descripción, URL oficial, organización y texto de consentimiento versionado.

`node scripts/audit-catalog.mjs` genera dos archivos en `artifacts/` (NO versionados) y comprueba URLs por GET de forma controlada con límite temporal, sin cookies ni datos personales.

La acción **Catalog source health** se ejecuta cada día y en cambios de catálogo, adjuntando el informe a GitHub Actions. Los resultados posibles son:

- `reachable`: el servidor devolvió HTTP 200. No demuestra que el formulario esté abierto.
- `possibly_closed`: detectamos un mensaje textual de cierre, revisar manualmente.
- `missing`: HTTP 404/410.
- `blocked`: HTTP 403/429/503, no equivale a cierre.
- `redirect_review`: redirección hacia un destino ajeno o sospechoso.
- `needs_review`: otro código HTTP.
- `error`: conectividad o tiempo de espera.

**Nunca se envía una firma como parte de la auditoría.** No hay registro de información personal.

Para incorporar causas nuevas:

1. Verificar título, destinatario, origen, URL y estado actual en la fuente original.
2. Redactar una declaración propia, específica y en español (no copiar íntegramente una petición).
3. Versionar declaración y enlazar exactamente el mismo URL en frontend/backend.
4. Actualizar el catálogo y validar `node --test tests/*.test.mjs`.
5. Revisar diariamente los resultados de salud. No publicar cierres automáticos sin evaluación humana.

Importante: `catalog/causes.json` es una **copia de auditoría**. La interfaz desplegada en Floot mantiene actualmente datos inline. Hay trabajo pendiente para consolidar una sola fuente de verdad antes del próximo despliegue, evitando divergencias.
