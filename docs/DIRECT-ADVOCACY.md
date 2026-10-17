# Envío de cartas de apoyo directamente a organismos públicos

**Estado:** UnGesto puede preparar un email personalizado para canales oficiales verificados, pero la persona debe confirmar **Enviar** en su propio programa de correo. Abrir un borrador no es enviar el mensaje. No se considera firma de petición externa ni se incrementa ningún contador.

Causas implementadas:

- Protección ambiental y centros de datos en Pensilvania: Pennsylvania DCED GRID, `RA-DCEDGRID@pa.gov`, documento oficial: https://dced.pa.gov/business-assistance/data-center-resources/planning-toolkit/
- Reciclaje de baterías en Massachusetts: MassDEP Waste Bans, `john.fischer@mass.gov`, documento oficial: https://www.mass.gov/guides/massdep-waste-disposal-bans

`public/direct-advocacy.json` sólo permite contactos oficiales publicados y revisados. No hay captura de información personal, credenciales de envío ni servidores de correo. El usuario decide la causa, su declaración, sus datos y si realmente envía la carta.

Para escalar:
1. Verificar que cada destinatario acepta comentarios relevantes sobre la causa.
2. Registrar fuente de contacto y vigencia del email.
3. Mantener una correspondencia estricta de campaña a destinatario: nunca enviar a un receptor temas ajenos.
4. Con permisos adecuados y un proveedor de correo transaccional, se podría registrar aceptación SMTP en una API de envíos; **SMTP aceptado no equivale a firmado en una plataforma de peticiones**.
5. Aplicar controles antiabuso y límites por usuario antes de activar envío automatizado.
