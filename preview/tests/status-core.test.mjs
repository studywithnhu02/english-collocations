import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DEFAULT_STATUSES,
  normalizeStatusName,
  normalizeStatuses,
  addStatus,
  removeStatus,
  setRowStatus,
  clearRemovedStatus,
  filterRowsByStatus,
  mergeStatusesWithRows
} from '../status-core.mjs';

test('keeps default statuses and normalizes whitespace',()=>{
  assert.equal(normalizeStatusName('  Đã   học  '),'Đã học');
  assert.deepEqual(normalizeStatuses(['Đã   học','chưa học','Chưa học','  Custom  ']),['Đã học','chưa học','Custom']);
});

test('adds a new status and rejects blank or duplicate values',()=>{
  const base=normalizeStatuses(DEFAULT_STATUSES);
  const added=addStatus(base,'  Đang ôn tập  ');
  assert.equal(added.added,true);
  assert.deepEqual(added.statuses,['Chưa học','Đã học','Đang ôn tập']);
  const duplicate=addStatus(added.statuses,'đang ôn tập');
  assert.equal(duplicate.added,false);
  assert.equal(duplicate.status,'Đang ôn tập');
  assert.equal(addStatus(duplicate.statuses,'   ').added,false);
});

test('protects the two default statuses from deletion',()=>{
  const base=addStatus(DEFAULT_STATUSES,'Đang ôn tập').statuses;
  const removed=removeStatus(base,'Đang ôn tập');
  assert.equal(removed.removed,true);
  assert.deepEqual(removed.statuses,DEFAULT_STATUSES);
  assert.equal(removeStatus(DEFAULT_STATUSES,'Đã học').removed,false);
});

test('updates one row status without mutating unrelated rows',()=>{
  const rows=[{id:1,status:'Chưa học'},{id:2,status:'Đã học'}];
  const result=setRowStatus(rows,1,'Đang ôn tập');
  assert.equal(result.changed,true);
  assert.equal(result.rows[0].status,'Đang ôn tập');
  assert.equal(result.rows[1].status,'Đã học');
  assert.equal(rows[0].status,'Chưa học');
});

test('clears rows that used a removed custom status',()=>{
  const rows=[{id:1,status:'Đang ôn tập'},{id:2,status:'Đã học'}];
  const next=clearRemovedStatus(rows,'Đang ôn tập');
  assert.equal(next[0].status,'');
  assert.equal(next[1].status,'Đã học');
});

test('filters rows by status case-insensitively',()=>{
  const rows=[{id:1,status:'Chưa học'},{id:2,status:'Đã học'},{id:3,status:'Đã học'}];
  assert.deepEqual(filterRowsByStatus(rows,'đã học').map(x=>x.id),[2,3]);
  assert.equal(filterRowsByStatus(rows,'').length,3);
});

test('merges restored/custom row statuses into the status catalog',()=>{
  const rows=[{status:'Đang ôn tập'},{status:'  Chưa   học  '}];
  assert.deepEqual(mergeStatusesWithRows(DEFAULT_STATUSES,rows),['Chưa học','Đã học','Đang ôn tập']);
});
