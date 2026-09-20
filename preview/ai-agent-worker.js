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
self.onmessage=async({data})=>{
  const{id,messages=[],batch=false}=data||{};
  try{
    const pipe=await getPipe();
    self.postMessage({id,type:'status',stage:'inference',message:batch?'Đang phân tích theo batch…':'Đang phân tích…'});
    const prompt=messages.map(m=>`${m.role}: ${m.content}`).join('\n\n')+'\n\nassistant:';
    const out=await pipe(prompt,{max_new_tokens:batch?768:384,temperature:0.15,do_sample:false});
    const text=out?.[0]?.generated_text||'';
    const answer=text.includes('assistant:')?text.split('assistant:').pop().trim():String(text).trim();
    self.postMessage({id,ok:true,text:answer});
  }catch(e){self.postMessage({id,ok:false,error:e?.message||String(e)})}
};
