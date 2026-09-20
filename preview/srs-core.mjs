export const SRS_KEY='english-collocations-preview-srs-v1';
export const SRS_INTERVALS_DAYS=Object.freeze([1,3,7,30]);

function cleanId(id){return String(id??'').trim()}

export function addDaysToDateKey(key,days){
  const d=new Date(String(key)+'T12:00:00+07:00');
  if(Number.isNaN(d.getTime()))return String(key);
  d.setUTCDate(d.getUTCDate()+Number(days||0));
  return d.toISOString().slice(0,10);
}

export function emptyCard(id,dateKey){
  return {id:cleanId(id),step:0,interval:1,ease:2.5,reviews:0,lapses:0,lastReview:'',due:dateKey};
}

export function normalizeCard(card,dateKey){
  const source=card&&typeof card==='object'?card:{};
  const step=Math.max(0,Math.min(SRS_INTERVALS_DAYS.length-1,Math.floor(Number(source.step)||0)));
  const interval=Number.isFinite(Number(source.interval))?Math.max(1,Math.min(30,Math.floor(Number(source.interval)))):SRS_INTERVALS_DAYS[step];
  return {id:cleanId(source.id),step,interval,ease:Number.isFinite(Number(source.ease))?Math.max(1.3,Math.min(3.2,Number(source.ease))):2.5,reviews:Math.max(0,Math.floor(Number(source.reviews)||0)),lapses:Math.max(0,Math.floor(Number(source.lapses)||0)),lastReview:String(source.lastReview||''),due:/^\d{4}-\d{2}-\d{2}$/.test(String(source.due||''))?String(source.due):dateKey};
}

export function normalizeState(state,dateKey){
  const cards=state&&typeof state.cards==='object'&&state.cards?state.cards:{};
  const out={version:1,cards:{}};
  for(const [id,card] of Object.entries(cards)){const normalized=normalizeCard({...card,id},dateKey);if(normalized.id)out.cards[normalized.id]=normalized}
  return out;
}

export function createCard(state,id,dateKey){
  const next=normalizeState(state,dateKey),key=cleanId(id);
  if(!key)return next;
  if(next.cards[key])return next;
  next.cards[key]=emptyCard(key,addDaysToDateKey(dateKey,1));
  return next;
}

export function removeCard(state,id,dateKey){
  const next=normalizeState(state,dateKey);delete next.cards[cleanId(id)];return next;
}

export function dueCards(state,dateKey){
  const next=normalizeState(state,dateKey);
  return Object.values(next.cards).filter(card=>card.due<=dateKey).sort((a,b)=>String(a.due).localeCompare(String(b.due))||a.step-b.step||a.id.localeCompare(b.id));
}

export function nextDueDate(state,dateKey){
  const next=normalizeState(state,dateKey);
  return Object.values(next.cards).filter(card=>card.due>dateKey).sort((a,b)=>a.due.localeCompare(b.due))[0]?.due||'';
}

export function reviewCard(state,id,rating,dateKey){
  const next=normalizeState(state,dateKey),key=cleanId(id),card=next.cards[key];
  if(!card)return next;
  const currentIndex=Math.max(0,Math.min(SRS_INTERVALS_DAYS.length-1,card.step));
  let step=currentIndex,ease=card.ease,lapses=card.lapses,interval=card.interval;
  if(rating==='again'){step=0;interval=1;lapses+=1;ease=Math.max(1.3,ease-0.2)}
  else if(rating==='hard'){interval=Math.min(30,Math.max(1,Math.round(interval*1.5)));ease=Math.max(1.3,ease-0.15)}
  else if(rating==='easy'){step=Math.min(SRS_INTERVALS_DAYS.length-1,currentIndex+2);interval=SRS_INTERVALS_DAYS[step];ease=Math.min(3.2,ease+0.15)}
  else {step=Math.min(SRS_INTERVALS_DAYS.length-1,currentIndex+1);interval=SRS_INTERVALS_DAYS[step];ease=Math.min(3.2,ease+0.05)}
  next.cards[key]={...card,step,interval,ease,lapses,reviews:card.reviews+1,lastReview:dateKey,due:addDaysToDateKey(dateKey,interval)};
  return next;
}

export function syncStateRows(state,rows,dateKey){
  const next=normalizeState(state,dateKey),valid=new Set((Array.isArray(rows)?rows:[]).map(row=>cleanId(row?.id)).filter(Boolean));
  for(const id of Object.keys(next.cards))if(!valid.has(id))delete next.cards[id];
  return next;
}
