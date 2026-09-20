/* Standalone real-time EN→VI translator. Independent from AI Agent. */
(() => {
  const DATA_KEY = 'english-collocations-preview-v2';
  const CACHE_KEY = 'english-collocations-translation-cache-v5';
  const timers = new Map();
  const requestVersion = new Map();
  const inflight = new Map();

  const readRows = () => {
    try {
      const value = JSON.parse(localStorage.getItem(DATA_KEY) || '[]');
      return Array.isArray(value) ? value : [];
    } catch {
      return [];
    }
  };

  const writeRows = (rows) => {
    localStorage.setItem(DATA_KEY, JSON.stringify(rows));
    window.dispatchEvent(new CustomEvent('preview-data-updated', { detail: { source: 'auto-translate' } }));
  };

  const readCache = () => {
    try {
      const value = JSON.parse(localStorage.getItem(CACHE_KEY) || '{}');
      return value && typeof value === 'object' ? value : {};
    } catch {
      return {};
    }
  };

  const writeCache = (value) => {
    try { localStorage.setItem(CACHE_KEY, JSON.stringify(value)); } catch {}
  };

  const normalize = (value) => String(value ?? '').replace(/\s+/g, ' ').trim();
  const hasTranslatableText = (value) => /[A-Za-zÀ-ž]/.test(normalize(value));

  const cell = (tr, field) =>
    tr?.querySelector(`.editable[data-field="${field}"]`) ||
    tr?.querySelector(`[data-field="${field}"]`);

  const showState = (tr, state, text = '') => {
    const el = cell(tr, 'em');
    if (!el) return;
    if (el.dataset.autoOriginal == null) el.dataset.autoOriginal = el.textContent || '';
    if (state === 'loading') {
      el.classList.add('translation', 'translating');
      el.textContent = '⏳ Đang dịch…';
    } else if (state === 'done') {
      el.classList.remove('translating');
      el.classList.add('translation', 'auto-translated');
      el.textContent = text;
      delete el.dataset.autoOriginal;
    } else if (state === 'error') {
      el.classList.remove('translating');
      if (el.dataset.autoOriginal != null) {
        el.textContent = el.dataset.autoOriginal;
        delete el.dataset.autoOriginal;
      }
    }
  };

  const toast = (text, error = false) => {
    let el = document.getElementById('standaloneTranslateStatus');
    if (!el) {
      el = document.createElement('div');
      el.id = 'standaloneTranslateStatus';
      el.style.cssText = 'position:fixed;right:18px;bottom:18px;z-index:99999;padding:9px 12px;border-radius:9px;background:#172131;color:#fff;border:1px solid #34445a;font:12px system-ui;box-shadow:0 8px 24px #0004';
      document.body.appendChild(el);
    }
    el.textContent = text;
    el.style.borderColor = error ? '#ff686d' : '#36c98b';
    clearTimeout(el._timer);
    el._timer = setTimeout(() => el.remove(), 2200);
  };

  async function translateOnce(text) {
    const key = normalize(text);
    if (!key) return '';
    const cache = readCache();
    if (cache[key]) return cache[key];
    if (inflight.has(key)) return inflight.get(key);

    const promise = (async () => {
      // Fast free endpoint first.
      const googleUrl =
        'https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=vi&dt=t&q=' +
        encodeURIComponent(key);
      try {
        const r = await fetch(googleUrl, { mode: 'cors', cache: 'force-cache' });
        if (r.ok) {
          const d = await r.json();
          const value = normalize(Array.isArray(d?.[0]) ? d[0].map(x => x?.[0] || '').join('') : '');
          if (value) {
            cache[key] = value;
            writeCache(cache);
            return value;
          }
        }
      } catch {}

      // Backup endpoint.
      const memoryUrl =
        'https://api.mymemory.translated.net/get?q=' +
        encodeURIComponent(key) + '&langpair=en|vi';
      const r2 = await fetch(memoryUrl, { mode: 'cors', cache: 'no-store' });
      if (!r2.ok) throw new Error('Translation HTTP ' + r2.status);
      const d2 = await r2.json();
      const value2 = normalize(d2?.responseData?.translatedText || '');
      if (!value2) throw new Error('Empty translation');
      cache[key] = value2;
      writeCache(cache);
      return value2;
    })();

    inflight.set(key, promise);
    try { return await promise; }
    finally { inflight.delete(key); }
  }

  async function run(id, english, sourceEl) {
    const key = String(id);
    const version = (requestVersion.get(key) || 0) + 1;
    requestVersion.set(key, version);
    const cleanEnglish = normalize(english);
    if (!cleanEnglish || !hasTranslatableText(cleanEnglish)) return;

    const tr = document.querySelector(`#body tr[data-id="${CSS.escape(key)}"]`);
    showState(tr, 'loading');

    try {
      const translated = normalize(await translateOnce(cleanEnglish));
      // Do not allow an old request to overwrite newer typing.
      if (requestVersion.get(key) !== version) return;
      const currentEl = document.querySelector(`#body tr[data-id="${CSS.escape(key)}"] .editable[data-field="e"]`);
      const currentEnglish = normalize(currentEl?.textContent || currentEl?.value || '');
      if (currentEnglish !== cleanEnglish) return;

      const rows = readRows();
      const next = rows.map(row =>
        String(row.id) === key ? { ...row, e: cleanEnglish, em: translated } : row
      );
      writeRows(next);

      const currentTr = document.querySelector(`#body tr[data-id="${CSS.escape(key)}"]`);
      showState(currentTr, 'done', translated);
      toast('✓ Đã dịch → NGHĨA CÂU VÍ DỤ');
    } catch (error) {
      if (requestVersion.get(key) !== version) return;
      console.error('[AutoTranslate]', error);
      const currentTr = document.querySelector(`#body tr[data-id="${CSS.escape(key)}"]`);
      showState(currentTr, 'error');
      toast('⚠️ Không thể dịch tự động', true);
    }
  }

  function schedule(id, english, options = {}) {
    const key = String(id);
    clearTimeout(timers.get(key));
    if (!normalize(english)) return;
    const delay = options.immediate ? 80 : 850;
    timers.set(key, setTimeout(() => run(id, english), delay));
  }

  function readFromEvent(el) {
    return normalize(el?.textContent || el?.value || '');
  }

  function bind() {
    document.querySelectorAll('#body .editable[data-field="e"]').forEach(el => {
      if (el.dataset.autoTranslateBound === '4') return;
      el.dataset.autoTranslateBound = '4';

      el.addEventListener('input', () => {
        const tr = el.closest('tr');
        const id = tr?.dataset.id;
        const english = readFromEvent(el);
        if (id) schedule(id, english);
      });

      el.addEventListener('blur', () => {
        const tr = el.closest('tr');
        const id = tr?.dataset.id;
        const english = readFromEvent(el);
        if (id) schedule(id, english, { immediate: true });
      });
    });
  }

  window.AutoTranslate = { schedule, run, bind };

  function boot() {
    bind();
    const body = document.getElementById('body');
    if (body && !body.dataset.autoTranslateObserverV4) {
      body.dataset.autoTranslateObserverV4 = '1';
      new MutationObserver(bind).observe(body, { childList: true, subtree: true });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => setTimeout(boot, 150));
  } else {
    setTimeout(boot, 150);
  }
})();