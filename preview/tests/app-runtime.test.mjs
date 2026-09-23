import assert from 'node:assert/strict';
import test from 'node:test';
import {readFile,writeFile,rm} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
import {tmpdir} from 'node:os';
import {join} from 'node:path';

const app=await readFile(new URL('../app.html',import.meta.url),'utf8');

test('inline Preview module script is syntactically valid',async()=>{
  const match=app.match(/<script type="module">([\s\S]*?)<\/script>/);
  assert.ok(match,'inline module script not found');
  const file=join(tmpdir(),'english-collocations-preview-inline-check.mjs');
  await writeFile(file,match[1],'utf8');
  const result=spawnSync(process.execPath,['--check',file],{encoding:'utf8'});
  await rm(file,{force:true});
  assert.equal(result.status,0,result.stderr||'inline app module has syntax errors');
});

test('example pair runtime fix is present and previous malformed duplication is absent',()=>{
  assert.ok(app.includes("function syncExamplePair(r,index){"));
  assert.ok(app.includes("r.e=r.examples[0]?.e||'';r.em=r.examples[0]?.em||''}function commit(el)"));
  assert.ok(!app.includes("r.em=r.examples[0]?.em||''}r.e=r.examples[0]?.e||''"));
  assert.ok(app.includes("function load(){const raw=localStorage.getItem(KEY);if(raw!==null)"));
  assert.ok(app.includes("localStorage.setItem(KEY+'_recovery',raw)"));
});