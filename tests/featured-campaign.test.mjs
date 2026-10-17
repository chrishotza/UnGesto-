import test from "node:test";
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
test("featured cause opens genuine hosted signature form without pre-checked newsletters",async()=>{
 const html=await readFile(new URL("../public/index.html",import.meta.url),"utf8");
 assert.match(html,/Patty merece un santuario/);
 assert.ok(html.includes("actionnetwork.org/petitions/send-patty-to-sanctuary"));
 for(const key of ["subscription_user=false","subscription_group=false","subscription_referrer=false"])assert.ok(html.includes(key));
 assert.match(html,/La firma se realiza y valida en Action Network/);
});
