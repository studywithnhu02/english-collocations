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
  if(cell)cell.setAttribute('data-ai-status',on?'loading':'');
  const persist=document.getElementById('persist');
  if(persist)persist.textContent=on?'🧠 AI đang điền…':'Local data';
}

function ask(collocation){
  return aiJson([
    {role:'system',content:'Return ONE JSON object only with exactly these keys: meaningVi, exampleEn, exampleVi. Keep the supplied collocation exact. meaningVi is a concise natural Vietnamese meaning. exampleEn is one short natural workplace or conversational English sentence that uses the supplied collocation naturally. exampleVi must be the faithful Vietnamese translation of that exact exampleEn. Do not add markdown, explanations, CEFR, tags, topics, alternatives or extra keys.'},
    {role:'user',content:JSON.stringify({collocation:String(collocation||'').trim()})}
  ],{batch:false,purpose:'autofill',maxNewTokens:256,timeoutMs:20000});
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
    const filledExampleEn=String(changes.e||'').trim();
    const fresh=read().find(r=>String(r.id)===key);
    if(requestVersions.get(key)===version&&filledExampleEn&&!String(current.em||'').trim()){
      const translator=await waitForTranslator();
      if(translator&&requestVersions.get(key)===version){
        try{await translator(key,'e',filledExampleEn)}catch(error){console.warn('[PreviewIngestion] translation fallback failed',error)}
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
