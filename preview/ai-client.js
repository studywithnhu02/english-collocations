let worker=null,sequence=0;
function getWorker(){return worker||(worker=new Worker('./ai-agent-worker.js?v=11',{type:'module'}))}
export function aiJson(messages,options={}){
  return new Promise((resolve,reject)=>{
    const id=++sequence,w=getWorker(),fn=e=>{
      if(e.data?.id!==id)return;
      if(e.data?.type==='status')return;
      w.removeEventListener('message',fn);
      e.data.ok?resolve(e.data.text):reject(new Error(e.data.error||'AI unavailable'));
    };
    w.addEventListener('message',fn);
    w.postMessage({id,batch:Boolean(options.batch??true),messages,options});
  });
}
window.PreviewAI={json:aiJson};
