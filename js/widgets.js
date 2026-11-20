/* Algebra Quest interactive labs. Each widget draws into a container with the SVG grapher. */
(function (root) {
'use strict';
const AQ = root.AQ = root.AQ || {};
const W = AQ.widgets = AQ.widgets || {};
const { rnd, pick, plot, H } = AQ;
const esc = AQ.escHtml;
const f1 = n => (Math.round(n * 100) / 100).toString();
// tidy equation pieces: 1x → x, −1x → −x, + 0 dropped, (x − 0) → x
const coef = (a, v) => a === 1 ? v : a === -1 ? '-' + v : f1(a) + v;
const tail = k => k === 0 ? '' : k < 0 ? ' - ' + f1(-k) : ' + ' + f1(k);
const shifted = (v, h) => h === 0 ? v : '(' + v + (h < 0 ? ' + ' + f1(-h) : ' - ' + f1(h)) + ')';

function shell(host, withBtn) {
  host.innerHTML = '<div class="wbody"><div class="wplot" aria-live="polite"></div><div class="wctl"><div class="wsl"></div><div class="wout"></div>' + (withBtn ? '<div class="wbtn"></div>' : '') + '</div></div>';
  return { plot: host.querySelector('.wplot'), sl: host.querySelector('.wsl'), out: host.querySelector('.wout'), btn: host.querySelector('.wbtn') };
}
function sliders(box, specs, onChange) {
  const vals = {}; specs.forEach(s => { vals[s.k] = s.val; });
  box.innerHTML = specs.map(s => `<label class="sl"><span>${esc(s.label)}</span><input type="range" data-k="${s.k}" min="${s.min}" max="${s.max}" step="${s.step}" value="${s.val}"><output>${s.val}</output></label>`).join('');
  box.addEventListener('input', e => { const k = e.target.dataset && e.target.dataset.k; if (!k) return; vals[k] = parseFloat(e.target.value); e.target.nextElementSibling.textContent = vals[k]; onChange(vals); });
  return vals;
}
function addButton(box, text, fn) { const b = document.createElement('button'); b.type = 'button'; b.className = 'btn small'; b.textContent = text; b.addEventListener('click', fn); box.appendChild(b); return b; }
function selectRow(box, label, opts, val, fn) {
  const l = document.createElement('label'); l.className = 'sl';
  l.innerHTML = `<span>${esc(label)}</span><select>${opts.map(o => `<option value="${esc(o[0])}"${o[0] === String(val) ? ' selected' : ''}>${esc(o[1])}</option>`).join('')}</select>`;
  l.querySelector('select').addEventListener('change', e => fn(e.target.value)); box.appendChild(l); return l;
}
function niceStep(range) { const raw = range / 6, p = Math.pow(10, Math.floor(Math.log10(raw))), m = raw / p; return (m < 1.5 ? 1 : m < 3.5 ? 2 : m < 7.5 ? 5 : 10) * p; }

/* ---------- number-line painter (ch1) ---------- */
function numberLine(ivs) {
  const fin = []; ivs.forEach(i => { if (Number.isFinite(i.lo)) fin.push(i.lo); if (Number.isFinite(i.hi)) fin.push(i.hi); });
  let lo = fin.length ? Math.min(...fin) : -5, hi = fin.length ? Math.max(...fin) : 5;
  const pad = Math.max(2, (hi - lo) * 0.3); lo = Math.floor(lo - pad); hi = Math.ceil(hi + pad);
  const Wd = 560, m = 24, X = x => m + (x - lo) / (hi - lo) * (Wd - 2 * m), step = Math.max(1, Math.ceil((hi - lo) / 14));
  let s = `<svg class="plot nl" viewBox="0 0 ${Wd} 96" role="img" aria-label="number line" xmlns="http://www.w3.org/2000/svg"><rect class="pbg" x="0" y="0" width="${Wd}" height="96" rx="10"/><line class="axis" x1="${m - 8}" y1="50" x2="${Wd - m + 8}" y2="50"/>`;
  for (let x = Math.ceil(lo / step) * step; x <= hi; x += step) s += `<line class="axis" x1="${X(x)}" y1="44" x2="${X(x)}" y2="56"/><text class="tick" x="${X(x)}" y="74" text-anchor="middle">${x}</text>`;
  ivs.forEach(i => {
    const a = Number.isFinite(i.lo) ? X(i.lo) : m - 12, b = Number.isFinite(i.hi) ? X(i.hi) : Wd - m + 12;
    s += `<line class="curve c-a nlseg" x1="${a}" y1="50" x2="${b}" y2="50"/>`;
    if (Number.isFinite(i.lo)) s += `<circle class="pt c-a${i.loC ? '' : ' open'}" cx="${a}" cy="50" r="6"/>`; else s += `<path class="arrow" d="M${a + 2} 50 l10 -7 v14 z"/>`;
    if (Number.isFinite(i.hi)) s += `<circle class="pt c-a${i.hiC ? '' : ' open'}" cx="${b}" cy="50" r="6"/>`; else s += `<path class="arrow" d="M${b - 2} 50 l-10 -7 v14 z"/>`;
  });
  return s + '</svg>';
}
W.intervalPainter = function (host) {
  const s = shell(host); s.sl.innerHTML = '<label class="sl wide"><span>Interval</span><input type="text" class="wtext" value="(-2, 4]" spellcheck="false" autocomplete="off" aria-label="interval"></label><div class="wnote">Try: <button type="button" class="chip" data-v="(-inf, 3)">(-inf, 3)</button> <button type="button" class="chip" data-v="[1, 5]">[1, 5]</button> <button type="button" class="chip" data-v="(-inf, -1] U (2, inf)">(-inf, -1] U (2, inf)</button></div>';
  const inp = s.sl.querySelector('input');
  const draw = () => {
    try {
      const ivs = AQ.parseIntervals(inp.value);
      if (!ivs.length) { s.out.textContent = 'Type an interval like (-2, 4] or (-inf, 1) U [3, inf).'; s.plot.innerHTML = ''; return; }
      s.plot.innerHTML = numberLine(ivs);
      s.out.innerHTML = H(ivs.map(i => { const a = i.lo === -Infinity ? '' : i.lo + (i.loC ? ' ≤ ' : ' < '), b = i.hi === Infinity ? '' : (i.hiC ? ' ≤ ' : ' < ') + i.hi; return '~' + (a && b ? a + 'x' + b : a ? 'x ' + (i.loC ? '>=' : '>') + ' ' + i.lo : 'x ' + (i.hiC ? '<=' : '<') + ' ' + i.hi) + '~'; }).join(' or '));
    } catch (e) { s.out.textContent = 'I can’t read that yet. Use brackets and a comma, like [1, 5).'; }
  };
  inp.addEventListener('input', draw); s.sl.addEventListener('click', e => { if (e.target.dataset.v) { inp.value = e.target.dataset.v; draw(); } }); draw();
};

/* ---------- line match (ch2) ---------- */
W.lineMatch = function (host) {
  const s = shell(host, true); let tgt;
  const roll = () => { for (;;) { const m = pick([-3, -2, -1.5, -1, -0.5, 0.5, 1, 1.5, 2, 3]), b = rnd(-5, 5), x1 = 2 * rnd(-3, -1), x2 = x1 + 2 * rnd(1, 3); if ([m * x1 + b, m * x2 + b].every(y => Math.abs(y) <= 8) && Math.abs(x2) <= 8) { tgt = { m, b, x1, x2 }; return; } } };
  const draw = v => {
    const ok = Math.abs(v.m - tgt.m) < 1e-9 && v.b === tgt.b;
    s.plot.innerHTML = plot({ xmin: -9, xmax: 9, ymin: -9, ymax: 9, step: 1, lab: 3, label: 'target line and your line', curves: [{ f: x => tgt.m * x + tgt.b, cls: 'c-t dashed' }, { f: x => v.m * x + v.b, cls: 'c-a' }], points: [{ x: tgt.x1, y: tgt.m * tgt.x1 + tgt.b, label: '(' + tgt.x1 + ', ' + (tgt.m * tgt.x1 + tgt.b) + ')', cls: 'c-t' }, { x: tgt.x2, y: tgt.m * tgt.x2 + tgt.b, label: '(' + tgt.x2 + ', ' + (tgt.m * tgt.x2 + tgt.b) + ')', cls: 'c-t' }] });
    s.out.innerHTML = H('Your line: ~y = ' + (v.m === 0 ? f1(v.b) : coef(v.m, 'x') + tail(v.b)) + '~')+ (ok ? '<b class="win"> ✓ Matched the target!</b>' : '');
  };
  const vals = sliders(s.sl, [{ k: 'm', label: 'slope m', min: -4, max: 4, step: 0.5, val: 1 }, { k: 'b', label: 'y-intercept b', min: -7, max: 7, step: 1, val: 0 }], draw);
  roll(); draw(vals); addButton(s.btn, 'New target', () => { roll(); draw(vals); });
};

/* ---------- circle match (ch2) ---------- */
const circ = (h, k, r) => Array.from({ length: 121 }, (_, i) => { const t = i / 120 * 2 * Math.PI; return [h + r * Math.cos(t), k + r * Math.sin(t)]; });
W.circleMatch = function (host) {
  const s = shell(host, true); let tgt;
  const roll = () => { tgt = { h: rnd(-4, 4), k: rnd(-4, 4), r: rnd(2, 5) }; };
  const draw = v => {
    const ok = v.h === tgt.h && v.k === tgt.k && v.r === tgt.r;
    s.plot.innerHTML = plot({ xmin: -10, xmax: 10, ymin: -10, ymax: 10, step: 1, lab: 2, label: 'target circle and your circle', curves: [{ pts: circ(tgt.h, tgt.k, tgt.r), cls: 'c-t dashed' }, { pts: circ(v.h, v.k, v.r), cls: 'c-a' }], points: [{ x: tgt.h - tgt.r, y: tgt.k, label: '(' + (tgt.h - tgt.r) + ', ' + tgt.k + ')', cls: 'c-t', dx: -50 }, { x: tgt.h + tgt.r, y: tgt.k, label: '(' + (tgt.h + tgt.r) + ', ' + tgt.k + ')', cls: 'c-t' }] });
    s.out.innerHTML = H('Your circle: ~' + shifted('x', v.h) + '^2 + ' + shifted('y', v.k) + '^2 = ' + f1(v.r * v.r) + '~') + (ok ? '<b class="win"> ✓ Matched!</b>' : '');
  };
  const vals = sliders(s.sl, [{ k: 'h', label: 'center x (h)', min: -6, max: 6, step: 1, val: 0 }, { k: 'k', label: 'center y (k)', min: -6, max: 6, step: 1, val: 0 }, { k: 'r', label: 'radius r', min: 1, max: 7, step: 1, val: 3 }], draw);
  roll(); draw(vals); addButton(s.btn, 'New target', () => { roll(); draw(vals); });
};

/* ---------- parabola match (ch3) ---------- */
W.parabolaMatch = function (host) {
  const s = shell(host, true); let tgt;
  const roll = () => { tgt = { a: pick([-2, -1, -0.5, 0.5, 1, 2]), h: rnd(-4, 4), k: rnd(-4, 4) }; };
  const draw = v => {
    const ok = Math.abs(v.a - tgt.a) < 1e-9 && v.h === tgt.h && v.k === tgt.k;
    s.plot.innerHTML = plot({ xmin: -10, xmax: 10, ymin: -10, ymax: 10, step: 1, lab: 2, label: 'target parabola and your parabola', curves: [{ f: x => tgt.a * (x - tgt.h) ** 2 + tgt.k, cls: 'c-t dashed' }, { f: x => v.a * (x - v.h) ** 2 + v.k, cls: 'c-a' }], points: [{ x: tgt.h, y: tgt.k, label: 'vertex (' + tgt.h + ', ' + tgt.k + ')', cls: 'c-t' }, { x: tgt.h + 2, y: tgt.a * 4 + tgt.k, label: '(' + (tgt.h + 2) + ', ' + f1(tgt.a * 4 + tgt.k) + ')', cls: 'c-t', dx: 8, dy: 14 }] });
    s.out.innerHTML = H('Your parabola: ~y = ' + coef(v.a, shifted('x', v.h) + '^2') + tail(v.k) + '~') + (ok ? '<b class="win"> ✓ Matched!</b>' : '');
  };
  const vals = sliders(s.sl, [{ k: 'a', label: 'stretch a', min: -3, max: 3, step: 0.5, val: 1 }, { k: 'h', label: 'vertex x (h)', min: -6, max: 6, step: 1, val: 0 }, { k: 'k', label: 'vertex y (k)', min: -6, max: 6, step: 1, val: 0 }], draw);
  roll(); draw(vals); addButton(s.btn, 'New target', () => { roll(); draw(vals); });
};

/* ---------- end behavior lab (ch3) ---------- */
W.endBehaviorLab = function (host) {
  const s = shell(host); let sign = 1;
  const draw = v => {
    const n = v.n, sc = Math.pow(3, n) / 8;
    s.plot.innerHTML = plot({ xmin: -4, xmax: 4, ymin: -9, ymax: 9, step: 1, lab: 2, label: 'graph of a power function', curves: [{ f: x => sign * Math.pow(x, n) / sc, cls: 'c-a' }] });
    const even = n % 2 === 0, right = sign > 0 ? 'up ↑' : 'down ↓', left = even ? right : (sign > 0 ? 'down ↓' : 'up ↑');
    s.out.innerHTML = H(`Leading term: ~${sign < 0 ? '-' : ''}x^${n}~. Degree is <b>${even ? 'even' : 'odd'}</b>, leading coefficient is <b>${sign > 0 ? 'positive' : 'negative'}</b>.<br>Left end goes <b>${left}</b>; right end goes <b>${right}</b>.`);
  };
  const vals = sliders(s.sl, [{ k: 'n', label: 'degree n', min: 1, max: 8, step: 1, val: 3 }], draw);
  selectRow(s.sl, 'Leading coefficient', [['1', 'positive (+)'], ['-1', 'negative (−)']], '1', v => { sign = +v; draw(vals); });
  draw(vals);
};

/* ---------- multiplicity lab (ch3) ---------- */
W.multiplicityLab = function (host) {
  const s = shell(host); const roots = [-3, 0, 3], m = [1, 2, 3];
  const draw = () => {
    const raw = x => Math.pow(x + 3, m[0]) * Math.pow(x, m[1]) * Math.pow(x - 3, m[2]);
    let mx = 0; for (let x = -4.5; x <= 4.5; x += 0.05) mx = Math.max(mx, Math.abs(raw(x))); const k = 7 / (mx || 1);
    s.plot.innerHTML = plot({ xmin: -5, xmax: 5, ymin: -9, ymax: 9, step: 1, lab: 1, label: 'polynomial with chosen multiplicities', curves: [{ f: x => k * raw(x), cls: 'c-a' }], points: roots.map(r => ({ x: r, y: 0, cls: 'c-w', r: 4 })) });
    s.out.innerHTML = H(`~f(x) = (x + 3)^${m[0]} · x^${m[1]} · (x - 3)^${m[2]}~ (scaled to fit)<br>` + roots.map((r, i) => `At ~x = ${r}~ (multiplicity ${m[i]}): ${m[i] % 2 ? '<b>crosses</b>' + (m[i] > 1 ? ' with a flat wiggle' : '') : '<b>touches</b> and bounces'}`).join('<br>'));
  };
  roots.forEach((r, i) => selectRow(s.sl, `multiplicity at x = ${r}`, [['1', '1'], ['2', '2'], ['3', '3']], m[i], v => { m[i] = +v; draw(); }));
  draw();
};

/* ---------- inverse mirror (ch4) ---------- */
const INV = {
  lin: { name: 'f(x) = 2x + 1', f: x => 2 * x + 1, g: x => (x - 1) / 2 },
  cube: { name: 'f(x) = x³ / 2', f: x => x * x * x / 2, g: x => Math.cbrt(2 * x) },
  exp: { name: 'f(x) = 2ˣ', f: x => Math.pow(2, x), g: x => (x > 0 ? Math.log2(x) : NaN) },
  sqrt: { name: 'f(x) = √(x + 3)', f: x => (x >= -3 ? Math.sqrt(x + 3) : NaN), g: x => (x >= 0 ? x * x - 3 : NaN) }
};
W.inverseMirror = function (host) {
  const s = shell(host); let key = 'lin';
  const draw = v => {
    const t = INV[key], y = t.f(v.a), pts = [];
    if (Number.isFinite(y)) { pts.push({ x: v.a, y, cls: 'c-a', label: '(' + f1(v.a) + ', ' + f1(y) + ')' }, { x: y, y: v.a, cls: 'c-b', label: '(' + f1(y) + ', ' + f1(v.a) + ')' }); }
    s.plot.innerHTML = plot({ xmin: -8, xmax: 8, ymin: -8, ymax: 8, step: 1, lab: 2, label: 'a function, its inverse and the line y = x', curves: [{ f: x => x, cls: 'c-t dashed' }, { f: t.f, cls: 'c-a' }, { f: t.g, cls: 'c-b' }], points: pts });
    s.out.innerHTML = H(`<span class="key a">■</span> ${esc(t.name)} &nbsp; <span class="key b">■</span> its inverse &nbsp; <span class="key t">- -</span> y = x<br>${Number.isFinite(y) ? 'The point <b>(a, b)</b> on f becomes <b>(b, a)</b> on the inverse: the x and y swap places.' : 'That x is outside the domain of f. Slide it elsewhere.'}`);
  };
  const vals = sliders(s.sl, [{ k: 'a', label: 'pick x', min: -4, max: 4, step: 0.5, val: 1 }], draw);
  selectRow(s.sl, 'Function', Object.entries(INV).map(([k, v]) => [k, v.name]), key, v => { key = v; draw(vals); });
  draw(vals);
};

/* ---------- exp & log lab (ch4) ---------- */
W.expLogLab = function (host) {
  const s = shell(host);
  const draw = v => {
    const b = v.b;
    s.plot.innerHTML = plot({ xmin: -4, xmax: 8, ymin: -4, ymax: 8, step: 1, lab: 2, label: 'exponential, logarithm and y = x', curves: [{ f: x => x, cls: 'c-t dashed' }, { f: x => Math.pow(b, x), cls: 'c-a' }, { f: x => (x > 0 ? Math.log(x) / Math.log(b) : NaN), cls: 'c-b', from: 0.001 }], points: [{ x: 0, y: 1, cls: 'c-a', label: '(0, 1)', dx: 8, dy: -8 }, { x: 1, y: 0, cls: 'c-b', label: '(1, 0)', dx: 8, dy: 16 }] });
    s.out.innerHTML = H(`<span class="key a">■</span> ~y = ${b}^x~ &nbsp; <span class="key b">■</span> ~y = log_${b}(x)~<br>Mirror images across ~y = x~. The exponential passes through ~(0, 1)~; the log passes through ~(1, 0)~ and never touches the y-axis.`);
  };
  sliders(s.sl, [{ k: 'b', label: 'base b', min: 1.2, max: 6, step: 0.1, val: 2 }], draw); draw({ b: 2 });
};

/* ---------- growth lab (ch4) ---------- */
W.growthLab = function (host) {
  const s = shell(host);
  const draw = v => {
    const r = v.r / 100, t = v.t, P = 1000, A = n => P * Math.pow(1 + r / n, n * t), Ac = P * Math.exp(r * t), simple = P * (1 + r * t);
    const ymax = Math.max(Ac, simple) * 1.04, ymin = P * 0.96, st = niceStep(ymax - ymin);
    s.plot.innerHTML = plot({ xmin: 0, xmax: t, ymin, ymax, step: st, lab: st, w: 460, h: 300, label: 'growth of $1000 under different compounding', curves: [{ f: x => P * (1 + r * x), cls: 'c-t dashed', from: 0, to: t }, { f: x => P * Math.pow(1 + r, x), cls: 'c-a', from: 0, to: t }, { f: x => P * Math.pow(1 + r / 12, 12 * x), cls: 'c-w', from: 0, to: t }, { f: x => P * Math.exp(r * x), cls: 'c-b', from: 0, to: t }] });
    const d = n => '$' + A(n).toFixed(2);
    s.out.innerHTML = H(`After ${t} years at ${v.r}%, starting from $1,000:<br><span class="key t">- -</span> simple interest (no compounding): <b>$${simple.toFixed(2)}</b><br><span class="key a">■</span> compounded annually: <b>${d(1)}</b><br>Quarterly: <b>${d(4)}</b> &nbsp; <span class="key w">■</span> Monthly: <b>${d(12)}</b><br><span class="key b">■</span> Continuously: <b>$${Ac.toFixed(2)}</b><br>More frequent compounding helps, but with diminishing returns.`);
  };
  sliders(s.sl, [{ k: 'r', label: 'rate %', min: 1, max: 12, step: 0.5, val: 6 }, { k: 't', label: 'years', min: 1, max: 30, step: 1, val: 10 }], draw); draw({ r: 6, t: 10 });
};

/* ---------- rational lab (ch3) ---------- */
W.rationalLab = function (host) {
  const s = shell(host);
  const draw = v => {
    const a = v.a === 0 ? 1 : v.a, f = x => a * (x - v.p) * (x - v.q) / ((x - v.r) * (x - v.s));
    const poles = [...new Set([v.r, v.s])].filter(p => p !== v.p && p !== v.q), holes = [...new Set([v.p, v.q])].filter(z => z === v.r || z === v.s);
    const hy = h => { const o = [v.p, v.q].filter(z => z !== h)[0] ?? h; void o; const num = (v.p === h ? (h - v.q) : (h - v.p)), den = (v.r === h ? (h - v.s) : (h - v.r)); return den === 0 ? NaN : a * num / den; };
    s.plot.innerHTML = plot({ xmin: -9, xmax: 9, ymin: -10, ymax: 10, step: 1, lab: 3, label: 'a rational function with its asymptotes', vlines: poles.map(x => ({ x })), hlines: [{ y: a }], curves: [{ f, cls: 'c-a' }], points: holes.map(h => ({ x: h, y: hy(h), open: true, cls: 'c-w' })).filter(p => Number.isFinite(p.y)) });
    s.out.innerHTML = H(`~f(x) = {${a}(x ${v.p < 0 ? '+ ' + -v.p : v.p === 0 ? '' : '- ' + v.p})(x ${v.q < 0 ? '+ ' + -v.q : v.q === 0 ? '' : '- ' + v.q})|(x ${v.r < 0 ? '+ ' + -v.r : v.r === 0 ? '' : '- ' + v.r})(x ${v.s < 0 ? '+ ' + -v.s : v.s === 0 ? '' : '- ' + v.s})}~`.replace(/\(x \)/g, 'x') + `<br>Dashed vertical lines sit at the zeros of the <b>denominator</b>. The dashed horizontal line is at ~y = ${a}~ (equal degrees, leading coefficients ~${a}/1~).${holes.length ? '<br><b>A common factor cancels here, so you get a hole (open dot) instead of an asymptote.</b>' : ''}`);
  };
  sliders(s.sl, [{ k: 'a', label: 'a (top coefficient)', min: -3, max: 3, step: 1, val: 1 }, { k: 'p', label: 'numerator zero p', min: -6, max: 6, step: 1, val: -3 }, { k: 'q', label: 'numerator zero q', min: -6, max: 6, step: 1, val: 4 }, { k: 'r', label: 'denominator zero r', min: -6, max: 6, step: 1, val: -2 }, { k: 's', label: 'denominator zero s', min: -6, max: 6, step: 1, val: 2 }], draw);
  draw({ a: 1, p: -3, q: 4, r: -2, s: 2 });
};
if (typeof module !== 'undefined' && module.exports) module.exports = AQ;
})(typeof window !== 'undefined' ? window : globalThis);
