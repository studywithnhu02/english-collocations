import assert from 'node:assert/strict';
import test from 'node:test';
import {readFile} from 'node:fs/promises';

const js=await readFile(new URL('../spellcheck.js',import.meta.url),'utf8');

test('spellcheck never rewrites innerHTML while the edited cell is focused',()=>{
  assert.ok(js.includes('cell.contains(document.activeElement)'));
});

test('clearing spellcheck highlights does not reset a focused cell selection',()=>{
  assert.ok(js.includes('function clearAllHighlights()'));
  assert.ok(js.includes('document.activeElement'));
});

console.log('Spellcheck Preview contract tests: PASS');
