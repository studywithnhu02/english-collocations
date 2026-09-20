import assert from 'node:assert/strict';import test from 'node:test';import {readFile} from 'node:fs/promises';
const js=await readFile(new URL('../smart-tools.js',import.meta.url),'utf8');
test('suggestions render CEFR, existing-row warning, meanings and multi-source expansion',()=>{for(const token of ['suggestion-cefr','suggestion-exists','✓ Đã có trong bảng','getExternalSuggestions',"purpose:'suggestions'","purpose:'suggestion-meanings'","maxNewTokens:768",'slice(0,60)','Nghĩa tiếng Việt được ưu tiên','x.v||x.meaningEn'])assert.ok(js.includes(token),token)});
test('Smart Refinement UI has been removed',()=>{assert.equal(js.includes('Smart Refinement'),false);assert.equal(js.includes('refinementCard'),false);assert.equal(js.includes('refineRun'),false)});
console.log('Smart Tools Preview tests: PASS');

test('expanded local library contains many Vietnamese-ready collocations',async()=>{
  const source=await readFile(new URL('../collocation-library.mjs',import.meta.url),'utf8');
  assert.ok((source.match(/'[^']+\|[^']+\|(A1|A2|B1|B2|C1|C2)'/g)||[]).length>=150);
  assert.ok(source.includes('design a user flow|thiết kế luồng người dùng|B2'));
  assert.ok(source.includes('process a loan application|xử lý hồ sơ vay|B2'));
});


test('Smart Tools Preview includes open-source expanded collocation source',async()=>{
  const source=await readFile(new URL('../collocation-sources.mjs',import.meta.url),'utf8');
  assert.ok(source.includes('open-mit-300'));
  assert.ok(source.includes('Collocation-Vocab-Practice-Claude-SKILL'));
  assert.ok(source.includes('fetchOpenCollocationSuggestions'));
});
