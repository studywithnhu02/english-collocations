import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import nspell from 'nspell';

async function load(lang){
  const base='preview/dictionaries/'+lang+'/';
  const [aff,dic]=await Promise.all([
    fs.readFile(base+'index.aff','utf8'),
    fs.readFile(base+'index.dic','utf8')
  ]);
  return nspell(aff,dic);
}

const en=await load('en');
assert.equal(en.correct('complete'),true);
assert.equal(en.correct('complet'),false);
assert.ok(en.suggest('complet').some(x=>x.toLowerCase()==='complete'));

const vi=await load('vi');
assert.equal(vi.correct('trải'),true);
assert.equal(vi.correct('ngừoi'),false);
assert.ok(Array.isArray(vi.suggest('ngừoi')));

console.log('Spellcheck runtime tests: PASS');
