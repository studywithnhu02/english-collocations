import {CHAPTERS} from './grammar-core.mjs';

export const GRAMMAR_FOLDER_KEY='english-collocations-preview-grammar-folders-v1';
export const FOLDER_THUMBNAILS=['📘','📗','📙','📕','📒','📔','📓','📚','📝','🎯','🔤','✨','💼','🧠','📂','🗂️'];

export const DEFAULT_GRAMMAR_FOLDERS=CHAPTERS.map((chapter,index)=>({
 id:chapter.id,
 chapterId:chapter.id,
 name:chapter.title,
 range:chapter.range,
 thumb:FOLDER_THUMBNAILS[index%FOLDER_THUMBNAILS.length],
 image:'',
 deleted:false
}));

function cloneDefault(){return DEFAULT_GRAMMAR_FOLDERS.map(x=>({...x}))}
function readRaw(){try{const v=JSON.parse(localStorage.getItem(GRAMMAR_FOLDER_KEY)||'null');return Array.isArray(v)?v:null}catch{return null}}

export function loadGrammarFolders(){
 const saved=readRaw();
 const base=cloneDefault();
 if(!saved)return base;
 const byId=new Map(saved.filter(x=>x&&x.id).map(x=>[x.id,x]));
 return base.map(item=>({
   ...item,
   ...(byId.get(item.id)||{})
 })).filter(x=>!x.deleted);
}

export function loadGrammarFolderAll(){
 const saved=readRaw();
 const base=cloneDefault();
 if(!saved)return base;
 const byId=new Map(saved.filter(x=>x&&x.id).map(x=>[x.id,x]));
 return base.map(item=>({...item,...(byId.get(item.id)||{})}));
}

export function saveGrammarFolders(folders){localStorage.setItem(GRAMMAR_FOLDER_KEY,JSON.stringify((folders||[]).map(x=>({...x}))));}

export function upsertGrammarFolder(folder){
 const all=loadGrammarFolderAll();
 const next=all.map(x=>x.id===folder.id?{...x,...folder}:x);
 saveGrammarFolders(next);
 return loadGrammarFolders();
}

export function updateGrammarFolder(folderId,patch){
 const all=loadGrammarFolderAll();
 const found=all.find(x=>x.id===folderId);
 if(!found)return loadGrammarFolders();
 saveGrammarFolders(all.map(x=>x.id===folderId?{...x,...patch}:x));
 return loadGrammarFolders();
}

export function deleteGrammarFolder(folderId){
 const all=loadGrammarFolderAll();
 saveGrammarFolders(all.map(x=>x.id===folderId?{...x,deleted:true}:x));
 return loadGrammarFolders();
}

export function restoreGrammarFolder(folderId){
 return updateGrammarFolder(folderId,{deleted:false});
}

export function restoreAllGrammarFolders(){
 const next=loadGrammarFolderAll().map(x=>({...x,deleted:false}));
 saveGrammarFolders(next);
 return loadGrammarFolders();
}

export function getGrammarFolderByChapter(folders,chapterId){
 return (folders||[]).find(x=>x.chapterId===chapterId)||null;
}
