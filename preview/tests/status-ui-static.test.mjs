import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';

const html=await readFile(new URL('../index.html',import.meta.url),'utf8');

test('Preview wires the STATUS column and status filter UI',()=>{
  assert.match(html,/import {DEFAULT_STATUSES,[^}]+mergeStatusesWithRows} from "\.\/status-core\.mjs";/);
  assert.match(html,/<select id="statusFilter"[^>]*>.*?<option value="">status<\/option>/s);
  assert.match(html,/<th>STATUS<\/th>/);
  assert.match(html,/data-status-toggle/);
  assert.match(html,/data-status-choice/);
  assert.match(html,/data-status-add/);
  assert.match(html,/data-status-remove/);
});

test('Preview persists and exports status values',()=>{
  assert.match(html,/status:normalizeStatusName\(x\.status\?\?x\.s\?\?DEFAULT_STATUSES\[0\]\)/);
  assert.match(html,/status:DEFAULT_STATUSES\[0\]/);
  assert.match(html,/statusLabel\(r\.status\)/);
  assert.match(html,/\['STT','Collocation','Nghĩa Collocation','Chủ đề','STATUS','Câu giao tiếp ví dụ'/);
});

test('inline Preview application module is syntactically valid',()=>{
  const match=html.match(/<script type="module">\n([\s\S]*?)\n<\/script>/);
  assert.ok(match,'inline module script not found');
  const result=spawnSync(process.execPath,['--input-type=module','--check'],{input:match[1],encoding:'utf8'});
  assert.equal(result.status,0,result.stderr||result.stdout);
});
