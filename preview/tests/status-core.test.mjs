import assert from 'node:assert/strict';
import test from 'node:test';
import {DEFAULT_STATUSES,normalizeStatus,uniqueStatuses,ensureStatuses,addStatus,removeStatus,setRowStatus,clearStatusFromRows,filterByStatus} from '../status-core.mjs';

test('built-in statuses are always available',()=>{
  assert.deepEqual(DEFAULT_STATUSES,['Chưa học','Đang học','Đã học']);
  assert.deepEqual(ensureStatuses([]),['Chưa học','Đang học','Đã học']);
  assert.deepEqual(ensureStatuses(['Đã học','Đang học','Tự ôn']),['Chưa học','Đang học','Đã học','Tự ôn']);
});

test('normalizes and de-duplicates statuses',()=>{
  assert.equal(normalizeStatus('  Đã   học  '),'Đã học');
  assert.deepEqual(uniqueStatuses(['Chưa học',' Đã học ','Chưa học','','  ']),['Chưa học','Đã học']);
});

test('adding a built-in status is idempotent while custom status is addable',()=>{
  const first=addStatus(DEFAULT_STATUSES,'Đang học');
  assert.equal(first.added,false);
  assert.deepEqual(first.statuses,[...DEFAULT_STATUSES]);
  const second=addStatus(DEFAULT_STATUSES,'Đang ôn');
  assert.equal(second.added,true);
  assert.deepEqual(second.statuses,['Chưa học','Đang học','Đã học','Đang ôn']);
});

test('removing a custom status works',()=>{
  assert.deepEqual(removeStatus(['Chưa học','Đang học','Đã học','Đang ôn'],'Đang ôn'),['Chưa học','Đang học','Đã học']);
});

test('sets one row status',()=>{
  const rows=[{id:1,s:''},{id:2,s:'Đã học'}];
  const result=setRowStatus(rows,1,'  Chưa   học ');
  assert.equal(result.changed,true);
  assert.equal(result.rows[0].s,'Chưa học');
  assert.equal(result.rows[1].s,'Đã học');
});

test('clears matching status from rows',()=>{
  const rows=[{id:1,s:'Đã học'},{id:2,s:'Đang học'},{id:3,s:'Đã học'}];
  const result=clearStatusFromRows(rows,'Đã học');
  assert.equal(result.changed,true);
  assert.deepEqual(result.rows.map(row=>row.s),['','Đang học','']);
});

test('filters rows by status',()=>{
  const rows=[{id:1,s:'Chưa học'},{id:2,s:'Đã học'},{id:3,s:'Đang học'}];
  assert.deepEqual(filterByStatus(rows,'Đã học').map(row=>row.id),[2]);
  assert.equal(filterByStatus(rows,'').length,3);
});

console.log('Status core tests: PASS');