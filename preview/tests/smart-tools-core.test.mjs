import assert from 'node:assert/strict';
import test from 'node:test';
import {COLLOCATION_BANK,fastSuggestionItems,fastSuggestions,normalizeSmartInput,refinementPrompt,ruleRefinement,synonymsFor} from '../smart-tools-core.mjs';

test('smart input normalizes headwords',()=>{
  assert.equal(normalizeSmartInput('  Allow! '),'allow');
  assert.deepEqual(fastSuggestions('Allow').slice(0,3),['allow access','allow customers to','allow users to']);
});

test('autocomplete filters progressively inside the headword bank',()=>{
  assert.deepEqual(fastSuggestions('allow u'),['allow users to']);
  assert.ok(fastSuggestions('IMPROVE U').includes('improve user experience'));
  assert.equal(new Set(fastSuggestions('allow')).size,fastSuggestions('allow').length);
  assert.ok(fastSuggestions('allow').length<=60);
});

test('local suggestion items include an immediate Vietnamese meaning',()=>{
  const items=fastSuggestionItems('allow');
  assert.ok(items.length>=3);
  assert.ok(items.every(item=>item.c&&item.v&&item.cefr));
  assert.equal(items[0].c,'allow access');
  assert.equal(items[0].v,'cho phép truy cập');
});

test('local knowledge base has broad workplace coverage',()=>{
  assert.ok(Object.keys(COLLOCATION_BANK).length>=40);
  for(const [head,items] of Object.entries(COLLOCATION_BANK)){
    assert.ok(head.length>=2);
    assert.ok(items.length>=5);
  }
});

test('unknown or partial input can fall through to AI without breaking local matching',()=>{
  assert.deepEqual(fastSuggestionItems('facilitate'),[]);
  assert.deepEqual(fastSuggestionItems('allow u').map(item=>item.c),['allow users to']);
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
