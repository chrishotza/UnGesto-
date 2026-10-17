# Contrato UnGesto: UNA firma, muchas causas

## Regla de producto

- No hay formularios externos secuenciales en la portada.
- El usuario elige de 1 a 20 causas y rellena el nombre/email/mensaje una sola vez.
- `public/index.html` + `public/firma-batch.js` hacen **exactamente un POST** a `/api/firmar`.
- `server.mjs` comprueba todo el lote y lo retransmite a la API ya existente de Floot que, dentro de una única transacción PostgreSQL, crea un recibo y las adhesiones individuales.
- Se rechaza cualquier petición con causas no incluidas o sin consentimiento.
- Cada adhesión devuelve `recorded_in_ungesto` y `externalStatus:not_sent`, sin atribuir recepción a ONG.
- El comprobante queda guardado solo en el dispositivo del usuario (ID y token), para solicitar la revocación. El servidor proxy es **sin estado**, no almacena los datos personales.
- Ningún boletín ni donación se activa.

## Sistemas publicados

| Sistema | Dirección | Función |
|---|---|---|
| Inicio y formulario único | `https://ungesto-firmas-oficiales.onrender.com` | Registro por lote, 1 sola firma |
| API proxy gratuita | `https://ungesto-firma-batch.onrender.com` | Valida y reenvía 1 lote a Floot |
| Registro durable (Floot) | `https://ungesto-solidario.floot.app` | Base de adhesiones, recibos y revocación |
| Biblioteca | `/biblioteca.html#biblioteca` | Índice público de 2.210 fuentes, independiente de firmas |
| Manifiesto | `/manifiesto.html` | Propuesta para interoperabilidad |

## Lo pendiente para entregar firmas a terceros

La API actual solo registra adhesiones en UnGesto. Nunca se consideran firmas oficiales de organizaciones externas hasta disponer de **acuse individual del destinatario**. No se debe suplir esa prueba con un mailto, un enlace abierto o un contador agregado.

## Calidad

`node --test tests/*.test.mjs` verifica selección, consentimiento, recibos reales simulados (sin datos reales), protección de origen y el límite de 20 causas; GitHub Actions ejecuta los contratos. La prueba real de usuario requiere la acción voluntaria de una persona con su identidad propia.

La colección de otras plataformas y las peticiones británicas está archivada en la biblioteca secundaria, no es un requisito ni una distracción del flujo de firma única.
