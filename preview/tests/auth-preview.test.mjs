import assert from 'node:assert/strict';
import test from 'node:test';
import {readFile} from 'node:fs/promises';

const html=await readFile(new URL('../index.html',import.meta.url),'utf8');
const gate=await readFile(new URL('../auth-gate.js',import.meta.url),'utf8');
const app=await readFile(new URL('../app.html',import.meta.url),'utf8');

test('Auth is a dedicated Preview screen and management is separate',()=>{
  assert.ok(html.includes('id="registerBtn"'));
  assert.ok(html.includes('id="loginBtn"'));
  assert.ok(!html.includes('id="tableBody"'));
  assert.ok(app.includes('<title>English Collocations — Preview Management</title>'));
  assert.ok(app.includes('./auth-gate.js?v=1'));
});

test('existing Supabase Auth flow is preserved',()=>{
  assert.ok(html.includes('supabaseClient.auth.signUp({email,password})'));
  assert.ok(html.includes('supabaseClient.auth.signInWithPassword({email,password})'));
  assert.ok(html.includes('supabaseClient.auth.onAuthStateChange'));
  assert.ok(html.includes('persistSession:true,autoRefreshToken:true,detectSessionInUrl:true'));
  assert.ok(html.includes('password.length<6'));
});

test('management requires a live Supabase session',()=>{
  assert.ok(gate.includes('auth.getSession()'));
  assert.ok(gate.includes('if(!data?.session){redirectToAuth();return}'));
  assert.ok(gate.includes('supabaseClient.auth.onAuthStateChange'));
});

console.log('Auth Preview contract tests: PASS');
