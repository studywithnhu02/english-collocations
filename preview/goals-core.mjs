import {localDateKey} from './analytics-core.mjs';
export const GOALS_KEY='english-collocations-preview-goals-v1';
export const GOAL_PERIODS=Object.freeze(['day','week','month','year']);
export const DEFAULT_GOALS=Object.freeze({day:5,week:35,month:150,year:1825});
export function normalizeTarget(value,fallback=0){const n=Math.floor(Number(value));return Number.isFinite(n)&&n>=0?Math.min(n,100000):fallback}
function vnParts(dateLike=new Date()){const key=localDateKey(dateLike),[y,m,d]=key.split('-').map(Number);return{y,m,d}}
function daysInYear(dateLike=new Date()){const p=vnParts(dateLike);return ((p.y%4===0&&p.y%100!==0)||p.y%400===0)?366:365}
function daysInMonth(dateLike=new Date()){const p=vnParts(dateLike);return new Date(Date.UTC(p.y,p.m,0)).getUTCDate()}
export function deriveGoalTargets(dayTarget,dateLike=new Date()){const day=normalizeTarget(dayTarget,0);return{day,week:Math.min(100000,day*7),month:Math.min(100000,day*daysInMonth(dateLike)),year:Math.min(100000,day*daysInYear(dateLike))}}
export function normalizeGoals(value,dateLike=new Date()){const source=value&&typeof value==='object'?value:{},day=normalizeTarget(source.day,5);return deriveGoalTargets(day,dateLike)}
function vnKeyDate(dateLike=new Date()){const key=localDateKey(dateLike),[y,m,d]=key.split('-').map(Number);return new Date(Date.UTC(y,m-1,d,12))}
function startOfPeriod(period,dateLike=new Date()){const d=vnKeyDate(dateLike);if(period==='day')return d;if(period==='week'){d.setUTCDate(d.getUTCDate()-((d.getUTCDay()+6)%7));return d}if(period==='month')return new Date(Date.UTC(d.getUTCFullYear(),d.getUTCMonth(),1,12));return new Date(Date.UTC(d.getUTCFullYear(),0,1,12))}
export function periodStartKey(period,dateLike=new Date()){return localDateKey(startOfPeriod(period,dateLike))}
export function periodLabel(period){return({day:'Ngày',week:'Tuần',month:'Tháng',year:'Năm'})[period]||period}
export function countLearned(events,period,dateLike=new Date()){const startKey=periodStartKey(period,dateLike),endKey=localDateKey(dateLike),ids=new Set();for(const event of Array.isArray(events)?events:[]){const date=String(event?.date||'').trim();const id=String(event?.id??'').trim();if(id&&/^\d{4}-\d{2}-\d{2}$/.test(date)&&date>=startKey&&date<=endKey)ids.add(id)}return ids.size}
export function progressModel(target,actual){const t=normalizeTarget(target,0),a=Math.max(0,Math.floor(Number(actual)||0));return{target:t,actual:a,ratio:t>0?Math.min(1,a/t):0,percent:t>0?Math.min(100,Math.round(a/t*100)):0,complete:t>0&&a>=t}}
