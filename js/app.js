/* Algebra Quest app: router, notebook sidebar, lessons, flashcards with spaced review, practice, mixed review,
   chapter challenges and progress. Everything is saved only in this browser. */
(function () {
'use strict';
if (window.top !== window.self) {            // refuse to run inside another site's frame
  document.body.textContent = '';
  const a = document.createElement('a'); a.href = location.href; a.target = '_top'; a.textContent = 'Open Algebra Quest';
  document.body.append(a); return;
}
const AQ = window.AQ, { H, chapters, topicIndex, gens, widgets, pick, shuffle } = AQ;
const DECK = AQ.cards || {};
const CH_COLOR = { 1: 'var(--ch1)', 2: 'var(--ch2)', 3: 'var(--ch3)', 4: 'var(--ch4)' };
const DAY = 864e5;

/* ---------- tiny DOM helper ---------- */
function el(tag, props, ...kids) {
  const e = document.createElement(tag);
  if (props) for (const [k, v] of Object.entries(props)) {
    if (k === 'class') e.className = v; else if (k === 'html') e.innerHTML = v; else if (k === 'text') e.textContent = v;
    else if (k.startsWith('on')) e.addEventListener(k.slice(2), v); else if (v !== false && v != null) e.setAttribute(k, v === true ? '' : v);
  }
  kids.flat().forEach(c => { if (c == null || c === false) return; e.append(c.nodeType ? c : document.createTextNode(c)); });
  return e;
}
const uid = (() => { let n = 0; return () => 'u' + (++n); })();
const plural = (n, w) => n + ' ' + w + (n === 1 ? '' : 's');

/* ---------- cards ---------- */
const ALL_CARDS = []; const CARD_BY_ID = {};
chapters.forEach(c => c.topics.forEach(t => (DECK[t.id] || []).forEach((fb, i) => {
  const card = { id: t.id + ':' + i, tid: t.id, f: fb[0], b: fb[1] }; ALL_CARDS.push(card); CARD_BY_ID[card.id] = card;
})));
const cardsOf = tid => ALL_CARDS.filter(c => c.tid === tid);

/* ---------- saved progress (validated; storage may be blocked) ---------- */
const KEY = 'algebra-quest-v1';
const clampInt = (v, lo, hi) => { v = Math.floor(Number(v)); return Number.isFinite(v) ? Math.max(lo, Math.min(hi, v)) : lo; };
function fresh() { return { xp: 0, best: 0, topics: {}, boss: {}, cards: {}, days: [], theme: '', recall: false, last: '', mixDay: '' }; }
function sanitize(o) {
  const s = fresh(); if (!o || typeof o !== 'object') return s;
  s.xp = clampInt(o.xp, 0, 1e7); s.best = clampInt(o.best, 0, 1e5);
  Object.keys(topicIndex).forEach(id => {
    const t = o.topics && o.topics[id];
    if (t && typeof t === 'object') s.topics[id] = { tried: clampInt(t.tried, 0, 1e5), first: clampInt(t.first, 0, 1e5), miss: clampInt(t.miss, 0, 1e5), last: clampInt(t.last, 0, 1e13), read: t.read ? 1 : 0 };
  });
  [1, 2, 3, 4].forEach(n => { if (o.boss && o.boss[n] !== undefined) s.boss[n] = clampInt(o.boss[n], 0, 100); });
  if (o.cards && typeof o.cards === 'object') Object.keys(o.cards).forEach(id => { const c = o.cards[id]; if (CARD_BY_ID[id] && c && typeof c === 'object') s.cards[id] = { b: clampInt(c.b, 0, 6), d: clampInt(c.d, 0, 1e13) }; });
  if (Array.isArray(o.days)) s.days = o.days.filter(d => typeof d === 'string' && /^\d{4}-\d\d-\d\d$/.test(d)).slice(-400);
  s.theme = o.theme === 'dark' || o.theme === 'light' ? o.theme : '';
  s.recall = !!o.recall;
  s.last = typeof o.last === 'string' && topicIndex[o.last] ? o.last : '';
  s.mixDay = typeof o.mixDay === 'string' && /^\d{4}-\d\d-\d\d$/.test(o.mixDay) ? o.mixDay : '';
  return s;
}
let store; try { store = sanitize(JSON.parse(localStorage.getItem(KEY))); } catch (e) { store = fresh(); }
function save() { try { localStorage.setItem(KEY, JSON.stringify(store)); } catch (e) { /* storage blocked: progress lasts for this visit only */ } refreshSide(); }

const pad = n => String(n).padStart(2, '0');
const dayKey = d => d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
const today = () => dayKey(new Date());
function markStudy() { const t = today(); if (!store.days.includes(t)) { store.days.push(t); store.days = store.days.slice(-400); } }
function dayStreak() {
  const has = new Set(store.days), d = new Date(); let n = 0;
  if (!has.has(dayKey(d))) d.setDate(d.getDate() - 1);
  while (has.has(dayKey(d))) { n++; d.setDate(d.getDate() - 1); }
  return n;
}

const STAR_AT = [3, 8, 15];
const tStat = id => store.topics[id] || { tried: 0, first: 0, miss: 0, last: 0, read: 0 };
const tMut = id => store.topics[id] || (store.topics[id] = { tried: 0, first: 0, miss: 0, last: 0, read: 0 });
const starsOf = id => STAR_AT.filter(n => tStat(id).first >= n).length;
const starHTML = n => '<span class="stars" aria-label="' + n + ' of 3 stars">' + [0, 1, 2].map(i => i < n ? '<b>★</b>' : '★').join('') + '</span>';
const cs = id => store.cards[id] || { b: 0, d: 0 };
const memPct = tid => { const cc = cardsOf(tid); return cc.length ? Math.round(100 * cc.reduce((s, c) => s + Math.min(cs(c.id).b, 5), 0) / (5 * cc.length)) : 0; };
const isDue = (c, now) => cs(c.id).b >= 1 && cs(c.id).d <= now;
const dueCards = () => { const now = Date.now(); return ALL_CARDS.filter(c => isDue(c, now)); };
const newCards = tid => cardsOf(tid).filter(c => cs(c.id).b === 0);
const learnedCount = tid => cardsOf(tid).filter(c => cs(c.id).b >= 2).length;
/* Leitner boxes: forgot → box 1 and see it again this session; shaky → tomorrow; knew it → next box, longer gap */
const GAP = [0, 1, 3, 7, 16, 35, 60];
function rateCard(id, r) {
  const c = { ...cs(id) }, now = Date.now();
  if (r === 1) { c.b = 1; c.d = now; }
  else if (r === 2) { c.b = Math.max(1, c.b); c.d = now + DAY; }
  else { c.b = Math.min(6, c.b === 0 ? 2 : c.b + 1); c.d = now + GAP[c.b] * DAY; }
  store.cards[id] = c; store.xp += r === 3 ? 2 : 1; markStudy(); save();
  return c;
}
const whenText = ms => { const d = Math.round((ms - Date.now()) / DAY); return d <= 0 ? 'later today' : d === 1 ? 'tomorrow' : 'in ' + d + ' days'; };

function toast(msg) { document.querySelectorAll('.toast').forEach(t => t.remove()); const t = el('div', { class: 'toast', role: 'status', text: msg }); document.body.append(t); setTimeout(() => t.remove(), 2800); }

/* ---------- theme ---------- */
const sysDark = () => window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches;
const isDark = () => store.theme ? store.theme === 'dark' : sysDark();
function applyTheme() {
  document.documentElement.dataset.theme = isDark() ? 'dark' : 'light';
  const m = document.querySelector('meta[name=theme-color]'); if (m) m.setAttribute('content', isDark() ? '#1b2031' : '#f2ecdc');
}

/* ---------- sidebar ---------- */
const side = document.getElementById('side'), mtop = document.getElementById('mtop');
let current = { page: 'home' };
const openCh = new Set();
let deferredInstall = null;
function brand() {
  return el('a', { class: 'brand', href: '#/' }, el('img', { src: 'icon.svg', alt: '', width: 38, height: 38 }),
    el('div', null, el('div', { class: 'bt', html: 'Algebra <i>Quest</i>' }), el('small', { text: 'Study notebook' })));
}
function mdots(tid) {
  const s = el('span', { class: 'mdots', title: 'Lesson read · cards learned · practice star' });
  [tStat(tid).read, learnedCount(tid) >= Math.ceil(cardsOf(tid).length / 2), starsOf(tid) >= 1].forEach(on => s.append(el('i', { class: on ? 'on' : '' })));
  return s;
}
function refreshSide() {
  const due = dueCards().length, p = current;
  const badge = n => el('span', { class: 'badge' + (n ? '' : ' zero'), text: String(n) });
  const nav = (href, ic, text, on, extra) => el('a', { class: 'snav' + (on ? ' on' : ''), href }, el('span', { class: 'ic', text: ic }), text, extra || null);
  const groups = chapters.map(c => {
    const open = openCh.has(c.n) || p.ch === c.n;
    const d = el('details', { class: 'sch', style: '--c:' + CH_COLOR[c.n], open: open || null },
      el('summary', null, el('span', { class: 'num', text: String(c.n) }), el('span', { text: c.title }), el('span', { class: 'chev', text: '▶' })),
      ...c.topics.map(t => el('a', { class: 'sq' + (p.tid === t.id ? ' on' : ''), href: '#/ch/' + c.n + '/' + t.id }, el('span', { text: t.title }), mdots(t.id))),
      el('a', { class: 'sq extra' + (p.ch === c.n && p.page === 'boss' ? ' on' : ''), href: '#/ch/' + c.n + '/boss', text: '🏁 Chapter challenge' }),
      el('a', { class: 'sq extra' + (p.ch === c.n && p.page === 'cheat' ? ' on' : ''), href: '#/ch/' + c.n + '/cheat', text: '🗒️ Cheat sheet' }));
    d.addEventListener('toggle', () => { if (d.open) openCh.add(c.n); else openCh.delete(c.n); });
    return d;
  });
  const themeBtn = el('button', { class: 'toggle', type: 'button', text: isDark() ? '☀️  Daylight mode' : '🌙  Night study mode' });
  themeBtn.addEventListener('click', () => { store.theme = isDark() ? 'light' : 'dark'; applyTheme(); save(); });
  const install = el('button', { class: 'toggle', type: 'button', hidden: !deferredInstall, text: '⬇️  Install as an app' });
  install.addEventListener('click', () => { if (deferredInstall) { deferredInstall.prompt(); deferredInstall = null; install.hidden = true; } });
  side.replaceChildren(brand(),
    nav('#/', '🏠', 'Today', p.page === 'home'),
    nav('#/review', '🔁', 'Review', p.page === 'review', badge(due)),
    nav('#/progress', '📈', 'My progress', p.page === 'progress'),
    el('div', { class: 'sgroup' }, el('div', { class: 'slabel', text: 'Chapters' }), ...groups),
    el('div', { class: 'sfoot' }, el('div', { class: 'xpline' }, el('span', { text: '🔥 ' + plural(dayStreak(), 'day') + ' in a row' }), el('b', { text: store.xp + ' XP' })), themeBtn, install));
  const mbtn = el('button', { class: 'menubtn', type: 'button', 'aria-label': 'Open menu', 'aria-expanded': String(document.body.classList.contains('menu-open')), text: '☰' });
  mbtn.addEventListener('click', () => { document.body.classList.add('menu-open'); mbtn.setAttribute('aria-expanded', 'true'); const f = side.querySelector('a'); if (f) f.focus(); });
  const mb = brand(); mb.querySelector('img').setAttribute('width', 32);
  mtop.replaceChildren(mbtn, mb, el('a', { class: 'badge' + (due ? '' : ' zero'), href: '#/review', title: 'Cards due for review', text: '🔁 ' + due }));
}
document.getElementById('scrim').addEventListener('click', () => document.body.classList.remove('menu-open'));
document.addEventListener('keydown', e => { if (e.key === 'Escape' && document.body.classList.contains('menu-open')) document.body.classList.remove('menu-open'); });
window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); deferredInstall = e; refreshSide(); });

