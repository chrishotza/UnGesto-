import { z } from "zod";
import superjson from "superjson";
export const schema = z.object({
 name: z.string().trim().min(3).max(120),
 email: z.string().trim().email().max(254),
 country: z.string().trim().max(80).optional().default(""),
 message: z.string().trim().max(1000).optional().default(""),
 causeIds: z.array(z.string().trim().min(1).max(100)).min(1).max(20),
 readAndAuthorized: z.literal(true),
 privacyAccepted: z.literal(true),
});
export type InputType = z.infer<typeof schema>;
export type OutputType = { receiptId: string; receiptToken: string; recorded: {causeId:string; status:"recorded_in_ungesto"; externalStatus:"not_sent";}[]; summary: string; };
export async function postEndorsements(body: InputType): Promise<OutputType>{
 const res=await fetch("/_api/endorsements",{method:"POST",headers:{"Content-Type":"application/json"},body:superjson.stringify(schema.parse(body))});
 const text=await res.text();
 const data=superjson.parse<OutputType | {error:string}>(text);
 if(!res.ok)throw new Error("error" in data?data.error:"No pudimos registrar las adhesiones");
 return data as OutputType;
}
