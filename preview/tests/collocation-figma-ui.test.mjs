import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const app = fs.readFileSync('preview/app.html','utf8');
const loader = fs.readFileSync('preview/runtime-loader.js','utf8');
const css = fs.readFileSync('preview/collocation-figma-25-8.css','utf8');
const js = fs.readFileSync('preview/collocation-figma-25-8.js','utf8');
const vocab = fs.readFileSync('preview/vocabulary-ui.js','utf8');

test('Collocation Figma 25:8 module is registered without replacing core data/auth flow', ()=>{
  assert.match(loader,/collocationFigma:\s*['"]\.\/collocation-figma-25-8\.js\?v=1['"]/);
  assert.match(loader,/load\('collocationFigma'\)/);
  assert.doesNotMatch(loader,/stagedLoad\(\['collocationFigma'/);
  assert.match(js,/STYLE_HREF/);
  assert.doesNotMatch(js,/localStorage\.removeItem\(['"]english-collocations-preview-v2/);
  assert.doesNotMatch(js,/supabase|createClient|signInWithPassword|signUp/);
});

test('Figma 25:8 desktop shell preserves measured frame geometry', ()=>{
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

test('Figma 25:8 copy and controls match the reference hierarchy', ()=>{
  assert.match(js,/ESSENTIAL COLLOCATIONS IN USE/);
  assert.match(js,/ELEMENTARY/);
  assert.match(js,/CEFR & IELTS/);
  assert.match(js,/Collocation Learning Hub/);
  assert.match(js,/Quản lý kho từ vựng/);
  assert.match(js,/Tất cả trạng thái/);\n  assert.match(js,/figma-sep/);\n  assert.match(js,/colloc-helper-logout/);\n  assert.match(js,/Thu gọn sidebar/);
  assert.match(js,/Tìm collocation, cấu trúc, nghĩa hoặc ví dụ/);
  assert.match(js,/leftNavSettings/);
  assert.match(js,/Phiên bản v2\.4/);
  assert.match(css,/box-title:after/);
  assert.match(css,/select-all-label/);
});

test('Right learning sidebar follows Figma vertical flow instead of overlap positioning', ()=>{
  assert.match(js,/checkin\.remove\(\)/);
  assert.match(js,/tz\.after\(checkin\)/);
  assert.match(js,/checkin\.after\(hdr\)/);
  assert.match(css,/sidebar \.analytics-card\{height:auto!important;min-height:0!important/);
  assert.match(css,/sidebar #analyticsCheckin\{position:static!important;display:flex!important/);
  assert.doesNotMatch(css,/analytics-checkin\{[^}]*position:absolute!important/);
  assert.match(css,/goal-row/);
  assert.match(css,/goal-target input/);
});

test('Advanced vocabulary controls are kept out of the pixel-critical toolbar but remain dockable', ()=>{
  assert.match(vocab,/preview-vocabulary-ready/);
  assert.match(js,/advancedDock/);
  assert.match(js,/collocAdvancedDock/);
  assert.match(css,/\.main>\.card:not\(\.brand\):not\(\.table-card\) \.vocab-filter/);
  assert.match(css,/\.main>\.card:not\(\.brand\):not\(\.table-card\) #vocabToolbar/);
  assert.match(css,/colloc-advanced-dock/);\n  assert.match(css,/\.suggest-popover\{/);\n  assert.match(css,/width:288px!important/);\n  assert.match(css,/box-shadow:0 20px 25px -5px rgba\(0,0,0,.1\)/);
});

test('Figma adapter is defensive and avoids recurring DOM work', ()=>{
  assert.doesNotMatch(js,/MutationObserver/);
  assert.doesNotMatch(js,/setTimeout\(run,200\)/);
  assert.doesNotMatch(js,/setTimeout\(run,700\)/);
  assert.doesNotMatch(js,/setTimeout\(run,1400\)/);
  assert.match(js,/function boot\(\)\{run\(\)\}/);
  assert.match(app,/runtime-loader\.js\?v=1/);
});
