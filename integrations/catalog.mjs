/** Strict catalog and public-source health checks. No signers or PII are accessed. */
const trustedHosts = new Set(["www.rainforest-rescue.org","www.greenpeace.org","www.amnesty.org","www.openpetition.org","www.openpetition.de","www.openpetition.eu","actionnetwork.org"]);
const closings = [/petition (?:is |has been )?closed/i,/petition has ended/i,/petition expired/i,/signatures are no longer being collected/i,/petition is over/i,/petici[oó]n (?:est[aá] )?cerrada/i];
function validUrl(text){
  const u = new URL(text);
  if(u.protocol!=="https:" || u.port || u.username || u.password || !trustedHosts.has(u.hostname)) throw new TypeError("Non-allowlisted source URL");
  return u;
}
export function validateCatalog(data){
  if(!data || data.schema_version!=="1.0.0" || !Array.isArray(data.causes) || !data.causes.length) throw new TypeError("Invalid catalog schema");
  const ids=new Set(),urls=new Set();
  for(const c of data.causes){
    for(const field of ["id","title","description","category","organization","source_url","provider","consent_version","consent_text"]){
      if(typeof c[field]!=="string" || c[field].trim().length===0)throw new TypeError("Missing "+field+" in "+c.id);
    }
    if(!/^[a-z0-9-]+$/.test(c.id)||ids.has(c.id))throw new TypeError("Duplicate/invalid ID: "+c.id);
    if(!/^[0-9]{4}-[0-9]{2}-[0-9]{2}\.\d+$/.test(c.consent_version))throw new TypeError("Unversioned consent: "+c.id);
    const u=validUrl(c.source_url);
    if(c.provider!==u.hostname)throw new TypeError("Wrong provider host: "+c.id);
    const canon=u.origin+u.pathname.replace(/\/$/,"");
    if(urls.has(canon))throw new TypeError("Duplicate URL: "+c.id);
    ids.add(c.id);urls.add(canon);
  }
  return {count:ids.size,organizations:[...new Set(data.causes.map(c=>c.organization))].sort()};
}
function isClosedExcerpt(text){return closings.some(re=>re.test(text));}
/**
 * Only detects HTTP reachability/possible closure. Never declares a signature form active
 * based on status 200. Redirect and bot protections are sent to human review.
 */
export async function probeCause(c,{fetchImpl=fetch,maxRedirects=3,signal}={}){
  validUrl(c.source_url);
  let url=c.source_url;const hops=[];
  try{
    for(let i=0;i<=maxRedirects;i++){
      const res=await fetchImpl(url,{method:"GET",redirect:"manual",signal,headers:{"user-agent":"UnGesto-catalog-health/0.1 (+https://github.com/chrishotza/UnGesto-)","accept":"text/html,application/xhtml+xml"}});
      const status=res.status;
      if(status>=300&&status<400){
        const dest=res.headers?.get?.("location");
        if(!dest)return {id:c.id,result:"redirect_review",http_status:status,detail:"No Location",hops};
        // URLs are resolved without ever following an off-allowlist redirect.
        let resolved;try{resolved=validUrl(new URL(dest,url).toString())}catch{return {id:c.id,result:"redirect_review",http_status:status,detail:"Redirect outside allowlist",hops}};
        if(resolved.toString()===url)return {id:c.id,result:"redirect_review",http_status:status,detail:"Self redirect",hops};
        hops.push(resolved.toString());
        const oldPath=new URL(c.source_url).pathname;
        if(resolved.pathname==="/" || (oldPath.includes("/petition")&&!resolved.pathname.includes("/petition")))return {id:c.id,result:"redirect_review",http_status:status,detail:"Redirected outside petition path",hops};
        url=resolved.toString();continue;
      }
      if(status===404||status===410)return {id:c.id,result:"missing",http_status:status,detail:"Not found",hops};
      if(status===403||status===429||status===503)return {id:c.id,result:"blocked",http_status:status,detail:"May be rate-limited or protected",hops};
      if(status!==200)return {id:c.id,result:"needs_review",http_status:status,detail:"Unexpected HTTP code",hops};
      let excerpt="";
      if(res.body?.getReader){
        const reader=res.body.getReader();const decoder=new TextDecoder();let size=0;
        try{while(size<98304){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;excerpt+=decoder.decode(value,{stream:true});}}finally{await reader.cancel?.().catch(()=>{});}
      }else if(typeof res.text==="function"){excerpt=(await res.text()).slice(0,98304);}
      return {id:c.id,result:isClosedExcerpt(excerpt)?"possibly_closed":"reachable",http_status:status,detail:"Reachability only, not signature acceptance",hops};
    }
    return {id:c.id,result:"redirect_review",http_status:null,detail:"Too many redirects",hops};
  }catch(e){
    return {id:c.id,result:"error",http_status:null,detail:e instanceof Error?e.name:"Network error",hops};
  }
}
