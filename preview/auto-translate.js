/* Fast browser-local EN→VI translator.
   Zero-jank goals:
   - delegated input/blur listeners (no per-row handlers / MutationObserver)
   - memory-first translation cache
   - bounded concurrent requests + fast provider race
   - coalesced localStorage persistence (never on every translation)
   - update the target cell + table data in-place without re-rendering the table
*/
import {normalize,shouldTranslate,translationKey,targetFieldFor,isStale,sourceMatches} from './auto-translate-core.mjs';

const DATA_KEY='english-collocations-preview-v2';
const CACHE_KEY='english-collocations-translation-cache-v8';
const CACHE_MAX=1000;
const DEBOUNCE_MS=500;
const BLUR_DELAY_MS=70;
const PROVIDER_TIMEOUT_MS=1800;
const FALLBACK_DELAY_MS=450;
const MAX_CONCURRENCY=4;
const DATA_FLUSH_MS=850;
const CACHE_FLUSH_MS=4000;

const timers=new Map();
const requestVersion=new Map();
const inflight=new Map();
const lastSource=new Map();
const queue=[];
const pendingPatches=new Map();
let activeRequests=0;
let memoryCache=null;
let cacheWriteTimer=0;
let dataWriteTimer=0;
let cacheIdleId=0;
let dataIdleId=0;
let eventsBound=false;

function getCache(){
  if(memoryCache)return memoryCache;
  try{
    const value=JSON.parse(localStorage.getItem(CACHE_KEY)||'{}');
    memoryCache=value&&typeof value==='object'&&!Array.isArray(value)?value:{};
  }catch{memoryCache={}}
  return memoryCache;
}
function cacheGet(key){return getCache()[key]||''}
function scheduleCacheWrite(){
  clearTimeout(cacheWriteTimer);
  if(cacheIdleId&&'cancelIdleCallback' in window)window.cancelIdleCallback(cacheIdleId);
  cacheWriteTimer=setTimeout(()=>{
    cacheWriteTimer=0;
    const flush=()=>{
      cacheIdleId=0;
      try{
        const entries=Object.entries(getCache());
        const trimmed=entries.slice(Math.max(0,entries.length-CACHE_MAX));
        localStorage.setItem(CACHE_KEY,JSON.stringify(Object.fromEntries(trimmed)));
      }catch{}
    };
    if('requestIdleCallback' in window)cacheIdleId=requestIdleCallback(flush,{timeout:2500});else flush();
  },CACHE_FLUSH_MS);
}
function cacheSet(key,value){
  if(!key||!value)return;
  const cache=getCache();
  cache[key]=value;
  const keys=Object.keys(cache);
  if(keys.length>CACHE_MAX){
    const removeCount=keys.length-CACHE_MAX;
    for(let i=0;i<removeCount;i++)delete cache[keys[i]];
  }
  scheduleCacheWrite();
}

function patchKey(id,sourceField,exampleIndex=0){
  return translationKey(id,sourceField,sourceField==='e'?exampleIndex:null);
}
function queuePatch(id,sourceField,sourceText,targetText,exampleIndex=0){
  const key=patchKey(id,sourceField,exampleIndex);
  pendingPatches.set(key,{id:String(id),sourceField,sourceText:normalize(sourceText),targetText:normalize(targetText),exampleIndex:Math.max(0,Number(exampleIndex)||0)});
  scheduleDataFlush();
}
function applyPatchToRow(row,patch){
  if(String(row?.id)!==String(patch.id))return false;
  const expected=normalize(patch.sourceText);
  const target=normalize(patch.targetText);
  if(patch.sourceField==='e'){
    const index=patch.exampleIndex;
    const examples=Array.isArray(row.examples)?row.examples.map(item=>({e:normalize(item?.e||''),em:normalize(item?.em||'')})):[];
    while(examples.length<=index)examples.push({e:'',em:''});
    if(normalize(examples[index].e)!==expected)return false;
    examples[index].em=target;
    row.examples=examples;
    if(index===0){row.e=expected;row.em=target}
    return true;
  }
  if(normalize(row?.[patch.sourceField]||'')!==expected)return false;
  row[targetFieldFor(patch.sourceField)]=target;
  return true;
}
function flushDataPatches(){
  if(!pendingPatches.size)return;
  clearTimeout(dataWriteTimer);
  dataWriteTimer=0;
  const patches=[...pendingPatches.values()];
  pendingPatches.clear();
  try{
    const raw=localStorage.getItem(DATA_KEY)||'[]';
    const rows=JSON.parse(raw);
    if(!Array.isArray(rows))return;
    let changed=0;
    for(const patch of patches){
      const row=rows.find(item=>String(item?.id)===String(patch.id));
      if(row&&applyPatchToRow(row,patch))changed++;
    }
    if(changed) localStorage.setItem(DATA_KEY,JSON.stringify(rows));
  }catch{}
}
function scheduleDataFlush(){
  clearTimeout(dataWriteTimer);
  if(dataIdleId&&'cancelIdleCallback' in window)window.cancelIdleCallback(dataIdleId);
  dataWriteTimer=setTimeout(()=>{
    dataWriteTimer=0;
    if('requestIdleCallback' in window)dataIdleId=requestIdleCallback(()=>{dataIdleId=0;flushDataPatches()},{timeout:2500});else flushDataPatches();
  },DATA_FLUSH_MS);
}
function flushAll(){
  flushDataPatches();
  if(memoryCache){
    try{
      const entries=Object.entries(memoryCache);
      const trimmed=entries.slice(Math.max(0,entries.length-CACHE_MAX));
      localStorage.setItem(CACHE_KEY,JSON.stringify(Object.fromEntries(trimmed)));
    }catch{}
  }
}

