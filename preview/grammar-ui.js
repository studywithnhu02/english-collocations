import {GRAMMAR_TOPICS,grammarLevels,grammarCategories,loadGrammarProgress,toggleGrammarDone,getGrammarStats} from './grammar-core.mjs';

const state={level:'All',category:'All',query:'',selected:null,progress:loadGrammarProgress(),quizIndex:0,quizOpen:false};
const quiz=[
 {q:'Which sentence is correct?',a:['She work from home.','She works from home.','She working from home.'],correct:1,topic:'Present Simple'},
 {q:'Choose the correct question.',a:['Where you work?','Where do you work?','Where does you work?'],correct:1,topic:'Questions'},
 {q:'Which sentence uses Present Perfect correctly?',a:['I have finished the report.','I have finish the report.','I finished the report since Monday.'],correct:0,topic:'Present Perfect'},
 {q:'Choose the correct conditional.',a:['If we test early, we will learn faster.','If we will test early, we learn faster.','If we tested early, we will learn faster.'],correct:0,topic:'Conditionals'},
 {q:'Which passive sentence is correct?',a:['The report approved yesterday.','The report was approved yesterday.','The report was approve yesterday.'],correct:1,topic:'Passive Voice'},
];

function el(tag,cls,html){const n=document.createElement(tag);if(cls)n.className=cls;if(html!==undefined)n.innerHTML=html;return n}
function qsa(sel,root=document){return [...root.querySelectorAll(sel)]}
function esc(v){return String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}

function filtered(){
 const q=state.query.trim().toLocaleLowerCase('vi');
 return GRAMMAR_TOPICS.filter(x=>(state.level==='All'||x.level===state.level)&&(state.category==='All'||x.category===state.category)&&(!q||[x.title,x.summary,x.category,x.level,x.formula,x.examples.join(' ')].join(' ').toLocaleLowerCase('vi').includes(q)));
}
function progressStats(){return getGrammarStats(state.progress)}

function render(){const root=document.getElementById('grammarScreen');if(!root)return;root.innerHTML='';
 const stats=progressStats(), rows=filtered();
 root.append(
  el('div','grammar-head','<div><div class="grammar-eyebrow">ENGLISH · GRAMMAR</div><h1>📘 Grammar Hub</h1><p>Hệ thống ngữ pháp từ nền tảng đến nâng cao, dùng để học – tra cứu – luyện tập.</p></div><div class="grammar-head-actions"><button type="button" class="secondary" id="grammarBack">← Collocation</button><button type="button" id="grammarQuizBtn">🎯 Quick Quiz</button></div>'),
  el('div','grammar-stats-row',
   '<div class="grammar-stat"><span>Chủ đề</span><b>'+stats.total+'</b><small>tổng số bài</small></div>'+
   '<div class="grammar-stat"><span>Đã nắm</span><b>'+stats.done+'</b><small>đã đánh dấu hoàn thành</small></div>'+
   '<div class="grammar-stat"><span>Còn lại</span><b>'+stats.remaining+'</b><small>chủ đề chưa hoàn thành</small></div>'+
   '<div class="grammar-stat progress-stat"><div><span>Progress</span><b>'+stats.percent+'%</b></div><div class="grammar-progress"><i style="width:'+stats.percent+'%"></i></div></div>'
  ),
  el('div','grammar-toolbar',
   '<input id="grammarSearch" placeholder="🔎 Tìm grammar topic..." value="'+esc(state.query)+'">'+
   '<select id="grammarLevel">'+grammarLevels().map(x=>'<option value="'+x+'" '+(x===state.level?'selected':'')+'>'+x+'</option>').join('')+'</select>'+
   '<select id="grammarCategory">'+grammarCategories().map(x=>'<option value="'+esc(x)+'" '+(x===state.category?'selected':'')+'>'+esc(x)+'</option>').join('')+'</select>'
  ),
  el('div','grammar-layout')
 );
 const layout=root.querySelector('.grammar-layout');
 const list=el('div','grammar-list');const detail=el('div','grammar-detail');
 if(!rows.length){list.append(el('div','grammar-empty','Không tìm thấy chủ đề phù hợp.'))}
 rows.forEach(topic=>{
  const done=!!state.progress[topic.id]?.done;
  const card=el('button','grammar-topic-card '+(state.selected===topic.id?'selected':''));
  card.type='button';card.innerHTML='<div class="grammar-topic-top"><span class="grammar-level '+topic.level.toLowerCase().replace(/[^a-z]+/g,'-')+'">'+esc(topic.level)+'</span>'+(done?'<span class="grammar-done">✓ Done</span>':'')+'</div><strong>'+esc(topic.title)+'</strong><small>'+esc(topic.category)+'</small><p>'+esc(topic.summary)+'</p>';
  card.addEventListener('click',()=>{state.selected=topic.id;render()});list.append(card);
 });
 layout.append(list);
 if(state.selected&&rows.some(x=>x.id===state.selected)) detail.append(renderDetail(state.selected));
 else detail.append(el('div','grammar-detail-empty','<div class="grammar-detail-icon">📖</div><h2>Chọn một chủ đề</h2><p>Chọn grammar topic bên trái để xem công thức, ví dụ, lỗi thường gặp và đánh dấu đã nắm.</p>'));
 layout.append(detail);

 root.querySelector('#grammarSearch').addEventListener('input',e=>{state.query=e.target.value;state.selected=null;render()});
 root.querySelector('#grammarLevel').addEventListener('change',e=>{state.level=e.target.value;state.selected=null;render()});
 root.querySelector('#grammarCategory').addEventListener('change',e=>{state.category=e.target.value;state.selected=null;render()});
 root.querySelector('#grammarBack').addEventListener('click',()=>showGrammar(false));
 root.querySelector('#grammarQuizBtn').addEventListener('click',()=>openQuiz());
}

