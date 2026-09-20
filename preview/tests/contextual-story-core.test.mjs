import assert from 'node:assert/strict';
import test from 'node:test';
import {STORY_MODES,buildStoryPrompt,cleanStoryText,validateStorySelection} from '../contextual-story-core.mjs';

const rows=[
  {id:1,c:'meet a deadline',m:'hoàn thành đúng hạn',t:'Work'},
  {id:2,c:'user experience',m:'trải nghiệm người dùng',t:'UI/UX'},
  {id:3,c:'take ownership',m:'chủ động chịu trách nhiệm',t:'Work'}
];

test('story selection requires 3 to 5 valid collocations',()=>{
  assert.equal(validateStorySelection(rows.slice(0,2)).ok,false);
  assert.equal(validateStorySelection([...rows,{id:4,c:'align on priorities'},{id:5,c:'work on a project'},{id:6,c:'extra'}]).ok,false);
  assert.equal(validateStorySelection(rows).ok,true);
});

test('paragraph prompt is short, simple and preserves exact collocations',()=>{
  const prompt=buildStoryPrompt(rows,STORY_MODES.paragraph);
  for(const row of rows)assert.ok(prompt.includes(JSON.stringify(row.c)));
  assert.ok(prompt.includes('60-90 words'));
  assert.ok(prompt.includes('simple A2-B1 vocabulary'));
  assert.ok(prompt.includes('Use EVERY supplied collocation exactly as written'));
});

test('dialogue prompt is short and professional',()=>{
  const prompt=buildStoryPrompt(rows,STORY_MODES.dialogue);
  assert.ok(prompt.includes('6-8 natural lines'));
  assert.ok(prompt.includes('2 professionals'));
});

test('cleans model wrappers without changing story text',()=>{
  assert.equal(cleanStoryText('```text\\nHello team.\\n```'),'Hello team.');
  assert.equal(cleanStoryText('assistant: Hello team.'),'Hello team.');
});

console.log('Contextual Story core tests: PASS');