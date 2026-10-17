(()=>{
"use strict";
const $=id=>document.getElementById(id);
const API=location.hostname==="ungesto-firma-batch.onrender.com"?"":"https://ungesto-firma-batch.onrender.com";
const selected=new Set(),connected=new Map(),sourceById=new Map();
const icons={"Animales":"♡","Bosques":"♧","Clima":"✳","Océanos":"≈","Salud":"✚","Derechos humanos":"⚖","Educación":"✎","Ambiente":"✳","Vivienda":"⌂","Transporte":"↗","Otros":"◌"};
let all=[],filtered=[],mode="connected",shown=0,receipt=null,busy=false;
const receiptKey="ungesto_batch_receipts_v1";
const $el=(tag,className,txt)=>{const e=document.createElement(tag);if(className)e.className=className;if(txt!==undefined)e.textContent=String(txt);return e;};
function safeUrl(url){try{const u=new URL(url);return u.protocol==="https:"?u.href:null}catch{return null}}
function itemIcon(c){return icons[c.category]||"✳"}
function decorated(c){
 if(connected.has(c.id))return {...c,kind:"connected",title:c.title,summary:c.summary,source:c.source,statement:c.statement};
 return {...c,kind:"external",summary:c.summary||c.description||"",statement:c.statement||c.consent_text||"",source:c.source||c.source_url||c.url};
}
function countSelected(){
 const count=selected.size;
 $("countTop").textContent=count;$("countForm").textContent=count;
 $("signButton").disabled=count===0||busy;
 $("signButton").textContent=busy?"Registrando tu gesto…":count?"Registrar mi apoyo a "+count+(count===1?" causa":" causas"):"Seleccioná una causa para continuar";
 const preview=$("selectedPreview");preview.replaceChildren();
 if(!count){preview.append($el("span","","Elegí una causa para empezar."));return}
 const choices=[...selected].map(id=>connected.get(id)).filter(Boolean);
 for(const c of choices.slice(0,3))preview.append($el("span","selected-chip",c.title));
 if(count>3)preview.append($el("span","selected-extra","+"+(count-3)+" más"));
}
function selectCause(id,checked){
 if(!connected.has(id))return;
 if(checked)selected.add(id);else selected.delete(id);
 countSelected();
 const row=document.querySelector('[data-cause-id="'+id+'"]');
 if(row){
  row.classList.toggle("selected",checked);
  const input=row.querySelector('input[type="checkbox"]');if(input)input.checked=checked;
 }
}
function causeCard(c){
 const row=$el("article","cause-row");row.dataset.causeId=c.id;
 if(selected.has(c.id))row.classList.add("selected");
 if(c.kind==="connected"){
  const cb=document.createElement("input");cb.type="checkbox";cb.className="cause-check";cb.checked=selected.has(c.id);cb.setAttribute("aria-label","Apoyar: "+c.title);
  cb.addEventListener("change",()=>selectCause(c.id,cb.checked));row.append(cb);
 }else{
  row.append($el("span","cause-disabled","↗"));
 }
 row.append($el("span","cause-icon",itemIcon(c)));
 const body=$el("div","cause-info"),top=$el("div","cause-topline");
 top.append($el("span","cause-provider",c.organization||c.source||"Parlamento británico"));
 const status=c.kind==="connected"?"Firma única":c.geography==="GB"?"Solo residentes o ciudadanos UK":"Firma en el origen";
 top.append($el("span","cause-tag"+(c.kind==="connected"?"":" waiting"),status));
 body.append(top,$el("h4","",c.title),$el("p","",c.summary||"Consultá el texto original de esta petición."));
 const links=$el("div","cause-links");
 if(c.kind==="connected"){
  const more=$el("button","","Leer lo que voy a apoyar");more.type="button";
  const detail=$el("div","cause-details",c.statement);detail.hidden=true;
  more.addEventListener("click",()=>{detail.hidden=!detail.hidden;more.textContent=detail.hidden?"Leer lo que voy a apoyar":"Ocultar detalles"});
  links.append(more);
  const href=safeUrl(c.source);if(href){const src=$el("a","","Fuente oficial ↗");src.href=href;src.target="_blank";src.rel="noopener noreferrer";links.append(src)}
  body.append(links,detail);
 }else{
  const href=safeUrl(c.source);if(href){
   const src=$el("a","",c.geography==="GB"?"Consultar petición en el Parlamento ↗":"Ver petición en el sitio receptor ↗");src.href=href;src.target="_blank";src.rel="noopener noreferrer";links.append(src);
  }
  body.append(links);
 }
 row.append(body);
 if(c.kind==="connected"){
  row.addEventListener("click",e=>{
   if(e.target instanceof Element&&e.target.closest("a,button,input"))return;
   selectCause(c.id,!selected.has(c.id));
  });
 }
 return row;
}
function filterCatalog(reset=true){
 const query=$("search").value.trim().toLocaleLowerCase("es");
 const cat=$("category").value;
 filtered=all.filter(c=>(mode==="all"||c.kind==="connected")&&(!cat||c.category===cat)&&(!query||[c.title,c.summary,c.organization,c.category].some(v=>String(v||"").toLocaleLowerCase("es").includes(query))));
 if(reset){shown=0;$("causes").replaceChildren();}
 const end=Math.min(filtered.length,shown+12);
 const fragment=document.createDocumentFragment();
 for(let i=shown;i<end;i++)fragment.append(causeCard(filtered[i]));
 $("causes").append(fragment);shown=end;
 $("more").hidden=shown===filtered.length;
 $("visibleCount").textContent=filtered.length.toLocaleString("es-AR")+" causas"+(mode==="all"?" documentadas":" para firma única");
 if(!filtered.length){const blank=$el("div","library-note","No encontramos causas con esos filtros. Probá otra búsqueda.");$("causes").append(blank)}
}
function renderCats(){
 const selectedCat=$("category").value;
 const cats=[...new Set(all.filter(c=>mode==="all"||c.kind==="connected").map(c=>c.category))].sort((a,b)=>a.localeCompare(b,"es"));
 $("category").replaceChildren();
 const empty=$el("option","","Todos los temas");empty.value="";$("category").append(empty);
 for(const cat of cats){const opt=$el("option","",cat);opt.value=cat;$("category").append(opt)}
 if(cats.includes(selectedCat))$("category").value=selectedCat;
}
function lock(value){busy=value;countSelected()}
async function submit(e){
 e.preventDefault();if(busy||selected.size===0)return;
 if(!$("signForm").reportValidity())return;
 if(!$("consent").checked){$("feedback").textContent="Necesitamos tu autorización para registrar los apoyos.";return}
 $("feedback").textContent="";
 const ids=[...selected];
 const payload={name:$("signerName").value.trim(),email:$("signerEmail").value.trim(),country:$("signerCountry").value.trim(),message:$("signerMessage").value.trim(),causeIds:ids,readAndAuthorized:true,privacyAccepted:true,website:$("website").value};
 lock(true);
 try{
  const response=await fetch(API+"/api/firmar",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(payload)});
  const data=await response.json();
  if(!response.ok)throw new Error(data.error||"No pudimos registrar las adhesiones. Reintentá.");
  const deliveredIds=new Set((data.recorded||[]).map(x=>x.causeId));
  if(!data.receiptId||!/^[a-f0-9]{64}$/.test(data.receiptToken||"")||deliveredIds.size!==ids.length||ids.some(id=>!deliveredIds.has(id)))throw new Error("El comprobante no corresponde a todas las causas.");
  receipt={receiptId:data.receiptId,receiptToken:data.receiptToken,causes:ids,date:new Date().toISOString()};
  try{const previous=JSON.parse(localStorage.getItem(receiptKey)||"[]");localStorage.setItem(receiptKey,JSON.stringify([receipt,...previous].slice(0,20)))}catch{}
  showSuccess();
 }catch(err){$("feedback").textContent=err instanceof Error?err.message:"No pudimos completar el registro."}
 finally{lock(false)}
}
function showSuccess(){
 $("successCount").textContent=receipt.causes.length;
 $("receiptId").textContent=receipt.receiptId;
 $("receiptMeta").textContent=new Date(receipt.date).toLocaleString("es-AR");
 const area=$("receiptCauses");area.replaceChildren();
 for(const id of receipt.causes){const c=connected.get(id);if(c)area.append($el("span","",c.title))}
 $("success").hidden=false;$("causas").hidden=true;$("success").scrollIntoView({behavior:"smooth"});
}
function reset(){
 selected.clear();$("causas").hidden=false;$("success").hidden=true;
 $("consent").checked=false;
 for(const id of ["signerName","signerEmail","signerCountry","signerMessage"])$(id).value="";
 $("feedback").textContent="";$("revoke").hidden=false;$("revokeStatus").textContent="";receipt=null;
 renderCats();countSelected();filterCatalog();window.scrollTo({top:0,behavior:"smooth"});
}
async function revoke(){
 if(!receipt||busy)return;
 $("revoke").disabled=true;$("revokeStatus").textContent="Solicitando eliminación…";
 try{
  const r=await fetch(API+"/api/revocar",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({receiptToken:receipt.receiptToken})});
  const d=await r.json();if(!r.ok||!d.revoked)throw new Error(d.error||"No pudimos confirmar la eliminación");
  try{const all=JSON.parse(localStorage.getItem(receiptKey)||"[]");localStorage.setItem(receiptKey,JSON.stringify(all.filter(x=>x.receiptId!==receipt.receiptId)))}catch{}
  $("revokeStatus").textContent="Tu registro fue eliminado.";$("revoke").hidden=true;
 }catch(err){$("revokeStatus").textContent=err instanceof Error?err.message:"No pudimos completar la eliminación."}
 finally{$("revoke").disabled=false}
}
async function init(){
 $("signForm").addEventListener("submit",submit);
 $("signAgain").addEventListener("click",reset);$("revoke").addEventListener("click",revoke);
 $("copyReceipt").addEventListener("click",async()=>{
  if(!receipt)return;
  try{await navigator.clipboard.writeText("UnGesto — "+receipt.receiptId+" — "+receipt.causes.length+" causas");$("copyReceipt").textContent="Copiado ✓"}catch{$("copyReceipt").textContent="No pudimos copiarlo"}
 });
 $("search").addEventListener("input",()=>filterCatalog());
 $("category").addEventListener("change",()=>filterCatalog());
 $("more").addEventListener("click",()=>filterCatalog(false));
 for(const button of document.querySelectorAll("[data-mode]")){
  button.addEventListener("click",()=>{mode=button.dataset.mode;for(const b of document.querySelectorAll("[data-mode]"))b.classList.toggle("active",b===button);renderCats();filterCatalog()});
 }
 $("selectAll").addEventListener("click",()=>{for(const c of filtered)if(c.kind==="connected")selected.add(c.id);countSelected();filterCatalog()});
 $("clearAll").addEventListener("click",()=>{selected.clear();countSelected();filterCatalog()});
 try{
  const r=await fetch("/operable-causes.json",{cache:"no-store"});if(!r.ok)throw new Error("No se pudieron cargar las causas");
  const manifest=await r.json();if(!Array.isArray(manifest.causes)||manifest.causes.length!==20)throw new Error("El catálogo firmable no está listo");
  for(const c of manifest.causes)connected.set(c.id,c);
  all=manifest.causes.map(c=>decorated({...c,category:c.category||"Otros"}));
  countSelected();renderCats();filterCatalog();
  Promise.all([
   fetch("/catalog/causes.json").then(r=>r.ok?r.json():null).catch(()=>null),
   fetch("/data/uk-petitions.json").then(r=>r.ok?r.json():null).catch(()=>null),
   fetch("/data/catalog-stats.json").then(r=>r.ok?r.json():null).catch(()=>null)
  ]).then(([curated,uk,stats])=>{
   if(Array.isArray(curated?.causes)){
    for(const c of curated.causes)if(!connected.has(c.id)&&!sourceById.has(c.id)){
     const v=decorated({id:c.id,title:c.title,summary:c.description,source:c.source_url,statement:c.consent_text,organization:c.organization,category:c.category});
     sourceById.set(v.id,v);
    }
   }
   if(Array.isArray(uk?.records)){
    for(const c of uk.records){
     if(!c.id||sourceById.has(c.id))continue;
     sourceById.set(c.id,decorated({id:c.id,title:c.title,summary:c.description,category:c.category||"Otros",source:c.url,organization:"Parlamento británico",geography:"GB"}));
    }
   }
   all=[...manifest.causes.map(c=>decorated(c)),...sourceById.values()];
   $("metricCatalog").textContent=all.length.toLocaleString("es-AR");
   $("tabAll").textContent=all.length.toLocaleString("es-AR");
   $("tabConnected").textContent=connected.size;
   $("metricConnected").textContent=connected.size;
   renderCats();filterCatalog();
  });
 }catch(err){$("visibleCount").textContent="No pudimos cargar el catálogo. Actualizá la página.";$("signButton").disabled=true}
}
init();
})();