/* ---------- lesson blocks ---------- */
function signChart(b) {
  const n = b.pts.length, Wd = 560, gap = (Wd - 60) / (n + 1), X = i => 30 + gap * (i + 1);
  let s = `<svg viewBox="0 0 ${Wd} 100" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="sign chart"><line class="axis" x1="14" y1="46" x2="${Wd - 14}" y2="46"/>`;
  b.pts.forEach((p, i) => { s += `<circle class="pt c-w" cx="${X(i)}" cy="46" r="6"/><text class="tick" x="${X(i)}" y="76" text-anchor="middle" font-size="14">${AQ.escHtml(p)}</text>`; });
  b.signs.forEach((g, i) => { const x = i === 0 ? X(0) - gap / 2 : i === n ? X(n - 1) + gap / 2 : (X(i - 1) + X(i)) / 2; s += `<text x="${x}" y="30" text-anchor="middle" font-size="26" font-weight="800" fill="${g === '+' ? 'var(--good)' : 'var(--bad)'}">${g === '-' ? '−' : g}</text>`; });
  return s + '</svg>';
}
function renderBlock(b) {
  switch (b.t) {
    case 'p': return el('div', { class: 'p', html: H(b.h) });
    case 'rule': {
      const box = el('div', { class: 'callout rule' }), body = el('div', { class: 'cbody', html: H(b.h) });
      const cover = el('button', { class: 'cover', type: 'button', html: '🙈 Say this rule from memory, then tap to check' });
      cover.addEventListener('click', () => { box.classList.add('shown'); });
      box.append(el('span', { class: 'ttl', text: b.title || 'Key rule' }), cover, body); return box;
    }
    case 'trap': return el('div', { class: 'callout trap' }, el('span', { class: 'ttl', text: '⚠️ Common trap' }), el('div', { html: H(b.h) }));
    case 'tip': return el('div', { class: 'callout tip' }, el('span', { class: 'ttl', text: '💡 Tip' }), el('div', { html: H(b.h) }));
    case 'list': return el('ul', { html: b.items.map(i => '<li>' + H(i) + '</li>').join('') });
    case 'signchart': return el('figure', { class: 'signchart', html: signChart(b) + '<figcaption>' + H('~' + b.label + '~: ' + (b.note || '')) + '</figcaption>' });
    case 'widget': {
      const host = el('div'), box = el('div', { class: 'widget' }, el('div', { class: 'wt', text: b.title || 'Try it' }), host);
      if (widgets[b.id]) try { widgets[b.id](host); } catch (e) { host.textContent = 'This lab could not load.'; }
      return box;
    }
    case 'example': {
      const ol = el('ol'), steps = b.steps.map(s => { const li = el('li', { html: H(s), hidden: true }); ol.append(li); return li; });
      let shown = 0;
      const next = el('button', { class: 'btn small primary', type: 'button' }), all = el('button', { class: 'btn small', type: 'button', text: 'Show all steps' }), hide = el('button', { class: 'btn small ghost', type: 'button', text: 'Hide' });
      const hintText = el('span', { class: 'predict' });
      const sync = () => {
        steps.forEach((li, i) => { li.hidden = i >= shown; });
        next.disabled = shown >= steps.length; next.textContent = shown === 0 ? 'Reveal step 1' : shown >= steps.length ? 'All steps shown' : 'Reveal step ' + (shown + 1);
        hide.hidden = shown === 0; all.hidden = shown >= steps.length;
        hintText.textContent = shown < steps.length ? 'Predict the next step on paper first.' : 'Now cover it and redo it yourself.';
      };
      next.addEventListener('click', () => { shown++; sync(); }); all.addEventListener('click', () => { shown = steps.length; sync(); }); hide.addEventListener('click', () => { shown = 0; sync(); });
      sync();
      return el('div', { class: 'example' }, el('div', { class: 'eh', text: '✏️ Worked example' }), el('div', { class: 'prob', html: H(b.title) }), ol, el('div', { class: 'ctl' }, next, all, hide, hintText));
    }
  }
  return el('div');
}

