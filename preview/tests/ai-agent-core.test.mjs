import assert from 'node:assert/strict';
import {extractJson, normalizeBatchResult} from '../ai-agent-core.js';

const one={index:0,id:'1',changed:false,correctedExample:'',explanationVi:'OK',confidence:1};

assert.deepEqual(extractJson('prefix [{"index":0}] trailing text'),[{index:0}]);
assert.deepEqual(extractJson('assistant: {"index":0} blah'),{index:0});
assert.deepEqual(extractJson('```json\n[{"index":0}]\n```'),[{index:0}]);

assert.deepEqual(normalizeBatchResult([one]),[one]);
assert.deepEqual(normalizeBatchResult({results:[one]}),[one]);
assert.deepEqual(normalizeBatchResult({items:[one]}),[one]);
assert.deepEqual(normalizeBatchResult({data:[one]}),[one]);
assert.deepEqual(normalizeBatchResult(one),[one]);
assert.deepEqual(normalizeBatchResult({a:{index:0},b:{index:1}}),[{index:0},{index:1}]);
assert.deepEqual(normalizeBatchResult(null),[]);
assert.deepEqual(normalizeBatchResult('text'),[]);
assert.throws(()=>extractJson('no json here'),/JSON/);

console.log('AI Agent core tests: PASS');
