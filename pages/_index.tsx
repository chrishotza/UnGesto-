import React, { useEffect, useMemo, useState } from "react";
import { ArrowUpRight, CheckCircle2, ChevronDown, CircleHelp, ExternalLink, Globe2, Heart, HeartHandshake, Leaf, LockKeyhole, MailX, Menu, Search, ShieldCheck, Sparkles, Trash2 } from "lucide-react";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import styles from "./_index.module.css";
import { Checkbox } from "../components/Checkbox";
import { petitionStatements } from "../helpers/petitionStatements";
import BatchSignature, { type SelectedCause, storedReceipts, discardReceipt } from "../components/BatchSignature";
import { postRevokeEndorsements } from "../endpoints/revoke-endorsements_POST.schema";

type Cause = {
 id: string; title: string; summary: string; category: string; organization: string;
 language: string; url: string; mark: string; icon: string; advice: string;
};

const causes: Cause[] = [
 {id:"april-paper",title:"Frenar la destrucción forestal de APRIL",summary:"Pedí a bancos e inversores que corten vínculos con APRIL/RGE por sus impactos sobre selvas y comunidades.",category:"Bosques",organization:"Rainforest Rescue",language:"Inglés",mark:"Acción ambiental",icon:"🌳",advice:"Rechazá la suscripción opcional al boletín.",url:"https://www.rainforest-rescue.org/petitions/1288/stop-april-indonesia-s-ruthless-paper-and-pulp-giant"},
 {id:"nigeria-timber",title:"Hacer cumplir la prohibición forestal en Nigeria",summary:"Reclamá medidas efectivas contra la tala ilegal y la protección de comunidades y especies amenazadas.",category:"Bosques",organization:"Rainforest Rescue",language:"Inglés",mark:"Acción ambiental",icon:"🌳",advice:"Rechazá la suscripción opcional al boletín.",url:"https://www.rainforest-rescue.org/petitions/1318/nigeria-s-forests-cannot-wait-enforce-the-timber-export-ban-now"},
 {id:"brasil-cultivos",title:"Proteger la agricultura frente a plantaciones industriales",summary:"Apoyá a las comunidades rurales de Brasil que enfrentan la expansión de monocultivos forestales.",category:"Bosques",organization:"Rainforest Rescue",language:"Inglés",mark:"Acción ambiental",icon:"🌱",advice:"Rechazá la suscripción opcional al boletín.",url:"https://www.rainforest-rescue.org/petitions/1320/brazil-we-need-fertile-farmland-not-industrial-timber-plantations"},
 {id:"biodiversidad-comercio",title:"La biodiversidad no es una mercancía",summary:"Pedí que se priorice la conservación efectiva frente a los mecanismos de compensación de daños.",category:"Clima",organization:"Rainforest Rescue",language:"Inglés",mark:"Acción ambiental",icon:"🦋",advice:"Rechazá la suscripción opcional al boletín.",url:"https://www.rainforest-rescue.org/petitions/1296/biodiversity-offsetting-is-a-false-solution-nature-is-not-a-commodity"},
 {id:"tripa-orangutanes",title:"Salvar el hábitat de los orangutanes de Tripa",summary:"Protegé los bosques de turba de Sumatra frente al avance de plantaciones de palma.",category:"Animales",organization:"Rainforest Rescue",language:"Inglés",mark:"Acción ambiental",icon:"🦧",advice:"Rechazá la suscripción opcional al boletín.",url:"https://www.rainforest-rescue.org/petitions/1290/indonesia-protect-the-habitat-of-tripa-s-orangutans"},
 {id:"brasil-plaguicidas",title:"Prohibir la fumigación aérea sobre comunidades",summary:"Pedí que Brasil proteja a las familias rurales y sus cultivos de fumigaciones con pesticidas.",category:"Salud",organization:"Rainforest Rescue",language:"Inglés",mark:"Acción ambiental",icon:"🌾",advice:"Rechazá la suscripción opcional al boletín.",url:"https://www.rainforest-rescue.org/petitions/1284/brazil-ban-the-aerial-spraying-of-pesticides"},
 {id:"sabana-proteger",title:"Proteger las sabanas y sus ecosistemas",summary:"Reclamá que no se sustituyan ecosistemas de sabana por reforestaciones inadecuadas.",category:"Bosques",organization:"Rainforest Rescue",language:"Inglés",mark:"Acción ambiental",icon:"🌿",advice:"Rechazá la suscripción opcional al boletín.",url:"https://www.rainforest-rescue.org/petitions/1282/protect-savannas-no-to-misguided-reforestation"},
 {id:"nias-vertido",title:"Detener el vertido de bitumen en Nias",summary:"Exigí respuesta ambiental al derrame de bitumen de un buque hundido frente a Indonesia.",category:"Océanos",organization:"Rainforest Rescue",language:"Inglés",mark:"Acción ambiental",icon:"🌊",advice:"Rechazá la suscripción opcional al boletín.",url:"https://www.rainforest-rescue.org/petitions/1279/indonesia-fight-the-marine-bitumen-spill-off-nias-island"},
 {id:"nigeria-petroleo",title:"Defender Nigeria de los daños de la industria petrolera",summary:"Apoyá a quienes reclaman protección ambiental frente a la extracción de petróleo y gas.",category:"Clima",organization:"Rainforest Rescue",language:"Inglés",mark:"Acción ambiental",icon:"🌍",advice:"Rechazá la suscripción opcional al boletín.",url:"https://www.rainforest-rescue.org/petitions/1277/the-oil-industry-is-devastating-nigeria-s-environment-for-germany-s-benefit"},
 {id:"sumatra-tigres",title:"Detener una mina de oro en el bosque de los tigres",summary:"Protegé el ecosistema de Leuser frente a un proyecto minero que amenaza especies únicas.",category:"Animales",organization:"Rainforest Rescue",language:"Inglés",mark:"Acción ambiental",icon:"🐅",advice:"Rechazá la suscripción opcional al boletín.",url:"https://www.rainforest-rescue.org/petitions/1276/indonesia-no-to-a-gold-mine-in-sumatra-s-tiger-forest"},
 {id:"ocean-2030", title:"Proteger el 30% de los océanos para 2030", summary:"Pedí a los gobiernos que creen santuarios marinos para proteger la vida que habita el océano.", category:"Océanos", organization:"Greenpeace Internacional", language:"Inglés", mark:"Océanos vivos", icon:"🌊", advice:"Revisá que la opción de recibir actualizaciones no quede activada.", url:"https://www.greenpeace.org/international/act/ocean-sanctuaries/"},
 {id:"palawan", title:"Defender los bosques indígenas de Palawan", summary:"Apoyá a las comunidades que defienden sus tierras y fuentes de agua frente a la minería de níquel.", category:"Bosques", organization:"Rainforest Rescue", language:"Inglés / Español", mark:"Bosques protegidos", icon:"🌳", advice:"Elegí «Maybe later» cuando el formulario pregunte si querés suscribirte al boletín.", url:"https://www.rainforest-rescue.org/petitions/1324/philippines-stand-with-the-indigenous-resistance-to-nickel-mining-in-palawan"},
 {id:"animales-leuser", title:"Proteger la fauna única de Leuser", summary:"Ayudá a conservar el ecosistema donde conviven orangutanes, tigres, elefantes y rinocerontes.", category:"Animales", organization:"Rainforest Rescue", language:"Inglés", mark:"Vida silvestre", icon:"🐘", advice:"No selecciones la suscripción al boletín en el formulario.", url:"https://www.rainforest-rescue.org/petitions/1040/protect-leuser-s-iconic-wildlife"},
 {id:"sudan", title:"Proteger a la población civil en Sudán", summary:"Sumate al pedido de protección internacional para las personas amenazadas por el conflicto armado.", category:"Derechos humanos", organization:"Amnistía Internacional", language:"Español", mark:"Protección humanitaria", icon:"🕊️", advice:"Si aparece una casilla para recibir correos con novedades, dejala sin marcar.", url:"https://www.amnesty.org/es/petition/call-for-the-deployment-of-an-international-protection-force-in-sudan/"},
 {id:"deep-sea", title:"Frenar la minería en aguas profundas", summary:"Pedí que no se exploten ecosistemas del fondo marino cuya biodiversidad todavía conocemos muy poco.", category:"Océanos", organization:"Greenpeace Internacional", language:"Inglés", mark:"Biodiversidad marina", icon:"🐋", advice:"Verificá los permisos de contacto y marcá solo lo indispensable para firmar.", url:"https://www.greenpeace.org/international/act/the-deep-ocean-is-not-for-sale/"},
 {id:"monos-brasil", title:"Salvar a los monos aulladores de Brasil", summary:"Reclamá medidas para proteger a estos animales frente a descargas eléctricas mortales.", category:"Animales", organization:"Rainforest Rescue", language:"Inglés", mark:"Protección animal", icon:"🐒", advice:"Rainforest Rescue permite elegir no recibir su boletín; elegí esa opción.", url:"https://www.rainforest-rescue.org/petitions/1292/brazil-howler-monkeys-need-protection-from-deadly-electric-shocks"},
 {id:"iran-justicia", title:"Pedir justicia para las víctimas en Irán", summary:"Apoyá un mecanismo internacional de justicia frente a graves abusos de derechos humanos.", category:"Derechos humanos", organization:"Amnistía Internacional", language:"Español", mark:"Justicia", icon:"⚖️", advice:"No actives las casillas de comunicaciones opcionales al completar la petición.", url:"https://www.amnesty.org/es/petition/demand-international-justice-for-crimes-against-humanity-in-iran/"},
 {id:"defensores", title:"Proteger a quienes cuidan la Tierra", summary:"Reclamá reconocimiento de los territorios y derechos de comunidades indígenas y costeras.", category:"Clima", organization:"Greenpeace Internacional", language:"Inglés", mark:"Defensores ambientales", icon:"🌍", advice:"En el formulario, evitá elegir la opción de recibir actualizaciones por email.", url:"https://www.greenpeace.org/international/act/defend-earth-defenders/"},
 {id:"guatemala", title:"Defender el derecho a protestar en Guatemala", summary:"Pedí la libertad de Luis Pacheco y Héctor Chaclán, defensores de los derechos indígenas.", category:"Derechos humanos", organization:"Amnistía Internacional", language:"Español", mark:"Libertades", icon:"🤝", advice:"Desactivá cualquier casilla opcional de noticias o campañas.", url:"https://www.amnesty.org/es/petition/liberen-a-luis-pacheco-y-hector-chaclan/"},
 {id:"educacion-rusia", title:"Defender la educación libre de adoctrinamiento", summary:"Exigí que las escuelas respeten el derecho de sus estudiantes a aprender y expresar opiniones.", category:"Educación", organization:"Amnistía Internacional", language:"Español", mark:"Derecho a aprender", icon:"📚", advice:"Las casillas de actualizaciones de Amnistía son opcionales; dejalas sin seleccionar.", url:"https://www.amnesty.org/es/petition/stop-indoctrination-in-russian-schools/"}
];
const categories = ["Todas", "Animales", "Océanos", "Bosques", "Derechos humanos", "Clima", "Salud", "Educación"];
type Show = "todas" | "registradas";


