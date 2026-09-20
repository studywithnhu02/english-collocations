import assert from 'node:assert/strict';import test from 'node:test';import {readFile} from 'node:fs/promises';
const app=await readFile(new URL('../app.html',import.meta.url),'utf8');
test('new vocabulary modules are wired and table API exists',()=>{for(const token of ['normalizeVocabularyRow','window.PreviewTable=','version:3','PreviewIngestion?.autoFill?.(id,val)','a72e9d5','vocabulary-ui.js?v=3','smart-ingestion.js?v=1','quiz-ui.js?v=1','focus-ui.js?v=1','family-ui.js?v=1','coverage-ui.js?v=1','coach-ui.js?v=1','anki-export.js?v=1','print-export.js?v=1'])assert.ok(app.includes(token),token)});
test('sticky header and recall UI contracts are present',()=>{assert.ok(app.includes('<th>Collocation</th>'));assert.ok(app.includes('<th>Nghĩa Collocation</th>') )});
