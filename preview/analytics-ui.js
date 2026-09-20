import {ANALYTICS_KEY,localDateKey,addCheckin,removeCheckin,isCheckedIn,calculateStreak,addLearningEvent,removeLearningEvent,removeLearningEventsByIds,buildLearningSeries,buildMonthCalendar} from './analytics-core.mjs';

const DATA_KEY='english-collocations-preview-v2';

function vietnamNow(){return new Date(localDateKey()+'T12:00:00+07:00');}

let calendarCursor=vietnamNow();
let mounted=false;

function load(){
  try{
    const value=JSON.parse(localStorage.getItem(ANALYTICS_KEY)||'null');
    return {
      checkins:Array.isArray(value?.checkins)?value.checkins:[],
      learningEvents:Array.isArray(value?.learningEvents)?value.learningEvents:[]
    };
  }catch{
    return {checkins:[],learningEvents:[]};
  }
}

function loadCurrentRows(){
  try{
    const value=JSON.parse(localStorage.getItem(DATA_KEY)||'[]');
    return Array.isArray(value)?value:[];
  }catch{
    return [];
  }
}

function currentStatusCounts(rows=loadCurrentRows()){
  const counts={learned:0,inProgress:0,notLearned:0};
  for(const row of rows){
    const status=String(row?.s??row?.status??'Chưa học').replace(/\s+/g,' ').trim();
    if(status==='Đã học')counts.learned+=1;
    else if(status==='Đang học')counts.inProgress+=1;
    else if(!status||status==='Chưa học')counts.notLearned+=1;
  }
  return counts;
}

function save(value){localStorage.setItem(ANALYTICS_KEY,JSON.stringify(value));}

function pruneToRows(rows){
  const value=load();
    const validIds=new Set((Array.isArray(rows)?rows:[]).map(row=>String(row?.id??'').trim()).filter(Boolean));
  const staleIds=[...new Set(value.learningEvents.map(event=>String(event?.id??'').trim()).filter(id=>id&&!validIds.has(id)))];
  const result=removeLearningEventsByIds(value.learningEvents,staleIds);
  if(result.removed)save({...value,learningEvents:result.events});
  return result.events;
}

function monthShift(date,delta){
  const next=new Date(date);
  next.setUTCMonth(next.getUTCMonth()+delta);
  return next;
}

function monthTitle(model){
  return new Intl.DateTimeFormat('vi-VN',{timeZone:'Asia/Ho_Chi_Minh',month:'long',year:'numeric'}).format(
    new Date(Date.UTC(model.year,model.month-1,15,12))
  );
}

function renderCalendar(value){
  const box=document.getElementById('analyticsCalendar');
  const title=document.getElementById('analyticsMonthTitle');
  if(!box||!title)return;
  const model=buildMonthCalendar(calendarCursor,value.learningEvents,value.checkins);
  title.textContent=monthTitle(model);
  const weekdays=['T2','T3','T4','T5','T6','T7','CN'];
  box.innerHTML=weekdays.map(day=>'<div class="calendar-weekday">'+day+'</div>').join('')+
    model.cells.map(cell=>{
      if(!cell)return '<div class="calendar-day calendar-empty" aria-hidden="true"></div>';
      const classes=['calendar-day'];
      if(cell.checkedIn)classes.push('checked');
      if(cell.date===localDateKey())classes.push('today');
      const learned=cell.learned?'<span class="calendar-count">'+cell.learned+'</span>':'';
      const check=cell.checkedIn?'<span class="calendar-dot" aria-label="Đã điểm danh"></span>':'';
      return '<div class="'+classes.join(' ')+'" title="'+cell.date+'"><span class="calendar-day-number">'+cell.day+'</span>'+check+learned+'</div>';
    }).join('');
}

