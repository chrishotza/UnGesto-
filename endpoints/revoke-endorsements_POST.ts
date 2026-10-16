import { schema, type OutputType } from "./revoke-endorsements_POST.schema";
import superjson from "superjson";
import {createHash} from "node:crypto";
import {db} from "../helpers/db";
export async function handle(request:Request):Promise<Response>{
 try{
  const parsed=schema.safeParse(superjson.parse(await request.text()));
  if(!parsed.success)return new Response(superjson.stringify({error:"Comprobante inválido."}),{status:400});
  const hash=createHash("sha256").update(parsed.data.receiptToken).digest("hex");
  const deleted=await db.deleteFrom("signatureBatches").where("receiptHash","=",hash).returning("id").executeTakeFirst();
  return new Response(superjson.stringify({revoked:!!deleted} satisfies OutputType),{headers:{"Cache-Control":"no-store"}});
 }catch{
  return new Response(superjson.stringify({error:"No se pudo revocar."}),{status:500,headers:{"Cache-Control":"no-store"}});
 }
}
