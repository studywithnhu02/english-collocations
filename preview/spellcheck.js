import {decorateHtml,languageForField} from './spellcheck-core.mjs';

const enabledKey='english-collocations-spellcheck-enabled';
const fields=['c','m','e','em'];
const pending=new Map();
const latestText=new Map();
let requestId=0;
let worker=null;
let enabled=localStorage.getItem(enabledKey)!=='0';

function getWorker(){return worker||(worker=new Worker('./spellcheck-worker.js?v=1',{type:'module'}));}
function getCell(field,id){return document.querySelector('#body tr[data-id="'+CSS.escape(String(id))+'"] .editable[data-field="'+field+'"]');}
function cellKey(field,id){return field+'::'+String(id)}

function styles(){
  if(document.getElementById('spellcheckStyles'))return;
  const s=document.createElement('style');s.id='spellcheckStyles';
  s.textContent=`
  .spell-error{background:rgba(255,104,109,.13);text-decoration:underline wavy #ff686d 1.5px;text-decoration-skip-ink:none;border-radius:3px;cursor:pointer;padding:0 1px;position:relative}
  .spell-search-hit{background:var(--yellow);color:#111827;border-radius:3px;padding:0 1px}
  .spell-error.spell-search-hit{background:linear-gradient(transparent 20%,var(--yellow) 20%,var(--yellow) 100%)}
  .spell-popover{position:fixed;z-index:100001;min-width:210px;max-width:300px;background:var(--card);border:1px solid var(--line);border-radius:12px;box-shadow:0 14px 38px #0007;padding:9px}
  .spell-popover-title{font-size:11px;color:var(--muted);margin-bottom:7px}
  .spell-suggestion{display:block;width:100%;text-align:left;background:var(--card2);border:1px solid var(--line);color:var(--text);padding:7px 9px;border-radius:8px;margin:5px 0;font-size:12px;cursor:pointer}
  .spell-suggestion:hover{border-color:var(--blue);background:var(--input)}
  .spell-dismiss{background:transparent;border:0;color:var(--muted);font-size:10px;padding:3px 0;cursor:pointer}
  .spell-no-suggestion{font-size:11px;color:var(--muted);padding:4px 0 6px}
  `;document.head.appendChild(s);
}

