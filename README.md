# UnGesto ✳

**Un solo gesto. Mucho por cambiar.**

UnGesto busca que una persona pueda leer causas reales, elegir las que quiere apoyar, identificarse una sola vez y registrar sus adhesiones con una acción, sin suscripciones comerciales ni donaciones obligatorias.

**Sitio principal:** https://ungesto-firmas-oficiales.onrender.com

## Qué hay disponible

| Función | Situación actual |
|---|---|
| Catálogo público | **2.210 peticiones** documentadas en la última importación; 34 curadas manualmente, de las que 20 son registrables mediante la base actual |
| Selección y búsqueda | Se pueden explorar las 2.210 fuentes y filtrar por tema, organización o palabra |
| Registro único | Se pueden elegir hasta **20 causas conectadas** y registrarlas con **un solo formulario y una sola solicitud** |
| Comprobante | La base persistente de Floot guarda las 20 adhesiones en una transacción y devuelve un comprobante revocable |
| Firma oficial externa | **No está resuelta como envío múltiple**. El registro de UnGesto NO es un acuse de Greenpeace, Amnistía ni otra plataforma |
| Biblioteca UK | **2.176 peticiones** abiertas importadas de la API oficial británica; solo pueden firmarlas ciudadanía/residentes UK en el portal del Parlamento |

El propósito del proyecto **no es coleccionar nombres ni inventar números de firmas**. La métrica que todavía falta conseguir es cada confirmación de recepción por parte de cada organización.

## Producto

La portada tiene una sola tarea: **elegir causas y registrar un apoyo a las conectadas**, sin conducir al firmante por veinte páginas diferentes. El formulario solicita nombre y correo una única vez, con país y comentario opcionales.

La biblioteca general ofrece descubrimiento de otras peticiones con fuentes y restricciones visibles. Sus enlaces no se anuncian como parte de una firma automática.

## Dónde está el código

- `public/index.html`, `public/firma-batch.css`, `public/firma-batch.js`: experiencia pública.
- `public/operable-causes.json`: manifiesto de 20 causas aceptadas por el backend productivo.
- `public/catalog.json` y `public/data/uk-petitions.json`: catálogo público extendido.
- `server.mjs`: API sin estado, valida consentimiento y proxy hacia el servicio persistente.
- `endpoints/endorsements_POST.ts`: transacción y comprobante en Floot.
- `docs/SINGLE-SIGNATURE-ARCHITECTURE.md`: contratos y límites.
- `docs/PROPOSAL.md`: manifiesto sobre interoperabilidad y privacidad.
- `tests/*.test.mjs`: pruebas offline de contratos y seguridad.

## Principios

- Las causas **no** se seleccionan automáticamente.
- Una autorización es específica para las causas elegidas.
- No se añaden personas a newsletters por registrar un apoyo en UnGesto.
- No se presenta un enlace abierto, un correo preparado o un registro propio como una firma recibida oficialmente por terceros.
- Los registros internos pueden revocarse con su comprobante.
- Las campañas del Reino Unido se muestran con su limitación territorial.

## Norte

**Una sola autorización → múltiples entregas individuales comprobadas por destinatarios externos.**

Seguiremos construyendo conexiones que puedan demostrar esa recepción. No llamaremos «entregado» a nada que todavía no lo esté.

Código abierto e independiente. Última actualización: octubre de 2026.

## Compartir causas sin compartir datos personales

Una persona que selecciona varias causas puede generar un enlace con **solo los IDs públicos** de esas campañas. Al abrirlo, otra persona ve cuáles se le sugieren y puede elegir explícitamente apoyarlas. **No se marcan casillas por defecto**, ni se incluyen nombre, email, mensaje o token de revocación en el enlace.

Esta función facilita que voluntarios compartan causas relevantes sin convertir UnGesto en una base de contactos ni falsificar firmas. El registro de las causas elegidas sigue dependiendo de una única autorización voluntaria del firmante y no acredita su entrega a las ONG.
