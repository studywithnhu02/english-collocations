export const DEFAULT_STATUSES=['Chưa học','Đã học'];

export function normalizeStatusName(value){
  return String(value??'').replace(/\s+/g,' ').trim();
}

export function normalizeStatuses(values=DEFAULT_STATUSES){
  const out=[];
  const seen=new Set();
  for(const value of Array.isArray(values)?values:[]){
    const name=normalizeStatusName(value);
    const key=name.toLocaleLowerCase('vi');
    if(!name||seen.has(key))continue;
    seen.add(key);
    out.push(name);
  }
  for(const fallback of DEFAULT_STATUSES){
    const key=fallback.toLocaleLowerCase('vi');
    if(!seen.has(key)){
      seen.add(key);
      out.push(fallback);
    }
  }
  return out;
}

export function addStatus(statuses,name){
  const normalized=normalizeStatusName(name);
  if(!normalized)return {statuses:normalizeStatuses(statuses),added:false,status:''};
  const next=normalizeStatuses(statuses);
  const exists=next.some(x=>x.toLocaleLowerCase('vi')===normalized.toLocaleLowerCase('vi'));
  if(exists)return {statuses:next,added:false,status:next.find(x=>x.toLocaleLowerCase('vi')===normalized.toLocaleLowerCase('vi'))||normalized};
  next.push(normalized);
  return {statuses:next,added:true,status:normalized};
}

export function removeStatus(statuses,name){
  const target=normalizeStatusName(name);
  const defaults=new Set(DEFAULT_STATUSES.map(x=>x.toLocaleLowerCase('vi')));
  const next=normalizeStatuses(statuses);
  if(!target||defaults.has(target.toLocaleLowerCase('vi')))return {statuses:next,removed:false,status:''};
  const kept=next.filter(x=>x.toLocaleLowerCase('vi')!==target.toLocaleLowerCase('vi'));
  return {statuses:kept,removed:kept.length!==next.length,status:target};
}

export function setRowStatus(rows,id,status){
  const normalized=normalizeStatusName(status);
  let changed=false;
  const next=rows.map(row=>{
    if(row?.id!==id)return row;
    if(normalizeStatusName(row.status)===normalized)return row;
    changed=true;
    return {...row,status:normalized};
  });
  return {rows:next,changed};
}

export function clearRemovedStatus(rows,status){
  const target=normalizeStatusName(status).toLocaleLowerCase('vi');
  if(!target)return rows;
  return rows.map(row=>{
    if(normalizeStatusName(row.status).toLocaleLowerCase('vi')!==target)return row;
    return {...row,status:''};
  });
}

export function filterRowsByStatus(rows,status){
  const target=normalizeStatusName(status);
  if(!target)return rows;
  return rows.filter(row=>normalizeStatusName(row.status).toLocaleLowerCase('vi')===target.toLocaleLowerCase('vi'));
}

export function mergeStatusesWithRows(statuses,rows){
  const next=normalizeStatuses(statuses);
  for(const row of Array.isArray(rows)?rows:[]){
    const name=normalizeStatusName(row?.status);
    if(!name)continue;
    if(!next.some(x=>x.toLocaleLowerCase('vi')===name.toLocaleLowerCase('vi')))next.push(name);
  }
  return next;
}
