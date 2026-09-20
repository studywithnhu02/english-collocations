export const ANALYTICS_KEY='english-collocations-preview-analytics-v1';
export const VIETNAM_TIMEZONE='Asia/Ho_Chi_Minh';

function vietnamParts(value=new Date()){
  const date=value instanceof Date?value:new Date(value);
  if(Number.isNaN(date.getTime()))return null;
  return Object.fromEntries(new Intl.DateTimeFormat('en-CA',{
    timeZone:VIETNAM_TIMEZONE,
    year:'numeric',month:'2-digit',day:'2-digit'
  }).formatToParts(date).filter(part=>part.type!=='literal').map(part=>[part.type,part.value]));
}

export function localDateKey(value=new Date()){
  const parts=vietnamParts(value);
  return parts?parts.year+'-'+parts.month+'-'+parts.day:'';
}

export function localMonthKey(value=new Date()){
  const key=localDateKey(value);
  return key.slice(0,7);
}

function dateFromKey(key){
  return new Date(key+'T12:00:00+07:00');
}

function addDays(key,amount){
  const date=dateFromKey(key);
  date.setUTCDate(date.getUTCDate()+amount);
  return localDateKey(date);
}

function daysInMonth(year,monthIndex){
  return new Date(Date.UTC(year,monthIndex+1,0)).getUTCDate();
}

function mondayIndexFromKey(key){
  return (dateFromKey(key).getUTCDay()+6)%7;
}

export function uniqueDateKeys(values){
  return [...new Set((Array.isArray(values)?values:[]).map(value=>String(value??'').trim()).filter(value=>/^\d{4}-\d{2}-\d{2}$/.test(value)))].sort();
}

export function addCheckin(checkins,date=localDateKey()){
  const key=localDateKey(date);
  const next=uniqueDateKeys(checkins);
  if(next.includes(key))return {checkins:next,added:false,date:key};
  return {checkins:[...next,key].sort(),added:true,date:key};
}

export function removeCheckin(checkins,date=localDateKey()){
  const key=localDateKey(date);
  const next=uniqueDateKeys(checkins);
  return {checkins:next.filter(item=>item!==key),removed:next.includes(key),date:key};
}

export function isCheckedIn(checkins,date=localDateKey()){
  return uniqueDateKeys(checkins).includes(localDateKey(date));
}

export function calculateStreak(checkins,date=localDateKey()){
  const dates=new Set(uniqueDateKeys(checkins));
  let cursor=localDateKey(date);
  if(!dates.has(cursor))return 0;
  let streak=0;
  while(dates.has(cursor)){
    streak+=1;
    cursor=addDays(cursor,-1);
  }
  return streak;
}

export function normalizeLearningEvents(events){
  return (Array.isArray(events)?events:[]).map(event=>({
    id:String(event?.id??'').trim(),
    date:String(event?.date??'').trim()
  })).filter(event=>event.id&&/^\d{4}-\d{2}-\d{2}$/.test(event.date));
}

export function addLearningEvent(events,id,date=localDateKey()){
  const next=normalizeLearningEvents(events);
  const event={id:String(id??'').trim(),date:localDateKey(date)};
  if(!event.id)return {events:next,added:false,event};
  if(next.some(item=>item.id===event.id&&item.date===event.date))return {events:next,added:false,event};
  return {events:[...next,event],added:true,event};
}

export function removeLearningEvent(events,id,date=localDateKey()){
  const next=normalizeLearningEvents(events);
  const key=localDateKey(date);
  const target=String(id??'').trim();
  const filtered=next.filter(item=>!(item.id===target&&item.date===key));
  return {events:filtered,removed:filtered.length!==next.length,id:target,date:key};
}

export function removeLearningEventsByIds(events,ids){
  const targets=new Set((Array.isArray(ids)?ids:[]).map(id=>String(id??'').trim()).filter(Boolean));
  if(!targets.size)return {events:normalizeLearningEvents(events),removed:0};
  const next=normalizeLearningEvents(events);
  const filtered=next.filter(event=>!targets.has(event.id));
  return {events:filtered,removed:next.length-filtered.length};
}

export function buildMonthCalendar(referenceDate=new Date(),events=[],checkins=[]){
  const firstKey=localDateKey(new Date(Date.UTC(
    Number(localDateKey(referenceDate).slice(0,4)),
    Number(localDateKey(referenceDate).slice(5,7))-1,
    1,12,0,0
  )));
  const year=Number(firstKey.slice(0,4));
  const monthIndex=Number(firstKey.slice(5,7))-1;
  const count=daysInMonth(year,monthIndex);
  const leading=mondayIndexFromKey(firstKey);
  const eventCounts=new Map();
  for(const event of normalizeLearningEvents(events)){
    eventCounts.set(event.date,(eventCounts.get(event.date)||0)+1);
  }
  const checked=new Set(uniqueDateKeys(checkins));
  const cells=[];
  for(let i=0;i<leading;i++)cells.push(null);
  for(let day=1;day<=count;day++){
    const key=year+'-'+String(monthIndex+1).padStart(2,'0')+'-'+String(day).padStart(2,'0');
    cells.push({day,date:key,checkedIn:checked.has(key),learned:eventCounts.get(key)||0});
  }
  while(cells.length%7)cells.push(null);
  return {year,month:monthIndex+1,cells};
}

export function buildLearningSeries(events,mode='week',referenceDate=new Date()){
  const normalized=normalizeLearningEvents(events);
  const refKey=localDateKey(referenceDate);
  const refDate=dateFromKey(refKey);
  const year=refDate.getUTCFullYear();
  const monthIndex=refDate.getUTCMonth();
  const buckets=[];
  if(mode==='month'){
    const firstKey=year+'-'+String(monthIndex+1).padStart(2,'0')+'-01';
    const offset=mondayIndexFromKey(firstKey);
    const count=daysInMonth(year,monthIndex);
    const bucketCount=Math.ceil((offset+count)/7);
    for(let i=0;i<bucketCount;i++)buckets.push({label:'Tuần '+(i+1),key:'w'+i,ids:new Set(),value:0});
    for(const event of normalized){
      const d=dateFromKey(event.date);
      if(d.getUTCFullYear()!==year||d.getUTCMonth()!==monthIndex)continue;
      const bucket=Math.floor((offset+d.getUTCDate()-1)/7);
      const item=buckets[bucket];
      if(item&&!item.ids.has(event.id)){item.ids.add(event.id);item.value+=1;}
    }
  }else{
    const start=addDays(refKey,-((refDate.getUTCDay()+6)%7));
    for(let i=0;i<7;i++)buckets.push({label:['T2','T3','T4','T5','T6','T7','CN'][i],key:addDays(start,i),ids:new Set(),value:0});
    for(const event of normalized){
      const item=buckets.find(bucket=>bucket.key===event.date);
      if(item&&!item.ids.has(event.id)){item.ids.add(event.id);item.value+=1;}
    }
  }
  return {labels:buckets.map(bucket=>bucket.label),values:buckets.map(bucket=>bucket.value),total:buckets.reduce((sum,bucket)=>sum+bucket.value,0)};
}
