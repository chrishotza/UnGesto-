(function(){
 "use strict";
 const el=id=>document.getElementById(id);
 const state={records:[],filtered:[],shown:0,loaded:false};
 const number=new Intl.NumberFormat("es-AR");
 const dateText=raw=>{
   const p=String(raw||"").split("-");
   return p.length===3 ? p[2]+"/"+p[1]+"/"+p[0] : "—";
 };
 function safeProviderUrl(raw){
  try{const u=new URL(raw);if(u.protocol!=="https:"||u.hostname!=="petition.parliament.uk"||!/^\/petitions\/\d+$/.test(u.pathname))return null;return u.href}
  catch{return null}
 }
 function card(item){
  const article=document.createElement("article");article.className="ukCard";
  const meta=document.createElement("div");meta.className="ukMeta";
  const kind=document.createElement("span");kind.className="ukCategory";kind.textContent=item.category||"Otros";
  const close=document.createElement("span");close.textContent="Cierra: "+dateText(item.closing_date);
  meta.append(kind,close);
  const title=document.createElement("h3");title.textContent=item.title;
  const desc=document.createElement("p");desc.textContent=(item.description||"").slice(0,330)+(item.description?.length>330?"…":"");
  const count=document.createElement("p");count.textContent=number.format(item.signature_count||0)+" firmas en Parlamento británico";
  const act=document.createElement("div");act.className="ukAction";
  const href=safeProviderUrl(item.url);
  if(href){
   const source=document.createElement("a");source.href=href;source.target="_blank";source.rel="noopener noreferrer";source.textContent="Ver petición oficial ↗";act.append(source);
   if(el("ukEligible").checked){
    const sign=document.createElement("a");sign.href=href;sign.target="_blank";sign.rel="noopener noreferrer";sign.className="signEligible";sign.textContent="Firmar en el Parlamento ↗";act.append(sign);
   }else{
    const locked=document.createElement("span");locked.className="locked";locked.textContent="Firma exclusiva para ciudadanía o residencia británica";act.append(locked);
   }
  }
  article.append(meta,title,desc,count,act);return article;
 }
 function render(reset){
  if(reset){state.shown=0;el("ukCards").replaceChildren();}
  const limit=Math.min(state.filtered.length,state.shown+30);
  const fragment=document.createDocumentFragment();
  for(let i=state.shown;i<limit;i++)fragment.append(card(state.filtered[i]));
  el("ukCards").append(fragment);state.shown=limit;
  el("ukMore").hidden=state.shown>=state.filtered.length;
  el("ukStatus").textContent=number.format(state.filtered.length)+" peticiones encontradas · "+number.format(state.shown)+" visibles";
 }
 function filter(){
  const term=el("ukSearch").value.trim().toLocaleLowerCase("en");
  const category=el("ukCategory").value;
  state.filtered=state.records.filter(c=>(!category||c.category===category)&&(!term||c.title.toLowerCase().includes(term)||c.description.toLowerCase().includes(term)));
  if(el("ukSort").value==="closing")state.filtered.sort((a,b)=>a.closing_date.localeCompare(b.closing_date)||b.signature_count-a.signature_count);
  else state.filtered.sort((a,b)=>b.signature_count-a.signature_count);
  render(true);
 }
 async function load(){
  try{
   const res=await fetch("/data/uk-petitions.json",{cache:"no-store"});
   if(!res.ok)throw new Error("HTTP "+res.status);
   const data=await res.json();if(!Array.isArray(data.records))throw new Error("Malformed provider feed");
   state.records=data.records.filter(c=>c.status==="open"&&c.eligibility==="british_citizen_or_uk_resident"&&safeProviderUrl(c.url));
   state.loaded=true;
   const cats=[...new Set(state.records.map(c=>c.category||"Otros"))].sort();
   for(const name of cats){const op=document.createElement("option");op.value=name;op.textContent=name;el("ukCategory").append(op);}
   try{
    const st=await fetch("/data/catalog-stats.json",{cache:"no-store"}).then(r=>r.json());
    el("libraryCount").textContent=number.format(st.total_distinct)+" peticiones documentadas · "+number.format(st.uk_official_active)+" de fuente oficial";
   }catch{el("libraryCount").textContent=number.format(state.records.length)+" peticiones del Parlamento británico";}
   filter();
  }catch(e){
   el("ukStatus").textContent="El catálogo masivo todavía no está disponible en este servidor. Las causas curadas siguen accesibles arriba.";
   el("libraryCount").textContent="Catálogo masivo en actualización";
  }
 }
 let debounce=0;
 el("ukSearch").addEventListener("input",()=>{clearTimeout(debounce);debounce=setTimeout(filter,130)});
 el("ukCategory").addEventListener("change",filter);
 el("ukSort").addEventListener("change",filter);
 el("ukEligible").addEventListener("change",()=>{if(state.loaded)render(true)});
 el("ukMore").addEventListener("click",()=>render(false));
 load();
})();