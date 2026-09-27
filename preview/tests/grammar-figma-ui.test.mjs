import assert from 'node:assert/strict';
import test from 'node:test';
import {readFile} from 'node:fs/promises';

const app=await readFile(new URL('../app.html',import.meta.url),'utf8');
const grammar=await readFile(new URL('../grammar-ui.js',import.meta.url),'utf8');

test('Grammar Figma latest uses 288px left rail plus flexible center',()=>{
  assert.ok(app.includes('grid-template-columns:288px minmax(0,1fr)'));
  assert.ok(app.includes('grid-template-rows:91px 63px minmax(0,1fr)'));
  assert.ok(app.includes('.grammar2-head{grid-column:1/-1;grid-row:1'));
  assert.ok(app.includes('.grammar2-note{grid-column:1/-1;grid-row:2'));
  assert.ok(app.includes('.grammar2-body{grid-column:1/-1;grid-row:3'));
  assert.ok(app.includes('.grammar2-rail{grid-column:1'));
  assert.ok(app.includes('.grammar2-detail{grid-column:2'));
  assert.ok(app.includes('Grammar Figma latest parity'));
});

test('Left rail contains Overview and Mục lục with search and filters like latest Figma',()=>{
  for(const token of [
    'grammar2-overview','grammar2-toc','TỔNG QUAN HỌC TẬP','Mục lục',
    'grammar2-toc-controls','grammar2-filter-row','grammar2-chapter-summary'
  ]) assert.ok(grammar.includes(token),token);
});

test('Center document stage follows latest Figma measurements',()=>{
  assert.ok(app.includes('.grammar2-detail{grid-column:2;min-width:0;min-height:calc(100vh - 154px)'));
  assert.ok(app.includes('.grammar2-detail-card{width:100%;min-height:calc(100vh - 170px)'));
  assert.ok(app.includes('padding:8px!important;background:#fafafa!important'));
  assert.ok(app.includes('.grammar2-focus strong{display:block;padding:17px'));
  assert.ok(app.includes('font:600 20px/28px "SFMono-Regular",Consolas,monospace'));
});

test('Header and helper notice follow current Figma content hierarchy',()=>{
  for(const token of ['<h1>Grammar Learning Hub</h1>','ESSENTIAL GRAMMAR IN USE','ELEMENTARY','Raymond Murphy','grammar2-note-label','grammar2-note-steps','grammar2-note-tip','grammar2-shortcuts']) assert.ok(grammar.includes(token),token);
  const qi=grammar.indexOf('id="grammarQuiz"');
  const ei=grammar.indexOf('id="grammarExercise"');
  assert.ok(qi>0 && ei>qi,'Ôn nhanh should appear before Bài tập');
});

test('No functional Grammar hooks are lost during visual rewrite',()=>{
  for(const token of ['grammarFolderHome','grammarBack','grammarQuiz','grammarExercise','grammarSearch2','grammarChapter2','grammarStatus2','grammarDone2','grammarExerciseFromDetail','grammarPrev','grammarNext','data-unit','bindGrammarResizer','PreviewGrammarExercises']) assert.ok(grammar.includes(token),token);
});

test('Latest rendered Grammar theory DOM does not use the obsolete right sidebar',()=>{
  const renderStart=grammar.indexOf('function render(){');
  const renderEnd=grammar.indexOf('function renderDetail(){');
  const renderSource=grammar.slice(renderStart,renderEnd);
  assert.ok(renderSource.includes('grammar2-rail'));
  assert.ok(renderSource.includes('grammar2-detail'));
  assert.ok(!renderSource.includes('grammar2-side'));
});

console.log('Grammar Figma latest UI parity tests: PASS');
