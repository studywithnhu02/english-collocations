import assert from 'node:assert/strict';
import test from 'node:test';
import {findDuplicateCollocation,findDuplicateCollocations,hasDuplicateCollocation,normalizeCollocation} from '../collocation-core.mjs';

const rows=[{id:1,c:'work on a project'},{id:2,c:'Meet a deadline'},{id:3,c:'user experience'},{id:4,c:'  WORK   ON   A PROJECT  '}];

test('normalizes case and repeated whitespace',()=>{
  assert.equal(normalizeCollocation('  Work   ON   A project  '),'work on a project');
});

test('finds duplicate collocations ignoring case and spacing',()=>{
  assert.equal(findDuplicateCollocation(rows,'WORK on a project',99)?.id,1);
  assert.equal(hasDuplicateCollocation(rows,'  meet a   deadline  '),true);
});

test('groups existing duplicates for warning and validation',()=>{
  const groups=findDuplicateCollocations(rows);
  assert.equal(groups.length,1);
  assert.equal(groups[0].value,'work on a project');
  assert.deepEqual(groups[0].rows.map(row=>row.id),[1,4]);
});

test('editing an otherwise unique row does not self-match',()=>{
  const cleanRows=rows.filter(row=>row.id!==4);
  assert.equal(hasDuplicateCollocation(cleanRows,'work on a project',1),false);
  assert.equal(findDuplicateCollocation(cleanRows,'work on a project',1),null);
});

test('editing a row to an existing collocation is blocked by duplicate detection',()=>{
  assert.equal(findDuplicateCollocation(rows,'work on a project',4)?.id,1);
});

test('returns no duplicate for blank or unique collocations',()=>{
  assert.equal(findDuplicateCollocation(rows,''),null);
  assert.equal(findDuplicateCollocation(rows,'take ownership'),null);
});