function ensureToggle(){
  const host=document.querySelector('.actions');if(!host)return;
  if(document.getElementById('spellcheckToggle'))return;
  const b=document.createElement('button');b.type='button';b.className='secondary';b.id='spellcheckToggle';
  b.addEventListener('click',()=>{enabled=!enabled;localStorage.setItem(enabledKey,enabled?'1':'0');updateToggle();if(enabled)scanAll();else clearAllHighlights();});
  host.insertBefore(b,host.querySelector('#clear')||null);updateToggle();
}
function updateToggle(){const b=document.getElementById('spellcheckToggle');if(b)b.textContent=enabled?'🪄 Chính tả: ON':'🪄 Chính tả: OFF';}
function clearAllHighlights(){closePopover();document.querySelectorAll('#body .spell-error,#body .spell-search-hit').forEach(el=>{const cell=el.closest('.editable');if(cell&&!cell.contains(document.activeElement))cell.textContent=cell.textContent;});}
function scheduleCell(cell,delay=550){
  if(!enabled||!cell)return;
  const tr=cell.closest('tr'),id=tr?.dataset.id,field=cell.dataset.field;if(id==null||!fields.includes(field))return;
  const key=cellKey(field,id);clearTimeout(pending.get(key));
  latestText.set(key,cell.textContent||'');
  pending.set(key,setTimeout(()=>checkCell(field,id),delay));
}
function checkCell(field,id){
  if(!enabled)return;
  const cell=getCell(field,id);if(!cell)return;
  const key=cellKey(field,id),text=cell.textContent||'';latestText.set(key,text);
  const idn=++requestId;pending.delete(key);pending.set(key,idn);
  getWorker().postMessage({id:idn,text,lang:languageForField(field)});
}
function bindCells(){
  document.querySelectorAll('#body .editable').forEach(cell=>{
    const field=cell.dataset.field;if(!fields.includes(field)||cell.dataset.spellBound==='1')return;
    cell.dataset.spellBound='1';
    cell.addEventListener('input',()=>scheduleCell(cell));
    cell.addEventListener('blur',()=>scheduleCell(cell,80));
  });
}
function scanAll(){
  if(!enabled)return;
  bindCells();
  document.querySelectorAll('#body .editable').forEach(cell=>scheduleCell(cell,220));
}
function positionPopover(pop,rect){
  document.body.appendChild(pop);
  const gap=8,w=pop.offsetWidth,h=pop.offsetHeight;
  let left=Math.min(Math.max(10,rect.left),window.innerWidth-w-10);
  let top=rect.bottom+gap;
  if(top+h>window.innerHeight-10)top=Math.max(10,rect.top-h-gap);
  pop.style.left=left+'px';pop.style.top=top+'px';
}
function closePopover(){document.getElementById('spellPopover')?.remove();}
function showPopover(target,error){
  closePopover();
  const pop=document.createElement('div');pop.id='spellPopover';pop.className='spell-popover';
  const title=document.createElement('div');title.className='spell-popover-title';title.textContent='🔎 Phát hiện lỗi chính tả · '+(languageForField(target.closest('.editable')?.dataset.field)==='en'?'EN':'VI');
  pop.appendChild(title);
  if(error.suggestions?.length){
    error.suggestions.forEach(suggestion=>{const b=document.createElement('button');b.className='spell-suggestion';b.textContent='✓ '+suggestion;b.addEventListener('click',()=>applySuggestion(target,error,suggestion));pop.appendChild(b);});
  }else{const d=document.createElement('div');d.className='spell-no-suggestion';d.textContent='Chưa tìm được gợi ý tự động.';pop.appendChild(d);}
  const close=document.createElement('button');close.className='spell-dismiss';close.textContent='Đóng';close.addEventListener('click',closePopover);pop.appendChild(close);
  positionPopover(pop,target.getBoundingClientRect());
}
function applySuggestion(span,error,suggestion){
  const cell=span.closest('.editable');if(!cell)return;
  span.textContent=suggestion;closePopover();
  cell.dispatchEvent(new Event('blur'));
  setTimeout(()=>scheduleCell(cell,80),120);
}
function handleWorkerMessage(e){
  const d=e.data||{},match=[...pending.entries()].find(([,value])=>value===d.id);
  if(!match)return;
  const [key]=match;pending.delete(key);
  const parts=key.split('::'),field=parts[0],id=parts.slice(1).join('::');
  const cell=getCell(field,id);if(!cell||!enabled)return;
  if(cell.contains(document.activeElement))return;
  if((cell.textContent||'')!==latestText.get(key))return;
  if(!d.ok){return;}
  const html=decorateHtml(cell.textContent||'',d.errors||'',document.getElementById('search')?.value||'');
  if(cell.innerHTML!==html)cell.innerHTML=html;
  cell.querySelectorAll('.spell-error').forEach(span=>{
    const idx=Number(span.dataset.spellIndex);const error=(d.errors||[])[idx];
    span.onclick=(ev)=>{ev.preventDefault();ev.stopPropagation();if(error)showPopover(span,error);};
  });
}
function observeRenders(){
  const body=document.getElementById('body');if(!body||body.dataset.spellObserver==='1')return;
  body.dataset.spellObserver='1';
  new MutationObserver(()=>{bindCells();if(enabled)setTimeout(scanAll,80);}).observe(body,{childList:true,subtree:true});
}
function boot(){
  styles();ensureToggle();worker=getWorker();worker.addEventListener('message',handleWorkerMessage);bindCells();observeRenders();
  setTimeout(scanAll,300);
  document.getElementById('search')?.addEventListener('input',()=>setTimeout(scanAll,60));
  window.addEventListener('resize',closePopover);window.addEventListener('scroll',closePopover,true);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
