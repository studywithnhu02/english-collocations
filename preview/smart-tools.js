import {fastSuggestionItems,synonymsFor,ruleRefinement,refinementPrompt,normalizeSmartInput} from './smart-tools-core.mjs';
const DATA_KEY='english-collocations-preview-v2';
const MODEL='onnx-community/Qwen2.5-0.5B-Instruct';
let timer=0,worker=null,requestId=0,activeRequest=0,busy=false;
let suggestCell=null,suggestValues=[],suggestIndex=0;
const esc=value=>String(value??'').replace(/[&<>\"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[c]));
function readRows(){try{const v=JSON.parse(localStorage.getItem(DATA_KEY)||'[]');return Array.isArray(v)?v:[]}catch{return []}}
function selectedRows(){const ids=[...document.querySelectorAll('#body .row-check:checked')].map(el=>String(el.closest('tr')?.dataset.id||''));const rows=readRows();return ids.length?rows.filter(r=>ids.includes(String(r.id))):[]}
function getWorker(){if(!worker)worker=new Worker('./ai-agent-worker.js?v=8',{type:'module'});return worker}
function aiJson(messages){return new Promise((resolve,reject)=>{const id=++requestId,w=getWorker();const fn=e=>{if(e.data?.id!==id)return;if(e.data?.type==='status')return;w.removeEventListener('message',fn);e.data.ok?resolve(e.data.text):reject(new Error(e.data.error||'AI unavailable'))};w.addEventListener('message',fn);w.postMessage({id,messages,batch:true})})}
function parseArray(text){try{const cleaned=String(text||'').replace(/^```(?:json|text)?\s*/i,'').replace(/\s*```$/,'').trim();const match=cleaned.match(/\[[\s\S]*\]/);const value=JSON.parse(match?match[0]:cleaned);return Array.isArray(value)?value:[]}catch{return []}}
function styles(){if(document.getElementById('smartStyles'))return;const s=document.createElement('style');s.id='smartStyles';s.textContent='.suggest-popover{position:fixed;z-index:100003;width:min(360px,calc(100vw - 20px));background:var(--card);border:1px solid var(--line);border-radius:12px;box-shadow:0 18px 50px #0008;padding:8px}.suggest-head{font-size:10px;color:var(--muted);padding:2px 3px 6px}.suggest-list{display:grid;gap:4px;max-height:220px;overflow:auto}.suggestion-btn{width:100%;display:grid;grid-template-columns:minmax(0,1fr) auto;gap:10px;align-items:center;text-align:left;background:var(--card2);border:1px solid var(--line);color:var(--text);border-radius:8px;padding:8px;font-size:10px;cursor:pointer}.suggestion-btn:hover,.suggestion-btn.active{border-color:var(--blue);background:var(--input)}.suggestion-btn.active{box-shadow:inset 3px 0 0 var(--blue)}.suggestion-copy{min-width:0}.suggestion-phrase{font-weight:850;line-height:1.35}.suggestion-meaning{color:var(--muted);font-size:9px;line-height:1.35;margin-top:2px}.suggestion-arrow{color:var(--muted);font-size:12px}.suggest-note{font-size:9px;color:var(--muted);padding:6px 3px 1px}.refine-card{padding:12px}.refine-controls{display:flex;gap:6px;margin-top:9px}.refine-run{flex:1}.refine-status{font-size:10px;color:var(--muted);margin-top:8px}.refine-list{display:grid;gap:8px;margin-top:9px}.refine-item{border:1px solid var(--line);background:var(--card2);border-radius:11px;padding:9px}.refine-top{display:flex;align-items:flex-start;justify-content:space-between;gap:8px}.refine-phrase{font-size:11px;font-weight:900;line-height:1.35}.refine-score{min-width:46px;text-align:center;padding:3px 6px;border-radius:999px;background:#183966;color:#8fb8ff;font-size:9px;font-weight:900}.refine-tags{display:flex;flex-wrap:wrap;gap:5px;margin-top:6px}.refine-tag{font-size:8px;color:var(--muted);border:1px solid var(--line);border-radius:999px;padding:3px 6px}.refine-warning{font-size:10px;line-height:1.45;margin-top:7px}.refine-better{font-size:10px;color:var(--green);margin-top:7px}.refine-actions{display:flex;justify-content:flex-end;margin-top:7px}.refine-actions button{padding:5px 7px;font-size:9px}';document.head.appendChild(s)}
function closeSuggest(){document.getElementById('suggestPopover')?.remove();suggestCell=null;suggestValues=[];suggestIndex=0}
function setSuggestPosition(pop,cell){const r=cell.getBoundingClientRect(),w=pop.offsetWidth,h=pop.offsetHeight;pop.style.left=Math.min(Math.max(8,r.left),Math.max(8,innerWidth-w-8))+'px';const below=r.bottom+5,above=r.top-h-5;const top=(below+h<=innerHeight-8?below:Math.max(8,above));pop.style.top=Math.max(8,Math.min(top,innerHeight-h-8))+'px'}
function positionSuggest(pop,cell){if(!pop||!cell||!document.contains(cell))return closeSuggest();document.body.appendChild(pop);setSuggestPosition(pop,cell)}
function repositionSuggest(){const pop=document.getElementById('suggestPopover');if(!pop||!suggestCell)return;if(!document.contains(suggestCell))return closeSuggest();setSuggestPosition(pop,suggestCell)}
function setActiveSuggestion(index){
  if(!suggestValues.length)return;
  suggestIndex=(index+suggestValues.length)%suggestValues.length;
  const buttons=[...document.querySelectorAll('#suggestPopover .suggestion-btn')];
  buttons.forEach((button,i)=>{const active=i===suggestIndex;button.classList.toggle('active',active);button.setAttribute('aria-selected',String(active))});
  buttons[suggestIndex]?.scrollIntoView({block:'nearest'});
}
function fill(cell,value){if(!cell||!document.contains(cell))return;cell.textContent=value;cell.dispatchEvent(new Event('input',{bubbles:true}));cell.focus();cell.blur();closeSuggest()}
function selectActiveSuggestion(){if(suggestCell&&suggestValues[suggestIndex])fill(suggestCell,suggestValues[suggestIndex])}
function showSuggestions(cell,items,label){
  const clean=[...new Map(items.map(item=>{
    const phrase=typeof item==='string'?String(item).trim():String(item?.c??item?.phrase??'').trim();
    const meaning=typeof item==='string'?'':String(item?.v??item?.meaningVi??'').trim();
    return [phrase.toLowerCase(),{c:phrase,v:meaning}];
  })).values()].filter(item=>item.c).slice(0,5);
  if(!clean.length){closeSuggest();return}
  closeSuggest();suggestCell=cell;suggestValues=clean.map(item=>item.c);suggestIndex=0;
  const pop=document.createElement('div');pop.id='suggestPopover';pop.className='suggest-popover';pop.setAttribute('role','listbox');pop.setAttribute('aria-label',label||'Gợi ý collocation');
  const head=document.createElement('div');head.className='suggest-head';head.textContent=label||'💡 Gợi ý collocation';pop.appendChild(head);
  const list=document.createElement('div');list.className='suggest-list';
  clean.forEach((item,index)=>{
    const b=document.createElement('button');b.type='button';b.className='suggestion-btn';b.setAttribute('role','option');b.setAttribute('aria-selected',String(index===0));
    b.innerHTML='<span class="suggestion-copy"><span class="suggestion-phrase">'+esc(item.c)+'</span>'+ (item.v?'<span class="suggestion-meaning">'+esc(item.v)+'</span>':'<span class="suggestion-meaning">AI đang tạo nghĩa…</span>') +'</span><span class="suggestion-arrow">→</span>';
    b.addEventListener('mousedown',e=>e.preventDefault());b.addEventListener('click',()=>fill(cell,item.c));list.appendChild(b);
  });
  pop.appendChild(list);
  const syn=synonymsFor(cell.textContent||'');
  if(syn.length){const sh=document.createElement('div');sh.className='suggest-head';sh.textContent='🔁 Từ gần nghĩa';pop.appendChild(sh);const sv=document.createElement('div');sv.className='suggest-note';sv.textContent=syn.join(' · ');pop.appendChild(sv)}
  const note=document.createElement('div');note.className='suggest-note';note.textContent='↑ ↓ chọn · Enter điền · Esc đóng';pop.appendChild(note);
  positionSuggest(pop,cell);setActiveSuggestion(0);
}
function sanitizeAiSuggestions(text,value){
  const q=normalizeSmartInput(value),head=q.split(/\s+/)[0]||'';
  const values=parseArray(text).map(x=>typeof x==='string'?{c:x.trim(),v:''}:{c:String(x?.collocation??x?.phrase??'').trim(),v:String(x?.meaningVi??x?.meaning??'').trim()}).filter(x=>x.c);
  const unique=[...new Map(values.map(v=>[v.c.toLowerCase(),v])).values()];
  return unique.filter(item=>{
    const low=item.c.toLowerCase();
    return low!==q&&low.startsWith(head)&&low.length<=90&&item.v.length<=240;
  }).slice(0,5);
}
function handleInput(e){
  const cell=e.target.closest?.('.editable[data-field="c"]');if(!cell)return;
  clearTimeout(timer);activeRequest++;closeSuggest();
  const token=activeRequest,value=String(cell.textContent||'').trim();
  if(value.length<2)return;
  const fast=fastSuggestions(value);
  if(fast.length){showSuggestions(cell,fast,'⚡ Gợi ý nhanh');return}
  if(value.split(/\s+/).length!==1||value.length<3)return;
  timer=setTimeout(async()=>{
    try{
      const raw=await aiJson([
        {role:'system',content:'Return only a JSON array of 3-5 common English collocations that begin with the supplied input. For every item return exactly: {"collocation":"...","meaningVi":"..."}. Use natural workplace English. The Vietnamese meaning must be concise and accurate. No explanations, no numbering.'},
        {role:'user',content:value}
      ]);
      if(token!==activeRequest||document.activeElement!==cell||!document.contains(cell))return;
      const values=sanitizeAiSuggestions(raw,value);
      if(values.length)showSuggestions(cell,values,'🤖 Gợi ý AI');
    }catch{}
  },650);
}
function handleFocus(e){
  const cell=e.target.closest?.('.editable[data-field="c"]');
  activeRequest++;clearTimeout(timer);closeSuggest();
  if(!cell)return;
  const value=String(cell.textContent||'').trim();
  const fast=fastSuggestionItems(value);
  if(fast.length)showSuggestions(cell,fast,'📚 Gợi ý trong thư viện');
}
function handleKeydown(e){
  const cell=e.target.closest?.('.editable[data-field="c"]');
  if(!cell||document.activeElement!==cell||!document.getElementById('suggestPopover'))return;
  if(e.key==='ArrowDown'){e.preventDefault();e.stopPropagation();setActiveSuggestion(suggestIndex+1)}
  else if(e.key==='ArrowUp'){e.preventDefault();e.stopPropagation();setActiveSuggestion(suggestIndex-1)}
  else if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();e.stopPropagation();selectActiveSuggestion()}
  else if(e.key==='Escape'){e.preventDefault();e.stopPropagation();activeRequest++;closeSuggest()}
}
function refinementCard(){if(document.getElementById('refinementCard'))return document.getElementById('refinementCard');const anchor=document.getElementById('srsCard')||document.getElementById('goalsCard')||document.querySelector('.analytics-card');const card=document.createElement('section');card.id='refinementCard';card.className='card refine-card';card.innerHTML='<div class="feature-head"><div><div class="feature-title">✨ Smart Refinement</div><div class="feature-sub">Naturalness, cảnh báo nhầm lẫn và Register/Tone.</div></div></div><div class="refine-controls"><button class="secondary refine-run" id="refineRun" type="button">🔍 Phân tích dòng đã chọn</button></div><div class="refine-status" id="refineStatus">Chọn 1–8 dòng để phân tích.</div><div class="refine-list" id="refineList"></div>';if(anchor)anchor.insertAdjacentElement('afterend',card);else document.querySelector('.sidebar')?.appendChild(card);card.querySelector('#refineRun').addEventListener('click',runRefinement);return card}
function renderRefinement(items){const card=refinementCard(),list=card.querySelector('#refineList');list.innerHTML='';if(!items.length){list.innerHTML='<div class="refine-status">Chưa có kết quả.</div>';return}for(const item of items){const el=document.createElement('div');el.className='refine-item';const better=item.better||'';el.innerHTML='<div class="refine-top"><div class="refine-phrase">'+esc(item.phrase)+'</div><div class="refine-score">'+(Number.isFinite(item.score)?item.score+'/100':'—')+'</div></div><div class="refine-tags"><span class="refine-tag">Register · '+esc(item.register||'Chưa đánh giá')+'</span><span class="refine-tag">Tone · '+esc(item.tone||'Chưa đánh giá')+'</span></div>'+(item.warning?'<div class="refine-warning">⚠️ '+esc(item.warning)+'</div>':'')+(better?'<div class="refine-better">→ Gợi ý: <b>'+esc(better)+'</b></div><div class="refine-actions"><button type="button" class="secondary" data-refine-id="'+esc(item.id)+'" data-refine-value="'+esc(better.split('/')[0].trim())+'">Fill gợi ý</button></div>':'');list.appendChild(el)}list.querySelectorAll('[data-refine-id]').forEach(btn=>btn.addEventListener('click',()=>{const cell=document.querySelector('#body tr[data-id="'+CSS.escape(btn.dataset.refineId)+'"] .editable[data-field="c"]');if(cell)fill(cell,btn.dataset.refineValue)}))}
async function runRefinement(){if(busy)return;const rows=selectedRows(),card=refinementCard(),status=card.querySelector('#refineStatus');if(!rows.length){status.textContent='⚠️ Hãy chọn ít nhất một dòng.';return}if(rows.length>8){status.textContent='⚠️ Tối đa 8 dòng mỗi lần.';return}busy=true;card.querySelector('#refineRun').disabled=true;status.textContent='🧠 AI đang phân tích theo batch…';try{const raw=await aiJson([{role:'system',content:'You are a careful English collocation editor. Return only a JSON array, one object per input row. Fields: index, naturalnessScore (0-100), betterCollocation, confusionWarning, register, tone. Register: Formal, Informal, Academic/IELTS. Tone: neutral, professional, friendly, casual. Score the exact phrase as written. Keep all explanations concise.'},{role:'user',content:refinementPrompt(rows)}]);const arr=parseArray(raw);const merged=rows.map((row,i)=>{const a=arr.find(x=>Number(x?.index)===i+1)||{},rule=ruleRefinement(row.c);return{id:String(row.id),phrase:String(row.c||''),score:Number.isFinite(Number(a.naturalnessScore))?Math.max(0,Math.min(100,Math.round(Number(a.naturalnessScore)))):null,better:rule?.better||String(a.betterCollocation||'').trim(),warning:rule?.message||String(a.confusionWarning||'').trim(),register:String(a.register||'Chưa đánh giá'),tone:String(a.tone||'Chưa đánh giá')}});renderRefinement(merged);status.textContent='✓ Phân tích xong · chưa sửa dữ liệu'}catch(error){renderRefinement(rows.map(row=>{const rule=ruleRefinement(row.c);return{id:String(row.id),phrase:String(row.c||''),score:null,better:rule?.better||'',warning:rule?.message||'Chưa có cảnh báo rule-based cho cụm này.',register:'Chưa đánh giá',tone:'Chưa đánh giá'}}));status.textContent='⚠️ AI chưa sẵn sàng.'}finally{busy=false;card.querySelector('#refineRun').disabled=false}}
styles();refinementCard();document.addEventListener('input',handleInput);document.addEventListener('focusin',handleFocus);document.addEventListener('keydown',handleKeydown);document.addEventListener('click',e=>{if(!e.target.closest?.('#suggestPopover')&&!e.target.closest?.('.editable[data-field="c"]')){activeRequest++;closeSuggest()}});window.addEventListener('resize',repositionSuggest);window.addEventListener('scroll',repositionSuggest,true);
window.PreviewSmart={runRefinement,refresh:()=>renderRefinement([])};