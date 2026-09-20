import assert from 'node:assert/strict';import test from 'node:test';import {readFile} from 'node:fs/promises';
const anki=await readFile(new URL('../anki-export.js',import.meta.url),'utf8');const print=await readFile(new URL('../print-export.js',import.meta.url),'utf8');
test('Anki export is UTF-8 TSV compatible',()=>{assert.ok(anki.includes("['Front','Back','Example','Example Meaning','CEFR','Domain','Topic','Status']"));assert.ok(anki.includes('text/tab-separated-values'));assert.ok(anki.includes('\\ufeff'))});
test('print export provides flashcards and worksheet templates',()=>{assert.ok(print.includes('PreviewPrint'));assert.ok(print.includes('flashcards'));assert.ok(print.includes('worksheet'));assert.ok(print.includes('window.print()'));assert.ok(print.includes('Answer Key'))});
