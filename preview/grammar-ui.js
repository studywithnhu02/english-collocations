import {GRAMMAR_TOPICS,CHAPTERS,APPENDICES,loadGrammarProgress,toggleGrammarDone,getGrammarStats} from './grammar-core.mjs';
import {loadGrammarFolders,updateGrammarFolder,deleteGrammarFolder,restoreAllGrammarFolders,addGrammarFolder,saveGrammarPdfBlob,deleteGrammarPdfBlob,getGrammarPdfBlob,FOLDER_THUMBNAILS} from './grammar-folders.mjs?v=2';

const state={query:'',chapter:'all',status:'all',selected:1,progress:loadGrammarProgress(),quiz:null,quizIndex:0,view:'home',folderQuery:''};
const $=id=>document.getElementById(id);
const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const topic=unit=>GRAMMAR_TOPICS.find(x=>x.unit===unit);
const visible=()=>{const q=state.query.trim().toLocaleLowerCase('vi');return GRAMMAR_TOPICS.filter(x=>(state.chapter==='all'||x.chapterId===state.chapter)&&(state.status==='all'||(state.status==='done'&&state.progress[x.id]?.done)||(state.status==='todo'&&!state.progress[x.id]?.done))&&(!q||[x.unit,x.title,x.chapter,x.formula,x.memory,x.example].join(' ').toLocaleLowerCase('vi').includes(q)))};
const chapterProgress=id=>{const a=GRAMMAR_TOPICS.filter(x=>x.chapterId===id),d=a.filter(x=>state.progress[x.id]?.done).length;return{done:d,total:a.length,percent:Math.round(d/a.length*100)}};

const GRAMMAR_LAYOUT_KEY='english-collocations-preview-grammar-layout-v1';
let grammarResizeBound=false;
function grammarLayoutBounds(){const root=$('grammarScreen'),rect=root?.getBoundingClientRect();if(!rect)return{min:260,max:520};const min=260,max=Math.min(520,Math.max(min,rect.width-650));return{min,max}};
function applyGrammarSidebarWidth(value,persist=true){const root=$('grammarScreen');if(!root)return;const {min,max}=grammarLayoutBounds();const width=Math.round(Math.min(max,Math.max(min,Number(value)||320)));root.style.setProperty('--grammar-side-w',width+'px');if(persist)localStorage.setItem(GRAMMAR_LAYOUT_KEY,String(width));}
function loadGrammarSidebarWidth(){const saved=Number(localStorage.getItem(GRAMMAR_LAYOUT_KEY));if(Number.isFinite(saved)&&saved>=260)applyGrammarSidebarWidth(saved,false);}
function resetGrammarSidebarWidth(){localStorage.removeItem(GRAMMAR_LAYOUT_KEY);const root=$('grammarScreen');root?.style.removeProperty('--grammar-side-w');}
function bindGrammarResizer(){const el=$('grammar2SideResizer');if(!el)return;let dragging=false;
 const pointerMove=e=>{if(!dragging)return;const root=$('grammarScreen'),rect=root.getBoundingClientRect();applyGrammarSidebarWidth(Math.round(rect.right-e.clientX),true)};
 const stop=e=>{if(!dragging)return;dragging=false;el.classList.remove('is-dragging');document.body.classList.remove('grammar-resizing');try{el.releasePointerCapture?.(e.pointerId)}catch{}};
 el.addEventListener('pointerdown',e=>{if(window.innerWidth<=1100)return;dragging=true;el.classList.add('is-dragging');document.body.classList.add('grammar-resizing');el.setPointerCapture?.(e.pointerId);pointerMove(e);e.preventDefault()});
 el.addEventListener('pointermove',pointerMove);el.addEventListener('pointerup',stop);el.addEventListener('pointercancel',stop);
 el.addEventListener('dblclick',resetGrammarSidebarWidth);
 el.addEventListener('keydown',e=>{if(window.innerWidth<=1100)return;const root=$('grammarScreen');const current=parseFloat(getComputedStyle(root).getPropertyValue('--grammar-side-w'))||320;const {min,max}=grammarLayoutBounds();if(e.key==='ArrowLeft'){e.preventDefault();applyGrammarSidebarWidth(Math.min(max,current+16));}else if(e.key==='ArrowRight'){e.preventDefault();applyGrammarSidebarWidth(Math.max(min,current-16));}else if(e.key==='Home'){e.preventDefault();applyGrammarSidebarWidth(max);}else if(e.key==='End'){e.preventDefault();applyGrammarSidebarWidth(min);}});
 grammarResizeBound=true;
}

