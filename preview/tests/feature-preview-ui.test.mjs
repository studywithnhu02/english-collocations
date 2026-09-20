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
  assert.ok(app.includes('./smart-tools.js?v=5'));
  assert.ok(app.includes('id="appUser"'));
  assert.ok(app.includes('id="appLogout"'));assert.ok(app.includes('domains-ui.js?v=2'));assert.ok(app.includes('vocabulary-ui.js?v=3'));
});

test('Story output is highlighted and dialogue is split into lines',()=>{
  assert.ok(ai.includes('storyCoverage'));
  assert.ok(ai.includes('renderStoryResult'));
  assert.ok(ai.includes('story-line'));
  assert.ok(ai.includes('story-collocation'));
  assert.ok(ai.includes('fallbackStory'));
  assert.ok(ai.includes('story:true'));
});

test('Smart suggestion is wired to the collocation cell with CEFR, duplicate markers and 10-item AI top-up',()=>{
  assert.ok(smart.includes('editable[data-field="c"]'));
  assert.ok(smart.includes('Gợi ý trong thư viện'));
  assert.ok(smart.includes('suggestion-cefr'));
  assert.ok(smart.includes('suggestion-exists'));
  assert.ok(smart.includes('✓ Đã có trong bảng'));
  assert.ok(smart.includes('return x.c.toLowerCase().startsWith(q)'));
  assert.ok(smart.includes('collocations beginning with the supplied input'));
  assert.ok(smart.includes('of 12 common natural English collocations'));
  assert.ok(smart.includes('local.length<10'));
  assert.ok(smart.includes('suggestCefr'));
  assert.ok(!smart.includes('Smart Refinement'));
  assert.ok(!smart.includes('refineRun'));
});

console.log('Feature Preview UI contract tests: PASS');
