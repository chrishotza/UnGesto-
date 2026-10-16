/**
 * Read-only openPetition integration and official-widget discovery.
 *
 * This file intentionally never POSTs signature data. The official embed
 * is controlled by openPetition and may require independent verification.
 * @see https://www.openpetition.org/widget/erklaeren/<petition-slug>
 */
const HOSTS = new Set(["www.openpetition.org","www.openpetition.de","www.openpetition.eu"]);
const PATH = /^\/(?:[a-z]{2}\/)?petition\/online\/([a-z0-9][a-z0-9-]{2,180})\/?$/i;
export function parsePetitionUrl(value) {
  const url = new URL(value);
  if (url.protocol !== "https:" || !HOSTS.has(url.hostname) || url.username || url.password || url.port) {
    throw new TypeError("Origen de petición no reconocido");
  }
  const match=url.pathname.match(PATH);
  if (!match) throw new TypeError("No es la URL de una petición openPetition");
  return Object.freeze({
    canonicalUrl: url.origin+url.pathname.replace(/\/$/,""),
    slug: match[1],
    host: url.hostname,
    votesUrl: url.origin+url.pathname.replace(/\/$/,"")+"/votes",
    officialWidgetTool: url.origin+"/widget/anmelden/"+match[1],
  });
}
export function validateOfficialWidgetSrc(candidate) {
  const url=new URL(candidate);
  if(url.protocol!=="https:"||!HOSTS.has(url.hostname)||url.port||url.username||url.password) {
    throw new TypeError("El widget debe pertenecer a openPetition");
  }
  if (!/^\/widget\/(?!anmelden|erklaeren)[a-z0-9_-]+\/[a-z0-9-]+\/?$/i.test(url.pathname)) {
    throw new TypeError("El código no contiene un widget válido");
  }
  return url.toString();
}
export async function getVoteCounts(petitionUrl,{fetchImpl=fetch,signal}={}){
  const petition=parsePetitionUrl(petitionUrl);
  const response=await fetchImpl(petition.votesUrl,{method:"GET",headers:{"Accept":"application/json"},signal});
  if(!response.ok)throw new Error("openPetition devolvió HTTP "+response.status);
  const data=await response.json();
  const numeric = (k)=>Number.isSafeInteger(data?.[k]) && data[k]>=0 ? data[k] : null;
  const signatureCount=numeric("signature_count");
  const externalCount=numeric("external_count");
  const total=numeric("combined");
  if(signatureCount===null||externalCount===null||total===null||total<signatureCount) {
    throw new Error("Formato de firmas no reconocido");
  }
  return Object.freeze({petitionUrl:petition.canonicalUrl,signatureCount,externalCount,total,provider:"openPetition",verifiedFromPublicApi:true});
}
export const OPENPETITION_CAPABILITIES=Object.freeze({
  petitionDiscovery:"public_web",
  signatureCount:"public_api_verified",
  signing:"official_embeddable_widget",
  oneClickMultiSignature:false,
  userVerification:"email_confirmation_by_provider",
  autoNewsletterOptIn:false,
  requiresWidgetCodePerCampaign:true,
  signatureApiPOST:false,
});
