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
  try{
    for(const match of s.matchAll(/[\[{]/g)){
      const start=match.index,open=s[start],close=open==='['?']':'}';
      let depth=0,inString=false,escaped=false;
      for(let i=start;i<s.length;i++){
        const ch=s[i];
        if(inString){
          if(escaped){escaped=false;continue}
          if(ch==='\\'){escaped=true;continue}
          if(ch==='"')inString=false;
          continue;
        }
        if(ch==='"'){inString=true;continue}
        if(ch===open)depth++;
        else if(ch===close){
          depth--;
          if(depth===0){
            const candidate=s.slice(start,i+1);
            try{JSON.parse(candidate);return candidate}catch{}
            break;
          }
        }
      }
    }
  }catch{}
  return s.replace(/^```(?:json|text)?\s*/i,'').replace(/\s*```$/,'').trim();
}
self.onmessage=async({data})=>{
  const{id,messages=[],batch=false,story=false,type,options={}}=data||{};
  if(type==='warmup'){
    try{await getPipe();self.postMessage({type:'warmup-ready'})}catch{}
    return;
  }
  try{
    const pipe=await getPipe();
    const purpose=String(options?.purpose||'');
    const message=purpose==='autofill'?'🧠 Đang tạo nghĩa + câu ví dụ…':purpose==='suggestions'?'📚 Đang mở rộng collocation…':batch?'Đang phân tích theo batch…':'Đang xử lý AI…';
    self.postMessage({id,type:'status',stage:'inference',message});
    const prompt=messages.map(m=>`${m.role}: ${m.content}`).join('\n\n')+'\n\nassistant:';
    const requested=Number(options?.maxNewTokens);
    const fallback=story?176:(batch?384:96);
    const maxNewTokens=Math.min(Math.max(Number.isFinite(requested)&&requested>0?requested:fallback,32),512);
    const generation={max_new_tokens:maxNewTokens,temperature:Number(options?.temperature??0.05),do_sample:false,repetition_penalty:1.15,no_repeat_ngram_size:3};
    const out=await pipe(prompt,generation);
    const raw=out?.[0]?.generated_text||'';
    self.postMessage({id,ok:true,text:cleanGenerated(raw)});
  }catch(e){self.postMessage({id,ok:false,error:e?.message||String(e)})}
};
