import assert from 'node:assert/strict';
import test from 'node:test';
import {readFile} from 'node:fs/promises';

const app=await readFile(new URL('../app.html',import.meta.url),'utf8');
const ingestion=await readFile(new URL('../smart-ingestion.js',import.meta.url),'utf8');
const core=await readFile(new URL('../smart-ingestion-core.mjs',import.meta.url),'utf8');
const smart=await readFile(new URL('../smart-tools.js',import.meta.url),'utf8');
const worker=await readFile(new URL('../ai-agent-worker.js',import.meta.url),'utf8');
const vocab=await readFile(new URL('../vocabulary-ui.js',import.meta.url),'utf8');

test('fast-lane table rendering avoids full DOM work for large datasets',()=>{
  assert.ok(app.includes("renderLimit=80"));
  assert.ok(app.includes('id="loadMoreRows"'));
  assert.ok(app.includes('visibleRows=rows.slice(0,renderLimit)'));
  assert.ok(app.includes("renderLimit+=80"));
  assert.ok(app.includes('cachedTopics=[]'));
  assert.ok(app.includes('cachedDuplicates=[]'));
  assert.ok(app.includes('function refreshRenderMeta()'));
});

test('collocation edit sends AI work to the idle Auto-fill queue only when fields are missing',()=>{
  assert.ok(app.includes("const needsAutoFill=!String(r.m||'').trim()||!String(r.e||'').trim()"));
  assert.ok(app.includes('window.PreviewIngestion?.queueAutoFill?.(id,val)'));
  assert.equal(app.includes("window.AutoTranslate?.schedule(id,'c',val,{immediate:true})"),false);
  assert.ok(ingestion.includes('requestIdleCallback'));
  assert.ok(ingestion.includes('pendingById=new Map()'));
  assert.ok(ingestion.includes('queueAutoFill'));
  assert.ok(ingestion.includes("purpose:'autofill'"));
  assert.ok(ingestion.includes('maxNewTokens:needs.meaning&&needs.example?144'));
});

test('Auto-fill validates only missing fields and does not duplicate example translation',()=>{
  assert.ok(core.includes('requireMeaning=true,requireExample=true'));
  assert.ok(core.includes("requireExample:!String(current.e||'').trim()"));
  assert.ok(ingestion.includes("!String(changes.em||'').trim()"));
});

test('Smart Suggestion is local-first and never starts AI on focus/input',()=>{
  const requestStart=smart.indexOf('function requestSuggestions(');
  const requestEnd=smart.indexOf('function handleInput(',requestStart);
  const requestBody=smart.slice(requestStart,requestEnd);
  assert.ok(requestBody.includes('fastSuggestionItems'));
  assert.equal(requestBody.includes('enrichSuggestions'),false);
  assert.ok(smart.includes("textContent='✨ Tìm thêm từ + AI'"));
  assert.ok(smart.includes("await import('./ai-client.js?v=3')"));
});

test('Auto-fill and suggestion AI use the lightweight model while Agent keeps the quality model',()=>{
  assert.ok(worker.includes("fast:{id:'onnx-community/SmolLM2-135M-Instruct-ONNX-MHA'"));
  assert.ok(worker.includes("quality:{id:'onnx-community/Qwen2.5-0.5B-Instruct'"));
  assert.ok(worker.includes("purpose==='autofill'||purpose==='suggestions'||purpose==='suggestion-meanings'?'fast':'quality'"));
  assert.ok(worker.includes('workQueue=workQueue.then'));
  assert.ok(worker.includes("profileCap=profile==='fast'?144:512"));
});

test('Vocabulary decoration uses one row map instead of reading the dataset for every DOM row',()=>{
  assert.ok(vocab.includes('function getRow(id)'));
  assert.ok(vocab.includes('decorateRow(tr,getRow(tr.dataset.id)))'));
  assert.ok(vocab.includes('function decorateRow(tr,row)'));
});
