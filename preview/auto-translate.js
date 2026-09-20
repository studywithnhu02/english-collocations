/* Standalone real-time example translator. Independent from AI Agent. */
(() => {
  const DATA_KEY='english-collocations-preview-v2';
  const CACHE_KEY='english-collocations-translation-cache-v1';
  const active=new Set();
  const readCache=()=>{try{return JSON.parse(localStorage.getItem(CACHE_KEY)||'{}')}catch{return{}}};
  const writeCache=x=>localStorage.setItem(CACHE_KEY,JSON.stringify(x));
  const readRows=()=>{try{const x=JSON.parse(localStorage.getItem(DATA_KEY)||'[]');return Array.isArray(x)?x:[]}catch{return[]}};
  const writeRows=r=>{localStorage.setItem(DATA_KEY,JSON.stringify(r));window.dispatchEvent(new CustomEvent('preview-data-updated'))};
  const cell=(tr,f)=>tr?.querySelector(`.editable[data-field="${f}"]`)||tr?.querySelector(`[data-field="${f}"]`);
  const toast=(text,err=false)=>{let e=document.getElementById('standaloneTranslateStatus');if(!e){e=document.createElement('div');e.id='standaloneTranslateStatus';e.style.cssText='position:fixed;right:18px;bottom:18px;z-index:99999;padding:9px 12px;border-radius:9px;background:#172131;color:#fff;border:1px solid #34445a;font:12px system-ui;box-shadow:0 8px 24px #0004';document.body.appendChild(e)}e.textContent=text;e.style.borderColor=err?'#ff686d':'#36c98b';clearTimeout(e._t);e._t=setTimeout(()=>e.remove(),3000)};
  const clean=t=>String(t||'').replace(/\s+/g,' ').trim().slice(0,800);
  async function translate(text){const c=readCache();if(c[text])return c[text];const u='https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=vi&dt=t&q='+encodeURIComponent(text);const r=await fetch(u,{mode:'cors',cache:'force-cache'});if(!r.ok)throw Error('Translation HTTP '+r.status);const d=await r.json();const out=clean(Array.isArray(d?.[0])?d[0].map(x=>x?.[0]||'').join(''):'' );if(!out)throw Error('Empty translation');c[text]=out;writeCache(c);return out}
  function commit(id,english,vi){const next=readRows().map(r=>String(r.id)===String(id)?{...r,e:english,em:vi}:r);writeRows(next);setTimeout(()=>{const tr=document.querySelector(`#body tr[data-id="${CSS.escape(String(id))}"]`);const el=cell(tr,'em');if(el){if('value'in el)el.value=vi;else el.textContent=vi}},30)}
  async function run(id,english){const k=String(id);if(active.has(k))return;active.add(k);try{const c=readCache();if(c[english]){commit(id,english,c[english]);toast('✓ Đã dịch → NGHĨA CÂU VÍ DỤ');return}toast('⏳ Đang dịch…');const vi=await translate(english);commit(id,english,vi);toast('✓ Đã dịch → NGHĨA CÂU VÍ DỤ')}catch(e){console.error('[StandaloneTranslate]',e);toast('⚠️ Không thể dịch: '+e.message,true)}finally{active.delete(k)}}
  const last=new WeakMap();
  function bind(){document.querySelectorAll('#body .editable[data-field="e"]').forEach(el=>{if(el.dataset.rtTranslate==='1')return;el.dataset.rtTranslate='1';el.addEventListener('focus',()=>last.set(el,String(el.textContent||el.value||'').replace(/\s+/g,' ').trim()),true)})}
  function onBlur(e){const el=e.target;if(!el?.matches?.('#body .editable[data-field="e"]'))return;const tr=el.closest('tr'),id=tr?.dataset.id;if(!id)return;const text=String(el.textContent||el.value||'').replace(/\s+/g,' ').trim();if(text.length<3||text===last.get(el))return;setTimeout(()=>run(id,text),80)}
  function boot(){bind();document.addEventListener('blur',onBlur,true);const b=document.getElementById('body');if(b&&!b.dataset.rtTranslateObs){b.dataset.rtTranslateObs='1';new MutationObserver(bind).observe(b,{childList:true,subtree:true})}}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(boot,250));else setTimeout(boot,250);
})();
