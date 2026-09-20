import assert from 'node:assert/strict';import test from 'node:test';import {quizRows,buildBlankItems,buildMatchingItems,gradeBlank} from '../quiz-core.mjs';
const rows=[{id:1,c:'meet a deadline',m:'hoàn thành đúng hạn',e:'We need to meet a deadline.',s:'Chưa học'},{id:2,c:'make progress',m:'có tiến triển',e:'The team is making progress.',s:'Đã học'},{id:3,c:'take responsibility',m:'chịu trách nhiệm',e:'She will take responsibility.',s:'Chưa học'}];
test('quiz source only includes Chưa học rows',()=>{assert.deepEqual(quizRows(rows).map(r=>r.id).sort(),[1,3])});
test('blank quiz masks exact collocation',()=>{const items=buildBlankItems(rows,2);assert.equal(items.length,2);assert.ok(items.every(x=>x.blank.includes('__________')||x.blank.includes('use')))});
test('matching quiz generates paired ids',()=>{const m=buildMatchingItems(rows,2);assert.equal(m.left.length,m.right.length);assert.deepEqual(new Set(m.left.map(x=>x.key)),new Set(m.right.map(x=>x.key)))});
test('blank grading tolerates a leading to',()=>{assert.equal(gradeBlank('to meet a deadline','meet a deadline'),true);assert.equal(gradeBlank('miss a deadline','meet a deadline'),false)});
