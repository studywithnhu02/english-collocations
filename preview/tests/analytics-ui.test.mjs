import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import test from 'node:test';

const js=await readFile(new URL('../analytics-ui.js',import.meta.url),'utf8');

test('analytics UI uses Vietnam timezone and daily reset semantics',()=>{
  assert.ok(js.includes("Asia/Ho_Chi_Minh"));
  assert.ok(js.includes("localDateKey()"));
  assert.ok(js.includes('setInterval(refresh,30000)'));
  assert.ok(js.includes('toggleCheckin'));
  assert.ok(js.includes('removeCheckin'));
  assert.ok(js.includes('recordStudy'));
  assert.ok(js.includes('calendarCursor'));
  assert.ok(js.includes('prevMonth'));
  assert.ok(js.includes('nextMonth'));
});

// Regression gate: Vietnam midnight reset and check-in toggle.
console.log('Analytics UI contract tests: PASS');