/* ---------- practice problem runner ---------- */
const KEYS = [['^', '^'], ['( )', '()'], ['/', '/'], ['√', 'sqrt('], ['π', 'pi'], ['∞', 'inf'], ['∪', ' U '], ['i', 'i'], ['| |', '||'], ['log_', 'log_'], ['ln', 'ln(']];
let lastInput = null;
function mathKeys() {
  const row = el('div', { class: 'keys', hidden: true, role: 'group', 'aria-label': 'Math keys' });
  KEYS.forEach(([label, ins]) => {
    const b = el('button', { class: 'chip', type: 'button', text: label, 'aria-label': 'insert ' + label });
    b.addEventListener('mousedown', e => e.preventDefault());
    b.addEventListener('click', () => {
      const inp = lastInput; if (!inp || !inp.isConnected || inp.disabled) return;
      const s = inp.selectionStart == null ? inp.value.length : inp.selectionStart, t = inp.selectionEnd == null ? s : inp.selectionEnd;
      inp.value = inp.value.slice(0, s) + ins + inp.value.slice(t);
      const pos = s + (ins === '()' || ins === '||' ? 1 : ins.length); inp.focus(); inp.setSelectionRange(pos, pos); inp.dispatchEvent(new Event('input', { bubbles: true }));
    });
    row.append(b);
  });
  const tog = el('button', { class: 'keytoggle', type: 'button', text: '⌨ Math keys' });
  tog.addEventListener('click', () => { row.hidden = !row.hidden; });
  return el('div', null, tog, row, el('div', { class: 'note', text: 'Type fractions as 3/4, powers as x^2, roots as sqrt(5), infinity as inf, and separate several answers with commas.' }));
}
function renderProblem(host, p, o) {
  host.replaceChildren();
  let attempts = 0, hintsUsed = 0, finished = false, solvedReported = false;
  const values = {}, boxes = {};
  const card = el('div', { class: 'pcard' });
  card.append(el('div', { class: 'pmeta' }, el('span', { text: o.label || '' }), el('span', { text: o.right || '' })));
  if (p.visual) card.append(el('div', { class: 'plotbox', html: p.visual }));
  card.append(el('div', { class: 'pprompt', html: H(p.prompt) }));
  const form = el('form', { class: 'pform', novalidate: true, autocomplete: 'off' }), fieldsBox = el('div', { class: 'fields' });
  let firstInput = null, hasText = false;
  p.fields.forEach(f => {
    const id = uid(), msg = el('div', { class: 'fmsg', 'aria-live': 'polite' }); let ctl;
    if (f.kind === 'choice' || f.kind === 'multi') {
      const multi = f.kind === 'multi'; values[f.key] = multi ? [] : null;
      ctl = el('div', { class: 'pills', role: multi ? 'group' : 'radiogroup', 'aria-labelledby': id });
      f.options.forEach(opt => {
        const b = el('button', { type: 'button', class: 'pillbtn', text: opt.l, role: multi ? undefined : 'radio', [multi ? 'aria-pressed' : 'aria-checked']: 'false' });
        b.addEventListener('click', () => {
          if (finished) return;
          if (multi) { const v = values[f.key], i = v.indexOf(opt.k); if (i < 0) v.push(opt.k); else v.splice(i, 1); b.setAttribute('aria-pressed', String(v.includes(opt.k))); }
          else { values[f.key] = opt.k; ctl.querySelectorAll('.pillbtn').forEach(x => x.setAttribute('aria-checked', 'false')); b.setAttribute('aria-checked', 'true'); }
          ctl.querySelectorAll('.pillbtn').forEach(x => x.classList.remove('ok', 'bad'));
          msg.textContent = ''; msg.className = 'fmsg';
        });
        ctl.append(b);
      });
      boxes[f.key] = { ctl, msg, kind: f.kind };
      fieldsBox.append(el('div', { class: 'fld' }, el('div', { class: 'lab', id, text: f.label }), ctl, msg));
    } else {
      hasText = true; values[f.key] = '';
      const inp = el('input', { type: 'text', id, autocomplete: 'off', autocapitalize: 'off', spellcheck: 'false', placeholder: f.ph || '', inputmode: 'text' });
      inp.addEventListener('input', () => { values[f.key] = inp.value; inp.className = ''; msg.textContent = ''; msg.className = 'fmsg'; });
      inp.addEventListener('focus', () => { lastInput = inp; });
      if (!firstInput) firstInput = inp;
      boxes[f.key] = { ctl: inp, msg, kind: 'text' };
      fieldsBox.append(el('div', { class: 'fld' }, el('label', { class: 'lab', for: id, text: f.label }), inp, msg));
    }
  });
  form.append(fieldsBox);
  if (hasText) form.append(mathKeys());
  const feed = el('div', { class: 'feed', role: 'status', 'aria-live': 'polite' }), hintsBox = el('div', { class: 'hints' }), solBox = el('div', { class: 'sol', hidden: true }), nextBox = el('div', { class: 'pnext' });
  const checkBtn = el('button', { class: 'btn primary', type: 'submit', text: 'Check answer' });
  const hintBtn = el('button', { class: 'btn', type: 'button', text: '💡 Hint (0/' + p.hints.length + ')' });
  const showBtn = el('button', { class: 'btn ghost', type: 'button', text: 'Show the worked answer' });
  form.append(el('div', { class: 'pactions' }, checkBtn, hintBtn, showBtn));
  const say = (cls, html) => { feed.className = 'feed ' + cls; feed.innerHTML = html; };
  const lock = () => { finished = true; checkBtn.disabled = hintBtn.disabled = showBtn.disabled = true; card.querySelectorAll('input').forEach(i => { i.disabled = true; }); card.querySelectorAll('.pillbtn').forEach(b => { b.disabled = true; }); };
  const goNext = el('button', { class: 'btn hot', type: 'button', text: o.nextLabel || 'Next problem →' });
  goNext.addEventListener('click', () => o.onNext && o.onNext());
  const report = r => { if (solvedReported) return; solvedReported = true; o.onSolved && o.onSolved(r); };

  form.addEventListener('submit', e => {
    e.preventDefault(); if (finished) return;
    const empty = p.fields.filter(f => f.kind === 'choice' ? values[f.key] == null : f.kind === 'multi' ? !values[f.key].length : !String(values[f.key]).trim());
    if (empty.length) { say('info', 'Fill in every box first, then press Check.'); const b = boxes[empty[0].key]; if (b && b.ctl.focus) b.ctl.focus(); return; }
    attempts++;
    let good = 0;
    p.fields.forEach(f => {
      let r; try { r = f.check(values[f.key]); } catch (err) { r = AQ.NO(AQ.READ_FAIL); }
      const b = boxes[f.key];
      if (r.ok) good++;
      if (b.kind === 'text') { b.ctl.className = ''; void b.ctl.offsetWidth; b.ctl.className = r.ok ? 'ok' : 'bad'; }
      else b.ctl.querySelectorAll('.pillbtn').forEach(x => { x.classList.toggle('ok', r.ok); x.classList.toggle('bad', !r.ok); });
      b.msg.className = 'fmsg' + (r.ok ? ' good' : ''); b.msg.textContent = r.ok ? '✓ Correct' : r.msg;
    });
    if (good === p.fields.length) {
      const first = attempts === 1 && hintsUsed === 0, xp = first ? 10 : 6;
      lock(); say('good', first ? '✅ <b>Correct on the first try!</b> +' + xp + ' XP' : '✅ <b>Correct!</b> +' + xp + ' XP. First-try answers without hints count toward stars.');
      report({ firstTry: first, revealed: false, attempts, hintsUsed, xp }); nextBox.append(goNext); goNext.focus({ preventScroll: true });
    } else say('bad', good ? '<b>Partly there.</b> ' + good + ' of ' + p.fields.length + ' boxes are right. Fix the red ones, or take a hint.' : '<b>Not yet.</b> Read the note under the box. Then fix it or take a hint.');
  });
  hintBtn.addEventListener('click', () => {
    if (hintsUsed >= p.hints.length) return;
    hintsBox.append(el('div', { class: 'hint', html: '<b>Hint ' + (hintsUsed + 1) + ':</b> ' + H(p.hints[hintsUsed]) })); hintsUsed++;
    hintBtn.textContent = '💡 Hint (' + hintsUsed + '/' + p.hints.length + ')'; if (hintsUsed >= p.hints.length) hintBtn.disabled = true;
  });
  showBtn.addEventListener('click', () => {
    if (finished) return; lock();
    solBox.hidden = false;
    solBox.append(el('h4', { text: 'Worked answer' }), ...p.fields.map(f => el('div', { class: 'ans', html: '<b>' + AQ.escHtml(f.label) + '</b> ' + H(String(f.answer)) })), el('ol', { html: p.solution.map(s => '<li>' + H(s) + '</li>').join('') }));
    say('info', 'Study each step, then try the next problem without looking. Revealed answers don’t count toward stars.');
    report({ firstTry: false, revealed: true, attempts, hintsUsed, xp: 0 }); nextBox.append(goNext);
  });
  card.append(form, hintsBox, feed, solBox, nextBox); host.append(card);
  if (firstInput && o.autofocus !== false) firstInput.focus({ preventScroll: true });
}
function recordProblem(tid, r) {
  const before = starsOf(tid), t = tMut(tid);
  t.tried++; if (r.firstTry) t.first++; else t.miss++; t.last = Date.now();
  store.xp += r.xp; markStudy(); save();
  if (starsOf(tid) > before) toast('⭐ New star on “' + topicIndex[tid].title + '”!');
}
function makeProblem(ids) {
  for (let i = 0; i < 8; i++) { try { const p = gens[pick(ids)](); if (p && p.prompt) return p; } catch (e) { /* try another generator */ } }
  throw new Error('no generator available');
}

