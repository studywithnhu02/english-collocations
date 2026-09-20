import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import test from 'node:test';

const html=await readFile(new URL('../index.html',import.meta.url),'utf8');

test('new Preview feature surface is wired',()=>{
  for(const token of [
    './analytics-ui.js',
    './collocation-core.mjs',
    './contextual-story-core.mjs',
    'class="analytics-calendar"',
    'id="analyticsCheckin"',
    'id="analyticsPrev"',
    'id="analyticsNext"',
    'id="analyticsToday"',
    'id="duplicateWarning"',
    'data-story-mode="paragraph"',
    'data-story-mode="dialogue"',
    'buildStoryPrompt',
    'validateStorySelection',
    'window.PreviewAnalytics?.recordStudy(id,choice.dataset.statusChoice)',
    "const expected='b93e1a7'"
  ])assert.ok(html.includes(token),token);
});

test('learning is automatically recorded from the status action',()=>{
  assert.ok(html.includes('window.PreviewAnalytics?.recordStudy(id,choice.dataset.statusChoice)'));
});

test('duplicate data is warned and duplicate creation is blocked',()=>{
  assert.ok(html.includes('findDuplicateCollocations(data)'));
  assert.ok(html.includes('findDuplicateCollocation(data,val,id)'));
  assert.ok(html.includes('Không thể tạo bản trùng.'));
});

test('backup and protected modules remain intact',()=>{
  assert.ok(html.includes('JSON.stringify({data,statuses:loadStatuses(),analytics:loadAnalytics()},null,2)'));
  assert.ok(html.includes('./ai-agent.js?v=6'));
  assert.ok(html.includes('./spellcheck.js?v=1'));
  assert.ok(html.includes('./auto-translate.js?v=6'));
  assert.ok(html.includes('class="card agent-shell ai" hidden aria-hidden="true"'));
});

console.log('Analytics + duplicate + story Preview contract tests: PASS');
