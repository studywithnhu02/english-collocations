import {localDateKey,calculateStreak} from './analytics-core.mjs';
export const COACH_KEY='english-collocations-preview-coach-v1';
export function loadCoach(){try{const v=JSON.parse(localStorage.getItem(COACH_KEY)||'{}');return v&&typeof v==='object'?v:{}}catch{return {}}}
export function saveCoach(v){localStorage.setItem(COACH_KEY,JSON.stringify(v||{}))}
export function vietnamHour(now=new Date()){const parts=new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Ho_Chi_Minh',hour:'2-digit',hour12:false}).formatToParts(new Date(now));return Number(parts.find(p=>p.type==='hour')?.value||0)}
export function shouldRemind(now=new Date(),analytics={}){if(vietnamHour(now)<20)return false;const today=localDateKey(now),events=Array.isArray(analytics?.learningEvents)?analytics.learningEvents:[];return new Set(events.filter(e=>e?.date===today).map(e=>String(e.id))).size===0}
export function coachModel(now,analytics,goalTarget=0,remaining=0){const today=localDateKey(now),streak=calculateStreak(Array.isArray(analytics?.checkins)?analytics.checkins:[],today);return{today,streak,remaining:Math.max(0,remaining),goalTarget:Math.max(0,goalTarget)}}
