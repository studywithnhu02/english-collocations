import assert from 'node:assert/strict';
import test from 'node:test';
import {fetchDatamuseSuggestions,fetchOpenCollocationSuggestions,isUsableCollocation,normalizeCollocationQuery,normalizeDatamuseItems,normalizeOpenCollocationItems} from '../collocation-sources.mjs';

test('Datamuse normalization keeps prefix multi-word phrases',()=>{
  assert.equal(normalizeCollocationQuery('  Meet   a '),'meet a');
  assert.equal(isUsableCollocation('meet a deadline','meet a'),true);
  assert.equal(isUsableCollocation('deadline','meet a'),false);
  const items=normalizeDatamuseItems([
    {word:'meet a deadline',score:900},
    {word:'meet',score:100},
    {word:'meet a deadline',score:800},
    {word:'wrong phrase',score:700}
  ],'meet a');
  assert.equal(items.filter(x=>x.c==='meet a deadline').length,2);
  assert.equal(items.some(x=>x.c==='meet'),false);
});

test('Datamuse fetch survives partial failures and deduplicates',async()=>{
  const calls=[];
  const fakeFetch=async url=>{
    calls.push(String(url));
    if(String(url).includes('/sug?'))return{ok:true,json:async()=>[
      {word:'meet a deadline',score:900},
      {word:'meet a requirement',score:850}
    ]};
    if(String(url).includes('rel_bga='))return{ok:true,json:async()=>[
      {word:'a deadline',score:700}
    ]};
    return{ok:false,status:503,json:async()=>[]};
  };
  const items=await fetchDatamuseSuggestions('meet a',{fetchImpl:fakeFetch});
  assert.ok(calls.length>=2);
  assert.equal(items[0].c,'meet a deadline');
  assert.equal(items.filter(x=>x.c==='meet a deadline').length,1);
});
console.log('Collocation source tests: PASS');


test('open MIT collocation dataset normalization preserves Vietnamese-ready metadata',()=>{
  const items=normalizeOpenCollocationItems([
    {collocation:'make a decision',meaning:'to choose after consideration'},
    {collocation:'meet a deadline',meaning:'to complete something on time'}
  ],'meet');
  assert.equal(items.length,1);
  assert.equal(items[0].c,'meet a deadline');
  assert.equal(items[0].source,'open-mit-300');
  assert.equal(items[0].meaningEn,'to complete something on time');
});

test('open dataset fetch filters by prefix and exposes open-source records',async()=>{
  let calls=0;
  const fakeFetch=async url=>{
    calls++;
    assert.match(String(url),/Collocation-Vocab-Practice-Claude-SKILL/);
    return {ok:true,json:async()=>[
      {collocation:'meet a deadline',meaning:'to complete something on time'},
      {collocation:'make a decision',meaning:'to choose after consideration'}
    ]};
  };
  const items=await fetchOpenCollocationSuggestions('meet',{fetchImpl:fakeFetch});
  assert.equal(items[0].c,'meet a deadline');
  assert.equal(items[0].source,'open-mit-300');
  assert.ok(calls>=1);
});
console.log('Open collocation source tests: PASS');
