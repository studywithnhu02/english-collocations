/* ENGOOD Figma final parity overrides. */
const STYLE_ID='grammar-figma-parity-v2';
function inject(){
  if(document.getElementById(STYLE_ID)) return;
  const style=document.createElement('style');
  style.id=STYLE_ID;
  style.textContent=`
body.grammar-mode .grammar2-detail{padding:8px!important;background:#fafafa!important}
body.grammar-mode .grammar2-detail-card{margin:0!important;width:100%!important}
body.grammar-mode .grammar2-learn{grid-template-columns:1fr!important;gap:0!important;margin:10px 24px 0!important}
body.grammar-mode .grammar2-learn>div:first-child{display:none!important}
body.grammar-mode .grammar2-learn>div:last-child{min-height:183.5px!important;box-sizing:border-box!important}
@media(max-width:700px){
body.grammar-mode .grammar2-detail{padding:8px!important}
body.grammar-mode .grammar2-learn{margin:10px 16px 0!important}
}
`;
  document.head.appendChild(style);
}
function boot(){inject();}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
export {inject};
