export const CONFUSIONS=Object.freeze({
  'make a deadline':{better:'meet a deadline / beat a deadline',message:'Không dùng “make a deadline” khi muốn nói hoàn thành đúng hạn.'},
  'do a decision':{better:'make a decision',message:'Collocation chuẩn là “make a decision”, không phải “do a decision”.'},
  'make a research':{better:'do research / conduct research',message:'Với “research”, dùng “do/conduct research” tự nhiên hơn.'},
  'do a meeting':{better:'have a meeting / hold a meeting',message:'“Do a meeting” không tự nhiên trong ngữ cảnh công việc.'}
});

export const SYNONYMS=Object.freeze({allow:['permit','authorize'],make:['create','produce'],improve:['enhance','optimize'],use:['utilize','apply'],help:['assist','support'],start:['begin','launch'],show:['display','present'],need:['require']});

export const SUGGESTION_BANK=Object.freeze({
  allow:['allow access','allow customers to','allow users to','allow someone to','allow time for'],
  make:['make a decision','make a plan','make progress','make a mistake','make sure'],
  do:['do business','do research','do your best','do the work','do a task'],
  take:['take action','take ownership','take responsibility','take a break','take part in'],
  meet:['meet a deadline','meet a requirement','meet a need','meet a target','meet expectations'],
  pay:['pay attention to','pay a fee','pay a bill','pay for','pay off'],
  raise:['raise a concern','raise an issue','raise a question','raise awareness','raise funds'],
  gain:['gain experience','gain access','gain trust','gain insight','gain confidence'],
  improve:['improve user experience','improve performance','improve communication','improve efficiency','improve quality'],
  reach:['reach a goal','reach an agreement','reach a decision','reach a target','reach an audience'],
  strong:['strong evidence','strong demand','strong relationship','strong impact','strong preference'],
  high:['high priority','high quality','high demand','high risk','high performance'],
  low:['low cost','low risk','low priority','low demand','low impact'],
  user:['user experience','user interface','user research','user feedback','user journey']
});

export function normalizeSmartInput(value){return String(value??'').trim().toLowerCase().replace(/[.,!?;:]+$/,'')}
function unique(values){
  const seen=new Set();
  return values.filter(value=>{
    const key=String(value||'').trim().toLowerCase();
    if(!key||seen.has(key))return false;
    seen.add(key);
    return true;
  });
}

export function fastSuggestions(value){
  const q=normalizeSmartInput(value);
  if(q.length<2)return [];
  const words=q.split(/\s+/).filter(Boolean);
  const head=words[0]||'';
  const bank=SUGGESTION_BANK[head]||[];
  const fromHead=bank.filter(item=>{
    const low=item.toLowerCase();
    return low.startsWith(q)&&low!==q;
  });
  if(fromHead.length)return unique(fromHead).slice(0,5);
  if(head.length<3)return [];
  const global=Object.values(SUGGESTION_BANK).flat().filter(item=>{
    const low=item.toLowerCase();
    return low.includes(q)&&low!==q;
  });
  return unique(global).slice(0,5);
}
export function synonymsFor(value){const head=normalizeSmartInput(value).split(/\s+/).pop()||'';return (SYNONYMS[head]||[]).slice(0,3)}
export function ruleRefinement(value){const key=normalizeSmartInput(value),hit=CONFUSIONS[key];return hit?{better:hit.better,warning:hit.message}:null}
export function refinementPrompt(rows){return JSON.stringify((Array.isArray(rows)?rows:[]).map((row,index)=>({index:index+1,id:String(row?.id??''),collocation:String(row?.c??'').trim()})))}