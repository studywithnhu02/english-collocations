import assert from 'node:assert/strict';
import test from 'node:test';
import {readFile} from 'node:fs/promises';
import {buildAutoFillChanges,parseAutoFillResponse} from '../smart-ingestion-core.mjs';

const js=await readFile(new URL('../smart-ingestion.js',import.meta.url),'utf8');

test('Auto-fill accepts object/array JSON and maps all three fields',()=>{
  assert.deepEqual(parseAutoFillResponse(JSON.stringify({meaningVi:'nghĩa',exampleEn:'We need to meet a deadline.',exampleVi:'Chúng ta cần hoàn thành đúng hạn.'})),{meaningVi:'nghĩa',exampleEn:'We need to meet a deadline.',exampleVi:'Chúng ta cần hoàn thành đúng hạn.'});
  assert.equal(parseAutoFillResponse('prefix '+JSON.stringify([{meaningVi:'nghĩa',exampleEn:'Example.',exampleVi:'Ví dụ.'}])).exampleVi,'Ví dụ.');
  assert.deepEqual(parseAutoFillResponse('not json'),{meaningVi:'',exampleEn:'',exampleVi:''});
});

test('Auto-fill never overwrites user-entered values',()=>{
  const row={m:'nghĩa của tôi',e:'câu của tôi',em:''};
  assert.deepEqual(buildAutoFillChanges(row,{meaningVi:'AI meaning',exampleEn:'AI example',exampleVi:'AI translation'}),{em:'AI translation'});
});

test('Auto-fill fills exampleEn and exampleVi together when both are empty',()=>{
  assert.deepEqual(buildAutoFillChanges({m:'',e:'',em:''},{meaningVi:'nghĩa',exampleEn:'We need to meet a deadline.',exampleVi:'Chúng ta cần hoàn thành đúng hạn.'}),{m:'nghĩa',e:'We need to meet a deadline.',em:'Chúng ta cần hoàn thành đúng hạn.'});
});

test('Auto-fill JS uses per-row request versions, AI options and translation fallback',()=>{
  for(const token of ['requestVersions=new Map()',"purpose:'autofill'","maxNewTokens:256",'window.AutoTranslate?.run','buildAutoFillChanges'])assert.ok(js.includes(token),token);
  assert.ok(!js.includes('let sequence=0'));
  assert.ok(js.includes('requestVersions.get(key)!==version'));
  assert.equal(js.includes('data-auto-fill'),false);
});
console.log('Ingestion Preview tests: PASS');
