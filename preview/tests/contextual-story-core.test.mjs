import assert from 'node:assert/strict';
import test from 'node:test';
import {STORY_MODES,buildStoryPrompt,cleanStoryText,validateStorySelection} from '../contextual-story-core.mjs';
const rows=[{id:1,c:'meet a deadline',m:'hoàn thành đúng hạn',t:'Work',e:'We need to meet a deadline.'},{id:2,c:'user experience',m:'trải nghiệm người dùng',t:'UI/UX',e:'User experience matters.'},{id:3,c:'take ownership',m:'chủ động chịu trách nhiệm',t:'Work',e:'I will take ownership.'}];
test('story selection requires 3 to 5 valid collocations',()=>{assert.equal(validateStorySelection(rows.slice(0,2)).ok,false);assert.equal(validateStorySelection([...rows,{id:4,c:'align on priorities'},{id:5,c:'work on a project'},{id:6,c:'extra'}]).ok,false);assert.equal(validateStorySelection(rows).ok,true)});
test('prompt preserves every exact collocation',()=>{const prompt=buildStoryPrompt(rows,STORY_MODES.paragraph);for(const row of rows)assert.ok(prompt.includes(JSON.stringify(row.c)));assert.ok(prompt.includes('Use EVERY supplied collocation exactly as written'));assert.ok(prompt.includes('120-160 words'))});
test('dialogue mode changes the requested format',()=>{assert.ok(buildStoryPrompt(rows,STORY_MODES.dialogue).includes('8-12 natural lines'))});
test('cleans model wrappers without changing story text',()=>{assert.equal(cleanStoryText('```text\\nHello team.\\n```'),'Hello team.');assert.equal(cleanStoryText('assistant: Hello team.'),'Hello team.')});
console.log('Contextual Story core tests: PASS');
