import { schema, type OutputType } from "./endorsements_POST.schema";
import { petitionStatements } from "../helpers/petitionStatements";
import { db } from "../helpers/db";
import superjson from "superjson";
import { createHash, randomBytes } from "node:crypto";
import { sql } from "kysely";
export async function handle(request: Request): Promise<Response> {
 try {
  const parsed=schema.safeParse(superjson.parse(await request.text()));
  if(!parsed.success) return new Response(superjson.stringify({error:"Revisá los datos de la firma y el consentimiento."}),{status:400});
  const input=parsed.data;
  const ids=[...new Set(input.causeIds)];
  if(ids.length !== input.causeIds.length || ids.some(id=>!petitionStatements[id]))return new Response(superjson.stringify({error:"Hay causas no disponibles para registrar."}),{status:400});
  // No marketing consent: it is deliberately not in the API.
  const recent=await db.selectFrom("signatureBatches").select(sql<number>`count(*)::int`.as("total")).where("signerEmail","=",input.email.toLowerCase()).where("createdAt",">",new Date(Date.now()-3600000)).executeTakeFirst();
  if(Number(recent?.total||0)>=4) return new Response(superjson.stringify({error:"Alcanzaste el límite temporal de envíos. Probá más adelante."}),{status:429});
  const receiptToken=randomBytes(32).toString("hex");
  const receiptHash=createHash("sha256").update(receiptToken).digest("hex");
  const batch=await db.transaction().execute(async trx=>{
    const batch=await trx.insertInto("signatureBatches").values({
      receiptHash, signerName:input.name, signerEmail:input.email.toLowerCase(), signerCountry:input.country||null,
      signerMessage:input.message||null, consentVersion:"ungesto-2026-10-16-v1"
    }).returning("id").executeTakeFirstOrThrow();
    await trx.insertInto("causeEndorsements").values(ids.map(id=>({
      batchId:batch.id, causeId:id,
      statementText:petitionStatements[id].text+"\n[Versión: "+petitionStatements[id].version+"]",
      sourceUrl:petitionStatements[id].sourceUrl
    }))).execute();
    return batch;
  });
  const result:OutputType={
   receiptId:batch.id,receiptToken,
   recorded:ids.map(causeId=>({causeId,status:"recorded_in_ungesto" as const,externalStatus:"not_sent" as const})),
   summary:"Apoyos registrados para cada causa elegida en UnGesto. Integraciones de firma externa pendientes."
  };
  return new Response(superjson.stringify(result),{status:201,headers:{"Cache-Control":"no-store"}});
 }catch(err){
  console.error("Error de registro de adhesiones",err instanceof Error?err.name:"desconocido");
  return new Response(superjson.stringify({error:"No pudimos registrar las adhesiones. Reintentá más tarde."}),{status:500,headers:{"Cache-Control":"no-store"}});
 }
}