function renderDetail(id){
 const topic=GRAMMAR_TOPICS.find(x=>x.id===id);const done=!!state.progress[id]?.done;const box=el('div','grammar-detail-card');
 box.innerHTML='<div class="grammar-detail-header"><div><span class="grammar-level '+topic.level.toLowerCase().replace(/[^a-z]+/g,'-')+'">'+esc(topic.level)+'</span><h2>'+esc(topic.title)+'</h2><p>'+esc(topic.summary)+'</p></div><button type="button" class="'+(done?'secondary':'')+'" id="grammarDone">'+(done?'✓ Đã nắm':'Đánh dấu đã nắm')+'</button></div>'+
 '<div class="grammar-formula"><span>FORMULA</span><strong>'+esc(topic.formula)+'</strong></div>'+
 '<div class="grammar-detail-grid"><section><h3>Ví dụ</h3>'+topic.examples.map((x,i)=>'<div class="grammar-example"><b>'+((i+1)+'.')+'</b><span>'+esc(x)+'</span></div>').join('')+'</section><section><h3>Điểm cần nhớ</h3><div class="grammar-notes">'+topic.notes.map(x=>'<div>• '+esc(x)+'</div>').join('')+'</div></section></div>'+
 '<div class="grammar-mistake"><b>⚠️ Common mistake</b><span>'+esc(topic.common)+'</span></div>';
 box.querySelector('#grammarDone').addEventListener('click',()=>{state.progress=toggleGrammarDone(state.progress,id);render()});
 return box;
}

function openQuiz(){state.quizOpen=true;state.quizIndex=0;renderQuiz()}
function renderQuiz(){
 let old=document.getElementById('grammarQuizModal');old?.remove();
 const q=quiz[state.quizIndex%quiz.length];
 const modal=el('div','grammar-modal');modal.id='grammarQuizModal';
 modal.innerHTML='<div class="grammar-modal-card"><div class="grammar-modal-head"><div><span class="grammar-eyebrow">QUICK QUIZ</span><h2>🎯 '+esc(q.topic)+'</h2></div><button type="button" class="secondary" id="quizClose">×</button></div><div class="grammar-quiz-q">'+esc(q.q)+'</div><div class="grammar-quiz-options">'+q.a.map((x,i)=>'<button type="button" data-answer="'+i+'">'+esc(x)+'</button>').join('')+'</div><div class="grammar-quiz-foot">Question '+(state.quizIndex+1)+' / '+quiz.length+'</div></div>';
 document.body.appendChild(modal);
 modal.addEventListener('click',e=>{if(e.target===modal)e.currentTarget.remove()});
 modal.querySelector('#quizClose').addEventListener('click',()=>modal.remove());
 modal.querySelectorAll('[data-answer]').forEach(btn=>btn.addEventListener('click',()=>{
   const ok=Number(btn.dataset.answer)===q.correct;
   btn.classList.add(ok?'correct':'wrong');
   setTimeout(()=>{state.quizIndex=(state.quizIndex+1)%quiz.length;renderQuiz()},450);
 }));
}

export function showGrammar(open=true){
 const root=document.getElementById('grammarScreen');if(!root)return;
 document.body.classList.toggle('grammar-mode',open);
 root.hidden=!open;
 if(open){state.progress=loadGrammarProgress();render();}
}
window.PreviewGrammar={show:showGrammar,refresh:render,getProgress:()=>({...state.progress})};
