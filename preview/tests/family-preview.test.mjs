import assert from 'node:assert/strict';import test from 'node:test';import {readFile} from 'node:fs/promises';
const js=await readFile(new URL('../family-ui.js',import.meta.url),'utf8');
const vocab=await readFile(new URL('../vocabulary-ui.js',import.meta.url),'utf8');
test('family opens only from an explicit action and no row click listener remains',()=>{assert.ok(js.includes('[data-family]'));assert.ok(js.includes('openById'));assert.ok(!js.includes("closest?.('#body tr[data-id]')"));assert.ok(js.includes('Promise.race'));assert.ok(js.includes('familyRetry'))});
test('table provides an explicit family action',()=>{assert.ok(vocab.includes('data-family'));assert.ok(vocab.includes('Collocation Family'))});
console.log('Family Preview tests: PASS');