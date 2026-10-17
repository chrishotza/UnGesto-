import test from "node:test";
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import {Script} from "node:vm";

test("mass library browser script parses",async()=>{
 const js=await readFile(new URL("../public/global-library.js",import.meta.url),"utf8");
 assert.doesNotThrow(()=>new Script(js));
});
test("mass library only enables UK signature for eligible users",async()=>{
 const js=await readFile(new URL("../public/global-library.js",import.meta.url),"utf8");
 assert.match(js,/if\(el\("ukEligible"\)\.checked\)/);
 assert.match(js,/citizen|resident|británica/i);
 assert.match(js,/hostname!=="petition\.parliament\.uk"/);
 assert.match(js,/textContent=item\.title/);
 assert.doesNotMatch(js,/innerHTML\s*=/);
});
test("public page includes manifesto, massive catalog and eligibility disclosure",async()=>{
 const page=await readFile(new URL("../public/index.html",import.meta.url),"utf8");
 assert.match(page,/manifiesto\.html/);
 assert.match(page,/id="biblioteca"/);
 assert.match(page,/id="ukEligible"/);
 assert.match(page,/global-library\.js/);
 assert.match(page,/id="ukCards"/);
});
test("snapshot archive has metadata and actual SQLite database once generated",async()=>{
 const stats=JSON.parse(await readFile(new URL("../public/data/catalog-stats.json",import.meta.url),"utf8"));
 const src=JSON.parse(await readFile(new URL("../public/data/uk-petitions.json",import.meta.url),"utf8"));
 const db=await readFile(new URL("../public/data/ungesto-catalog.sqlite",import.meta.url));
 assert.ok(stats.uk_official_active>100);
 assert.equal(stats.local_curated,34);
 assert.equal(src.records.length,stats.uk_official_active);
 assert.equal(stats.total_distinct,stats.local_curated+stats.uk_official_active);
 assert.equal(db.toString("ascii",0,16),"SQLite format 3\0");
 assert.ok(src.records.every(c=>c.eligibility==="british_citizen_or_uk_resident"));
});
