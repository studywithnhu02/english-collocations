import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import test from 'node:test';

const html=await readFile(new URL('../index.html',import.meta.url),'utf8');

test('Analytics dashboard UI contract',()=>{
  assert.ok(html.includes('analytics-card'));
  assert.ok(html.includes('id="analyticsCheckin"'));
  assert.ok(html.includes('id="analyticsLearned"'));
  assert.ok(html.includes('id="analyticsWeek"'));
  assert.ok(html.includes('id="analyticsMonth"'));
  assert.ok(html.includes('id="analyticsStreak"'));
  assert.ok(html.includes('data-analytics-mode="week"'));
  assert.ok(html.includes('data-analytics-mode="month"'));
  assert.ok(html.includes('ANALYTICS_KEY'));
  assert.ok(html.includes('./analytics-core.mjs'));
  assert.ok(html.includes('recordStudyEvent(id)'));
  assert.ok(html.includes('JSON.stringify({data,statuses:loadStatuses(),analytics:loadAnalytics()},null,2)'));
});

test('Duplicate collocation guard UI contract',()=>{
  assert.ok(html.includes('./collocation-core.mjs'));
  assert.ok(html.includes('findDuplicateCollocation(data,val,id)'));
  assert.ok(html.includes('findDuplicateCollocations(data)'));
  assert.ok(html.includes('Không thể tạo bản trùng.'));
  assert.ok(html.includes('Preview từ chối Restore để tránh tạo dữ liệu trùng.'));
  assert.ok(html.includes('id="duplicateWarning"'));
});

test('Existing Preview features remain loaded',()=>{
  assert.ok(html.includes('./ai-agent.js?v=6'));
  assert.ok(html.includes('./spellcheck.js?v=1'));
  assert.ok(html.includes('./auto-translate.js?v=6'));
});

console.log('Analytics + duplicate Preview contract tests: PASS');
