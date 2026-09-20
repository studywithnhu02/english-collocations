import assert from 'node:assert/strict';
import test from 'node:test';
import {fastSuggestions,normalizeSmartInput,refinementPrompt,ruleRefinement} from '../smart-tools-core.mjs';

test('smart input normalizes headwords',()=>{
  assert.equal(normalizeSmartInput('  Allow! '),'allow');
  assert.deepEqual(fastSuggestions('Allow').slice(0,3),['allow access','allow customers to','allow users to']);
});

test('known confusing collocations get explicit corrections',()=>{
  const result=ruleRefinement('make a deadline');
  assert.equal(result.better,'meet a deadline / beat a deadline');
  assert.match(result.message,/make a deadline/);
});

test('refinement prompt only contains selected row ids and collocations',()=>{
  const prompt=refinementPrompt([{id:1,c:'make a decision',m:'x'},{id:2,c:'user experience',m:'y'}]);
  assert.match(prompt,/make a decision/);
  assert.doesNotMatch(prompt,/x/);
  assert.doesNotMatch(prompt,/y/);
});

console.log('Smart Tools core tests: PASS');
