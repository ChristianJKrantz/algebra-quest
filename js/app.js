/* Algebra Quest app: hash router, lessons, practice runner, chapter challenge, progress (saved only in this browser). */
(function () {
'use strict';
if (window.top !== window.self) {            // refuse to run inside another site's frame
  document.body.textContent = '';
  const a = document.createElement('a'); a.href = location.href; a.target = '_top'; a.textContent = 'Open Algebra Quest';
  document.body.append(a); return;
}
const AQ = window.AQ, { H, chapters, topicIndex, gens, widgets, rnd, pick, shuffle } = AQ;
const app = document.getElementById('app'), CH_COLOR = { 1: 'var(--ch1)', 2: 'var(--ch2)', 3: 'var(--ch3)', 4: 'var(--ch4)' };

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

/* ---------- saved progress (validated; storage may be blocked) ---------- */
const KEY = 'algebra-quest-v1';
const clampInt = (v, lo, hi) => { v = Math.floor(Number(v)); return Number.isFinite(v) ? Math.max(lo, Math.min(hi, v)) : lo; };
function fresh() { return { xp: 0, best: 0, topics: {}, boss: {} }; }
function sanitize(o) {
  const s = fresh(); if (!o || typeof o !== 'object') return s;
  s.xp = clampInt(o.xp, 0, 1e7); s.best = clampInt(o.best, 0, 1e5);
  Object.keys(topicIndex).forEach(id => { const t = o.topics && o.topics[id]; if (t && typeof t === 'object') s.topics[id] = { tried: clampInt(t.tried, 0, 1e5), first: clampInt(t.first, 0, 1e5) }; });
  [1, 2, 3, 4].forEach(n => { if (o.boss && o.boss[n] !== undefined) s.boss[n] = clampInt(o.boss[n], 0, 100); });
  return s;
}
let store; try { store = sanitize(JSON.parse(localStorage.getItem(KEY))); } catch (e) { store = fresh(); }
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(store)); } catch (e) { /* storage blocked: progress lasts for this visit only */ } refreshXP(); };
const STAR_AT = [3, 8, 15];
const tStat = id => store.topics[id] || { tried: 0, first: 0 };
const starsOf = id => STAR_AT.filter(n => tStat(id).first >= n).length;
const starHTML = n => '<span class="stars" aria-label="' + n + ' of 3 stars">' + [0, 1, 2].map(i => i < n ? '<b>★</b>' : '★').join('') + '</span>';
function toast(msg) { const t = el('div', { class: 'toast', role: 'status', text: msg }); document.body.append(t); setTimeout(() => t.remove(), 2600); }

/* ---------- chrome ---------- */
const navEl = el('nav', { 'aria-label': 'Main' }), xpEl = el('span', { class: 'xp', title: 'Experience points: saved only in this browser' });
const installBtn = el('button', { class: 'install', type: 'button', hidden: true, text: 'Install app' });
function refreshXP() { xpEl.textContent = '⚡ ' + store.xp + ' XP'; }
function buildHeader() {
  const logo = el('img', { class: 'logo', src: 'icon.svg', alt: '', width: 30, height: 30 });
  document.getElementById('top').replaceChildren(el('div', { class: 'in' }, el('a', { class: 'brand', href: '#/' }, logo, el('div', { html: 'Algebra <span>Quest</span>' })), navEl, xpEl, installBtn));
  refreshXP();
}
function setNav(active) {
  navEl.replaceChildren(el('a', { class: 'navlink' + (active === 'home' ? ' on' : ''), href: '#/', text: 'Home' }),
    ...chapters.map(c => el('a', { class: 'navlink' + (active === 'ch' + c.n ? ' on' : ''), href: '#/ch/' + c.n, text: 'Ch ' + c.n, title: c.title })),
    el('a', { class: 'navlink' + (active === 'progress' ? ' on' : ''), href: '#/progress', text: 'Progress' }));
}
let deferredInstall = null;
window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); deferredInstall = e; installBtn.hidden = false; });
installBtn.addEventListener('click', () => { if (deferredInstall) { deferredInstall.prompt(); deferredInstall = null; installBtn.hidden = true; } });

