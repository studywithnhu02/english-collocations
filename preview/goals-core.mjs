export const GOALS_KEY='english-collocations-preview-goals-v1';
export const GOAL_PERIODS=Object.freeze(['day','week','month','year']);

export const DEFAULT_GOALS=Object.freeze({day:5,week:20,month:60,year:500});

export function normalizeTarget(value,fallback=0){
  const n=Math.floor(Number(value));
  return Number.isFinite(n)&&n>=0?Math.min(n,100000):fallback;
}

export function normalizeGoals(value){
  const source=value&&typeof value==='object'?value:{};
  return Object.fromEntries(GOAL_PERIODS.map(period=>[period,normalizeTarget(source[period],DEFAULT_GOALS[period])]));
}

function keyDate(dateLike=new Date()){
  const d=new Date(dateLike);
  return Number.isNaN(d.getTime())?new Date():d;
}

function startOfPeriod(period,dateLike=new Date()){
  const d=keyDate(dateLike);
  if(period==='day')return new Date(d.getFullYear(),d.getMonth(),d.getDate());
  if(period==='week'){
    const mondayIndex=(d.getDay()+6)%7;
    return new Date(d.getFullYear(),d.getMonth(),d.getDate()-mondayIndex);
  }
  if(period==='month')return new Date(d.getFullYear(),d.getMonth(),1);
  return new Date(d.getFullYear(),0,1);
}

export function periodStartKey(period,dateLike=new Date()){
  return startOfPeriod(period,dateLike).toISOString().slice(0,10);
}

export function periodLabel(period){
  return ({day:'Ngày',week:'Tuần',month:'Tháng',year:'Năm'})[period]||period;
}

export function countLearned(events,period,dateLike=new Date()){
  const start=startOfPeriod(period,dateLike).getTime();
  const ids=new Set();
  for(const event of Array.isArray(events)?events:[]){
    const date=new Date(String(event?.date||'')+'T12:00:00');
    if(Number.isNaN(date.getTime())||date.getTime()<start)continue;
    ids.add(String(event?.id??'').trim());
  }
  return ids.size;
}

export function progressModel(target,actual){
  const t=normalizeTarget(target,0),a=Math.max(0,Math.floor(Number(actual)||0));
  return {target:t,actual:a,ratio:t>0?Math.min(1,a/t):0,percent:t>0?Math.min(100,Math.round(a/t*100)):0,complete:t>0&&a>=t};
}