const toast=(()=>{
  let el=null,lastAt=0,hideTimer=0;
  return (message,error=false)=>{
    const now=Date.now();
    if(now-lastAt<1400)return;
    lastAt=now;
    if(!el||!document.body.contains(el)){
      el=document.createElement('div');
      el.id='standaloneTranslateStatus';
      el.style.cssText='position:fixed;right:18px;bottom:18px;z-index:99999;padding:9px 12px;border-radius:9px;background:#172131;color:#fff;border:1px solid #34445a;font:12px system-ui;box-shadow:0 8px 24px #0004;pointer-events:none';
      document.body.appendChild(el);
    }
    el.textContent=message;
    el.style.borderColor=error?'#ff686d':'#36c98b';
    clearTimeout(hideTimer);
    hideTimer=setTimeout(()=>{if(el)el.style.opacity='0'},1800);
    el.style.opacity='1';
  };
})();

function enqueue(task){
  queue.push(task);
  drainQueue();
}
function drainQueue(){
  while(activeRequests<MAX_CONCURRENCY&&queue.length){
    const job=queue.shift();
    activeRequests++;
    Promise.resolve().then(job).catch(()=>{}).finally(()=>{
      activeRequests--;
      drainQueue();
    });
  }
}
async function fetchWithTimeout(url,options={},timeout=PROVIDER_TIMEOUT_MS){
  const controller=new AbortController();
  const timer=setTimeout(()=>controller.abort(),timeout);
  try{return await fetch(url,{...options,signal:controller.signal})}
  finally{clearTimeout(timer)}
}
async function googleTranslate(text){
  const url='https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=vi&dt=t&q='+encodeURIComponent(text);
  const response=await fetchWithTimeout(url,{mode:'cors',cache:'force-cache'});
  if(!response.ok)throw new Error('Google '+response.status);
  const data=await response.json();
  const value=normalize(Array.isArray(data?.[0])?data[0].map(item=>item?.[0]||'').join(''):'');
  if(!value)throw new Error('Google empty');
  return value;
}
async function myMemoryTranslate(text){
  const url='https://api.mymemory.translated.net/get?q='+encodeURIComponent(text)+'&langpair=en|vi';
  const response=await fetchWithTimeout(url,{mode:'cors',cache:'force-cache'});
  if(!response.ok)throw new Error('MyMemory '+response.status);
  const data=await response.json();
  const value=normalize(data?.responseData?.translatedText||'');
  if(!value)throw new Error('MyMemory empty');
  return value;
}
async function requestTranslation(key){
  const cached=cacheGet(key);
  if(cached)return cached;
  if(inflight.has(key))return inflight.get(key);
  const promise=new Promise((resolve,reject)=>{
    enqueue(()=>{
      let fallbackTimer=0;
      const google=googleTranslate(key);
      const fallback=new Promise((resolve,reject)=>{
        fallbackTimer=setTimeout(()=>myMemoryTranslate(key).then(resolve,reject),FALLBACK_DELAY_MS);
      });
      return Promise.any([google,fallback]).then(value=>{
        clearTimeout(fallbackTimer);
        cacheSet(key,value);
        resolve(value);
      }).catch(()=>reject(new Error('Translation failed')));
    });
  });
  inflight.set(key,promise);
  try{return await promise}
  finally{inflight.delete(key)}
}
function cell(tr,field,exampleIndex=null){
  const hasExample=(field==='e'||field==='em')&&exampleIndex!==null&&exampleIndex!==undefined;
  if(hasExample){
    const selector='[data-field="'+field+'"][data-example-index="'+String(exampleIndex)+'"]';
    return tr?.querySelector('.editable'+selector)||tr?.querySelector(selector)||null;
  }
  return tr?.querySelector('.editable[data-field="'+field+'"]')||tr?.querySelector('[data-field="'+field+'"]')||null;
}
function showState(tr,field,state,text='',exampleIndex=0){
  const target=targetFieldFor(field);
  const el=cell(tr,target,field==='e'?exampleIndex:null);
  if(!el)return;
  if(state==='loading'){
    el.classList.add('translation','translating');
    el.textContent='⏳ Đang dịch…';
  }else if(state==='done'){
    el.classList.remove('translating');
    el.classList.add('translation','auto-translated');
    el.textContent=text;
  }else if(state==='error'){
    el.classList.remove('translating');
  }
}
async function run(id,sourceField,sourceText,exampleIndex=0){
  const cleanSource=normalize(sourceText);
  if(!shouldTranslate(sourceField,cleanSource))return;
  const key=patchKey(id,sourceField,exampleIndex);
  const version=(requestVersion.get(key)||0)+1;
  requestVersion.set(key,version);
  if(lastSource.get(key)===cleanSource)return;
  const targetField=targetFieldFor(sourceField);
  const tr=document.querySelector('#body tr[data-id="'+CSS.escape(String(id))+'"]');
  const cached=cacheGet(cleanSource);
  if(cached){
    if(isStale(requestVersion.get(key),version))return;
    const sourceEl=cell(tr,sourceField,sourceField==='e'?exampleIndex:null);
    if(!sourceMatches(sourceEl?.textContent||sourceEl?.value||'',cleanSource))return;
    showState(tr,sourceField,'done',cached,exampleIndex);
    window.PreviewTable?.patchTranslation?.(id,sourceField,cached,exampleIndex);
    queuePatch(id,sourceField,cleanSource,cached,exampleIndex);
    lastSource.set(key,cleanSource);
    return;
  }
  showState(tr,sourceField,'loading','',exampleIndex);
  try{
    const translated=normalize(await requestTranslation(cleanSource));
    if(isStale(requestVersion.get(key),version))return;
    const currentTr=document.querySelector('#body tr[data-id="'+CSS.escape(String(id))+'"]');
    const currentSourceEl=cell(currentTr,sourceField,sourceField==='e'?exampleIndex:null);
    if(!sourceMatches(currentSourceEl?.textContent||currentSourceEl?.value||'',cleanSource))return;
    window.PreviewTable?.patchTranslation?.(id,sourceField,translated,exampleIndex);
    queuePatch(id,sourceField,cleanSource,translated,exampleIndex);
    lastSource.set(key,cleanSource);
    showState(currentTr,sourceField,'done',translated,exampleIndex);
    toast('✓ Đã dịch → '+(targetField==='m'?'NGHĨA COLLOCATION':'NGHĨA CÂU VÍ DỤ'));
  }catch(error){
    if(isStale(requestVersion.get(key),version))return;
    lastSource.delete(key);
    const currentTr=document.querySelector('#body tr[data-id="'+CSS.escape(String(id))+'"]');
    showState(currentTr,sourceField,'error','',exampleIndex);
    console.error('[AutoTranslate]',error);
    toast('⚠️ Không thể dịch tự động',true);
  }
}
function schedule(id,sourceField,sourceText,options={}){
  const exampleIndex=sourceField==='e'?Math.max(0,Number(options.exampleIndex)||0):0;
  const key=patchKey(id,sourceField,exampleIndex);
  clearTimeout(timers.get(key));
  if(!shouldTranslate(sourceField,sourceText))return;
  const cleanSource=normalize(sourceText);
  if(lastSource.get(key)===cleanSource)return;
  const delay=options.immediate?BLUR_DELAY_MS:DEBOUNCE_MS;
  timers.set(key,setTimeout(()=>{
    timers.delete(key);
    run(id,sourceField,cleanSource,exampleIndex);
  },delay));
}
function eventCell(e){
  const target=e.target?.closest?.('.editable[data-field="c"],.editable[data-field="e"][data-example-index]');
  if(!target||!document.getElementById('body')?.contains(target))return;
  const sourceField=target.dataset.field;
  const tr=target.closest('tr'),id=tr?.dataset.id;
  if(!id)return;
  const exampleIndex=sourceField==='e'?Number(target.dataset.exampleIndex)||0:0;
  schedule(id,sourceField,target.textContent||'',{exampleIndex,immediate:e.type==='blur'});
}
function bind(){
  if(eventsBound)return;
  const body=document.getElementById('body');
  if(!body)return;
  eventsBound=true;
  body.addEventListener('input',eventCell);
}
function boot(){
  bind();
  window.addEventListener('pagehide',flushAll,{capture:true});
  document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden')flushAll()});
}
window.AutoTranslate={
  schedule(id,textOrField,maybeText,options){
    if(typeof maybeText==='object'||maybeText===undefined)return schedule(id,'e',textOrField,maybeText||{});
    return schedule(id,textOrField,maybeText,options||{});
  },
  run,
  bind,
  flush:flushAll
};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
