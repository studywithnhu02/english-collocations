import {aiJson} from './ai-client.js';
import {normalizeVocabularyRow} from './vocabulary-core.mjs';
import {buildAutoFillChanges,parseAutoFillResponse,validateAutoFillResult} from './smart-ingestion-core.mjs';

const KEY='english-collocations-preview-v2';
const requestVersions=new Map();
const busyIds=new Set();

function read(){try{const value=JSON.parse(localStorage.getItem(KEY)||'[]');return Array.isArray(value)?value:[]}catch{return[]}}

function setBusy(id,on){
  const key=String(id);
  const tr=document.querySelector('#body tr[data-id="'+CSS.escape(key)+'"]');
  const cell=tr?.querySelector('.editable[data-field="c"]');
  if(cell)cell.setAttribute('data-ai-status',on?'loading':'');const structureCell=tr?.querySelector('.editable[data-field="structure"]');if(structureCell)structureCell.setAttribute('data-ai-status',on?'loading':'');
  const persist=document.getElementById('persist');
  if(persist)persist.textContent=on?'🧠 AI đang điền…':'Local data';
}

function ask(collocation,attempt=0){
  const strict=attempt>0
    ?'CRITICAL REPAIR: The previous answer was invalid. exampleEn MUST contain the exact collocation string exactly as supplied, without paraphrasing, and exampleVi MUST translate that exact sentence.'
    :'';
  return aiJson([
    {role:'system',content:'Return ONE JSON object only with exactly these keys: meaningVi, exampleEn, exampleVi, structure. Keep the supplied collocation exact. meaningVi is a concise natural Vietnamese meaning. exampleEn MUST contain the exact collocation text exactly as supplied and use it naturally in a short workplace or conversational sentence. exampleVi must be the faithful Vietnamese translation of that exact exampleEn. structure must be a reusable pattern for the collocation using + separators and placeholders such as something, someone, doing something, or to + verb. '+strict+' Do not add markdown, explanations, CEFR, tags, topics, alternatives or extra keys.'},
    {role:'user',content:JSON.stringify({collocation:String(collocation||'').trim(),attempt})}
  ],{batch:false,purpose:'autofill',maxNewTokens:256,timeoutMs:20000});
}
async function waitForTranslator(limitMs=4000){
  const started=Date.now();
  while(Date.now()-started<limitMs){
    if(typeof window.AutoTranslate?.run==='function')return window.AutoTranslate.run;
    await new Promise(resolve=>setTimeout(resolve,120));
  }
  return null;
}

export async function autoFill(id,value){
  const key=String(id),text=String(value||'').trim();
  if(!text)return;
  const version=(requestVersions.get(key)||0)+1;
  requestVersions.set(key,version);
  busyIds.add(key);
  setBusy(key,true);
  try{
    let result={meaningVi:'',exampleEn:'',exampleVi:''};
    let validation;
    for(let attempt=0;attempt<2;attempt++){
      const raw=await ask(text,attempt);
      if(requestVersions.get(key)!==version)return;
      result=parseAutoFillResponse(raw);
      validation=validateAutoFillResult(text,result);
      if(validation.ok)break;
    }
    if(requestVersions.get(key)!==version)return;
    const now=read(),current=now.find(r=>String(r.id)===key);
    if(!current||String(current.c||'').trim()!==text)return;
    const changes=buildAutoFillChanges(current,result,text);
    if(!Object.keys(changes).length)return;
    const next=now.map(r=>String(r.id)===key?normalizeVocabularyRow({...r,...changes,source:{...(r.source&&typeof r.source==='object'?r.source:{}),type:'ai'}}):r);
    if(window.PreviewTable?.setRows)window.PreviewTable.setRows(next);
    else{
      localStorage.setItem(KEY,JSON.stringify(next));
      window.dispatchEvent(new CustomEvent('preview-data-updated',{detail:{source:'ai-auto-fill'}}));
    }
    const filledExampleEn=String(changes.e||'').trim(),existingExample=String(current.e||'').trim(),exampleToTranslate=filledExampleEn||existingExample;
    if(requestVersions.get(key)===version&&exampleToTranslate&&!String(current.em||'').trim()){
      const translator=await waitForTranslator();
      if(translator&&requestVersions.get(key)===version){
        try{await translator(key,'e',exampleToTranslate)}catch(error){console.warn('[PreviewIngestion] translation fallback failed',error)}
      }
    }
  }catch(error){
    console.error('[PreviewIngestion]',error);
  }finally{
    busyIds.delete(key);
    if(requestVersions.get(key)===version)setBusy(key,false);
  }
}

window.PreviewIngestion={autoFill,maybeAutoFill:autoFill,requestVersions};
