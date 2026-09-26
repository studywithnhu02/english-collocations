export const GRAMMAR_FOLDER_KEY='english-collocations-preview-grammar-sources-v2';
export const GRAMMAR_FOLDER_DB='english-collocations-preview-pdf-files-v1';
export const FOLDER_THUMBNAILS=['📘','📗','📙','📕','📒','📔','📓','📚','📝','🎯','🔤','✨','💼','🧠','📂','🗂️'];

export const DEFAULT_GRAMMAR_FOLDERS=[{
 id:'src-english-grammar-in-use',
 type:'pdf',
 name:'English Grammar in Use',
 fileName:'1. ENGLISH GRAMMAR IN USE ELEMENTARY.pdf',
 thumb:'📘',
 image:'',
 deleted:false,
 hasTheory:true,
 theoryKey:'english-grammar-in-use-elementary',
 unitCount:114,
 status:'Đã tổng hợp',
 addedAt:'2026-09-26T00:00:00.000Z',
 updatedAt:'2026-09-26T00:00:00.000Z'
}];

function clone(v){return JSON.parse(JSON.stringify(v))}
function readRaw(){
 try{
   const v=JSON.parse(localStorage.getItem(GRAMMAR_FOLDER_KEY)||'null');
   return Array.isArray(v)?v:null;
 }catch{return null}
}
function normalizeRecord(x){
 return {
   id:String(x?.id||'').trim(),
   type:'pdf',
   name:String(x?.name||'Chưa đặt tên').trim()||'Chưa đặt tên',
   fileName:String(x?.fileName||'').trim(),
   thumb:String(x?.thumb||'📘'),
   image:String(x?.image||''),
   deleted:Boolean(x?.deleted),
   hasTheory:Boolean(x?.hasTheory),
   theoryKey:String(x?.theoryKey||''),
   unitCount:Number.isFinite(Number(x?.unitCount))?Number(x.unitCount):0,
   status:String(x?.status||'Chưa tổng hợp'),
   addedAt:String(x?.addedAt||new Date().toISOString()),
   updatedAt:String(x?.updatedAt||new Date().toISOString())
 };
}
function migrateOldChapterFolders(saved){
 if(!Array.isArray(saved)||!saved.length)return null;
 if(!saved.some(x=>x&&x.chapterId))return saved.map(normalizeRecord);
 const first=saved.find(x=>x&&x.id==='c1')||saved[0]||{};
 const base=clone(DEFAULT_GRAMMAR_FOLDERS[0]);
 if(first.image)base.image=first.image;
 if(first.thumb)base.thumb=first.thumb;
 const migrated=[base];
 localStorage.setItem(GRAMMAR_FOLDER_KEY,JSON.stringify(migrated));
 return migrated;
}
export function loadGrammarFolderAll(){
 const saved=readRaw();
 if(!saved){return clone(DEFAULT_GRAMMAR_FOLDERS)}
 return (migrateOldChapterFolders(saved)||[]).map(normalizeRecord);
}
export function loadGrammarFolders(){
 return loadGrammarFolderAll().filter(x=>!x.deleted);
}
export function saveGrammarFolders(folders){
 localStorage.setItem(GRAMMAR_FOLDER_KEY,JSON.stringify((folders||[]).map(normalizeRecord)));
}
export function updateGrammarFolder(id,patch){
 const all=loadGrammarFolderAll();
 const next=all.map(x=>x.id===id?normalizeRecord({...x,...patch,updatedAt:new Date().toISOString()}):x);
 if(!all.some(x=>x.id===id))next.push(normalizeRecord({id,...patch,updatedAt:new Date().toISOString()}));
 saveGrammarFolders(next);return loadGrammarFolders();
}
export function deleteGrammarFolder(id){
 const all=loadGrammarFolderAll().map(x=>x.id===id?{...x,deleted:true,updatedAt:new Date().toISOString()}:x);
 saveGrammarFolders(all);return loadGrammarFolders();
}
export function restoreAllGrammarFolders(){
 const all=loadGrammarFolderAll().map(x=>({...x,deleted:false,updatedAt:new Date().toISOString()}));
 saveGrammarFolders(all);return loadGrammarFolders();
}
export function addGrammarFolder(meta){
 const all=loadGrammarFolderAll();
 const id=String(meta?.id||('src-pdf-'+Date.now()));
 const record=normalizeRecord({...meta,id,addedAt:new Date().toISOString(),updatedAt:new Date().toISOString(),deleted:false});
 saveGrammarFolders([...all,record]);
 return record;
}

let dbPromise=null;
function openPdfDb(){
 if(!('indexedDB' in window))return Promise.reject(new Error('indexedDB-unavailable'));
 if(dbPromise)return dbPromise;
 dbPromise=new Promise((resolve,reject)=>{
   const req=indexedDB.open(GRAMMAR_FOLDER_DB,1);
   req.onupgradeneeded=()=>{if(!req.result.objectStoreNames.contains('files'))req.result.createObjectStore('files')};
   req.onsuccess=()=>resolve(req.result);
   req.onerror=()=>reject(req.error||new Error('indexedDB-open-failed'));
 });
 return dbPromise;
}
export async function saveGrammarPdfBlob(id,file){
 const db=await openPdfDb();
 await new Promise((resolve,reject)=>{
   const tx=db.transaction('files','readwrite'),store=tx.objectStore('files');
   store.put(file,id);tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error||new Error('indexedDB-write-failed'));tx.onabort=()=>reject(tx.error||new Error('indexedDB-write-aborted'));
 });
}
export async function deleteGrammarPdfBlob(id){
 try{
   const db=await openPdfDb();
   await new Promise((resolve,reject)=>{
     const tx=db.transaction('files','readwrite');tx.objectStore('files').delete(id);tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error||new Error('indexedDB-delete-failed'));
   });
 }catch{}
}
export async function getGrammarPdfBlob(id){
 const db=await openPdfDb();
 return new Promise((resolve,reject)=>{
   const tx=db.transaction('files','readonly'),req=tx.objectStore('files').get(id);
   req.onsuccess=()=>resolve(req.result||null);req.onerror=()=>reject(req.error||new Error('indexedDB-read-failed'));
 });
}
