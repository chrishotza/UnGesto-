/**
 * Contract for honest petition signature receipts.
 * A first-party endorsement is NEVER an external signature.
 * Official external submissions require a trusted adapter supplied with
 * campaign-specific permission, opt-in, and a destination acknowledgement.
 */
export const DELIVERY_STATUSES=Object.freeze([
  "recorded_in_ungesto", "unsupported", "pending_confirmation",
  "accepted_by_destination", "rejected_by_destination", "failed"
]);
const SET=new Set(DELIVERY_STATUSES);
export function verifiedDestinationResult({causeId,status,provider,remoteReceiptId=null}){
 if(typeof causeId!=="string"||causeId.length===0) throw new TypeError("Cause ID required");
 if(!SET.has(status))throw new TypeError("Delivery status not recognized");
 if(!provider||typeof provider!=="string")throw new TypeError("Provider required");
 if(status==="accepted_by_destination" && !(typeof remoteReceiptId==="string"&&remoteReceiptId.length>4)){
   throw new TypeError("External acceptance requires a destination receipt");
 }
 return Object.freeze({causeId,status,provider,remoteReceiptId});
}
export function canReportExternallySigned(result){
 return result?.status==="accepted_by_destination" &&
   typeof result.remoteReceiptId==="string" && result.remoteReceiptId.length>4;
}
export function guardUserRequestedCampaigns(selectedIds,acknowledgedIds){
 if(!Array.isArray(selectedIds)||!Array.isArray(acknowledgedIds)) throw new TypeError("Invalid selections");
 const ids=new Set(selectedIds);
 if(ids.size!==selectedIds.length)throw new TypeError("Duplicate selection");
 if(acknowledgedIds.some(id=>!ids.has(id)))throw new TypeError("Cannot submit an unselected campaign");
 return true;
}
export const NETWORKS=Object.freeze({
  openPetition:{method:"official_widget",canSendViaUnGesto:false,reason:"El widget oficial valida la firma; no hay POST genérico disponible"},
  actionNetwork:{method:"partner_api",canSendViaUnGesto:false,reason:"El helper registra suscriptores; no cumple la política anti-boletines"},
  changeOrg:{method:"not_supported",canSendViaUnGesto:false,reason:"No hay API pública de firma mantenida"},
  ungesto:{method:"first_party",canSendViaUnGesto:true,reason:"Adhesión y comprobante interno"}
});
