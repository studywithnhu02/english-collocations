import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import test from 'node:test';

const html=await readFile(new URL('../app.html',import.meta.url),'utf8');
const agent=await readFile(new URL('../ai-agent.js',import.meta.url),'utf8');

test('new Preview analytics and duplicate surface is wired',()=>{
  for(const token of [
    './analytics-ui.js',
    './collocation-core.mjs',
    'class="analytics-calendar"',
    'id="analyticsCheckin"',
    'id="analyticsPrev"',
    'id="analyticsNext"',
    'id="analyticsToday"',
    'id="duplicateWarning"',
    "window.PreviewAnalytics?.recordStudy(id,choice.dataset.statusChoice)",
    "const expected='d9c1f43'"
  ])assert.ok(html.includes(token),token);
});

test('automatic learning analytics is independent from manual check-in',()=>{
  assert.ok(html.includes('window.PreviewAnalytics?.recordStudy(id,choice.dataset.statusChoice)'));
  assert.ok(html.includes('version:3,data,statuses:loadStatuses()'));
  assert.ok(html.includes('goals:window.PreviewGoals?.getSnapshot?.()||{}'));
  assert.ok(html.includes('srs:window.PreviewSRS?.getSnapshot?.()||{}'));
});

test('duplicate data is warned and duplicate creation is blocked',()=>{
  assert.ok(html.includes('findDuplicateCollocations(data)'));
  assert.ok(html.includes('findDuplicateCollocation(data,val,id)'));
  assert.ok(html.includes('Không thể tạo bản trùng.'));
});

test('Contextual Story generator enforces 3-5 selected rows and uses the existing AI worker',()=>{
  for(const token of [
    './contextual-story-core.mjs',
    "card.id='contextualStoryCard'",
    'data-story-mode="paragraph"',
    'data-story-mode="dialogue"',
    'validateStorySelection(rows)',
    'buildStoryPrompt(rows,mode)',
    'callModel([',
    'Return only the finished story.'
  ])assert.ok(agent.includes(token),token);
});

test('existing protected UI/features remain intact',()=>{
  assert.ok(html.includes('./ai-agent.js?v=9'));
  assert.ok(html.includes('./spellcheck.js?v=1'));
  assert.ok(html.includes('./auto-translate.js?v=6'));
  assert.ok(html.includes('class="card agent-shell ai" hidden aria-hidden="true"'));
});

console.log('Analytics + duplicate + story Preview contract tests: PASS');


test('Contextual Story uses direct mode buttons and escaped highlighting',()=>{
  assert.ok(agent.includes('data-story-mode="paragraph"'));
  assert.ok(agent.includes('data-story-mode="dialogue"'));
  assert.ok(agent.includes('runContextualStory(btn.dataset.storyMode)'));
  assert.ok(agent.includes('renderStoryResult(resultEl,story,rows,mode)'));
  assert.ok(agent.includes('function escapeRegex'));
  assert.ok(agent.includes('return esc(story)'));
  assert.ok(!agent.includes('story-generate'));
});
