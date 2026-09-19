(function(){
  "use strict";
  const FIELD_BY_COL={1:"collocation",2:"meaning_vi",3:"topic",4:"example",5:"example_meaning_vi"};
  let active={};
  let supa=null;

  function findSupabaseConfig(){
    for(const s of document.scripts){
      const t=s.textContent||"";
      const m=t.match(/(https:\/\/[^\s"']+\.supabase\.co)["'\s,)]{1,20}(["'])([A-Za-z0-9._-]{20,})\2/);
      if(m) return {url:m[1],key:m[3]};
      const u=t.match(/https:\/\/([a-z0-9]+)\.supabase\.co/); const k=t.match(/sb_(?:publishable|anon)_[A-Za-z0-9_-]+/);
      if(u&&k) return {url:`https://${u[1]}.supabase.co`,key:k[0]};
    }
    return null;
  }
  function getClient(){
    if(supa) return supa;
    if(!window.supabase?.createClient) return null;
    const c=findSupabaseConfig(); if(!c) return null;
    try{supa=window.supabase.createClient(c.url,c.key);return supa}catch(e){return null}
  }
  async function getUser(){const c=getClient();if(!c)return null;const {data}=await c.auth.getUser();return data?.user||null}
  function cellText(cell){return (cell.innerText||cell.textContent||"").replace(/\s+/g," ").trim()}
  function getRowId(row){
    const btn=row.querySelector('button');
    const s=btn?.getAttribute("onclick")||"";
    const m=s.match(/delete(?:Item|Collocation)\s*\(\s*['"]?([0-9]+)['"]?/i);
    return m?m[1]:null;
  }
  function addActions(row){
    if(row.dataset.inlineReady) return;
    row.dataset.inlineReady="1";
    for(let i=1;i<=5;i++){
      const cell=row.cells[i]; if(!cell) continue;
      cell.contentEditable="true";
      cell.classList.add("inline-editable");
      cell.dataset.field=FIELD_BY_COL[i];
    }
    const actions=row.cells[6]; if(actions){
      const wrap=document.createElement("span"); wrap.className="inline-actions";
      wrap.innerHTML='<button type="button" class="inline-save" style="display:none">💾 Lưu</button><button type="button" class="inline-cancel" style="display:none">Hủy</button>';
      actions.prepend(wrap);
      const save=wrap.querySelector(".inline-save"), cancel=wrap.querySelector(".inline-cancel");
      const key=getRowId(row)||String(Math.random()); row.dataset.inlineKey=key;
      const values=Array.from({length:6},(_,i)=>i?cellText(row.cells[i]):"");
      active[key]={values};
      function dirty(){save.style.display="inline-block";cancel.style.display="inline-block";row.classList.add("inline-dirty");}
      row.querySelectorAll(".inline-editable").forEach(c=>c.addEventListener("input",dirty));
      cancel.addEventListener("click",()=>{const d=active[key];if(d){for(let i=1;i<=5;i++)row.cells[i].textContent=d.values[i]}save.style.display="none";cancel.style.display="none";row.classList.remove("inline-dirty")});
      save.addEventListener("click",()=>saveRow(row,save,cancel));
    }
  }
  async function saveRow(row,save,cancel){
    save.disabled=true; save.textContent="⏳ Lưu...";
    const payload={}; for(let i=1;i<=5;i++)payload[FIELD_BY_COL[i]]=cellText(row.cells[i]);
    try{
      const c=getClient(); if(!c) throw new Error("Không tìm thấy cấu hình Supabase trong trang.");
      const user=await getUser(); if(!user) throw new Error("Phiên đăng nhập đã hết. Hãy đăng nhập lại.");
      const id=getRowId(row);
      let result;
      if(id){
        result=await c.from("collocations").update(payload).eq("id",id).eq("user_id",user.id).select("id").maybeSingle();
      } else {
        const old=active[row.dataset.inlineKey]?.values;
        const found=await c.from("collocations").select("id").eq("user_id",user.id).eq("collocation",old?.[1]||payload.collocation).eq("topic",old?.[3]||payload.topic).eq("example",old?.[4]||payload.example).limit(1).maybeSingle();
        if(found.error) throw found.error;
        if(!found.data) throw new Error("Không xác định được dòng dữ liệu cần lưu.");
        result=await c.from("collocations").update(payload).eq("id",found.data.id).eq("user_id",user.id).select("id").maybeSingle();
      }
      if(result.error) throw result.error;
      save.textContent="✓ Đã lưu"; row.classList.remove("inline-dirty");
      setTimeout(()=>{save.style.display="none";cancel.style.display="none";save.textContent="💾 Lưu";save.disabled=false},900);
    }catch(e){alert("Không lưu được: "+(e.message||e));save.textContent="💾 Lưu";save.disabled=false}
  }
  function enhance(){document.querySelectorAll("#tableBody tr, tbody tr").forEach(addActions)}
  const style=document.createElement("style");style.textContent=`
    .inline-editable{cursor:text;transition:.15s;border-radius:7px}
    .inline-editable:hover{background:rgba(45,120,255,.08);box-shadow:inset 0 0 0 1px rgba(45,120,255,.2)}
    .inline-editable:focus{outline:2px solid #2d78ff;outline-offset:-2px;background:rgba(17,27,41,.8)}
    .inline-dirty{background:rgba(45,120,255,.035)}
    .inline-actions{display:inline-flex;gap:5px;align-items:center}
    .inline-save,.inline-cancel{padding:6px 9px!important;font-size:12px!important;white-space:nowrap}
  `;document.head.appendChild(style);
  const observer=new MutationObserver(enhance);observer.observe(document.body,{childList:true,subtree:true});
  document.addEventListener("keydown",e=>{if(e.key!=="Enter"||e.shiftKey)return;const cell=e.target.closest?.(".inline-editable");if(!cell)return;e.preventDefault();cell.closest("tr")?.querySelector(".inline-save")?.click()});
  setTimeout(enhance,400);setTimeout(enhance,1200);
})();
