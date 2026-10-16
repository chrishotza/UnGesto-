import { z } from "zod";
import superjson from "superjson";
export const schema=z.object({receiptToken:z.string().regex(/^[a-f0-9]{64}$/)});
export type InputType=z.infer<typeof schema>;
export type OutputType={revoked:boolean;};
export async function postRevokeEndorsements(body:InputType):Promise<OutputType>{
 const res=await fetch("/_api/revoke-endorsements",{method:"POST",headers:{"Content-Type":"application/json"},body:superjson.stringify(schema.parse(body))});
 const data=superjson.parse<OutputType|{error:string}>(await res.text());
 if(!res.ok)throw new Error("error" in data?data.error:"No se pudo revocar.");
 return data as OutputType;
}
