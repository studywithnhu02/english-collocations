import assert from 'node:assert/strict';
import test from 'node:test';
import {readFile} from 'node:fs/promises';

const js=await readFile(new URL('../analytics-ui.js',import.meta.url),'utf8');
const html=await readFile(new URL('../app.html',import.meta.url),'utf8');

test('analytics UI uses Vietnam timezone and daily reset semantics',()=>{
  assert.ok(js.includes('Asia/Ho_Chi_Minh'));
  assert.ok(js.includes('localDateKey()'));
  assert.ok(js.includes('setInterval(refresh,30000)'));
  assert.ok(js.includes('toggleCheckin'));
  assert.ok(js.includes('removeCheckin'));
  assert.ok(js.includes('recordStudy'));
  assert.ok(js.includes('pruneToRows'));
  assert.ok(js.includes('currentStatusCounts'));
});

test('dashboard status cards are wired to current table data',()=>{
  assert.ok(js.includes("const DATA_KEY='english-collocations-preview-v2'"));
  assert.ok(js.includes('currentStatusCounts()'));
  assert.ok(html.includes('id="analyticsLearned"'));
  assert.ok(html.includes('id="analyticsNotLearned"'));
  assert.ok(html.includes('id="analyticsInProgress"'));
});

test('historical learning charts remain separate from current status counts',()=>{
  assert.ok(js.includes("buildLearningSeries(value.learningEvents,'week',new Date())"));
  assert.ok(js.includes("buildLearningSeries(value.learningEvents,'month',new Date())"));
  assert.ok(js.includes('currentStatusCounts()'));
});

console.log('Analytics UI contract tests: PASS');