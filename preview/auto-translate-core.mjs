export const TRANSLATION_TARGETS = Object.freeze({ c: 'm', e: 'em' });

export function normalize(value){
  return String(value ?? '').replace(/\s+/g,' ').trim();
}

export function hasTranslatableText(value){
  return /[A-Za-zÀ-ž]/.test(normalize(value));
}

export function translationKey(id,field){
  return String(id)+'::'+String(field);
}

export function targetFieldFor(sourceField){
  return TRANSLATION_TARGETS[sourceField] || null;
}

export function isStale(currentVersion,requestVersion){
  return Number(currentVersion)!==Number(requestVersion);
}

export function sourceMatches(current,expected){
  return normalize(current)===normalize(expected);
}

export function mergeTranslationRow(rows,id,sourceField,sourceText,targetText){
  const targetField=targetFieldFor(sourceField);
  if(!targetField) return {rows,changed:false};
  const key=String(id);
  let changed=false;
  const next=rows.map(row=>{
    if(String(row?.id)!==key) return row;
    const copy={...row};
    const normalizedSource=normalize(sourceText),normalizedTarget=normalize(targetText);
    if(copy[sourceField]!==normalizedSource){copy[sourceField]=normalizedSource;changed=true;}
    if(copy[targetField]!==normalizedTarget){copy[targetField]=normalizedTarget;changed=true;}
    return copy;
  });
  return {rows:next,changed};
}

export function shouldTranslate(sourceField,text){
  return !!targetFieldFor(sourceField) && hasTranslatableText(text);
}
