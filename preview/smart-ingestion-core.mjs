import {extractJson} from './ai-agent-core.js';
import {inferStructure,normalizeStructure} from './structure-core.mjs?v=1';

function cleanValue(value,max=320){
  return String(value??'').replace(/\s+/g,' ').trim().slice(0,max);
}
export function parseAutoFillResponse(text){
  try{
    const parsed=extractJson(text);
    const item=Array.isArray(parsed)?(parsed[0]||{}):(parsed?.items?.[0]||parsed||{});
    return {meaningVi:cleanValue(item?.meaningVi,240),exampleEn:cleanValue(item?.exampleEn,320),exampleVi:cleanValue(item?.exampleVi,320),structure:normalizeStructure(item?.structure)};
  }catch{return{meaningVi:'',exampleEn:'',exampleVi:'',structure:''}}
}
export function buildAutoFillChanges(row,result,collocation=''){
  const current=row&&typeof row==='object'?row:{},next=result&&typeof result==='object'?result:{},changes={};
  if(!String(current.m||'').trim()&&next.meaningVi)changes.m=next.meaningVi;
  const validation=validateAutoFillResult(collocation||current.c,next);
  if(!String(current.e||'').trim()&&validation.exampleContainsCollocation)changes.e=next.exampleEn;
  if(!String(current.em||'').trim()&&!String(current.e||'').trim()&&validation.exampleContainsCollocation&&next.exampleVi)changes.em=next.exampleVi;
  const structure=inferStructure(collocation||current.c)||normalizeStructure(next.structure);if(structure)changes.structure=structure;
  return changes;
}


export function validateAutoFillResult(collocation,result){
  const phrase=String(collocation??'').trim().replace(/\s+/g,' ').toLocaleLowerCase('en-US');
  const value=result&&typeof result==='object'?result:{};
  const example=String(value.exampleEn??'').trim();
  const meaning=String(value.meaningVi??'').trim();
  const exampleVi=String(value.exampleVi??'').trim();
  const exampleLower=example.toLocaleLowerCase('en-US');
  return {
    ok:Boolean(phrase&&meaning&&example&&exampleVi&&exampleLower.includes(phrase)),
    hasMeaning:Boolean(meaning),
    hasExample:Boolean(example),
    exampleContainsCollocation:Boolean(phrase&&exampleLower.includes(phrase)),
    hasExampleVi:Boolean(exampleVi)
  };
}
