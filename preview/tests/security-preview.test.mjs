import assert from 'node:assert/strict';import test from 'node:test';import {readFile} from 'node:fs/promises';
const files=['../vocabulary-ui.js','../smart-ingestion.js','../quiz-ui.js','../focus-ui.js','../family-ui.js','../coverage-ui.js','../coach-ui.js','../anki-export.js','../print-export.js'];
for(const file of files){test('security source has text-safe DOM pattern in '+file,async()=>{const c=await readFile(new URL(file,import.meta.url),'utf8');assert.ok(!c.includes('document.write('));assert.ok(!c.includes('eval('));})}
