import {GRAMMAR_TOPICS,CHAPTERS,APPENDICES,loadGrammarProgress,toggleGrammarDone,getGrammarStats} from './grammar-core.mjs';

const state={query:'',chapter:'all',status:'all',selected:1,progress:loadGrammarProgress(),quiz:null,quizIndex:0};
const $=id=>document.getElementById(id);
const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const topic=unit=>GRAMMAR_TOPICS.find(x=>x.unit===unit);
const visible=()=>{const q=state.query.trim().toLocaleLowerCase('vi');return GRAMMAR_TOPICS.filter(x=>(state.chapter==='all'||x.chapterId===state.chapter)&&(state.status==='all'||(state.status==='done'&&state.progress[x.id]?.done)||(state.status==='todo'&&!state.progress[x.id]?.done))&&(!q||[x.unit,x.title,x.chapter,x.formula,x.memory,x.example].join(' ').toLocaleLowerCase('vi').includes(q)))};
const chapterProgress=id=>{const a=GRAMMAR_TOPICS.filter(x=>x.chapterId===id),d=a.filter(x=>state.progress[x.id]?.done).length;return{done:d,total:a.length,percent:Math.round(d/a.length*100)}};

function render(){
 const root=$('grammarScreen');if(!root)return;
 const s=getGrammarStats(state.progress),rows=visible();
 if(!rows.some(x=>x.unit===state.selected)&&rows[0])state.selected=rows[0].unit;
 root.innerHTML=
 '<div class="grammar2-head"><div><div class="grammar2-eyebrow">ESSENTIAL GRAMMAR IN USE · ELEMENTARY</div><h1>📘 Grammar Learning Hub</h1><p>114 unit được lấy theo đúng thứ tự mục lục của tài liệu, sau đó cô đọng thành công thức 1 dòng + mẹo nhớ + ví dụ.</p></div><div class="grammar2-head-actions"><button type="button" class="secondary" id="grammarBack">← Collocation</button><button type="button" id="grammarExercise">📝 Bài tập</button><button type="button" class="secondary" id="grammarQuiz">🎯 Ôn nhanh</button></div></div>'+
 '<div class="grammar2-note"><b>3 bước học:</b> ① đọc công thức → ② nói lại ví dụ → ③ tự đặt 3 câu của bạn. Phần “Mẹo nhớ” là bản tóm tắt dễ học, không phải nguyên văn tài liệu.</div>'+
 '<div class="grammar2-stats"><div><span>Units</span><b>'+s.total+'</b><small>theo tài liệu</small></div><div><span>Đã nắm</span><b>'+s.done+'</b><small>đã đánh dấu</small></div><div><span>Còn lại</span><b>'+s.remaining+'</b><small>chưa hoàn thành</small></div><div class="grammar2-progress"><div><span>Progress</span><b>'+s.percent+'%</b></div><i><em style="width:'+s.percent+'%"></em></i></div></div>'+
 '<div class="grammar2-chapters">'+CHAPTERS.map(c=>{const p=chapterProgress(c.id);return '<button type="button" class="grammar2-chapter '+(state.chapter===c.id?'active':'')+'" data-chapter="'+c.id+'"><span>'+c.range+'</span><strong>'+esc(c.title)+'</strong><small>'+p.done+'/'+p.total+' · '+p.percent+'%</small><i><em style="width:'+p.percent+'%"></em></i></button>'}).join('')+'</div>'+
 '<div class="grammar2-toolbar"><input id="grammarSearch2" value="'+esc(state.query)+'" placeholder="🔎 Tìm unit, chủ đề, công thức hoặc từ khóa..."><select id="grammarChapter2"><option value="all">Tất cả phần</option>'+CHAPTERS.map(c=>'<option value="'+c.id+'" '+(state.chapter===c.id?'selected':'')+'>'+esc(c.range)+' · '+esc(c.title)+'</option>').join('')+'</select><select id="grammarStatus2"><option value="all">Tất cả trạng thái</option><option value="todo" '+(state.status==='todo'?'selected':'')+'>Chưa học</option><option value="done" '+(state.status==='done'?'selected':'')+'>Đã nắm</option></select></div>'+
 '<div class="grammar2-body"><section class="grammar2-list"><div class="grammar2-list-head"><b>'+rows.length+'</b> / '+GRAMMAR_TOPICS.length+' units</div><div class="grammar2-unit-list">'+rows.map(x=>{const done=!!state.progress[x.id]?.done;return '<button type="button" class="grammar2-unit '+(state.selected===x.unit?'selected':'')+'" data-unit="'+x.unit+'"><span class="grammar2-unit-no">'+String(x.unit).padStart(3,'0')+'</span><div><strong>'+esc(x.title)+'</strong><small>'+esc(x.chapter)+'</small></div><span class="grammar2-unit-check">'+(done?'✓':'')+'</span></button>'}).join('')+(rows.length?'':'<div class="grammar2-empty">Không tìm thấy unit phù hợp.</div>')+'</div></section><section class="grammar2-detail" id="grammarDetail"></section></div>'+
 '<div class="grammar2-reference"><div class="grammar2-reference-head"><div><div class="grammar2-eyebrow">REFERENCE</div><h2>Phần phụ lục trong tài liệu</h2></div><span>'+APPENDICES.length+' phần</span></div><div class="grammar2-reference-grid">'+APPENDICES.map(x=>'<div><strong>'+esc(x.title)+'</strong><p>'+esc(x.summary)+'</p></div>').join('')+'</div></div>';
 renderDetail();
 $('grammarSearch2').addEventListener('input',e=>{state.query=e.target.value;render()});
 $('grammarChapter2').addEventListener('change',e=>{state.chapter=e.target.value;render()});
 $('grammarStatus2').addEventListener('change',e=>{state.status=e.target.value;render()});
 $('grammarBack').addEventListener('click',()=>window.PreviewGrammar?.show?.(false));
 $('grammarExercise').addEventListener('click',()=>window.PreviewGrammarExercises?.open?.(state.selected));
 $('grammarQuiz').addEventListener('click',openQuiz);
 document.querySelectorAll('[data-chapter]').forEach(btn=>btn.addEventListener('click',()=>{state.chapter=btn.dataset.chapter;state.status='all';state.selected=CHAPTERS.find(c=>c.id===btn.dataset.chapter)?.start||state.selected;render()}));
 document.querySelectorAll('[data-unit]').forEach(btn=>btn.addEventListener('click',()=>{state.selected=Number(btn.dataset.unit);renderDetail();document.querySelectorAll('[data-unit]').forEach(x=>x.classList.toggle('selected',x===btn));}));
}