/* ---------- lesson blocks ---------- */
function signChart(b) {
  const n = b.pts.length, Wd = 560, gap = (Wd - 60) / (n + 1), X = i => 30 + gap * (i + 1);
  let s = `<svg viewBox="0 0 ${Wd} 100" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="sign chart"><line class="axis" x1="14" y1="46" x2="${Wd - 14}" y2="46"/>`;
  b.pts.forEach((p, i) => { s += `<circle class="pt c-w" cx="${X(i)}" cy="46" r="6"/><text class="tick" x="${X(i)}" y="76" text-anchor="middle" font-size="14">${AQ.escHtml(p)}</text>`; });
  b.signs.forEach((g, i) => { const x = i === 0 ? X(0) - gap / 2 : i === n ? X(n - 1) + gap / 2 : (X(i - 1) + X(i)) / 2; s += `<text x="${x}" y="30" text-anchor="middle" font-size="24" font-weight="800" fill="${g === '+' ? 'var(--good)' : 'var(--bad)'}">${g}</text>`; });
  return s + '</svg>';
}
function renderBlock(b, color) {
  switch (b.t) {
    case 'p': return el('div', { class: 'p', html: H(b.h) });
    case 'rule': return el('div', { class: 'callout rule' }, el('span', { class: 'ttl', text: b.title ? '📌 ' + b.title : '📌 Key rule' }), el('div', { html: H(b.h) }));
    case 'trap': return el('div', { class: 'callout trap' }, el('span', { class: 'ttl', text: '⚠️ Watch out' }), el('div', { html: H(b.h) }));
    case 'tip': return el('div', { class: 'callout tip' }, el('span', { class: 'ttl', text: '💡 Tip' }), el('div', { html: H(b.h) }));
    case 'list': return el('ul', { html: b.items.map(i => '<li>' + H(i) + '</li>').join('') });
    case 'signchart': return el('figure', { class: 'signchart', html: signChart(b) + '<figcaption>' + H('~' + b.label + '~: ' + (b.note || '')) + '</figcaption>' });
    case 'widget': {
      const host = el('div'); const box = el('div', { class: 'widget' }, el('div', { class: 'wt', text: b.title || 'Try it' }), host);
      if (widgets[b.id]) try { widgets[b.id](host); } catch (e) { host.textContent = 'This lab could not load.'; }
      return box;
    }
    case 'example': {
      const ol = el('ol'), steps = b.steps.map(s => { const li = el('li', { html: H(s), hidden: true }); ol.append(li); return li; });
      let shown = 0;
      const next = el('button', { class: 'btn small primary', type: 'button', text: 'Show first step' }), all = el('button', { class: 'btn small', type: 'button', text: 'Show all' }), hide = el('button', { class: 'btn small ghost', type: 'button', text: 'Hide' });
      const sync = () => { steps.forEach((li, i) => { li.hidden = i >= shown; }); next.disabled = shown >= steps.length; next.textContent = shown === 0 ? 'Show first step' : 'Next step'; hide.hidden = shown === 0; };
      next.addEventListener('click', () => { shown++; sync(); }); all.addEventListener('click', () => { shown = steps.length; sync(); }); hide.addEventListener('click', () => { shown = 0; sync(); });
      sync();
      return el('div', { class: 'example' }, el('div', { class: 'eh', text: '✏️ Worked example · try it yourself first' }), el('div', { class: 'prob', html: H(b.title) }), ol, el('div', { class: 'ctl' }, next, all, hide));
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
  let attempts = 0, hintsUsed = 0, finished = false, revealed = false, solvedReported = false;
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
          msg.textContent = ''; msg.className = 'fmsg';
        });
        ctl.append(b);
      });
      boxes[f.key] = { ctl, msg, kind: f.kind };
      fieldsBox.append(el('div', { class: 'fld' }, el('div', { class: 'lab', id, text: f.label }), ctl, msg));
    } else {
      hasText = true; values[f.key] = '';
      const inp = el('input', { type: 'text', id, autocomplete: 'off', autocapitalize: 'off', spellcheck: 'false', placeholder: f.ph || '', inputmode: 'text', 'aria-label': f.label });
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
  const checkBtn = el('button', { class: 'btn primary', type: 'submit', text: 'Check' });
  const hintBtn = el('button', { class: 'btn', type: 'button', text: 'Hint (0/' + p.hints.length + ')' });
  const showBtn = el('button', { class: 'btn ghost', type: 'button', text: 'Show the answer' });
  form.append(el('div', { class: 'pactions' }, checkBtn, hintBtn, showBtn));
  const say = (cls, html) => { feed.className = 'feed ' + cls; feed.innerHTML = html; };
  const lock = () => { finished = true; checkBtn.disabled = hintBtn.disabled = showBtn.disabled = true; card.querySelectorAll('input').forEach(i => { i.disabled = true; }); card.querySelectorAll('.pillbtn').forEach(b => { b.disabled = true; }); };
  const goNext = el('button', { class: 'btn primary', type: 'button', text: o.nextLabel || 'Next problem →' });
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
      if (b.kind === 'text') b.ctl.className = r.ok ? 'ok' : 'bad';
      b.ctl.querySelectorAll && b.ctl.querySelectorAll('.pillbtn').forEach(x => { x.classList.toggle('ok', r.ok); x.classList.toggle('bad', !r.ok); });
      b.msg.className = 'fmsg' + (r.ok ? ' good' : ''); b.msg.textContent = r.ok ? '✓ Correct' : r.msg;
    });
    if (good === p.fields.length) {
      const first = attempts === 1 && hintsUsed === 0, xp = first ? 10 : 6;
      lock(); say('good', first ? '✅ <b>Correct on the first try!</b> +' + xp + ' XP' : '✅ <b>Correct!</b> +' + xp + ' XP' + (attempts > 1 || hintsUsed ? ' (first-try answers earn more)' : ''));
      report({ firstTry: first, revealed: false, attempts, hintsUsed, xp }); nextBox.append(goNext); goNext.focus();
    } else say('bad', good ? '<b>Partly there.</b> ' + good + ' of ' + p.fields.length + ' boxes are right. Fix the red ones, or use a hint.' : '<b>Not yet.</b> Read the message under the box, try a hint, or check your work.');
  });
  hintBtn.addEventListener('click', () => {
    if (hintsUsed >= p.hints.length) return;
    hintsBox.append(el('div', { class: 'hint', html: '<b>Hint ' + (hintsUsed + 1) + ':</b> ' + H(p.hints[hintsUsed]) })); hintsUsed++;
    hintBtn.textContent = 'Hint (' + hintsUsed + '/' + p.hints.length + ')'; if (hintsUsed >= p.hints.length) hintBtn.disabled = true;
  });
  showBtn.addEventListener('click', () => {
    if (finished) return; revealed = true; lock();
    solBox.hidden = false;
    solBox.append(el('h4', { text: 'Worked answer' }), ...p.fields.map(f => el('div', { class: 'ans', html: '<b>' + AQ.escHtml(f.label) + '</b> ' + H(String(f.answer)) })), el('ol', { html: p.solution.map(s => '<li>' + H(s) + '</li>').join('') }));
    say('info', 'That one won’t count toward your stars, but study the steps, then try the next one.');
    report({ firstTry: false, revealed: true, attempts, hintsUsed, xp: 0 }); nextBox.append(goNext);
  });
  card.append(form, hintsBox, feed, solBox, nextBox); host.append(card);
  if (firstInput) firstInput.focus({ preventScroll: true });
  void revealed;
}

