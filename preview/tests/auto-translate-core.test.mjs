import assert from 'node:assert/strict';
import test from 'node:test';
import {TRANSLATION_TARGETS,normalize,hasTranslatableText,translationKey,targetFieldFor,isStale,sourceMatches,mergeTranslationRow,shouldTranslate} from '../auto-translate-core.mjs';

assert.deepEqual(TRANSLATION_TARGETS,{c:'m',e:'em'});
assert.equal(targetFieldFor('c'),'m');
assert.equal(targetFieldFor('e'),'em');
assert.equal(targetFieldFor('m'),null);

assert.equal(normalize('  We   need   to   go. '),'We need to go.');
assert.equal(hasTranslatableText('Go'),true);
assert.equal(hasTranslatableText(''),false);
assert.equal(hasTranslatableText('   '),false);
assert.equal(hasTranslatableText('12345'),false);
assert.equal(shouldTranslate('c','Go'),true);
assert.equal(shouldTranslate('e','We need to go.'),true);
assert.equal(shouldTranslate('m','làm việc'),false);

assert.equal(translationKey(42,'c'),'42::c');
assert.equal(translationKey(42,'e'),'42::e');
assert.notEqual(translationKey(42,'c'),translationKey(42,'e'));

assert.equal(sourceMatches('  Go ','Go'),true);
assert.equal(sourceMatches('Go now','Go'),false);
assert.equal(isStale(2,1),true);
assert.equal(isStale(2,2),false);

const rows=[{id:1,c:'meet a deadline',m:'đáp ứng thời hạn',t:'Work',e:'We need to meet it.',em:'Chúng ta cần đáp ứng điều đó.'}];
let result=mergeTranslationRow(rows,1,'c','meet the deadline','đáp ứng thời hạn');
assert.equal(result.changed,true);
assert.deepEqual(result.rows[0],{id:1,c:'meet the deadline',m:'đáp ứng thời hạn',t:'Work',e:'We need to meet it.',em:'Chúng ta cần đáp ứng điều đó.'});

result=mergeTranslationRow(rows,1,'e','We need to go.','Chúng ta cần đi.');
assert.equal(result.rows[0].c,'meet a deadline');
assert.equal(result.rows[0].m,'đáp ứng thời hạn');
assert.equal(result.rows[0].e,'We need to go.');
assert.equal(result.rows[0].em,'Chúng ta cần đi.');

console.log('Auto Translate core tests: PASS');

test('Auto Translate selector only binds the first example row for repeater safety',async()=>{
  const {readFile}=await import('node:fs/promises');
  const js=await readFile(new URL('../auto-translate.js',import.meta.url),'utf8');
  assert.ok(js.includes('.editable[data-field="e"][data-example-index="0"]'));
});
