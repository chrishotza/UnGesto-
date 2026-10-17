import {createServer} from "node:http";
import {createReadStream,existsSync,readFileSync,statSync} from "node:fs";
import {resolve,sep,extname} from "node:path";
import {fileURLToPath,pathToFileURL} from "node:url";

const ROOT=resolve(fileURLToPath(new URL("./public/",import.meta.url)));
const manifest=JSON.parse(readFileSync(resolve(ROOT,"operable-causes.json"),"utf8"));
const ids=new Set(manifest.causes.map(c=>c.id));
const TRUSTED_ORIGINS=new Set(["https://ungesto-firmas-oficiales.onrender.com","https://ungesto-firma-batch.onrender.com"]);
const API="https://ungesto-solidario.floot.app";
const hits=new Map();
const MAX_BYTES=12000;
const MIME={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",".css":"text/css; charset=utf-8",".json":"application/json; charset=utf-8",".svg":"image/svg+xml",".sqlite":"application/vnd.sqlite3",".png":"image/png",".ico":"image/x-icon"};

export function validateBatch(input){
 if(!input||typeof input!=="object"||Array.isArray(input))throw Error("Solicitud incorrecta");
 const name=String(input.name||"").trim(),email=String(input.email||"").trim().toLowerCase();
 const country=String(input.country||"").trim(),message=String(input.message||"").trim();
 const selected=input.causeIds;
 if(input.website)throw Error("Solicitud inválida");
 if(name.length<3||name.length>120)throw Error("Ingresá tu nombre");
 if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||email.length>254)throw Error("Ingresá un correo válido");
 if(country.length>80||message.length>1000)throw Error("Revisá la longitud del mensaje");
 if(!Array.isArray(selected)||selected.length===0||selected.length>20||new Set(selected).size!==selected.length||selected.some(id=>!ids.has(id)))throw Error("Revisá las causas seleccionadas");
 if(input.readAndAuthorized!==true||input.privacyAccepted!==true)throw Error("Necesitamos tu autorización para registrar cada apoyo");
 return {name,email,country,message,causeIds:selected,readAndAuthorized:true,privacyAccepted:true};
}
export function validateRevoke(input){
 const token=input?.receiptToken;
 if(typeof token!=="string"||!/^[a-f0-9]{64}$/.test(token))throw Error("Comprobante inválido");
 return {receiptToken:token};
}
export async function forwardToFloot(resource,body,{fetchImpl=fetch}={}){
 const controller=new AbortController();
 const timeout=setTimeout(()=>controller.abort(),24000);
 try {
  // Floot expects superjson.stringify; with ordinary strings/bools it is {"json":body}.
  const response=await fetchImpl(API+resource,{method:"POST",redirect:"error",signal:controller.signal,headers:{"content-type":"application/json","accept":"application/json"},body:JSON.stringify({json:body})});
  const raw=await response.text();
  let out;try{out=JSON.parse(raw)}catch{throw Error("Respuesta del registro inválida");}
  const data=out?.json||out;
  if(!response.ok)throw Object.assign(new Error(data?.error||"No pudimos registrar los apoyos"),{status:response.status});
  if(resource==="/_api/endorsements"){
   if(!Array.isArray(data?.recorded)||data.recorded.length!==body.causeIds.length||!data.receiptId||!/^[a-f0-9]{64}$/.test(data.receiptToken||""))throw Error("No pudimos verificar el comprobante del registro");
   const actual=new Set(data.recorded.map(c=>c.causeId));
   if(body.causeIds.some(id=>!actual.has(id)))throw Error("El receptor interno devolvió causas diferentes");
  }
  return data;
 } finally{clearTimeout(timeout);}
}
export function allowedOrigin(origin){
 return !origin||TRUSTED_ORIGINS.has(origin);
}
function cors(req,res){
 const origin=req.headers.origin;
 if(origin && TRUSTED_ORIGINS.has(origin)){
  res.setHeader("Access-Control-Allow-Origin",origin);
  res.setHeader("Vary","Origin");
  res.setHeader("Access-Control-Allow-Methods","POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers","Content-Type");
 }
}
function json(res,code,payload){
 res.writeHead(code,{"Content-Type":"application/json; charset=utf-8","Cache-Control":"no-store","X-Content-Type-Options":"nosniff"});
 res.end(JSON.stringify(payload));
}
function rate(req){
 const key=(req.headers["x-forwarded-for"]||req.socket.remoteAddress||"unknown").toString().split(",")[0].slice(0,64);
 const now=Date.now();
 if(hits.size>5000)hits.clear();
 const prev=(hits.get(key)||[]).filter(t=>now-t<3600000);
 if(prev.length>=10)return false;
 prev.push(now);hits.set(key,prev);return true;
}
async function readJSON(req){
 let raw="",len=0;
 for await(const part of req){
  len+=part.length;
  if(len>MAX_BYTES)throw Object.assign(new Error("Solicitud demasiado grande"),{status:413});
  raw+=part.toString("utf8");
 }
 try{return JSON.parse(raw)}catch{throw Error("Formato JSON incorrecto")}
}
export async function handler(req,res){
 cors(req,res);
 const origin=req.headers.origin;
 if(!allowedOrigin(origin)){json(res,403,{error:"Origen no admitido"});return;}
 if(req.method==="OPTIONS"){res.writeHead(204);res.end();return;}
 let pathname;
 try{pathname=decodeURIComponent(new URL(req.url||"/","http://localhost").pathname)}catch{json(res,400,{error:"Ruta inválida"});return;}
 if(pathname==="/api/health"&&req.method==="GET"){
  json(res,200,{ok:true,signable_causes:ids.size,upstream:"Floot first-party receipts",external_delivery:"not_available"});return;
 }
 if(pathname==="/api/firmar"||pathname==="/api/revocar"){
  if(req.method!=="POST"){json(res,405,{error:"Método no admitido"});return;}
  if(!req.headers["content-type"]?.startsWith("application/json")){json(res,415,{error:"Se requiere JSON"});return;}
  if(!rate(req)){json(res,429,{error:"Demasiados intentos por ahora"});return;}
  try{
   const raw=await readJSON(req);
   const revoke=pathname==="/api/revocar";
   const input=revoke?validateRevoke(raw):validateBatch(raw);
   const data=await forwardToFloot(revoke?"/_api/revoke-endorsements":"/_api/endorsements",input);
   json(res,revoke?200:201,data);
  }catch(err){
   const status=Number(err?.status)||400;
   json(res,status>=400&&status<500?status:502,{error:err?.message||"No pudimos completar la solicitud"});
  }return;
 }
 if(req.method!=="GET"&&req.method!=="HEAD"){json(res,405,{error:"Método no admitido"});return;}
 if(pathname==="/")pathname="/firma-batch.html";
 if(pathname.includes("\0")||pathname.includes("\\")||pathname.split("/").includes("..")){json(res,400,{error:"Ruta inválida"});return;}
 const filepath=resolve(ROOT,"."+pathname);
 if(!filepath.startsWith(ROOT+sep)){json(res,403,{error:"Ruta no autorizada"});return;}
 try{
  if(!existsSync(filepath)||!statSync(filepath).isFile()){json(res,404,{error:"No encontrado"});return;}
  const ext=extname(filepath);
  res.writeHead(200,{"Content-Type":MIME[ext]||"application/octet-stream","Cache-Control":ext===".html"?"no-store":"public, max-age=300","X-Content-Type-Options":"nosniff","Referrer-Policy":"strict-origin-when-cross-origin","X-Frame-Options":"DENY"});
  if(req.method==="HEAD")res.end();else createReadStream(filepath).pipe(res);
 }catch{json(res,500,{error:"Archivo no disponible"});}
}
if(process.argv[1]&&pathToFileURL(resolve(process.argv[1])).href===import.meta.url){
 const port=Number(process.env.PORT||10000);
 createServer((req,res)=>{handler(req,res).catch(()=>json(res,500,{error:"Fallo interno"}));}).listen(port,"0.0.0.0",()=>console.log("UnGesto batch API ready"));
}
