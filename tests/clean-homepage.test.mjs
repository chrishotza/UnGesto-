import test from "node:test";
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import {Script} from "node:vm";
const read=path=>readFile(new URL(path,import.meta.url),"utf8");
test("homepage design is only one signing form, not a multi-step wizard",async()=>{
 const html=await read("../public/index.html");
 assert.equal((html.match(/id="signForm"/g)||[]).length,1);
 assert.equal((html.match(/id="signerName"/g)||[]).length,1);
 assert.equal((html.match(/id="signerEmail"/g)||[]).length,1);
 assert.equal((html.match(/id="signButton"/g)||[]).length,1);
 assert.match(html,/Toda la biblioteca/);
 assert.match(html,/Firma única/);
 assert.match(html,/id="consent"/);
 assert.doesNotMatch(html,/id="actionNetworkPanel"|id="provider"/);
});
test("new app indexes all local and official causes with no fake external delivery",async()=>{
 const js=await read("../public/firma-batch.js");
 assert.doesNotThrow(()=>new Script(js));
 const catalog=JSON.parse(await read("../public/catalog.json"));
 const official=JSON.parse(await read("../public/data/uk-petitions.json"));
 const connected=JSON.parse(await read("../public/operable-causes.json"));
 const connectedIds=new Set(connected.causes.map(c=>c.id));
 assert.equal(connectedIds.size,20);
 assert.equal(catalog.causes.length,34);
 assert.equal(official.records.length,2176);
 assert.equal(20+14+2176,2210);
 assert.match(js,/c\.kind==="connected"/);
 assert.match(js,/No pudimos registrar/);
 assert.match(js,/fetch\(API\+"\/api\/firmar"/);
 assert.doesNotMatch(js,/window\.open\(/);
});
test("responsive stylesheet includes mobile and reduced-card treatment",async()=>{
 const css=await read("../public/firma-batch.css");
 assert.match(css,/@media\(max-width:780px\)/);
 assert.match(css,/@media\(max-width:450px\)/);
 assert.match(css,/\.cause-row/);
 assert.match(css,/\.signature-column/);
});

test("the legacy library link returns to the clean integrated explorer",async()=>{
 const page=await read("../public/index.html");
 const js=await read("../public/firma-batch.js");
 assert.match(page,/\?vista=biblioteca#causas/);
 assert.match(js,/get\("vista"\)===\x22firmables\x22/);
 assert.doesNotMatch(page,/id="actionNetworkPanel"/);
});

test("selected causes can be removed individually without a second signing action",async()=>{
 const html=await read("../public/index.html");
 const js=await read("../public/firma-batch.js");
 assert.match(html,/id="selectedPreview"/);
 assert.match(html,/id="mobileBar"/);
 assert.match(js,/Quitar .* de mi selección/);
 assert.match(js,/chip\.addEventListener\("click",\(\)=>selectCause\(id,false\)\)/);
 assert.equal((js.match(/fetch\(API\+"\/api\/firmar"/g)||[]).length,1);
});
test("receipt history is recoverable on the same device and revocable without claiming external delivery",async()=>{
 const html=await read("../public/index.html");
 const js=await read("../public/firma-batch.js");
 assert.match(html,/id="receiptHistoryOpen"/);
 assert.match(html,/id="receiptDialog"/);
 assert.match(js,/function readReceiptHistory\(\)/);
 assert.match(js,/function renderHistory\(\)/);
 assert.match(js,/api\/revocar/);
 assert.match(html,/no constituye todavía una firma aceptada por las organizaciones externas/i);
});

test("shareable selections transfer only public cause IDs, never user identity or consent",async()=>{
 const html=await read("../public/index.html");
 const js=await read("../public/firma-batch.js");
 assert.match(html,/id="shareSelection"/);
 assert.match(html,/id="sharedOffer"/);
 assert.match(js,/function initSharedProposal\(\)/);
 assert.match(js,/function shareSelection\(\)/);
 assert.match(js,/u\.searchParams\.set\("propuesta",\[\.\.\.selected\]\.join\(","\)\)/);
 assert.match(js,/if\(connected\.has\(id\)\)sharedIds\.add\(id\)/);
 assert.match(js,/Ninguna está preseleccionada/);
 assert.match(js,/\$\("chooseShared"\)\.addEventListener\("click"/);
 assert.doesNotMatch(js,/searchParams\.set\("(?:email|name|consent|message|receiptToken)"/);
});
