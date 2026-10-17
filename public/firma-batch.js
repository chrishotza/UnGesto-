(()=>{"use strict";
const $=id=>document.getElementById(id);
const API=location.hostname==="ungesto-firma-batch.onrender.com"?"":"https://ungesto-firma-batch.onrender.com";
const selected=new Set(),cards=new Map();let causes=[],receipt=null,busy=false;
const receiptKey="ungesto_batch_receipts_v1";
const make=(tag,cls,content)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(content!==undefined)e.textContent=content;return e;};
const openSource=url=>{try{const u=new URL(url);if(u.protocol!=="https:")return null;return u.href}catch{return null}};
function causeCard(c){
 const box=make("article","cause"),label=make("label","causeHead"),cb=document.createElement("input");
 cb.type="checkbox";cb.value=c.id;cb.setAttribute("aria-label","Apoyar: "+c.title);
 cb.addEventListener("change",()=>{if(cb.checked)selected.add(c.id);else selected.delete(c.id);box.classList.toggle("chosen",cb.checked);renderCount()});
 const inner=make("div");inner.append(make("div","causeOrg",c.organization),make("h3","",c.title),make("p","",c.summary));
 label.append(cb,inner);box.append(label);
 const more=document.createElement("details"),summary=make("summary","","Leer el pedido y su fuente");more.append(summary,make("p","",c.statement));
 const url=openSource(c.source);
 if(url){const a=make("a","","Ver fuente original ↗");a.href=url;a.target="_blank";a.rel="noopener noreferrer";more.append(a)}
 box.append(more);cards.set(c.id,{box,cb});return box;
}
function renderCount(){
 const n=selected.size;$("countTop").textContent=n;$("countForm").textContent=n;
 $("signButton").textContent=n===0?"Elegí al menos una causa":"Registrar mi firma para "+n+(n===1?" causa":" causas");
 $("signButton").disabled=!n||busy;
}
function visible(){const q=$("search").value.trim().toLowerCase(),cat=$("category").value;return causes.filter(c=>(!cat||c.category===cat)&&(!q||[c.title,c.summary,c.organization,c.category].some(v=>v.toLowerCase().includes(q))))}
function applyFilters(){const ids=new Set(visible().map(c=>c.id));for(const c of causes)cards.get(c.id).box.hidden=!ids.has(c.id);$("visibleCount").textContent=ids.size+" disponibles"}
function lock(b){busy=b;renderCount();$("signButton").textContent=b?"Registrando tus apoyos…":$("signButton").textContent}
async function submit(e){
 e.preventDefault();if(busy||!selected.size)return;
 const form=$("signForm");if(!form.reportValidity())return;
 const payload={name:$("signerName").value.trim(),email:$("signerEmail").value.trim(),country:$("signerCountry").value.trim(),message:$("signerMessage").value.trim(),causeIds:causes.filter(c=>selected.has(c.id)).map(c=>c.id),readAndAuthorized:$("consent").checked,privacyAccepted:$("consent").checked,website:$("website").value};
 if(!payload.readAndAuthorized){$("feedback").textContent="Autorizá el registro de los apoyos antes de firmar.";return}
 $("feedback").textContent="";lock(true);
 try{
  const response=await fetch(API+"/api/firmar",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(payload)});
  const result=await response.json();
  if(!response.ok)throw Error(result.error||"No se pudo registrar tu firma.");
  if(!Array.isArray(result.recorded)||result.recorded.length!==payload.causeIds.length)throw Error("El comprobante no coincide con tus causas");
  receipt={receiptId:result.receiptId,receiptToken:result.receiptToken,causes:result.recorded.map(x=>x.causeId),date:new Date().toISOString()};
  try{const existing=JSON.parse(localStorage.getItem(receiptKey)||"[]");localStorage.setItem(receiptKey,JSON.stringify([receipt,...existing].slice(0,20)))}catch{}
  showSuccess();
 }catch(err){$("feedback").textContent=err instanceof Error?err.message:"Ocurrió un error. Reintentá."}
 finally{lock(false)}
}
function showSuccess(){
 const n=receipt.causes.length;$("successCount").textContent=n+" causas.";
 $("receiptId").textContent=receipt.receiptId;
 $("receiptMeta").textContent="Registrado en UnGesto el "+new Date(receipt.date).toLocaleString("es-AR");
 $("receiptCauses").replaceChildren();
 for(const id of receipt.causes){const c=causes.find(c=>c.id===id);if(c)$("receiptCauses").append(make("span","",c.title));}
 $("success").hidden=false;$("causeSection").hidden=true;$("signPanel").hidden=true;
 $("success").scrollIntoView({behavior:"smooth",block:"start"});
}
function reset(){
 selected.clear();for(const x of cards.values()){x.cb.checked=false;x.box.classList.remove("chosen")}
 $("success").hidden=true;$("causeSection").hidden=false;$("signPanel").hidden=false;
 $("consent").checked=false;$("signerName").value="";$("signerEmail").value="";$("signerMessage").value="";
 $("feedback").textContent="";receipt=null;renderCount();window.scrollTo({top:0,behavior:"smooth"});
}
async function revoke(){
 if(!receipt||busy)return;
 $("revoke").disabled=true;$("revokeStatus").textContent="Procesando eliminación…";
 try{
  const response=await fetch(API+"/api/revocar",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({receiptToken:receipt.receiptToken})});
  const data=await response.json();if(!response.ok||!data.revoked)throw Error(data.error||"No se pudo verificar la eliminación");
  try{const all=JSON.parse(localStorage.getItem(receiptKey)||"[]");localStorage.setItem(receiptKey,JSON.stringify(all.filter(x=>x.receiptId!==receipt.receiptId)))}catch{}
  $("revokeStatus").textContent="El registro fue eliminado."; $("revoke").hidden=true;
 }catch(err){$("revokeStatus").textContent=err instanceof Error?err.message:"No pudimos completar la eliminación."}
 finally{$("revoke").disabled=false}
}
async function start(){
 $("signForm").addEventListener("submit",submit);
 $("selectAll").addEventListener("click",()=>{for(const c of visible()){selected.add(c.id);const k=cards.get(c.id);k.cb.checked=true;k.box.classList.add("chosen")}renderCount()});
 $("clearAll").addEventListener("click",()=>{selected.clear();for(const k of cards.values()){k.cb.checked=false;k.box.classList.remove("chosen")}renderCount()});
 $("search").addEventListener("input",applyFilters);$("category").addEventListener("change",applyFilters);
 $("copyReceipt").addEventListener("click",async()=>{if(!receipt)return;const str="UnGesto — registro "+receipt.receiptId+" — "+receipt.causes.length+" causas";try{await navigator.clipboard.writeText(str);$("copyReceipt").textContent="Copiado ✓"}catch{$("copyReceipt").textContent="Copialo manualmente"}});
 $("signAgain").addEventListener("click",reset);$("revoke").addEventListener("click",revoke);
 try{
  const response=await fetch("/operable-causes.json",{cache:"no-store"});if(!response.ok)throw Error("Catálogo no disponible");
  const data=await response.json();if(!Array.isArray(data.causes)||data.causes.length!==20)throw Error("Catálogo pendiente de actualización");
  causes=data.causes;const f=document.createDocumentFragment();for(const c of causes)f.append(causeCard(c));$("causes").append(f);
  for(const cat of [...new Set(causes.map(c=>c.category))].sort()){const o=make("option","",cat);o.value=cat;$("category").append(o)}
  applyFilters();renderCount();
 }catch(err){$("feedback").textContent="No pudimos cargar las causas. Recargá la página."}
}
start();
})();