/* ---------- topic practice ---------- */
function runPractice(host, topic) {
  const sess = { solved: 0, first: 0, streak: 0 }, bar = el('div', { class: 'session' }), stage = el('div');
  host.append(bar, stage); let last = '';
  const upd = () => bar.replaceChildren(el('span', { class: 'pill', html: 'Solved <b>' + sess.solved + '</b>' }), el('span', { class: 'pill', html: 'First try <b>' + sess.first + '</b>' }), el('span', { class: 'pill', html: 'Streak 🔥 <b>' + sess.streak + '</b>' }), el('span', { class: 'pill', html: 'Stars ' + starHTML(starsOf(topic.id)) + ' <span class="note">(' + STAR_AT.join(' / ') + ' first-try)</span>' }));
  const nextProblem = () => {
    let p; for (let i = 0; i < 6; i++) { p = makeProblem(topic.practice); if (p.prompt !== last) break; } last = p.prompt;
    renderProblem(stage, p, {
      label: 'Problem ' + (sess.solved + 1), right: topic.title,
      onSolved: r => { if (r.firstTry) { sess.first++; sess.streak++; } else sess.streak = 0; sess.solved++; store.best = Math.max(store.best, sess.streak); recordProblem(topic.id, r); upd(); },
      onNext: () => { nextProblem(); stage.scrollIntoView({ block: 'nearest' }); }
    });
  };
  upd(); nextProblem();
}

/* ---------- flashcards ---------- */
let keyHandler = null;
document.addEventListener('keydown', e => { if (keyHandler && !e.altKey && !e.ctrlKey && !e.metaKey && !/^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName)) keyHandler(e); });
function runCards(host, list, o) {
  o = o || {};
  const queue = list.slice(), tally = { 1: 0, 2: 0, 3: 0 }, total = list.length; let doneCount = 0, cur = null, flipped = false;
  const wrap = el('div', { class: 'fcwrap' }); host.append(wrap);
  const draw = () => {
    if (!queue.length) return finish();
    cur = queue.shift(); flipped = false;
    const t = topicIndex[cur.tid], ch = t.ch, st = cs(cur.id);
    const meter = el('i'); meter.style.width = Math.round(100 * doneCount / Math.max(1, total)) + '%';
    const tag = (side) => el('div', { class: 'tag' }, el('span', { class: 'tc', text: 'Ch ' + ch + ' · ' + t.title }), el('span', { text: side }));
    const front = el('div', { class: 'fc-face fc-front' }, tag(st.b ? 'Box ' + st.b : 'New card'), el('div', { class: 'q', html: H(cur.f) }));
    const back = el('div', { class: 'fc-face fc-back', 'aria-hidden': 'true' }, tag('Answer'), el('div', { class: 'qq', html: H(cur.f) }), el('div', { class: 'a', html: H(cur.b) }));
    const fc = el('div', { class: 'fc', style: '--c:' + CH_COLOR[ch] }, el('div', { class: 'fc-in' }, front, back));
    const flipBtn = el('button', { class: 'btn primary big', type: 'button', text: 'I have my answer. Flip it' });
    const rates = el('div', { class: 'fcact', hidden: true },
      el('button', { class: 'rate r1', type: 'button', 'data-r': '1', html: 'Forgot <small>see it again soon</small>' }),
      el('button', { class: 'rate r2', type: 'button', 'data-r': '2', html: 'Shaky <small>back tomorrow</small>' }),
      el('button', { class: 'rate r3', type: 'button', 'data-r': '3', html: 'Knew it <small>back in ' + GAP[Math.min(6, st.b === 0 ? 2 : st.b + 1)] + ' days</small>' }));
    const flip = () => { if (flipped) return; flipped = true; fc.classList.add('flipped'); back.removeAttribute('aria-hidden'); front.setAttribute('aria-hidden', 'true'); flipBtn.hidden = true; rates.hidden = false; rates.querySelector('.r3').focus({ preventScroll: true }); };
    const rate = r => { if (!flipped) return; tally[r]++; rateCard(cur.id, r); if (r === 1) queue.push(cur); else doneCount++; draw(); };
    flipBtn.addEventListener('click', flip); fc.addEventListener('click', flip);
    rates.addEventListener('click', e => { const b = e.target.closest('[data-r]'); if (b) rate(+b.dataset.r); });
    keyHandler = e => { if ((e.key === ' ' || e.key === 'Enter') && !flipped) { e.preventDefault(); flip(); } else if (flipped && /^[123]$/.test(e.key)) { e.preventDefault(); rate(+e.key); } };
    wrap.replaceChildren(el('div', { class: 'fcbar' }, el('span', { text: doneCount + ' / ' + total + ' done' }), el('div', { class: 'bar', style: '--c:' + CH_COLOR[ch] }, meter), el('span', { text: queue.length ? plural(queue.length, 'card') + ' left' : 'last card' })),
      fc, el('div', { class: 'fcact' }, flipBtn), rates,
      el('div', { class: 'fchelp', html: 'Answer out loud or on paper <b>before</b> you flip. Be honest when you rate: it decides when the card comes back. Keys: <kbd>Space</kbd> flip, <kbd>1</kbd> <kbd>2</kbd> <kbd>3</kbd> rate.' }));
    flipBtn.focus({ preventScroll: true });
  };
  const finish = () => {
    keyHandler = null;
    const next = list.map(c => cs(c.id).d).filter(d => d > Date.now()).sort((a, b) => a - b)[0];
    const box = el('div', { class: 'boxes', 'aria-label': 'cards per memory box' });
    const counts = [1, 2, 3, 4, 5, 6].map(b => list.filter(c => cs(c.id).b === b).length), mx = Math.max(1, ...counts);
    counts.forEach((n, i) => { const bar = el('i'); bar.style.height = Math.max(3, Math.round(64 * n / mx)) + 'px'; box.append(el('div', null, el('span', { text: String(n) }), bar, el('span', { text: 'Box ' + (i + 1) }))); });
    wrap.replaceChildren(el('div', { class: 'result' },
      el('div', { class: 'kicker', text: 'Deck finished' }), el('div', { class: 'big', text: tally[3] + ' / ' + total }), el('h2', { text: tally[3] === total ? 'Perfect recall! 🧠' : tally[3] >= total / 2 ? 'Solid. The shaky ones come back soon.' : 'Good start. Repetition does the work.' }),
      el('p', { class: 'sub', text: 'Knew it: ' + tally[3] + ' · Shaky: ' + tally[2] + ' · Forgot (then relearned): ' + tally[1] + '. ' + (next ? 'Your next review is ' + whenText(next) + '.' : '') }),
      el('div', { class: 'kicker', text: 'Where these cards live now' }), box,
      el('p', { class: 'note', text: 'Each “Knew it” moves a card up a box, and higher boxes wait longer before coming back (1, 3, 7, 16, 35, 60 days). That spacing is what moves facts into long-term memory.' }),
      el('div', { class: 'pactions' }, ...(o.after || []), el('button', { class: 'btn', type: 'button', text: 'Run this deck again', onclick: () => { host.replaceChildren(); runCards(host, list, o); } }))));
  };
  draw();
}

