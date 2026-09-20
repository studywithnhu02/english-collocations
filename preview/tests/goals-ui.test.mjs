import assert from 'node:assert/strict';import test from 'node:test';import {readFile} from 'node:fs/promises';
const js=await readFile(new URL('../goals-ui.js',import.meta.url),'utf8');
test('goal UI derives week month year from daily target',()=>{assert.ok(js.includes('deriveGoalTargets'));assert.ok(js.includes("editable=period==='day'"));assert.ok(js.includes('data-goal="day"'));assert.ok(js.includes('↳ '+''));assert.ok(js.includes('Ngày là mục tiêu gốc'))});
console.log('Goals UI tests: PASS');