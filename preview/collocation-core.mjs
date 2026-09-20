export function normalizeCollocation(value){
  return String(value??'').normalize('NFKC').replace(/\s+/g,' ').trim().toLocaleLowerCase('en-US');
}

export function findDuplicateCollocation(rows,value,ignoreId=null){
  const normalized=normalizeCollocation(value);
  if(!normalized)return null;
  const ignore=ignoreId==null?'':String(ignoreId);
  for(const row of Array.isArray(rows)?rows:[]){
    if(String(row?.id??'')===ignore)continue;
    if(normalizeCollocation(row?.c)===normalized)return row;
  }
  return null;
}

export function hasDuplicateCollocation(rows,value,ignoreId=null){
  return Boolean(findDuplicateCollocation(rows,value,ignoreId));
}
