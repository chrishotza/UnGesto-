import test from "node:test";
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import {validateCatalog,probeCause} from "../integrations/catalog.mjs";
const data=JSON.parse(await readFile(new URL("../catalog/causes.json",import.meta.url),"utf8"));
test("all current public campaigns carry an exact, versioned consent statement",()=>{
  const summary=validateCatalog(data);
  assert.equal(summary.count,34);
  assert.ok(summary.organizations.length>=3);
});
test("rejects SSRF, duplicates, mutable or unsafe sources",()=>{
 const broken=structuredClone(data);broken.causes[0].source_url="http://127.0.0.1/private";
 assert.throws(()=>validateCatalog(broken),/allowlist|URL/i);
 const dup=structuredClone(data);dup.causes.push({...dup.causes[0]});
 assert.throws(()=>validateCatalog(dup),/Duplicate/);
});
test("200 is only reachable, not active or signed",async()=>{
 const r=await probeCause(data.causes[0],{fetchImpl:async()=>({status:200,body:null,text:async()=>"<html><h1>Help save forests</h1></html>"})});
 assert.equal(r.result,"reachable");assert.equal(r.http_status,200);
 assert.match(r.detail,/not signature acceptance/);
});
test("closed pages are flagged for human review",async()=>{
 const r=await probeCause(data.causes[0],{fetchImpl:async()=>({status:200,text:async()=>"<p>This petition is closed</p>"})});
 assert.equal(r.result,"possibly_closed");
});
test("malicious cross-domain redirect is never fetched",async()=>{
 let count=0;const r=await probeCause(data.causes[0],{fetchImpl:async()=>{count++;return {status:302,headers:{get:()=> "http://127.0.0.1/admin"}};}});
 assert.equal(count,1);assert.equal(r.result,"redirect_review");
});
test("blocked sources are review status, not false closure",async()=>{
 const r=await probeCause(data.causes[0],{fetchImpl:async()=>({status:403})});
 assert.equal(r.result,"blocked");
});
test("missing sources are detected",async()=>{
 const r=await probeCause(data.causes[0],{fetchImpl:async()=>({status:404})});
 assert.equal(r.result,"missing");
});
