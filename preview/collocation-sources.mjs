const DATAMUSE_BASE='https://api.datamuse.com';
const OPEN_COLLLOCATION_DATASET_URL='https://raw.githubusercontent.com/ironking63/Collocation-Vocab-Practice-Claude-SKILL/main/assets/collocations.json';
const CACHE_KEY='english-collocations-preview-source-cache-v2';
const CACHE_TTL=12*60*60*1000;
const OPEN_CACHE_KEY='english-collocations-preview-open-mit-v1';
const OPEN_CACHE_TTL=7*24*60*60*1000;
let openDatasetPromise=null;

export function normalizeCollocationQuery(value){
  return String(value??'').trim().toLowerCase().replace(/\s+/g,' ');
}
export function normalizeCollocationPhrase(value){
  return String(value??'').trim().replace(/\s+/g,' ');
}
export function isUsableCollocation(value,query=''){
  const phrase=normalizeCollocationPhrase(value),q=normalizeCollocationQuery(query);
  if(!phrase||phrase.split(/\s+/).length<2||phrase.split(/\s+/).length>7)return false;
  return !q||phrase.toLowerCase().startsWith(q);
}
export function normalizeDatamuseItems(items,query){
  const q=normalizeCollocationQuery(query);
  if(!Array.isArray(items))return [];
  return items.map((item,index)=>{
    const phrase=normalizeCollocationPhrase(item?.word??item?.collocation??item?.phrase??'');
    const score=Number(item?.score);
    return {c:phrase,v:String(item?.meaningVi??'').trim(),meaningEn:String(item?.meaning??'').trim(),cefr:String(item?.cefr??'').trim().toUpperCase(),score:Number.isFinite(score)?score:0,source:'datamuse',sourceIndex:index};
  }).filter(item=>isUsableCollocation(item.c,q));
}
function cacheRead(){try{const value=JSON.parse(localStorage.getItem(CACHE_KEY)||'{}');return value&&typeof value==='object'?value:{}}catch{return{}}}
function cacheWrite(value){try{localStorage.setItem(CACHE_KEY,JSON.stringify(value))}catch{}}
async function fetchJson(url,fetchImpl,signal){
  try{const response=await fetchImpl(url,{mode:'cors',cache:'no-store',signal});if(!response?.ok)return[];const value=await response.json();return Array.isArray(value)?value:[]}catch{return[]}
}
function openCacheRead(){try{const value=JSON.parse(localStorage.getItem(OPEN_CACHE_KEY)||'{}');return value&&typeof value==='object'?value:null}catch{return null}}
function openCacheWrite(value){try{localStorage.setItem(OPEN_CACHE_KEY,JSON.stringify(value))}catch{}}
export function normalizeOpenCollocationItems(items,query){
  const q=normalizeCollocationQuery(query);
  if(!Array.isArray(items))return[];
  return items.map((item,index)=>{
    const phrase=normalizeCollocationPhrase(item?.collocation??item?.c??item?.phrase??'');
    const meaningEn=String(item?.meaning??item?.meaningEn??'').trim();
    const meaningVi=String(item?.meaningVi??item?.v??'').trim();
    const cefr=String(item?.cefr??'').trim().toUpperCase();
    const score=100000-(Number(index)||0);
    return {c:phrase,v:meaningVi,meaningEn,cefr,score,source:'open-mit-300',sourceIndex:index};
  }).filter(item=>isUsableCollocation(item.c,q));
}
export async function fetchOpenCollocationSuggestions(query,{fetchImpl=globalThis.fetch,signal}={}){
  const q=normalizeCollocationQuery(query);
  if(q.length<2||typeof fetchImpl!=='function')return[];
  const cached=openCacheRead();
  if(cached&&Number(cached.at||0)>Date.now()-OPEN_CACHE_TTL&&Array.isArray(cached.items)){
    return cached.items.filter(item=>isUsableCollocation(item.c,q));
  }
  if(!openDatasetPromise){
    openDatasetPromise=fetchJson(OPEN_COLLLOCATION_DATASET_URL,fetchImpl,signal).then(items=>normalizeOpenCollocationItems(items,'')).catch(()=>[]);
  }
  const all=await openDatasetPromise;
  if(all.length)openCacheWrite({at:Date.now(),items:all});
  return all.filter(item=>isUsableCollocation(item.c,q));
}
export async function fetchDatamuseSuggestions(query,{fetchImpl=globalThis.fetch,max=60,signal}={}){
  const q=normalizeCollocationQuery(query);
  if(q.length<2||typeof fetchImpl!=='function')return[];
  const cap=Math.min(100,Math.max(10,Number(max)||60)),pattern=encodeURIComponent(q+'*');
  const urls=[
    DATAMUSE_BASE+'/sug?s='+encodeURIComponent(q)+'&max='+cap,
    DATAMUSE_BASE+'/words?sp='+pattern+'&max='+cap+'&md=pf'
  ];
  const tokens=q.split(/\s+/);
  if(tokens.length===1)urls.push(DATAMUSE_BASE+'/words?rel_bga='+encodeURIComponent(q)+'&max='+cap+'&md=pf');
  const payloads=await Promise.all(urls.map(url=>fetchJson(url,fetchImpl,signal)));
  const items=[];
  payloads.forEach(payload=>items.push(...normalizeDatamuseItems(payload,q)));
  if(tokens.length===1){
    const head=q;
    for(const [index,item] of (payloads[2]||[]).entries()){
      const word=normalizeCollocationPhrase(item?.word||'');
      const phrase=head+' '+word;
      if(word&&isUsableCollocation(phrase,q))items.push({c:phrase,v:'',meaningEn:'',cefr:'',score:Number(item?.score)||0,source:'datamuse',sourceIndex:index+100});
    }
  }
  const seen=new Set();
  return items.filter(item=>{const key=item.c.toLowerCase();if(seen.has(key))return false;seen.add(key);return true}).sort((a,b)=>(b.score-a.score)||(a.sourceIndex-b.sourceIndex));
}
export async function getExternalSuggestions(query,{force=false,fetchImpl=globalThis.fetch,signal,max=100}={}){
  const q=normalizeCollocationQuery(query);if(q.length<2)return[];
  const key=q,cache=cacheRead(),hit=cache[key];
  if(!force&&hit&&Date.now()-Number(hit.at||0)<CACHE_TTL&&Array.isArray(hit.items))return hit.items;
  const [datamuseItems,openItems]=await Promise.all([
    fetchDatamuseSuggestions(q,{fetchImpl,max,signal}),
    fetchOpenCollocationSuggestions(q,{fetchImpl,signal})
  ]);
  const merged=[...openItems,...datamuseItems];
  const seen=new Set();
  const items=merged.filter(item=>{
    const key=String(item?.c||'').trim().toLowerCase();
    if(!key||seen.has(key))return false;
    seen.add(key);return true;
  }).sort((a,b)=>(Number(b?.score)||0)-(Number(a?.score)||0));
  if(items.length){cache[key]={at:Date.now(),items};cacheWrite(cache)}
  return items;
}
export const COLLOCATION_SOURCE_INFO=Object.freeze({
  datamuse:'Datamuse · lexical/corpus suggestions',
  'open-mit-300':'MIT-licensed open collocation dataset · community curated',
  ai:'Browser-local Qwen · AI top-up',
  local:'Preview Library · local'
});