function renderStats(value){
  const today=localDateKey();
  const weekly=buildLearningSeries(value.learningEvents,'week',new Date());
  const monthly=buildLearningSeries(value.learningEvents,'month',new Date());
  const counts=currentStatusCounts();
  document.getElementById('analyticsLearned').textContent=counts.learned;
  document.getElementById('analyticsNotLearned').textContent=counts.notLearned;
  document.getElementById('analyticsInProgress').textContent=counts.inProgress;
  document.getElementById('analyticsWeek').textContent=weekly.total;
  document.getElementById('analyticsMonth').textContent=monthly.total;
  document.getElementById('analyticsStreak').textContent=calculateStreak(value.checkins,today);
  const checked=isCheckedIn(value.checkins,today);
  const button=document.getElementById('analyticsCheckin');
  button.classList.toggle('done',checked);
  button.textContent=checked?'✓ Đã điểm danh · bấm để hủy':'📅 Chưa điểm danh';
  const mode=window.PreviewAnalytics?.mode==='month'?'month':'week';
  document.querySelectorAll('.analytics-tab').forEach(tab=>tab.classList.toggle('active',tab.dataset.analyticsMode===mode));
  const series=mode==='month'?monthly:weekly;
  document.getElementById('analyticsChartTitle').textContent=mode==='month'?'Tháng này':'Tuần này';
  const max=Math.max(1,...series.values);
  document.getElementById('analyticsChart').innerHTML=series.labels.map((label,index)=>{
    const value=series.values[index]||0;
    const width=value?Math.max(6,Math.round(value/max*100)):0;
    return '<div class="analytics-chart-row"><span class="analytics-chart-label">'+label+'</span><div class="analytics-track"><span class="analytics-bar" style="width:'+width+'%"></span></div><span class="analytics-chart-value">'+value+'</span></div>';
  }).join('');
  renderCalendar(value);
}

function refresh(){renderStats(load());}

function recordStudy(id,status){
  const analytics=load();
  if(String(status)==='Đã học'){
    const event=addLearningEvent(analytics.learningEvents,id);
    const checkin=addCheckin(analytics.checkins);
    analytics.learningEvents=event.events;
    analytics.checkins=checkin.checkins;
  }else{
    analytics.learningEvents=removeLearningEvent(analytics.learningEvents,id).events;
  }
  save(analytics);
  refresh();
}

function toggleCheckin(){
  const analytics=load();
  const today=localDateKey();
  analytics.checkins=isCheckedIn(analytics.checkins,today)
    ? removeCheckin(analytics.checkins,today).checkins
    : addCheckin(analytics.checkins,today).checkins;
  save(analytics);
  refresh();
}

function mount(){
  if(mounted)return;
  mounted=true;
  window.PreviewAnalytics={
    mode:'week',
    refresh,
    recordStudy,
    toggleCheckin,
    pruneToRows,
    getSnapshot:load,
    restoreSnapshot(snapshot){
      const next=snapshot&&typeof snapshot==='object'?snapshot:{};
      save({
        checkins:Array.isArray(next.checkins)?next.checkins:[],
        learningEvents:Array.isArray(next.learningEvents)?next.learningEvents:[]
      });
      refresh();
    },
    setMode(mode){this.mode=mode==='month'?'month':'week';refresh();},
    prevMonth(){calendarCursor=monthShift(calendarCursor,-1);refresh();},
    nextMonth(){calendarCursor=monthShift(calendarCursor,1);refresh();},
    today(){calendarCursor=vietnamNow();refresh();}
  };
  document.getElementById('analyticsCheckin')?.addEventListener('click',toggleCheckin);
  document.querySelectorAll('.analytics-tab').forEach(tab=>tab.addEventListener('click',()=>window.PreviewAnalytics.setMode(tab.dataset.analyticsMode)));
  document.getElementById('analyticsPrev')?.addEventListener('click',()=>window.PreviewAnalytics.prevMonth());
  document.getElementById('analyticsNext')?.addEventListener('click',()=>window.PreviewAnalytics.nextMonth());
  document.getElementById('analyticsToday')?.addEventListener('click',()=>window.PreviewAnalytics.today());
  window.addEventListener('storage',refresh);
  window.addEventListener('preview-data-updated',refresh);
  refresh();
  setInterval(refresh,30000);
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount);else mount();
