import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const app = fs.readFileSync('preview/app.html','utf8');
const loader = fs.readFileSync('preview/runtime-loader.js','utf8');
const css = fs.readFileSync('preview/collocation-figma-25-8.css','utf8');
const js = fs.readFileSync('preview/collocation-figma-25-8.js','utf8');

test('Collocation Figma 25:8 module is registered without replacing core data/auth flow', ()=>{
  assert.match(loader,/collocationFigma:\s*['"]\.\/collocation-figma-25-8\.js\?v=1['"]/);
  assert.match(loader,/stagedLoad\(\['collocationFigma'/);
  assert.match(js,/STYLE_HREF/);
  assert.doesNotMatch(js,/localStorage\.removeItem\(['"]english-collocations-preview-v2/);
  assert.doesNotMatch(js,/supabase|createClient|signInWithPassword|signUp/);
});

test('Collocation Figma CSS matches node 25:8 desktop shell geometry', ()=>{
  for(const token of [
    'grid-template-columns:minmax(0,1fr) 288px',
    'grid-template-rows:59px 33px 42px minmax(0,1fr)',
    'width:calc(100% - 240px)',
    'height:59px',
    'height:33px',
    'width:448px',
    'width:168px',
    'width:140px',
    'width:1708px',
    'width:288px',
    'grid-template-columns:repeat(2,minmax(0,1fr))'
  ]) assert.ok(css.includes(token), token);
});

test('Collocation Figma adapter is defensive and grammar-safe', ()=>{
  assert.match(js,/MutationObserver/);
  assert.match(js,/grammar-mode/);
  assert.match(js,/collocation-figma-25-8/);
  assert.match(app,/runtime-loader\.js\?v=1/);
});
