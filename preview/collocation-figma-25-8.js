/* Collocation Figma 25:8 — safe DOM adapter for the existing Preview implementation. */
(function(){
  'use strict';
  var root='collocation-figma-25-8', body=document.body, STYLE_HREF='./collocation-figma-25-8.css?v=3';

  function styleLink(){
    if(document.querySelector('link[data-collocation-figma-25-8]'))return;
    var link=document.createElement('link');link.rel='stylesheet';link.href=STYLE_HREF;link.dataset.collocationFigma258='1';
    document.head.appendChild(link);
  }

  function svg(name){
    var paths={
      more:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/></svg>',
      collapse:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="m9 6-6 6 6 6M3 12h18"/></svg>',
      expand:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="m15 6 6 6-6 6"/></svg>',
      search:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="11" cy="11" r="6.7"/><path d="m16.2 16.2 4.2 4.2"/></svg>'
    };
    return paths[name]||'';
  }

  function ensureBody(){
    if(!body) return false;
    styleLink();
    if(body.classList.contains('grammar-mode')){body.classList.remove(root);return false}
    body.classList.add(root);return true;
  }

  function helper(){
    if(document.querySelector('.colloc-helper')) return;
    var brand=document.getElementById('box1');
    if(!brand) return;
    var el=document.createElement('div');
    el.className='colloc-helper';
    el.innerHTML='<div class="colloc-helper-left"><span class="colloc-helper-label">QUẢN LÝ PREVIEW</span><span class="dot"></span><span>Đang xác thực…</span><span class="sep">·</span><span class="colloc-helper-logout" role="button" tabindex="0">Đăng xuất</span><span class="sep">·</span><span>Đang kiểm tra Preview…</span><span class="sep">·</span><span>Đang kiểm tra source GitHub.</span></div><div class="colloc-helper-sync"><span class="sync-dot"></span><span>Local Data Synced</span></div>'
    brand.after(el);
    var logout=el.querySelector('.colloc-helper-logout'),real=document.getElementById('appLogout');
    if(logout&&real){
      var trigger=function(){real.click()};
      logout.addEventListener('click',trigger);
      logout.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();trigger()}});
    }
  }

  function rightExtras(){
    var card=document.querySelector('.analytics-card');
    if(!card||card.dataset.figma258==='1') return;
    card.dataset.figma258='1';
    var head=card.querySelector('.analytics-head'),title=card.querySelector('.analytics-title');
    if(title) title.textContent='TỔNG QUAN HỌC TẬP';
    if(head){
      var more=document.createElement('button');
      more.type='button';more.className='colloc-head-more';more.setAttribute('aria-label','Tuỳ chọn');more.innerHTML=svg('more');head.appendChild(more);
    }
    var stats=card.querySelector('.analytics-stats');
    var checkin=card.querySelector('#analyticsCheckin');
    if(stats){
      function setRightSidebarCollapsed(collapsed){
        body.classList.toggle('colloc-right-collapsed',!!collapsed);
        var quickButton=document.querySelector('.colloc-side-header-extra');
        var expandButton=document.querySelector('.colloc-right-expand');
        if(quickButton)quickButton.setAttribute('aria-expanded',String(!collapsed));
        if(expandButton)expandButton.setAttribute('aria-hidden',String(!collapsed));
        try{localStorage.setItem('english-collocations-colloc-right-sidebar-v2',collapsed?'collapsed':'expanded')}catch(e){}
      }
      var expandRail=document.createElement('button');
      expandRail.type='button';
      expandRail.className='colloc-right-expand';
      expandRail.setAttribute('data-colloc-right-expand','1');
      expandRail.setAttribute('aria-label','Mở rộng sidebar');
      expandRail.title='Mở rộng sidebar';
      expandRail.innerHTML=svg('expand');
      head.appendChild(expandRail);
      expandRail.addEventListener('click',function(e){
        e.preventDefault();
        e.stopPropagation();
        setRightSidebarCollapsed(false);
      });
      var miniRail=document.createElement('div');
      miniRail.className='colloc-right-mini-rail';
      miniRail.setAttribute('aria-label','Chỉ số nhanh');
      miniRail.innerHTML='<div class="colloc-mini-toggle-slot"></div><div class="colloc-mini-divider"></div><button type="button" class="colloc-mini-item colloc-mini-checkin" aria-label="Điểm danh"><span class="colloc-mini-icon">◫</span><i></i></button><button type="button" class="colloc-mini-item colloc-mini-learned" aria-label="Đã học"><span class="colloc-mini-icon">✓</span><b data-mini-stat="learned">0</b></button><button type="button" class="colloc-mini-item colloc-mini-inprogress" aria-label="Đang học"><span class="colloc-mini-dot"></span><b data-mini-stat="inprogress">0</b></button><button type="button" class="colloc-mini-item colloc-mini-streak" aria-label="Streak"><span class="colloc-mini-icon">🔥</span><b data-mini-stat="streak">0</b></button><div class="colloc-mini-divider"></div><button type="button" class="colloc-mini-item colloc-mini-goal" aria-label="Mục tiêu"><span class="colloc-mini-icon">◎</span><small data-mini-stat="goal">0/0</small></button><div class="colloc-mini-bottom"><span>STATS</span></div>';
      card.appendChild(miniRail);
      var quick=document.createElement('button');quick.type='button';quick.className='colloc-side-header-extra';
      quick.setAttribute('data-colloc-right-collapse','1');
      quick.setAttribute('aria-expanded','true');
      quick.setAttribute('aria-label','Thu gọn sidebar');
      quick.innerHTML='<span style="display:flex;align-items:center;gap:8px"><span class="colloc-collapse-icon" style="width:14px;height:14px;display:block">'+svg('collapse')+'</span>Thu gọn sidebar</span><span class="colloc-collapse-arrow">»</span>';
      var tz=document.createElement('div');tz.className='colloc-timezone';tz.innerHTML='<span>Asia/Ho_Chi_Minh</span><b>00:00 là ngày mới</b>';
      var hdr=document.createElement('div');hdr.className='colloc-stats-header';hdr.innerHTML='<strong>CHỈ SỐ HỌC TẬP</strong><div class="colloc-stats-tabs"><button type="button" class="active">Tuần</button><button type="button">Tháng</button></div>';
      if(checkin) checkin.remove();
      head.after(quick);quick.after(tz);
      if(checkin){tz.after(checkin);checkin.after(hdr)}else tz.after(hdr);
      hdr.after(stats);
      hdr.querySelectorAll('.colloc-stats-tabs button').forEach(function(tab,i){
        tab.dataset.analyticsMode=i===1?'month':'week';
        tab.addEventListener('click',function(){
          var real=card.querySelector('.analytics-tab[data-analytics-mode="'+tab.dataset.analyticsMode+'"]');
          real?.click();
          hdr.querySelectorAll('.colloc-stats-tabs button').forEach(function(x){x.classList.toggle('active',x===tab)});
        });
      });
      quick.addEventListener('click',function(e){
        e.preventDefault();
        e.stopPropagation();
        setRightSidebarCollapsed(true);
      });
      function syncMiniRail(){
        var statsEls=Array.from(card.querySelectorAll('.analytics-stat'));
        var map={};
        statsEls.forEach(function(el){
          var label=(el.querySelector('span')?.textContent||'').trim().toUpperCase();
          var value=(el.querySelector('b')?.textContent||'0').trim();
          if(label.includes('ĐÃ HỌC'))map.learned=value;
          if(label.includes('ĐANG HỌC'))map.inprogress=value;
          if(label.includes('STREAK'))map.streak=value;
          if(label.includes('THÁNG NÀY'))map.month=value;
        });
        var goals=document.querySelectorAll('#goalsCard .goal-row');
        var goal='0/0';
        if(goals.length){
          var input=goals[0].querySelector('.goal-target input'),count=goals[0].querySelector('.goal-count');
          var target=input?.value||input?.getAttribute('value')||'0',done=(count?.textContent||'0').trim().split('/')[0];
          goal=done+'/'+target;
        }
        miniRail.querySelector('[data-mini-stat="learned"]').textContent=map.learned||'0';
        miniRail.querySelector('[data-mini-stat="inprogress"]').textContent=map.inprogress||'0';
        miniRail.querySelector('[data-mini-stat="streak"]').textContent=map.streak||'0';
        miniRail.querySelector('[data-mini-stat="goal"]').textContent=goal;
      }
      syncMiniRail();
      window.addEventListener('preview-table-rendered',syncMiniRail,{passive:true});
      window.addEventListener('preview-data-updated',syncMiniRail,{passive:true});
      window.addEventListener('storage',syncMiniRail,{passive:true});
      try{
        if(localStorage.getItem('english-collocations-colloc-right-sidebar-v2')==='collapsed')setRightSidebarCollapsed(true);
      }catch(e){}
    }
  }

  function settings(){
    var actions=document.querySelector('#box1 .actions'),brand=document.getElementById('box1');
    if(!actions||!brand||document.querySelector('.colloc-settings-panel'))return;
    var panel=document.createElement('div');panel.className='colloc-settings-panel';panel.hidden=true;
    panel.innerHTML='<div class="panel-title">QUẢN LÝ PREVIEW</div><button type="button" data-proxy="theme">☀️ Light mode</button><button type="button" data-proxy="backup">💾 Backup</button><button type="button" data-proxy="restore">📂 Restore</button><button type="button" data-proxy="csv">📊 Export CSV</button><button type="button" data-proxy="clear" style="color:#b45309">🗑️ Xóa tất cả</button><div class="colloc-settings-divider"></div><div class="colloc-settings-advanced-title">CÔNG CỤ HỌC TẬP</div><div id="collocAdvancedDock" class="colloc-advanced-dock"></div>';
    document.body.appendChild(panel);
    var toggle=function(e){e.preventDefault();panel.hidden=!panel.hidden};
    actions.addEventListener('click',toggle);
    panel.addEventListener('click',function(e){
      var b=e.target.closest('[data-proxy]');if(!b)return;
      var real=document.getElementById(b.dataset.proxy);if(real)real.click();
      if(b.dataset.proxy!=='clear')panel.hidden=true;
    });
    document.addEventListener('click',function(e){
      if(!panel.hidden&&!panel.contains(e.target)&&!actions.contains(e.target)&&!e.target.closest('[data-nav-settings]'))panel.hidden=true;
    });
    window.__collocOpenSettings=function(){panel.hidden=false};
  }

  function batch(){
    var toolbar=document.querySelector('.main>.card:not(.brand):not(.table-card)'),selection=toolbar&&toolbar.querySelector('.selection-actions');
    var footer=document.querySelector('.table-footer'),add=document.getElementById('add'),more=document.getElementById('loadMoreRows');
    if(!toolbar||!selection||!footer||!add||selection.dataset.figma258==='1')return;
    selection.dataset.figma258='1';
    var extra=document.createElement('div');extra.className='colloc-batch-extra';
    extra.appendChild(add);if(more)extra.appendChild(more);selection.appendChild(extra);
    selection.querySelector('.select-all-label')?.setAttribute('data-figma-select-all','1');
  }

  function search(){
    var input=document.getElementById('search');
    if(!input)return;
    input.placeholder='Tìm collocation, cấu trúc, nghĩa hoặc ví dụ...';
    if(input.parentElement.querySelector('.colloc-search-icon'))return;
    var wrap=input.parentElement;wrap.classList.add('colloc-search-wrap');
    var icon=document.createElement('span');icon.className='colloc-search-icon';icon.innerHTML=svg('search');wrap.appendChild(icon);
    var key=document.createElement('span');key.className='colloc-search-key';key.textContent='⌘K';wrap.appendChild(key);
  }

    function targetCopy(){
    var eyebrow=document.querySelector('#box1 .eyebrow'),title=document.querySelector('#box1 .box-title'),sub=document.querySelector('#box1 .box-sub');
    if(eyebrow) eyebrow.innerHTML='<span>ESSENTIAL COLLOCATIONS IN USE</span><span class="figma-sep">·</span><span class="figma-meta">ELEMENTARY</span><span class="figma-sep">·</span><span class="figma-meta">CEFR &amp; IELTS</span>';
    if(title) title.textContent='Collocation Learning Hub';
    if(sub) sub.textContent='Quản lý kho từ vựng · Hệ thống cấu trúc hóa, luyện phản xạ và phân tích cụm từ tự nhiên.';
    var status=document.getElementById('statusFilter');if(status)status.querySelector('option[value=""]')?.replaceChildren(document.createTextNode('Tất cả trạng thái'));
    var filter=document.getElementById('filter');if(filter)filter.querySelector('option[value=""]')?.replaceChildren(document.createTextNode('Tất cả chủ đề'));
  }

  function leftNav(){
    var nav=document.getElementById('leftNav');
    if(!nav||nav.dataset.figma258==='1')return;
    nav.dataset.figma258='1';
    var grammar=document.getElementById('leftNavGrammar');
    var settings=document.createElement('button');
    settings.type='button';settings.className='left-nav-item';settings.id='leftNavSettings';settings.dataset.navSettings='1';settings.title='Cài đặt';
    settings.innerHTML='<span class="left-nav-icon" aria-hidden="true">⚙</span><span class="left-nav-label">Cài đặt</span>';
    (grammar||nav.querySelector('.left-nav-item'))?.insertAdjacentElement('afterend',settings);
    var coll=document.getElementById('leftNavCollocation'),count=document.createElement('span');
    count.className='left-nav-count';count.id='leftNavCollocationCount';count.textContent=document.getElementById('count')?.textContent||'124';
    coll?.appendChild(count);
    var grammarCount=document.createElement('span');grammarCount.className='left-nav-count left-nav-count-muted';grammarCount.textContent='114';grammar?.appendChild(grammarCount);
    var toggleText=document.querySelector('#leftNavToggle .left-nav-toggle-text');
    if(toggleText)toggleText.textContent='Thu gọn sidebar';
    var state=document.getElementById('leftNavState');
    var foot=state?.closest('.left-nav-foot');
    if(foot){
      state.textContent='';
      var v=document.createElement('span');v.className='colloc-nav-version';v.textContent='Phiên bản v2.4';
      var sync=document.createElement('span');sync.className='colloc-nav-sync';sync.innerHTML='<i></i> Đồng bộ';
      foot.append(v,sync);
    }
    settings.addEventListener('click',function(e){e.preventDefault();window.__collocOpenSettings?.()});
    document.getElementById('leftNavCollocation')?.addEventListener('click',function(){settings.classList.remove('active')});
    document.getElementById('leftNavGrammar')?.addEventListener('click',function(){settings.classList.remove('active')});
    window.addEventListener('preview-table-rendered',function(){
      var n=document.getElementById('leftNavCollocationCount'),count=document.getElementById('count');
      if(n&&count)n.textContent=count.textContent||'0';
    },{passive:true});
  }

  function advancedDock(){
    var panel=document.getElementById('collocAdvancedDock'),df=document.getElementById('domainFilter'),cf=document.getElementById('cefrFilter'),bar=document.getElementById('vocabToolbar');
    if(!panel||(!df&&!cf&&!bar))return;
    [df,cf].forEach(function(el){if(el)panel.appendChild(el)});
    if(bar)panel.appendChild(bar);
    panel.dataset.ready='1';
  }

  function bindRightToggleFallback(){
    if(body.dataset.collocRightToggleBound==='1')return;
    body.dataset.collocRightToggleBound='1';
    document.addEventListener('click',function(e){
      var collapse=e.target.closest?.('[data-colloc-right-collapse]');
      if(collapse){
        e.preventDefault();
        e.stopPropagation();
        body.classList.add('colloc-right-collapsed');
        try{localStorage.setItem('english-collocations-colloc-right-sidebar-v2','collapsed')}catch(err){}
        return;
      }
      var expand=e.target.closest?.('[data-colloc-right-expand]');
      if(expand){
        e.preventDefault();
        e.stopPropagation();
        body.classList.remove('colloc-right-collapsed');
        try{localStorage.setItem('english-collocations-colloc-right-sidebar-v2','expanded')}catch(err){}
      }
    },true);
  }

  function run(){
    if(!ensureBody())return;
    bindRightToggleFallback();
    helper();targetCopy();leftNav();rightExtras();settings();batch();search();advancedDock();
    window.removeEventListener('preview-vocabulary-ready',advancedDock);
    window.addEventListener('preview-vocabulary-ready',advancedDock,{once:true});
  }

  function boot(){run()}
  function bindViewSwitch(){
    var coll=document.getElementById('leftNavCollocation');
    var grammar=document.getElementById('leftNavGrammar');
    coll?.addEventListener('click',function(){body.classList.add(root)},{passive:true});
    grammar?.addEventListener('click',function(){body.classList.remove(root)},{passive:true});
  }
  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',function(){boot();bindViewSwitch()},{once:true});
  }else{boot();bindViewSwitch()}
})();