function folderProgress(folder){
 if(folder.hasTheory)return {done:state.progress?Object.values(state.progress).filter(x=>x?.done).length:0,total:Number(folder.unitCount)||GRAMMAR_TOPICS.length,percent:folder.unitCount?Math.round((Object.values(state.progress).filter(x=>x?.done).length/(Number(folder.unitCount)||1))*100):0};
 return {done:0,total:0,percent:0};
}
function folderThumbHtml(folder){
 if(folder.image)return '<img src="'+esc(folder.image)+'" alt="">';
 return esc(folder.thumb||'📘');
}
function formatFileSize(bytes){
 const n=Number(bytes)||0;
 if(!n)return '';
 if(n<1024*1024)return Math.max(1,Math.round(n/1024))+' KB';
 return (n/(1024*1024)).toFixed(1)+' MB';
}
function inferPdfName(fileName){
 const base=String(fileName||'').replace(/\.pdf$/i,'').replace(/[_-]+/g,' ').trim();
 return base||'Tài liệu Grammar mới';
}
function closeFolderOverlays(){document.querySelectorAll('.grammar-folder-modal').forEach(x=>x.remove());}
function renderFolderHome(){
 const root=$('grammarScreen');if(!root)return;
 const folders=loadGrammarFolders();
 const q=state.folderQuery.trim().toLocaleLowerCase('vi');
 const rows=folders.filter(f=>!q||[f.name,f.fileName,f.status].join(' ').toLocaleLowerCase('vi').includes(q));
 const analyzed=folders.filter(f=>f.hasTheory).length;
 const units=folders.reduce((sum,f)=>sum+(f.hasTheory?(Number(f.unitCount)||0):0),0);
 const cards=rows.map(folder=>{
   const p=folderProgress(folder);
   const openAction=folder.hasTheory
     ? '<button type="button" class="grammar-folder-open" data-folder-open="'+esc(folder.id)+'">Mở lý thuyết →</button>'
     : '<button type="button" class="grammar-folder-open secondary" disabled>Chưa tổng hợp lý thuyết</button>';
   return '<article class="grammar-folder-card">'+
     '<div class="grammar-folder-cover"><div class="grammar-folder-thumb">'+folderThumbHtml(folder)+'</div><div class="grammar-folder-info"><strong>'+esc(folder.name)+'</strong><small>PDF · '+esc(folder.fileName||'Chưa có file')+'</small></div><button type="button" class="grammar-folder-more" data-folder-manage="'+esc(folder.id)+'" aria-label="Quản lý tài liệu" title="Quản lý tài liệu">•••</button></div>'+
     '<div class="grammar-folder-range">'+esc(folder.status)+(folder.unitCount?' · '+folder.unitCount+' units':'')+(folder.addedAt?'':'')+'</div>'+
     (folder.hasTheory?'<div class="grammar-folder-progress"><em style="width:'+Math.min(100,p.percent)+'%"></em></div><div class="grammar-folder-progress-text"><span>'+p.done+'/'+p.total+' đã nắm</span><span>'+p.percent+'%</span></div>':'<div class="grammar-folder-unprocessed">File đã thêm · chờ tổng hợp lý thuyết</div>')+
     openAction+'</article>';
 }).join('');
 root.innerHTML='<section class="grammar-folder-home">'+
   '<div class="grammar-folder-head"><div class="grammar-folder-brand"><div class="grammar-folder-logo">📚</div><div><div class="grammar-folder-eyebrow">GRAMMAR LIBRARY</div><h1>Kho tài liệu Grammar</h1><p>Quản lý các file PDF được phân tích để tổng hợp thành hệ thống lý thuyết Grammar.</p></div></div>'+
   '<div class="grammar-folder-actions"><button type="button" class="secondary" id="grammarFolderBack">← Collocation</button><button type="button" id="grammarFolderAdd">＋ Thêm PDF</button><button type="button" class="secondary" id="grammarFolderRestore">↻ Khôi phục</button></div></div>'+
   '<div class="grammar-folder-meta"><span class="grammar-folder-chip">📁 <b>'+folders.length+'</b> tài liệu</span><span class="grammar-folder-chip">📘 <b>'+units+'</b> units</span><span class="grammar-folder-chip">✅ <b>'+analyzed+'</b> đã có lý thuyết</span><input id="grammarFolderSearch" class="grammar-folder-search" value="'+esc(state.folderQuery)+'" placeholder="🔎 Tìm tên tài liệu hoặc file PDF..."></div>'+
   (rows.length?'<div class="grammar-folder-grid">'+cards+'</div>':'<div class="grammar-folder-empty">Chưa có tài liệu phù hợp.</div>')+
   '</section>';
 $('grammarFolderBack').addEventListener('click',()=>window.PreviewGrammar?.show?.(false));
 $('grammarFolderAdd').addEventListener('click',()=>openAddPdfManager());
 $('grammarFolderRestore').addEventListener('click',()=>{restoreAllGrammarFolders();renderFolderHome()});
 $('grammarFolderSearch').addEventListener('input',e=>{state.folderQuery=e.target.value;renderFolderHome()});
 document.querySelectorAll('[data-folder-open]').forEach(btn=>btn.addEventListener('click',()=>openTheoryForSource(btn.dataset.folderOpen)));
 document.querySelectorAll('[data-folder-manage]').forEach(btn=>btn.addEventListener('click',()=>openFolderManager(btn.dataset.folderManage)));
}
function openTheoryForSource(sourceId){
 const source=loadGrammarFolders().find(x=>x.id===sourceId);
 if(!source||!source.hasTheory)return;
 state.view='theory';state.chapter='all';state.status='all';state.selected=1;
 render();window.scrollTo({top:0,behavior:'smooth'});
}
function openFolderManager(id){
 closeFolderOverlays();
 const folder=loadGrammarFolders().find(x=>x.id===id);if(!folder)return;
 const modal=document.createElement('div');modal.className='grammar-folder-modal';modal.id='grammarFolderManager';
 modal.innerHTML='<div class="grammar-folder-modal-card"><div class="grammar-folder-modal-head"><div><div class="grammar-folder-eyebrow">PDF SOURCE SETTINGS</div><h2>Quản lý tài liệu</h2><p>Đổi tên, thumbnail hoặc thay file PDF. Xóa tài liệu chỉ gỡ khỏi thư viện, không xóa phần lý thuyết đã tổng hợp.</p></div><button type="button" class="secondary" id="gfmClose">×</button></div>'+
 '<div class="grammar-folder-field"><label for="gfmName">Tên hiển thị</label><input id="gfmName" value="'+esc(folder.name)+'" maxlength="100"></div>'+
 '<div class="grammar-folder-field"><label>Thumbnail</label><div class="grammar-thumb-options">'+FOLDER_THUMBNAILS.map(x=>'<button type="button" class="grammar-thumb-option '+(!folder.image&&folder.thumb===x?'active':'')+'" data-thumb="'+esc(x)+'">'+esc(x)+'</button>').join('')+'</div></div>'+
 '<div class="grammar-folder-field"><label>Ảnh thumbnail</label><div class="grammar-folder-upload"><input type="file" id="gfmImage" accept="image/*"><button type="button" class="secondary" id="gfmClearImage">Xóa ảnh</button></div></div>'+
 '<div class="grammar-folder-field"><label>File PDF hiện tại</label><div class="grammar-folder-file">'+esc(folder.fileName||'Chưa có file')+'</div></div>'+
 '<div class="grammar-folder-field"><label>Thay file PDF</label><input type="file" id="gfmPdf" accept="application/pdf,.pdf"></div>'+
 '<div class="grammar-folder-modal-actions"><button type="button" class="danger" id="gfmDelete">🗑️ Xóa tài liệu</button><div class="grammar-folder-modal-right"><button type="button" class="secondary" id="gfmCancel">Hủy</button><button type="button" id="gfmSave">Lưu thay đổi</button></div></div></div>';
 document.body.appendChild(modal);
 let selectedThumb=folder.thumb||'📘',selectedImage=folder.image||'',selectedFile=null;
 const thumbs=modal.querySelectorAll('[data-thumb]');
 thumbs.forEach(btn=>btn.addEventListener('click',()=>{selectedThumb=btn.dataset.thumb;selectedImage='';thumbs.forEach(x=>x.classList.toggle('active',x===btn));}));
 modal.querySelector('#gfmClearImage').addEventListener('click',()=>{selectedImage='';modal.querySelector('#gfmImage').value='';thumbs.forEach(x=>x.classList.toggle('active',x.dataset.thumb===selectedThumb));});
 modal.querySelector('#gfmImage').addEventListener('change',async e=>{const file=e.target.files?.[0];if(!file)return;try{selectedImage=await compressFolderImage(file);thumbs.forEach(x=>x.classList.remove('active'));}catch{alert('Không đọc được ảnh thumbnail.');}});
 modal.querySelector('#gfmPdf').addEventListener('change',e=>{selectedFile=e.target.files?.[0]||null;});
 modal.querySelector('#gfmSave').addEventListener('click',async()=>{
   const name=modal.querySelector('#gfmName').value.trim();if(!name){alert('Tên tài liệu không được để trống.');return}
   if(selectedFile&&selectedFile.type!=='application/pdf'&&!/\.pdf$/i.test(selectedFile.name)){alert('Vui lòng chọn file PDF.');return}
   if(selectedFile)await saveGrammarPdfBlob(id,selectedFile);
   updateGrammarFolder(id,{name,thumb:selectedThumb,image:selectedImage,fileName:selectedFile?.name||folder.fileName,fileSize:selectedFile?.size||folder.fileSize,updatedAt:new Date().toISOString()});
   modal.remove();renderFolderHome();
 });
 modal.querySelector('#gfmCancel').addEventListener('click',()=>modal.remove());
 modal.querySelector('#gfmClose').addEventListener('click',()=>modal.remove());
 modal.addEventListener('click',e=>{if(e.target===modal)modal.remove()});
 modal.querySelector('#gfmDelete').addEventListener('click',async()=>{if(!confirm('Xóa "'+folder.name+'" khỏi thư viện? Lý thuyết đã tổng hợp vẫn được giữ.'))return;deleteGrammarFolder(id);await deleteGrammarPdfBlob(id);modal.remove();renderFolderHome()});
}
function openAddPdfManager(){
 closeFolderOverlays();
 const modal=document.createElement('div');modal.className='grammar-folder-modal';modal.id='grammarAddPdf';
 modal.innerHTML='<div class="grammar-folder-modal-card"><div class="grammar-folder-modal-head"><div><div class="grammar-folder-eyebrow">NEW PDF SOURCE</div><h2>Thêm tài liệu PDF</h2><p>Thêm file PDF vào kho. Sau khi có dữ liệu phân tích, tài liệu có thể được nối với bộ lý thuyết tương ứng.</p></div><button type="button" class="secondary" id="gapClose">×</button></div>'+
 '<div class="grammar-folder-field"><label for="gapFile">File PDF</label><input type="file" id="gapFile" accept="application/pdf,.pdf"></div>'+
 '<div class="grammar-folder-field"><label for="gapName">Tên hiển thị</label><input id="gapName" maxlength="100" placeholder="Ví dụ: English Grammar in Use"></div>'+
 '<div class="grammar-folder-field"><label>Thumbnail</label><div class="grammar-thumb-options">'+FOLDER_THUMBNAILS.map(x=>'<button type="button" class="grammar-thumb-option '+(x==='📘'?'active':'')+'" data-add-thumb="'+esc(x)+'">'+esc(x)+'</button>').join('')+'</div></div>'+
 '<div class="grammar-folder-field"><label>Ảnh thumbnail</label><input type="file" id="gapImage" accept="image/*"></div>'+
 '<div class="grammar-folder-modal-actions"><div></div><div class="grammar-folder-modal-right"><button type="button" class="secondary" id="gapCancel">Hủy</button><button type="button" id="gapSave">＋ Thêm tài liệu</button></div></div></div>';
 document.body.appendChild(modal);
 let selectedThumb='📘',selectedImage='',selectedFile=null;
 modal.querySelector('#gapFile').addEventListener('change',e=>{selectedFile=e.target.files?.[0]||null;if(selectedFile&&!modal.querySelector('#gapName').value.trim())modal.querySelector('#gapName').value=inferPdfName(selectedFile.name);});
 modal.querySelectorAll('[data-add-thumb]').forEach(btn=>btn.addEventListener('click',()=>{selectedThumb=btn.dataset.addThumb;selectedImage='';modal.querySelectorAll('[data-add-thumb]').forEach(x=>x.classList.toggle('active',x===btn));}));
 modal.querySelector('#gapImage').addEventListener('change',async e=>{const file=e.target.files?.[0];if(!file)return;try{selectedImage=await compressFolderImage(file);modal.querySelectorAll('[data-add-thumb]').forEach(x=>x.classList.remove('active'));}catch{alert('Không đọc được ảnh thumbnail.');}});
 const close=()=>modal.remove();
 modal.querySelector('#gapCancel').addEventListener('click',close);modal.querySelector('#gapClose').addEventListener('click',close);modal.addEventListener('click',e=>{if(e.target===modal)close()});
 modal.querySelector('#gapSave').addEventListener('click',async()=>{
   if(!selectedFile||(!selectedFile.type||selectedFile.type!=='application/pdf')&&!/\.pdf$/i.test(selectedFile.name)){alert('Hãy chọn một file PDF.');return}
   const name=modal.querySelector('#gapName').value.trim()||inferPdfName(selectedFile.name);
   const id='src-pdf-'+Date.now()+'-'+Math.random().toString(36).slice(2,8);
   const record=addGrammarFolder({id,name,fileName:selectedFile.name,fileSize:selectedFile.size,thumb:selectedThumb,image:selectedImage,hasTheory:false,theoryKey:'',unitCount:0,status:'Chưa tổng hợp'});
   try{await saveGrammarPdfBlob(record.id,selectedFile);}catch{alert('Không lưu được file PDF trong trình duyệt.');return}
   close();renderFolderHome();
 });
}
async function compressFolderImage(file){
 if(!file||!file.type.startsWith('image/'))throw new Error('invalid-image');
 const src=await new Promise((resolve,reject)=>{const fr=new FileReader();fr.onload=()=>resolve(fr.result);fr.onerror=reject;fr.readAsDataURL(file)});
 const img=await new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>resolve(im);im.onerror=reject;im.src=src});
 const maxW=640,maxH=420,scale=Math.min(1,maxW/img.width,maxH/img.height);
 const canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(img.width*scale));canvas.height=Math.max(1,Math.round(img.height*scale));
 canvas.getContext('2d').drawImage(img,0,0,canvas.width,canvas.height);
 return canvas.toDataURL('image/jpeg',.82);
}

