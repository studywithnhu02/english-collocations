import assert from 'node:assert/strict';import test from 'node:test';import {DOMAIN_TAGS,CEFR_LEVELS,averageCefr,cefrCounts,inferCefr,normalizeVocabularyRow,toggleListValue,domainCounts,levelUp} from '../vocabulary-core.mjs';
test('vocabulary schema is backward compatible and normalized',()=>{const r=normalizeVocabularyRow({id:1,c:'meet a deadline'});assert.equal(r.cefr,'');assert.deepEqual(r.domains,[]);assert.equal(r.source.type,'manual');assert.equal(r.quality.naturalnessScore,null);assert.equal(r.learning.reviewCount,0);assert.equal(r.doneAt,'')});
test('CEFR inference uses curated overrides for common collocations',()=>{assert.equal(inferCefr('meet a deadline'),'B2');assert.equal(inferCefr('undertake a project'),'C1');assert.equal(normalizeVocabularyRow({c:'undertake a project',cefr:'C2'}).cefr,'C2');assert.ok(CEFR_LEVELS.includes(averageCefr([{c:'work',cefr:'A1'},{c:'undertake a project',cefr:'C1'}])))});
test('domain and CEFR analytics count normalized values',()=>{const rows=[{c:'a',cefr:'B1',domains:['Business']},{c:'b',cefr:'C1',domains:['Business','Technology']}];assert.deepEqual(domainCounts(rows),{Business:2,Technology:1});assert.equal(cefrCounts(rows).B1,1);assert.equal(cefrCounts(rows).C1,1);assert.ok(DOMAIN_TAGS.includes('UI/UX Design'))});
test('domain toggle is bounded and idempotent',()=>{let v=toggleListValue([], 'Business');assert.deepEqual(v,['Business']);v=toggleListValue(v,'Business',8,['Business']);assert.deepEqual(v,[]);assert.deepEqual(toggleListValue([], 'Not allowed',8,['Business']),[])});
test('level up rules are explicit suggestions, not automatic rewrites',()=>{const x=levelUp('do a project');assert.equal(x.suggestions[0][0],'undertake a project');assert.equal(x.suggestions[0][1],'C1')});

test('custom domain values are retained on normalized rows',()=>{const r=normalizeVocabularyRow({id:1,c:'x',domains:['My Custom Domain']});assert.deepEqual(r.domains,['My Custom Domain'])});

test('unknown CEFR does not default to A2 and doneAt survives normalization',()=>{
  assert.equal(inferCefr('rarephrase something'),'');
  const done='2026-09-20T10:30:00.000Z';
  assert.equal(normalizeVocabularyRow({c:'x',doneAt:done}).doneAt,done);
});

test('multiple example pairs normalize with legacy e/em compatibility',()=>{
  const r=normalizeVocabularyRow({id:7,c:'user experience',e:'Example one.',em:'Ví dụ một.',examples:[
    {e:'Example one.',em:'Ví dụ một.'},
    {e:'Example two.',em:'Ví dụ hai.'}
  ]});
  assert.equal(r.examples.length,2);
  assert.equal(r.e,'Example one.');
  assert.equal(r.em,'Ví dụ một.');
  assert.deepEqual(r.examples[1],{e:'Example two.',em:'Ví dụ hai.'});
});
test('legacy example fields migrate into examples[]',()=>{
  const r=normalizeVocabularyRow({id:8,c:'make a decision',e:'We need to decide.',em:'Chúng ta cần quyết định.'});
  assert.deepEqual(r.examples,[{e:'We need to decide.',em:'Chúng ta cần quyết định.'}]);
});

import {inferStructure} from '../structure-core.mjs';import {createHistory,commitHistory,undoHistory,redoHistory} from '../history-core.mjs';
test('structures are retained and common collocations get reusable patterns',()=>{const r=normalizeVocabularyRow({c:'keep in check',structure:'Keep + something + in check'});assert.equal(r.structure,'Keep + something + in check');assert.equal(inferStructure('keep in check'),'Keep + something + in check')});
test('unlimited example pairs are preserved during normalization',()=>{const examples=Array.from({length:60},(_,i)=>({e:'Example '+(i+1),em:'Nghĩa '+(i+1)}));const r=normalizeVocabularyRow({c:'x',examples});assert.equal(r.examples.length,60);assert.equal(r.examples[59].e,'Example 60')});
test('undo/redo history restores deleted and edited snapshots',()=>{let h=createHistory('A');h=commitHistory(h,'B');h=commitHistory(h,'C');let u=undoHistory(h);assert.equal(u.snapshot,'B');h=u.state;let u2=undoHistory(h);assert.equal(u2.snapshot,'A');h=u2.state;let d=redoHistory(h);assert.equal(d.snapshot,'B');h=d.state;h=commitHistory(h,'D');assert.equal(redoHistory(h).snapshot,null)});
