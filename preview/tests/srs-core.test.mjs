import assert from 'node:assert/strict';
import test from 'node:test';
import {SRS_INTERVALS_DAYS,addDaysToDateKey,createCard,dueCards,emptyCard,nextDueDate,removeCard,reviewCard,syncStateRows} from '../srs-core.mjs';

test('SRS uses the requested 1-3-7-30 day cadence',()=>{
  assert.deepEqual(SRS_INTERVALS_DAYS,[1,3,7,30]);
  assert.equal(addDaysToDateKey('2026-09-20',1),'2026-09-21');
  const state=createCard({version:1,cards:{}},'1','2026-09-20');
  assert.equal(state.cards['1'].due,'2026-09-21');
});

test('Good review advances 1 -> 3 -> 7 -> 30 days',()=>{
  let state=createCard({version:1,cards:{}},'1','2026-09-20');
  state=reviewCard(state,'1','good','2026-09-21');
  assert.equal(state.cards['1'].interval,3);
  assert.equal(state.cards['1'].due,'2026-09-24');
  state=reviewCard(state,'1','good','2026-09-24');
  assert.equal(state.cards['1'].interval,7);
  assert.equal(state.cards['1'].due,'2026-10-01');
  state=reviewCard(state,'1','good','2026-10-01');
  assert.equal(state.cards['1'].interval,30);
  assert.equal(state.cards['1'].due,'2026-10-31');
});

test('Hard repeats the current canonical interval',()=>{
  const state={version:1,cards:{'1':{...emptyCard('1','2026-09-20'),step:1,interval:3}}};
  const reviewed=reviewCard(state,'1','hard','2026-09-20');
  assert.equal(reviewed.cards['1'].interval,3);
  assert.equal(reviewed.cards['1'].due,'2026-09-23');
});

test('Again resets to 1 day and sync removes deleted rows',()=>{
  let state={version:1,cards:{'1':{...emptyCard('1','2026-09-20'),step:2,interval:7}}};
  state=reviewCard(state,'1','again','2026-09-20');
  assert.equal(state.cards['1'].interval,1);
  assert.equal(state.cards['1'].due,'2026-09-21');
  const synced=syncStateRows({...state,cards:{...state.cards,'2':emptyCard('2','2026-09-20')}},[{id:1}],'2026-09-20');
  assert.deepEqual(Object.keys(synced.cards),['1']);
  assert.equal(nextDueDate(synced,'2026-09-20'),'2026-09-21');
  assert.equal(Object.keys(removeCard(synced,'1','2026-09-20').cards).length,0);
  assert.equal(dueCards(synced,'2026-09-21').length,1);
});

console.log('SRS core tests: PASS');