function render(){
 const root=$('grammarScreen');if(!root)return;
 if(state.view==='home'){renderFolderHome();return;}
 const s=getGrammarStats(state.progress),rows=visible();
 if(!rows.some(x=>x.unit===state.selected)&&rows[0])state.selected=rows[0].unit;
 root.innerHTML=
 '<div class="grammar2-layout"><section class="grammar2-main">'+
 '<div class="grammar2-head"><div><div class="grammar2-eyebrow">ESSENTIAL GRAMMAR IN USE · ELEMENTARY</div><h1>📘 Grammar Learning Hub</h1><p>114 unit được lấy theo đúng thứ tự mục lục của tài liệu, sau đó cô đọng thành công thức 1 dòng + mẹo nhớ + ví dụ.</p></div><div class="grammar2-head-actions"><button type="button" class="secondary" id="grammarFolderHome">← Folders</button><button type="button" class="secondary" id="grammarBack">← Collocation</button><button type="button" id="grammarExercise">📝 Bài tập</button><button type="button" class="secondary" id="grammarQuiz">🎯 Ôn nhanh</button></div></div>'+
 '<div class="grammar2-note"><b>3 bước học:</b> ① đọc công thức → ② nói lại ví dụ → ③ tự đặt 3 câu của bạn. Phần “Mẹo nhớ” là bản tóm tắt dễ học, không phải nguyên văn tài liệu.</div>'+
 '<div class="grammar2-toolbar"><input id="grammarSearch2" value="'+esc(state.query)+'" placeholder="🔎 Tìm unit, chủ đề, công thức hoặc từ khóa..."><select id="grammarChapter2"><option value="all">Tất cả phần</option>'+CHAPTERS.map(c=>'<option value="'+c.id+'" '+(state.chapter===c.id?'selected':'')+'>'+esc(c.range)+' · '+esc(c.title)+'</option>').join('')+'</select><select id="grammarStatus2"><option value="all">Tất cả trạng thái</option><option value="todo" '+(state.status==='todo'?'selected':'')+'>Chưa học</option><option value="done" '+(state.status==='done'?'selected':'')+'>Đã nắm</option></select></div>'+
 '<div class="grammar2-body"><section class="grammar2-list"><div class="grammar2-list-head"><b>'+rows.length+'</b> / '+GRAMMAR_TOPICS.length+' units</div><div class="grammar2-unit-list">'+rows.map(x=>{const done=!!state.progress[x.id]?.done;return '<button type="button" class="grammar2-unit '+(state.selected===x.unit?'selected':'')+'" data-unit="'+x.unit+'"><span class="grammar2-unit-no">'+String(x.unit).padStart(3,'0')+'</span><div><strong>'+esc(x.title)+'</strong><small>'+esc(x.chapter)+'</small></div><span class="grammar2-unit-check">'+(done?'✓':'')+'</span></button>'}).join('')+(rows.length?'':'<div class="grammar2-empty">Không tìm thấy unit phù hợp.</div>')+'</div></section><section class="grammar2-detail" id="grammarDetail"></section></div>'+
 '</section><aside class="grammar2-side"><div class="grammar2-side-card"><div class="grammar2-side-title"><strong>📊 Tổng quan học tập</strong><span>114 Units</span></div>'+
 '<div class="grammar2-stats"><div><span>Units</span><b>'+s.total+'</b><small>theo tài liệu</small></div><div><span>Đã nắm</span><b>'+s.done+'</b><small>đã đánh dấu</small></div><div><span>Còn lại</span><b>'+s.remaining+'</b><small>chưa hoàn thành</small></div><div class="grammar2-progress"><div><span>Progress</span><b>'+s.percent+'%</b></div><i><em style="width:'+s.percent+'%"></em></i></div></div>'+
 '<div class="grammar2-side-title"><strong>📚 Các phần</strong><span>10 chapters</span></div><div class="grammar2-chapters">'+CHAPTERS.map(c=>{const p=chapterProgress(c.id);return '<button type="button" class="grammar2-chapter '+(state.chapter===c.id?'active':'')+'" data-chapter="'+c.id+'"><span>'+c.range+'</span><strong>'+esc(c.title)+'</strong><small>'+p.done+'/'+p.total+' · '+p.percent+'%</small><i><em style="width:'+p.percent+'%"></em></i></button>'}).join('')+'</div></div></aside><div class="grammar2-side-resizer" id="grammar2SideResizer" role="separator" aria-orientation="vertical" aria-label="Kéo để thay đổi chiều rộng khu vực tổng quan Grammar" tabindex="0" title="Kéo để thay đổi chiều rộng"></div></div>';
 renderDetail();
 bindGrammarResizer();
 $('grammarSearch2').addEventListener('input',e=>{state.query=e.target.value;render()});
 $('grammarChapter2').addEventListener('change',e=>{state.chapter=e.target.value;render()});
 $('grammarStatus2').addEventListener('change',e=>{state.status=e.target.value;render()});
 $('grammarFolderHome').addEventListener('click',()=>{state.view='home';renderFolderHome();window.scrollTo({top:0,behavior:'smooth'});});
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

export function showTheory(unit=state.selected){const root=$('grammarScreen');if(!root)return;document.body.classList.add('grammar-mode');root.hidden=false;state.progress=loadGrammarProgress();state.view='theory';state.selected=Number(unit)||1;state.chapter=CHAPTERS.find(c=>state.selected>=c.start&&state.selected<=c.end)?.id||'all';loadGrammarSidebarWidth();render()}
export function showGrammar(open=true){const root=$('grammarScreen');if(!root)return;document.body.classList.toggle('grammar-mode',open);root.hidden=!open;if(open){state.progress=loadGrammarProgress();state.view='home';renderFolderHome()}}
window.PreviewGrammar={show:showGrammar,showHome:()=>{state.view='home';renderFolderHome()},showTheory,refresh:()=>state.view==='home'?renderFolderHome():render(),getProgress:()=>({...state.progress})};
