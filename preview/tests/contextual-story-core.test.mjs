import assert from 'node:assert/strict';
import test from 'node:test';
import {STORY_MODES,buildStoryPrompt,cleanStoryText,validateStorySelection,storyCoverage} from '../contextual-story-core.mjs';

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
  assert.ok(prompt.includes('54–72 words'));
  assert.ok(prompt.includes('simple A2-B1 vocabulary'));
  assert.ok(prompt.includes('Use EVERY supplied collocation exactly as written'));
});

test('story length scales directly with selected collocation count',()=>{
  const four=[...rows,{id:4,c:'pay attention to'}];
  const prompt3=buildStoryPrompt(rows,STORY_MODES.paragraph);
  const prompt4=buildStoryPrompt(four,STORY_MODES.paragraph);
  assert.ok(prompt3.includes('54–72 words'));
  assert.ok(prompt4.includes('72–96 words'));
});

test('dialogue prompt is short and professional',()=>{
  const prompt=buildStoryPrompt(rows,STORY_MODES.dialogue);
  assert.ok(prompt.includes('EXACTLY 6 short workplace dialogue lines'));
  assert.ok(prompt.includes('Use only two speakers'));assert.ok(prompt.includes('A and B'));
});

test('coverage helper detects exactly which collocations are present',()=>{
  assert.deepEqual(storyCoverage('We will meet a deadline and take ownership.',rows),['meet a deadline','take ownership']);
});

test('cleans model wrappers without changing story text',()=>{
  assert.equal(cleanStoryText('```text\nHello team.\n```'),'Hello team.');
  assert.equal(cleanStoryText('assistant: Hello team.'),'Hello team.');
});

console.log('Contextual Story core tests: PASS');

test('dialogue prompt always uses only A and B',()=>{
  const prompt=buildStoryPrompt([{c:'make a decision'},{c:'design a user flow'},{c:'process a claim'}],STORY_MODES.dialogue);
  assert.match(prompt,/A and B/);
  assert.match(prompt,/Every line must start with exactly “A:” or “B:”/);
  assert.match(prompt,/Never use names, roles/);
});

test('paragraph prompt allows bridging sentences for unrelated collocations',()=>{
  const prompt=buildStoryPrompt([{c:'design a user flow',t:'UI/UX'},{c:'process a claim',t:'Insurance'},{c:'make a bank transfer',t:'Banking'}],STORY_MODES.paragraph);
  assert.match(prompt,/2–3 short bridging sentences/);
});
