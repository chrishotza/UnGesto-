# Privacidad de UnGesto — estado actual

**UnGesto no exige crear cuenta**, pero sí nombre y correo para registrar adhesiones. País y mensaje general son opcionales.

Qué almacenamos:
- En servidor: nombre, correo, país si se proporciona, mensaje si se proporciona, fecha y versión de consentimiento, declaraciones de apoyo y fuente de cada causa, y hash del token de revocación.
- En navegador: comprobante y token aleatorio de revocación; las elecciones visuales también viven en la sesión.
- No se envían correos ni se crean listas publicitarias desde la app; estadísticas de visitas desactivadas.

Qué no hacemos:
- Ninguna transmisión de firmas a sitios de terceros está activa todavía.
- No hay verificación de titularidad del correo, por lo que las adhesiones no son evidencia de identidad verificada.
- No vendemos información; no cobramos, y no se pide tarjeta.

Borrado: las adhesiones pueden revocarse usando el token secreto guardado en el navegador. La revocación borra los registros del lote y los registros por causa en cascada. Si se borra el almacenamiento local sin revocar, se puede perder la clave de eliminación. El token se muestra para permitir guardarlo por separado.

**Pendiente para versión de gran público**: verificación antiabuso, límites independientes de email, política formal de retención y gestión de solicitudes de eliminación cuando se perdió la clave, revisión legal en jurisdicciones aplicables, verificación del estado de peticiones e integraciones externas compatibles con privacidad.
