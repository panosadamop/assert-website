/* ASSERT CMS – admin single-page app (no build step, no dependencies). */
(() => {
  'use strict';

  /* ------------------------------------------------------------------ */
  /* Helpers                                                             */
  /* ------------------------------------------------------------------ */

  const $app = document.getElementById('app');
  const TOKEN_KEY = 'assert_cms_token';
  const state = { token: localStorage.getItem(TOKEN_KEY), user: null, types: [], languages: [], siteUrl: '', dirty: false, unread: 0 };

  /** Tiny DOM builder: h('div', {class: 'x', onclick: fn}, child, 'text') */
  function h(tag, attrs, ...children) {
    const el = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs || {})) {
      if (v === null || v === undefined || v === false) continue;
      if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2).toLowerCase(), v);
      else if (k === 'class') el.className = v;
      else if (k === 'style' && typeof v === 'object') Object.assign(el.style, v);
      else if (k === 'html') el.innerHTML = v; // only used with static strings (icons)
      else if (k in el && typeof v !== 'string') el[k] = v;
      else el.setAttribute(k, v === true ? '' : v);
    }
    for (const c of children.flat(Infinity)) {
      if (c === null || c === undefined || c === false) continue;
      el.append(c instanceof Node ? c : document.createTextNode(String(c)));
    }
    return el;
  }

  const ICONS = {
    dashboard: '<path d="M3 13h8V3H3zM13 21h8V11h-8zM3 21h8v-6H3zM13 3v6h8V3z"/>',
    home: '<path d="M3 11l9-8 9 8v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.5"/>',
    mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>',
    grid: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
    box: '<path d="M21 8l-9-5-9 5 9 5 9-5zM3 8v8l9 5 9-5V8M12 13v8"/>',
    file: '<path d="M14 3H6a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8z"/><path d="M14 3v5h5M8 13h8M8 17h6"/>',
    image: '<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="M21 16l-5-5-9 9"/>',
    inbox: '<path d="M3 13l3-8h12l3 8v6a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z"/><path d="M3 13h5l1 3h6l1-3h5"/>',
    settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
    users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0M16 4.5a3.5 3.5 0 0 1 0 7M18 14a6.5 6.5 0 0 1 3.5 6"/>',
    save: '<path d="M5 3h11l5 5v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z"/><path d="M7 3v6h9V3M7 21v-7h10v7"/>',
    db: '<ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v14c0 1.7 3.6 3 8 3s8-1.3 8-3V5M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3"/>',
    key: '<circle cx="8" cy="15" r="4"/><path d="M11 12l9-9M17 6l3 3"/>',
    ext: '<path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    up: '<path d="M6 15l6-6 6 6"/>',
    down: '<path d="M6 9l6 6 6-6"/>',
    trash: '<path d="M4 7h16M10 11v6M14 11v6M5 7l1 13h12l1-13M9 7V4h6v3"/>',
    refresh: '<path d="M20 11a8 8 0 1 0-2.3 5.7M20 4v7h-7"/>',
    copy: '<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a1 1 0 0 1 1-1h10"/>',
    menu: '<path d="M4 6h16M4 12h16M4 18h10"/>',
    text: '<path d="M4 6V4h16v2M12 4v16M9 20h6"/>',
    globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>',
  };
  const icon = (name) => {
    const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    s.setAttribute('viewBox', '0 0 24 24');
    s.setAttribute('fill', 'none');
    s.setAttribute('stroke', 'currentColor');
    s.setAttribute('stroke-width', '1.8');
    s.setAttribute('stroke-linecap', 'round');
    s.setAttribute('stroke-linejoin', 'round');
    s.innerHTML = ICONS[name] || ICONS.file;
    return s;
  };

  function toast(msg, kind = 'ok') {
    const t = h('div', { class: `toast ${kind}` }, msg);
    document.getElementById('toasts').append(t);
    setTimeout(() => t.remove(), kind === 'err' ? 6000 : 3000);
  }

  const fmtDate = (s) => (s ? new Date(s).toLocaleString() : '—');
  const fmtSize = (n) => (n > 1048576 ? `${(n / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1024))} KB`);
  const clone = (o) => JSON.parse(JSON.stringify(o ?? null));

  async function api(path, opts = {}) {
    const headers = { ...(opts.headers || {}) };
    if (state.token) headers.authorization = `Bearer ${state.token}`;
    let body = opts.body;
    if (body && !(body instanceof FormData) && typeof body !== 'string') {
      headers['content-type'] = 'application/json';
      body = JSON.stringify(body);
    }
    const res = await fetch(path, { ...opts, headers, body });
    if (res.status === 401 && !path.endsWith('/login')) {
      logout(false);
      throw new Error('Your session has expired. Please log in again.');
    }
    const ct = res.headers.get('content-type') || '';
    const data = ct.includes('json') ? await res.json() : await res.text();
    if (!res.ok) {
      const msg = data && data.message ? (Array.isArray(data.message) ? data.message.join(', ') : data.message) : `Request failed (${res.status})`;
      throw new Error(msg);
    }
    return data;
  }

  function confirmLeave() {
    if (!state.dirty) return true;
    return window.confirm('You have unsaved changes. Leave this page?');
  }
  window.addEventListener('beforeunload', (e) => {
    if (state.dirty) { e.preventDefault(); e.returnValue = ''; }
  });
  const markDirty = () => { state.dirty = true; };

  function modal(title, content, { small = false, actions = [] } = {}) {
    const close = () => back.remove();
    const back = h('div', { class: 'modal-back', onclick: (e) => { if (e.target === back) close(); } },
      h('div', { class: `modal${small ? ' small' : ''}` },
        h('header', {}, h('h3', {}, title), ...actions, h('button', { class: 'btn small', onclick: close, style: { marginLeft: '8px' } }, 'Close')),
        h('div', { class: 'body' }, content)));
    document.body.append(back);
    return { close };
  }

  /* ------------------------------------------------------------------ */
  /* Auth                                                                */
  /* ------------------------------------------------------------------ */

  function renderLogin(message) {
    const err = h('div', { class: 'error', style: { display: message ? 'block' : 'none' } }, message || '');
    const email = h('input', { type: 'email', required: true, autocomplete: 'username', placeholder: 'you@assert.gr' });
    const pw = h('input', { type: 'password', required: true, autocomplete: 'current-password' });
    const btn = h('button', { class: 'btn primary', type: 'submit', style: { width: '100%', justifyContent: 'center', padding: '11px' } }, 'Sign in');
    const form = h('form', {
      onsubmit: async (e) => {
        e.preventDefault();
        btn.disabled = true;
        err.style.display = 'none';
        try {
          const r = await api('/api/auth/login', { method: 'POST', body: { email: email.value, password: pw.value } });
          state.token = r.token;
          localStorage.setItem(TOKEN_KEY, r.token);
          await start();
        } catch (ex) {
          err.textContent = ex.message;
          err.style.display = 'block';
          btn.disabled = false;
        }
      },
    },
    err,
    h('div', { class: 'field' }, h('label', {}, 'Email'), email),
    h('div', { class: 'field' }, h('label', {}, 'Password'), pw),
    btn);
    $app.replaceChildren(h('div', { class: 'login' }, h('div', { class: 'login-card' },
      h('img', { src: 'assets/logo-dark.png', alt: 'ASSERT' }),
      h('h1', {}, 'Content management'),
      form)));
    email.focus();
  }

  function logout(show = true) {
    state.token = null;
    state.user = null;
    state.dirty = false;
    localStorage.removeItem(TOKEN_KEY);
    renderLogin(show ? '' : 'Your session has expired. Please log in again.');
  }

  /* ------------------------------------------------------------------ */
  /* Shell & routing                                                     */
  /* ------------------------------------------------------------------ */

  let $main, $nav, lastHash = location.hash;

  function shell() {
    const typeLink = (t) => h('a', { href: `#/${t.kind === 'singleton' ? 'edit' : 'list'}/${t.name}`, 'data-route': t.name }, icon(t.icon), t.label);
    const t = (n) => state.types.find((x) => x.name === n);
    $nav = h('nav', { class: 'nav' },
      h('a', { href: '#/', 'data-route': 'dashboard' }, icon('dashboard'), 'Dashboard'),
      h('h6', {}, 'Pages'),
      ['home', 'about', 'contact'].map(t).filter(Boolean).map(typeLink),
      h('h6', {}, 'Content'),
      ['sectors', 'products', 'pages'].map(t).filter(Boolean).map(typeLink),
      h('a', { href: '#/media', 'data-route': 'media' }, icon('image'), 'Media library'),
      h('a', { href: '#/messages', 'data-route': 'messages' }, icon('inbox'), 'Messages', h('span', { class: 'badge', id: 'unread', style: { display: 'none' } })),
      h('h6', {}, 'Site'),
      ['navigation', 'strings'].map(t).filter(Boolean).map(typeLink),
      h('h6', {}, 'Configuration'),
      state.user.role === 'admin' ? typeLink(t('settings')) : null,
      state.user.role === 'admin' ? h('a', { href: '#/users', 'data-route': 'users' }, icon('users'), 'Users') : null,
      state.user.role === 'admin' ? h('a', { href: '#/backup', 'data-route': 'backup' }, icon('db'), 'Backup & restore') : null,
      h('a', { href: '#/account', 'data-route': 'account' }, icon('key'), 'My account'),
    );
    $main = h('main', { class: 'main' });
    $app.replaceChildren(h('div', { class: 'shell' },
      h('aside', { class: 'sidebar' },
        h('div', { class: 'brand' }, h('img', { src: 'assets/logo-white.png', alt: 'ASSERT' }), h('span', {}, 'Content management')),
        $nav,
        h('div', { class: 'me' }, h('span', {}, state.user.name || state.user.email), h('button', { onclick: () => { if (confirmLeave()) logout(); } }, 'Log out'))),
      $main));
    refreshUnread();
  }

  async function refreshUnread() {
    try {
      const d = await api('/api/admin/dashboard');
      state.unread = d.counts.unread;
      const b = document.getElementById('unread');
      if (b) { b.textContent = d.counts.unread; b.style.display = d.counts.unread ? '' : 'none'; }
    } catch { /* ignore */ }
  }

  function page(title, { crumbs, actions = [] } = {}) {
    const content = h('div', { class: 'content' });
    $main.replaceChildren(
      h('div', { class: 'topbar' },
        h('div', {}, crumbs ? h('div', { class: 'crumbs' }, crumbs) : null, h('h2', {}, title)),
        h('div', { class: 'spacer' }),
        ...actions,
        h('button', { class: 'btn small', title: 'Refresh the public website cache now', onclick: clearCache }, icon('refresh'), 'Refresh site'),
        h('a', { class: 'btn small', href: state.siteUrl, target: '_blank', rel: 'noopener' }, icon('ext'), 'View site')),
      content);
    window.scrollTo(0, 0);
    return content;
  }

  async function clearCache() {
    try {
      const r = await api('/api/admin/revalidate', { method: 'POST' });
      if (r.ok) toast('Website cache refreshed.');
      else toast(`Could not reach the website: ${r.error}`, 'err');
    } catch (e) { toast(e.message, 'err'); }
  }

  const ROUTES = [
    [/^#?\/?$/, () => viewDashboard(), 'dashboard'],
    [/^#\/edit\/([\w-]+)$/, (m) => viewSingleton(m[1]), (m) => m[1]],
    [/^#\/list\/([\w-]+)$/, (m) => viewList(m[1]), (m) => m[1]],
    [/^#\/item\/([\w-]+)\/([\w-]+)$/, (m) => viewItem(m[1], m[2]), (m) => m[1]],
    [/^#\/media$/, () => viewMedia(), 'media'],
    [/^#\/messages$/, () => viewMessages(), 'messages'],
    [/^#\/users$/, () => viewUsers(), 'users'],
    [/^#\/backup$/, () => viewBackup(), 'backup'],
    [/^#\/account$/, () => viewAccount(), 'account'],
  ];

  function route() {
    const hash = location.hash || '#/';
    for (const [re, fn, key] of ROUTES) {
      const m = hash.match(re);
      if (!m) continue;
      const active = typeof key === 'function' ? key(m) : key;
      $nav.querySelectorAll('a').forEach((a) => a.classList.toggle('active', a.dataset.route === active));
      state.dirty = false;
      Promise.resolve(fn(m)).catch((e) => {
        page('Error').append(h('div', { class: 'error' }, e.message));
      });
      return;
    }
    location.hash = '#/';
  }

  window.addEventListener('hashchange', () => {
    if (state.dirty && !window.confirm('You have unsaved changes. Leave this page?')) {
      history.replaceState(null, '', lastHash);
      return;
    }
    lastHash = location.hash;
    route();
  });

  async function start() {
    if (!state.token) return renderLogin();
    try {
      state.user = await api('/api/auth/me');
      const s = await api('/api/admin/schema');
      state.types = s.types;
      state.siteUrl = s.siteUrl;
      state.languages = s.languages || [];
    } catch (e) {
      return renderLogin(state.token ? '' : e.message);
    }
    shell();
    route();
  }

  /* ------------------------------------------------------------------ */
  /* Dashboard                                                           */
  /* ------------------------------------------------------------------ */

  async function viewDashboard() {
    const d = await api('/api/admin/dashboard');
    const c = page(`Welcome${state.user.name ? ', ' + state.user.name.split(' ')[0] : ''}`);
    const stat = (n, label, href) => h('a', { class: 'card stat', href, style: { textDecoration: 'none', color: 'inherit' } }, h('b', {}, n), h('span', {}, label));
    c.append(
      h('div', { class: 'grid-4', style: { marginBottom: '24px' } },
        stat(d.counts.sectors, 'Sectors', '#/list/sectors'),
        stat(d.counts.products, 'Products', '#/list/products'),
        stat(d.counts.pages, 'Pages', '#/list/pages'),
        stat(`${d.counts.unread} / ${d.counts.messages}`, 'Unread / total messages', '#/messages')),
      h('div', { class: 'editor' },
        h('div', { class: 'card' },
          h('div', { style: { padding: '16px 18px', borderBottom: '1px solid var(--line)', fontWeight: 500 } }, 'Latest messages'),
          d.recentMessages.length
            ? h('table', { class: 'list' }, h('tbody', {}, d.recentMessages.map((m) =>
                h('tr', { class: m.read ? '' : 'unread' },
                  h('td', {}, m.name, h('div', { class: 'muted', style: { fontWeight: 400 } }, m.email)),
                  h('td', { class: 'muted' }, (m.message || '').slice(0, 80)),
                  h('td', { class: 'muted', style: { whiteSpace: 'nowrap' } }, fmtDate(m.createdAt))))))
            : h('div', { class: 'empty' }, 'No messages yet.')),
        h('aside', {},
          h('div', { class: 'card' },
            h('h4', {}, 'Quick links'),
            h('div', { style: { display: 'flex', flexDirection: 'column', gap: '8px' } },
              h('a', { class: 'btn', href: '#/edit/home' }, icon('home'), 'Edit home page'),
              h('a', { class: 'btn', href: '#/list/products' }, icon('box'), 'Manage products'),
              state.user.role === 'admin' ? h('a', { class: 'btn', href: '#/edit/settings' }, icon('settings'), 'SEO & settings') : null)),
          h('div', { class: 'card' },
            h('h4', {}, 'Storage'),
            h('div', { class: 'muted', style: { fontSize: '12px', wordBreak: 'break-all' } }, d.dataDir)))));
  }

  /* ------------------------------------------------------------------ */
  /* Form engine                                                         */
  /* ------------------------------------------------------------------ */

  function counter(input, max) {
    if (!max) return null;
    const el = h('span', { class: 'counter' });
    const upd = () => { el.textContent = `${input.value.length}/${max}`; el.classList.toggle('over', input.value.length > max); };
    input.addEventListener('input', upd);
    upd();
    return el;
  }

  function mdToolbar(ta) {
    const wrap = (before, after = before, placeholder = 'text') => () => {
      const { selectionStart: s, selectionEnd: e, value } = ta;
      const sel = value.slice(s, e) || placeholder;
      ta.setRangeText(before + sel + after, s, e, 'select');
      ta.focus();
      ta.dispatchEvent(new Event('input'));
    };
    const line = (prefix) => () => {
      const s = ta.value.lastIndexOf('\n', ta.selectionStart - 1) + 1;
      ta.setRangeText(prefix, s, s, 'end');
      ta.focus();
      ta.dispatchEvent(new Event('input'));
    };
    return h('div', { class: 'md-toolbar' },
      h('button', { type: 'button', onclick: line('## ') }, 'H2'),
      h('button', { type: 'button', onclick: line('### ') }, 'H3'),
      h('button', { type: 'button', onclick: wrap('**'), style: { fontWeight: 700 } }, 'B'),
      h('button', { type: 'button', onclick: wrap('*'), style: { fontStyle: 'italic' } }, 'I'),
      h('button', { type: 'button', onclick: line('- ') }, '• List'),
      h('button', { type: 'button', onclick: line('1. ') }, '1. List'),
      h('button', { type: 'button', onclick: wrap('[', '](https://)', 'link text') }, 'Link'),
      h('span', { class: 'muted', style: { marginLeft: 'auto', fontSize: '11.5px', alignSelf: 'center' } }, 'Markdown supported'));
  }

  function imageInput(obj, key) {
    const thumb = h('div', { class: 'thumb' });
    const input = h('input', { type: 'text', value: obj[key] || '', placeholder: '/uploads/image.png or https://…' });
    const upd = () => {
      const v = input.value.trim();
      thumb.style.backgroundImage = v ? `url("${v.replace(/"/g, '%22')}")` : '';
      thumb.textContent = v ? '' : 'No image';
    };
    input.addEventListener('input', () => { obj[key] = input.value.trim(); markDirty(); upd(); });
    upd();
    return h('div', { class: 'image-field' }, thumb, h('div', { class: 'controls' }, input,
      h('div', { class: 'btns' },
        h('button', { type: 'button', class: 'btn small', onclick: () => pickMedia((url) => { input.value = url; input.dispatchEvent(new Event('input')); }) }, icon('image'), 'Choose / upload'),
        h('button', { type: 'button', class: 'btn small danger', onclick: () => { input.value = ''; input.dispatchEvent(new Event('input')); } }, 'Remove'))));
  }

  /* Same rule as the server (schema.ts -> isTranslatable). */
  const LOCKED = ['slug', 'boolean', 'number', 'select', 'color'];
  const isTranslatable = (f) => !f.noTranslate && !LOCKED.includes(f.type) &&
    (!f.fields || f.fields.some(isTranslatable));
  /** Hint shown under a translated field: the default-language value. */
  const baseHint = (ctx, f) => {
    if (!ctx.translating) return null;
    const v = ctx.base ? ctx.base[f.key] : undefined;
    const txt = Array.isArray(v) ? v.join(' · ') : typeof v === 'string' ? v : '';
    const name = state.languages[0] ? state.languages[0].name : 'Default';
    return txt ? h('div', { class: 'help base-hint' }, name + ': ' + (txt.length > 220 ? txt.slice(0, 220) + '…' : txt)) : null;
  };
  /** Shows/hides fields with a "when" rule depending on the item's type/kind. */
  function applyWhen(container, src) {
    const kind = src ? (src.type || src.kind || '') : '';
    container.querySelectorAll(':scope > [data-when]').forEach((el) => {
      el.style.display = el.dataset.when.split(',').includes(kind) ? '' : 'none';
    });
  }

  function renderField(f, obj, ctx) {
    if (ctx.translating && !isTranslatable(f)) return null;
    const el = renderFieldInner(f, obj, ctx);
    if (el && f.when) el.dataset.when = f.when.join(',');
    return el;
  }

  function renderFieldInner(f, obj, ctx) {
    const label = h('label', {}, f.label, f.required && !ctx.translating ? h('span', { class: 'req' }, ' *') : null);
    const help = f.help ? h('div', { class: 'help' }, f.help) : null;
    const wrap = (...els) => h('div', { class: 'field' }, ...els, baseHint(ctx, f));
    const ph = (ctx.translating && ctx.base && typeof ctx.base[f.key] === 'string' && ctx.base[f.key]) || f.placeholder || '';
    const bind = (el, parse = (v) => v) => {
      el.addEventListener('input', () => { obj[f.key] = parse(el.value); markDirty(); ctx.onChange && ctx.onChange(); });
      return el;
    };

    switch (f.type) {
      case 'text': case 'email': case 'url': case 'slug': {
        const el = bind(h('input', { type: f.type === 'email' ? 'email' : 'text', value: obj[f.key] ?? '', placeholder: ph, maxLength: f.max || null }));
        if (f.type === 'slug') {
          el.addEventListener('blur', () => {
            el.value = el.value.toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
            obj[f.key] = el.value;
          });
          ctx.slugInput = el;
        }
        if (ctx.titleField === f.key) ctx.titleInput = el;
        label.prepend(counter(el, f.max) || '');
        return wrap(label, el, help);
      }
      case 'textarea': {
        const el = bind(h('textarea', { placeholder: ph }));
        el.value = obj[f.key] ?? '';
        label.prepend(counter(el, f.max) || '');
        return wrap(label, el, help);
      }
      case 'markdown': {
        const el = bind(h('textarea', { class: 'md' }));
        el.value = obj[f.key] ?? '';
        return wrap(label, mdToolbar(el), el, help);
      }
      case 'number':
        return wrap(label, bind(h('input', { type: 'number', value: obj[f.key] ?? 0 }), Number), help);
      case 'boolean': {
        const el = h('input', { type: 'checkbox', checked: !!obj[f.key], onchange: () => { obj[f.key] = el.checked; markDirty(); } });
        return wrap(h('label', { class: 'switch' }, el, f.label), help);
      }
      case 'select': {
        const el = bind(h('select', {}, h('option', { value: '' }, '— none —'),
          (f.options || []).map((o) => h('option', { value: o.value, selected: obj[f.key] === o.value }, o.label))));
        return wrap(label, el, help);
      }
      case 'color': {
        const txt = h('input', { type: 'text', value: obj[f.key] || '', placeholder: '#20282d', style: { maxWidth: '140px' } });
        const pick = h('input', { type: 'color', value: /^#[0-9a-f]{6}$/i.test(obj[f.key] || '') ? obj[f.key] : '#20282d' });
        pick.addEventListener('input', () => { txt.value = pick.value; obj[f.key] = pick.value; markDirty(); });
        txt.addEventListener('input', () => { obj[f.key] = txt.value; if (/^#[0-9a-f]{6}$/i.test(txt.value)) pick.value = txt.value; markDirty(); });
        return wrap(label, h('div', { class: 'color-row' }, pick, txt), help);
      }
      case 'image':
        return wrap(label, imageInput(obj, f.key), help);
      case 'list': {
        const el = h('textarea', { placeholder: f.placeholder ? `${f.placeholder}\n…` : 'One item per line', style: { minHeight: '96px' } });
        el.value = (obj[f.key] || []).join('\n');
        el.addEventListener('input', () => { obj[f.key] = el.value.split('\n').map((s) => s.trim()).filter(Boolean); markDirty(); });
        return wrap(label, el, h('div', { class: 'help' }, f.help || 'One item per line.'));
      }
      case 'group': {
        obj[f.key] = obj[f.key] && typeof obj[f.key] === 'object' ? obj[f.key] : {};
        const sub = obj[f.key];
        const box = h('div', { class: 'group' }, h('div', { class: 'group-title' }, f.label), help);
        if (f.key === 'seo' && ctx.seoPreview && !ctx.translating) box.append(ctx.seoPreview(sub));
        const shown = (f.fields || []).filter((x) => !ctx.translating || isTranslatable(x));
        const short = shown.every((x) => ['text', 'url', 'email', 'select', 'number', 'color'].includes(x.type)) && shown.length > 1 && !ctx.translating;
        const inner = short ? h('div', { class: 'row-2' }) : box;
        const subBase = ctx.translating ? ((ctx.base && ctx.base[f.key]) || {}) : undefined;
        for (const sf of f.fields || []) {
          const el = renderField(sf, sub, { ...ctx, onChange: ctx.onChange, titleField: null, base: subBase });
          if (el) inner.append(el);
        }
        if (short) box.append(inner);
        return box;
      }
      case 'repeater': {
        obj[f.key] = Array.isArray(obj[f.key]) ? obj[f.key] : [];
        const arr = obj[f.key];
        const list = h('div');
        if (ctx.translating) {
          // Translations follow the items of the default language: same order, no add/remove.
          const baseArr = (ctx.base && Array.isArray(ctx.base[f.key])) ? ctx.base[f.key] : [];
          while (arr.length < baseArr.length) arr.push({});
          arr.length = baseArr.length;
          baseArr.forEach((b, i) => {
            if (!arr[i] || typeof arr[i] !== 'object') arr[i] = {};
            const label = b[f.itemLabel] || b.title || b.label || '(untitled)';
            const body = h('div', { class: 'body' });
            for (const sf of f.fields || []) {
              const el = renderField(sf, arr[i], { translating: true, base: b });
              if (el) body.append(el);
            }
            applyWhen(body, b);
            const card = h('div', { class: 'repeater-item collapsed' },
              h('header', { onclick: () => card.classList.toggle('collapsed') }, h('span', { class: 'n' }, i + 1), h('span', { class: 't' }, label)),
              body);
            list.append(card);
          });
          if (!baseArr.length) list.append(h('div', { class: 'muted' }, 'No items in the default language yet.'));
          return h('div', { class: 'field' }, h('div', { class: 'label' }, f.label), list);
        }
        const draw = (openIdx = -1) => {
          list.replaceChildren(...arr.map((item, i) => {
            const title = h('span', { class: 't' }, item[f.itemLabel] || h('span', { class: 'muted' }, '(untitled)'));
            const body = h('div', { class: 'body' }, (f.fields || []).map((sf) => renderField(sf, item, {
              onChange: () => { title.textContent = item[f.itemLabel] || '(untitled)'; },
            })));
            applyWhen(body, item);
            body.addEventListener('input', () => applyWhen(body, item));
            body.addEventListener('change', () => applyWhen(body, item));
            const move = (d) => (e) => {
              e.stopPropagation();
              const j = i + d;
              if (j < 0 || j >= arr.length) return;
              [arr[i], arr[j]] = [arr[j], arr[i]];
              markDirty();
              draw(j);
            };
            const card = h('div', { class: `repeater-item${i === openIdx ? '' : ' collapsed'}` },
              h('header', { onclick: () => card.classList.toggle('collapsed') },
                h('span', { class: 'n' }, i + 1), title,
                h('button', { type: 'button', class: 'btn icon small', title: 'Move up', onclick: move(-1) }, icon('up')),
                h('button', { type: 'button', class: 'btn icon small', title: 'Move down', onclick: move(1) }, icon('down')),
                h('button', { type: 'button', class: 'btn icon small danger', title: 'Remove', onclick: (e) => {
                  e.stopPropagation();
                  if (!confirm('Remove this item?')) return;
                  arr.splice(i, 1); markDirty(); draw();
                } }, icon('trash'))),
              body);
            return card;
          }));
        };
        draw();
        return h('div', { class: 'field' }, h('div', { class: 'label' }, f.label), help, list,
          h('button', { type: 'button', class: 'btn small', onclick: () => { arr.push({}); markDirty(); draw(arr.length - 1); } }, icon('plus'), 'Add item'));
      }
      default:
        return h('div');
    }
  }

  /** Builds a tabbed form. Returns the root element. */
  function buildForm(type, data, ctx) {
    const tabs = [];
    for (const f of type.fields) {
      const tab = f.tab || 'Content';
      let t = tabs.find((x) => x.name === tab);
      if (!t) tabs.push((t = { name: tab, fields: [] }));
      t.fields.push(f);
    }
    // Keep SEO tab last.
    tabs.sort((a, b) => (a.name === 'SEO') - (b.name === 'SEO'));
    const panes = tabs
      .map((t) => h('div', { 'data-tab': t.name }, t.fields.map((f) => renderField(f, data, ctx))))
      .filter((p) => p.childElementCount);
    for (let i = tabs.length - 1; i >= 0; i--) if (!panes.some((p) => p.dataset.tab === tabs[i].name)) tabs.splice(i, 1);
    if (!panes.length) return h('div', { class: 'muted' }, 'Nothing to translate here.');
    if (tabs.length === 1) return h('div', {}, panes);
    const bar = h('div', { class: 'tabs' }, tabs.map((t, i) => h('button', {
      type: 'button',
      class: i === 0 ? 'active' : '',
      onclick: (e) => {
        bar.querySelectorAll('button').forEach((b) => b.classList.toggle('active', b === e.currentTarget));
        panes.forEach((p) => (p.style.display = p.dataset.tab === t.name ? '' : 'none'));
      },
    }, t.name)));
    panes.forEach((p, i) => (p.style.display = i === 0 ? '' : 'none'));
    return h('div', {}, bar, panes);
  }

  function seoPreviewFactory(getTitle, getPath) {
    return (seo) => {
      const box = h('div', { class: 'card', style: { padding: '14px 16px', marginBottom: '16px', background: '#fff' } });
      const draw = () => {
        const settings = state.settingsCache || {};
        const tpl = (settings.seo && settings.seo.titleTemplate) || '%s';
        const raw = seo.title || getTitle() || '';
        const title = getPath() === '/' ? (seo.title || (settings.seo && settings.seo.defaultTitle) || raw) : tpl.replace('%s', raw);
        const desc = seo.description || (settings.seo && settings.seo.defaultDescription) || '';
        box.replaceChildren(
          h('div', { class: 'muted', style: { fontSize: '11px', marginBottom: '8px', letterSpacing: '.06em', textTransform: 'uppercase' } }, 'Google preview'),
          h('div', { class: 'serp' },
            h('div', { class: 'u' }, (state.siteUrl || '') + getPath()),
            h('div', { class: 't' }, title.length > 62 ? title.slice(0, 60) + '…' : title),
            h('div', { class: 'd' }, desc.length > 162 ? desc.slice(0, 160) + '…' : desc || h('span', { class: 'muted' }, 'Add a meta description…'))));
      };
      draw();
      box.addEventListener('focusin', draw);
      setTimeout(() => box.parentElement && box.parentElement.addEventListener('input', draw), 0);
      return box;
    };
  }

  /**
   * Renders the form with a language switcher when more than one language is configured.
   * Translations are stored in draft.translations[code].
   */
  function languageForm(type, draft, ctx) {
    const langs = state.languages || [];
    const holder = h('div');
    const draw = (code) => {
      if (!code || !langs.length || code === langs[0].code) {
        holder.replaceChildren(buildForm(type, draft, ctx));
        return;
      }
      draft.translations = draft.translations && typeof draft.translations === 'object' ? draft.translations : {};
      draft.translations[code] = draft.translations[code] && typeof draft.translations[code] === 'object' ? draft.translations[code] : {};
      const l = langs.find((x) => x.code === code);
      const def = langs[0].name;
      holder.replaceChildren(
        h('div', { class: 'translate-note' }, icon('globe'),
          h('span', {}, 'You are editing the ' + (l ? l.name : code) + ' version. Empty fields show the ' + def +
            ' text on the website. Images, links and options that are the same in every language are edited in ' + def + '.')),
        buildForm(type, draft.translations[code], { translating: true, base: draft, code }));
    };
    if (langs.length < 2) { draw(); return holder; }
    const bar = h('div', { class: 'lang-tabs', role: 'tablist', 'aria-label': 'Language' }, langs.map((l, i) => h('button', {
      type: 'button',
      role: 'tab',
      lang: l.code,
      class: i === 0 ? 'active' : '',
      'aria-selected': i === 0 ? 'true' : 'false',
      onclick: (e) => {
        bar.querySelectorAll('button').forEach((b) => { b.classList.toggle('active', b === e.currentTarget); b.setAttribute('aria-selected', b === e.currentTarget ? 'true' : 'false'); });
        draw(l.code);
      },
    }, icon('globe'), l.name, i === 0 ? h('small', {}, ' (default)') : null, l.enabled ? null : h('small', {}, ' – hidden on site'))));
    draw();
    return h('div', {}, bar, holder);
  }

  async function loadSettingsCache() {
    if (!state.settingsCache) {
      try { state.settingsCache = await api('/api/admin/singletons/settings'); } catch { state.settingsCache = {}; }
    }
  }

  /* ------------------------------------------------------------------ */
  /* Singleton editor                                                    */
  /* ------------------------------------------------------------------ */

  async function viewSingleton(name) {
    const type = state.types.find((t) => t.name === name);
    if (!type) throw new Error('Unknown page');
    await loadSettingsCache();
    const data = await api(`/api/admin/singletons/${name}`);
    const draft = clone(data);
    const save = h('button', { class: 'btn primary', onclick: async () => {
      save.disabled = true;
      try {
        const saved = await api(`/api/admin/singletons/${name}`, { method: 'PUT', body: draft });
        state.dirty = false;
        if (name === 'settings') {
          state.settingsCache = saved;
          state.siteUrl = (saved.siteUrl || state.siteUrl).replace(/\/$/, '');
          try { state.languages = (await api('/api/admin/schema')).languages || state.languages; } catch { /* ignore */ }
        }
        info.textContent = `Last saved ${fmtDate(saved.updatedAt)}`;
        toast('Saved. The website updates within a few seconds.');
      } catch (e) { toast(e.message, 'err'); }
      save.disabled = false;
    } }, icon('save'), 'Save changes');
    const actions = [save];
    if (type.previewPath) actions.unshift(h('a', { class: 'btn', href: state.siteUrl + type.previewPath, target: '_blank', rel: 'noopener' }, icon('ext'), 'View page'));
    const c = page(type.label, { actions });
    const info = h('div', { class: 'muted', style: { fontSize: '12.5px' } }, `Last saved ${fmtDate(data.updatedAt)}`);
    const ctx = { seoPreview: seoPreviewFactory(() => draft.title || draft.headline || (draft.hero && draft.hero.headline) || type.label, () => type.previewPath || '/') };
    if (type.description) c.append(h('p', { class: 'muted', style: { marginTop: 0 } }, type.description));
    c.append(h('div', { class: 'card pad' }, info, h('div', { style: { height: '14px' } }), languageForm(type, draft, ctx)));
  }

  /* ------------------------------------------------------------------ */
  /* Collections                                                         */
  /* ------------------------------------------------------------------ */

  const pathFor = (type, item) => (type.previewPath || '').replace(':slug', item.slug || '');

  async function viewList(name) {
    const type = state.types.find((t) => t.name === name);
    if (!type) throw new Error('Unknown collection');
    const items = await api(`/api/admin/collections/${name}`);
    const c = page(type.label, { actions: [h('a', { class: 'btn primary', href: `#/item/${name}/new` }, icon('plus'), `New ${type.label.replace(/s$/, '').toLowerCase()}`)] });
    if (type.description) c.append(h('p', { class: 'muted', style: { marginTop: 0 } }, type.description));
    if (!items.length) { c.append(h('div', { class: 'card empty' }, 'Nothing here yet.')); return; }

    const reorder = async (from, to) => {
      const ids = items.map((i) => i.id);
      const [m] = ids.splice(from, 1);
      ids.splice(to, 0, m);
      await api(`/api/admin/collections/${name}/reorder`, { method: 'POST', body: { ids } });
      route();
    };
    const del = async (item) => {
      if (!confirm(`Delete "${item[type.titleField] || 'item'}"? This cannot be undone.`)) return;
      try { await api(`/api/admin/collections/${name}/${item.id}`, { method: 'DELETE' }); toast('Deleted.'); route(); } catch (e) { toast(e.message, 'err'); }
    };
    c.append(h('div', { class: 'card' }, h('table', { class: 'list' },
      h('thead', {}, h('tr', {}, h('th', {}, 'Title'), h('th', {}, 'URL'), h('th', {}, 'Status'), h('th', {}, 'Updated'), h('th', {}))),
      h('tbody', {}, items.map((item, i) => h('tr', {},
        h('td', {}, h('a', { class: 'title', href: `#/item/${name}/${item.id}` }, item[type.titleField] || '(untitled)'),
          item.tagline || item.summary ? h('div', { class: 'muted', style: { fontSize: '12.5px', marginTop: '2px' } }, (item.tagline || item.summary || '').slice(0, 90)) : null),
        h('td', { class: 'muted' }, pathFor(type, item)),
        h('td', {}, h('span', { class: `pill ${item.published ? 'on' : 'off'}` }, item.published ? 'Published' : 'Draft')),
        h('td', { class: 'muted', style: { whiteSpace: 'nowrap' } }, fmtDate(item.updatedAt)),
        h('td', { class: 'actions' },
          h('button', { class: 'btn icon small', title: 'Move up', disabled: i === 0, onclick: () => reorder(i, i - 1) }, icon('up')), ' ',
          h('button', { class: 'btn icon small', title: 'Move down', disabled: i === items.length - 1, onclick: () => reorder(i, i + 1) }, icon('down')), ' ',
          item.published ? h('a', { class: 'btn icon small', title: 'View on site', href: state.siteUrl + pathFor(type, item), target: '_blank', rel: 'noopener' }, icon('ext')) : null, ' ',
          h('button', { class: 'btn icon small danger', title: 'Delete', onclick: () => del(item) }, icon('trash')))))))));
  }

  async function viewItem(name, id) {
    const type = state.types.find((t) => t.name === name);
    if (!type) throw new Error('Unknown collection');
    await loadSettingsCache();
    const isNew = id === 'new';
    const draft = isNew ? { published: true } : await api(`/api/admin/collections/${name}/${id}`);
    const ctx = {
      titleField: type.titleField,
      seoPreview: seoPreviewFactory(() => draft[type.titleField], () => pathFor(type, draft)),
    };
    const save = h('button', { class: 'btn primary', onclick: async () => {
      save.disabled = true;
      try {
        const saved = isNew
          ? await api(`/api/admin/collections/${name}`, { method: 'POST', body: draft })
          : await api(`/api/admin/collections/${name}/${id}`, { method: 'PUT', body: draft });
        state.dirty = false;
        toast('Saved. The website updates within a few seconds.');
        if (isNew) location.hash = `#/item/${name}/${saved.id}`;
        else if (ctx.slugInput) ctx.slugInput.value = saved.slug;
      } catch (e) { toast(e.message, 'err'); }
      save.disabled = false;
    } }, icon('save'), isNew ? 'Create' : 'Save changes');
    const actions = [save];
    if (!isNew && draft.published) actions.unshift(h('a', { class: 'btn', href: state.siteUrl + pathFor(type, draft), target: '_blank', rel: 'noopener' }, icon('ext'), 'View'));
    const c = page(isNew ? `New ${type.label.replace(/s$/, '').toLowerCase()}` : draft[type.titleField] || 'Edit', {
      crumbs: h('a', { href: `#/list/${name}` }, `← ${type.label}`),
      actions,
    });
    const form = languageForm(type, draft, ctx);
    c.append(h('div', { class: 'card pad' }, form));
    // Auto-fill slug from title for new items.
    if (isNew && ctx.titleInput && ctx.slugInput) {
      let touched = false;
      ctx.slugInput.addEventListener('input', () => (touched = true));
      ctx.titleInput.addEventListener('input', () => {
        if (touched) return;
        const s = ctx.titleInput.value.toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
        ctx.slugInput.value = s;
        draft.slug = s;
      });
    }
  }

  /* ------------------------------------------------------------------ */
  /* Media                                                               */
  /* ------------------------------------------------------------------ */

  const isImage = (n) => /\.(png|jpe?g|gif|webp|svg|avif|ico)$/i.test(n);

  function mediaGrid(files, { onPick, onChange } = {}) {
    const grid = h('div', { class: 'media-grid' });
    for (const f of files) {
      const light = /white|light/i.test(f.name);
      const prev = h('div', { class: 'prev', style: isImage(f.name) ? { backgroundImage: `url("${f.url}")` } : {} }, isImage(f.name) ? '' : f.name.split('.').pop().toUpperCase());
      if (onPick) prev.addEventListener('click', () => onPick(f.url));
      grid.append(h('div', { class: `media-item${onPick ? ' selectable' : ''}${light ? ' dark' : ''}` }, prev,
        h('div', { class: 'meta' },
          h('div', { class: 'name', title: f.name }, f.name),
          h('div', { class: 'muted' }, fmtSize(f.size)),
          h('div', { class: 'btns' },
            onPick ? h('button', { class: 'btn small primary', onclick: () => onPick(f.url) }, 'Select') : null,
            h('button', { class: 'btn small icon', title: 'Copy URL', onclick: () => { navigator.clipboard.writeText(f.url); toast('URL copied: ' + f.url); } }, icon('copy')),
            h('button', { class: 'btn small icon danger', title: 'Delete', onclick: async () => {
              if (!confirm(`Delete ${f.name}? Pages using it will show a broken image.`)) return;
              try { await api(`/api/admin/media/${encodeURIComponent(f.name)}`, { method: 'DELETE' }); toast('Deleted.'); onChange && onChange(); } catch (e) { toast(e.message, 'err'); }
            } }, icon('trash'))))));
    }
    if (!files.length) grid.append(h('div', { class: 'muted' }, 'No files uploaded yet.'));
    return grid;
  }

  function dropzone(onDone) {
    const input = h('input', { type: 'file', multiple: true, accept: 'image/*,application/pdf,video/mp4', style: { display: 'none' } });
    const upload = async (files) => {
      if (!files.length) return;
      const fd = new FormData();
      for (const f of files) fd.append('files', f);
      zone.textContent = 'Uploading…';
      try {
        const r = await api('/api/admin/media', { method: 'POST', body: fd });
        toast(`Uploaded ${r.length} file${r.length > 1 ? 's' : ''}.`);
        onDone && onDone(r);
      } catch (e) { toast(e.message, 'err'); }
      zone.replaceChildren(...content());
    };
    const content = () => ['Drag & drop files here, or ', h('a', { href: '#', onclick: (e) => { e.preventDefault(); input.click(); } }, 'browse'), ' (images, PDF, MP4 – max 15 MB)', input];
    const zone = h('div', { class: 'dropzone' }, ...content());
    input.addEventListener('change', () => upload([...input.files]));
    zone.addEventListener('dragover', (e) => { e.preventDefault(); zone.classList.add('over'); });
    zone.addEventListener('dragleave', () => zone.classList.remove('over'));
    zone.addEventListener('drop', (e) => { e.preventDefault(); zone.classList.remove('over'); upload([...e.dataTransfer.files]); });
    return zone;
  }

  async function viewMedia() {
    const c = page('Media library');
    const holder = h('div');
    const load = async () => holder.replaceChildren(mediaGrid(await api('/api/admin/media'), { onChange: load }));
    c.append(dropzone(load), holder);
    await load();
  }

  function pickMedia(cb) {
    const holder = h('div');
    let m;
    const load = async () => holder.replaceChildren(mediaGrid(await api('/api/admin/media'), {
      onPick: (url) => { m.close(); cb(url); },
      onChange: load,
    }));
    m = modal('Choose a file', h('div', {}, dropzone((r) => { if (r.length === 1) { m.close(); cb(r[0].url); } else load(); }), holder));
    load();
  }

  /* ------------------------------------------------------------------ */
  /* Messages                                                            */
  /* ------------------------------------------------------------------ */

  async function viewMessages() {
    const msgs = await api('/api/admin/messages');
    const c = page('Messages');
    if (!msgs.length) { c.append(h('div', { class: 'card empty' }, 'No messages yet. Contact-form submissions appear here.')); return; }
    const open = async (m) => {
      if (!m.read) { await api(`/api/admin/messages/${m.id}`, { method: 'PATCH', body: { read: true } }); refreshUnread(); }
      modal(`Message from ${m.name}`, h('div', { class: 'msg-detail' },
        h('dl', {},
          h('dt', {}, 'Name'), h('dd', {}, m.name),
          h('dt', {}, 'Email'), h('dd', {}, h('a', { href: `mailto:${m.email}` }, m.email)),
          m.phone ? [h('dt', {}, 'Phone'), h('dd', {}, m.phone)] : null,
          m.organisation ? [h('dt', {}, 'Organisation'), h('dd', {}, m.organisation)] : null,
          m.sector ? [h('dt', {}, 'Sector'), h('dd', {}, m.sector)] : null,
          m.product ? [h('dt', {}, 'Interested in'), h('dd', {}, m.product)] : null,
          h('dt', {}, 'Received'), h('dd', {}, fmtDate(m.createdAt))),
        h('div', { class: 'text' }, m.message),
        h('div', { style: { marginTop: '14px' } }, h('a', { class: 'btn primary', href: `mailto:${m.email}?subject=${encodeURIComponent('Re: your enquiry to ASSERT')}` }, 'Reply by email'))), { small: true });
      route();
    };
    c.append(h('div', { class: 'card' }, h('table', { class: 'list' },
      h('thead', {}, h('tr', {}, h('th', {}, 'From'), h('th', {}, 'Subject'), h('th', {}, 'Message'), h('th', {}, 'Received'), h('th', {}))),
      h('tbody', {}, msgs.map((m) => h('tr', { class: m.read ? '' : 'unread' },
        h('td', {}, h('a', { class: 'title', href: '#', onclick: (e) => { e.preventDefault(); open(m); } }, m.name), h('div', { class: 'muted', style: { fontWeight: 400 } }, m.email)),
        h('td', { class: 'muted' }, [m.sector, m.product].filter(Boolean).join(' · ') || '—'),
        h('td', { class: 'muted' }, (m.message || '').slice(0, 70)),
        h('td', { class: 'muted', style: { whiteSpace: 'nowrap' } }, fmtDate(m.createdAt)),
        h('td', { class: 'actions' },
          h('button', { class: 'btn small', onclick: async () => { await api(`/api/admin/messages/${m.id}`, { method: 'PATCH', body: { read: !m.read } }); refreshUnread(); route(); } }, m.read ? 'Mark unread' : 'Mark read'), ' ',
          h('button', { class: 'btn small icon danger', title: 'Delete', onclick: async () => {
            if (!confirm('Delete this message?')) return;
            await api(`/api/admin/messages/${m.id}`, { method: 'DELETE' }); refreshUnread(); route();
          } }, icon('trash')))))))));
  }

  /* ------------------------------------------------------------------ */
  /* Users                                                               */
  /* ------------------------------------------------------------------ */

  function userForm(user, onSaved) {
    const d = { name: user ? user.name : '', email: user ? user.email : '', role: user ? user.role : 'editor', password: '' };
    const field = (label, el, help) => h('div', { class: 'field' }, h('label', {}, label), el, help ? h('div', { class: 'help' }, help) : null);
    const name = h('input', { type: 'text', value: d.name });
    const email = h('input', { type: 'email', value: d.email, disabled: !!user });
    const role = h('select', {}, h('option', { value: 'editor', selected: d.role === 'editor' }, 'Editor – content only'), h('option', { value: 'admin', selected: d.role === 'admin' }, 'Admin – content, settings & users'));
    const pw = h('input', { type: 'password', autocomplete: 'new-password' });
    const m = modal(user ? `Edit ${user.email}` : 'New user', h('form', {
      onsubmit: async (e) => {
        e.preventDefault();
        try {
          const body = { name: name.value, role: role.value };
          if (pw.value) body.password = pw.value;
          if (user) await api(`/api/admin/users/${user.id}`, { method: 'PUT', body });
          else await api('/api/admin/users', { method: 'POST', body: { ...body, email: email.value } });
          m.close(); toast('User saved.'); onSaved();
        } catch (ex) { toast(ex.message, 'err'); }
      },
    },
    field('Name', name), field('Email', email), field('Role', role),
    field(user ? 'New password (optional)' : 'Password', pw, 'At least 10 characters.'),
    h('button', { class: 'btn primary', type: 'submit' }, 'Save')), { small: true });
  }

  async function viewUsers() {
    const users = await api('/api/admin/users');
    const c = page('Users', { actions: [h('button', { class: 'btn primary', onclick: () => userForm(null, route) }, icon('plus'), 'New user')] });
    c.append(h('div', { class: 'card' }, h('table', { class: 'list' },
      h('thead', {}, h('tr', {}, h('th', {}, 'Name'), h('th', {}, 'Role'), h('th', {}, 'Last login'), h('th', {}))),
      h('tbody', {}, users.map((u) => h('tr', {},
        h('td', {}, h('b', { style: { fontWeight: 500 } }, u.name), h('div', { class: 'muted' }, u.email)),
        h('td', {}, h('span', { class: `pill ${u.role === 'admin' ? 'on' : 'off'}` }, u.role)),
        h('td', { class: 'muted' }, fmtDate(u.lastLoginAt)),
        h('td', { class: 'actions' },
          h('button', { class: 'btn small', onclick: () => userForm(u, route) }, 'Edit'), ' ',
          u.id !== state.user.id ? h('button', { class: 'btn small icon danger', title: 'Delete', onclick: async () => {
            if (!confirm(`Delete ${u.email}?`)) return;
            try { await api(`/api/admin/users/${u.id}`, { method: 'DELETE' }); toast('User deleted.'); route(); } catch (e) { toast(e.message, 'err'); }
          } }, icon('trash')) : null)))))));
  }

  /* ------------------------------------------------------------------ */
  /* Backup & account                                                    */
  /* ------------------------------------------------------------------ */

  async function viewBackup() {
    const c = page('Backup & restore');
    const file = h('input', { type: 'file', accept: 'application/json,.json' });
    c.append(
      h('div', { class: 'card pad', style: { marginBottom: '18px' } },
        h('h3', { style: { marginTop: 0, fontWeight: 500 } }, 'Download a backup'),
        h('p', { class: 'muted' }, 'Exports all content, settings and messages as one JSON file. User accounts and uploaded media are not included – copy the uploads folder separately.'),
        h('button', { class: 'btn primary', onclick: async () => {
          const res = await fetch('/api/admin/backup', { headers: { authorization: `Bearer ${state.token}` } });
          if (!res.ok) return toast('Backup failed', 'err');
          const blob = await res.blob();
          const a = h('a', { href: URL.createObjectURL(blob), download: `assert-cms-backup-${new Date().toISOString().slice(0, 10)}.json` });
          document.body.append(a); a.click(); a.remove();
        } }, icon('db'), 'Download backup')),
      h('div', { class: 'card pad' },
        h('h3', { style: { marginTop: 0, fontWeight: 500 } }, 'Restore from a backup'),
        h('p', { class: 'muted' }, 'Replaces the current content with the content in the file. Previous versions are kept in the data folder (.backups).'),
        file, ' ',
        h('button', { class: 'btn danger', onclick: async () => {
          if (!file.files[0]) return toast('Choose a backup file first.', 'err');
          if (!confirm('Replace all current content with this backup?')) return;
          try {
            const json = JSON.parse(await file.files[0].text());
            const r = await api('/api/admin/restore', { method: 'POST', body: json });
            state.settingsCache = null;
            toast(`Restored: ${r.restored.join(', ')}`);
          } catch (e) { toast(e.message, 'err'); }
        } }, 'Restore')));
  }

  async function viewAccount() {
    const c = page('My account');
    const cur = h('input', { type: 'password', autocomplete: 'current-password' });
    const pw = h('input', { type: 'password', autocomplete: 'new-password' });
    const pw2 = h('input', { type: 'password', autocomplete: 'new-password' });
    c.append(h('div', { class: 'card pad', style: { maxWidth: '520px' } },
      h('p', { style: { marginTop: 0 } }, 'Signed in as ', h('b', {}, state.user.email), ` (${state.user.role})`),
      h('form', { onsubmit: async (e) => {
        e.preventDefault();
        if (pw.value !== pw2.value) return toast('The new passwords do not match.', 'err');
        try {
          await api('/api/auth/password', { method: 'POST', body: { current: cur.value, password: pw.value } });
          toast('Password changed.');
          cur.value = pw.value = pw2.value = '';
        } catch (ex) { toast(ex.message, 'err'); }
      } },
      h('div', { class: 'field' }, h('label', {}, 'Current password'), cur),
      h('div', { class: 'field' }, h('label', {}, 'New password'), pw, h('div', { class: 'help' }, 'At least 10 characters.')),
      h('div', { class: 'field' }, h('label', {}, 'Repeat new password'), pw2),
      h('button', { class: 'btn primary', type: 'submit' }, 'Change password'))));
  }

  start();
})();
