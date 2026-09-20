import assert from 'node:assert/strict';
import test from 'node:test';
import {DEFAULT_STATUSES,normalizeStatus,uniqueStatuses,ensureStatuses,addStatus,removeStatus,setRowStatus,clearStatusFromRows,filterByStatus} from '../status-core.mjs';

test('normalizes and de-duplicates statuses',()=>{
  assert.equal(normalizeStatus('  Đã   học  '),'Đã học');
  assert.deepEqual(uniqueStatuses(['Chưa học',' Đã học ','Chưa học','','  ']),['Chưa học','Đã học']);
  assert.deepEqual(ensureStatuses([]),[...DEFAULT_STATUSES]);
  assert.deepEqual(ensureStatuses(['Đang học']),['Đang học']);
});

test('adds a new status once',()=>{
  const first=addStatus(DEFAULT_STATUSES,'Đang học');
  assert.equal(first.added,true);
  assert.equal(first.status,'Đang học');
  assert.deepEqual(first.statuses,['Chưa học','Đã học','Đang học']);
  const second=addStatus(first.statuses,' Đang   học ');
  assert.equal(second.added,false);
  assert.deepEqual(second.statuses,first.statuses);
});

test('removes a status from catalog',()=>{
  assert.deepEqual(removeStatus(['Chưa học','Đã học','Đang học'],'Đang học'),['Chưa học','Đã học']);
  assert.deepEqual(removeStatus(['Chưa học','Đã học'],'Chưa học'),['Đã học']);
  assert.deepEqual(removeStatus(['Chưa học','Đã học'],'Không có'),['Chưa học','Đã học']);
});

test('sets one row status',()=>{
  const rows=[{id:1,s:''},{id:2,s:'Đã học'}];
  const result=setRowStatus(rows,1,'  Chưa   học ');
  assert.equal(result.changed,true);
  assert.equal(result.rows[0].s,'Chưa học');
  assert.equal(result.rows[1].s,'Đã học');
});

test('clears removed status from all matching rows',()=>{
  const rows=[{id:1,s:'Đã học'},{id:2,s:'Đang học'},{id:3,s:'Đã học'}];
  const result=clearStatusFromRows(rows,'Đã học');
  assert.equal(result.changed,true);
  assert.deepEqual(result.rows.map(row=>row.s),['','Đang học','']);
});

test('filters rows by status',()=>{
  const rows=[{id:1,s:'Chưa học'},{id:2,s:'Đã học'},{id:3,s:'Đang học'}];
  assert.deepEqual(filterByStatus(rows,'Đã học').map(row=>row.id),[2]);
  assert.equal(filterByStatus(rows,'').length,0);
});

console.log('Status core tests: PASS');
