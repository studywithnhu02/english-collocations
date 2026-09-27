import { pipeline } from 'https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.8.1';
const MODEL_CONFIG={
  fast:{id:'onnx-community/SmolLM2-135M-Instruct-ONNX-MHA',dtype:'q4f16',label:'Fast AI'},
  quality:{id:'onnx-community/Qwen2.5-0.5B-Instruct',dtype:'q4',label:'Quality AI'}
};
const pipePromises=new Map();
let workQueue=Promise.resolve();
function profileFor(options={},batch=false,story=false){
  const purpose=String(options?.purpose||'');
  return purpose==='autofill'||purpose==='suggestions'||purpose==='suggestion-meanings'?'fast':'quality';
}
async function getPipe(profile='quality'){
  const config=MODEL_CONFIG[profile]||MODEL_CONFIG.quality;
  if(!pipePromises.has(profile)){
    const promise=(async()=>{
      self.postMessage({type:'status',stage:'loading',message:'Đang tải '+config.label+' lần đầu…'});
      try{
        const pipe=await pipeline('text-generation',config.id,{device:'webgpu',dtype:config.dtype});
        self.postMessage({type:'status',stage:'ready',message:config.label+' · WebGPU sẵn sàng'});
        return pipe;
      }catch{
        self.postMessage({type:'status',stage:'fallback',message:config.label+' · chuyển sang WASM/CPU'});
        return pipeline('text-generation',config.id,{dtype:config.dtype});
      }
    })();
    pipePromises.set(profile,promise);
  }
  return pipePromises.get(profile);
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
async function handleMessage(data){
  const{id,messages=[],batch=false,story=false,type,options={}}=data||{};
  if(type==='warmup'){
    try{await getPipe();self.postMessage({type:'warmup-ready'})}catch{}
    return;
  }
  try{
    const purpose=String(options?.purpose||'');
    const profile=profileFor(options,batch,story);
    const pipe=await getPipe(profile);
    const message=purpose==='autofill'?'🧠 Đang tạo nghĩa + câu ví dụ…':purpose==='suggestions'?'📚 Đang mở rộng collocation…':batch?'Đang phân tích theo batch…':'Đang xử lý AI…';
    self.postMessage({id,type:'status',stage:'inference',message});
    const prompt=messages.map(m=>`${m.role}: ${m.content}`).join('\n\n')+'\n\nassistant:';
    const requested=Number(options?.maxNewTokens);
    const fallback=story?176:(batch?384:96);
    const profileCap=profile==='fast'?144:512;
    const maxNewTokens=Math.min(Math.max(Number.isFinite(requested)&&requested>0?requested:fallback,32),profileCap);
    const generation={max_new_tokens:maxNewTokens,temperature:Number(options?.temperature??0.05),do_sample:false,repetition_penalty:1.12,no_repeat_ngram_size:3};
    const out=await pipe(prompt,generation);
    const raw=out?.[0]?.generated_text||'';
    self.postMessage({id,ok:true,text:cleanGenerated(raw)});
  }catch(e){self.postMessage({id,ok:false,error:e?.message||String(e)})}
}
self.onmessage=({data})=>{
  workQueue=workQueue.then(()=>handleMessage(data)).catch(()=>{});
};
