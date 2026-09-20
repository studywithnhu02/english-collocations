import { pipeline } from 'https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.8.1';
const MODEL_ID='onnx-community/Qwen2.5-0.5B-Instruct';
let pipePromise=null;
async function getPipe(){if(!pipePromise){pipePromise=pipeline('text-generation',MODEL_ID,{device:'webgpu',dtype:'q4'}).catch(()=>pipeline('text-generation',MODEL_ID,{dtype:'q4'}))}return pipePromise}
self.onmessage=async({data})=>{const{id,messages=[]}=data||{};try{const pipe=await getPipe();const prompt=messages.map(m=>`${m.role}: ${m.content}`).join('\n\n')+'\n\nassistant:';const out=await pipe(prompt,{max_new_tokens:384,temperature:0.2,do_sample:false});const text=out?.[0]?.generated_text||'';const answer=text.includes('assistant:')?text.split('assistant:').pop().trim():String(text).trim();self.postMessage({id,ok:true,text:answer})}catch(e){self.postMessage({id,ok:false,error:e?.message||String(e)})}};
