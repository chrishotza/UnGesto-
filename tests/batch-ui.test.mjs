import test from "node:test";
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import {Script} from "node:vm";
test("main form implements exactly one batch submit, not sequential external forms",async()=>{
 const js=await readFile(new URL("../public/firma-batch.js",import.meta.url),"utf8");
 const html=await readFile(new URL("../public/firma-batch.html",import.meta.url),"utf8");
 assert.doesNotThrow(()=>new Script(js));
 assert.match(html,/Una firma/);assert.match(html,/Muchas causas/);
 assert.match(html,/id="signForm"/);assert.match(html,/id="signerName"/);
 assert.match(html,/id="signerEmail"/);assert.match(html,/id="signerMessage"/);
 assert.match(html,/id="consent"/);
 assert.match(js,/fetch\(API\+"\/api\/firmar"/);
 assert.doesNotMatch(js,/window\.open|\/petitions\/.+\/signatures|Promise\.all\(/);
});
test("per-cause signature statements remain individually visible, initial selection empty",async()=>{
 const js=await readFile(new URL("../public/firma-batch.js",import.meta.url),"utf8");
 assert.match(js,/const selected=new Set\(\)/);
 assert.match(js,/c\.statement/);
 assert.match(js,/selected\.has\(c\.id\)/);
 assert.match(js,/receipt\.causes/);
 assert.match(js,/\/api\/revocar/);
});
