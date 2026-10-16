# Primer formulario externo generado y confirmado en openPetition

## Configuración real comprobada

- Organización: UnGesto
- Dominio autorizado: `https://ungesto-solidario.floot.app`
- Plataforma: `https://www.openpetition.org`
- Causa: Protect the Commonwealth of PA and Residents from the Harms of Unregulated Data Centers
- Widget ID público: `03e3da52701e65753dc9d31ac94b2cab6bc846258f0ea9c43d4cb2f459780de9`
- Página de administración del widget: https://www.openpetition.org/us/widget/uebersicht/03e3da52701e65753dc9d31ac94b2cab6bc846258f0ea9c43d4cb2f459780de9
- Correo del administrador: verificado mediante el mensaje de openPetition recibido en Gmail.
- Estado: el widget oficial se generó y su código se extrajo del textarea HTML original (no de un resumen generado por IA).

### Código exacto básico generado por openPetition

```html
<div id="op_widget_container_03e3da52701e65753dc9d31ac94b2cab6bc846258f0ea9c43d4cb2f459780de9"></div>
<script>
var OPWIDGET = {
  "base_url":"https://www.openpetition.org",
  "api_key":"03e3da52701e65753dc9d31ac94b2cab6bc846258f0ea9c43d4cb2f459780de9",
  "options":{
    "primarycolor":"#29b0cc",
    "secondarycolor":"#3e3d40",
    "backgroundcolor":"#ffffff",
    "mainfontsize":"16px"
  }
};
</script>
<script src="https://www.openpetition.de/javascript/widget.js"></script>
<noscript>Please activate JavaScript and reload your page.</noscript>
```

### Seguridad y consentimiento

La integración React vive en `pages/firma-oficial.tsx`. El script de terceros **no debe cargarse en el origen principal sin aislamiento**: los tokens de revocación de UnGesto viven en localStorage. Se emplea un iframe sandbox sin `allow-same-origin` para mantener el origen aislado, y el usuario decide cuándo cargarlo. Verificar el comportamiento del formulario y sus cookies en un navegador real antes de anunciarlo como funcional.

No se precompletan ni transfieren datos de firmantes guardados en UnGesto, y openPetition requiere confirmación de firma por correo. El formulario puede ofrecer opt-ins propios: nunca aceptarlos automáticamente.

**Limitaciones:** este widget es específico de una campaña, no envía automáticamente una sola firma a múltiples causas. El script no se encuentra aún instalado en la app de producción de Floot mientras su cuota diaria de cambios está agotada. Nunca declarar el proyecto de GitHub como despliegue activo.

La API pública de openPetition para recuento ya se verificó por GET (sin firmantes).
