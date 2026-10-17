# Integraciones verificadas y vías de firma real — octubre de 2026

Este documento documenta canales que efectivamente expusieron sus capacidades, no compromisos comerciales.

## 1. openPetition: API pública verificable + widget oficial de firma

Se comprobó que estas peticiones tienen un endpoint público GET que devuelve datos JSON de firmas:

- https://www.openpetition.org/petition/online/stop-sexual-harasment-at-allen-jayanagar-and-jain-college-campuses/votes
- https://www.openpetition.org/petition/online/protect-the-commonwealth-of-pa-and-residents-from-the-harms-of-unregulated-data-centers/votes

Los resultados vistos durante la investigación fueron 25 y 97 firmas, respectivamente. Son datos puntuales del momento y **no** deben grabarse como contadores constantes.

openPetition publica una página oficial para generar widgets por campaña:

`https://www.openpetition.org/widget/anmelden/<slug>`

La publicación oficial explica que el **widget embebido** permite firmar desde otra web (sin salir al sitio principal), con confirmación del correo y sin necesidad de integrar un API de escritura privada. El widget no garantiza una firma completada sin la confirmación; la fuente del estado de aceptación sigue siendo openPetition.

No se debe asumir que el iframe de demostración `/widget/demo/<slug>` es un formulario completo: en pruebas muestra un banner de «Sign now», no un comprobante de firma. Se debe obtener el código de widget de firma verdadero en la página de generación oficial para cada campaña.

Implementación que ya está en el repositorio:

- `integrations/openpetition.mjs`: valida hosts/URLs y consulta contadores con GET.
- `integrations/delivery-protocol.mjs`: rechaza mensajes de «entregado» sin comprobante oficial.
- `tests/integrations.test.mjs`: tests unitarios del contrato y de la API simulada.

**Estado real:** el código está versionado y probado con muestras locales; todavía no está desplegado dentro de la app Floot, ni se ha generado el widget de firma definitivo para una campaña concreta. Una fuente de recuentos no constituye integración de firma.

Documentación: https://www.openpetition.de/ratgeber/2-verbreiten

## 2. Action Network: helper técnicamente accesible, no apto para nuestra política por defecto

Documentos oficiales:
- https://actionnetwork.org/docs/v2/record_signature_helper
- https://actionnetwork.org/docs/v2/signatures

Existe un endpoint de `record_signature_helper` que puede aceptar POST sin API key cuando el recurso concreto lo permite; pero la documentación indica expresamente que crear a una persona nueva mediante este mecanismo **la suscribe a una lista de email**. No se activa ese envío en UnGesto salvo que exista un flujo que preserve una elección separada y libre del usuario respecto a comunicaciones, con los permisos aplicables.

## 3. Resto de plataformas

Las demás fuentes presentes en el catálogo son **referencias a peticiones**, no integraciones de firma automática. No se inventan acuses de recibo.

## Próxima integración externa real

El primer piloto debe mostrar el formulario oficial embebido de una petición activa de openPetition, cargar el título completo y todas las condiciones del proveedor, y confirmar la firma solo tras la verificación del proveedor. Para una sola autorización distribuida a varias campañas requerimos APIs o acuerdos que admitan explícitamente ese modelo.

Nunca replicar formularios protegidos ni enviar datos falsos, eludir captchas, crear cuentas o sumar correos comerciales por defecto.

## Web piloto operativa — Render

`https://ungesto-firmas-oficiales.onrender.com` está activa y permite escoger cualquiera de las 24 causas, revisar sus textos, reutilizar nombre, correo y comentario sin guardarlos y abrir el formulario del receptor. La web no usa widgets generados para otro dominio, ni llama a endpoints de firmas sin autorización. El sitio ha sido probado mediante navegación en navegador real.

**No está probado** un envío masivo automático entre plataformas. La firma solo se recibe oficialmente cuando el destinatario la acepta y el usuario completa su verificación.

## Petitions.nz

La documentación del proveedor menciona widgets de formulario para firmas sin creación de cuenta y consents separados (https://www.petitions.nz/features/embed-on-your-website). Sin embargo, una petición inspeccionada no mostró opción Embed en su panel público de compartición. Se solicitó al equipo el procedimiento real para generar el widget y las condiciones de un API de recepción. No se ha desplegado un formulario embebido de Petitions.nz.
