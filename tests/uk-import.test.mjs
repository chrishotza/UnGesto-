import test from "node:test";
import assert from "node:assert/strict";
import {parseCampaign, pageCount, importAll, classify} from "../scripts/import-uk-petitions.mjs";

const item=(id,close="2027-02-01",state="open")=>({
 type:"petition",id,attributes:{action:"Protect cats and wildlife",background:"Keep animals safe",state,closing_date:close,closed_at:null,signature_count:450}
});
test("only current open real petitions with UK eligibility appear",()=>{
 assert.equal(parseCampaign(item(123,"2025-01-01"),"2026-10-16"),null);
 const c=parseCampaign(item(123),"2026-10-16");
 assert.equal(c.eligibility,"british_citizen_or_uk_resident");
 assert.equal(c.url,"https://petition.parliament.uk/petitions/123");
 assert.equal(c.signing_channel,"official_hosted_petition");
 assert.equal(c.signature_count,450);
 assert.equal(parseCampaign(item(123,"2027-02-01","closed"),"2026-10-16"),null);
});
test("source URL must remain parliament HTTPS domain and page bound",()=>{
 assert.throws(()=>pageCount({links:{last:"https://internal.example/petitions.json?page=4"}}));
 assert.throws(()=>pageCount({links:{last:"https://petition.parliament.uk/petitions.json?page=9999"}}));
 assert.equal(pageCount({links:{last:"https://petition.parliament.uk/petitions.json?page=2"}}),2);
});
test("simulated remote import deduplicates, filters expired, and preserves provenance",async()=>{
 const pages={
  1:{links:{last:"https://petition.parliament.uk/petitions.json?state=open&page=2"},data:[item(10),item(20,"2025-01-01")]},
  2:{links:{last:"https://petition.parliament.uk/petitions.json?state=open&page=2"},data:[item(10),item(12)]}
 };
 const fetchImpl=async u=>({ok:true,json:async()=>pages[Number(new URL(u).searchParams.get("page"))]});
 const x=await importAll({fetchImpl,now:"2026-10-16"});
 assert.equal(x.source_rows,4); assert.equal(x.records.length,2);
 assert.equal(x.source_pages,2);
 assert.ok(x.records.every(r=>r.eligibility==="british_citizen_or_uk_resident"));
});
test("category labels do not infer regional eligibility",()=>{
 assert.equal(classify("Save whales","Animals deserve protection"),"Animales");
});
