import assert from 'node:assert/strict';
import test from 'node:test';
import {VIETNAM_TIMEZONE,addCheckin,addLearningEvent,buildLearningSeries,buildMonthCalendar,calculateStreak,isCheckedIn,localDateKey,removeCheckin,removeLearningEvent} from '../analytics-core.mjs';

const ref=new Date('2026-09-16T16:30:00Z');

test('date key is always calculated in Vietnam time',()=>{
  assert.equal(VIETNAM_TIMEZONE,'Asia/Ho_Chi_Minh');
  assert.equal(localDateKey(ref),'2026-09-16');
  assert.equal(localDateKey(new Date('2026-09-15T16:59:59Z')),'2026-09-15');
  assert.equal(localDateKey(new Date('2026-09-15T17:00:00Z')),'2026-09-16');
});

test('check-in toggle is idempotent and streak counts consecutive Vietnam dates',()=>{
  let result=addCheckin([], '2026-09-14');
  result=addCheckin(result.checkins,'2026-09-15');
  result=addCheckin(result.checkins,'2026-09-16');
  result=addCheckin(result.checkins,'2026-09-16');
  assert.equal(result.added,false);
  assert.equal(isCheckedIn(result.checkins,'2026-09-16'),true);
  assert.equal(calculateStreak(result.checkins,'2026-09-16'),3);
  const undone=removeCheckin(result.checkins,'2026-09-16');
  assert.equal(undone.removed,true);
  assert.equal(isCheckedIn(undone.checkins,'2026-09-16'),false);
  assert.equal(calculateStreak(undone.checkins,'2026-09-16'),0);
});

test('learning event is unique per collocation per Vietnam day and can be undone',()=>{
  let result=addLearningEvent([],1,'2026-09-16');
  result=addLearningEvent(result.events,1,'2026-09-16');
  assert.equal(result.added,false);
  result=addLearningEvent(result.events,2,'2026-09-16');
  assert.equal(result.events.length,2);
  const removed=removeLearningEvent(result.events,1,'2026-09-16');
  assert.equal(removed.removed,true);
  assert.deepEqual(removed.events.map(event=>event.id),['2']);
});

test('weekly series has seven day buckets with unique collocations',()=>{
  const events=[{id:'1',date:'2026-09-14'},{id:'1',date:'2026-09-14'},{id:'2',date:'2026-09-16'},{id:'3',date:'2026-09-20'}];
  const series=buildLearningSeries(events,'week',ref);
  assert.deepEqual(series.labels,['T2','T3','T4','T5','T6','T7','CN']);
  assert.deepEqual(series.values,[1,0,1,0,0,0,1]);
  assert.equal(series.total,3);
});

test('monthly series groups unique collocations into week buckets',()=>{
  const events=[{id:'1',date:'2026-09-01'},{id:'2',date:'2026-09-07'},{id:'3',date:'2026-09-15'},{id:'4',date:'2026-09-30'}];
  const series=buildLearningSeries(events,'month',ref);
  assert.deepEqual(series.values,[1,1,1,0,1]);
  assert.equal(series.total,4);
});

test('calendar returns Monday-first cells and marks learning/check-in',()=>{
  const model=buildMonthCalendar(ref,[{id:'1',date:'2026-09-16'},{id:'2',date:'2026-09-16'}],['2026-09-16']);
  const day16=model.cells.find(cell=>cell?.date==='2026-09-16');
  assert.equal(day16.checkedIn,true);
  assert.equal(day16.learned,2);
  assert.equal(model.cells.filter(Boolean).length,30);
});

console.log('Analytics core tests: PASS');
