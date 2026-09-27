/* Collocation Figma 25:8 — safe DOM adapter for the existing Preview implementation. */
(function(){
  'use strict';
  var root='collocation-figma-25-8', body=document.body;

  function svg(name){
    var paths={
      more:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/></svg>',
      collapse:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="m9 6-6 6 6 6M3 12h18"/></svg>',
      search:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="11" cy="11" r="6.7"/><path d="m16.2 16.2 4.2 4.2"/></svg>'
    };
    return paths[name]||'';
  }

  function ensureBody(){
    if(!body||body.classList.contains('grammar-mode')) return false;
    body.classList.add(root);
    return true;
  }

  function helper(){
    if(document.querySelector('.colloc-helper')) return;
    var brand=document.getElementById('box1');
    if(!brand) return;
    var el=document.createElement('div');
    el.className='colloc-helper';
    el.innerHTML='<div class="colloc-helper-left"><span class="colloc-helper-label">QUẢN LÝ PREVIEW</span><span class="dot"></span><span>Đang xác thực…</span><span style="color:#d4d4d4">·</span><span>Đang kiểm tra Preview…</span><span style="color:#d4d4d4">·</span><span>Đang kiểm tra source GitHub.</span></div><div class="colloc-helper-sync"><span class="sync-dot"></span><span>Local Data Synced</span></div>';
    brand.after(el);
  }

  function rightExtras(){
    var card=document.querySelector('.analytics-card');
    if(!card||card.dataset.figma258==='1') return;
    card.dataset.figma258='1';
    var head=card.querySelector('.analytics-head');
    var title=card.querySelector('.analytics-title');
    if(title) title.textContent='TỔNG QUAN HỌC TẬP';
    if(head){
      var more=document.createElement('button');
      more.type='button';more.className='colloc-head-more';more.setAttribute('aria-label','Tuỳ chọn');more.innerHTML=svg('more');
      head.appendChild(more);
    }
    var stats=card.querySelector('.analytics-stats');
    if(stats){
      var quick=document.createElement('button');
      quick.type='button';quick.className='colloc-side-header-extra';
      quick.innerHTML='<span style="display:flex;align-items:center;gap:8px"><span style="width:14px;height:14px;display:block">'+svg('collapse')+'</span>Thu gọn sidebar</span><span style="font-size:13px">»</span>';
      var tz=document.createElement('div');tz.className='colloc-timezone';tz.innerHTML='<span>Asia/Ho_Chi_Minh</span><b>00:00 là ngày mới</b>';
      var hdr=document.createElement('div');hdr.className='colloc-stats-header';hdr.innerHTML='<strong>CHỈ SỐ HỌC TẬP</strong><div class="colloc-stats-tabs"><button type="button" class="active">Tuần</button><button type="button">Tháng</button></div>';
      stats.before(quick);quick.after(tz);tz.after(hdr);
      quick.addEventListener('click',function(){
        body.classList.toggle('colloc-right-collapsed');
        try{localStorage.setItem('english-collocations-colloc-right-sidebar-v2',body.classList.contains('colloc-right-collapsed')?'collapsed':'expanded')}catch(e){}
      });
      try{if(localStorage.getItem('english-collocations-colloc-right-sidebar-v2')==='collapsed')body.classList.add('colloc-right-collapsed')}catch(e){}
    }
    var checkin=card.querySelector('#analyticsCheckin');
    if(checkin){
      checkin.style.zIndex='2';
    }
  }

  function settings(){
    var actions=document.querySelector('#box1 .actions'), brand=document.getElementById('box1');
    if(!actions||!brand||document.querySelector('.colloc-settings-panel')) return;
    var panel=document.createElement('div');panel.className='colloc-settings-panel';panel.hidden=true;
    panel.innerHTML='<div class="panel-title">QUẢN LÝ PREVIEW</div><button type="button" data-proxy="theme">☀️ Light mode</button><button type="button" data-proxy="backup">💾 Backup</button><button type="button" data-proxy="restore">📂 Restore</button><button type="button" data-proxy="csv">📊 Export CSV</button><button type="button" data-proxy="clear" style="color:#b45309">🗑️ Xóa tất cả</button>';
    document.body.appendChild(panel);
    actions.addEventListener('click',function(e){e.preventDefault();panel.hidden=!panel.hidden});
    panel.addEventListener('click',function(e){
      var b=e.target.closest('[data-proxy]');if(!b)return;
      var real=document.getElementById(b.dataset.proxy);if(real)real.click();
      if(b.dataset.proxy!=='clear')panel.hidden=true;
    });
    document.addEventListener('click',function(e){
      if(!panel.hidden&&!panel.contains(e.target)&&!actions.contains(e.target))panel.hidden=true;
    });
  }

  function batch(){
    var toolbar=document.querySelector('.main>.card:not(.brand):not(.table-card)'),selection=toolbar&&toolbar.querySelector('.selection-actions');
    var footer=document.querySelector('.table-footer'),add=document.getElementById('add'),more=document.getElementById('loadMoreRows');
    if(!toolbar||!selection||!footer||!add||selection.dataset.figma258==='1')return;
    selection.dataset.figma258='1';
    var extra=document.createElement('div');extra.className='colloc-batch-extra';
    extra.appendChild(add);if(more)extra.appendChild(more);selection.appendChild(extra);
  }

  function search(){
    var input=document.getElementById('search');
    if(!input||input.parentElement.querySelector('.colloc-search-icon'))return;
    var wrap=input.parentElement;wrap.classList.add('colloc-search-wrap');
    var icon=document.createElement('span');icon.className='colloc-search-icon';icon.innerHTML=svg('search');wrap.appendChild(icon);
    var key=document.createElement('span');key.className='colloc-search-key';key.textContent='⌘K';wrap.appendChild(key);
  }

  function run(){
    if(!ensureBody())return;
    helper();rightExtras();settings();batch();search();
  }

  function boot(){run();setTimeout(run,200);setTimeout(run,700);setTimeout(run,1400)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
