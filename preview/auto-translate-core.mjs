export const TRANSLATION_TARGETS=Object.freeze({c:'m',e:'em'});
export function normalize(value){return String(value??'').replace(/\s+/g,' ').trim()}
export function hasTranslatableText(value){return /[A-Za-zÀ-ž]/.test(normalize(value))}
export function translationKey(id,field,exampleIndex=null){return exampleIndex===null||exampleIndex===undefined?String(id)+'::'+String(field):String(id)+'::'+String(field)+'::'+String(exampleIndex)}
export function targetFieldFor(sourceField){return TRANSLATION_TARGETS[sourceField]||null}
export function isStale(currentVersion,requestVersion){return Number(currentVersion)!==Number(requestVersion)}
export function sourceMatches(current,expected){return normalize(current)===normalize(expected)}
export function mergeTranslationRow(rows,id,sourceField,sourceText,targetText,exampleIndex=0){
 const targetField=targetFieldFor(sourceField);if(!targetField)return{rows,changed:false};const key=String(id),index=Math.max(0,Number(exampleIndex)||0);let changed=false;
 const next=rows.map(row=>{
  if(String(row?.id)!==key)return row;
  const copy={...row},normalizedSource=normalize(sourceText),normalizedTarget=normalize(targetText);
  if(sourceField==='e'){
   const examples=Array.isArray(copy.examples)?copy.examples.map(item=>({e:normalize(item?.e??''),em:normalize(item?.em??'')})):[];
   while(examples.length<=index)examples.push({e:'',em:''});
   if(examples[index].e!==normalizedSource){examples[index].e=normalizedSource;changed=true}
   if(examples[index].em!==normalizedTarget){examples[index].em=normalizedTarget;changed=true}
   copy.examples=examples;
   if(index===0){if(copy.e!==normalizedSource){copy.e=normalizedSource;changed=true}if(copy.em!==normalizedTarget){copy.em=normalizedTarget;changed=true}}
   return copy;
  }
  if(copy[sourceField]!==normalizedSource){copy[sourceField]=normalizedSource;changed=true}
  if(copy[targetField]!==normalizedTarget){copy[targetField]=normalizedTarget;changed=true}
  return copy;
 });
 return{rows:next,changed};
}
export function shouldTranslate(sourceField,text){return!!targetFieldFor(sourceField)&&hasTranslatableText(text)}