/* ---------- mixed review & chapter challenge ---------- */
const genTopic = {}; chapters.forEach(c => c.topics.forEach(t => t.practice.forEach(g => { genTopic[g] = t; })));
function runSet(host, items, o) {
  const results = []; let idx = 0; const stage = el('div'); host.append(stage);
  const step = () => {
    if (idx >= items.length) return o.finish(results, stage);
    const it = items[idx]; let p; try { p = gens[it.gid](); } catch (e) { p = makeProblem(topicIndex[it.tid].practice); }
    renderProblem(stage, p, {
      label: o.label + ' ' + (idx + 1) + ' of ' + items.length, right: topicIndex[it.tid].title, nextLabel: idx === items.length - 1 ? 'See my results →' : 'Next →',
      onSolved: r => { results[idx] = { tid: it.tid, firstTry: r.firstTry, revealed: r.revealed }; recordProblem(it.tid, r); }, onNext: () => { idx++; step(); window.scrollTo(0, 0); }
    });
  };
  step();
}
function revisitList(results, ch) {
  const missed = [...new Set(results.filter(r => r && !r.firstTry).map(r => r.tid))].map(id => topicIndex[id]);
  return missed.length ? el('div', null, el('h3', { text: 'Worth another look' }), el('ul', null, ...missed.map(t => el('li', null, el('a', { href: '#/ch/' + t.ch + '/' + t.id, text: t.title }), ' · ', el('a', { href: '#/ch/' + t.ch + '/' + t.id + '/cards', text: 'flashcards' })))))
    : el('p', { text: 'Every problem right on the first try. Nothing to revisit!' });
}
function runBoss(host, ch) {
  const pool = ch.topics.flatMap(t => t.practice.map(g => ({ gid: g, tid: t.id })));
  const topics = shuffle(ch.topics.slice()), items = [];
  while (items.length < 10) topics.forEach(t => { if (items.length < 10) items.push({ gid: pick(t.practice), tid: t.id }); });
  void pool;
  runSet(host, shuffle(items), {
    label: 'Challenge', finish: (results, stage) => {
      const total = results.reduce((s, r) => s + (!r || r.revealed ? 0 : r.firstTry ? 10 : 5), 0), prev = store.boss[ch.n] || 0;
      store.boss[ch.n] = Math.max(prev, total); if (total >= 70) store.xp += 25; save();
      const label = total >= 90 ? 'Exam ready 🏆' : total >= 70 ? 'Sharp 🔥' : total >= 50 ? 'Getting there 💪' : 'Keep training 🧠';
      stage.replaceChildren(el('div', { class: 'result' },
        el('div', { class: 'kicker', text: 'Chapter ' + ch.n + ' challenge complete' }), el('div', { class: 'big', text: total + ' / 100' }), el('h2', { text: label }),
        el('p', { class: 'sub', text: total > prev ? 'New personal best!' + (total >= 70 ? ' +25 bonus XP.' : '') : 'Your best so far: ' + store.boss[ch.n] + ' / 100.' }),
        revisitList(results, ch),
        el('div', { class: 'pactions' }, el('button', { class: 'btn hot', type: 'button', text: 'New challenge', onclick: () => { host.replaceChildren(); runBoss(host, ch); } }), el('a', { class: 'btn', href: '#/ch/' + ch.n, text: 'Back to chapter' }))));
    }
  });
}
function mixTopics() { return Object.keys(topicIndex).filter(id => tStat(id).tried > 0); }
function runMix(host) {
  const ids = mixTopics(), now = Date.now(), items = []; let prevT = '';
  const weight = id => { const s = tStat(id); return 1 + 4 * (s.miss / Math.max(1, s.tried)) + Math.min(3, (now - s.last) / DAY / 2); };
  for (let k = 0; k < 8; k++) {
    const cand = ids.length > 1 ? ids.filter(i => i !== prevT) : ids, tot = cand.reduce((s, i) => s + weight(i), 0);
    let r = Math.random() * tot, tid = cand[0]; for (const i of cand) { r -= weight(i); if (r <= 0) { tid = i; break; } }
    items.push({ tid, gid: pick(topicIndex[tid].practice) }); prevT = tid;
  }
  runSet(host, items, {
    label: 'Review', finish: (results, stage) => {
      store.mixDay = today(); save();
      const right = results.filter(r => r && r.firstTry).length;
      stage.replaceChildren(el('div', { class: 'result' }, el('div', { class: 'kicker', text: 'Daily mixed review' }), el('div', { class: 'big', text: right + ' / ' + items.length }), el('h2', { text: right === items.length ? 'Flawless mix! 🎯' : 'Nice work. Mixing topics is harder, and that’s the point.' }),
        el('p', { class: 'sub', text: 'On a test, problems don’t tell you which chapter they’re from. Recognizing the right method is half the skill, and mixed review trains it.' }),
        revisitList(results), el('div', { class: 'pactions' }, el('button', { class: 'btn hot', type: 'button', text: 'Another mixed set', onclick: () => { host.replaceChildren(); runMix(host); } }), el('a', { class: 'btn', href: '#/', text: 'Back to Today' }))));
    }
  });
}

