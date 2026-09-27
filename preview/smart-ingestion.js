import {aiJson} from './ai-client.js?v=3';
import {normalizeVocabularyRow} from './vocabulary-core.mjs';
import {buildAutoFillChanges,parseAutoFillResponse,validateAutoFillResult} from './smart-ingestion-core.mjs?v=2';

const KEY='english-collocations-preview-v2';
const requestVersions=new Map();
const busyIds=new Set();
const pendingById=new Map();
let queueTimer=0;
let queueIdleId=0;
let queueRunning=false;

function read(){try{const value=JSON.parse(localStorage.getItem(KEY)||'[]');return Array.isArray(value)?value:[]}catch{return[]}}

function setBusy(id,on){
  const key=String(id);
  const tr=document.querySelector('#body tr[data-id="'+CSS.escape(key)+'"]');
  const cell=tr?.querySelector('.editable[data-field="c"]');
  if(cell)cell.setAttribute('data-ai-status',on?'loading':'');
  const persist=document.getElementById('persist');
  if(persist)persist.textContent=on?'🧠 AI đang điền…':'Local data';
}

function ask(collocation,needs,attempt=0){
  const strict=attempt>0?' CRITICAL REPAIR: previous output was invalid. Preserve the collocation text exactly.':'';
  const fields=['meaningVi'];
  if(needs.example)fields.push('exampleEn','exampleVi');
  const request={collocation:String(collocation||'').trim(),requestedFields:fields,attempt};
  return aiJson([
    {role:'system',content:'Return ONE JSON object only. Allowed keys: meaningVi, exampleEn, exampleVi. Fill only the requested fields and use empty strings for all other fields. '+(needs.meaning?'meaningVi is a concise natural Vietnamese meaning.':'Do not generate meaningVi.')+' '+(needs.example?'exampleEn MUST contain the exact supplied collocation string naturally in one short sentence and exampleVi must faithfully translate that exact sentence.':'Do not generate an example sentence.')+' No markdown, explanations, CEFR, tags, topics, alternatives or extra keys.'+strict},
    {role:'user',content:JSON.stringify(request)}
  ],{batch:false,purpose:'autofill',maxNewTokens:needs.meaning&&needs.example?144:(needs.example?112:48),timeoutMs:20000});
}
async function waitForTranslator(limitMs=4000){
  const started=Date.now();
  while(Date.now()-started<limitMs){
    if(typeof window.AutoTranslate?.run==='function')return window.AutoTranslate.run;
    await new Promise(resolve=>setTimeout(resolve,120));
  }
  return null;
}

function rowStillNeedsFill(id,value){
  const rows=window.PreviewTable?.getRows?.()||read();
  const row=rows.find(r=>String(r.id)===String(id));
  if(!row)return false;
  if(String(row.c||'').trim()!==String(value||'').trim())return false;
  return !String(row.m||'').trim()||!String(row.e||'').trim();
}
function scheduleQueuePump(delay=450){
  clearTimeout(queueTimer);
  if(queueIdleId&&'cancelIdleCallback' in window)window.cancelIdleCallback(queueIdleId);
  queueIdleId=0;
  queueTimer=setTimeout(()=>{
    queueTimer=0;
    const run=()=>{queueIdleId=0;pumpQueue()};
    if('requestIdleCallback' in window)queueIdleId=requestIdleCallback(run,{timeout:1800});else run();
  },delay);
}
async function pumpQueue(){
  if(queueRunning)return;
  const first=pendingById.entries().next().value;
  if(!first)return;
  pendingById.delete(first[0]);
  queueRunning=true;
  try{await autoFill(first[1].id,first[1].value)}
  finally{queueRunning=false;if(pendingById.size)scheduleQueuePump(120)}
}
function queueAutoFill(id,value){
  const key=String(id),text=String(value||'').trim();
  if(!text||!rowStillNeedsFill(key,text))return;
  pendingById.set(key,{id:key,value:text});
  scheduleQueuePump(450);
}
export async function autoFill(id,value){
  const key=String(id),text=String(value||'').trim();
  if(!text||!rowStillNeedsFill(key,text))return;
  const version=(requestVersions.get(key)||0)+1;
  requestVersions.set(key,version);
  busyIds.add(key);
  setBusy(key,true);
  try{
    const initialRows=window.PreviewTable?.getRows?.()||read();
    const initialCurrent=initialRows.find(r=>String(r.id)===key);
    if(!initialCurrent)return;
    const needs={meaning:!String(initialCurrent.m||'').trim(),example:!String(initialCurrent.e||'').trim()};
    let result={meaningVi:'',exampleEn:'',exampleVi:''};
    let validation={ok:false};
    for(let attempt=0;attempt<2;attempt++){
      const raw=await ask(text,needs,attempt);
      if(requestVersions.get(key)!==version)return;
      result=parseAutoFillResponse(raw);
      validation=validateAutoFillResult(text,result,{requireMeaning:needs.meaning,requireExample:needs.example});
      if(validation.ok)break;
    }
    if(requestVersions.get(key)!==version)return;
    const now=read(),current=now.find(r=>String(r.id)===key);
    if(!current||String(current.c||'').trim()!==text)return;
    const changes=buildAutoFillChanges(current,result,text);
    if(!Object.keys(changes).length)return;
    const source={...(current.source&&typeof current.source==='object'?current.source:{}),type:'ai'};
    const applied=window.PreviewTable?.updateRow?.(key,{...changes,source},'row-edit',false);
    if(!applied){
      const next=now.map(r=>String(r.id)===key?normalizeVocabularyRow({...r,...changes,source}):r);
      if(window.PreviewTable?.setRows)window.PreviewTable.setRows(next);
      else{
        localStorage.setItem(KEY,JSON.stringify(next));
        window.dispatchEvent(new CustomEvent('preview-data-updated',{detail:{source:'ai-auto-fill'}}));
      }
    }
    const filledExampleEn=String(changes.e||'').trim(),existingExample=String(current.e||'').trim(),exampleToTranslate=filledExampleEn||existingExample;
    if(requestVersions.get(key)===version&&!String(changes.em||'').trim()&&exampleToTranslate&&!String(current.em||'').trim()){
      const translator=await waitForTranslator();
      if(translator&&requestVersions.get(key)===version){
        try{await translator(key,'e',exampleToTranslate)}catch(error){console.warn('[PreviewIngestion] translation fallback failed',error)}
      }
    }
  }catch(error){
    console.error('[PreviewIngestion]',error);
    const fallbackRow=(window.PreviewTable?.getRows?.()||read()).find(r=>String(r.id)===key);
    if(requestVersions.get(key)===version&&!String(fallbackRow?.m||'').trim())window.AutoTranslate?.run?.(key,'c',text).catch?.(()=>{});
  }finally{
    busyIds.delete(key);
    if(requestVersions.get(key)===version)setBusy(key,false);
  }
}

window.PreviewIngestion={autoFill,queueAutoFill,maybeAutoFill:queueAutoFill,requestVersions};
