import {GRAMMAR_TOPICS,CHAPTERS} from './grammar-core.mjs';

const HISTORY_KEY='english-collocations-preview-grammar-exercise-v1';
const state={unit:1,attempt:null,selectedAnswers:{},submitted:false};

const $=id=>document.getElementById(id);
const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const norm=v=>String(v??'').trim().toLocaleLowerCase('vi').replace(/[’‘]/g,"'").replace(/\s+/g,' ');
const topic=unit=>GRAMMAR_TOPICS.find(x=>x.unit===Number(unit))||GRAMMAR_TOPICS[0];

function loadHistory(){try{const v=JSON.parse(localStorage.getItem(HISTORY_KEY)||'{}');return v&&typeof v==='object'?v:{}}catch{return {}}}
function saveHistory(v){localStorage.setItem(HISTORY_KEY,JSON.stringify(v||{}))}
function latestScore(unit){const h=loadHistory()[String(unit)];return h&&Number.isFinite(h.percent)?h:null}

const FILL_DATA={
1:{sentence:'I ___ ready for the meeting.',answer:'am'},
2:{sentence:'___ you ready for the meeting?',answer:'Are'},
3:{sentence:'I am ___ on the new banking app.',answer:'working'},
4:{sentence:'___ you working now?',answer:'Are'},
5:{sentence:'She ___ in the design team.',answer:'works'},
6:{sentence:'We ___ work on Sundays.',answer:"don't"},
7:{sentence:'___ you work here?',answer:'Do'},
8:{sentence:'She ___ using Figma now.',answer:'is'},
9:{sentence:"I ___ got a meeting at 2.",answer:'have'},
10:{sentence:'They ___ at the office yesterday.',answer:'were'},
11:{sentence:'We ___ the deadline last Friday.',answer:'met'},
12:{sentence:'She ___ call yesterday.',answer:"didn't"},
13:{sentence:'I ___ working when you called.',answer:'was'},
14:{sentence:'I ___ working when he arrived.',answer:'was'},
15:{sentence:'We ___ finished the first draft.',answer:'have'},
16:{sentence:'I have ___ sent the email.',answer:'just'},
17:{sentence:'Have you ___ used this app before?',answer:'ever'},
18:{sentence:'How long have you ___ here?',answer:'worked'},
19:{sentence:'I have worked here ___ 2024.',answer:'since'},
20:{sentence:'I ___ the client yesterday.',answer:'met'},
21:{sentence:'The report ___ checked every morning.',answer:'is'},
22:{sentence:'The form ___ being reviewed now.',answer:'is'},
23:{sentence:'She ___ a laptop.',answer:'has'},
24:{sentence:'The past of go is ___.',answer:'went'},
25:{sentence:'I ___ work here.',answer:'used to'},
26:{sentence:'What ___ you doing tomorrow?',answer:'are'},
27:{sentence:'I am ___ to call the client.',answer:'going'},
28:{sentence:'I think we ___ finish on time.',answer:'will'},
29:{sentence:'___ we start?',answer:'Shall'},
30:{sentence:'It ___ rain tonight.',answer:'might'},
31:{sentence:'___ you help me with this screen?',answer:'Could'},
32:{sentence:'You ___ share the password.',answer:"mustn't"},
33:{sentence:'You ___ back up your files.',answer:'should'},
34:{sentence:'I ___ finish this today.',answer:'have to'},
35:{sentence:'Would you ___ some coffee?',answer:'like'},
36:{sentence:'There ___ a problem.',answer:'is'},
37:{sentence:'There ___ be a meeting tomorrow.',answer:'will'},
38:{sentence:'___ is important to test early.',answer:'It'},
39:{sentence:"I___ ready.",answer:"'m"},
40:{sentence:'Do you work here? — Yes, I ___.',answer:'do'},
41:{sentence:'I like this tool. — So ___ I.',answer:'do'},
42:{sentence:"She ___ ready.",answer:"isn't"},
43:{sentence:'___ they work here?',answer:'Do'},
44:{sentence:'Who ___ you yesterday?',answer:'called'},
45:{sentence:'What is the new app ___?',answer:'like'},
46:{sentence:'___ option do you prefer?',answer:'Which'},
47:{sentence:'How long does it ___ to finish?',answer:'take'},
48:{sentence:'Do you know where she ___?',answer:'works'},
49:{sentence:'She ___ that she was busy.',answer:'said'},
50:{sentence:'I am ___ now.',answer:'working'},
51:{sentence:'I enjoy ___.',answer:'learning'},
52:{sentence:'I told him ___ wait.',answer:'to'},
53:{sentence:'I went to the shop ___ buy a notebook.',answer:'to'},
54:{sentence:'We went ___ after work.',answer:'shopping'},
55:{sentence:'Please get ___ for the meeting.',answer:'ready'},
56:{sentence:"Let's ___ a plan.",answer:'make'},
57:{sentence:'We ___ a meeting at 3.',answer:'have'},
58:{sentence:'She called ___.',answer:'me'},
59:{sentence:'This is ___ laptop.',answer:'my'},
60:{sentence:'This laptop is ___.',answer:'mine'},
61:{sentence:'They called ___.',answer:'me'},
62:{sentence:'I did it ___.',answer:'myself'},
63:{sentence:"This is my brother___ car.",answer:"'s"},
64:{sentence:'It is ___ idea.',answer:'an'},
65:{sentence:'We bought two ___.',answer:'buses'},
66:{sentence:'I need some ___.',answer:'information'},
67:{sentence:"There aren't ___ chairs.",answer:'many'},
68:{sentence:'I saw ___ designer yesterday.',answer:'a'},
69:{sentence:'Close ___ door.',answer:'the'},
70:{sentence:"I'm going ___.",answer:'home'},
71:{sentence:'I like ___.',answer:'music'},
72:{sentence:'___ United States is a country.',answer:'the'},
73:{sentence:'___ notes here are useful.',answer:'These'},
74:{sentence:'I prefer the red ___.',answer:'one'},
75:{sentence:'Do you have ___ questions?',answer:'any'},
76:{sentence:"I don't have ___ time.",answer:'any'},
77:{sentence:'___ called me, so I answered.',answer:'Somebody'},
78:{sentence:'Is there ___ I can help with?',answer:'anything'},
79:{sentence:'___ student is ready.',answer:'Every'},
80:{sentence:'___ people joined the meeting.',answer:'Most'},
81:{sentence:'___ options are possible.',answer:'Both'},
82:{sentence:'We have ___ meetings this week.',answer:'many'},
83:{sentence:'I have ___ ideas.',answer:'a few'},
84:{sentence:"It's a ___ tool.",answer:'useful'},
85:{sentence:'She explained it ___.',answer:'clearly'},
86:{sentence:'This flow is ___ than the old one.',answer:'simpler'},
87:{sentence:'This screen is ___ than the old one.',answer:'clearer'},
88:{sentence:"This version isn't as ___ as the first one.",answer:'clear'},
89:{sentence:'This is the ___ useful feature.',answer:'most'},
90:{sentence:'The text is clear ___.',answer:'enough'},
91:{sentence:'The screen is too ___.',answer:'complicated'},
92:{sentence:'He speaks English very ___.',answer:'well'},
93:{sentence:'She ___ works late.',answer:'usually'},
94:{sentence:'I have ___ sent it.',answer:'already'},
95:{sentence:'Give ___ the file.',answer:'me'},
96:{sentence:'The meeting starts ___ 8.',answer:'at'},
97:{sentence:"I've worked here ___ 2024.",answer:'since'},
98:{sentence:'I called her ___ the meeting.',answer:'during'},
99:{sentence:"She's ___ the office.",answer:'in'},
100:{sentence:"I'm ___ work.",answer:'at'},
101:{sentence:'We went ___ the office.',answer:'to'},
102:{sentence:'The bag is ___ the desk.',answer:'under'},
103:{sentence:'We walked ___ the park.',answer:'through'},
104:{sentence:'I go to work ___ bus.',answer:'by'},
105:{sentence:"She's good ___ explaining things.",answer:'at'},
106:{sentence:'Please listen ___ the user.',answer:'to'},
107:{sentence:'The meeting was called ___.',answer:'off'},
108:{sentence:'Please put ___ your shoes.',answer:'on'},
109:{sentence:'It was late, ___ we left.',answer:'so'},
110:{sentence:'Call me ___ you arrive.',answer:'when'},
111:{sentence:'If we test early, we ___ learn faster.',answer:'will'},
112:{sentence:'If I ___ more time, I would research more.',answer:'had'},
113:{sentence:'The user ___ reported it replied.',answer:'who'},
114:{sentence:'The people we ___ were helpful.',answer:'met'}
};

