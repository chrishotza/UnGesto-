#!/usr/bin/env node
/** Daily public URL audit: no petition submissions, no personal data. */
import {readFile,mkdir,writeFile} from "node:fs/promises";
import {validateCatalog,probeCause} from "../integrations/catalog.mjs";
const data=JSON.parse(await readFile(new URL("../catalog/causes.json",import.meta.url),"utf8"));
const validation=validateCatalog(data);
const results=new Array(data.causes.length);let next=0;
async function worker(){
  for(;;){
    const index=next++;if(index>=data.causes.length)return;
    const c=data.causes[index];
    results[index]=await probeCause(c,{signal:AbortSignal.timeout(15000)});
  }
}
await Promise.all(Array.from({length:4},worker));
const timestamp=new Date().toISOString();
const summary={checked_at:timestamp,catalog_count:validation.count,note:"HTTP source audit. Reachability does not verify that a petition accepts signatures.",results};
await mkdir(new URL("../artifacts/",import.meta.url),{recursive:true});
await writeFile(new URL("../artifacts/catalog-health.json",import.meta.url),JSON.stringify(summary,null,2)+"\n");
const counts={};for(const x of results)counts[x.result]=(counts[x.result]||0)+1;
const lines=["# UnGesto — revisión automática de fuentes","","Fecha UTC: "+timestamp,"",
"Esta comprobación **no** equivale a una firma aceptada ni certifica que la campaña siga abierta.","",
"**Totales:** "+Object.entries(counts).map(([k,v])=>k+": "+v).join(", "), "",
"| Causa | Resultado | HTTP | Revisión |","|---|---|---:|---|",
...results.map(x=>"| "+x.id+" | "+x.result+" | "+(x.http_status??"-")+" | "+x.detail.replace(/\|/g,"/")+" |"),""];
await writeFile(new URL("../artifacts/catalog-health.md",import.meta.url),lines.join("\n"));
console.log(JSON.stringify({checked_at:timestamp,counts,catalog_count:validation.count,needs_review:results.filter(x=>x.result!=="reachable")}));
