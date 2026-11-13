import test from "node:test";
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import {validateBatch,validateRevoke,forwardToFloot,allowedOrigin,readJSON,handler} from "../server.mjs";
import {Readable} from "node:stream";
const manifest=JSON.parse(await readFile(new URL("../public/operable-causes.json",import.meta.url),"utf8"));
const ids=manifest.causes.map(x=>x.id);
const valid={name:"Persona de ejemplo",email:"ejemplo@example.com",country:"AR",message:"Apoyo estas causas",causeIds:ids,readAndAuthorized:true,privacyAccepted:true};
test("exactly 20 real first-party causes, unique source and consent statements",()=>{
 assert.equal(ids.length,20);assert.equal(new Set(ids).size,20);
 for(const c of manifest.causes){assert.ok(c.statement.length>30);assert.ok(c.source.startsWith("https://"));assert.ok(c.organization);}
});
test("one form accepts 20 chosen causes but not unselected/new third-party causes",()=>{
 assert.equal(validateBatch(valid).causeIds.length,20);
 assert.equal(validateBatch({...valid,causeIds:ids.slice(0,3)}).causeIds.length,3);
 assert.throws(()=>validateBatch({...valid,causeIds:[...ids,"an-patty-sanctuary"]}),/Revisá/);
 assert.throws(()=>validateBatch({...valid,causeIds:[]}),/Revisá/);
 assert.throws(()=>validateBatch({...valid,causeIds:[ids[0],ids[0]]}),/Revisá/);
});
test("explicit consent and validation are mandatory",()=>{
 assert.throws(()=>validateBatch({...valid,privacyAccepted:false}),/autorización/);
 assert.throws(()=>validateBatch({...valid,readAndAuthorized:false}),/autorización/);
 assert.throws(()=>validateBatch({...valid,website:"spam"}),/inválida/);
 assert.throws(()=>validateBatch({...valid,email:"invalid"}),/correo/);
});
test("proxy sends SuperJSON body once and demands a receipt per cause",async()=>{
 let calls=0;
 const response={json:{receiptId:"test_receipt",receiptToken:"a".repeat(64),recorded:ids.map(causeId=>({causeId,status:"recorded_in_ungesto",externalStatus:"not_sent"}))}};
 const data=await forwardToFloot("/_api/endorsements",valid,{fetchImpl:async(url,options)=>{
  calls++;assert.equal(options.method,"POST");assert.equal(JSON.parse(options.body).json.causeIds.length,20);
  assert.equal(url,"https://ungesto-solidario.floot.app/_api/endorsements");
  return {ok:true,text:async()=>JSON.stringify(response)};
 }});
 assert.equal(calls,1);assert.equal(data.recorded.length,20);
});
test("a fake receipt is never marked recorded",async()=>{
 await assert.rejects(forwardToFloot("/_api/endorsements",valid,{fetchImpl:async()=>({ok:true,text:async()=>JSON.stringify({json:{recorded:[],receiptToken:"a".repeat(64)}})})}),/comprobante/);
});
test("deletion requires possession of the exact token",()=>{
 assert.deepEqual(validateRevoke({receiptToken:"f".repeat(64)}),{receiptToken:"f".repeat(64)});
 assert.throws(()=>validateRevoke({receiptToken:"bad"}));
});
test("CORS origin is limited to the deployed frontends",()=>{
 assert.equal(allowedOrigin("https://ungesto-firmas-oficiales.onrender.com"),true);
 assert.equal(allowedOrigin("https://evil.invalid"),false);
});

test("JSON receiver preserves UTF-8 characters split across network chunks",async()=>{
 const original={name:"María 💚 Ñandú",message:"Apoyo la protección del río 🌊"};
 const bytes=Buffer.from(JSON.stringify(original),"utf8");
 const emojiStart=bytes.indexOf(Buffer.from("💚","utf8"));
 assert.ok(emojiStart>0);
 const chunks=[
  bytes.subarray(0,emojiStart+1),
  bytes.subarray(emojiStart+1,emojiStart+3),
  bytes.subarray(emojiStart+3),
 ];
 const parsed=await readJSON(Readable.from(chunks));
 assert.deepEqual(parsed,original);
});

test("JSON receiver still rejects payloads above the 12 KiB boundary",async()=>{
 const chunks=[Buffer.alloc(7000,0x20),Buffer.alloc(6000,0x20)];
 await assert.rejects(readJSON(Readable.from(chunks)),err=>err.status===413);
});


test("receipts cannot conceal failed or non-registered cause statuses",async()=>{
 const recorded=ids.map(causeId=>({causeId,status:"recorded_in_ungesto",externalStatus:"not_sent"}));
 for(const changes of [{status:"failed"},{externalStatus:"accepted_by_destination"},{status:undefined,externalStatus:undefined}]){
  const response={receiptId:"test-only",receiptToken:"b".repeat(64),
   recorded:recorded.map((item,index)=>index===0?{...item,...changes}:item)};
  await assert.rejects(
   forwardToFloot("/_api/endorsements",valid,{fetchImpl:async()=>({ok:true,
     text:async()=>JSON.stringify({json:response})})}),
   /confirmar el registro interno/
  );
 }
});

test("private static database and dotfile URLs are always denied",async()=>{
 const names=["/data.sqlite","/data.sqlite3","/data.db","/backup.bak",
              "/.env","/.secret","/subdir/.private.json","/data.SQLITE"];
 for(const name of names){
  let status=0,body="";
  const response={
   setHeader(){},writeHead(code){status=code;return this;},
   end(payload){body=String(payload||"");}
  };
  await handler({method:"GET",url:name,headers:{}},response);
  assert.equal(status,403,name);
  assert.match(body,/Recurso privado no disponible/);
 }
});
