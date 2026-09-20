let worker=null,sequence=0;
function getWorker(){return worker||(worker=new Worker('./ai-agent-worker.js?v=12',{type:'module'}))}
export function aiJson(messages,options={}){
  const timeoutMs=Math.max(1000,Number(options.timeoutMs)||20000);
  return new Promise((resolve,reject)=>{
    const id=++sequence,w=getWorker();
    let settled=false,timer;
    const finish=(ok,value)=>{
      if(settled)return;
      settled=true;
      clearTimeout(timer);
      w.removeEventListener('message',onMessage);
      ok?resolve(value):reject(value);
    };
    const onMessage=e=>{
      if(e.data?.id!==id)return;
      if(e.data?.type==='status')return;
      if(e.data.ok)finish(true,e.data.text);
      else finish(false,new Error(e.data.error||'AI unavailable'));
    };
    timer=setTimeout(()=>finish(false,new Error('AI timeout')),timeoutMs);
    w.addEventListener('message',onMessage);
    w.postMessage({id,batch:Boolean(options.batch??true),messages,options});
  });
}
window.PreviewAI={json:aiJson};