export default function HomePage(){
 const [category,setCategory]=useState("Todas");
 const [query,setQuery]=useState("");
 const [show,setShow]=useState<Show>("todas");

 const [registered,setRegistered]=useState<string[]>([]);
 const [selected,setSelected]=useState<string[]>([]);
 const [reading,setReading]=useState<string|null>(null);
 const [signing,setSigning]=useState(false);
 const [busyRevoking,setBusyRevoking]=useState(false);
 const [helpOpen,setHelpOpen]=useState(false);
 const [mobileMenu,setMobileMenu]=useState(false);

 useEffect(()=>{setRegistered([...new Set(storedReceipts().flatMap(r=>r.causeIds))]);},[]);

 const visible=useMemo(()=>causes.filter(c=>{
  const hit=query.trim().toLowerCase();
  return (category==="Todas" || c.category===category) &&
   (show==="todas" || registered.includes(c.id)) &&
   (!hit||[c.title,c.summary,c.organization,c.category].join(" ").toLowerCase().includes(hit));
 }),[category,query,show,registered]);

 function toggleSelected(id:string){setSelected(a=>a.includes(id)?a.filter(x=>x!==id):[...a,id]);}

 async function revokeMyReceipts(){
  const receipts=storedReceipts();
  if(!receipts.length){window.alert("No hay comprobantes de adhesiones en este dispositivo.");return;}
  if(!window.confirm("¿Querés revocar y eliminar del servidor todos los registros de adhesión de este dispositivo?"))return;
  setBusyRevoking(true);
  let failed=0;
  try{
   for(const receipt of receipts){try{const out=await postRevokeEndorsements({receiptToken:receipt.receiptToken});if(out.revoked)discardReceipt(receipt.receiptId);else failed++;}catch{failed++;}}
   setRegistered([...new Set(storedReceipts().flatMap(r=>r.causeIds))]);
   window.alert(failed?"Algunos registros no pudieron borrarse. Probá de nuevo.":"Los registros se revocaron y eliminaron del servidor.");
  }finally{setBusyRevoking(false);}
 }
 return <div className={styles.site}>
  <header className={styles.header}>
   <div className={styles.container+" "+styles.nav}>
    <a href="#inicio" className={styles.brand} aria-label="UnGesto, inicio"><span className={styles.brandIcon}><Leaf size={21} strokeWidth={2.6}/></span><span>un<span className={styles.brandAccent}>gesto</span><span className={styles.brandPoint}>.</span></span></a>
    <nav className={styles.desktopNav} aria-label="Navegación principal">
     <a href="#causas">Explorar causas</a><a href="#como">Cómo funciona</a><a href="#privacidad">Privacidad</a>
    </nav>
    <div className={styles.navRight}><span className={styles.noSpam}><ShieldCheck size={16}/> Sin donaciones ni spam nuestro</span>
     <Button className={styles.mobileNavBtn} size="icon" variant="ghost" aria-label="Abrir menú" onClick={()=>setMobileMenu(!mobileMenu)}><Menu size={22}/></Button>
    </div>
   </div>
   {mobileMenu&&<nav className={styles.mobileNav}><a href="#causas" onClick={()=>setMobileMenu(false)}>Explorar causas</a><a href="#como" onClick={()=>setMobileMenu(false)}>Cómo funciona</a><a href="#privacidad" onClick={()=>setMobileMenu(false)}>Privacidad</a></nav>}
  </header>
  <main id="inicio">
   <section className={styles.hero}>
    <div className={styles.container+" "+styles.heroInner}>
     <div className={styles.heroCopy}>
      <div className={styles.eyebrow}><span className={styles.sparkle}><Sparkles size={15}/></span> Pequeñas acciones. Grandes cambios.</div>
      <h1>Una firma.<br/><em>Muchas causas.</em></h1>
      <p>Leé, marcá las causas que querés apoyar y completá tus datos una sola vez. Gratis, sin suscripciones ni correos publicitarios de UnGesto.</p>
      <div className={styles.heroActions}><Button size="lg" className={styles.heroCta} onClick={()=>document.getElementById("causas")?.scrollIntoView({behavior:"smooth"})}>Elegir mis causas <ArrowUpRight size={18}/></Button><a href="#como" className={styles.underlink}>¿Cómo funciona? <ChevronDown size={15}/></a></div>
      <div className={styles.heroTrust}><span><CheckCircle2 size={16}/> Gratis para todos</span><span><CheckCircle2 size={16}/> Sin crear cuenta</span></div>
     </div>
     <div className={styles.heroVisual} aria-label="Ilustración abstracta del planeta y la solidaridad">
      <div className={styles.visualHalo}></div><div className={styles.visualOrbit}></div><div className={styles.visualGlobe}><Globe2 size={168} strokeWidth={0.95}/><span className={styles.globeHeart}><Heart fill="currentColor" size={24}/></span></div>
      <div className={styles.floatingCard+" "+styles.floatingFirst}><span>🌱</span><div><strong>Una firma</strong><small>también suma</small></div></div>
      <div className={styles.floatingCard+" "+styles.floatingSecond}><span>🤝</span><div><strong>Cada voz cuenta</strong><small>La tuya también</small></div></div>
      <div className={styles.artDot+" "+styles.dotOne}></div><div className={styles.artDot+" "+styles.dotTwo}></div>
     </div>
    </div>
   </section>
   <div className={styles.strip}><div className={styles.container+" "+styles.stripInner}><div><HeartHandshake size={21}/><strong>{causes.length} causas para apoyar</strong><span>desde un solo formulario</span></div><div><LockKeyhole size={20}/><strong>Firma múltiple</strong><span>una única autorización</span></div><div><MailX size={21}/><strong>0 mensajes nuestros</strong><span>nada de newsletters</span></div></div></div>
   <section id="causas" className={styles.catalog+" "+styles.container}>
    <div className={styles.catalogHeading}><div><span className={styles.sectionKicker}>DESCUBRÍ CÓMO AYUDAR</span><h2>Marcá todas las causas que apoyás.</h2><p>Leé el título y la descripción, tildá las que quieras y firmá todas juntas.</p></div><div className={styles.countBox}><span>{causes.length}</span><small>causas disponibles</small></div></div>
    <div className={styles.findBar}><div className={styles.searchWrap}><Search size={20}/><Input aria-label="Buscar peticiones" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Buscá animales, océanos, bosques..."/></div><div className={styles.viewBtns}><Button variant={show==="todas"?"primary":"ghost"} size="sm" onClick={()=>setShow("todas")}>Todas</Button><Button variant={show==="registradas"?"primary":"ghost"} size="sm" onClick={()=>setShow("registradas")}>Mis adhesiones ({registered.length})</Button></div></div>
    <div className={styles.chips} aria-label="Filtrar por categoría">{categories.map(c=><Button key={c} size="sm" variant="ghost" aria-pressed={c===category} className={styles.chip+" "+(c===category?styles.chipActive:"")} onClick={()=>setCategory(c)}>{c}</Button>)}</div>
    <div className={styles.bulkActions}><span><CheckCircle2 size={16}/> <strong>{selected.length}</strong> {selected.length===1?"causa elegida":"causas elegidas"}</span><div><Button variant="ghost" size="sm" onClick={()=>setSelected(a=>[...new Set([...a,...visible.map(c=>c.id)])].slice(0,20))}>Tildar todas las visibles</Button><Button variant="ghost" size="sm" onClick={()=>setSelected([])} disabled={!selected.length}>Desmarcar</Button></div></div>
    {visible.length===0?<div className={styles.empty}><Search size={36}/><h3>No encontramos causas con esos filtros.</h3><p>Probá otra búsqueda o volvé a verlas todas.</p><Button variant="outline" onClick={()=>{setQuery("");setCategory("Todas");setShow("todas");}}>Mostrar todas</Button></div>:
    <div className={styles.grid}>{visible.map(c=><article className={styles.simpleCause+" "+(selected.includes(c.id)?styles.selectedCause:"")} key={c.id}>
      <label className={styles.quickCheck} title={"Elegir "+c.title}><Checkbox checked={selected.includes(c.id)} onChange={()=>toggleSelected(c.id)} aria-label={"Apoyar "+c.title}/></label>
      <div className={styles.simpleCauseBody}>
       <div className={styles.simpleCauseMeta}><span>{c.icon} {c.category}</span><span>{c.organization}</span>{registered.includes(c.id)&&<span className={styles.internalStatus}>Apoyo registrado en UnGesto</span>}</div>
       <h3>{c.title}</h3><p>{c.summary}</p>
       <div className={styles.simpleCauseFoot}>
        <Button variant="ghost" size="sm" onClick={()=>setReading(reading===c.id?null:c.id)}>{reading===c.id?"Ocultar declaración":"Leer declaración a firmar"} <ChevronDown size={14}/></Button>
        <a href={c.url} rel="noopener noreferrer" target="_blank">Ver petición original <ExternalLink size={13}/></a>
       </div>
       {reading===c.id&&<div className={styles.inlineStatement}><strong>Texto de apoyo incluido en la adhesión:</strong><p>{petitionStatements[c.id].text}</p><small>Declaración de UnGesto, versión {petitionStatements[c.id].version}.</small></div>}
      </div>
      <Button className={styles.quickChoice} size="sm" variant={selected.includes(c.id)?"primary":"outline"} onClick={()=>toggleSelected(c.id)}>{selected.includes(c.id)?"Elegida ✓":"Elegir causa"}</Button>
     </article>)}</div>}
    <div className={styles.moreNote}><Globe2 size={18}/><div><strong>Tu apoyo queda registrado en UnGesto para cada causa elegida.</strong> Estamos desarrollando conexiones autorizadas para que, en una próxima etapa y con consentimiento específico, las organizaciones también puedan recibir las firmas. Las peticiones externas pueden cambiar o cerrarse.</div></div>
   </section>
   <section id="como" className={styles.how}><div className={styles.container}><div className={styles.howHeader}><span className={styles.sectionKicker}>SIMPLE, COMO DEBERÍA SER</span><h2>Tres pasos. Ninguna complicación.</h2></div><div className={styles.steps}>
    <div><span className={styles.stepNumber}>01</span><div className={styles.stepSymbol}><Search size={24}/></div><h3>Leé y tildá</h3><p>Conocé las declaraciones y elegí tantas causas como quieras.</p></div>
    <div><span className={styles.stepNumber}>02</span><div className={styles.stepSymbol}><Heart size={24}/></div><h3>Completá una sola vez</h3><p>Un nombre, un email y un mensaje opcional para todas tus causas.</p></div>
    <div><span className={styles.stepNumber}>03</span><div className={styles.stepSymbol}><CheckCircle2 size={24}/></div><h3>Una sola autorización</h3><p>Registramos cada respaldo por separado en UnGesto y te damos comprobante.</p></div>
   </div></div></section>
   <section id="privacidad" className={styles.privacy+" "+styles.container}>
    <div className={styles.privacyIcon}><ShieldCheck size={33}/></div><div className={styles.privacyText}><span className={styles.sectionKicker}>TU VOZ, TUS DATOS</span><h2>Ayudar no debería costarte tu privacidad.</h2><p>Para registrar una adhesión pedimos nombre y correo, que se almacenan en nuestra base de datos junto al mensaje y los textos aceptados. No enviamos correos, no creamos listas de marketing ni cobramos. Las futuras firmas externas requerirán integraciones y consentimiento específico para compartir los datos necesarios. El comprobante de revocación queda en este dispositivo; si lo borrás sin revocar, no podremos asociar fácilmente la adhesión con vos.</p><div className={styles.privacyButtons}><Button variant="outline" onClick={()=>setHelpOpen(v=>!v)}><CircleHelp size={17}/> {helpOpen?"Cerrar consejos":"Cómo evitar correos"}</Button><Button variant="outline" disabled={busyRevoking} onClick={revokeMyReceipts}><Trash2 size={16}/> {busyRevoking?"Revocando...":"Revocar mis adhesiones"}</Button></div>
     {helpOpen&&<div className={styles.tips}><strong>Cómo cuidamos el consentimiento:</strong><p>UnGesto solo registra las declaraciones propias a las que diste autorización. Si querés firmar también en la organización, podés abrir su fuente oficial, pero ese proceso es independiente y podría requerir un email de confirmación.</p></div>}
    </div>
   </section>
  </main>
  <footer className={styles.footer}><div className={styles.container+" "+styles.footerInner}><div className={styles.footerBrand}><span className={styles.footerLogo}><Leaf size={17}/> ungesto.</span><span>Un proyecto para ayudar sin pedir nada a cambio.</span></div><p>Un lugar para apoyar varias causas con un solo formulario. Firmas oficiales externas: integraciones en desarrollo. Sin publicidad, pagos ni newsletters.</p><a href="#inicio">Volver arriba ↑</a></div></footer>
  {selected.length>0&&!signing&&<div className={styles.selectedBar} role="region" aria-label="Tus causas seleccionadas"><div><CheckCircle2 size={22}/><strong>{selected.length} {selected.length===1?"causa elegida":"causas elegidas"}</strong><small>Un solo formulario para todas</small></div><Button onClick={()=>setSigning(true)}>Firmar {selected.length} {selected.length===1?"causa":"causas"} <ArrowUpRight size={17}/></Button></div>}
  {signing&&<BatchSignature causes={causes.filter(c=>selected.includes(c.id)).map(c=>({id:c.id,title:c.title,summary:c.summary,organization:c.organization,url:c.url}) satisfies SelectedCause)} onClose={()=>{setSigning(false);setRegistered([...new Set(storedReceipts().flatMap(r=>r.causeIds))]);}} onRecorded={ids=>{setRegistered(a=>[...new Set([...a,...ids])]);setSelected([]);}}/>}
 </div>;
}
