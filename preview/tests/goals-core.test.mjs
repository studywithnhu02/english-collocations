import assert from 'node:assert/strict';
import test from 'node:test';
import {DEFAULT_GOALS,GOAL_PERIODS,countLearned,normalizeGoals,normalizeTarget,progressModel} from '../goals-core.mjs';

const events=[
  {id:'1',date:'2026-09-20'},
  {id:'1',date:'2026-09-19'},
  {id:'2',date:'2026-09-19'},
  {id:'3',date:'2026-09-01'}
];

test('goal settings normalize safely',()=>{
  assert.deepEqual(GOAL_PERIODS,['day','week','month','year']);
  assert.equal(normalizeTarget('5.8'),5);
  assert.equal(normalizeTarget('-2',7),7);
  assert.deepEqual(normalizeGoals({day:3}),{day:3,week:DEFAULT_GOALS.week,month:DEFAULT_GOALS.month,year:DEFAULT_GOALS.year});
});

test('learned counts are unique by collocation id within each period',()=>{
  assert.equal(countLearned(events,'day',new Date('2026-09-20T12:00:00+07:00')),1);
  assert.equal(countLearned(events,'week',new Date('2026-09-20T12:00:00+07:00')),2);
  assert.equal(countLearned(events,'month',new Date('2026-09-20T12:00:00+07:00')),3);
  assert.equal(countLearned(events,'year',new Date('2026-09-20T12:00:00+07:00')),3);
});

test('progress is capped at 100 percent',()=>{
  assert.deepEqual(progressModel(10,7),{target:10,actual:7,ratio:.7,percent:70,complete:false});
  assert.equal(progressModel(10,15).percent,100);
  assert.equal(progressModel(0,10).percent,0);
});

console.log('Goals core tests: PASS');