function renderDetail(){
 const box=$('grammarDetail');if(!box)return;const t=topic(state.selected);
 if(!t){box.innerHTML='<div class="grammar2-detail-empty">Chọn một unit.</div>';return}
 const done=!!state.progress[t.id]?.done,idx=GRAMMAR_TOPICS.findIndex(x=>x.unit===t.unit),prev=GRAMMAR_TOPICS[idx-1],next=GRAMMAR_TOPICS[idx+1];
 box.innerHTML='<div class="grammar2-detail-card"><div class="grammar2-detail-top"><div><span class="grammar2-unit-badge">UNIT '+t.unit+'</span><span class="grammar2-part">'+esc(t.range)+'</span><h2>'+esc(t.title)+'</h2><p>'+esc(t.chapter)+'</p></div><button type="button" class="'+(done?'secondary':'')+'" id="grammarDone2">'+(done?'✓ Đã nắm':'Đánh dấu đã nắm')+'</button></div>'+
 '<div class="grammar2-focus"><span>CÔNG THỨC 1 DÒNG</span><strong>'+esc(t.formula)+'</strong><small>'+esc(t.memory)+'</small></div>'+
 '<div class="grammar2-example"><span>💬 Ví dụ ngắn</span><p>'+esc(t.example||'Tự đặt 3 câu theo công thức trên.')+'</p></div><div class="grammar2-exercise-cta"><div><b>📝 Luyện tập</b><small>5 câu cho riêng Unit này · chấm điểm + giải thích từng câu.</small></div><button type="button" class="secondary" id="grammarExerciseFromDetail">Làm bài</button></div>'+
 '<div class="grammar2-learn"><div><b>Học thế nào?</b><ol><li>Đọc “Công thức 1 dòng”.</li><li>Nói ví dụ thành tiếng 2 lần.</li><li>Tự đặt 3 câu liên quan công việc/đời sống.</li></ol></div><div><b>Ghi nhớ</b><p>'+esc(t.memory)+'</p></div></div>'+
 '<div class="grammar2-nav"><button type="button" '+(prev?'':'disabled')+' id="grammarPrev">← Unit '+(prev?.unit||'')+'</button><span>'+t.unit+' / 114</span><button type="button" '+(next?'':'disabled')+' id="grammarNext">Unit '+(next?.unit||'')+' →</button></div></div>';
 box.querySelector('#grammarDone2').addEventListener('click',()=>{state.progress=toggleGrammarDone(state.progress,t.id);render()});
 box.querySelector('#grammarExerciseFromDetail')?.addEventListener('click',()=>window.PreviewGrammarExercises?.open?.(t.unit));
 box.querySelector('#grammarPrev').addEventListener('click',()=>{if(prev){state.selected=prev.unit;render()}});
 box.querySelector('#grammarNext').addEventListener('click',()=>{if(next){state.selected=next.unit;render()}});
}

