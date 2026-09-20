export const DEFAULT_STATUSES = Object.freeze(['Chưa học','Đang học','Đã học']);

export function normalizeStatus(value){
  return String(value ?? '').replace(/\s+/g,' ').trim();
}

export function uniqueStatuses(values){
  const seen=new Set();
  const result=[];
  for(const value of Array.isArray(values)?values:[]){
    const status=normalizeStatus(value);
    if(!status || seen.has(status)) continue;
    seen.add(status);
    result.push(status);
  }
  return result;
}

export function ensureStatuses(values){
  const statuses=uniqueStatuses(values);
  const result=[...DEFAULT_STATUSES,...statuses.filter(status=>!DEFAULT_STATUSES.includes(status))];
  return result.length?result:[...DEFAULT_STATUSES];
}

export function addStatus(values,status){
  const next=uniqueStatuses(values);
  const normalized=normalizeStatus(status);
  if(!normalized || next.includes(normalized)) return {statuses:next,added:false,status:normalized};
  return {statuses:[...next,normalized],added:true,status:normalized};
}

export function removeStatus(values,status){
  const normalized=normalizeStatus(status);
  if(!normalized) return uniqueStatuses(values);
  return uniqueStatuses(values).filter(value=>value!==normalized);
}

export function setRowStatus(rows,id,status){
  const normalized=normalizeStatus(status);
  const key=String(id);
  let changed=false;
  const next=(Array.isArray(rows)?rows:[]).map(row=>{
    if(String(row?.id)!==key) return row;
    if(normalizeStatus(row?.s)===normalized) return row;
    changed=true;
    return {...row,s:normalized};
  });
  return {rows:next,changed};
}

export function clearStatusFromRows(rows,status){
  const normalized=normalizeStatus(status);
  if(!normalized) return {rows:Array.isArray(rows)?rows:[],changed:false};
  let changed=false;
  const next=(Array.isArray(rows)?rows:[]).map(row=>{
    if(normalizeStatus(row?.s)!==normalized) return row;
    changed=true;
    return {...row,s:''};
  });
  return {rows:next,changed};
}

export function filterByStatus(rows,status){
  const normalized=normalizeStatus(status);
  if(!normalized) return Array.isArray(rows)?rows:[];
  return (Array.isArray(rows)?rows:[]).filter(row=>normalizeStatus(row?.s)===normalized);
}