/* ---------- practice session / chapter challenge ---------- */
function makeProblem(ids) {
  for (let i = 0; i < 8; i++) { try { const p = gens[pick(ids)](); if (p && p.prompt) return p; } catch (e) { /* try another generator */ } }
  throw new Error('no generator available');
}
function runPractice(host, topic) {
  const sess = { solved: 0, first: 0, streak: 0 }, bar = el('div', { class: 'session' }), stage = el('div');
  host.append(bar, stage); let last = '';
  const upd = () => bar.replaceChildren(el('span', { class: 'pill', html: 'Solved <b>' + sess.solved + '</b>' }), el('span', { class: 'pill', html: 'First try <b>' + sess.first + '</b>' }), el('span', { class: 'pill', html: 'Streak 🔥 <b>' + sess.streak + '</b>' }), el('span', { class: 'pill', html: 'Quest ' + starHTML(starsOf(topic.id)) }));
  const nextProblem = () => {
    let p; for (let i = 0; i < 6; i++) { p = makeProblem(topic.practice); if (p.prompt !== last) break; } last = p.prompt;
    renderProblem(stage, p, {
      label: 'Problem ' + (sess.solved + 1), right: topic.title,
      onSolved: r => {
        const before = starsOf(topic.id), t = store.topics[topic.id] || (store.topics[topic.id] = { tried: 0, first: 0 });
        t.tried++; if (r.firstTry) { t.first++; sess.first++; sess.streak++; } else sess.streak = 0; sess.solved++;
        store.xp += r.xp; store.best = Math.max(store.best, sess.streak); save(); upd();
        if (starsOf(topic.id) > before) toast('⭐ New star on “' + topic.title + '”!');
      }, onNext: nextProblem
    });
  };
  upd(); nextProblem();
}
const genTopic = {}; chapters.forEach(c => c.topics.forEach(t => t.practice.forEach(g => { genTopic[g] = t; })));
function runBoss(host, ch) {
  const pool = [...new Set(ch.topics.flatMap(t => t.practice))], ids = shuffle(pool).slice(0, 10); while (ids.length < 10) ids.push(pick(pool));
  const results = []; let idx = 0; const stage = el('div'); host.append(stage);
  const step = () => {
    if (idx >= ids.length) return finish();
    const gid = ids[idx], p = (() => { try { return gens[gid](); } catch (e) { return makeProblem(pool); } })();
    renderProblem(stage, p, {
      label: 'Challenge ' + (idx + 1) + ' of ' + ids.length, right: genTopic[gid] ? genTopic[gid].title : '', nextLabel: idx === ids.length - 1 ? 'See my score →' : 'Next →',
      onSolved: r => { results[idx] = { gid, pts: r.revealed ? 0 : r.firstTry ? 10 : 5, firstTry: r.firstTry }; if (!r.revealed) { store.xp += r.firstTry ? 10 : 6; save(); } }, onNext: () => { idx++; step(); }
    });
  };
  function finish() {
    const total = results.reduce((s, r) => s + (r ? r.pts : 0), 0), prev = store.boss[ch.n] || 0; store.boss[ch.n] = Math.max(prev, total); if (total >= 70) store.xp += 25; save();
    const label = total >= 90 ? 'Legend 🏆' : total >= 70 ? 'Sharp 🔥' : total >= 50 ? 'Getting there 💪' : 'Keep training 🧠';
    const missed = [...new Set(results.map((r, i) => r && !r.firstTry && genTopic[r.gid] ? genTopic[r.gid] : null).filter(Boolean))];
    stage.replaceChildren(el('div', { class: 'result' },
      el('div', { class: 'pmeta', text: 'Chapter ' + ch.n + ' challenge complete' }), el('div', { class: 'big', text: total + ' / 100' }), el('h2', { text: label }),
      el('p', { class: 'sub', text: total > prev ? 'New personal best!' + (total >= 70 ? ' +25 bonus XP' : '') : 'Your best so far: ' + store.boss[ch.n] + ' / 100' }),
      missed.length ? el('div', null, el('h3', { text: 'Quests to revisit' }), el('ul', null, ...missed.map(t => el('li', null, el('a', { href: '#/ch/' + ch.n + '/' + t.id, text: t.title }))))) : el('p', { text: 'Every problem on the first try. Nothing to revisit!' }),
      el('div', { class: 'pactions' }, el('button', { class: 'btn primary', type: 'button', text: 'Try a new challenge', onclick: () => { host.replaceChildren(); runBoss(host, ch); } }), el('a', { class: 'btn', href: '#/ch/' + ch.n, text: 'Back to chapter' }))));
    stage.querySelector('.big').focus && stage.querySelector('.big').setAttribute('tabindex', '-1');
  }
  step();
}

