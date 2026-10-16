# Integración de destinos de firma

**Estado: ningún proveedor externo integrado todavía.**

Requisitos mínimos para llegar a "una firma en muchos sitios":

- Acuerdo o API autorizada para cada organización/campaña y permisos reales para enviar firmas.
- Campaña activa, identificador inequívoco y texto legal que la persona pueda leer antes de autorizar.
- Campos obligatorios y requisitos de identidad/confirmación conocidos antes de mostrar la opción de firma.
- Consentimiento separado para transmitir datos personales a cada destinatario; ninguna firma en causas no seleccionadas.
- Prohibición de incorporar al usuario a newsletters por defecto. Si el proveedor no soporta esta condición, no puede habilitarse automáticamente.
- Respuesta por destino: `accepted`, `pending_confirmation`, `rejected`, `unsupported` o `failed`, con identificador del receptor cuando exista.
- Idempotencia, reintentos limitados, rate limits, auditoría, control antifraude, revocación donde sea posible.
- Nunca eludir CAPTCHA, emails de verificación o protecciones de una web.

## Estudio inicial: Action Network

[API v2](https://actionnetwork.org/docs/v2/signatures). Su API permite crear firmas con comentarios pero documenta que un POST a una petición puede suscribir automáticamente a la persona a listas. [Acceso al API](https://help.actionnetwork.org/hc/en-us/articles/203853205-Does-the-Action-Network-have-an-API-and-how-do-I-access-it) está restringido a socios pagos. La propia documentación indica que la API no está diseñada como sustituto de la interfaz de usuario.

**Decisión:** integración DESHABILITADA hasta disponer de acceso y un flujo que cumpla la política de no enviar comunicaciones no solicitadas.

## Contrato de un adaptador futuro

```ts
type DestinationStatus = "accepted" | "pending_confirmation" | "rejected" | "unsupported" | "failed";
interface PartnerSubmission {
  causeId: string;
  signedStatementVersion: string;
  consentRecordId: string;
  signer: { name: string; email: string; country?: string };
  generalMessage?: string;
  advertisingConsent: false;
}
interface PartnerResult {
  status: DestinationStatus;
  remoteReceiptId?: string;
  reason?: string;
}
```

La API debe aplicar las restricciones arriba descritas antes de habilitar un adaptador. No se debe intentar usar endpoints de firma de terceros sin credenciales autorizadas.
