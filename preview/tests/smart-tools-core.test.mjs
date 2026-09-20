import assert from 'node:assert/strict';
import test from 'node:test';
import {fastSuggestions,normalizeSmartInput,refinementPrompt,ruleRefinement,synonymsFor} from '../smart-tools-core.mjs';

test('smart input normalizes headwords',()=>{
  assert.equal(normalizeSmartInput('  Allow! '),'allow');
  assert.deepEqual(fastSuggestions('Allow').slice(0,3),['allow access','allow customers to','allow users to']);
});

test('autocomplete filters progressively inside the headword bank',()=>{
  assert.deepEqual(fastSuggestions('allow u'),['allow users to']);
  assert.deepEqual(fastSuggestions('IMPROVE U'),['improve user experience']);
  assert.equal(new Set(fastSuggestions('allow')).size,fastSuggestions('allow').length);
  assert.ok(fastSuggestions('allow').length<=5);
});

test('autocomplete ignores an already completed exact phrase',()=>{
  assert.deepEqual(fastSuggestions('allow access'),[]);
});

test('synonyms are available without being treated as fill suggestions',()=>{
  assert.deepEqual(synonymsFor('allow'),['permit','authorize']);
});

test('known confusing collocations get explicit corrections',()=>{
  const result=ruleRefinement('make a deadline');
  assert.equal(result.better,'meet a deadline / beat a deadline');
  assert.match(result.warning||result.message,/make a deadline/);
});

test('refinement prompt only contains selected row ids and collocations',()=>{
  const prompt=refinementPrompt([{id:1,c:'make a decision',m:'x'},{id:2,c:'user experience',m:'y'}]);
  const rows=JSON.parse(prompt);
  assert.deepEqual(rows,[{index:1,id:'1',collocation:'make a decision'},{index:2,id:'2',collocation:'user experience'}]);
  assert.equal(Object.hasOwn(rows[0],'meaning'),false);
  assert.equal(Object.hasOwn(rows[1],'meaning'),false);
});

console.log('Smart Tools core tests: PASS');
