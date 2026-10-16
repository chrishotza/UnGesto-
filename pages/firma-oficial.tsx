import React, {useEffect, useMemo, useState} from "react";
import {ArrowLeft, CheckCircle2, ExternalLink, HeartHandshake, ShieldCheck} from "lucide-react";
import {Button} from "../components/Button";
import officialWidgets from "../integrations/official-widgets.json";
import styles from "./firma-oficial.module.css";

type Widget = (typeof officialWidgets.campaigns)[number];
const campaignNames: Record<string,{title:string,summary:string}> = {
 "openpet-pennsylvania-water":{title:"Proteger el agua frente a los centros de datos",summary:"Exigir controles ambientales para la expansión de centros de datos en Pensilvania."},
 "openpet-kodagu-hills":{title:"Proteger los bosques y colinas de Kodagu",summary:"Defender la biodiversidad y los recursos hídricos en India."},
 "openpet-rockview-park":{title:"Crear el parque estatal Rockview",summary:"Proteger un gran espacio natural y la cuenca Spring Creek."},
 "openpet-battery-recycling":{title:"Reciclaje de baterías sin cargos",summary:"Facilitar el reciclaje seguro de baterías en Massachusetts."}
};
function officialWidgetHTML(widget:Widget):string {
 // Only hard-coded, verified public widget IDs are interpolated.
 const id=widget.widgetId;
 return `<!doctype html><html lang="es"><head><meta charset="utf-8">
 <meta name="viewport" content="width=device-width, initial-scale=1">
 <style>html,body{margin:0;padding:0;background:#fff;color:#163d2c;font-family:system-ui,sans-serif}#op_widget_container_${id}{min-height:700px}</style>
 </head><body><div id="op_widget_container_${id}"></div>
 <script>var OPWIDGET = {"base_url":"https://www.openpetition.org","api_key":"${id}",
 "options":{"primarycolor":"#176747","secondarycolor":"#3e3d40","backgroundcolor":"#ffffff","mainfontsize":"16px"}};</script>
 <script src="https://www.openpetition.de/javascript/widget.js"></script>
 <noscript>Activá JavaScript para mostrar el formulario oficial de firma.</noscript></body></html>`;
}
export default function FirmasOficiales(){
 const [causeId,setCauseId]=useState("openpet-pennsylvania-water");
 const [privacyApproved,setPrivacyApproved]=useState(false);
 const [showWidget,setShowWidget]=useState(false);
 useEffect(()=>{
  const id=new URLSearchParams(window.location.search).get("cause");
  if(id && officialWidgets.campaigns.some(x=>x.causeId===id))setCauseId(id);
 },[]);
 const selected=useMemo(()=>officialWidgets.campaigns.find(x=>x.causeId===causeId) || officialWidgets.campaigns[0],[causeId]);
 const display=campaignNames[selected.causeId];
 function switchCause(id:string){setCauseId(id);setPrivacyApproved(false);setShowWidget(false);window.history.replaceState(null,"","?cause="+encodeURIComponent(id));}
 return <main className={styles.page}><div className={styles.content}>
  <a href="/" className={styles.back}><ArrowLeft size={17}/> Volver a UnGesto</a>
  <span className={styles.tag}><ShieldCheck size={16}/> Firma en organizaciones receptoras</span>
  <h1>Que tu firma <em>llegue de verdad.</em></h1>
  <p className={styles.lead}>Estas cuatro causas tienen formularios oficiales de openPetition. Elegí una para firmar directamente en el servicio que recibe las firmas.</p>
  <div className={styles.campaigns}>{officialWidgets.campaigns.map(c=><button key={c.causeId} type="button" className={styles.campaign+" "+(selected.causeId===c.causeId?styles.active:"")} onClick={()=>switchCause(c.causeId)}>
   <strong>{campaignNames[c.causeId].title}</strong><small>{c.administratorEmailConfirmed?"Widget configurado":"Widget generado, activación pendiente"}</small>
  </button>)}</div>
  <section className={styles.details}>
   <h2>{display.title}</h2><p>{display.summary}</p>
   <p>Tu firma será gestionada por <strong>openPetition</strong>, no por la base de datos de UnGesto. El proveedor puede solicitarte confirmar el correo. UnGesto no elige boletines publicitarios por vos.</p>
   {selected.administratorEmailConfirmed ? (
    !showWidget ? <div className={styles.notice}>
     <p>Al mostrar el formulario, openPetition cargará contenido externo y tratará los datos que introduzcas según su política de privacidad. La firma solo contará cuando la plataforma confirme su validez.</p>
     <label><input type="checkbox" checked={privacyApproved} onChange={e=>setPrivacyApproved(e.target.checked)}/> Acepto abrir el formulario de openPetition para esta causa.</label>
     <Button disabled={!privacyApproved} onClick={()=>setShowWidget(true)}>Abrir formulario oficial <ExternalLink size={16}/></Button>
    </div> : <div className={styles.widget}><iframe title={"Firma oficial: "+display.title} srcDoc={officialWidgetHTML(selected)} sandbox="allow-forms allow-scripts allow-popups allow-popups-to-escape-sandbox" referrerPolicy="strict-origin-when-cross-origin" className={styles.frame}/></div>
   ) : <div className={styles.notice}>
    <p>El formulario de UnGesto para esta causa está generado, pero falta confirmar el correo del administrador antes de usarlo aquí. Mientras tanto, podés firmar directamente en la petición oficial.</p>
    <a className={styles.officialAction} href={selected.petitionUrl} target="_blank" rel="noopener noreferrer">Abrir petición oficial <ExternalLink size={16}/></a>
   </div>}
   <div className={styles.fallback}><a href={selected.petitionUrl} target="_blank" rel="noopener noreferrer">Ver la petición en openPetition <ExternalLink size={15}/></a></div>
  </section>
  <p className={styles.disclaimer}><HeartHandshake size={17}/> No marcamos una firma como entregada por abrir un enlace o completar un formulario. La recepción efectiva depende de la validación de openPetition. No se envían datos tuyos a campañas no seleccionadas.</p>
 </div></main>;
}
