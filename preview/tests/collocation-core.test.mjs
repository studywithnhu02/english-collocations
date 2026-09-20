import assert from 'node:assert/strict';
import test from 'node:test';
import {findDuplicateCollocation,hasDuplicateCollocation,normalizeCollocation} from '../collocation-core.mjs';

const rows=[{id:1,c:'work on a project'},{id:2,c:'Meet a deadline'},{id:3,c:'user experience'}];

test('normalizes case and repeated whitespace',()=>{
  assert.equal(normalizeCollocation('  Work   ON   A project  '),'work on a project');
});

test('finds duplicate collocations ignoring case and spacing',()=>{
  assert.equal(findDuplicateCollocation(rows,'WORK on a project')?.id,1);
  assert.equal(hasDuplicateCollocation(rows,'  meet a   deadline  '),true);
});

test('allows editing the same row without false duplicate',()=>{
  assert.equal(hasDuplicateCollocation(rows,'work on a project',1),false);
});

test('returns no duplicate for blank or unique collocations',()=>{
  assert.equal(findDuplicateCollocation(rows,''),null);
  assert.equal(findDuplicateCollocation(rows,'take ownership'),null);
});
