export const CEFR_LEVELS=Object.freeze(['A1','A2','B1','B2','C1','C2']);
export const DOMAIN_TAGS=Object.freeze(['UI/UX Design','Banking/Fintech','Insurance','Technology','Email','Business','Meetings','Daily Chat','Research','Product','Project Management','Customer Service','Risk/Compliance']);
export const CEFR_RANK=Object.freeze({A1:1,A2:2,B1:3,B2:4,C1:5,C2:6});
const CEFR_RULES=[
  [/\b(undertake|mitigate|optimize|facilitate|implement|leverage|streamline|regulatory)\b/i,'C1'],
  [/\b(experience|performance|research|compliance|transaction|stakeholder|strategy|prototype|usability)\b/i,'B2'],
  [/\b(deadline|requirement|feedback|project|meeting|support|customer|account|payment|claim)\b/i,'B1'],
  [/^(work|help|use|start|show|need|make|do|go|come|have|get|give|take)\b/i,'A1']
];
export function normalizeCefr(value,fallback='B1'){const v=String(value??'').trim().toUpperCase();return CEFR_LEVELS.includes(v)?v:fallback}
export function inferCefr(collocation){const value=String(collocation??'').trim();for(const [re,level] of CEFR_RULES)if(re.test(value))return level;return value.split(/\s+/).length>=3?'B1':'A2'}
export function normalizeList(value,allowed=DOMAIN_TAGS){const values=Array.isArray(value)?value:[value],valid=new Set(allowed);return [...new Set(values.map(v=>String(v??'').trim()).filter(v=>valid.has(v)))].slice(0,8)}
export function normalizeVocabularyRow(row={}){
 const source=row.source&&typeof row.source==='object'?row.source:{},quality=row.quality&&typeof row.quality==='object'?row.quality:{},learning=row.learning&&typeof row.learning==='object'?row.learning:{},c=String(row.c??'').trim();
 return {...row,cefr:normalizeCefr(row.cefr,inferCefr(c)),domains:normalizeList(row.domains??row.tags??[],DOMAIN_TAGS),tags:normalizeList(row.tags??[],DOMAIN_TAGS),source:{type:['manual','ai','library'].includes(source.type)?source.type:'manual'},quality:{naturalnessScore:Number.isFinite(Number(quality.naturalnessScore))?Math.max(0,Math.min(100,Math.round(Number(quality.naturalnessScore)))):null,reviewedAt:String(quality.reviewedAt??'')},learning:{lastReviewedAt:String(learning.lastReviewedAt??''),reviewCount:Math.max(0,Math.floor(Number(learning.reviewCount)||0))}};
}
export function toggleListValue(list,value,limit=8){const current=normalizeList(list,DOMAIN_TAGS),v=String(value??'').trim();if(!DOMAIN_TAGS.includes(v))return current;return current.includes(v)?current.filter(x=>x!==v):current.length<limit?[...current,v]:current}
export function averageCefr(rows){const levels=(Array.isArray(rows)?rows:[]).map(r=>normalizeCefr(r.cefr,inferCefr(r.c)));if(!levels.length)return null;const avg=levels.reduce((s,l)=>s+CEFR_RANK[l],0)/levels.length,rank=Math.max(1,Math.min(6,Math.round(avg)));return Object.entries(CEFR_RANK).find(([,v])=>v===rank)?.[0]||'B1'}
export function domainCounts(rows){const counts={};for(const r of Array.isArray(rows)?rows:[])for(const d of normalizeList(r.domains??r.tags,DOMAIN_TAGS))counts[d]=(counts[d]||0)+1;return counts}
export function cefrCounts(rows){const counts=Object.fromEntries(CEFR_LEVELS.map(l=>[l,0]));for(const r of Array.isArray(rows)?rows:[])counts[normalizeCefr(r.cefr,inferCefr(r))]++;return counts}
export const LEVEL_UP_RULES=Object.freeze({'do a project':{suggestions:[['undertake a project','C1'],['run a project','B2']],reason:'Tự nhiên và chuyên nghiệp hơn trong văn cảnh công việc.'},'make a project':{suggestions:[['undertake a project','C1'],['develop a project','B2']],reason:'“Make a project” không phải lựa chọn tự nhiên trong nhiều ngữ cảnh công việc.'},'do a research':{suggestions:[['conduct research','B2'],['carry out research','B2']],reason:'Hai cụm này tự nhiên hơn “do a research”.'}});
export function levelUp(value){return LEVEL_UP_RULES[String(value??'').trim().toLowerCase()]||null}
