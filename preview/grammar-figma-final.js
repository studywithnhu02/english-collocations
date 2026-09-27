/* ENGOOD Figma final spacing pass — keep the 8px document gutter and remove the extra learning card. */
const STYLE_ID='grammar-figma-final-v1';
function injectStyle(){
  if(document.getElementById(STYLE_ID)) return;
  const style=document.createElement('style');
  style.id=STYLE_ID;
  style.textContent=`
body.grammar-mode .grammar2-detail{padding:8px!important;background:#fafafa!important}
body.grammar-mode .grammar2-detail-card{margin:0!important;width:100%!important}
body.grammar-mode .grammar2-learn{margin:10px 24px 0!important;gap:0!important}
body.grammar-mode .grammar2-learn>div:first-child{display:none!important}
body.grammar-mode .grammar2-learn>div:last-child{min-height:183.5px!important;box-sizing:border-box!important}
@media(max-width:700px){
  body.grammar-mode .grammar2-detail{padding:8px!important}
  body.grammar-mode .grammar2-learn{margin:10px 16px 0!important}
}
`;
  document.head.appendChild(style);
}
function pruneLearningCard(root=document){
  if(!document.body.classList.contains('grammar-mode')) return;
  root.querySelectorAll('.grammar2-learn').forEach(learn=>{
    const first=learn.children[0];
    if(first && !first.dataset.figmaPruned){
      first.dataset.figmaPruned='1';
      first.setAttribute('aria-hidden','true');
    }
  });
}
function boot(){
  injectStyle();
  pruneLearningCard();
  const observer=new MutationObserver(()=>pruneLearningCard());
  observer.observe(document.body,{childList:true,subtree:true});
}
if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot,{once:true});
else boot();
