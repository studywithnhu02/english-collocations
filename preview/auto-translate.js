/* Standalone real-time EN→VI translator. Collocation and example fields are independent. */
import {normalize,shouldTranslate,translationKey,targetFieldFor,isStale,sourceMatches,mergeTranslationRow} from './auto-translate-core.mjs';

const DATA_KEY='english-collocations-preview-v2';
const CACHE_KEY='english-collocations-translation-cache-v6';
const timers=new Map();
const requestVersion=new Map();
const inflight=new Map();

function readRows(){
  try{const value=JSON.parse(localStorage.getItem(DATA_KEY)||'[]');return Array.isArray(value)?value:[]}
  catch{return []}
}

function writeRows(rows){
  localStorage.setItem(DATA_KEY,JSON.stringify(rows));
  window.dispatchEvent(new CustomEvent('preview-data-updated',{detail:{source:'auto-translate'}}));
}

function readCache(){
  try{const value=JSON.parse(localStorage.getItem(CACHE_KEY)||'{}');return value&&typeof value==='object'?value:{}}
  catch{return {}}
}

function writeCache(value){try{localStorage.setItem(CACHE_KEY,JSON.stringify(value))}catch{}}

function cell(tr,field,exampleIndex=null){const suffix=(field==='e'||field==='em')&&exampleIndex!==null&&exampleIndex!==undefined?'[data-example-index="'+String(exampleIndex)+'"]':'';return tr?.querySelector(`.editable[data-field="${field}"]${suffix}`)||tr?.querySelector(`[data-field="${field}"]${suffix}`)}

function showState(tr,field,state,text=''){
  const el=cell(tr,targetFieldFor(field));
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
  if(!el){el=document.createElement('div');el.id='standaloneTranslateStatus';el.style.cssText='position:fixed;right:18px;bottom:18px;z-index:99999;padding:9px 12px;border-radius:9px;background:#172131;color:#fff;border:1px solid #34445a;font:12px system-ui;box-shadow:0 8px 24px #0004';document.body.appendChild(el)}
  el.textContent=text;el.style.borderColor=error?'#ff686d':'#36c98b';clearTimeout(el._timer);el._timer=setTimeout(()=>el.remove(),2200);
};

async function translateOnce(text){
  const key=normalize(text);if(!key)return '';
  const cache=readCache();if(cache[key])return cache[key];
  if(inflight.has(key))return inflight.get(key);
  const promise=(async()=>{
    const googleUrl='https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=vi&dt=t&q='+encodeURIComponent(key);
    try{
      const r=await fetch(googleUrl,{mode:'cors',cache:'force-cache'});
      if(r.ok){
        const d=await r.json();
        const value=normalize(Array.isArray(d?.[0])?d[0].map(x=>x?.[0]||'').join(''):'');
        if(value){cache[key]=value;writeCache(cache);return value}
      }
    }catch{}
    const memoryUrl='https://api.mymemory.translated.net/get?q='+encodeURIComponent(key)+'&langpair=en|vi';
    const r2=await fetch(memoryUrl,{mode:'cors',cache:'no-store'});
    if(!r2.ok)throw new Error('Translation HTTP '+r2.status);
    const d2=await r2.json();
    const value2=normalize(d2?.responseData?.translatedText||'');
    if(!value2)throw new Error('Empty translation');
    cache[key]=value2;writeCache(cache);return value2;
  })();
  inflight.set(key,promise);
  try{return await promise}finally{inflight.delete(key)}
}

async function run(id,sourceField,sourceText,exampleIndex=0){
  const key=translationKey(id,sourceField,sourceField==='e'?exampleIndex:null);
  const version=(requestVersion.get(key)||0)+1;requestVersion.set(key,version);
  const cleanSource=normalize(sourceText);
  if(!shouldTranslate(sourceField,cleanSource))return;
  const targetField=targetFieldFor(sourceField);
  const tr=document.querySelector(`#body tr[data-id="${CSS.escape(String(id))}"]`);
  showState(tr,sourceField,'loading','',exampleIndex);
  try{
    const translated=normalize(await translateOnce(cleanSource));
    if(isStale(requestVersion.get(key),version))return;
    const currentSourceEl=document.querySelector(`#body tr[data-id="${CSS.escape(String(id))}"] .editable[data-field="${sourceField}"][data-example-index="${exampleIndex}"]`);
    if(!sourceMatches(currentSourceEl?.textContent||currentSourceEl?.value||'',cleanSource))return;
    const rows=readRows();
    const merged=mergeTranslationRow(rows,id,sourceField,cleanSource,translated,exampleIndex);
    if(merged.changed)writeRows(merged.rows);
    const currentTr=document.querySelector(`#body tr[data-id="${CSS.escape(String(id))}"]`);
    showState(currentTr,sourceField,'done',translated,exampleIndex);
    toast('✓ Đã dịch → '+(targetField==='m'?'NGHĨA COLLOCATION':'NGHĨA CÂU VÍ DỤ'));
  }catch(error){
    if(isStale(requestVersion.get(key),version))return;
    console.error('[AutoTranslate]',error);
    const currentTr=document.querySelector(`#body tr[data-id="${CSS.escape(String(id))}"]`);
    showState(currentTr,sourceField,'error','',exampleIndex);
    toast('⚠️ Không thể dịch tự động',true);
  }
}

function schedule(id,sourceField,sourceText,options={}){
  const exampleIndex=sourceField==='e'?Math.max(0,Number(options.exampleIndex)||0):0;
  const key=translationKey(id,sourceField,sourceField==='e'?exampleIndex:null);
  clearTimeout(timers.get(key));
  if(!shouldTranslate(sourceField,sourceText))return;
  const delay=options.immediate?80:850;
  timers.set(key,setTimeout(()=>run(id,sourceField,sourceText,exampleIndex),delay));
}

function readFromEvent(el){return normalize(el?.textContent||el?.value||'')}

function bind(){
  document.querySelectorAll('#body .editable[data-field="c"],#body .editable[data-field="e"][data-example-index]').forEach(el=>{
    if(el.dataset.autoTranslateBound==='6')return;
    el.dataset.autoTranslateBound='6';
    const sourceField=el.dataset.field;
    el.addEventListener('input',()=>{const tr=el.closest('tr');const id=tr?.dataset.id;const exampleIndex=sourceField==='e'?Number(el.dataset.exampleIndex)||0:0;if(id)schedule(id,sourceField,readFromEvent(el),{exampleIndex})});
    el.addEventListener('blur',()=>{const tr=el.closest('tr');const id=tr?.dataset.id;const exampleIndex=sourceField==='e'?Number(el.dataset.exampleIndex)||0:0;if(id)schedule(id,sourceField,readFromEvent(el),{immediate:true,exampleIndex})});
  });
}

window.AutoTranslate={
  schedule(id,textOrField,maybeText,options){
    // Backward-compatible API: schedule(id, text, options) continues to mean example e→em.
    if(typeof maybeText==='object' || maybeText===undefined){
      const opts=maybeText||{};return schedule(id,'e',textOrField,opts);
    }
    return schedule(id,textOrField,maybeText,options||{});
  },
  run(id,sourceField,sourceText,exampleIndex=0){return run(id,sourceField,sourceText,exampleIndex)},
  bind
};

function boot(){
  bind();
  const body=document.getElementById('body');
  if(body&&!body.dataset.autoTranslateObserverV6){
    body.dataset.autoTranslateObserverV6='1';
    new MutationObserver(bind).observe(body,{childList:true,subtree:true});
  }
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(boot,150));else setTimeout(boot,150);
