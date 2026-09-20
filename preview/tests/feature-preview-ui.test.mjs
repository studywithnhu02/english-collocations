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
  assert.ok(app.includes('./smart-tools.js?v=2'));
  assert.ok(app.includes('id="appUser"'));
  assert.ok(app.includes('id="appLogout"'));
});

test('Story output is highlighted and dialogue is split into lines',()=>{
  assert.ok(ai.includes('storyCoverage'));
  assert.ok(ai.includes('renderStoryResult'));
  assert.ok(ai.includes('story-line'));
  assert.ok(ai.includes('story-collocation'));
  assert.ok(ai.includes('fallbackStory'));
  assert.ok(ai.includes('story:true'));
});

test('Smart suggestion and refinement are wired to the collocation cell',()=>{
  assert.ok(smart.includes('editable[data-field="c"]'));
  assert.ok(smart.includes('Gợi ý nhanh'));
  assert.ok(smart.includes('Gợi ý AI'));
  assert.ok(smart.includes('suggestPopover'));
  assert.ok(smart.includes('suggestion-btn'));
  assert.ok(smart.includes('ArrowDown'));
  assert.ok(smart.includes('ArrowUp'));
  assert.ok(smart.includes("e.key==='Enter'"));
  assert.ok(smart.includes("e.key==='Escape'"));
  assert.ok(smart.includes('repositionSuggest'));
  assert.ok(smart.includes('activeRequest++'));
  assert.ok(smart.includes('sanitizeAiSuggestions'));
  assert.ok(smart.includes('refineRun'));
  assert.ok(smart.includes('naturalnessScore'));
});

console.log('Feature Preview UI contract tests: PASS');