function openQuiz(){
 const source=(GRAMMAR_TOPICS.filter(x=>!state.progress[x.id]?.done).slice(0,5));
 const pool=source.length?source:GRAMMAR_TOPICS.slice(0,5);
 state.quiz=pool.map((x,i)=>{const opts=[x.formula,GRAMMAR_TOPICS[(x.unit+7)%GRAMMAR_TOPICS.length].formula,GRAMMAR_TOPICS[(x.unit+23)%GRAMMAR_TOPICS.length].formula];return{unit:x.unit,title:x.title,correct:x.formula,options:[...new Set(opts)].slice(0,3),index:i}});
 state.quizIndex=0;renderQuiz();
}
function renderQuiz(){
 $('grammarQuizModal')?.remove();const q=state.quiz?.[state.quizIndex];if(!q)return;
 const modal=document.createElement('div');modal.className='grammar2-modal';modal.id='grammarQuizModal';
 modal.innerHTML='<div class="grammar2-modal-card"><div class="grammar2-modal-head"><div><div class="grammar2-eyebrow">QUICK REVIEW · UNIT '+q.unit+'</div><h2>'+esc(q.title)+'</h2></div><button class="secondary" id="quizClose">×</button></div><p class="grammar2-question">Đâu là công thức tóm tắt đúng cho unit này?</p><div class="grammar2-options">'+q.options.map((x,i)=>'<button type="button" data-q="'+i+'">'+esc(x)+'</button>').join('')+'</div><small>Question '+(q.index+1)+' / '+state.quiz.length+'</small></div>';
 document.body.appendChild(modal);modal.querySelector('#quizClose').addEventListener('click',()=>modal.remove());modal.addEventListener('click',e=>{if(e.target===modal)modal.remove()});
 modal.querySelectorAll('[data-q]').forEach(btn=>btn.addEventListener('click',()=>{const ok=btn.textContent===q.correct;btn.classList.add(ok?'correct':'wrong');setTimeout(()=>{state.quizIndex++;state.quizIndex<state.quiz.length?renderQuiz():modal.remove()},400)}));
}

export function showGrammar(open=true){const root=$('grammarScreen');if(!root)return;document.body.classList.toggle('grammar-mode',open);root.hidden=!open;if(open){state.progress=loadGrammarProgress();render()}}
window.PreviewGrammar={show:showGrammar,refresh:render,getProgress:()=>({...state.progress})};
