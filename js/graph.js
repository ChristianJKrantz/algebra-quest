/* Algebra Quest: tiny SVG grapher. Returns an SVG string; colours come from CSS classes. */
(function (root) {
'use strict';
const AQ = root.AQ = root.AQ || {};
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const f2 = n => (Math.round(n * 100) / 100).toString();

/* o: {w,h,xmin,xmax,ymin,ymax,step,lab, curves:[{f|pts,cls,dash,from,to}], points:[{x,y,label,cls,open,dx,dy}],
       vlines:[{x,cls}], hlines:[{y,cls}], segs:[[x1,y1,x2,y2,cls]], label:'aria text'} */
function plot(o) {
  const W = o.w || 420, Hh = o.h || 320, m = 24;
  const { xmin, xmax, ymin, ymax } = o;
  const X = x => m + (x - xmin) / (xmax - xmin) * (W - 2 * m);
  const Y = y => Hh - m - (y - ymin) / (ymax - ymin) * (Hh - 2 * m);
  const step = o.step || 1, lab = o.lab || step;
  let s = `<svg class="plot" viewBox="0 0 ${W} ${Hh}" role="img" aria-label="${esc(o.label || 'graph')}" xmlns="http://www.w3.org/2000/svg">`;
  s += `<rect class="pbg" x="0" y="0" width="${W}" height="${Hh}" rx="10"/>`;
  for (let x = Math.ceil(xmin / step) * step; x <= xmax + 1e-9; x += step) s += `<line class="grid${Math.abs(x) < 1e-9 ? ' axis' : ''}" x1="${f2(X(x))}" y1="${m}" x2="${f2(X(x))}" y2="${Hh - m}"/>`;
  for (let y = Math.ceil(ymin / step) * step; y <= ymax + 1e-9; y += step) s += `<line class="grid${Math.abs(y) < 1e-9 ? ' axis' : ''}" x1="${m}" y1="${f2(Y(y))}" x2="${W - m}" y2="${f2(Y(y))}"/>`;
  if (xmin <= 0 && xmax >= 0) s += `<line class="axis" x1="${f2(X(0))}" y1="${m}" x2="${f2(X(0))}" y2="${Hh - m}"/>`;
  if (ymin <= 0 && ymax >= 0) s += `<line class="axis" x1="${m}" y1="${f2(Y(0))}" x2="${W - m}" y2="${f2(Y(0))}"/>`;
  for (let x = Math.ceil(xmin / lab) * lab; x <= xmax + 1e-9; x += lab) if (Math.abs(x) > 1e-9) s += `<text class="tick" x="${f2(X(x))}" y="${f2(Math.min(Hh - 6, Math.max(m + 10, Y(0) + 12)))}" text-anchor="middle">${f2(x)}</text>`;
  for (let y = Math.ceil(ymin / lab) * lab; y <= ymax + 1e-9; y += lab) if (Math.abs(y) > 1e-9) s += `<text class="tick" x="${f2(Math.min(W - 4, Math.max(m - 4, X(0) - 5)))}" y="${f2(Y(y) + 3)}" text-anchor="end">${f2(y)}</text>`;
  (o.vlines || []).forEach(v => { s += `<line class="${v.cls || 'asym'}" x1="${f2(X(v.x))}" y1="${m}" x2="${f2(X(v.x))}" y2="${Hh - m}"/>`; });
  (o.hlines || []).forEach(v => { s += `<line class="${v.cls || 'asym'}" x1="${m}" y1="${f2(Y(v.y))}" x2="${W - m}" y2="${f2(Y(v.y))}"/>`; });
  (o.segs || []).forEach(g => { s += `<line class="curve ${g[4] || 'c-a'}" x1="${f2(X(g[0]))}" y1="${f2(Y(g[1]))}" x2="${f2(X(g[2]))}" y2="${f2(Y(g[3]))}"/>`; });
  (o.curves || []).forEach(c => {
    let pts = c.pts;
    if (!pts && c.f) {
      pts = []; const a = c.from === undefined ? xmin : c.from, b = c.to === undefined ? xmax : c.to, N = 320;
      for (let i = 0; i <= N; i++) { const x = a + (b - a) * i / N; let y; try { y = c.f(x); } catch (e) { y = NaN; } pts.push(Number.isFinite(y) ? [x, y] : null); }
    }
    let d = '', pen = false, last = null;
    const jump = (ymax - ymin) * 1.6;
    pts.forEach(p => {
      if (!p || p[1] > ymax * 6 + 50 || p[1] < ymin * 6 - 50) { pen = false; last = null; return; }
      if (last && Math.abs(p[1] - last[1]) > jump) pen = false;
      d += (pen ? 'L' : 'M') + f2(X(p[0])) + ' ' + f2(Y(Math.max(ymin - 2 * (ymax - ymin), Math.min(ymax + 2 * (ymax - ymin), p[1])))) + ' ';
      pen = true; last = p;
    });
    s += `<path class="curve ${c.cls || 'c-a'}${c.dash ? ' dashed' : ''}" d="${d}"/>`;
  });
  (o.points || []).forEach(p => {
    s += `<circle class="pt ${p.cls || 'c-w'}${p.open ? ' open' : ''}" cx="${f2(X(p.x))}" cy="${f2(Y(p.y))}" r="${p.r || 4.5}"/>`;
    if (p.label) s += `<text class="plab" x="${f2(X(p.x) + (p.dx === undefined ? 8 : p.dx))}" y="${f2(Y(p.y) + (p.dy === undefined ? -8 : p.dy))}">${esc(p.label)}</text>`;
  });
  return s + '</svg>';
}
AQ.plot = plot;
if (typeof module !== 'undefined' && module.exports) module.exports = AQ;
})(typeof window !== 'undefined' ? window : globalThis);
