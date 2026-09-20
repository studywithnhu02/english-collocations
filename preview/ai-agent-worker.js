import { pipeline } from 'https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.8.1';
const MODEL_ID='onnx-community/Qwen2.5-0.5B-Instruct';
let pipePromise=null;
async function getPipe(){
  if(!pipePromise){
    self.postMessage({type:'status',stage:'loading',message:'Đang tải AI model lần đầu…'});
    pipePromise=pipeline('text-generation',MODEL_ID,{device:'webgpu',dtype:'q4'})
      .then(p=>{self.postMessage({type:'status',stage:'ready',message:'WebGPU sẵn sàng'});return p})
      .catch(async()=>{self.postMessage({type:'status',stage:'fallback',message:'WebGPU không khả dụng · chuyển sang WASM/CPU'});return pipeline('text-generation',MODEL_ID,{dtype:'q4'})});
  }
  return pipePromise;
}
function cleanGenerated(text){
  let s=String(text||'').trim();
  if(s.includes('assistant:'))s=s.split('assistant:').pop().trim();
  try{const m=s.match(/\{[\s\S]*\}/);if(m){const j=JSON.parse(m[0]);if(j.translatedText)s=String(j.translatedText).trim()}}catch{}
  s=s.replace(/^```(?:json|text)?\s*/i,'').replace(/\s*```$/,'').trim();
  return s;
}
self.onmessage=async({data})=>{
  const{id,messages=[],batch=false}=data||{};
  try{
    const pipe=await getPipe();
    self.postMessage({id,type:'status',stage:'inference',message:batch?'Đang phân tích theo batch…':'Đang dịch…'});
    const prompt=messages.map(m=>`${m.role}: ${m.content}`).join('\n\n')+'\n\nassistant:';
    const out=await pipe(prompt,{max_new_tokens:batch?512:96,temperature:0.05,do_sample:false,repetition_penalty:1.15,no_repeat_ngram_size:3});
    const raw=out?.[0]?.generated_text||'';
    const answer=cleanGenerated(raw);
    self.postMessage({id,ok:true,text:answer});
  }catch(e){self.postMessage({id,ok:false,error:e?.message||String(e)})}
};
