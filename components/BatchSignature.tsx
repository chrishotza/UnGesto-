import React, { useEffect, useState } from "react";
import { AlertCircle, ArrowLeft, CheckCircle2, ExternalLink, HeartHandshake, LockKeyhole, MailX, ShieldCheck, Trash2, X } from "lucide-react";
import { Button } from "./Button";
import { Input } from "./Input";
import { Checkbox } from "./Checkbox";
import { Textarea } from "./Textarea";
import { petitionStatements } from "../helpers/petitionStatements";
import { postEndorsements, type OutputType } from "../endpoints/endorsements_POST.schema";
import { postRevokeEndorsements } from "../endpoints/revoke-endorsements_POST.schema";
import styles from "./BatchSignature.module.css";

export type SelectedCause = { id:string; title:string; summary:string; organization:string; url:string };
export type Receipt = {receiptId:string;receiptToken:string;causeIds:string[];date:string};
const storageKey="ungesto_receipts_v1";
export function storedReceipts(): Receipt[]{
 try{
  const items=JSON.parse(localStorage.getItem(storageKey)||"[]");
  return Array.isArray(items)?items.filter(x=>x&&typeof x.receiptToken==="string"&&Array.isArray(x.causeIds)):[];
 }catch{return [];}
}
export function storeReceipt(receipt:Receipt) {
 try{localStorage.setItem(storageKey,JSON.stringify([receipt,...storedReceipts()].slice(0,20)));}catch{}
}
export function discardReceipt(id:string){
 try{localStorage.setItem(storageKey,JSON.stringify(storedReceipts().filter(r=>r.receiptId!==id)));}catch{}
}
export default function BatchSignature({causes,onClose,onRecorded}:{causes:SelectedCause[];onClose:()=>void;onRecorded:(ids:string[])=>void}){
 const [name,setName]=useState("");
 const [email,setEmail]=useState("");
 const [country,setCountry]=useState("");
 const [message,setMessage]=useState("");
 const [authorized,setAuthorized]=useState(false);

 const [submitting,setSubmitting]=useState(false);
 const [result,setResult]=useState<OutputType|null>(null);
 const [error,setError]=useState("");
 const [revokeWorking,setRevokeWorking]=useState(false);
 const [revoked,setRevoked]=useState(false);
 useEffect(()=>{
   function onKey(e:KeyboardEvent){if(e.key==="Escape"&&!submitting)onClose();}
   document.addEventListener("keydown",onKey);
   return ()=>document.removeEventListener("keydown",onKey);
 },[onClose,submitting]);
 async function submit(e:React.FormEvent){
  e.preventDefault();setError("");
  if(!authorized){setError("Confirmá que leíste y autorizás estas causas antes de continuar.");return;}
  if(!causes.length){setError("Seleccioná al menos una causa.");return;}
  setSubmitting(true);
  try{
    const out=await postEndorsements({name:name.trim(),email:email.trim(),country:country.trim(),message:message.trim(),causeIds:causes.map(c=>c.id),readAndAuthorized:true,privacyAccepted:true});
    storeReceipt({receiptId:out.receiptId,receiptToken:out.receiptToken,causeIds:out.recorded.map(x=>x.causeId),date:new Date().toISOString()});
    setResult(out);onRecorded(out.recorded.map(x=>x.causeId));
  }catch(err){setError(err instanceof Error?err.message:"No se pudieron registrar las adhesiones.");}
  finally{setSubmitting(false);}
 }
 async function revoke(){
  if(!result)return;
  setRevokeWorking(true);setError("");
  try{
   const out=await postRevokeEndorsements({receiptToken:result.receiptToken});
   if(!out.revoked)throw new Error("No se encontró ese registro.");
   discardReceipt(result.receiptId);setRevoked(true);
  }catch(err){setError(err instanceof Error?err.message:"No se pudo eliminar el registro.");}
  finally{setRevokeWorking(false);}
 }
 return <div className={styles.overlay} role="presentation" onMouseDown={e=>{if(e.target===e.currentTarget&&!submitting)onClose();}}>
   <section className={styles.modal} role="dialog" aria-modal="true" aria-label="Firma única de múltiples causas">
     <header className={styles.head}>
       <div className={styles.headIdentity}><div className={styles.headIcon}><HeartHandshake size={23}/></div><div><small>UN GESTO PARA MUCHAS CAUSAS</small><h2>{result?"Comprobante de firma única":"Una firma para "+causes.length+" causas"}</h2></div></div>
       <Button variant="ghost" size="icon" onClick={onClose} aria-label="Cerrar"><X size={22}/></Button>
     </header>
     {result ? <div className={styles.resultBody}>
        <div className={styles.successMark}><CheckCircle2 size={35}/></div>
        <h3>{revoked?"Adhesiones revocadas":`¡Tu apoyo a ${result.recorded.length} ${result.recorded.length===1?"causa":"causas"} quedó registrado!`}</h3>
        <p>{revoked?"Se eliminó este envío y sus declaraciones de la base de datos.":"Tu apoyo quedó registrado por separado para cada causa elegida, junto con la declaración y el mensaje que autorizaste. Podés conservar el comprobante o revocar tu adhesión."}</p>
        <div className={styles.receipt}><strong>Identificador de comprobante</strong><code>{result.receiptId}</code><strong>Clave privada de revocación (guardala en un lugar seguro)</strong><code>{result.receiptToken}</code><small>No compartas esta clave: permite eliminar tus adhesiones. UnGesto también la guarda en este navegador.</small><Button variant="outline" size="sm" onClick={()=>navigator.clipboard?.writeText(result.receiptToken)}>Copiar clave</Button></div>
        <div className={styles.resultsList}>{result.recorded.map(item=><div key={item.causeId}><CheckCircle2 size={17}/><span>{causes.find(c=>c.id===item.causeId)?.title||item.causeId}</span><small>{revoked?"Revocada":"Solo UnGesto"}</small></div>)}</div>
        <div className={styles.deliveryStatus}><ShieldCheck size={18}/><span>Estado de entrega: apoyo registrado en UnGesto. La firma oficial en plataformas de otras organizaciones requiere una integración autorizada, que todavía no está activa.</span></div>
        {error&&<p className={styles.error} role="alert">{error}</p>}
        <div className={styles.resultActions}><Button onClick={onClose}>Entendido</Button>{!revoked&&<Button variant="outline" disabled={revokeWorking} onClick={revoke}><Trash2 size={16}/> {revokeWorking?"Eliminando...":"Revocar y borrar"}</Button>}</div>
     </div>:
     <form onSubmit={submit} className={styles.body}>
       <div className={styles.summary}><span className={styles.step}>CAUSAS QUE ELEGISTE</span><h3>Una sola firma para {causes.length} {causes.length===1?"causa":"causas"}.</h3><p>Ya seleccionaste las causas. No necesitás visitar sus sitios ni completar más de un formulario para registrar tu apoyo en UnGesto. Podés revisar acá las declaraciones completas.</p></div>
       <div className={styles.statementList}>{causes.map((c,i)=><details key={c.id} className={styles.statement}><summary><span>{String(i+1).padStart(2,"0")}</span><strong>{c.title}</strong><span className={styles.detailMore}>Ver declaración</span></summary><p>{c.summary}</p><p><strong>Texto de apoyo que se registrará:</strong> {petitionStatements[c.id]?.text}</p><a href={c.url} rel="noopener noreferrer" target="_blank">Petición original de {c.organization} <ExternalLink size={13}/></a></details>)}</div>
       <div className={styles.summary}><span className={styles.step}>COMPLETÁ TU FIRMA</span><h3>Tus datos, una vez. Tu mensaje, para todas.</h3><p>No hay cuenta, donaciones ni suscripción a boletines. El mensaje general, si escribís uno, acompañará todas las causas seleccionadas.</p></div>
       <div className={styles.fields}><label>Nombre y apellido <span>*</span><Input required minLength={3} maxLength={120} autoComplete="name" value={name} onChange={e=>setName(e.target.value)} placeholder="Tu nombre completo"/></label>
       <label>Correo electrónico <span>*</span><Input required type="email" maxLength={254} autoComplete="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="tu@email.com"/></label>
       <label>País (opcional)<Input maxLength={80} autoComplete="country-name" value={country} onChange={e=>setCountry(e.target.value)} placeholder="Argentina"/></label>
       <label className={styles.messageField}>Mensaje que acompañará tus adhesiones (opcional)<Textarea value={message} onChange={e=>setMessage(e.target.value)} maxLength={1000} rows={3} placeholder="Quiero que mi voz ayude a proteger..." /><small>{message.length}/1000 caracteres</small></label></div>
       <div className={styles.consents}><label><Checkbox checked={authorized} onChange={e=>setAuthorized(e.target.checked)} required/><span><strong>Autorizo mi apoyo a todas las causas seleccionadas.</strong> Leí sus títulos y descripciones y acepto registrar mi nombre, correo y mensaje para cada declaración en UnGesto, sin marketing ni suscripciones. Sé que este registro no equivale a firmar en las plataformas externas, y que puedo revocarlo con mi comprobante.</span></label></div>
       <div className={styles.assuranceBox}><LockKeyhole size={18}/><span><strong>Tu gesto cuenta en UnGesto.</strong> Registramos tu apoyo en cada causa elegida, con tu mensaje general si lo escribiste. Usamos el correo solo como parte de ese registro: sin publicidad, boletines ni suscripciones. La entrega de firmas oficiales a otras plataformas se habilitará únicamente mediante integraciones autorizadas y tu consentimiento.</span></div>
       {error&&<div className={styles.error} role="alert"><AlertCircle size={16}/>{error}</div>}
       <div className={styles.actions}><Button type="button" variant="ghost" onClick={onClose}><ArrowLeft size={16}/> Volver</Button><Button type="submit" disabled={!authorized||!name.trim()||!email.trim()||submitting}>{submitting?"Registrando...":`Registrar mi firma en ${causes.length} ${causes.length===1?"causa":"causas"}`} <CheckCircle2 size={17}/></Button></div>
     </form>}
   </section>
 </div>;
}
