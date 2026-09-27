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
const loaded=new Map();
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
function stagedLoad(names,index=0){
  if(index>=names.length)return;
  defer(async()=>{
    try{await load(names[index])}catch(error){console.warn('[PreviewModules]',names[index],error)}
    stagedLoad(names,index+1);
  },index===0?1800:900);
}
async function loadGrammar(){
  await Promise.all([load('grammarFigma'),load('grammar'),load('grammarExercises')]);
  return true;
}
window.PreviewModules={load,loadGrammar,paths:MODULES};
stagedLoad(['vocabulary','goals','srs','coverage','coach','domains','quiz','focus','family','anki','print','aiAgent']);
