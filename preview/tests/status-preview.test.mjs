import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import test from 'node:test';

const html=await readFile(new URL('../index.html',import.meta.url),'utf8');

test('Preview status UI contract',()=>{
  assert.ok(html.includes('<th>Status</th>'));
  assert.ok(html.includes('id="statusFilter"'));
  assert.ok(html.includes('id="statusMenu"'));
  assert.ok(html.includes('id="statusAdd">＋ Thêm trạng thái</button>'));
  assert.ok(html.includes('data-status-toggle'));
  assert.ok(html.includes('data-status-choice'));
  assert.ok(html.includes('data-status-remove'));
  assert.ok(html.includes("STATUS_KEY='english-collocations-preview-statuses-v1'"));
  assert.ok(html.includes('./status-core.mjs'));
  assert.ok(html.includes('window.$=$'));
  assert.ok(html.includes('status-not-learned'));
  assert.ok(html.includes('status-learned'));
  assert.ok(html.includes('body.light-theme .status-button.status-not-learned'));
  assert.ok(html.includes('body.light-theme .status-button.status-learned'));
  assert.ok(html.includes('statusRows=filterByStatus(data,status)'));
  assert.ok(html.includes("s:normalizeStatus(x.s??x.status??'Chưa học')||'Chưa học'"));
  assert.ok(html.includes('.main>.brand,.main>.card:not(.brand):not(.table-card){padding:9px 14px 5px}'));
});

test('Status is persisted and exported',()=>{
  assert.ok(html.includes('JSON.stringify({data,statuses:loadStatuses(),analytics:window.PreviewAnalytics?.getSnapshot?.()||{checkins:[],learningEvents:[]}},null,2)'));
  assert.ok(html.includes("const h=['STT','Collocation','Nghĩa Collocation','Chủ đề','Câu giao tiếp ví dụ','Nghĩa câu ví dụ','Status','Ngày tạo']"));
});

test('Previously hidden UI remains hidden and feature modules remain loaded',()=>{
  assert.ok(html.includes('class="card agent-shell ai" hidden aria-hidden="true"'));
  assert.ok(html.includes('hidden aria-hidden="true"><h2>🔐 Preview an toàn</h2>'));
  assert.ok(html.includes('./ai-agent.js?v=7'));
  assert.ok(html.includes('./spellcheck.js?v=1'));
  assert.ok(html.includes('./auto-translate.js?v=6'));
});

console.log('Status Preview contract tests: PASS');
