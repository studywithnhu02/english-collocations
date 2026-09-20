import assert from 'node:assert/strict';
import test from 'node:test';
import {addCheckin,addLearningEvent,buildLearningSeries,calculateStreak,isCheckedIn,localDateKey} from '../analytics-core.mjs';

const ref=new Date('2026-09-16T12:00:00');

test('localDateKey uses local calendar fields',()=>{
  assert.equal(localDateKey(ref),'2026-09-16');
});

test('check-in is idempotent and streak counts consecutive days',()=>{
  let result=addCheckin([], '2026-09-14');
  result=addCheckin(result.checkins,'2026-09-15');
  result=addCheckin(result.checkins,'2026-09-16');
  result=addCheckin(result.checkins,'2026-09-16');
  assert.equal(result.added,false);
  assert.equal(isCheckedIn(result.checkins,'2026-09-16'),true);
  assert.equal(calculateStreak(result.checkins,'2026-09-16'),3);
  assert.equal(calculateStreak(result.checkins,'2026-09-17'),0);
});

test('learning event is unique per collocation per day',()=>{
  let result=addLearningEvent([],1,'2026-09-16');
  result=addLearningEvent(result.events,1,'2026-09-16');
  assert.equal(result.added,false);
  result=addLearningEvent(result.events,2,'2026-09-16');
  assert.equal(result.events.length,2);
});

test('weekly series has seven day buckets',()=>{
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
