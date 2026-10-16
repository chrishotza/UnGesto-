import React, { useState } from "react";
import { ArrowLeft, ExternalLink, ShieldCheck, HeartHandshake } from "lucide-react";
import { Button } from "../components/Button";
import styles from "./firma-oficial.module.css";

/**
 * Widget generated on openPetition for https://ungesto-solidario.floot.app
 * Administrator email has been confirmed through the platform.
 * Original generated code: widget overview on openPetition.
 * The official script runs in a sandboxed, opaque-origin frame so it cannot
 * read UnGesto's localStorage (which may contain receipt revocation tokens).
 */
const widgetId="03e3da52701e65753dc9d31ac94b2cab6bc846258f0ea9c43d4cb2f459780de9";
const petitionUrl="https://www.openpetition.org/us/petition/online/protect-the-commonwealth-of-pa-and-residents-from-the-harms-of-unregulated-data-centers";
const html = `<!doctype html><html lang="es">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<style>body{margin:0;background:white;font-family:system-ui}#op_widget_container_${widgetId}{min-height:680px}</style></head>
<body>
<div id="op_widget_container_${widgetId}"></div>
<script>
var OPWIDGET = {
  "base_url":"https://www.openpetition.org",
  "api_key":"${widgetId}",
  "options":{"primarycolor":"#176747","secondarycolor":"#3e3d40","backgroundcolor":"#ffffff","mainfontsize":"16px"}
};
</script>
<script src="https://www.openpetition.de/javascript/widget.js"></script>
<noscript>Activá JavaScript para ver el formulario oficial.</noscript>
</body></html>`;

export default function FirmaOficial(){
 const [privacyOk,setPrivacyOk]=useState(false);
 const [opened,setOpened]=useState(false);
 return <main className={styles.page}>
  <div className={styles.content}>
   <a href="/" className={styles.back}><ArrowLeft size={16}/> Volver a UnGesto</a>
   <span className={styles.tag}><ShieldCheck size={15}/> Firma en una plataforma externa</span>
   <h1>Firmá una petición real con <em>openPetition</em></h1>
   <p className={styles.lead}>Protección del agua, el clima y las comunidades frente a centros de datos sin regulaciones suficientes en Pensilvania.</p>
   <p>El formulario está administrado por openPetition. Para que la firma se contabilice deberás completar los datos que soliciten y confirmar tu correo cuando corresponda. No te suscribimos a ningún boletín en UnGesto.</p>
   {!opened?<section className={styles.notice}>
    <h2>Ingresar al formulario oficial</h2>
    <p>Al abrirlo tu navegador se conecta a openPetition y ese servicio trata tus datos de acuerdo con su política de privacidad. Es posible que te pida confirmar el correo. No actives opciones de contacto opcionales si no querés recibir noticias.</p>
    <label><input type="checkbox" checked={privacyOk} onChange={e=>setPrivacyOk(e.target.checked)}/> Quiero abrir el formulario de openPetition y acepto conectarme a ese servicio.</label>
    <Button disabled={!privacyOk} onClick={()=>setOpened(true)}>Mostrar formulario <ExternalLink size={16}/></Button>
   </section>:<section className={styles.widget}>
    <iframe title="Formulario oficial de openPetition" srcDoc={html}
      sandbox="allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox"
      referrerPolicy="strict-origin-when-cross-origin" className={styles.frame}/>
   </section>}
   <p>Si el widget no se visualiza, <a href={petitionUrl} target="_blank" rel="noopener noreferrer">abrí la petición original <ExternalLink size={13}/></a>.</p>
   <p className={styles.privacy}><HeartHandshake size={18}/> UnGesto no puede confirmar automáticamente el resultado del formulario externo. Una firma oficial es válida cuando su plataforma la acepte.</p>
  </div>
 </main>;
}
