import nspellModule from 'https://esm.sh/nspell@2.1.5?bundle';
import {findSpellingErrors} from './spellcheck-core.mjs';

const nspell=nspellModule?.default||nspellModule;
const dictionaries=new Map();

const DOMAIN_ALLOWLIST={
  en:new Set(['ui','ux','uiux','api','apis','html','css','js','javascript','typescript','webgpu','qwen','ollama','supabase','figma','miro','notion','jira','saas','fintech','banking','insurance','collocation','collocations','frontend','backend','wireframe','wireframes','prototype','prototypes','usability','microcopy','dropdown','login','signup','onboarding','checkout','dashboard','roadmap','workflow','workflows','deadline','deadlines']),
  vi:new Set(['ui','ux','api','apis','html','css','js','javascript','typescript','webgpu','qwen','ollama','supabase','figma','miro','notion','jira','saas','fintech','frontend','backend','wireframe','wireframes','prototype','prototypes'])
};

async function loadSpell(lang){
  if(dictionaries.has(lang)) return dictionaries.get(lang);
  const base='./dictionaries/'+lang+'/';
  const [aff,dic]=await Promise.all([
    fetch(base+'index.aff').then(r=>{if(!r.ok)throw Error('Không tải được dictionary '+lang+'.aff');return r.text()}),
    fetch(base+'index.dic').then(r=>{if(!r.ok)throw Error('Không tải được dictionary '+lang+'.dic');return r.text()})
  ]);
  const spell=nspell(aff,dic);
  spell.personal([...DOMAIN_ALLOWLIST[lang]].join('\n'));
  dictionaries.set(lang,spell);
  return spell;
}

self.onmessage=async({data})=>{
  const {id,text,lang}=data||{};
  try{
    const spell=await loadSpell(lang);
    const errors=findSpellingErrors(String(text??''),spell,{lang,ignoreWords:DOMAIN_ALLOWLIST[lang]||new Set(),maxErrors:80});
    self.postMessage({id,ok:true,errors});
  }catch(error){
    self.postMessage({id,ok:false,error:error?.message||String(error)});
  }
};
