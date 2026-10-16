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
