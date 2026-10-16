import test from "node:test";
import assert from "node:assert/strict";
import {parsePetitionUrl,getVoteCounts,validateOfficialWidgetSrc,OPENPETITION_CAPABILITIES} from "../integrations/openpetition.mjs";
import {verifiedDestinationResult,canReportExternallySigned,guardUserRequestedCampaigns,NETWORKS} from "../integrations/delivery-protocol.mjs";

const url="https://www.openpetition.org/petition/online/protect-the-commonwealth-of-pa-and-residents-from-the-harms-of-unregulated-data-centers";
test("genuine openPetition API URL extracted",()=>{
 const p=parsePetitionUrl(url);
 assert.equal(p.votesUrl,url+"/votes");
 assert.match(p.officialWidgetTool,/^https:\/\/www\.openpetition\.org\/widget\/anmelden\//);
});
test("openPetition public vote read-only fetch",async()=>{
 let calls=[];
 const result=await getVoteCounts(url,{fetchImpl:async (path,init)=>{
   calls.push({path,init});
   return {ok:true,json:async()=>({signature_count:97,external_count:0,combined:97})};
 }});
 assert.equal(calls.length,1);assert.equal(calls[0].path,url+"/votes");
 assert.equal(calls[0].init.method,"GET");assert.equal(result.total,97);
 assert.equal(result.verifiedFromPublicApi,true);
});
test("reject forged domains, insecure URLs, and nonpetition paths",()=>{
 for(const candidate of [
   "https://www.openpetition.org.evil.test/petition/online/test-petition",
   "http://www.openpetition.org/petition/online/test-petition",
   "https://www.openpetition.org/other",
   "https://www.openpetition.org@evil.test/petition/online/test-petition",
 ]) assert.throws(()=>parsePetitionUrl(candidate),TypeError);
});
test("only official embed frame URLs",()=>{
 assert.equal(validateOfficialWidgetSrc("https://www.openpetition.org/widget/demo/stop-sexual-harasment-at-allen-jayanagar-and-jain-college-campuses"),
 "https://www.openpetition.org/widget/demo/stop-sexual-harasment-at-allen-jayanagar-and-jain-college-campuses");
 assert.throws(()=>validateOfficialWidgetSrc("https://example.com/widget/foo/bar"),TypeError);
});
test("strict external receipt contract",()=>{
 assert.throws(()=>verifiedDestinationResult({causeId:"x",provider:"pilot",status:"accepted_by_destination"}));
 const internal=verifiedDestinationResult({causeId:"x",provider:"ungesto",status:"recorded_in_ungesto"});
 assert.equal(canReportExternallySigned(internal),false);
 const external=verifiedDestinationResult({causeId:"x",provider:"pilot",status:"accepted_by_destination",remoteReceiptId:"signed_123"});
 assert.equal(canReportExternallySigned(external),true);
});
test("no silent sign of other causes",()=>{
 assert.ok(guardUserRequestedCampaigns(["a","b"],["b"]));
 assert.throws(()=>guardUserRequestedCampaigns(["a"],["b"]));
 assert.throws(()=>guardUserRequestedCampaigns(["a","a"],["a"]));
});
test("no automated bulk signing claimed",()=>{
 assert.equal(OPENPETITION_CAPABILITIES.oneClickMultiSignature,false);
 assert.equal(OPENPETITION_CAPABILITIES.signatureApiPOST,false);
 assert.equal(NETWORKS.actionNetwork.canSendViaUnGesto,false);
});

import officialWidgets from "../integrations/official-widgets.json" with { type: "json" };
import {readFile} from "node:fs/promises";
test("official provider registry contains generated campaign-specific widgets only",async()=>{
 const ids=new Set(),causeIds=new Set();
 const catalog=JSON.parse(await readFile(new URL("../catalog/causes.json",import.meta.url),"utf8"));
 const campaignIds=new Set(catalog.causes.map(c=>c.id));
 for(const w of officialWidgets.campaigns){
   assert.ok(campaignIds.has(w.causeId));
   assert.match(w.widgetId,/^[a-f0-9]{64}$/);
   assert.ok(!ids.has(w.widgetId));
   assert.ok(!causeIds.has(w.causeId));
   assert.ok(w.petitionUrl.startsWith("https://www.openpetition.org/"));
   assert.ok(w.widgetOverview.includes(w.widgetId));
   ids.add(w.widgetId);causeIds.add(w.causeId);
 }
 assert.equal(ids.size,4);
 assert.equal(officialWidgets.campaigns.filter(w=>w.administratorEmailConfirmed).length,1);
});
test("widget page loads only one selected campaign and requires third-party consent",async()=>{
 const code=await readFile(new URL("../pages/firma-oficial.tsx",import.meta.url),"utf8");
 assert.match(code,/showWidget/);
 assert.match(code,/privacyApproved/);
 assert.match(code,/selected\.administratorEmailConfirmed/);
 assert.match(code,/sandbox="allow-forms allow-scripts/);
});
