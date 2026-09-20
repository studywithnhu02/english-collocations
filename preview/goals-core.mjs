import {localDateKey} from './analytics-core.mjs';
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

function vnKeyDate(dateLike=new Date()){
  const key=localDateKey(dateLike);
  const [y,m,d]=key.split('-').map(Number);
  return new Date(Date.UTC(y,m-1,d,12));
}

function startOfPeriod(period,dateLike=new Date()){
  const d=vnKeyDate(dateLike);
  if(period==='day')return d;
  if(period==='week'){
    const mondayIndex=(d.getUTCDay()+6)%7;
    d.setUTCDate(d.getUTCDate()-mondayIndex);
    return d;
  }
  if(period==='month')return new Date(Date.UTC(d.getUTCFullYear(),d.getUTCMonth(),1,12));
  return new Date(Date.UTC(d.getUTCFullYear(),0,1,12));
}

export function periodStartKey(period,dateLike=new Date()){
  return localDateKey(startOfPeriod(period,dateLike));
}

export function periodLabel(period){
  return ({day:'Ngày',week:'Tuần',month:'Tháng',year:'Năm'})[period]||period;
}

export function countLearned(events,period,dateLike=new Date()){
  const startKey=periodStartKey(period,dateLike);
  const endKey=localDateKey(dateLike);
  const ids=new Set();
  for(const event of Array.isArray(events)?events:[]){
    const date=String(event?.date||'').trim();
    if(!/^\d{4}-\d{2}-\d{2}$/.test(date)||date<startKey||date>endKey)continue;
    ids.add(String(event?.id??'').trim());
  }
  return ids.size;
}

export function progressModel(target,actual){
  const t=normalizeTarget(target,0),a=Math.max(0,Math.floor(Number(actual)||0));
  return {target:t,actual:a,ratio:t>0?Math.min(1,a/t):0,percent:t>0?Math.min(100,Math.round(a/t*100)):0,complete:t>0&&a>=t};
}