function wrongAnswers(answer){
 const a=norm(answer);
 const pools={
  'am':['is','are'],'are':['is','do'],'is':['are','am'],'working':['work','worked'],'works':['work','working'],"don't":["doesn't","didn't"],'do':['does','did'],'have':['has','had'],'were':['was','are'],'met':['meet','meets'],"didn't":["doesn't","wasn't"],'was':['were','is'],'just':['already','yet'],'ever':['never','already'],'worked':['work','working'],'since':['for','ago'],'isn’t':['wasn’t','aren’t'],'isnt':['wasnt','aren’t'], 'isn't':['wasn't','aren't'],'called':['call','calls'],'like':['likes','liked'],'which':['what','who'],'take':['takes','took'],'to':['for','at'],'shopping':['shop','to shop'],'ready':['late','busy'],'make':['do','take'],'me':['I','my'],'my':['mine','me'],'mine':['my','yours'],'myself':['yourself','me'],"'s":['s','of'],'an':['a','the'],'buses':['bus','busses'],'information':['informations','an information'],'many':['much','a lot'],'a':['an','the'],'the':['a','an'],'music':['musics','a music'],'these':['this','those'],'one':['ones','it'],'any':['some','no'],'somebody':['anybody','nobody'],'anything':['something','nothing'],'every':['all','each'],'most':['many','every'],'both':['either','neither'],'a few':['a little','few'],'useful':['usefully','use'],'clearly':['clear','clearer'],'simpler':['simple','more simple'],'clearer':['clear','clearest'],'clear':['clearly','clearer'],'most':['more','many'],'enough':['too','very'],'complicated':['complication','complicatedly'],'well':['good','goodly'],'usually':['usual','usefully'],'already':['yet','still'],'at':['on','in'],'during':['while','before'],'in':['at','on'],'under':['behind','over'],'through':['over','under'],'by':['with','on'],'off':['on','out'],'on':['off','out'],'so':['but','because'],'when':['while','because'],'will':['would','can'],'had':['have','has'],'who':['which','where']};
 const set=pools[a]||[];
 const generic=['am','is','are','do','does','did','to','for','in','on'].filter(x=>x!==a);
 return [...new Set([...set,...generic])].slice(0,2);
}

function sentenceWith(sentence,answer){return sentence.replace('___',answer)}
function makeFill(t){
 const d=FILL_DATA[t.unit]||{sentence:t.example||'Apply the unit pattern: ___.',answer:''};
 const aliases=[];
 if(norm(d.answer)==='to')aliases.push('to');
 if(norm(d.answer)==="'m")aliases.push('am');
 return {type:'text',prompt:'Điền từ/cụm từ còn thiếu để câu đúng.',sentence:d.sentence,answer:d.answer,aliases,explanation:'Đáp án là “'+d.answer+'”. Hãy nhìn vào vị trí của từ/cụm từ trong câu và đối chiếu với công thức của Unit '+t.unit+': '+t.formula+'。'};
}

function makeSentenceMCQ(t){
 const d=FILL_DATA[t.unit]||{sentence:'___',answer:''};
 const correct=sentenceWith(d.sentence,d.answer);
 const wrong=wrongAnswers(d.answer);
 const options=[correct,...wrong.map(x=>sentenceWith(d.sentence,x))];
 return {type:'mcq',prompt:'Chọn câu áp dụng đúng trọng tâm của Unit '+t.unit+'.',options,answerIndex:0,explanation:'Câu đúng là: “'+correct+'”. Unit này tập trung vào: '+t.memory+'. Công thức: '+t.formula};
}

function pickDistinct(offsets,t,field){
 for(const off of offsets){const u=((t.unit-1+off+GRAMMAR_TOPICS.length)%GRAMMAR_TOPICS.length)+1;const x=topic(u);if(x&&x[field]!==t[field])return x[field]}
 return t[field];
}
function makeFormulaMCQ(t){
 const options=[t.formula,pickDistinct([7,19,31],t,'formula'),pickDistinct([13,29,43],t,'formula')];
 const unique=[...new Set(options)];
 while(unique.length<3)unique.push('Câu ghi nhớ chung của unit');
 return {type:'mcq',prompt:'Công thức 1 dòng nào đúng với Unit '+t.unit+'?',options:unique.slice(0,3),answerIndex:0,explanation:'Công thức của Unit '+t.unit+' là: '+t.formula+'. Mẹo nhớ: '+t.memory};
}
function makeMemoryMCQ(t){
 const options=[t.memory,pickDistinct([5,17,27],t,'memory'),pickDistinct([9,21,37],t,'memory')];
 return {type:'mcq',prompt:'Mẹo nhớ nào khớp với Unit '+t.unit+'?',options:[...new Set(options)].slice(0,3),answerIndex:0,explanation:'Điểm cần nhớ của Unit '+t.unit+': '+t.memory+'.'};
}
function makeExampleMCQ(t){
 const options=[t.example,pickDistinct([3,11,25],t,'example'),pickDistinct([6,18,34],t,'example')];
 return {type:'mcq',prompt:'Câu ví dụ nào minh họa đúng Unit '+t.unit+'?',options:[...new Set(options)].slice(0,3),answerIndex:0,explanation:'Ví dụ dùng cho Unit '+t.unit+': “'+t.example+'”. Khi học, bạn nên nói câu này thành tiếng rồi tự thay chủ ngữ/từ vựng để tạo câu mới.'};
}

function buildAttempt(unit){
 const t=topic(unit);
 const qs=[makeFill(t),makeSentenceMCQ(t),makeFormulaMCQ(t),makeMemoryMCQ(t),makeExampleMCQ(t)].map((q,i)=>({...q,id:\`u\${t.unit}-q\${i+1}\`}));
 return {unit:t.unit,title:t.title,questions:qs,startedAt:new Date().toISOString()};
}

function answerValue(q){return state.selectedAnswers[q.id]??''}

function grade(attempt){
 let correct=0;
 const results=attempt.questions.map((q,i)=>{
  const got=answerValue(q);
  let ok=false;
  if(q.type==='text')ok=[q.answer,...(q.aliases||[])].some(a=>norm(a)===norm(got));
  else ok=Number(got)===q.answerIndex;
  if(ok)correct++;
  return {...q,selected:got,correct:ok,index:i};
 });
 const percent=Math.round(correct/results.length*100);
 const history=loadHistory();
 history[String(attempt.unit)]={percent,correct,total:results.length,completedAt:new Date().toISOString()};
 saveHistory(history);
 currentResult={correct,total:results.length,percent,results};
 return currentResult;
}

function optionsHtml(q,index){
 if(q.type==='text')return '<input class="gx-answer" data-answer="'+index+'" value="'+esc(answerValue(q))+'" placeholder="Nhập đáp án..." autocomplete="off">';
 return '<div class="gx-options">'+q.options.map((x,i)=>'<label class="gx-option"><input type="radio" name="gx-'+index+'" value="'+i+'" '+(String(answerValue(q))===String(i)?'checked':'')+'><span>'+esc(x)+'</span></label>').join('')+'</div>';
}

function renderModal(){
 $('grammarExerciseModal')?.remove();
 if(!state.attempt)return;
 const a=state.attempt,t=topic(a.unit),latest=latestScore(a.unit);
 const modal=document.createElement('div');modal.className='gx-modal';modal.id='grammarExerciseModal';
 modal.innerHTML='<div class="gx-card">'+
  '<div class="gx-head"><div><div class="grammar2-eyebrow">GRAMMAR PRACTICE</div><h2>📝 Bài tập · Unit '+a.unit+'</h2><p>'+esc(t.title)+'</p></div><div class="gx-head-actions"><span class="gx-latest">'+(latest?'Lần gần nhất: '+latest.percent+'%':'Chưa có kết quả')+'</span><button type="button" class="secondary" id="gxClose">×</button></div></div>'+
  '<div class="gx-bar"><select id="gxUnitSelect"><option value="">Chọn unit...</option>'+GRAMMAR_TOPICS.map(x=>'<option value="'+x.unit+'" '+(x.unit===a.unit?'selected':'')+'>Unit '+x.unit+' · '+esc(x.title)+'</option>').join('')+'</select><span>5 câu · 2 dạng: chọn đáp án + điền từ</span><span class="gx-progress-label">'+(state.submitted?'Đã chấm bài':'Chưa nộp')+'</span></div>'+
  '<div class="gx-questions">'+a.questions.map((q,i)=>{
   const status=state.submitted?(q.correct?'correct':'wrong'):'';
   const ans=state.submitted?(q.type==='text'?esc(q.selected||'(bỏ trống)'):esc(q.options[q.selected]??'(chưa chọn)')):'';
   return '<article class="gx-q '+status+'"><div class="gx-q-top"><span>Câu '+(i+1)+'</span><b>'+(state.submitted?(q.correct?'✓ Đúng':'✗ Sai'):'')+'</b></div><p class="gx-prompt">'+esc(q.prompt)+'</p>'+
    (q.sentence?'<div class="gx-sentence">'+esc(q.sentence)+'</div>':'')+optionsHtml(q,i)+
    (state.submitted?'<div class="gx-explain"><strong>💡 Giải thích</strong><p>'+esc(q.explanation)+'</p>'+(q.type==='text'?'<small>Đáp án: '+esc(q.answer)+'</small>':'<small>Đáp án: '+esc(q.options[q.answerIndex])+'</small>')+'</div>':'')+
   '</article>';
  }).join('')+'</div>'+
  '<div class="gx-footer">'+
   (state.submitted?'<div class="gx-score"><strong>'+aResult().percent+'%</strong><span>Đúng '+aResult().correct+'/'+aResult().total+' câu</span></div>':'<div class="gx-score muted">Làm từng câu rồi bấm <b>Nộp bài</b> để xem điểm và giải thích.</div>')+
   '<div class="gx-actions">'+
    (state.submitted?'<button type="button" class="secondary" id="gxRetry">↻ Làm lại</button><button type="button" id="gxMarkDone">✓ Đánh dấu unit đã nắm</button>':'<button type="button" class="secondary" id="gxReset">Xóa đáp án</button><button type="button" id="gxSubmit">Nộp bài & chấm điểm</button>')+
   '</div></div>'+
  '</div>';
 document.body.appendChild(modal);
 modal.querySelector('#gxClose').addEventListener('click',close);
 modal.addEventListener('click',e=>{if(e.target===modal)close()});
 modal.querySelector('#gxUnitSelect').addEventListener('change',e=>{const u=Number(e.target.value);if(!u)return;state.unit=u;state.attempt=buildAttempt(u);state.selectedAnswers={};state.submitted=false;renderModal()});
 modal.querySelectorAll('[data-answer]').forEach(el=>{
  const i=Number(el.dataset.answer);
  const q=a.questions[i];
  if(q.type==='text')el.addEventListener('input',e=>{state.selectedAnswers[q.id]=e.target.value});
  else el.addEventListener('change',e=>{state.selectedAnswers[q.id]=e.target.value});
 });
 if(state.submitted)modal.querySelector('#gxRetry')?.addEventListener('click',()=>{state.attempt=buildAttempt(state.unit);state.selectedAnswers={};state.submitted=false;renderModal()});
 if(state.submitted)modal.querySelector('#gxMarkDone')?.addEventListener('click',()=>{close();document.getElementById('grammarDone2')?.click()});
 if(!state.submitted)modal.querySelector('#gxReset')?.addEventListener('click',()=>{state.selectedAnswers={};renderModal()});
 if(!state.submitted)modal.querySelector('#gxSubmit')?.addEventListener('click',()=>{if(a.questions.some(q=>String(answerValue(q)).trim()==='')&&!confirm('Bạn còn câu chưa trả lời. Vẫn nộp bài?'))return;grade(a);state.submitted=true;renderModal()});
}

let currentResult=null;
function aResult(){return currentResult||{correct:0,total:state.attempt?.questions?.length||0,percent:0}}
function open(unit=state.unit){state.unit=Number(unit)||1;state.attempt=buildAttempt(state.unit);state.selectedAnswers={};state.submitted=false;currentResult=null;renderModal()}
function close(){state.attempt=null;state.submitted=false;currentResult=null;$('grammarExerciseModal')?.remove()}
window.PreviewGrammarExercises={open,close,getHistory:loadHistory};
