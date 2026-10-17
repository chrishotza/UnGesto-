# UnGesto 🌍

**Una firma. Muchas causas.**

UnGesto es una plataforma solidaria gratuita que permite **leer títulos y descripciones, tildar las causas elegidas, completar los datos una sola vez y registrar adhesiones individuales en una única operación**.

**Aplicación web:** https://ungesto-solidario.floot.app

## Estado real — octubre de 2026

✅ Catálogo de 24 causas con sus fuentes y declaraciones legibles  
✅ Selección individual o múltiple, con botón para marcar todas las visibles  
✅ Un único formulario de identificación y un mensaje general opcional  
✅ Consentimiento explícito que cubre todas las causas elegidas  
✅ API de registro transaccional, hasta 20 causas por solicitud  
✅ Comprobante único, registro separado por causa, revocación y borrado de datos por comprobante  
✅ API probada con solicitudes reales de prueba, posteriormente revocadas  
✅ Sin donaciones, publicidad, boletines ni estadísticas de visitantes  

**⚠️ Todavía no enviamos firmas a las plataformas externas.** Las adhesiones permanecen en UnGesto: aunque veas causas de Greenpeace, Rainforest Rescue o Amnistía, **eso no constituye una firma oficial en sus sitios**. Falta conseguir integraciones autorizadas que preserven la opción de no recibir correos. No se simulan envíos ni se declaran como entregadas firmas no aceptadas por terceros.

## Flujo

1. Leer el título y la descripción de cada causa (con declaración extensa disponible).
2. Seleccionar una o muchas casillas.
3. Pulsar **Firmar N causas**.
4. Introducir nombre y correo una sola vez (país y mensaje general son opcionales).
5. Dar el consentimiento una sola vez para las declaraciones escogidas.
6. Recibir un comprobante local con clave privada para revocar las adhesiones.

## Cómo está construido

Proyecto desarrollado en Floot: frontend React/TypeScript, API serverless, PostgreSQL y Kysely.

Este repositorio contiene los **archivos propios** de la aplicación desplegada, como fuente pública/auditable, pero **no es un paquete independiente instalable**: la ejecución utiliza componentes y servicios preinstalados de Floot que no se incluyen aquí.

- `pages/_index.tsx`: catálogo, filtros y selección de causas.
- `components/BatchSignature.tsx`: un solo formulario, lectura y consentimiento.
- `helpers/petitionStatements.tsx`: texto y origen de cada declaración.
- `endpoints/endorsements_POST.ts`: registro y comprobante.
- `endpoints/revoke-endorsements_POST.ts`: revocación y eliminación.
- `helpers/schema.tsx`: definiciones SQL generadas (sin credenciales).

Más información: [Arquitectura](docs/ARCHITECTURE.md), [Integraciones](docs/INTEGRATIONS.md) y [Privacidad](docs/PRIVACY.md).

## Objetivo de desarrollo

UnGesto pretende que el usuario pueda firmar legalmente y de forma válida en muchas plataformas mediante un único consentimiento, **cuando existan acuerdos y APIs oficiales que lo permitan**, con resultados verificables por cada destino. Los envíos deben ser solo a campañas expresamente elegidas, sin newsletters por defecto, sin eludir CAPTCHA ni verificaciones requeridas.


## Dos entornos actuales

| Entorno | URL | Qué funciona |
|---|---|---|
| Aplicación principal (Floot) | https://ungesto-solidario.floot.app | Registro interno por lote con consentimiento y comprobante; 20 causas desplegadas |
| Piloto de firmas receptoras (Render) | https://ungesto-firmas-oficiales.onrender.com | 24 causas buscables, selección múltiple, datos reutilizables solo en memoria y apertura de formularios originales de terceros |

**Importante:** el piloto de Render ya está desplegado y ha pasado una prueba funcional con navegador real. La firma se dirige al formulario del destinatario y requiere que la persona complete las verificaciones pertinentes. Todavía **no existe entrega automática de una única firma a 24 receptores**. Ningún contador interno de UnGesto se presenta como prueba de entrega externa.

Cuatro widgets oficiales de openPetition han sido creados para el dominio de Floot, de los cuales uno tiene confirmado el correo administrador. No se reutilizan como embebidos en Render porque fueron generados para otro dominio.

Proveedores evaluados: openPetition (widget de formulario y confirmación), Action Network (mecanismos de firma con posible inclusión en listas), Petitions.nz (documenta embeds, método por campaña en investigación). Solicitudes de integración enviadas a las organizaciones.

## Participar

Bienvenidas colaboraciones de desarrolladores, organizaciones y defensores de privacidad. No envíes información personal ni tokens secretos a issues.

**Licencia de reutilización pendiente de definir por el titular.** Que un repositorio sea público no implica por sí mismo permisos de reutilización de su código.

## Calidad y mantenimiento del catálogo

La selección de 24 causas tiene ahora un [inventario JSON con textos de consentimiento](catalog/causes.json) y una [auditoría automática diaria de URLs](docs/CATALOG-OPERATIONS.md). GitHub Actions publica el resultado como artefacto y nunca utiliza datos de firmantes. La respuesta HTTP 200 solo acredita que se pudo consultar la página; **no** confirma vigencia de la campaña ni la aceptación de firmas.
