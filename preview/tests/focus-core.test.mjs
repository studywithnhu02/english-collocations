import assert from 'node:assert/strict';import test from 'node:test';import {buildDeck,normalizeSwipe} from '../focus-core.mjs';
const rows=[{id:1,c:'a',s:'Chưa học',domains:['Business'],cefr:'B1'},{id:2,c:'b',s:'Đã học',domains:['Technology'],cefr:'C1'}];
test('focus deck supports status/domain/CEFR filters',()=>{assert.equal(buildDeck(rows,{status:'Chưa học'}).length,1);assert.equal(buildDeck(rows,{domain:'Technology'}).length,1);assert.equal(buildDeck(rows,{cefr:'C1'}).length,1)});
test('swipe classification has a dead zone',()=>{assert.equal(normalizeSwipe(80),'learned');assert.equal(normalizeSwipe(-80),'not-learned');assert.equal(normalizeSwipe(10),'')});
