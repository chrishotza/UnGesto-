# Arquitectura de UnGesto (v0.2)

Flujo de un único envío:

```text
Catálogo con títulos, descripción y fuentes
       │
       ├── seleccionar N causas y leer declaraciones
       ▼
Formulario único: nombre + correo + país opcional + mensaje opcional
       │
       ├── consentimiento explícito al lote y tratamiento de datos
       ▼
POST /_api/endorsements
       │
       ├── Zod valida datos, campañas y autorización
       ├── límite por correo y hora
       ├── token de revocación aleatorio (256 bits)
       └── transacción PostgreSQL
               ├── signature_batches (identidad y mensaje general)
               └── cause_endorsements (texto íntegro, origen, versión)
       │
       ▼
Comprobante + estado por causa:
  recorded_in_ungesto / externalStatus = not_sent
       │
       ▼
POST /_api/revoke-endorsements (token secreto)
       └── borrado en cascada
```

No hay API de entrega externa activa, cola de transmisión, conexión con instituciones ni verificación de identidad. No se añade a la persona a listas comerciales ni se envían correos. No debe computarse una adhesión interna como firma confirmada de una petición externa.

## Reglas para agentes y colaboradores

1. Leer `README.md`, este documento y `docs/INTEGRATIONS.md` antes de cambiar el flujo.
2. Mantener UNA sola entrada de identidad por lote y registro separado por causa.
3. La declaración versionada y la identidad quedan asociadas en una única transacción.
4. La selección es granular: no preseleccionar causas que el usuario no solicitó.
5. Una firma externa requiere respuesta verificable de un partner autorizado; no inferir aceptación por HTTP 200 de nuestra propia API.
6. Jamás almacenar credenciales privadas en GitHub o frontend; usar secretos de servidor.
7. Cambios en consentimiento requieren nueva versión de política y adaptación de formularios y tests.
8. Las migraciones de esquema van por SQL y el helper `helpers/schema.tsx` se regenera.
9. Floot provee componentes UI, build, infraestructura y base de datos: esta fuente no garantiza ejecución fuera de ese entorno.
