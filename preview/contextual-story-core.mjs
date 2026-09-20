export const STORY_MODES=Object.freeze({paragraph:'paragraph',dialogue:'dialogue'});

export function validateStorySelection(rows){
  const list=Array.isArray(rows)?rows:[];
  if(list.length<3)return{ok:false,message:'Hãy chọn ít nhất 3 collocation.'};
  if(list.length>5)return{ok:false,message:'Chỉ chọn tối đa 5 collocation.'};
  if(list.some(row=>!String(row?.c??'').trim()))return{ok:false,message:'Mỗi dòng đã chọn phải có collocation.'};
  const seen=new Set();
  for(const row of list){const key=String(row.c).trim().toLocaleLowerCase('en-US');if(seen.has(key))return{ok:false,message:'Các collocation được chọn không được trùng nhau.'};seen.add(key)}
  return{ok:true,message:''};
}

function lengthPlan(count,mode){
  return mode===STORY_MODES.dialogue?{lines:count*2,description:count*2+' short lines, alternating between Speaker A and Speaker B'}:{min:count*18,max:count*24,description:count+' collocation × about 18–24 words each'};
}

export function buildStoryPrompt(rows,mode=STORY_MODES.paragraph){
  const validation=validateStorySelection(rows);
  if(!validation.ok)throw new Error(validation.message);
  const selected=rows.map((row,index)=>({index:index+1,collocation:String(row.c).trim(),topic:String(row.t??'').trim(),meaning:String(row.m??'').trim()}));
  const plan=lengthPlan(selected.length,mode);
  const format=mode===STORY_MODES.dialogue?'Write EXACTLY '+plan.lines+' short workplace dialogue lines. Alternate Speaker A and Speaker B. Every line must start with “A:” or “B:”.':'Write ONE short workplace paragraph of '+plan.min+'–'+plan.max+' words.';
  return 'You are an English-learning writer for Vietnamese professionals in UI/UX, technology, insurance and banking.\n'+format+'\n'+'Use EVERY supplied collocation exactly as written at least once. Do not change tense, word order, spelling, or split a collocation.\n'+'The selected collocations are the required vocabulary focus. Every sentence/line must naturally support one or more of them. Do not introduce unrelated stories or filler.\n'+'Use simple A2-B1 vocabulary, short sentences, and practical work situations. Avoid idioms, slang, academic wording, explanations, labels other than A:/B: in dialogue, or bullet points. Return ONLY the finished English text.\n'+'Selected collocations: '+JSON.stringify(selected)+'\n'+'Length rule: '+plan.description+'.';
}

export function cleanStoryText(text){return String(text??'').replace(/^```(?:text|markdown)?\s*/i,'').replace(/\s*```$/,'').replace(/^assistant:\s*/i,'').trim();}

export function storyCoverage(text,rows){const value=String(text??'').toLocaleLowerCase('en-US');return (Array.isArray(rows)?rows:[]).map(row=>String(row?.c??'').trim()).filter(Boolean).filter(collocation=>value.includes(collocation.toLocaleLowerCase('en-US')));}