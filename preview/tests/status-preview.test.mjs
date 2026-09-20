import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import test from 'node:test';

const html=await readFile(new URL('../index.html',import.meta.url),'utf8');

test('Preview status UI contract',()=>{
  assert.match(html,/<th[^>]*>Status<\\/th>/);
  assert.match(html,/id="statusFilter"/);
  assert.match(html,/id="statusMenu"/);
  assert.match(html,/id="statusAdd">＋ Thêm trạng thái<\\/button>/);
  assert.match(html,/data-status-toggle/);
  assert.match(html,/data-status-choice/);
  assert.match(html,/data-status-remove/);
  assert.match(html,/STATUS_KEY='english-collocations-preview-statuses-v1'/);
  assert.match(html,/\\.\\/status-core\\.mjs/);
});

test('Status is persisted and exported',()=>{
  assert.match(html,/s:normalizeStatus\\(x\\.s\\?\\?x\\.status\\?\\?'':\\)/);
  assert.match(html,/JSON\\.stringify\\(\\{data,statuses:loadStatuses\\(\\)\\},null,2\\)/);
  assert.match(html,/const h=\\['STT','Collocation','Nghĩa Collocation','Chủ đề','Câu giao tiếp ví dụ','Nghĩa câu ví dụ','Status','Ngày tạo'\\]/);
});

test('Previously hidden UI remains hidden and feature modules remain loaded',()=>{
  assert.match(html,/class="card agent-shell ai" hidden aria-hidden="true"/);
  assert.match(html,/hidden aria-hidden="true"><h2>🔐 Preview an toàn<\\/h2>/);
  assert.match(html,/\\.\\/ai-agent\\.js\\?v=6/);
  assert.match(html,/\\.\\/spellcheck\\.js\\?v=1/);
  assert.match(html,/\\.\\/auto-translate\\.js\\?v=6/);
});

console.log('Status Preview contract tests: PASS');