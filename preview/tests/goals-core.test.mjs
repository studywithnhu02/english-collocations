import assert from 'node:assert/strict';
import test from 'node:test';
import {GOAL_PERIODS,deriveGoalTargets,countLearned,normalizeGoals,normalizeTarget,progressModel} from '../goals-core.mjs';
const events=[{id:'1',date:'2026-09-20'},{id:'1',date:'2026-09-19'},{id:'2',date:'2026-09-19'},{id:'3',date:'2026-09-01'}];
const ref=new Date('2026-09-20T12:00:00+07:00');
test('goal settings normalize and roll up from daily target',()=>{
  assert.deepEqual(GOAL_PERIODS,['day','week','month','year']);
  assert.equal(normalizeTarget('5.8'),5);
  assert.equal(normalizeTarget('-2',7),7);
  const goals=normalizeGoals({day:20},ref);
  assert.equal(goals.day,20);
  assert.equal(goals.week,140);
  assert.equal(goals.month,600);
  assert.equal(goals.year,7300);
});
test('daily target rollup uses calendar month and leap year length',()=>{
  const leap=deriveGoalTargets(10,new Date('2028-02-10T12:00:00+07:00'));
  assert.equal(leap.week,70);
  assert.equal(leap.month,290);
  assert.equal(leap.year,3660);
});
test('learned counts are unique by collocation id within each period',()=>{
  assert.equal(countLearned(events,'day',ref),1);
  assert.equal(countLearned(events,'week',ref),2);
  assert.equal(countLearned(events,'month',ref),3);
  assert.equal(countLearned(events,'year',ref),3);
});
test('progress is capped at 100 percent',()=>{
  assert.deepEqual(progressModel(10,7),{target:10,actual:7,ratio:.7,percent:70,complete:false});
  assert.equal(progressModel(10,15).percent,100);
  assert.equal(progressModel(0,10).percent,0);
});
console.log('Goals core tests: PASS');