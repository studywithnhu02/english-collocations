/* AI Agent Preview v4 — reliable automatic example translation */
const DATA_KEY='english-collocations-preview-v2';
const MODEL_ID='onnx-community/Qwen2.5-0.5B-Instruct';
let autoBusy=new Set();
let translateSeq=0;

function rowsRead(){try{const x=JSON.parse(localStorage.getItem(DATA_KEY)||'[]');return Array.isArray(x)?x:[]}catch{return[]}}
function rowsWrite(rows){localStorage.setItem(DATA_KEY,JSON.stringify(rows));window.dispatchEvent(new CustomEvent('preview-data-updated'));}
function rowText(r){return String(r?.e||r?.example||r?.exampleEnglish||r?.sentence||'').trim()}
function rowMeaning(r){return String(r?.em||r?.exampleMeaning||r?.translation||r?.meaningExample||'').trim()}
function updateRow(id,field,value){const rows=rowsRead();const next=rows.map(r=>String(r.id)===String(id)?{...r,[field]:value}:r);rowsWrite(next);return next.find(r=>String(r.id)===String(id))}
function cell(tr,field){return tr?.querySelector(`.editable[data-field="${field}"]`)||tr?.querySelector(`[data-field="${field}"]`)}
function setCell(tr,field,value){const el=cell(tr,field);if(!el)return;el.textContent=value;el.dispatchEvent(new Event('input',{bubbles:true}));}
function agentStatus(text,kind=''){const el=document.getElementById('agentStatus');if(el){el.textContent=text;el.className='agent-status '+kind}}
function translationToast(text,kind=''){let el=document.getElementById('autoTranslateStatus');if(!el){el=document.createElement('div');el.id='autoTranslateStatus';el.style.cssText='position:fixed;right:18px;bottom:18px;z-index:100000;max-width:360px;padding:10px 13px;border-radius:10px;background:#1c2738;color:#f4f7fb;border:1px solid #344257;box-shadow:0 10px 30px #0005;font:12px/1.4 system-ui';document.body.appendChild(el)}el.textContent=text;el.style.borderColor=kind==='error'?'#ff686d':'#36c98b';clearTimeout(el._timer);el._timer=setTimeout(()=>el.remove(),3500)}

async function remoteTranslate(sentence){
  const url='https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=vi&dt=t&q='+encodeURIComponent(sentence);
  const res=await fetch(url,{method:'GET',mode:'cors',cache:'no-store'});
  if(!res.ok)throw new Error('Translation service HTTP '+res.status);
  const data=await res.json();
  const translated=Array.isArray(data?.[0])?data[0].map(x=>x?.[0]||'').join('').trim():'';
  if(!translated)throw new Error('Translation service returned empty text');
  return translated;
}

async function localTranslate(sentence){
  return new Promise((resolve,reject)=>{
    const worker=new Worker('./ai-agent-worker.js?v=4',{type:'module'});
    const id=++translateSeq;
    const timer=setTimeout(()=>{worker.terminate();reject(new Error('Local AI timeout'))},45000);
    const done=(ok,value)=>{clearTimeout(timer);worker.terminate();ok?resolve(value):reject(new Error(value||'Local AI failed'))};
    worker.onmessage=e=>{
      const d=e.data||{};
      if(d.id!==id)return;
      if(d.type==='status')return;
      if(d.ok){let text=String(d.text||'').trim();try{const m=text.match(/\{[\s\S]*\}/);if(m)text=JSON.parse(m[0]).translatedText||text}catch{}done(!!text,text)}else done(false,d.error);
    };
    worker.onerror=()=>done(false,'Local AI worker error');
    worker.postMessage({id,messages:[
      {role:'system',content:'Translate the English sentence into natural Vietnamese. Return only the Vietnamese translation. Preserve the exact meaning. No explanation.'},
      {role:'user',content:sentence}
    ],batch:false});
  });
}

async function translateExample(id,english){
  const key=String(id);if(autoBusy.has(key))return;autoBusy.add(key);
  translationToast('⏳ Đang dịch câu ví dụ…');agentStatus('⏳ Đang tự động dịch nghĩa câu ví dụ…');
  try{
    const rows=rowsRead();const current=rows.find(r=>String(r.id)===key);if(!current)return;
    if(rowText(current)!==english){updateRow(id,'e',english)}
    let translated='';let source='Browser AI';
    try{translated=await localTranslate(english)}catch(e){source='Free translation fallback';translated=await remoteTranslate(english)}
    translated=String(translated||'').trim();if(!translated)throw new Error('Không nhận được bản dịch');
    updateRow(id,'em',translated);
    const tr=document.querySelector(`#body tr[data-id="${CSS.escape(key)}"]`);setCell(tr,'em',translated);
    translationToast('✓ Đã dịch tự động → NGHĨA CÂU VÍ DỤ');agentStatus('✓ Đã tự dịch và điền vào NGHĨA CÂU VÍ DỤ','ok');
  }catch(e){translationToast('⚠️ Dịch tự động lỗi: '+e.message,'error');agentStatus('⚠️ Không thể tự dịch: '+e.message,'err')}
  finally{autoBusy.delete(key)}
}

function bindAutoTranslation(){
  document.querySelectorAll('#body tr').forEach(tr=>{
    const el=cell(tr,'e');if(!el||el.dataset.autoTranslationV4==='1')return;
    el.dataset.autoTranslationV4='1';
    let before='';
    el.addEventListener('focus',()=>{before=String(el.textContent||el.value||'').trim()});
    el.addEventListener('blur',()=>{
      const id=tr.dataset.id;const english=String(el.textContent||el.value||'').replace(/\s+/g,' ').trim();
      if(!id||english.length<3||english===before)return;
      updateRow(id,'e',english);
      setTimeout(()=>translateExample(id,english),120);
    });
    el.addEventListener('keydown',e=>{
      if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();el.blur()}
    });
  });
}

function ensureAgentStatus(){
  if(document.getElementById('agentStatus'))return;
  const host=document.querySelector('.ai');if(!host)return;
  const s=document.createElement('div');s.className='agent-status';s.id='agentStatus';s.style.cssText='font-size:11px;color:var(--muted);margin:10px 14px';s.textContent='Sẵn sàng · sửa câu tiếng Anh rồi click ra ngoài để tự dịch.';host.appendChild(s);
}

function bootAutoTranslation(){
  ensureAgentStatus();bindAutoTranslation();
  const body=document.getElementById('body');
  if(body&&!body.dataset.autoTranslationObserver){
    body.dataset.autoTranslationObserver='1';
    new MutationObserver(()=>bindAutoTranslation()).observe(body,{childList:true,subtree:true});
  }
  window.addEventListener('preview-data-updated',()=>setTimeout(bindAutoTranslation,50));
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(bootAutoTranslation,250));
else setTimeout(bootAutoTranslation,250);
