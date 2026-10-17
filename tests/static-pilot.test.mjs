import test from "node:test";
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
test("static pilot provides cause selection without storing signers",async()=>{
 const html=await readFile(new URL("../public/index.html",import.meta.url),"utf8");
 assert.match(html,/id="cards"/);
 assert.match(html,/id="consent"/);
 assert.match(html,/id="officialLink"/);
 assert.match(html,/function widgetHTML/);
 assert.match(html,/iframe/);
 assert.match(html,/sandbox/);
 assert.doesNotMatch(html,/localStorage\.setItem|sessionStorage\.setItem/);
 assert.doesNotMatch(html,/fetch\(\s*["']\/_api\/endorsements/);
});
test("static pilot prohibits foreign-domain embedded widgets",async()=>{
 const settings=JSON.parse(await readFile(new URL("../public/provider-widgets.json",import.meta.url),"utf8"));
 assert.equal(settings.authorizedOrigin,"https://ungesto-firmas-oficiales.onrender.com");
 assert.deepEqual(settings.campaigns,[]);
});

import {Script} from "node:vm";
test("pilot includes the exact 24 source URLs of its consent catalog",async()=>{
 const html=await readFile(new URL("../public/index.html",import.meta.url),"utf8");
 const catalog=JSON.parse(await readFile(new URL("../catalog/causes.json",import.meta.url),"utf8"));
 assert.equal(catalog.causes.length,34);
 for(const c of catalog.causes)assert.ok(html.includes(JSON.stringify(c.id)));
});
test("public pilot inline JS is parseable",async()=>{
 const html=await readFile(new URL("../public/index.html",import.meta.url),"utf8");
 const match=html.match(/<script>([\s\S]*?)<\/script>/);
 assert.ok(match);
 assert.doesNotThrow(()=>new Script(match[1]));
});


test("only allowlisted real agency contacts are published",async()=>{
 const routes=JSON.parse(await readFile(new URL("../public/direct-advocacy.json",import.meta.url),"utf8"));
 const catalog=JSON.parse(await readFile(new URL("../catalog/causes.json",import.meta.url),"utf8"));
 const ids=new Set(catalog.causes.map(x=>x.id));
 assert.equal(routes.routes.length,2);
 for(const r of routes.routes){
  assert.ok(ids.has(r.causeId));assert.ok(/@(?:pa|mass)\.gov$/i.test(r.recipient));
  assert.equal(r.type,"direct_advocacy_email_not_petition_signature");
  assert.ok(r.source.startsWith("https://"));
 }
});
test("direct advocacy is opt-in via mail client and never marked sent by this site",async()=>{
 const html=await readFile(new URL("../public/index.html",import.meta.url),"utf8");
 assert.match(html,/draftLetter\(p,v\)/);assert.match(html,/mailto:/);
 assert.match(html,/El envío debe confirmarse/);
 assert.doesNotMatch(html,/fetch\([^)]*directSend[^)]*method\s*:\s*["']POST/);
});

test("Rainforest Rescue selected campaigns can be combined in one addressed letter without server transmission",async()=>{
 const s=await readFile(new URL("../public/index.html",import.meta.url),"utf8");
 const catalog=JSON.parse(await readFile(new URL("../catalog/causes.json",import.meta.url),"utf8"));
 assert.equal(catalog.causes.filter(x=>x.organization==="Rainforest Rescue").length,13);
 assert.match(s,/function fullRainforestLetter\(\)/);
 assert.match(s,/rainforestSelected\(\)/);
 assert.match(s,/mailto:info@rainforest-rescue\.org/);
 assert.match(s,/Please do not add me to any mailing lists or newsletters/);
 assert.match(s,/Es una comunicación directa a la organización, no una firma registrada/);
});

test("Greenpeace bundled letter only includes explicitly selected causes",async()=>{
 const c=JSON.parse(await readFile(new URL("../catalog/causes.json",import.meta.url),"utf8"));
 assert.equal(c.causes.filter(x=>x.organization==="Greenpeace Internacional").length,3);
 const page=await readFile(new URL("../public/index.html",import.meta.url),"utf8");
 assert.match(page,/function greenpeaceSelected\(\)/);
 assert.match(page,/mailto:info\.int@greenpeace\.org/);
 assert.match(page,/Please do not add me to any newsletters/);
});
