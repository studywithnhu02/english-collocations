import assert from 'node:assert/strict';
import test from 'node:test';
import {readFile} from 'node:fs/promises';

const app=await readFile(new URL('../app.html',import.meta.url),'utf8');
const ai=await readFile(new URL('../ai-agent.js',import.meta.url),'utf8');
const smart=await readFile(new URL('../smart-tools.js',import.meta.url),'utf8');

test('GitHub Preview status is inside Box 1',()=>{
  assert.ok(app.includes('id="box1"'));
  assert.ok(app.includes('class="github-status-inline" id="previewStatus"'));
  assert.ok(!app.includes('<body><div class="preview-status"'));
});

test('Goals, SRS and Smart Tools modules are loaded',()=>{
  assert.ok(app.includes('./goals-ui.js?v=1'));
  assert.ok(app.includes('./srs-ui.js?v=1'));
  assert.ok(app.includes('./smart-tools.js?v=9'));
  assert.ok(app.includes('id="appUser"'));
  assert.ok(app.includes('id="appLogout"'));assert.ok(app.includes('domains-ui.js?v=3'));assert.ok(app.includes('vocabulary-ui.js?v=5'));assert.ok(app.includes('<th>CẤU TRÚC</th>'));assert.ok(app.includes('<th>Ngày Done</th>'));assert.ok(app.includes('min-width:1420px'));assert.ok(app.includes('max-width:none'));assert.ok(app.includes('./history-core.mjs?v=1'));assert.ok(app.includes('class="done-date"'));
});

test('Story output is highlighted and dialogue is split into lines',()=>{
  assert.ok(ai.includes('storyCoverage'));
  assert.ok(ai.includes('renderStoryResult'));
  assert.ok(ai.includes('story-line'));
  assert.ok(ai.includes('story-collocation'));
  assert.ok(ai.includes('fallbackStory'));
  assert.ok(ai.includes('story:true'));
});

test('Smart suggestion is wired to the collocation cell with CEFR, duplicate markers and expanded multi-source top-up',()=>{
  assert.ok(smart.includes('editable[data-field="c"]'));
  assert.ok(smart.includes('Gợi ý trong thư viện'));
  assert.ok(smart.includes('suggestion-cefr'));
  assert.ok(smart.includes('suggestion-exists'));
  assert.ok(smart.includes('✓ Đã có trong bảng'));
  assert.ok(smart.includes('.startsWith(q)'));
  assert.ok(smart.includes('begin exactly with the supplied input'));assert.ok(smart.includes('getExternalSuggestions'));
  assert.ok(smart.includes('up to 30 common natural English collocations'));assert.ok(smart.includes('purpose:\'suggestion-meanings\''));assert.ok(smart.includes('maxNewTokens:768'));assert.ok(smart.includes('slice(0,60)'));assert.ok(smart.includes('open MIT set'));
  assert.ok(smart.includes('local.length<10'));
  assert.ok(smart.includes('suggestCefr'));assert.ok(smart.includes('Nghĩa tiếng Việt được ưu tiên'));
  assert.ok(!smart.includes('Smart Refinement'));
  assert.ok(!smart.includes('refineRun'));
});

console.log('Feature Preview UI contract tests: PASS');

test('example repeater and paired example fields are present',()=>{
  for(const token of ['example-stack','example-pair','example-add','example-remove','examplesOf','exampleStackHtml','data-example-index','Xóa ví dụ','＋ Thêm ví dụ']) assert.ok(app.includes(token),token);
});
test('blanking an example sentence clears its paired example meaning',()=>{
  assert.ok(app.includes("if(field==='e'&&!val)r.examples[index].em='';"));
});

test('structure auto-fill and keyboard undo/redo contracts are wired',()=>{for(const token of ['data-field="structure"','PreviewIngestion?.autoFill?.(id,val)','undoHistory','redoHistory','createHistory','document.addEventListener(\'keydown\''])assert.ok(app.includes(token),token)});
