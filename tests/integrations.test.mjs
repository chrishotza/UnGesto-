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
