export const ANALYTICS_KEY='english-collocations-preview-analytics-v1';

function toLocalDate(value=new Date()){
  const date=value instanceof Date?value:new Date(value);
  return Number.isNaN(date.getTime())?new Date():date;
}

export function localDateKey(value=new Date()){
  const date=toLocalDate(value);
  return String(date.getFullYear()).padStart(4,'0')+'-'+String(date.getMonth()+1).padStart(2,'0')+'-'+String(date.getDate()).padStart(2,'0');
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
    const d=new Date(cursor+'T12:00:00');
    d.setDate(d.getDate()-1);
    cursor=localDateKey(d);
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

function dateFromKey(key){return new Date(key+'T12:00:00');}
function mondayIndex(date){return (date.getDay()+6)%7;}

export function buildLearningSeries(events,mode='week',referenceDate=new Date()){
  const normalized=normalizeLearningEvents(events);
  const ref=toLocalDate(referenceDate);
  const year=ref.getFullYear();
  const month=ref.getMonth();
  const seen=new Set();
  const buckets=[];
  if(mode==='month'){
    const daysInMonth=new Date(year,month+1,0).getDate();
    const offset=mondayIndex(new Date(year,month,1));
    const bucketCount=Math.ceil((offset+daysInMonth)/7);
    for(let i=0;i<bucketCount;i++)buckets.push({label:'Tuần '+(i+1),key:'w'+i,ids:new Set(),value:0});
    for(const event of normalized){
      const d=dateFromKey(event.date);
      if(d.getFullYear()!==year||d.getMonth()!==month)continue;
      const bucket=Math.floor((offset+d.getDate()-1)/7);
      const item=buckets[bucket];
      if(item&&!item.ids.has(event.id)){item.ids.add(event.id);item.value+=1;}
    }
  }else{
    const start=new Date(year,month,ref.getDate()-mondayIndex(ref));
    for(let i=0;i<7;i++){
      const d=new Date(start);d.setDate(start.getDate()+i);
      buckets.push({label:['T2','T3','T4','T5','T6','T7','CN'][i],key:localDateKey(d),ids:new Set(),value:0});
    }
    for(const event of normalized){
      const item=buckets.find(bucket=>bucket.key===event.date);
      if(item&&!item.ids.has(event.id)){item.ids.add(event.id);item.value+=1;}
    }
  }
  return {labels:buckets.map(bucket=>bucket.label),values:buckets.map(bucket=>bucket.value),total:buckets.reduce((sum,bucket)=>sum+bucket.value,0)};
}
