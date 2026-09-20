export const FIELD_LANGUAGE = Object.freeze({ c: 'en', m: 'vi', e: 'en', em: 'vi' });

const WORD_RE = /[A-Za-zÀ-ỹĐđ]+(?:['’][A-Za-zÀ-ỹĐđ]+)*/gu;

export function languageForField(field){
  return FIELD_LANGUAGE[field] || 'en';
}

export function tokenize(text){
  const value=String(text ?? '');
  const out=[];
  WORD_RE.lastIndex=0;
  let m;
  while((m=WORD_RE.exec(value))) out.push({word:m[0],start:m.index,end:m.index+m[0].length});
  WORD_RE.lastIndex=0;
  return out;
}

export function shouldIgnoreWord(word,{lang='en',ignoreWords=new Set()}={}){
  const value=String(word ?? '');
  if(!value || value.length<=1 || /\d/.test(value)) return true;
  if(ignoreWords.has(value) || ignoreWords.has(value.toLowerCase())) return true;
  const lower=value.toLowerCase();
  const domainTerms = lang==='en'
    ? new Set(['ui','ux','uiux','api','apis','html','css','js','javascript','typescript','webgpu','qwen','ollama','supabase','figma','miro','notion','jira','saas','fintech','banking','insurance','collocation','collocations','frontend','backend','wireframe','wireframes','prototype','prototypes','usability','microcopy','dropdown','login','signup','onboarding','checkout','dashboard','roadmap','workflow','workflows','deadline','deadlines'])
    : new Set(['ui','ux','api','apis','html','css','js','javascript','typescript','webgpu','qwen','ollama','supabase','figma','miro','notion','jira','saas','fintech','frontend','backend','wireframe','wireframes','prototype','prototypes']);
  if(domainTerms.has(lower)) return true;
  if(lang==='en' && /^[A-Z]{2,8}$/.test(value)) return true;
  return false;
}

function preserveCase(source,replacement){
  const s=String(source),r=String(replacement);
  if(!r) return r;
  if(s===s.toUpperCase()) return r.toUpperCase();
  if(/^[A-ZÀ-ÝĐ][a-zà-ỹđ]*$/.test(s)) return r.charAt(0).toUpperCase()+r.slice(1);
  return r;
}

export function normalizeSuggestions(word,suggestions,limit=5){
  const seen=new Set(),out=[];
  for(const suggestion of Array.isArray(suggestions)?suggestions:[]) {
    const value=preserveCase(word,String(suggestion).trim());
    const key=value.toLocaleLowerCase('vi-VN');
    if(!value || key===String(word).toLocaleLowerCase('vi-VN') || seen.has(key)) continue;
    seen.add(key); out.push(value);
    if(out.length>=limit) break;
  }
  return out;
}

export function findSpellingErrors(text,spell,{lang='en',ignoreWords=new Set(),maxErrors=100}={}){
  const errors=[];
  for(const token of tokenize(text)){
    if(shouldIgnoreWord(token.word,{lang,ignoreWords})) continue;
    let correct=true;
    try{correct=spell.correct(token.word);}catch{correct=true;}
    if(correct) continue;
    let suggestions=[];
    try{suggestions=normalizeSuggestions(token.word,spell.suggest(token.word),5);}catch{}
    errors.push({...token,suggestions});
    if(errors.length>=maxErrors) break;
  }
  return errors;
}

export function findSearchIntervals(text,query){
  const value=String(text ?? ''),q=String(query ?? '').trim();
  if(!q) return [];
  const escaped=q.replace(/[.*+?^${}()|[\\]\\]/g,'\\$&');
  const re=new RegExp(escaped,'giu'),out=[];
  let m; while((m=re.exec(value))) out.push({start:m.index,end:m.index+m[0].length});
  return out;
}

export function decorateHtml(text,errors=[],query=''){
  const value=String(text ?? '');
  const safeErrors=Array.isArray(errors)?errors:[];
  const search=findSearchIntervals(value,query);
  const boundaries=new Set([0,value.length]);
  for(const e of safeErrors){boundaries.add(e.start);boundaries.add(e.end);}
  for(const s of search){if(!safeErrors.some(e=>e.start<s.end&&s.start<e.end)){boundaries.add(s.start);boundaries.add(s.end);}}
  const points=[...boundaries].filter(Number.isFinite).sort((a,b)=>a-b);
  const esc=s=>String(s).replace(/[&<>"']/g,a=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[a]));
  let html='';
  for(let i=0;i<points.length-1;i++){
    const start=points[i],end=points[i+1],segment=value.slice(start,end);
    const errorIndex=safeErrors.findIndex(e=>e.start<=start&&end<=e.end);
    const isSearch=search.some(s=>s.start<=start&&end<=s.end);
    if(errorIndex<0&&!isSearch){html+=esc(segment);continue;}
    const classes=[];
    if(errorIndex>=0) classes.push('spell-error');
    if(isSearch) classes.push('spell-search-hit');
    let attrs='';
    if(errorIndex>=0) attrs=' data-spell-error="1" data-spell-index="'+errorIndex+'"';
    html+='<span class="'+classes.join(' ')+'"'+attrs+'>'+esc(segment)+'</span>';
  }
  return html||esc(value);
}
