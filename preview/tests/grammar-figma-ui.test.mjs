import assert from 'node:assert/strict';
import test from 'node:test';
import {readFile} from 'node:fs/promises';

const app=await readFile(new URL('../app.html',import.meta.url),'utf8');
const grammar=await readFile(new URL('../grammar-ui.js',import.meta.url),'utf8');

test('Grammar Figma layout uses the same 3-column workspace geometry',()=>{
  assert.match(app,/grid-template-columns:288px minmax\(0,1fr\) 288px/);
  assert.match(app,/grid-template-rows:91px 63px 51px minmax\(0,1fr\)/);
  assert.match(app,/\.grammar2-main\{display:contents\}/);
  assert.match(app,/\.grammar2-head\{grid-column:1\/-1;grid-row:1/);
  assert.match(app,/\.grammar2-note\{grid-column:1\/-1;grid-row:2/);
  assert.match(app,/\.grammar2-toolbar\{grid-column:1\/-1;grid-row:3/);
  assert.match(app,/\.grammar2-body\{grid-column:1\/3;grid-row:4/);
  assert.match(app,/\.grammar2-side\{grid-column:3;grid-row:4/);
});

test('Center Grammar document stage follows the Figma card treatment',()=>{
  assert.match(app,/\.grammar2-detail\{grid-column:2;grid-row:1/);
  assert.match(app,/padding:8px!important;overflow:auto/);
  assert.match(app,/\.grammar2-detail-card\{width:100%;min-height:765px;margin:0;padding:24px/);
  assert.match(app,/border:1px solid rgba\(229,229,229,.8\)!important/);
  assert.match(app,/box-shadow:0 1px 3px rgba\(0,0,0,.04\)!important/);
});

test('Left unit list matches Figma density and active number treatment',()=>{
  assert.match(app,/\.grammar2-list-head\{height:42px;padding:12px 16px/);
  assert.match(app,/\.grammar2-unit-list\{height:calc\(100vh - 247px\);max-height:none;padding:12px 0 0!important/);
  assert.match(app,/\.grammar2-unit\{width:100%;height:55\.5px;min-height:55\.5px/);
  assert.match(app,/\.grammar2-unit-no\{width:30px;height:19px/);
  assert.match(app,/\.grammar2-unit\.selected \.grammar2-unit-no\{background:#171717!important;color:#fff!important\}/);
});

test('Right analytics sidebar sits in the third workspace column, not above the content',()=>{
  assert.match(app,/\.grammar2-side\{grid-column:3;grid-row:4/);
  assert.match(app,/padding:0!important\}\nbody\.grammar-mode \.grammar2-side-card/);
  assert.match(app,/\.grammar2-side-resizer\{grid-column:3;grid-row:4/);
});

test('Helper notice uses explicit Figma-like 3-step structure with no duplicated tip',()=>{
  assert.ok(grammar.includes('grammar2-note-label'));
  assert.ok(grammar.includes('grammar2-note-steps'));
  assert.ok(grammar.includes('grammar2-note-tip'));
  assert.ok(grammar.includes('① Đọc công thức'));
  assert.ok(grammar.includes('② Nói lại ví dụ'));
  assert.ok(grammar.includes('③ Tự đặt 3 câu của bạn.'));
  assert.ok(!grammar.includes('grammar2-note::after'));
});

test('Existing Grammar behavior hooks are preserved',()=>{
  for(const token of [
    'grammarFolderHome','grammarBack','grammarExercise','grammarQuiz',
    'grammarSearch2','grammarChapter2','grammarStatus2',
    'grammarDone2','grammarExerciseFromDetail','grammarPrev','grammarNext',
    'data-unit','data-chapter','bindGrammarResizer','PreviewGrammarExercises'
  ]) assert.ok(grammar.includes(token),token);
});

console.log('Grammar Figma UI parity tests: PASS');


test('Header follows the Figma hierarchy and action order',()=>{
  assert.ok(grammar.includes('grammar2-head-copy'));
  assert.ok(grammar.includes('ESSENTIAL GRAMMAR IN USE'));
  assert.ok(grammar.includes('Raymond Murphy'));
  const qi=grammar.indexOf('id="grammarQuiz"');
  const ei=grammar.indexOf('id="grammarExercise"');
  assert.ok(qi>0 && ei>qi,'Ôn nhanh should appear before Bài tập');
  assert.ok(grammar.includes('<h1>Grammar<br>Learning Hub</h1>'));
});

test('Visual v3 fixes remove old emoji title and align detail emphasis without changing behavior hooks',()=>{
  assert.match(app,/\.grammar2-title-row h1\{[^}]*font-size:16px/);
  assert.match(app,/\.grammar2-focus strong\{font-size:24px/);
  assert.ok(!grammar.includes('📘 Grammar Learning Hub'));
  assert.ok(grammar.includes('grammarExercise'));
  assert.ok(grammar.includes('grammarQuiz'));
});
