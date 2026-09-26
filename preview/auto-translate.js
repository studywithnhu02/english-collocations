/* Fast browser-local EN→VI translator.
   Goals: keep typing responsive, dedupe requests, cache in memory, limit concurrency,
   avoid full-cache localStorage writes, and only translate when text actually changed. */
import {normalize,shouldTranslate,translationKey,targetFieldFor,isStale,sourceMatches,mergeTranslationRow} from './auto-translate-core.mjs';

const DATA_KEY='english-collocations-preview-v2';
const CACHE_KEY='english-collocations-translation-cache-v7';
const CACHE_MAX=800;
const DEBOUNCE_MS=650;
const BLUR_DELAY_MS=100;
const PROVIDER_TIMEOUT_MS=2200;
const MAX_CONCURRENCY=3;

const timers=new Map();
const requestVersion=new Map();
const inflight=new Map();
const lastSource=new Map();
const queue=[];
let activeRequests=0;
let memoryCache=null;
let cacheWriteTimer=0;

function readRows(){
  try{const value=JSON.parse(localStorage.getItem(DATA_KEY)||'[]');return Array.isArray(value)?value:[]}
  catch{return []}
}
function writeRows(rows){
  localStorage.setItem(DATA_KEY,JSON.stringify(rows));
  window.dispatchEvent(new CustomEvent('preview-data-updated',{detail:{source:'auto-translate'}}));
}
function getCache(){
  if(memoryCache)return memoryCache;
  try{
    const value=JSON.parse(localStorage.getItem(CACHE_KEY)||'{}');
    memoryCache=value&&typeof value==='object'&&!Array.isArray(value)?value:{};
  }catch{memoryCache={}}
  return memoryCache;
}
function scheduleCacheWrite(){
  clearTimeout(cacheWriteTimer);
  cacheWriteTimer=setTimeout(()=>{
    cacheWriteTimer=0;
    try{
      const entries=Object.entries(getCache());
      const trimmed=entries.slice(Math.max(0,entries.length-CACHE_MAX));
      localStorage.setItem(CACHE_KEY,JSON.stringify(Object.fromEntries(trimmed)));
    }catch{}
  },250);
}
function seedCacheFromRows(){
  const rows=readRows(),cache=getCache();
  for(const row of rows){
    const c=normalize(row?.c||''),m=normalize(row?.m||'');
    if(c&&m)cache[c]=m;
    const examples=Array.isArray(row?.examples)?row.examples:[];
    examples.forEach(ex=>{const e=normalize(ex?.e||''),em=normalize(ex?.em||'');if(e&&em)cache[e]=em});
    const e0=normalize(row?.e||''),em0=normalize(row?.em||'');
    if(e0&&em0)cache[e0]=em0;
  }
}
function cacheGet(key){
  const value=getCache()[key];
  return value?value:'';
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
function cell(tr,field,exampleIndex=null){
  const hasExample=(field==='e'||field==='em')&&exampleIndex!==null&&exampleIndex!==undefined;
  if(hasExample){
    const selector='[data-field="'+field+'"][data-example-index="'+String(exampleIndex)+'"]';
    return tr?.querySelector('.editable'+selector)||tr?.querySelector(selector)||null;
  }
  return tr?.querySelector('.editable[data-field="'+field+'"]')||tr?.querySelector('[data-field="'+field+'"]')||null;
}
function showState(tr,field,state,text='',exampleIndex=0){
  const el=cell(tr,targetFieldFor(field),field==='e'?exampleIndex:null);
  if(!el)return;
  if(el.dataset.autoOriginal==null)el.dataset.autoOriginal=el.textContent||'';
  if(state==='loading'){
    el.classList.add('translation','translating');
    el.textContent='⏳ Đang dịch…';
  }else if(state==='done'){
    el.classList.remove('translating');
    el.classList.add('translation','auto-translated');
    el.textContent=text;
    delete el.dataset.autoOriginal;
  }else if(state==='error'){
    el.classList.remove('translating');
    if(el.dataset.autoOriginal!=null){el.textContent=el.dataset.autoOriginal;delete el.dataset.autoOriginal}
  }
}
const toast=(text,error=false)=>{
  let el=document.getElementById('standaloneTranslateStatus');
  if(!el){
    el=document.createElement('div');
    el.id='standaloneTranslateStatus';
    el.style.cssText='position:fixed;right:18px;bottom:18px;z-index:99999;padding:9px 12px;border-radius:9px;background:#172131;color:#fff;border:1px solid #34445a;font:12px system-ui;box-shadow:0 8px 24px #0004';
    document.body.appendChild(el);
  }
  el.textContent=text;
  el.style.borderColor=error?'#ff686d':'#36c98b';
  clearTimeout(el._timer);
  el._timer=setTimeout(()=>el.remove(),2200);
};

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
async function fetchWithTimeout(url,options={}){
  const controller=new AbortController();
  const timer=setTimeout(()=>controller.abort(),PROVIDER_TIMEOUT_MS);
  try{
    return await fetch(url,{...options,signal:controller.signal});
  }finally{clearTimeout(timer)}
}
async function requestTranslation(key){
  const cached=cacheGet(key);
  if(cached)return cached;
  if(inflight.has(key))return inflight.get(key);
  const promise=new Promise((resolve,reject)=>{
    enqueue(async()=>{
      try{
        const googleUrl='https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=vi&dt=t&q='+encodeURIComponent(key);
        try{
          const r=await fetchWithTimeout(googleUrl,{mode:'cors',cache:'force-cache'});
          if(r.ok){
            const d=await r.json();
            const value=normalize(Array.isArray(d?.[0])?d[0].map(x=>x?.[0]||'').join(''):'');
            if(value){cacheSet(key,value);resolve(value);return}
          }
        }catch{}
        const memoryUrl='https://api.mymemory.translated.net/get?q='+encodeURIComponent(key)+'&langpair=en|vi';
        const r2=await fetchWithTimeout(memoryUrl,{mode:'cors',cache:'force-cache'});
        if(!r2.ok)throw new Error('Translation HTTP '+r2.status);
        const d2=await r2.json();
        const value2=normalize(d2?.responseData?.translatedText||'');
        if(!value2)throw new Error('Empty translation');
        cacheSet(key,value2);
        resolve(value2);
      }catch(error){reject(error)}
    });
  });
  inflight.set(key,promise);
  try{return await promise}finally{inflight.delete(key)}
}
async function run(id,sourceField,sourceText,exampleIndex=0){
  const key=translationKey(id,sourceField,sourceField==='e'?exampleIndex:null);
  const version=(requestVersion.get(key)||0)+1;
  requestVersion.set(key,version);
  const cleanSource=normalize(sourceText);
  if(!shouldTranslate(sourceField,cleanSource))return;
  if(lastSource.get(key)===cleanSource)return;
  const targetField=targetFieldFor(sourceField);
  const tr=document.querySelector('#body tr[data-id="'+CSS.escape(String(id))+'"]');
  showState(tr,sourceField,'loading','',exampleIndex);
  try{
    const translated=normalize(await requestTranslation(cleanSource));
    if(isStale(requestVersion.get(key),version))return;
    const currentTr=document.querySelector('#body tr[data-id="'+CSS.escape(String(id))+'"]');
    const currentSourceEl=cell(currentTr,sourceField,sourceField==='e'?exampleIndex:null);
    if(!sourceMatches(currentSourceEl?.textContent||currentSourceEl?.value||'',cleanSource))return;
    const rows=readRows();
    const merged=mergeTranslationRow(rows,id,sourceField,cleanSource,translated,exampleIndex);
    if(merged.changed)writeRows(merged.rows);
    lastSource.set(key,cleanSource);
    const finalTr=document.querySelector('#body tr[data-id="'+CSS.escape(String(id))+'"]');
    showState(finalTr,sourceField,'done',translated,exampleIndex);
    toast('✓ Đã dịch → '+(targetField==='m'?'NGHĨA COLLOCATION':'NGHĨA CÂU VÍ DỤ'));
  }catch(error){
    if(isStale(requestVersion.get(key),version))return;
    if(lastSource.get(key)===cleanSource)lastSource.delete(key);
    console.error('[AutoTranslate]',error);
    const currentTr=document.querySelector('#body tr[data-id="'+CSS.escape(String(id))+'"]');
    showState(currentTr,sourceField,'error','',exampleIndex);
    toast('⚠️ Không thể dịch tự động',true);
  }
}
function schedule(id,sourceField,sourceText,options={}){
  const exampleIndex=sourceField==='e'?Math.max(0,Number(options.exampleIndex)||0):0;
  const key=translationKey(id,sourceField,sourceField==='e'?exampleIndex:null);
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
function readFromEvent(el){return normalize(el?.textContent||el?.value||'')}
function bind(){
  document.querySelectorAll('#body .editable[data-field="c"],#body .editable[data-field="e"][data-example-index]').forEach(el=>{
    if(el.dataset.autoTranslateBound==='7')return;
    el.dataset.autoTranslateBound='7';
    const sourceField=el.dataset.field;
    el.addEventListener('input',()=>{
      const tr=el.closest('tr'),id=tr?.dataset.id,exampleIndex=sourceField==='e'?Number(el.dataset.exampleIndex)||0:0;
      if(id)schedule(id,sourceField,readFromEvent(el),{exampleIndex});
    });
    el.addEventListener('blur',()=>{
      const tr=el.closest('tr'),id=tr?.dataset.id,exampleIndex=sourceField==='e'?Number(el.dataset.exampleIndex)||0:0;
      if(id)schedule(id,sourceField,readFromEvent(el),{immediate:true,exampleIndex});
    });
  });
}
function bindWhenIdle(){
  if('requestIdleCallback' in window){
    requestIdleCallback(bind,{timeout:700});
  }else setTimeout(bind,120);
}
function boot(){
  seedCacheFromRows();
  bindWhenIdle();
  const body=document.getElementById('body');
  if(body&&!body.dataset.autoTranslateObserverV7){
    body.dataset.autoTranslateObserverV7='1';
    const observer=new MutationObserver(()=>{
      bindWhenIdle();
    });
    observer.observe(body,{childList:true,subtree:true});
  }
}
window.AutoTranslate={
  schedule(id,textOrField,maybeText,options){
    if(typeof maybeText==='object'||maybeText===undefined){
      const opts=maybeText||{};
      return schedule(id,'e',textOrField,opts);
    }
    return schedule(id,textOrField,maybeText,options||{});
  },
  run(id,sourceField,sourceText,exampleIndex=0){return run(id,sourceField,sourceText,exampleIndex)},
  bind
};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