/* ---------- pages ---------- */
function heroArt() {
  return AQ.plot({ xmin: -5, xmax: 5, ymin: -3, ymax: 7, w: 340, h: 280, step: 1, lab: 99, label: 'decorative graph of a parabola, a line and a wave', curves: [{ f: x => 0.4 * x * x - 1, cls: 'c-a' }, { f: x => 0.6 * x + 2.5, cls: 'c-b' }, { f: x => 1.4 * Math.sin(1.4 * x) + 4.5, cls: 'c-w' }], points: [{ x: 0, y: -1, cls: 'c-a' }] });
}
function pageHome() {
  document.title = 'Algebra Quest: College Algebra study game';
  const totalTopics = chapters.reduce((s, c) => s + c.topics.length, 0), earned = Object.keys(topicIndex).reduce((s, id) => s + starsOf(id), 0);
  const hero = el('section', { class: 'hero' }, el('div', null, el('h1', { tabindex: '-1', html: 'Algebra <span>Quest</span>' }),
    el('p', { text: 'A chapter-by-chapter college algebra tutor. Learn the idea, watch a worked example, play with interactive graphs, then practice with endless fresh problems. Hints nudge you toward the method but never hand you the answer.' }),
    el('div', { class: 'cta' }, el('a', { class: 'btn primary big', href: '#/ch/1', text: earned ? 'Keep going' : 'Start with Chapter 1' }), el('a', { class: 'btn big', href: '#/progress', text: '⭐ ' + earned + ' / ' + totalTopics * 3 }))),
    el('div', { class: 'art', html: heroArt() }));
  const cards = chapters.map(c => {
    const stars = c.topics.reduce((s, t) => s + starsOf(t.id), 0), max = c.topics.length * 3, bar = el('i');
    const card = el('a', { class: 'chcard', href: '#/ch/' + c.n, style: '--c:' + CH_COLOR[c.n] }, el('div', { class: 'em', text: c.emoji }), el('div', { class: 'n', text: 'Chapter ' + c.n }), el('h3', { text: c.title }), el('p', { text: c.blurb }), el('div', { class: 'bar' }, bar), el('div', { class: 'row' }, el('span', { text: c.topics.length + ' quests' }), el('span', { text: '⭐ ' + stars + ' / ' + max })));
    requestAnimationFrame(() => { bar.style.width = Math.round(100 * stars / max) + '%'; }); return card;
  });
  return el('div', null, hero, el('h2', { text: 'Pick a chapter' }), el('div', { class: 'chgrid' }, cards), el('h2', { text: 'How it works' }),
    el('div', { class: 'steps3' }, el('div', { class: 'how', html: '<b>1 · Learn</b><span>Short lessons with key rules, common traps, and worked examples you reveal one step at a time.</span>' }), el('div', { class: 'how', html: '<b>2 · Practice</b><span>Fresh problems every time. Get a nudge on a miss, a hint ladder when stuck, and the full worked answer only when you ask.</span>' }), el('div', { class: 'how', html: '<b>3 · Challenge</b><span>Finish a chapter challenge of 10 mixed problems and earn bragging rights. Stars and XP are saved in your browser.</span>' })));
}
function pageChapter(n) {
  const ch = chapters.find(c => c.n === n); if (!ch) return pageHome();
  document.title = 'Chapter ' + n + ': ' + ch.title + ' · Algebra Quest';
  const c = CH_COLOR[n], root = el('div', { style: '--c:' + c });
  root.append(el('div', { class: 'crumbs' }, el('a', { href: '#/', text: 'Home' }), ' › Chapter ' + n),
    el('div', { class: 'chead' }, el('div', { class: 'em', text: ch.emoji }), el('div', null, el('div', { class: 'tag', text: 'Chapter ' + n }), el('h1', { tabindex: '-1', text: ch.title }))), el('p', { class: 'sub', text: ch.blurb }),
    el('h2', { text: 'Quests' }), el('div', { class: 'tgrid' }, ch.topics.map(t => el('a', { class: 'tcard', href: '#/ch/' + n + '/' + t.id }, el('div', { class: 'ico', text: t.icon }), el('h3', { text: t.title }), el('p', { text: t.tag }), el('div', { class: 'meta' }, el('span', { html: starHTML(starsOf(t.id)) }), el('span', { class: 'chip2', text: tStat(t.id).tried + ' solved' }))))));
  const best = store.boss[n];
  root.append(el('div', { class: 'boss' }, el('div', null, el('b', { text: '🏁 Chapter ' + n + ' challenge' }), el('span', { text: '10 mixed problems from this whole chapter. ' + (best !== undefined ? 'Your best: ' + best + ' / 100.' : 'Ready when you are.') })), el('a', { class: 'btn primary', href: '#/ch/' + n + '/boss', text: 'Start the challenge' })));
  root.append(el('h2', { text: 'Practice-test prep map' }), el('p', { class: 'note', text: 'Each line names the skill behind a Chapter ' + n + ' practice-test problem and points to the quest that teaches it. Nothing here gives away an answer.' }),
    el('table', { class: 'map' }, el('thead', null, el('tr', null, el('th', { text: 'Problem' }), el('th', { text: 'Skill' }), el('th', { text: 'Learn it in' }))), el('tbody', null, ch.testMap.map(([num, skill, tid]) => el('tr', null, el('td', { class: 'num', text: '#' + num }), el('td', { text: skill }), el('td', null, el('a', { href: '#/ch/' + n + '/' + tid, text: topicIndex[tid].title })))))));
  root.append(el('p', null, el('a', { class: 'btn', href: '#/ch/' + n + '/cheat', text: '🗒️ Printable cheat sheet' })));
  return root;
}
function pageTopic(n, id, tab) {
  const t = topicIndex[id], ch = chapters.find(c => c.n === n); if (!t || t.ch !== n) return pageChapter(n);
  document.title = t.title + ' · Chapter ' + n + ' · Algebra Quest';
  const root = el('div', { style: '--c:' + CH_COLOR[n] });
  root.append(el('div', { class: 'crumbs' }, el('a', { href: '#/', text: 'Home' }), ' › ', el('a', { href: '#/ch/' + n, text: 'Chapter ' + n }), ' › ' + t.title),
    el('h1', { tabindex: '-1', text: t.icon + ' ' + t.title }), el('p', { class: 'sub', text: t.tag }),
    el('div', { class: 'tabs', role: 'tablist' }, el('a', { class: 'tab' + (tab !== 'practice' ? ' on' : ''), href: '#/ch/' + n + '/' + id, role: 'tab', text: '📖 Learn' }), el('a', { class: 'tab' + (tab === 'practice' ? ' on' : ''), href: '#/ch/' + n + '/' + id + '/practice', role: 'tab', text: '🎯 Practice' })));
  if (tab === 'practice') { const host = el('div'); root.append(host); runPractice(host, t); }
  else {
    const les = el('div', { class: 'lesson' }); t.learn.forEach(b => les.append(renderBlock(b, CH_COLOR[n])));
    les.append(el('div', { class: 'pactions' }, el('a', { class: 'btn primary big', href: '#/ch/' + n + '/' + id + '/practice', text: 'Ready? Start practicing →' })));
    root.append(les);
  }
  const i = ch.topics.indexOf(t), prev = ch.topics[i - 1], next = ch.topics[i + 1];
  root.append(el('div', { class: 'pn' }, prev ? el('a', { class: 'btn', href: '#/ch/' + n + '/' + prev.id, text: '← ' + prev.title }) : el('span'), next ? el('a', { class: 'btn', href: '#/ch/' + n + '/' + next.id, text: next.title + ' →' }) : el('a', { class: 'btn', href: '#/ch/' + n + '/boss', text: 'Chapter challenge →' })));
  return root;
}
function pageBoss(n) {
  const ch = chapters.find(c => c.n === n); if (!ch) return pageHome();
  document.title = 'Chapter ' + n + ' challenge · Algebra Quest';
  const root = el('div', { style: '--c:' + CH_COLOR[n] }), host = el('div');
  root.append(el('div', { class: 'crumbs' }, el('a', { href: '#/', text: 'Home' }), ' › ', el('a', { href: '#/ch/' + n, text: 'Chapter ' + n }), ' › Challenge'), el('h1', { tabindex: '-1', text: '🏁 Chapter ' + n + ' challenge' }), el('p', { class: 'sub', text: 'Ten mixed problems. First-try answers earn 10 points, later answers 5, and revealed answers 0.' }), host);
  runBoss(host, ch); return root;
}
function pageCheat(n) {
  const ch = chapters.find(c => c.n === n); if (!ch) return pageHome();
  document.title = 'Chapter ' + n + ' cheat sheet · Algebra Quest';
  const root = el('div', { class: 'cheat', style: '--c:' + CH_COLOR[n] });
  root.append(el('div', { class: 'crumbs no-print' }, el('a', { href: '#/', text: 'Home' }), ' › ', el('a', { href: '#/ch/' + n, text: 'Chapter ' + n }), ' › Cheat sheet'), el('h1', { tabindex: '-1', text: 'Chapter ' + n + ' cheat sheet' }),
    el('p', { class: 'sub', text: ch.title + ': the rules in one place. Copy it by hand to learn it better.' }),
    el('p', { class: 'no-print' }, el('button', { class: 'btn primary', type: 'button', text: '🖨️ Print', onclick: () => window.print() })),
    ...ch.topics.map(t => el('div', { class: 'sheet' }, el('h3', { text: t.icon + ' ' + t.title }), el('ul', { html: t.cheat.map(c => '<li>' + AQ.escHtml(c) + '</li>').join('') }))));
  return root;
}
function pageProgress() {
  document.title = 'Your progress · Algebra Quest';
  const earned = Object.keys(topicIndex).reduce((s, id) => s + starsOf(id), 0), solved = Object.values(store.topics).reduce((s, t) => s + t.tried, 0), root = el('div');
  root.append(el('h1', { tabindex: '-1', text: 'Your progress' }), el('p', { class: 'sub', text: 'Saved only in this browser. No accounts, no tracking.' }),
    el('div', { class: 'stat-grid' }, ...[['XP', store.xp], ['Stars', earned + ' / ' + Object.keys(topicIndex).length * 3], ['Problems solved', solved], ['Best streak', store.best]].map(([l, v]) => el('div', { class: 'stat' }, el('b', { text: String(v) }), el('small', { text: l })))));
  chapters.forEach(c => root.append(el('h2', { text: c.emoji + ' Chapter ' + c.n + ': ' + c.title }), el('div', { class: 'tgrid', style: '--c:' + CH_COLOR[c.n] }, c.topics.map(t => el('a', { class: 'tcard', href: '#/ch/' + c.n + '/' + t.id }, el('h3', { text: t.icon + ' ' + t.title }), el('div', { class: 'meta' }, el('span', { html: starHTML(starsOf(t.id)) }), el('span', { class: 'chip2', text: tStat(t.id).first + ' first-try' })))))));
  let armed = false; const reset = el('button', { class: 'btn ghost', type: 'button', text: 'Reset my progress' });
  reset.addEventListener('click', () => { if (!armed) { armed = true; reset.textContent = 'Really erase everything? Click again'; return; } store = fresh(); save(); route(); });
  root.append(el('p', { style: '' }, reset)); return root;
}

/* ---------- router ---------- */
function route() {
  const parts = location.hash.replace(/^#\/?/, '').split('/').filter(Boolean).map(s => s.replace(/[^\w-]/g, ''));
  let page, active = 'home';
  if (parts[0] === 'progress') { page = pageProgress(); active = 'progress'; }
  else if (parts[0] === 'ch' && /^[1-4]$/.test(parts[1] || '')) {
    const n = +parts[1]; active = 'ch' + n;
    page = !parts[2] ? pageChapter(n) : parts[2] === 'boss' ? pageBoss(n) : parts[2] === 'cheat' ? pageCheat(n) : pageTopic(n, parts[2], parts[3]);
  } else page = pageHome();
  setNav(active); app.replaceChildren(page); window.scrollTo(0, 0);
  const h = app.querySelector('h1'); if (h) h.focus({ preventScroll: true });
}
buildHeader(); window.addEventListener('hashchange', route); route();
if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1')) navigator.serviceWorker.register('sw.js').catch(() => {});
})();
