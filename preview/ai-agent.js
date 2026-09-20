import {extractJson, normalizeBatchResult} from './ai-agent-core.js';
import {STORY_MODES,buildStoryPrompt,cleanStoryText,validateStorySelection,storyCoverage} from './contextual-story-core.mjs';
// Browser-local AI Agent v3 — batch inference, WebGPU-first, rule router, human-approved edits.
const MODEL_ID='onnx-community/Qwen2.5-0.5B-Instruct';
const STORAGE_KEY='english-collocations-preview-v2';
let worker=null,requestId=0,busy=false,pending=[];
const esc=s=>String(s??'').replace(/[&<>\"']/g,a=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[a]));
function readRows(){try{const v=JSON.parse(localStorage.getItem(STORAGE_KEY)||'[]');return Array.isArray(v)?v:[]}catch{return []}}
function writeRows(rows){localStorage.setItem(STORAGE_KEY,JSON.stringify(rows));window.dispatchEvent(new CustomEvent('preview-data-updated'));return rows}
function selectedIds(){return [...document.querySelectorAll('#body tr')].filter(tr=>tr.querySelector('.row-check')?.checked).map(tr=>String(tr.dataset.id))}
function selectedRows(){const ids=selectedIds(),rows=readRows();return ids.length?rows.filter(r=>ids.includes(String(r.id))):[]}
function ensureWorker(){return worker||(worker=new Worker('./ai-agent-worker.js?v=6',{type:'module'}))}
function callModel(messages,batch=false,options={}){return new Promise((resolve,reject)=>{const id=++requestId,w=ensureWorker();const fn=e=>{if(e.data?.id!==id)return;if(e.data?.type==='status'){status(e.data.message||'Đang xử lý…');return}w.removeEventListener('message',fn);e.data.ok?resolve(e.data.text):reject(new Error(e.data.error||'AI error'))};w.addEventListener('message',fn);w.postMessage({id,messages,batch,...options})})}
function warmupModel(){try{ensureWorker().postMessage({type:'warmup'})}catch{}}
function styles(){if(document.getElementById('agentStyles'))return;const s=document.createElement('style');s.id='agentStyles';s.textContent=`.agent-card{padding:0!important;overflow:hidden}.agent-head{padding:14px 15px;border-bottom:1px solid var(--line);display:flex;justify-content:space-between;align-items:center}.agent-title{font-weight:850;font-size:15px}.agent-sub,.agent-note,.agent-status{font-size:11px;color:var(--muted);margin-top:5px}.agent-actions{display:grid;grid-template-columns:1fr 1fr;gap:7px}.agent-actions button{font-size:11px;padding:8px}.agent-input{margin-top:10px}.agent-input textarea{width:100%;min-height:70px;resize:vertical}.agent-result{margin-top:9px;background:var(--card2);border:1px solid var(--line);border-radius:10px;padding:10px;font-size:12px;max-height:360px;overflow:auto}.agent-status.ok{color:var(--green)}.agent-status.err{color:var(--danger)}.agent-safe{font-size:10px;color:var(--green);margin-top:8px}.diff-item{border-top:1px solid var(--line);padding:9px 0}.diff-old{color:var(--danger);margin-top:5px}.diff-new{color:var(--green);margin-top:3px}.diff-actions{display:flex;gap:6px;margin-top:6px}.diff-actions button{font-size:10px;padding:5px 7px}.agent-apply{width:100%;margin-top:9px}.agent-apply[disabled]{opacity:.5}.agent-empty{color:var(--muted)}.contextual-story-card{padding:0!important;overflow:hidden}.story-head{padding:12px 14px;border-bottom:1px solid var(--line)}.story-title{font-weight:850;font-size:15px}.story-sub{font-size:10px;color:var(--muted);margin-top:3px}.story-mode{display:grid;grid-template-columns:1fr 1fr;gap:6px;padding:10px 12px 0}.story-mode-btn{padding:8px 8px;font-size:10px}.story-mode-btn.active{background:var(--blue);color:#fff;border-color:transparent}.story-mode-btn:disabled{opacity:.6}.story-selected{padding:8px 12px 0;color:var(--muted);font-size:10px}.story-status{padding:7px 12px 0;color:var(--muted);font-size:10px}.story-result{margin:8px 12px 12px;padding:9px;background:var(--card2);border:1px solid var(--line);border-radius:10px;font-size:11px;line-height:1.5;max-height:300px;overflow:auto}.story-result span{color:var(--muted)}.story-collocation{background:#f5c451;color:#111827;border-radius:4px;padding:1px 3px;font-weight:800}.story-legend{padding:7px 12px 0;color:var(--muted);font-size:9px}.agent-badge{font-size:10px;color:var(--green);margin-left:6px}.agent-progress{height:5px;background:var(--line);border-radius:99px;overflow:hidden;margin-top:8px}.agent-progress>i{display:block;height:100%;width:0;background:var(--green);transition:width .2s}`;document.head.appendChild(s)}
function status(t,k=''){const e=document.getElementById('agentStatus');if(e)e.className='agent-status '+k,e.textContent=t}
function progress(n=0){const e=document.querySelector('#agentProgress>i');if(e)e.style.width=Math.max(0,Math.min(100,n))+'%'}
function result(html){const e=document.getElementById('agentResult');if(e)e.innerHTML=html}
function escapeRegex(value){return String(value??'').replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}
function highlightStory(text,rows){
  const story=String(text??'').trim();
  const phrases=[...new Set((Array.isArray(rows)?rows:[]).map(row=>String(row?.c??'').trim()).filter(Boolean))].sort((a,b)=>b.length-a.length);
  if(!story||!phrases.length)return esc(story);
  const pattern=phrases.map(escapeRegex).join('|');
  if(!pattern)return esc(story);
  const re=new RegExp('(?:'+pattern+')','giu');
  let html='',last=0;
  for(const match of story.matchAll(re)){
    html+=esc(story.slice(last,match.index));
    html+='<mark class="story-collocation">'+esc(match[0])+'</mark>';
    last=match.index+match[0].length;
  }
  html+=esc(story.slice(last));
  return html||esc(story);
}
function fallbackStory(rows,mode){
  const phrases=(Array.isArray(rows)?rows:[]).map(row=>String(row?.c??'').trim()).filter(Boolean);
  if(mode===STORY_MODES.dialogue){
    return phrases.map((phrase,i)=>(i%2===0?'A: ':'B: ')+ 'Today we will focus on "'+phrase+'".').join('\n');
  }
  return 'At work, our team has a clear focus today. '+phrases.map(phrase=>'We will use "'+phrase+'" in the task.').join(' ');
}
function renderStoryResult(resultEl,text,rows,mode){
  resultEl.innerHTML='';
  if(mode===STORY_MODES.dialogue){
    const lines=String(text||'').split(/\r?\n/).map(line=>line.trim()).filter(Boolean);
    lines.forEach((line,index)=>{
      const match=line.match(/^(A|B)\s*:\s*(.*)$/i);
      const speaker=match?match[1].toUpperCase():(index%2?'B':'A');
      const body=match?match[2]:line;
      const row=document.createElement('div');row.className='story-line';
      row.innerHTML='<span class="story-speaker">'+speaker+'</span><span class="story-line-text">'+highlightStory(body,rows)+'</span>';
      resultEl.appendChild(row);
    });
    return;
  }
  const paragraph=document.createElement('p');paragraph.className='story-paragraph';paragraph.innerHTML=highlightStory(String(text||'').trim(),rows);resultEl.appendChild(paragraph);
}
function renderAgent(){styles();const old=document.querySelector('.ai');if(!old)return;old.classList.add('agent-card');old.innerHTML=`<div class="agent-head"><div><div class="agent-title">🤖 AI Agent <span class="agent-badge">Browser local</span></div><div class="agent-sub">Rule router → WebGPU → batch → diff → bạn duyệt</div></div></div><div class="agent-body"><div class="agent-actions"><button class="secondary" data-task="grammar">✓ Kiểm tra grammar</button><button class="secondary" data-task="spelling">✎ Kiểm tra chính tả</button><button class="secondary" data-task="natural">✨ Tự nhiên hơn</button><button class="secondary" data-task="translate">🇻🇳 Dịch</button><button class="secondary" data-task="cefr">📊 Phân tích CEFR</button><button class="secondary" data-task="examples">💡 Tạo ví dụ</button></div><div class="agent-input"><textarea id="agentPrompt" placeholder="Ví dụ: Kiểm tra grammar cho các dòng tôi đã chọn và đề xuất sửa..."></textarea><button id="agentAsk" style="width:100%;margin-top:7px">✨ Chạy Agent</button></div><div class="agent-status" id="agentStatus">Sẵn sàng · hãy chọn dòng rồi chạy tác vụ.</div><div class="agent-progress" id="agentProgress"><i></i></div><div class="agent-result" id="agentResult"><span class="agent-empty">🔒 Chưa có thay đổi nào. Agent không tự sửa dữ liệu.</span></div><div class="agent-safe">● Browser-local · WebGPU ưu tiên · không localhost · không API key · không Python</div><div class="agent-note">Lần đầu có thể tải model. Các lần sau browser dùng cache. Tác vụ đơn giản được xử lý bằng rule trước khi gọi AI.</div></div>`;old.querySelectorAll('[data-task]').forEach(b=>b.addEventListener('click',()=>runTask(b.dataset.task)));old.querySelector('#agentAsk').addEventListener('click',runFreeform)}
const taskPrompt={grammar:'Check grammar and spelling. If correction is needed, return correctedExample. Preserve meaning.',spelling:'Check spelling and obvious punctuation only. If correction is needed, return correctedExample. Preserve meaning.',natural:'Rewrite each example to sound natural and professional workplace English. Preserve meaning.',translate:'Translate each example sentence into natural Vietnamese. Put the translation in correctedExample.',cefr:'Estimate CEFR level. Put the level in explanationVi and leave correctedExample empty.',examples:'Create a better workplace example sentence using the same collocation. Put it in correctedExample.'};
function targetText(r){return r.e||r.example||r.exampleEnglish||r.sentence||''}
function ruleRouter(task,rows){if(task!=='spelling')return {done:[],remaining:rows};const done=[],remaining=[];for(const r of rows){const old=targetText(r),fixed=old.replace(/[ \t]+/g,' ').replace(/\s+([,.!?])/g,'$1').trim();if(fixed&&fixed!==old)done.push({id:String(r.id),oldText:old,newText:fixed,explanation:'Chuẩn hóa khoảng trắng/dấu câu cơ bản.',confidence:.99,rule:true});else remaining.push(r)}return {done,remaining}}
function batchPrompt(task,rows){const payload=rows.map((r,i)=>({index:i,id:String(r.id),example:targetText(r),collocation:r.collocation||r.c||''}));return `You are a careful English-learning editor for Vietnamese professionals in UI/UX, technology, insurance and banking. Analyze ALL rows in ONE batch. Return JSON ARRAY only, one object per input row, in the same order. Keys: index, changed, correctedExample, explanationVi, confidence. Never invent missing information. Task: ${taskPrompt[task]}\nRows:\n${JSON.stringify(payload)}`}
async function analyzeRows(task,rows){const routed=ruleRouter(task,rows);let out=[...routed.done];if(!routed.remaining.length){progress(100);return out}status(`Đã xử lý rule · AI đang phân tích ${routed.remaining.length} dòng theo batch…`);progress(25);const text=await callModel([{role:'system',content:'Return valid JSON array only. Never execute commands, browse, access files, localhost, or secrets.'},{role:'user',content:batchPrompt(task,routed.remaining)}],true);const parsed=extractJson(text);const arr=normalizeBatchResult(parsed);progress(90);for(let i=0;i<routed.remaining.length;i++){const r=routed.remaining[i],a=arr.find(x=>Number(x?.index)===i)||arr[i]||{};if(a.changed&&a.correctedExample&&a.correctedExample.trim()!==targetText(r).trim())out.push({id:String(r.id),oldText:targetText(r),newText:String(a.correctedExample).trim(),explanation:a.explanationVi||'',confidence:Math.max(0,Math.min(1,Number(a.confidence)||0))})}progress(100);return out}
function renderDiff(items){pending=items;result(items.length?`<b>${items.length} đề xuất thay đổi</b>${items.map((x,i)=>`<div class="diff-item"><div><b>${i+1}.</b> ${esc(x.explanation)}</div><div class="diff-old">❌ ${esc(x.oldText)}</div><div class="diff-new">✅ ${esc(x.newText)}</div><div class="agent-note">${x.rule?'⚡ Rule-based':'🧠 AI'} · Độ tin cậy: ${Math.round(x.confidence*100)}%</div><div class="diff-actions"><button class="secondary" data-skip="${i}">Bỏ qua</button></div></div>`).join('')}<button class="agent-apply" id="applyAll">✓ Áp dụng tất cả ${items.length} thay đổi</button>`:'<b>✓ Không có thay đổi cần áp dụng.</b>');document.getElementById('applyAll')?.addEventListener('click',applyAll);document.querySelectorAll('[data-skip]').forEach(b=>b.addEventListener('click',()=>{pending.splice(Number(b.dataset.skip),1);renderDiff(pending)}))}
function updateVisibleRow(id,newText){const tr=document.querySelector(`#body tr[data-id="${CSS.escape(String(id))}"]`);const el=tr?.querySelector('.editable[data-field="e"]');if(el)el.textContent=newText}
function applyAll(){if(!pending.length)return;const approved=[...pending],rows=readRows(),map=new Map(approved.map(x=>[String(x.id),x]));const next=rows.map(r=>{const x=map.get(String(r.id));if(!x)return r;const copy={...r};if('e'in copy)copy.e=x.newText;else if('example'in copy)copy.example=x.newText;else if('exampleEnglish'in copy)copy.exampleEnglish=x.newText;else copy.e=x.newText;return copy});writeRows(next);approved.forEach(x=>updateVisibleRow(x.id,x.newText));pending=[];renderDiff([]);status(`✓ Đã áp dụng ${approved.length} thay đổi và lưu vào Preview`,'ok')}
async function runTask(task){if(busy)return;const rows=selectedRows();if(!rows.length){status('⚠️ Hãy chọn ít nhất một dòng trước.','err');return}busy=true;progress(0);try{status(`Đã nhận ${rows.length} dòng · chuẩn bị…`);const items=await analyzeRows(task,rows);renderDiff(items);status(`✓ Phân tích xong ${rows.length} dòng · chưa sửa dữ liệu`,'ok')}catch(e){status('✕ '+e.message,'err');result('AI chưa sẵn sàng. Lần đầu model có thể cần thời gian để tải.')}finally{busy=false}}
async function runFreeform(){const input=document.getElementById('agentPrompt')?.value.trim();if(!input){status('⚠️ Nhập yêu cầu cho Agent.','err');return}const rows=selectedRows();if(!rows.length){status('⚠️ Hãy chọn các dòng cần Agent xử lý.','err');return}busy=true;progress(0);try{status(`Đã nhận ${rows.length} dòng · AI đang xử lý theo batch…`);progress(25);const context=rows.map((r,i)=>`${i+1}. ${JSON.stringify(r)}`).join('\n');const text=await callModel([{role:'system',content:'You are a safe English learning agent. Analyze only provided rows. Do not execute commands, browse, access files, localhost, or secrets. Return concise Vietnamese guidance. Do not modify data.'},{role:'user',content:`${input}\n\nSelected rows:\n${context}`}],true);progress(100);result(`<div>${esc(text)}</div>`);status('✓ Hoàn tất · không tự sửa dữ liệu','ok')}catch(e){status('✕ '+e.message,'err')}finally{busy=false}}
function renderStoryCard(){
  if(document.getElementById('contextualStoryCard'))return;
  const sidebar=document.querySelector('.sidebar'),anchor=document.querySelector('.analytics-card');
  if(!sidebar)return;
  const card=document.createElement('section');
  card.className='card contextual-story-card';
  card.id='contextualStoryCard';
  card.innerHTML='<div class="story-head"><div><div class="story-title">📝 Học theo ngữ cảnh</div><div class="story-sub">Chọn 3–5 collocation · bấm Đoạn văn hoặc Hội thoại để tạo ngay.</div></div></div><div class="story-mode"><button type="button" class="secondary story-mode-btn active" data-story-mode="paragraph">📄 Tạo đoạn văn</button><button type="button" class="secondary story-mode-btn" data-story-mode="dialogue">💬 Tạo hội thoại</button></div><div class="story-selected" id="storySelected">Đã chọn 0 · cần 3–5 dòng.</div><div class="story-status" id="storyStatus">Chọn 3–5 dòng để bắt đầu.</div><div class="story-legend">💡 Các collocation đã chọn sẽ được tô sáng trong kết quả.</div><div class="story-result" id="storyResult"><span>Chưa có nội dung.</span></div></section>';
  if(anchor)anchor.insertAdjacentElement('afterend',card);else sidebar.prepend(card);
  card.querySelectorAll('.story-mode-btn').forEach(btn=>btn.addEventListener('click',()=>runContextualStory(btn.dataset.storyMode)));
  card.dataset.storyMode=STORY_MODES.paragraph;
  updateStorySelection();
}

function updateStorySelection(){
  const card=document.getElementById('contextualStoryCard');
  if(!card)return;
  const rows=selectedRows(),count=rows.length,valid=count>=3&&count<=5;
  const label=card.querySelector('#storySelected');
  const buttons=card.querySelectorAll('.story-mode-btn');
  if(label)label.textContent=valid?'Đã chọn '+count+' collocation · bấm nút để tạo.': 'Đã chọn '+count+' · cần 3–5 dòng.';
  buttons.forEach(button=>button.disabled=!valid||busy);
}

async function runContextualStory(mode){
  const card=document.getElementById('contextualStoryCard');
  if(!card||busy)return;
  const rows=selectedRows(),validation=validateStorySelection(rows);
  if(!validation.ok){card.querySelector('#storyStatus').textContent='⚠️ '+validation.message;updateStorySelection();return}
  busy=true;updateStorySelection();progress(0);
  const statusEl=card.querySelector('#storyStatus'),resultEl=card.querySelector('#storyResult');
  try{
    statusEl.textContent='🧠 AI đang viết theo ngữ cảnh…';
    progress(20);
    const prompt=buildStoryPrompt(rows,mode);
    const text=await callModel([
      {role:'system',content:'You are a safe workplace English writing assistant. Use only the supplied collocations. Never browse, access files, localhost, commands, or secrets. Return only the finished story.'},
      {role:'user',content:prompt}
    ],true,{story:true});
    progress(75);
    let story=cleanStoryText(text);
    const missing=rows.filter(row=>!storyCoverage(story,[row]).length);
    if(missing.length){
      statusEl.textContent='↻ AI đang bổ sung collocation còn thiếu…';
      const repair=await callModel([
        {role:'system',content:'Return ONLY the corrected finished text. Preserve all supplied collocations exactly as written. Do not add explanations.'},
        {role:'user',content:prompt+'\\n\\nCRITICAL: The first draft omitted these exact collocations. Regenerate the whole output and include EVERY one of them exactly: '+JSON.stringify(missing.map(row=>row.c))}
      ],true,{story:true});
      const repaired=cleanStoryText(repair);
      if(storyCoverage(repaired,rows).length===rows.length)story=repaired;
    }
    if(storyCoverage(story,rows).length!==rows.length)story=fallbackStory(rows,mode);
    progress(100);
    renderStoryResult(resultEl,story,rows,mode);
    statusEl.textContent='✓ Đã tạo xong · '+rows.length+' collocation · dữ liệu bảng không bị sửa';
  }catch(error){
    statusEl.textContent='✕ '+(error?.message||String(error));
    resultEl.textContent='AI chưa sẵn sàng. Model local có thể cần tải lần đầu.';
  }finally{
    busy=false;updateStorySelection();
  }
}

function removeLegacyOllama(){document.querySelectorAll('.ollama-box,#testOllama,#stop,#chatStatus,.chat,.composer,.ai-head').forEach(e=>e.remove())}
function boot(){styles();removeLegacyOllama();renderAgent();renderStoryCard();document.addEventListener('change',e=>{if(e.target.matches('.row-check'))updateStorySelection()});setTimeout(warmupModel,900);}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
