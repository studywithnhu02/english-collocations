// Pure helpers for AI Agent output parsing. No DOM/browser globals.

export function extractJson(text){
  const raw=String(text??'').trim().replace(/^```(?:json)?\s*/i,'').replace(/\s*```$/,'').trim();
  const starts=[];
  for(let i=0;i<raw.length;i++){if(raw[i]==='['||raw[i]==='{')starts.push(i)}
  const parseCandidate=(start)=>{
    const open=raw[start],close=open==='['?']':'}';
    let depth=0,inString=false,escaped=false;
    for(let i=start;i<raw.length;i++){
      const ch=raw[i];
      if(inString){
        if(escaped){escaped=false;continue}
        if(ch==='\\'){escaped=true;continue}
        if(ch==='"'){inString=false}
        continue
      }
      if(ch==='"'){inString=true;continue}
      if(ch===open)depth++;
      else if(ch===close){
        depth--;
        if(depth===0){
          try{return JSON.parse(raw.slice(start,i+1))}catch{return null}
        }
      }
    }
    return null
  };
  for(const start of starts){const value=parseCandidate(start);if(value!==null)return value}
  throw new Error('AI không trả về JSON hợp lệ');
}

export function normalizeBatchResult(parsed){
  if(Array.isArray(parsed)) return parsed;
  if(Array.isArray(parsed?.results)) return parsed.results;
  if(Array.isArray(parsed?.items)) return parsed.items;
  if(Array.isArray(parsed?.data)) return parsed.data;
  if(parsed && typeof parsed==='object'){
    const values=Object.values(parsed).filter(v=>v&&typeof v==='object'&&!Array.isArray(v));
    if(values.length) return values;
    return [parsed];
  }
  return [];
}
