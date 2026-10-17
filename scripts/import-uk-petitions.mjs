import {mkdir, readFile, writeFile} from "node:fs/promises";
import {fileURLToPath} from "node:url";

export const API_ORIGIN = "https://petition.parliament.uk";
const BASE = API_ORIGIN + "/petitions.json?state=open&page=";
const todayUTC = () => new Date().toISOString().slice(0,10);

export function classify(title, background) {
  const t = (title + " " + background).toLowerCase();
  if (/\b(animal|cat|dog|horse|wildlife|pet|vet|bird|fox|fish|elephant)\b/.test(t)) return "Animales";
  if (/\b(water|climate|environment|pollution|plastic|recycl|forest|nature|sewage|emission|carbon|air quality)\b/.test(t)) return "Ambiente";
  if (/\b(school|student|teacher|education|university|childcare)\b/.test(t)) return "Educación";
  if (/\b(hospital|health|nhs|medicine|cancer|mental health|disabilit|care home)\b/.test(t)) return "Salud";
  if (/\b(housing|rent|homeless|tenant|homeowner)\b/.test(t)) return "Vivienda";
  if (/\b(transport|rail|bus|road|vehicle|train)\b/.test(t)) return "Transporte";
  return "Otros";
}

export function parseCampaign(record, now=todayUTC()) {
 if (record?.type !== "petition" || !Number.isSafeInteger(Number(record.id))) return null;
 const a=record.attributes||{};
 if (a.state !== "open" || a.closed_at) return null;
 if (typeof a.closing_date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(a.closing_date) || a.closing_date < now) return null;
 const id=Number(record.id);
 const title=String(a.action||"").trim();
 const body=String(a.background||"").trim();
 if (!title || title.length>400 || !body || body.length>15000) return null;
 const source=API_ORIGIN+"/petitions/"+id;
 const signatures=Number.isSafeInteger(a.signature_count)&&a.signature_count>=0?a.signature_count:0;
 return {
  id:"uk-parliament-"+id, provider_id:String(id), source:"UK Parliament Petitions",
  title, description:body, further_details:String(a.additional_details||"").slice(0,4000),
  category:classify(title,body), url:source, source_api:source+".json",
  status:"open", closing_date:a.closing_date, signature_count:signatures,
  eligibility:"british_citizen_or_uk_resident", geography:"GB",
  signing_channel:"official_hosted_petition", newsletter_opt_in:"choice_on_provider",
  language:"en", created_at:a.created_at||null, updated_at:a.updated_at||null
 };
}

function pageURL(page) {return BASE + String(page);}
export async function loadPage(page,{fetchImpl=fetch}={}) {
 if (!Number.isSafeInteger(page)||page<1||page>250) throw Error("Out of permitted page range");
 let last;
 for(let attempt=0;attempt<3;attempt++){
  const ctl=new AbortController();const timeout=setTimeout(()=>ctl.abort(),24000);
  try{
   const response=await fetchImpl(pageURL(page),{
    headers:{"accept":"application/json","user-agent":"UnGestoCatalogIndexer/1.0 (+https://github.com/chrishotza/UnGesto-)"},
    signal:ctl.signal,redirect:"error"});
   if(!response.ok) throw Error("HTTP "+response.status+" on page "+page);
   const data=await response.json();
   if(!Array.isArray(data?.data)||typeof data?.links?.last!=="string")throw Error("Invalid JSON API page");
   return data;
  } catch(e){last=e; if(attempt<2)await new Promise(r=>setTimeout(r,300*(attempt+1))); }
  finally{clearTimeout(timeout);}
 }
 throw last;
}
export function pageCount(first){
 const u=new URL(first.links.last);
 if(u.protocol!=="https:"||u.hostname!=="petition.parliament.uk")throw Error("Untrusted last URL");
 const n=Number(u.searchParams.get("page")||"1");
 if(!Number.isSafeInteger(n)||n<1||n>250)throw Error("Unexpected page count: "+n);
 return n;
}
export async function importAll({fetchImpl=fetch,now=todayUTC(),maxPages=250}={}){
 const first=await loadPage(1,{fetchImpl});
 const total=pageCount(first);
 if(total>maxPages)throw Error("Configured maxPages too low: "+total);
 const pages=new Array(total);pages[0]=first.data; let cursor=2;
 async function worker(){
  for(;;){const p=cursor++;if(p>total)return;const doc=await loadPage(p,{fetchImpl});pages[p-1]=doc.data;}
 }
 await Promise.all(Array.from({length:Math.min(4,total-1)},()=>worker()));
 const all=pages.flat(),byId=new Map();
 for(const row of all){
  const c=parseCampaign(row,now);if(c)byId.set(c.id,c);
 }
 const petitions=[...byId.values()].sort((a,b)=>b.signature_count-a.signature_count||a.id.localeCompare(b.id));
 return {
  source:BASE+"1",source_updated_at:new Date().toISOString(),
  eligibility:"Only British citizens or UK residents may sign; others may browse.",
  country:"GB",source_pages:total,source_rows:all.length,eligible_open_records:petitions.length,
  records:petitions
 };
}
const invoked=process.argv[1] && fileURLToPath(import.meta.url)===process.argv[1];
if(invoked){
 const result=await importAll();
 if(result.source_rows===0||result.records.length===0)throw Error("Empty index refused; preserved previous data");
 const out=new URL("../public/data/",import.meta.url);
 await mkdir(out,{recursive:true});
 await writeFile(new URL("uk-petitions.json",out),JSON.stringify(result,null,2)+"\n");
 const local=JSON.parse(await readFile(new URL("../catalog/causes.json",import.meta.url),"utf8"));
 const stats={
  generated_at:result.source_updated_at,local_curated:local.causes.length,
  uk_official_active:result.records.length,
  total_distinct:local.causes.length+result.records.length,
  uk_api_pages:result.source_pages,
  uk_requirement:"british_citizen_or_uk_resident",
  signature_delivery_claims:"none"
 };
 await writeFile(new URL("catalog-stats.json",out),JSON.stringify(stats,null,2)+"\n");
 console.log(JSON.stringify(stats));
}