/* ---------- pages ---------- */
function nextStepFor(tid) {
  const t = topicIndex[tid], base = '#/ch/' + t.ch + '/' + tid;
  if (!tStat(tid).read) return { href: base, label: 'Read the lesson', icon: '📖' };
  if (newCards(tid).length) return { href: base + '/cards', label: 'Learn the flashcards', icon: '📇' };
  return { href: base + '/practice', label: 'Practice problems', icon: '🎯' };
}
function suggestTopic() {
  if (store.last) { const t = topicIndex[store.last]; if (!(t && starsOf(t.id) >= 1 && learnedCount(t.id) === cardsOf(t.id).length)) return store.last; }
  for (const c of chapters) for (const t of c.topics) if (starsOf(t.id) === 0) return t.id;
  return chapters[0].topics[0].id;
}
function weekStrip() {
  const has = new Set(store.days), w = el('div', { class: 'week', 'aria-label': 'study days this week' }), d = new Date();
  d.setDate(d.getDate() - 6);
  for (let i = 0; i < 7; i++) { const k = dayKey(d); w.append(el('i', { class: (has.has(k) ? 'on' : '') + (i === 6 ? ' today' : ''), title: k, text: 'SMTWTFS'[d.getDay()] })); d.setDate(d.getDate() + 1); }
  return w;
}
function planCard() {
  const due = dueCards().length, tid = suggestTopic(), t = topicIndex[tid], ns = nextStepFor(tid), mixDone = store.mixDay === today(), canMix = mixTopics().length > 0;
  const item = (done, href, icon, title, sub) => el('li', { class: done ? 'done' : '' }, el('a', { href }, el('span', { class: 'pi', text: icon }), el('div', null, el('b', { text: title }), el('span', { text: sub })), el('span', { class: 'go', text: done ? '✓' : '→' })));
  const d = new Date();
  return el('div', { class: 'plan' }, el('h3', { text: 'Today’s study plan' }), el('div', { class: 'when', text: d.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' }) + ' · about 15 minutes' }),
    el('ol', null,
      item(due === 0, '#/review/cards', '🔁', due ? 'Review ' + plural(due, 'flashcard') : 'Flashcards all caught up', due ? 'Spaced repetition: these are due now' : 'New cards unlock as you study quests'),
      item(false, ns.href, ns.icon, ns.label + ': ' + t.title, 'Chapter ' + t.ch + ' · ' + t.tag),
      item(mixDone, canMix ? '#/review/mix' : ns.href, '🔀', mixDone ? 'Mixed review done today' : 'Mixed review: 8 problems', canMix ? 'Topics you’ve practiced, weakest first' : 'Unlocks after your first practice problem')),
    el('div', { class: 'streak' }, el('span', { html: '🔥 <b>' + plural(dayStreak(), 'day') + '</b> streak' }), weekStrip()));
}
function pageHome() {
  document.title = 'Algebra Quest · College algebra, step by step';
  const tid = suggestTopic(), ns = nextStepFor(tid), started = Object.keys(store.topics).length > 0 || Object.keys(store.cards).length > 0;
  const hero = el('section', { class: 'hero' },
    el('div', null, el('div', { class: 'kicker', text: 'College Algebra · 4 chapters · 27 quests' }), el('h1', { tabindex: '-1', html: 'Algebra, <em>one idea</em> at a time.' }),
      el('p', { class: 'sub', html: 'Short lessons, worked examples you reveal step by step, graph labs to play with, and endless fresh practice. <span class="hl">Hints point you to the method but never give the answer.</span> Flashcards come back right before you’d forget them.' }),
      el('div', { class: 'cta' }, el('a', { class: 'btn hot big', href: ns.href, text: started ? 'Continue: ' + topicIndex[tid].title + ' →' : 'Start Chapter 1 →' }), el('a', { class: 'btn big', href: '#/review', text: '🔁 Review' }))),
    planCard());
  const cards = chapters.map(c => {
    const stars = c.topics.reduce((s, t) => s + starsOf(t.id), 0), max = c.topics.length * 3;
    const mem = Math.round(c.topics.reduce((s, t) => s + memPct(t.id), 0) / c.topics.length);
    const b1 = el('i'), b2 = el('i');
    requestAnimationFrame(() => { b1.style.width = Math.round(100 * stars / max) + '%'; b2.style.width = mem + '%'; });
    return el('a', { class: 'nb', href: '#/ch/' + c.n, style: '--c:' + CH_COLOR[c.n] },
      el('div', { class: 'top' }, el('span', { class: 'cn', text: String(c.n) }), el('h3', { text: c.title }), el('span', { class: 'em', text: c.emoji })),
      el('p', { text: c.blurb }),
      el('div', { class: 'meter' }, el('span', { text: '⭐ Practice' }), el('div', { class: 'bar' }, b1), el('span', { text: stars + '/' + max })),
      el('div', { class: 'meter' }, el('span', { text: '🧠 Memory' }), el('div', { class: 'bar' }, b2), el('span', { text: mem + '%' })));
  });
  const sci = (n, c, title, text, tag) => el('div', { class: 'sci', style: '--c:' + c }, el('div', { class: 'n', text: n }), el('b', { text: title }), el('p', { text: text }), el('small', { text: tag }));
  return el('div', null, hero,
    el('h2', { text: 'Your notebook' }), el('div', { class: 'chgrid' }, cards),
    el('h2', { text: 'How this site helps it stick' }),
    el('div', { class: 'science' },
      sci('1', 'var(--ch1)', 'Learn from examples', 'Each worked example reveals one step at a time. Guess the next step before you click, then redo the whole thing on paper.', 'The worked-example effect'),
      sci('2', 'var(--ch2)', 'Recall, don’t reread', 'Flashcards, covered rules and blank cheat sheets make you pull ideas out of memory. Rereading feels productive; recalling actually works.', 'Retrieval practice'),
      sci('3', 'var(--ch3)', 'Space it and mix it', 'Cards come back after 1, 3, 7, 16… days, and mixed review shuffles topics the way a test does.', 'Spacing and interleaving')));
}
function pageReview() {
  document.title = 'Review · Algebra Quest';
  const due = dueCards(), canMix = mixTopics().length > 0, learned = ALL_CARDS.filter(c => cs(c.id).b >= 1).length;
  const next = ALL_CARDS.map(c => cs(c.id)).filter(s => s.b >= 1 && s.d > Date.now()).map(s => s.d).sort((a, b) => a - b)[0];
  return el('div', null, el('div', { class: 'kicker', text: 'Spaced review' }), el('h1', { tabindex: '-1', text: 'Review' }),
    el('p', { class: 'sub', text: 'Ten focused minutes here each day beats an all-night cram. Do the cards first, then a mixed set.' }),
    el('div', { class: 'rgrid' },
      el('div', { class: 'rcard', style: '--c:var(--accent)' }, el('div', { class: 'bign', text: String(due.length) }), el('h3', { text: 'Flashcards due' }),
        el('p', { text: due.length ? 'These are the cards your memory is about to drop. Catch them now.' : learned ? 'All caught up! Your next card comes back ' + (next ? whenText(next) : 'soon') + '. Learn new decks from any quest.' : 'You haven’t started a deck yet. Open any quest and pick the Flashcards step.' }),
        due.length ? el('a', { class: 'btn hot', href: '#/review/cards', text: 'Review ' + plural(due.length, 'card') + ' →' }) : el('a', { class: 'btn', href: nextStepFor(suggestTopic()).href, text: 'Go to your next quest' })),
      el('div', { class: 'rcard', style: '--c:var(--blue)' }, el('div', { class: 'bign', text: '8' }), el('h3', { text: 'Mixed problem set' }),
        el('p', { text: canMix ? 'Eight problems drawn from every topic you’ve practiced, weighted toward the ones you miss most or haven’t seen lately.' : 'Practice a problem or two in any quest first. Then this set will mix those topics together.' }),
        canMix ? el('a', { class: 'btn primary', href: '#/review/mix', text: 'Start mixed review →' }) : el('a', { class: 'btn', href: '#/ch/1/c1-linear/practice', text: 'Try a first problem' }))));
}
function pageReviewCards() {
  document.title = 'Flashcard review · Algebra Quest';
  const root = el('div', null, el('div', { class: 'crumbs' }, el('a', { href: '#/review', text: 'Review' }), ' › Flashcards'), el('h1', { tabindex: '-1', text: 'Flashcard review' }));
  const due = shuffle(dueCards()).slice(0, 30);
  if (!due.length) { root.append(el('div', { class: 'empty' }, el('div', { class: 'e', text: '🎉' }), el('h3', { text: 'Nothing due right now' }), el('p', { text: 'Your memory is up to date. Learn a new deck from your next quest.' }), el('a', { class: 'btn hot', href: nextStepFor(suggestTopic()).href, text: 'Next quest →' }))); return root; }
  root.append(el('p', { class: 'sub', text: plural(due.length, 'card') + ' from ' + plural(new Set(due.map(c => c.tid)).size, 'quest') + ', shuffled.' }));
  const host = el('div'); root.append(host); runCards(host, due, { after: [el('a', { class: 'btn hot', href: '#/review/mix', text: 'Now a mixed problem set →' })] }); return root;
}
function pageReviewMix() {
  document.title = 'Mixed review · Algebra Quest';
  const root = el('div', null, el('div', { class: 'crumbs' }, el('a', { href: '#/review', text: 'Review' }), ' › Mixed set'), el('h1', { tabindex: '-1', text: 'Mixed review' }));
  if (!mixTopics().length) { root.append(el('div', { class: 'empty' }, el('div', { class: 'e', text: '🔀' }), el('h3', { text: 'Practice something first' }), el('p', { text: 'Mixed review shuffles topics you’ve already practiced. Solve a problem in any quest to unlock it.' }), el('a', { class: 'btn hot', href: '#/ch/1/c1-linear/practice', text: 'Start with Chapter 1 →' }))); return root; }
  root.append(el('p', { class: 'sub', text: 'Eight problems, no labels telling you the method. First decide what kind of problem it is, then solve it.' }));
  const host = el('div'); root.append(host); runMix(host); return root;
}
function pageChapter(n) {
  const ch = chapters.find(c => c.n === n); if (!ch) return pageHome();
  document.title = 'Chapter ' + n + ': ' + ch.title + ' · Algebra Quest';
  const root = el('div', { style: '--c:' + CH_COLOR[n] });
  root.append(el('div', { class: 'crumbs' }, el('a', { href: '#/', text: 'Today' }), ' › Chapter ' + n),
    el('div', { class: 'chhead' }, el('div', { class: 'big', text: String(n) }), el('div', null, el('div', { class: 'kicker', text: 'Chapter ' + n + ' ' + ch.emoji }), el('h1', { tabindex: '-1', text: ch.title }), el('p', { class: 'sub', text: ch.blurb }))),
    el('h2', { text: 'Quests' }), el('p', { class: 'note', text: 'Each quest goes Learn → Flashcards → Practice. Do them in order the first time through.' }),
    el('div', { class: 'tgrid' }, ch.topics.map((t, i) => el('a', { class: 'tcard', href: '#/ch/' + n + '/' + t.id }, el('span', { class: 'qn', text: n + '.' + (i + 1) }), el('div', { class: 'ico', text: t.icon }), el('h3', { text: t.title }), el('p', { text: t.tag }),
      el('div', { class: 'tstat' }, el('span', { class: tStat(t.id).read ? 'ok' : '', text: (tStat(t.id).read ? '✓' : '📖') + ' Lesson' }), el('span', { text: '🧠 ' + memPct(t.id) + '%' }), el('span', { html: starHTML(starsOf(t.id)) }))))));
  const best = store.boss[n];
  root.append(el('div', { class: 'boss' }, el('div', null, el('b', { text: '🏁 Chapter ' + n + ' challenge' }), el('span', { text: '10 mixed problems covering every quest. ' + (best !== undefined ? 'Your best: ' + best + ' / 100.' : 'Score 70+ for a bonus.') })), el('a', { class: 'btn', href: '#/ch/' + n + '/boss', text: 'Start the challenge →' })));
  root.append(el('h2', { text: 'Practice-test prep map' }), el('p', { class: 'note', text: 'Each row names the skill behind a Chapter ' + n + ' practice-test problem and points to the quest that teaches it. No answers here.' }),
    el('div', { class: 'tablewrap' }, el('table', { class: 'map' }, el('thead', null, el('tr', null, el('th', { text: 'Problem' }), el('th', { text: 'Skill' }), el('th', { text: 'Learn it in' }))), el('tbody', null, ch.testMap.map(([num, skill, tid]) => el('tr', null, el('td', { class: 'num', text: '#' + num }), el('td', { text: skill }), el('td', null, el('a', { href: '#/ch/' + n + '/' + tid, text: topicIndex[tid].title }))))))));
  root.append(el('p', { class: 'row' }, el('a', { class: 'btn', href: '#/ch/' + n + '/cheat', text: '🗒️ Cheat sheet' }), el('span', { class: 'note', text: 'Tip: use its “Quiz me” mode to rewrite the rules from memory.' })));
  return root;
}
function pageTopic(n, id, tab) {
  const t = topicIndex[id], ch = chapters.find(c => c.n === n); if (!t || t.ch !== n) return pageChapter(n);
  tab = tab === 'practice' || tab === 'cards' ? tab : 'learn';
  document.title = t.title + ' · Chapter ' + n + ' · Algebra Quest';
  store.last = id; if (tab === 'learn' && !tStat(id).read) { tMut(id).read = 1; } save();
  const i = ch.topics.indexOf(t), root = el('div', { style: '--c:' + CH_COLOR[n] }), base = '#/ch/' + n + '/' + id;
  const nCards = cardsOf(id).length, learned = learnedCount(id);
  const step = (k, num, label, sub, done) => el('a', { class: 'step' + (tab === k ? ' on' : '') + (done ? ' done' : ''), href: base + (k === 'learn' ? '' : '/' + k), 'aria-current': tab === k ? 'page' : null }, el('span', { class: 'sn', text: done ? '✓' : String(num) }), label, el('span', { class: 'sx', text: sub }));
  root.append(el('div', { class: 'qhead' }, el('div', { class: 'crumbs' }, el('a', { href: '#/', text: 'Today' }), ' › ', el('a', { href: '#/ch/' + n, text: 'Chapter ' + n }), ' › Quest ' + n + '.' + (i + 1)),
    el('div', { class: 'kicker', text: 'Quest ' + n + '.' + (i + 1) + ' · ' + t.tag }), el('h1', { tabindex: '-1', text: t.icon + ' ' + t.title }),
    el('nav', { class: 'steps', 'aria-label': 'Quest steps' }, step('learn', 1, 'Learn', '', !!tStat(id).read), el('span', { class: 'sarrow', text: '›' }), step('cards', 2, 'Flashcards', learned + '/' + nCards, nCards && learned === nCards), el('span', { class: 'sarrow', text: '›' }), step('practice', 3, 'Practice', '', starsOf(id) >= 1), el('span', { class: 'sarrow', text: '›' }), el('span', { class: 'step', html: starHTML(starsOf(id)) }))));
  if (tab === 'practice') { const host = el('div'); root.append(host); runPractice(host, t); }
  else if (tab === 'cards') {
    const order = cardsOf(id).sort((a, b) => { const A = cs(a.id), B = cs(b.id), ka = isDue(a, Date.now()) ? 0 : A.b === 0 ? 1 : 2, kb = isDue(b, Date.now()) ? 0 : B.b === 0 ? 1 : 2; return ka - kb || A.b - B.b; });
    root.append(el('p', { class: 'sub', text: 'Say each answer before you flip. New and due cards come first.' }));
    const host = el('div'); root.append(host); runCards(host, order, { after: [el('a', { class: 'btn hot', href: base + '/practice', text: 'Now practice problems →' })] });
  } else {
    const les = el('div', { class: 'lesson' + (store.recall ? ' recall' : '') });
    const sw = el('input', { type: 'checkbox', role: 'switch', checked: store.recall || null });
    sw.addEventListener('change', () => { store.recall = sw.checked; save(); les.classList.toggle('recall', sw.checked); les.querySelectorAll('.callout.rule').forEach(c => c.classList.remove('shown')); });
    les.append(el('div', { class: 'ltools' }, el('label', { class: 'switch' }, sw, 'Recall mode'), el('span', { text: 'Hides the key rules so you can say them from memory first. Turn it on for your second read.' })));
    t.learn.forEach(b => les.append(renderBlock(b)));
    const lock = el('div', { class: 'lockin' }), ul = el('ul', null, ...t.cheat.map(c => el('li', { text: c })));
    ul.addEventListener('click', e => { const li = e.target.closest('li'); if (li && lock.classList.contains('covered')) li.classList.add('shown'); });
    const cov = el('button', { class: 'btn small', type: 'button', text: '🙈 Cover these and test myself' });
    cov.addEventListener('click', () => { const on = !lock.classList.contains('covered'); lock.classList.toggle('covered', on); ul.querySelectorAll('li').forEach(li => li.classList.remove('shown')); cov.textContent = on ? '👀 Uncover all' : '🙈 Cover these and test myself'; });
    lock.append(el('h3', { text: '🔒 Lock it in' }), el('div', { class: 'note', text: 'The whole quest in a few lines. Cover them and say each one before moving on.' }), ul, el('div', { class: 'pactions' }, cov, el('a', { class: 'btn hot', href: base + '/cards', text: 'Next: flashcards →' })));
    les.append(lock); root.append(les);
  }
  const prev = ch.topics[i - 1], next = ch.topics[i + 1];
  root.append(el('div', { class: 'pn' }, prev ? el('a', { class: 'btn', href: '#/ch/' + n + '/' + prev.id, text: '← ' + prev.title }) : el('span'), next ? el('a', { class: 'btn', href: '#/ch/' + n + '/' + next.id, text: next.title + ' →' }) : el('a', { class: 'btn', href: '#/ch/' + n + '/boss', text: 'Chapter challenge →' })));
  return root;
}
function pageBoss(n) {
  const ch = chapters.find(c => c.n === n); if (!ch) return pageHome();
  document.title = 'Chapter ' + n + ' challenge · Algebra Quest';
  const root = el('div', { style: '--c:' + CH_COLOR[n] }), host = el('div');
  root.append(el('div', { class: 'crumbs' }, el('a', { href: '#/', text: 'Today' }), ' › ', el('a', { href: '#/ch/' + n, text: 'Chapter ' + n }), ' › Challenge'), el('div', { class: 'kicker', text: 'Chapter ' + n }), el('h1', { tabindex: '-1', text: '🏁 Chapter challenge' }), el('p', { class: 'sub', text: 'Ten mixed problems. First-try answers earn 10 points, later answers 5, and revealed answers 0. Treat it like the real test: no notes.' }), host);
  runBoss(host, ch); return root;
}
function pageCheat(n) {
  const ch = chapters.find(c => c.n === n); if (!ch) return pageHome();
  document.title = 'Chapter ' + n + ' cheat sheet · Algebra Quest';
  const root = el('div', { class: 'cheat', style: '--c:' + CH_COLOR[n] });
  const quiz = el('button', { class: 'btn', type: 'button', text: '🙈 Quiz me (hide the rules)' });
  quiz.addEventListener('click', () => { const on = !root.classList.contains('quiz'); root.classList.toggle('quiz', on); root.querySelectorAll('li').forEach(li => li.classList.remove('shown')); quiz.textContent = on ? '👀 Show everything' : '🙈 Quiz me (hide the rules)'; });
  root.addEventListener('click', e => { const li = e.target.closest('.sheet li'); if (li && root.classList.contains('quiz')) li.classList.add('shown'); });
  root.append(el('div', { class: 'crumbs no-print' }, el('a', { href: '#/', text: 'Today' }), ' › ', el('a', { href: '#/ch/' + n, text: 'Chapter ' + n }), ' › Cheat sheet'), el('div', { class: 'kicker', text: 'Chapter ' + n }), el('h1', { tabindex: '-1', text: ch.title + ': cheat sheet' }),
    el('p', { class: 'sub', text: 'Every rule on one page. Best use: hide them, write each one from memory on a notecard, then tap to check.' }),
    el('p', { class: 'row no-print' }, quiz, el('button', { class: 'btn', type: 'button', text: '🖨️ Print', onclick: () => window.print() })),
    ...ch.topics.map((t, i) => el('div', { class: 'sheet' }, el('h3', { text: n + '.' + (i + 1) + '  ' + t.title }), el('ul', null, ...t.cheat.map(c => el('li', { text: c }))))));
  return root;
}
function pageProgress() {
  document.title = 'My progress · Algebra Quest';
  const earned = Object.keys(topicIndex).reduce((s, id) => s + starsOf(id), 0), solved = Object.values(store.topics).reduce((s, t) => s + t.tried, 0);
  const learned = ALL_CARDS.filter(c => cs(c.id).b >= 2).length, root = el('div');
  root.append(el('div', { class: 'kicker', text: 'Saved only in this browser' }), el('h1', { tabindex: '-1', text: 'My progress' }), el('p', { class: 'sub', text: 'No accounts and no tracking. Your study history stays on this device.' }),
    el('div', { class: 'stat-grid' }, ...[['🔥 Day streak', dayStreak()], ['🧠 Cards learned', learned + ' / ' + ALL_CARDS.length], ['⭐ Stars', earned + ' / ' + Object.keys(topicIndex).length * 3], ['✅ Problems solved', solved], ['⚡ XP', store.xp]].map(([l, v]) => el('div', { class: 'stat' }, el('b', { text: String(v) }), el('small', { text: l })))));
  const box = el('div', { class: 'boxes' }), counts = [0, 1, 2, 3, 4, 5, 6].map(b => ALL_CARDS.filter(c => cs(c.id).b === b).length), mx = Math.max(1, ...counts);
  counts.forEach((n, i) => { const bar = el('i'); bar.style.height = Math.max(3, Math.round(64 * n / mx)) + 'px'; box.append(el('div', null, el('span', { text: String(n) }), bar, el('span', { text: i ? 'Box ' + i : 'New' }))); });
  root.append(el('h2', { text: 'Memory boxes' }), el('p', { class: 'note', text: 'Cards move right each time you know them. Box 6 means it comes back only every two months.' }), box);
  chapters.forEach(c => root.append(el('h2', { text: 'Chapter ' + c.n + ': ' + c.title }), el('div', { class: 'tablewrap' }, el('table', { class: 'prog', style: '--c:' + CH_COLOR[c.n] },
    el('thead', null, el('tr', null, ...['Quest', 'Lesson', 'Memory', 'Stars', 'First-try rate'].map(h => el('th', { text: h })))),
    el('tbody', null, c.topics.map(t => { const s = tStat(t.id), m = memPct(t.id); return el('tr', null, el('td', null, el('a', { href: '#/ch/' + c.n + '/' + t.id, text: t.icon + ' ' + t.title })), el('td', { text: s.read ? '✓' : '—' }), el('td', { html: '<span class="mini"><i style="width:' + m + '%"></i></span>' + m + '%' }), el('td', { html: starHTML(starsOf(t.id)) }), el('td', { text: s.tried ? Math.round(100 * s.first / s.tried) + '% of ' + s.tried : '—' })); }))))));
  let armed = false; const reset = el('button', { class: 'btn ghost', type: 'button', text: 'Erase my progress' });
  reset.addEventListener('click', () => { if (!armed) { armed = true; reset.textContent = 'Really erase everything? Click again'; return; } const th = store.theme; store = fresh(); store.theme = th; save(); route(); });
  root.append(el('p', { class: 'pn' }, reset)); return root;
}

/* ---------- router ---------- */
function route() {
  keyHandler = null; document.body.classList.remove('menu-open');
  const parts = location.hash.replace(/^#\/?/, '').split('/').filter(Boolean).map(s => s.replace(/[^\w-]/g, ''));
  let page; current = { page: 'home' };
  if (parts[0] === 'progress') { current = { page: 'progress' }; page = pageProgress(); }
  else if (parts[0] === 'review') { current = { page: 'review' }; page = parts[1] === 'cards' ? pageReviewCards() : parts[1] === 'mix' ? pageReviewMix() : pageReview(); }
  else if (parts[0] === 'ch' && /^[1-4]$/.test(parts[1] || '')) {
    const n = +parts[1];
    if (!parts[2]) { current = { page: 'chapter', ch: n }; page = pageChapter(n); }
    else if (parts[2] === 'boss') { current = { page: 'boss', ch: n }; page = pageBoss(n); }
    else if (parts[2] === 'cheat') { current = { page: 'cheat', ch: n }; page = pageCheat(n); }
    else { current = { page: 'topic', ch: n, tid: topicIndex[parts[2]] ? parts[2] : '' }; page = pageTopic(n, parts[2], parts[3]); }
  } else page = pageHome();
  const app = document.getElementById('app'); app.replaceChildren(page); refreshSide(); window.scrollTo(0, 0);
  const h = app.querySelector('h1'); if (h) h.focus({ preventScroll: true });
}
applyTheme();
if (window.matchMedia) matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => { if (!store.theme) { applyTheme(); refreshSide(); } });
window.addEventListener('hashchange', route); route();
if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1')) navigator.serviceWorker.register('sw.js').catch(() => {});
})();
