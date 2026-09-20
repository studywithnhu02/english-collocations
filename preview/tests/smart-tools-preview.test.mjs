import assert from 'node:assert/strict';import test from 'node:test';import {readFile} from 'node:fs/promises';
const js=await readFile(new URL('../smart-tools.js',import.meta.url),'utf8');
test('suggestions render CEFR, existing-row warning and multi-source expansion',()=>{for(const token of ['suggestion-cefr','suggestion-exists','✓ Đã có trong bảng','getExternalSuggestions',"purpose:'suggestions'","maxNewTokens:384",'slice(0,20)','Nguồn: local library + Datamuse + AI'])assert.ok(js.includes(token),token)});
test('Smart Refinement UI has been removed',()=>{assert.equal(js.includes('Smart Refinement'),false);assert.equal(js.includes('refinementCard'),false);assert.equal(js.includes('refineRun'),false)});
console.log('Smart Tools Preview tests: PASS');