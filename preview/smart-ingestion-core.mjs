import {extractJson} from './ai-agent-core.js';

function cleanValue(value,max=320){
  return String(value??'').replace(/\s+/g,' ').trim().slice(0,max);
}
export function parseAutoFillResponse(text){
  try{
    const parsed=extractJson(text);
    const item=Array.isArray(parsed)?(parsed[0]||{}):(parsed?.items?.[0]||parsed||{});
    return {meaningVi:cleanValue(item?.meaningVi,240),exampleEn:cleanValue(item?.exampleEn,320),exampleVi:cleanValue(item?.exampleVi,320)};
  }catch{return{meaningVi:'',exampleEn:'',exampleVi:''}}
}
export function buildAutoFillChanges(row,result){
  const current=row&&typeof row==='object'?row:{},next=result&&typeof result==='object'?result:{},changes={};
  if(!String(current.m||'').trim()&&next.meaningVi)changes.m=next.meaningVi;
  if(!String(current.e||'').trim()&&next.exampleEn)changes.e=next.exampleEn;
  if(!String(current.em||'').trim()&&next.exampleVi)changes.em=next.exampleVi;
  return changes;
}
