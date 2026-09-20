import assert from 'node:assert/strict';
import test from 'node:test';
import {readFile} from 'node:fs/promises';
import {buildAutoFillChanges,parseAutoFillResponse,validateAutoFillResult} from '../smart-ingestion-core.mjs';

const js=await readFile(new URL('../smart-ingestion.js',import.meta.url),'utf8');

test('Auto-fill accepts object/array JSON and maps all three fields',()=>{
  assert.deepEqual(parseAutoFillResponse(JSON.stringify({meaningVi:'nghĩa',exampleEn:'We need to meet a deadline.',exampleVi:'Chúng ta cần hoàn thành đúng hạn.'})),{meaningVi:'nghĩa',exampleEn:'We need to meet a deadline.',exampleVi:'Chúng ta cần hoàn thành đúng hạn.'});
  assert.equal(parseAutoFillResponse('prefix '+JSON.stringify([{meaningVi:'nghĩa',exampleEn:'Example.',exampleVi:'Ví dụ.'}])).exampleVi,'Ví dụ.');
  assert.deepEqual(parseAutoFillResponse('not json'),{meaningVi:'',exampleEn:'',exampleVi:''});
});

test('Auto-fill never overwrites user-entered values',()=>{
  const row={c:'meet a deadline',m:'nghĩa của tôi',e:'We need to meet a deadline.',em:''};
  assert.deepEqual(buildAutoFillChanges(row,{meaningVi:'AI meaning',exampleEn:'AI example',exampleVi:'AI translation'}),{em:'AI translation'});
});

test('Auto-fill fills exampleEn and exampleVi together when both are empty',()=>{
  assert.deepEqual(buildAutoFillChanges({c:'meet a deadline',m:'',e:'',em:''},{meaningVi:'nghĩa',exampleEn:'We need to meet a deadline.',exampleVi:'Chúng ta cần hoàn thành đúng hạn.'} ,'meet a deadline'),{m:'nghĩa',e:'We need to meet a deadline.',em:'Chúng ta cần hoàn thành đúng hạn.'});
});

test('Auto-fill rejects examples that omit the exact collocation',()=>{
  const good={meaningVi:'tính đến',exampleEn:'We need to take into account the customer needs.',exampleVi:'Chúng ta cần tính đến nhu cầu của khách hàng.'};
  const bad={meaningVi:'tính đến',exampleEn:'We need to consider the customer needs.',exampleVi:'Chúng ta cần cân nhắc nhu cầu của khách hàng.'};
  assert.equal(validateAutoFillResult('take into account',good).ok,true);
  assert.equal(validateAutoFillResult('take into account',bad).ok,false);
  assert.deepEqual(buildAutoFillChanges({c:'take into account',m:'',e:'',em:''},bad,'take into account'),{m:'tính đến'});
});

test('Auto-fill JS uses per-row request versions, AI options and translation fallback',()=>{
  for(const token of ['requestVersions=new Map()',"purpose:'autofill'","maxNewTokens:256",'timeoutMs:20000','window.AutoTranslate?.run','buildAutoFillChanges'])assert.ok(js.includes(token),token);
  assert.ok(!js.includes('let sequence=0'));
  assert.ok(js.includes('requestVersions.get(key)!==version'));
  assert.equal(js.includes('data-auto-fill'),false);
});
console.log('Ingestion Preview tests: PASS');


test('Auto-fill does not use AI translation for a pre-existing example sentence',()=>{
  const row={c:'meet a deadline',m:'',e:'We need to meet a deadline today.',em:''};
  const ai={meaningVi:'hoàn thành đúng hạn',exampleEn:'We should meet a deadline for the project.',exampleVi:'Chúng ta nên hoàn thành một thời hạn cho dự án.'};
  assert.deepEqual(buildAutoFillChanges(row,ai,'meet a deadline'),{m:'hoàn thành đúng hạn'});
});
