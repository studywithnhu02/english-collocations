export const CEFR_LEVELS=Object.freeze(['A1','A2','B1','B2','C1','C2']);
export const DOMAIN_TAGS=Object.freeze(['UI/UX Design','Banking/Fintech','Insurance','Technology','Email','Business','Meetings','Daily Chat','Research','Product','Project Management','Customer Service','Risk/Compliance']);
export const CEFR_RANK=Object.freeze({A1:1,A2:2,B1:3,B2:4,C1:5,C2:6});
export const CEFR_OVERRIDES=Object.freeze({
  'meet a deadline':'B2','take responsibility':'B2','take ownership':'B2','raise awareness':'B2',
  'reach an agreement':'B2','reach a decision':'B2','provide feedback':'B1','user experience':'B2',
  'user interface':'B1','user research':'B2','design system':'B2','user-centered design':'B2',
  'conduct research':'B2','conduct an analysis':'B2','regulatory compliance':'C1','mitigate risk':'C1',
  'implement a solution':'C1','facilitate a meeting':'C1','optimize performance':'C1','undertake a project':'C1'
});
const CEFR_HEAD_HINTS=Object.freeze({
  allow:'B1',make:'A1',do:'A1',take:'A1',meet:'B1',pay:'A1',raise:'B1',gain:'B1',
  improve:'B1',reach:'B1',provide:'B1',have:'A1',give:'A1',get:'A1',set:'A1',keep:'B1',use:'A1',
  work:'A1',project:'B1',deadline:'B1',requirement:'B2',feedback:'B1',decision:'B1',issue:'B1',
  risk:'B2',user:'A2',experience:'B1',customer:'A2',payment:'B1',account:'A2',claim:'B1',
  policy:'B1',premium:'B2',transaction:'B2',security:'B2',compliance:'C1',performance:'B2',
  feature:'A2',design:'A2',research:'B1',analysis:'B2',data:'A2',system:'A2',app:'A2',
  website:'A2',meeting:'A2',report:'A2',update:'A2',support:'A2',solution:'B1',strategy:'B2',
  goal:'A2',target:'A2',quality:'B1',cost:'A2',budget:'B1',process:'B1',approval:'B1',launch:'B1',
  build:'A2',develop:'B1',create:'A1',manage:'B1',review:'B1',check:'A1',resolve:'B1',
  evaluate:'B2',identify:'B1',solve:'A1',organize:'A2',schedule:'A2',attend:'A2',discuss:'B1',
  present:'B1',propose:'B2',approve:'B1',reject:'B1',monitor:'B1',measure:'B1',prioritize:'B2',
  estimate:'B2',allocate:'B2',resource:'B1',stakeholder:'B2'
});
const CEFR_RULES=[
  [/\b(undertake|mitigate|optimize|facilitate|implement|leverage|streamline|regulatory)\b/i,'C1'],
  [/\b(experience|performance|research|compliance|transaction|stakeholder|strategy|prototype|usability)\b/i,'B2'],
  [/\b(deadline|requirement|feedback|project|meeting|support|customer|account|payment|claim)\b/i,'B1'],
  [/^(work|help|use|start|show|need|make|do|go|come|have|get|give|take)\b/i,'A1']
];
export function normalizeCefr(value,fallback=''){const v=String(value??'').trim().toUpperCase();return CEFR_LEVELS.includes(v)?v:fallback}
export function inferCefr(collocation){const value=String(collocation??'').trim(),override=CEFR_OVERRIDES[value.toLowerCase()];if(override)return override;for(const [re,level] of CEFR_RULES)if(re.test(value))return level;const head=value.split(/\s+/)[0]?.toLowerCase()||'';return CEFR_HEAD_HINTS[head]||''}
export function normalizeList(value,allowed=null){const values=Array.isArray(value)?value:[value];const valid=Array.isArray(allowed)?new Set(allowed):null;return [...new Set(values.map(v=>String(v??'').trim().replace(/\s+/g,' ')).filter(v=>v.length>=2&&(!valid||valid.has(v))))].slice(0,8)}
export function normalizeExamples(value,fallbackExample='',fallbackMeaning=''){
 const source=Array.isArray(value)?value.map(item=>({
   e:String(item?.e??item?.example??'').trim(),
   em:String(item?.em??item?.meaning??item?.exampleMeaning??'').trim()
 })).filter(item=>item.e||item.em):[];
 if(source.length)return source;
 const e=String(fallbackExample??'').trim(),em=String(fallbackMeaning??'').trim();
 return e||em?[{e,em}]:[];
}
export function normalizeVocabularyRow(row={}){
 const source=row.source&&typeof row.source==='object'?row.source:{},quality=row.quality&&typeof row.quality==='object'?row.quality:{},learning=row.learning&&typeof row.learning==='object'?row.learning:{},c=String(row.c??'').trim(),structure=String(row.structure??'').trim();
 const examples=normalizeExamples(row.examples,row.e??row.example,row.em);
 const first=examples[0]||{e:'',em:''};
 return {...row,structure,doneAt:String(row.doneAt??''),cefr:normalizeCefr(row.cefr,''),domains:normalizeList(row.domains??row.tags??[]),tags:normalizeList(row.tags??[]),examples,e:first.e,em:first.em,source:{type:['manual','ai','library'].includes(source.type)?source.type:'manual'},quality:{naturalnessScore:Number.isFinite(Number(quality.naturalnessScore))?Math.max(0,Math.min(100,Math.round(Number(quality.naturalnessScore)))):null,reviewedAt:String(quality.reviewedAt??'')},learning:{lastReviewedAt:String(learning.lastReviewedAt??''),reviewCount:Math.max(0,Math.floor(Number(learning.reviewCount)||0))}};
}
export function toggleListValue(list,value,limit=8,allowed=null){const current=normalizeList(list,allowed),v=String(value??'').trim();if(!v||current.includes(v))return current.filter(x=>x!==v);if(Array.isArray(allowed)&&!allowed.includes(v))return current;return current.length<limit?[...current,v]:current}
export function averageCefr(rows){const levels=(Array.isArray(rows)?rows:[]).map(r=>normalizeCefr(r.cefr,inferCefr(r.c))).filter(l=>CEFR_LEVELS.includes(l));if(!levels.length)return null;const avg=levels.reduce((s,l)=>s+CEFR_RANK[l],0)/levels.length,rank=Math.max(1,Math.min(6,Math.round(avg)));return Object.entries(CEFR_RANK).find(([,v])=>v===rank)?.[0]||null}
export function domainCounts(rows){const counts={};for(const r of Array.isArray(rows)?rows:[])for(const d of normalizeList(r.domains??r.tags,DOMAIN_TAGS))counts[d]=(counts[d]||0)+1;return counts}
export function cefrCounts(rows){const counts=Object.fromEntries(CEFR_LEVELS.map(l=>[l,0]));for(const r of Array.isArray(rows)?rows:[]){const level=normalizeCefr(r.cefr,'');if(level)counts[level]++;}return counts}
export const LEVEL_UP_RULES=Object.freeze({'do a project':{suggestions:[['undertake a project','C1'],['run a project','B2']],reason:'Tự nhiên và chuyên nghiệp hơn trong văn cảnh công việc.'},'make a project':{suggestions:[['undertake a project','C1'],['develop a project','B2']],reason:'“Make a project” không phải lựa chọn tự nhiên trong nhiều ngữ cảnh công việc.'},'do a research':{suggestions:[['conduct research','B2'],['carry out research','B2']],reason:'Hai cụm này tự nhiên hơn “do a research”.'}});
export function levelUp(value){return LEVEL_UP_RULES[String(value??'').trim().toLowerCase()]||null}
