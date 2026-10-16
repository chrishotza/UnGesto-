# UnGesto 🌍

**Una persona, una identificación, múltiples causas. Sin donaciones, anuncios ni newsletters.**

[Ver la aplicación publicada](https://ungesto-solidario.floot.app)

## Qué queremos construir

Una persona lee declaraciones relacionadas con causas verificables, selecciona cuáles desea apoyar, introduce su nombre, correo y mensaje una sola vez, y autoriza sus adhesiones en una única acción.

## Estado real (16 de octubre de 2026)

- ✅ Catálogo inicial de 10 causas con enlaces a organizaciones reconocidas.
- ✅ Lectura de una declaración original y rastreable por cada causa.
- ✅ Selección múltiple, formulario único y consentimiento informado.
- ✅ Registro de cada adhesión en la base de datos de **UnGesto**, con versión del texto respaldado, fecha, fuente y mensaje.
- ✅ Comprobante individual por envío, revocación y eliminación desde el dispositivo que lo creó.
- ✅ No solicitamos donaciones, no enviamos marketing y no registramos visitas en analytics.
- ⚠️ **Las adhesiones NO se envían todavía a las ONG**. Las APIs y acuerdos para hacerlo están pendientes.
- ⚠️ Los registros de identidad en UnGesto **no están verificados por correo**; no son firmas oficialmente reconocidas ni equivalen a firmar en un tercero.

**No mostramos una firma externa como completada sin respuesta confirmada de una integración autorizada.**

## Cómo funciona hoy

1. Explorar y leer la declaración por causa.
2. Marcar todas las causas elegidas.
3. Completar nombre, email, país opcional y comentario opcional **una sola vez**.
4. Confirmar explícitamente el respaldo de todas las declaraciones seleccionadas y el tratamiento de datos.
5. Recibir un comprobante por lote, con adhesiones individuales.
6. Revocar los registros desde el mismo dispositivo cuando se desee.

Los datos de nombre, correo y mensaje se almacenan en la base de datos de UnGesto para el registro solicitado. No se transfieren a organizaciones externas ni se usan para listas comerciales. El navegador conserva un token secreto para solicitar la revocación; **no compartas ese token**.

## Arquitectura actual

- Web: React + TypeScript (proyecto alojado y servido por Floot).
- Persistencia: PostgreSQL administrado; acceso interno con Kysely.
- API propia: `POST /_api/endorsements`, `POST /_api/revoke-endorsements`.
- Los textos asociados al consentimiento son versionados e incluyen URLs de origen.
- Sin OAuth de terceros, sin campañas masivas de email, sin automatización de navegadores contra sistemas de terceros.

## Integraciones externas: requisitos

Para entregar firmas oficialmente a una causa se necesita:

1. Permiso, convenio o API autorizada con la organización.
2. Petición real, vigente y con identificador oficial.
3. Especificar campos requeridos, consentimiento, posibles confirmaciones y criterios antiabuso.
4. **No añadir al firmante a listas de email** salvo consentimiento separado y opcional.
5. Guardar un acuse real del destino: `accepted`, `pending_confirmation`, `rejected` o `not_supported`.
6. Nunca eludir verificaciones, CAPTCHA ni medidas antifraude.

**Action Network:** tiene API de firmas pero su flujo de firma puede suscribir automáticamente a la persona a listas; no se usa sin una solución contractual/técnica que respete esta política.

## Contribuciones

Apreciamos colaboraciones para integraciones autorizadas, acceso a peticiones, revisión de privacidad, accesibilidad y seguridad. No publiques datos de firmantes ni claves API en issues o PR.

Este repositorio documenta el desarrollo y conserva una copia de los archivos específicos de la aplicación alojada en Floot. No debe considerarse una distribución independiente lista para producción sin las dependencias y servicios de Floot.

## Licencia

**Pendiente de elección por la persona titular del proyecto.** Que el repositorio sea público no significa automáticamente que el código tenga una licencia open source.
