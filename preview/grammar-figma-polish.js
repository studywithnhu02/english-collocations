/* ENGOOD Figma parity pass — spacing, padding and geometry for Grammar workspace. */
const STYLE_ID='grammar-figma-parity-v1';
function inject(){
  if(document.getElementById(STYLE_ID)) return;
  const style=document.createElement('style');
  style.id=STYLE_ID;
  style.textContent=`
body.grammar-mode{background:#f7f7f7!important;color:#171717!important}
body.grammar-mode .app{padding:0!important;gap:0!important}
body.grammar-mode .left-nav{width:240px!important;padding:0 1px 0 0!important;background:#fbfbfb!important;border-right:1px solid rgba(229,229,229,.8)!important;box-shadow:none!important;gap:0!important}
body.grammar-mode .left-nav-top{gap:0!important}
body.grammar-mode .left-nav-brand{height:56px!important;min-height:56px!important;padding:0 16px!important;border-bottom:1px solid rgba(229,229,229,.6)!important;gap:10px!important}
body.grammar-mode .left-nav-logo{width:28px!important;height:28px!important;border-radius:6px!important;background:#171717!important;box-shadow:none!important;font-size:12px!important}
body.grammar-mode .left-nav-brand-text{font-size:14px!important;font-weight:600!important;color:#171717!important}
body.grammar-mode .left-nav-collapse{height:31px!important;min-height:31px!important;margin:12px 12px 0!important;width:calc(100% - 24px)!important;padding:7px 9px!important;background:#fff!important;border:1px solid rgba(229,229,229,.7)!important;border-radius:6px!important;box-shadow:0 1px 1px rgba(0,0,0,.03)!important;color:#737373!important;font-size:12px!important}
body.grammar-mode .left-nav-collapse:hover{background:#fafafa!important;color:#171717!important}
body.grammar-mode .left-nav-collapse span:first-child{font-size:14px!important;line-height:16px!important}
body.grammar-mode .left-nav-section{padding:12px 20px 4px!important;color:#a3a3a3!important;font-size:11px!important;letter-spacing:.275px!important}
body.grammar-mode .left-nav-item{min-height:28px!important;height:28px!important;padding:6px 10px!important;margin:0 10px!important;width:calc(100% - 20px)!important;border-radius:6px!important;color:#525252!important;font-size:12px!important;font-weight:500!important;gap:10px!important}
body.grammar-mode .left-nav-item.active{background:rgba(229,229,229,.6)!important;color:#171717!important;border-color:transparent!important}
body.grammar-mode .left-nav-icon{width:16px!important;font-size:14px!important}
body.grammar-mode .left-nav-foot{padding:13px 16px 12px!important;color:#737373!important;border-top:1px solid rgba(229,229,229,.6)!important;font-size:11px!important}
body.grammar-mode.nav-expanded .app{width:calc(100% - 240px)!important;margin-left:240px!important}
body.grammar-mode.nav-collapsed .app{width:calc(100% - 68px)!important;margin-left:68px!important}
body.grammar-mode .grammar-screen{min-height:100vh!important;padding:0!important;background:#fff!important}
body.grammar-mode .grammar2-layout{display:grid!important;grid-template-columns:288px minmax(0,1fr)!important;grid-template-rows:59px minmax(0,1fr)!important;gap:0!important;min-height:100vh!important;background:#fff!important}
body.grammar-mode .grammar2-head{grid-column:1/-1!important;grid-row:1!important;width:auto!important;height:59px!important;min-height:59px!important;margin:0!important;padding:8px 8px!important;border-bottom:1px solid rgba(229,229,229,.8)!important;background:#fff!important;display:flex!important;align-items:center!important;justify-content:space-between!important;gap:24px!important}
body.grammar-mode .grammar2-head-copy{min-width:0!important;display:flex!important;flex-direction:column!important;gap:2px!important}
body.grammar-mode .grammar2-breadcrumb{height:16px!important;gap:8px!important}
body.grammar-mode .grammar2-breadcrumb span:first-child{font:700 10px/16px SFMono-Regular,Consolas,monospace!important;letter-spacing:.5px!important;color:#525252!important}
body.grammar-mode .grammar2-breadcrumb span:not(:first-child){font:500 11px/16px Inter,system-ui,sans-serif!important;color:#737373!important}
body.grammar-mode .grammar2-title-row{height:24px!important;gap:10px!important}
body.grammar-mode .grammar2-title-row h1{font:600 16px/24px Inter,system-ui,sans-serif!important;letter-spacing:-.4px!important;color:#171717!important}
body.grammar-mode .grammar2-title-divider{font:400 16px/24px Inter,system-ui,sans-serif!important;color:#d4d4d4!important}
body.grammar-mode .grammar2-title-row p{font:400 12px/16px Inter,system-ui,sans-serif!important;color:#737373!important;max-width:576px!important}
body.grammar-mode .grammar2-head-actions{gap:8px!important}
body.grammar-mode .grammar2-head-actions button{height:30px!important;min-height:30px!important;padding:7px 11px!important;border:1px solid #e5e5e5!important;border-radius:6px!important;background:#fff!important;color:#525252!important;font:500 12px/16px Inter,system-ui,sans-serif!important;box-shadow:0 1px 1px rgba(0,0,0,.03)!important}
body.grammar-mode .grammar2-head-actions #grammarExercise{background:#171717!important;color:#fff!important;border-color:#171717!important}
body.grammar-mode .grammar2-note{display:none!important}
body.grammar-mode .grammar2-body{grid-column:1/-1!important;grid-row:2!important;display:grid!important;grid-template-columns:288px minmax(0,1fr)!important;gap:0!important;min-width:0!important;min-height:0!important;background:#fff!important}
body.grammar-mode .grammar2-rail{grid-column:1!important;height:calc(100vh - 59px)!important;min-width:0!important;overflow:auto!important;background:#fff!important;border-right:1px solid rgba(229,229,229,.8)!important}
body.grammar-mode .grammar2-overview{height:272px!important;padding:8px!important;background:#fff!important}
body.grammar-mode .grammar2-section-title{height:21px!important;margin-bottom:8px!important}
body.grammar-mode .grammar2-section-title strong{font:600 12px/16px Inter,system-ui,sans-serif!important;letter-spacing:.6px!important;color:#171717!important}
body.grammar-mode .grammar2-section-title span{height:21px!important;padding:3px 9px!important;border:1px solid rgba(229,229,229,.7)!important;border-radius:4px!important;background:#fff!important;font:400 10px/15px SFMono-Regular,Consolas,monospace!important;color:#737373!important}
body.grammar-mode .grammar2-stat-grid{gap:8px!important}
body.grammar-mode .grammar2-stat{height:89px!important;min-height:89px!important;padding:17.5px 11px 11px!important;border:1px solid rgba(229,229,229,.7)!important;border-radius:6px!important;background:#fafafa!important}
body.grammar-mode .grammar2-stat span{font:500 10px/15px Inter,system-ui,sans-serif!important;letter-spacing:.5px!important;color:#a3a3a3!important}
body.grammar-mode .grammar2-stat b{margin-top:2px!important;font:600 16px/24px SFMono-Regular,Consolas,monospace!important;color:#171717!important}
body.grammar-mode .grammar2-stat b em{font:400 12px/16px SFMono-Regular,Consolas,monospace!important;color:#a3a3a3!important}
body.grammar-mode .grammar2-stat small{font:400 10px/15px Inter,system-ui,sans-serif!important;color:#a3a3a3!important}
body.grammar-mode .grammar2-remaining{height:66px!important;min-height:66px!important;margin-top:8px!important;padding:11px!important;border:1px solid rgba(229,229,229,.7)!important;border-radius:6px!important;background:#fafafa!important}
body.grammar-mode .grammar2-progress-card{height:54px!important;min-height:54px!important;margin-top:8px!important;padding:15px 11px 11px!important;border:1px solid rgba(229,229,229,.7)!important;border-radius:6px!important;background:#fafafa!important}
body.grammar-mode .grammar2-toc{border-top:1px solid rgba(229,229,229,.8)!important}
body.grammar-mode .grammar2-toc-head{height:38px!important;padding:11px 10px!important;border-bottom:1px solid rgba(229,229,229,.8)!important}
body.grammar-mode .grammar2-toc-controls{height:96px!important;padding:10px!important;border-bottom:1px solid rgba(229,229,229,.8)!important}
body.grammar-mode .grammar2-toc-controls input{height:33px!important;padding:10px 37px 10px 29px!important;border:1px solid #e5e5e5!important;border-radius:6px!important;background:rgba(250,250,250,.8)!important;font:400 11px/normal Inter,system-ui,sans-serif!important}
body.grammar-mode .grammar2-filter-row{gap:6px!important;margin-top:8px!important}
body.grammar-mode .grammar2-filter-row select{height:34px!important;padding:5px 25px 5px 9px!important;border:1px solid #e5e5e5!important;border-radius:6px!important;background:rgba(250,250,250,.8)!important;font:500 11px/18px Inter,system-ui,sans-serif!important}
body.grammar-mode .grammar2-chapter-summary{height:48.5px!important;padding:10px!important;border-bottom:1px solid rgba(229,229,229,.8)!important;background:#fff!important}
body.grammar-mode .grammar2-unit-list{height:auto!important;max-height:none!important;padding:0!important;overflow:visible!important;background:#fff!important}
body.grammar-mode .grammar2-unit-group{border-bottom:1px solid rgba(229,229,229,.8)!important;background:#fff!important}
body.grammar-mode .grammar2-unit-group-toggle{min-height:49.5px!important;height:49.5px!important;padding:10px!important;border:0!important;border-radius:0!important;border-top:1px solid #f5f5f5!important;background:#fff!important}
body.grammar-mode .grammar2-unit-group-heading{gap:8px!important}
body.grammar-mode .grammar2-unit-group-chevron{width:14px!important;height:14px!important;font-size:12px!important}
body.grammar-mode .grammar2-unit-group-range{font:400 10px/12.5px SFMono-Regular,Consolas,monospace!important;color:#a3a3a3!important}
body.grammar-mode .grammar2-unit-group-title{font:500 12px/16px Inter,system-ui,sans-serif!important;color:#404040!important;max-width:205px!important}
body.grammar-mode .grammar2-unit-group-meta{font:400 10px/15px SFMono-Regular,Consolas,monospace!important;color:#a3a3a3!important}
body.grammar-mode .grammar2-unit-group-items{display:block!important}
body.grammar-mode .grammar2-unit-group.is-collapsed .grammar2-unit-group-items{display:none!important}
body.grammar-mode .grammar2-unit{height:55.5px!important;min-height:55.5px!important;padding:10px 18px!important;display:grid!important;grid-template-columns:30px minmax(0,1fr)!important;gap:10px!important;margin:0!important;border:0!important;border-left:2px solid rgba(245,245,245,.6)!important;border-top:1px solid rgba(245,245,245,.6)!important;border-radius:0!important;background:#fff!important}
body.grammar-mode .grammar2-unit.selected{background:rgba(245,245,245,.8)!important;border-left-color:#171717!important}
body.grammar-mode .grammar2-unit-no{width:30px!important;height:19px!important;border-radius:4px!important;background:#f5f5f5!important;color:#525252!important;font:500 10px/19px SFMono-Regular,Consolas,monospace!important}
body.grammar-mode .grammar2-unit.selected .grammar2-unit-no{background:#171717!important;color:#fff!important}
body.grammar-mode .grammar2-unit strong{font:500 12px/16px Inter,system-ui,sans-serif!important;color:#262626!important}
body.grammar-mode .grammar2-unit small{margin-top:2px!important;font:400 11px/16.5px Inter,system-ui,sans-serif!important;color:#a3a3a3!important}
body.grammar-mode .grammar2-unit-check{display:none!important}
body.grammar-mode .grammar2-detail{grid-column:2!important;min-width:0!important;min-height:calc(100vh - 59px)!important;position:relative!important;top:auto!important;padding:8px!important;background:#fafafa!important;overflow:auto!important}
body.grammar-mode .grammar2-detail-card{width:100%!important;min-height:calc(100vh - 75px)!important;margin:0!important;padding:0!important;background:#fff!important;border:1px solid rgba(229,229,229,.8)!important;border-radius:8px!important;box-shadow:0 1px 3px rgba(0,0,0,.04)!important;overflow:hidden!important}
body.grammar-mode .grammar2-detail-top{min-height:100px!important;height:100px!important;padding:8px 24px 9px!important;border-bottom:1px solid #f5f5f5!important}
body.grammar-mode .grammar2-unit-badge{height:23px!important;padding:3px 9px!important;border-radius:4px!important;background:#f5f5f5!important;font:600 11px/16.5px SFMono-Regular,Consolas,monospace!important;color:#262626!important}
body.grammar-mode .grammar2-part{font:500 12px/16px SFMono-Regular,Consolas,monospace!important;color:#a3a3a3!important}
body.grammar-mode .grammar2-detail-top h2{font:600 24px/32px Inter,system-ui,sans-serif!important;letter-spacing:-.6px!important;margin:4px 0 0!important;color:#171717!important}
body.grammar-mode .grammar2-detail-top p{font:400 11px/16px Inter,system-ui,sans-serif!important;color:#737373!important;margin:0!important}
body.grammar-mode .grammar2-detail-top>button{height:32px!important;padding:8px 14px!important;border-radius:6px!important;font:500 12px/16px Inter,system-ui,sans-serif!important}
body.grammar-mode .grammar2-focus{margin:0!important;padding:8px 24px 0!important;background:#fff!important}
body.grammar-mode .grammar2-focus>span{margin-bottom:8px!important;font:600 11px/16.5px Inter,system-ui,sans-serif!important;color:#a3a3a3!important;letter-spacing:.55px!important}
body.grammar-mode .grammar2-focus strong{padding:17px!important;border:1px solid rgba(229,229,229,.8)!important;border-radius:6px!important;background:#fafafa!important;font:600 20px/28px SFMono-Regular,Consolas,monospace!important;color:#171717!important}
body.grammar-mode .grammar2-focus small{margin-top:7px!important;font:500 12px/16px Inter,system-ui,sans-serif!important;color:#404040!important}
body.grammar-mode .grammar2-example{margin:18px 24px 0!important;padding:15px!important;border:1px solid rgba(229,229,229,.8)!important;border-radius:6px!important;background:#fff!important}
body.grammar-mode .grammar2-example span{font:600 11px/16px Inter,system-ui,sans-serif!important;color:#737373!important}
body.grammar-mode .grammar2-example p{font:500 12px/16px Inter,system-ui,sans-serif!important;color:#404040!important}
body.grammar-mode .grammar2-exercise-cta{margin:12px 24px 0!important;padding:15px!important;border:1px solid rgba(229,229,229,.8)!important;border-radius:6px!important;background:#fff!important}
body.grammar-mode .grammar2-exercise-cta b{font:600 12px/16px Inter,system-ui,sans-serif!important;color:#404040!important}
body.grammar-mode .grammar2-exercise-cta small{font:400 12px/16px Inter,system-ui,sans-serif!important;color:#737373!important}
body.grammar-mode .grammar2-exercise-cta button{height:30px!important;padding:7px 15px!important;border:1px solid rgba(212,212,212,.8)!important;border-radius:6px!important;font:500 12px/16px Inter,system-ui,sans-serif!important}
body.grammar-mode .grammar2-learn{grid-template-columns:1fr!important;gap:0!important;margin:10px 24px 0!important}
body.grammar-mode .grammar2-learn>div{min-height:183px!important;padding:15px!important;border:1px solid rgba(229,229,229,.8)!important;border-radius:6px!important;background:#fff!important}
body.grammar-mode .grammar2-learn b{font:600 12px/16px Inter,system-ui,sans-serif!important;color:#171717!important}
body.grammar-mode .grammar2-learn ol{font:400 12px/16px Inter,system-ui,sans-serif!important;color:#525252!important}
body.grammar-mode .grammar2-learn p{font:400 11px/17.88px Inter,system-ui,sans-serif!important;color:#a3a3a3!important}
body.grammar-mode .grammar2-nav{margin:0!important;padding:13px 24px 12px!important;border-top:1px solid rgba(229,229,229,.8)!important;background:rgba(250,250,250,.8)!important}
body.grammar-mode .grammar2-side,.grammar-mode .grammar2-side-resizer{display:none!important}
@media(max-width:900px){body.grammar-mode .grammar2-layout{grid-template-columns:1fr!important;grid-template-rows:auto auto!important}body.grammar-mode .grammar2-body{grid-template-columns:1fr!important}body.grammar-mode .grammar2-rail{height:auto!important;max-height:none!important;border-right:0!important;border-bottom:1px solid #e5e5e5!important}body.grammar-mode .grammar2-detail{min-height:auto!important}body.grammar-mode .grammar2-unit-list{max-height:360px!important;overflow:auto!important}}
@media(max-width:700px){body.grammar-mode .left-nav{display:none!important}body.grammar-mode.nav-expanded .app,body.grammar-mode.nav-collapsed .app{width:100%!important;margin-left:0!important}body.grammar-mode .grammar2-head{height:auto!important;min-height:59px!important;padding:8px 16px!important;flex-direction:column!important;align-items:flex-start!important}body.grammar-mode .grammar2-note{display:none!important}body.grammar-mode .grammar2-detail{padding:8px!important}body.grammar-mode .grammar2-detail-top{height:auto!important;min-height:100px!important;flex-direction:column!important;padding:16px!important}body.grammar-mode .grammar2-focus{padding-inline:16px!important}body.grammar-mode .grammar2-example,body.grammar-mode .grammar2-exercise-cta{margin-inline:16px!important}body.grammar-mode .grammar2-learn{margin-inline:16px!important}body.grammar-mode .grammar2-nav{padding-inline:16px!important}}
`;
  document.head.appendChild(style);
}
function boot(){inject();}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
export {inject};
