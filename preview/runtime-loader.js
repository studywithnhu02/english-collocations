const MODULES=Object.freeze({
  goals:'./goals-ui.js?v=1',
  srs:'./srs-ui.js?v=1',
  aiAgent:'./ai-agent.js?v=12',
  domains:'./domains-ui.js?v=3',
  vocabulary:'./vocabulary-ui.js?v=8',
  quiz:'./quiz-ui.js?v=1',
  focus:'./focus-ui.js?v=1',
  family:'./family-ui.js?v=1',
  coverage:'./coverage-ui.js?v=1',
  coach:'./coach-ui.js?v=2',
  anki:'./anki-export.js?v=1',
  print:'./print-export.js?v=1',
  grammar:'./grammar-ui.js?v=6',
  grammarExercises:'./grammar-exercises.js?v=1',
  grammarFigma:'./grammar-figma-polish.js?v=1',
  collocationFigma:'./collocation-figma-25-8.js?v=1'
});
const loaded=new Map(),queued=new Set();
function load(name){
  const path=MODULES[name];
  if(!path)return Promise.reject(new Error('Unknown Preview module: '+name));
  if(!loaded.has(name))loaded.set(name,import(path));
  return loaded.get(name);
}
function defer(fn,timeout=1800){
  if('requestIdleCallback' in window)return requestIdleCallback(fn,{timeout});
  return setTimeout(fn,Math.min(timeout,2200));
}
function loadBatch(names,timeout=1800){
  const batch=names.filter(name=>!loaded.has(name)&&!queued.has(name));
  if(!batch.length)return;
  batch.forEach(name=>queued.add(name));
  defer(async()=>{
    await Promise.all(batch.map(async name=>{
      try{await load(name)}catch(error){console.warn('[PreviewModules]',name,error)}
      finally{queued.delete(name)}
    }));
  },timeout);
}
async function loadGrammar(){
  await Promise.all([load('grammarFigma'),load('grammar'),load('grammarExercises')]);
  return true;
}
async function loadAI(){return load('aiAgent')}
window.PreviewModules={load,loadAI,loadGrammar,paths:MODULES};

// Keep only the visual shell on the critical path.
// Feature modules stay deferred so first interaction is not competing with startup work.
load('collocationFigma').catch(error=>console.warn('[PreviewModules] collocationFigma',error));

loadBatch(['domains','vocabulary'],1400);
loadBatch(['goals','srs','coverage','coach'],4200);
loadBatch(['quiz','focus','family','anki','print'],7200);

let aiRequested=false;
function maybeLoadAI(){
  if(aiRequested)return;
  const count=document.querySelectorAll('#body .row-check:checked').length;
  if(count<3||count>5)return;
  aiRequested=true;
  loadAI().catch(error=>{aiRequested=false;console.warn('[PreviewModules] AI Agent deferred load failed',error)});
}
document.addEventListener('change',event=>{
  if(event.target?.matches?.('#body .row-check'))maybeLoadAI();
},{passive:true});
