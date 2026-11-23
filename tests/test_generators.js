/* Node test: every generator must accept its own answer, reject junk, and never leak the answer in a hint. */
const AQ = require('../js/engine.js'); require('../js/graph.js'); require('../js/gens1.js'); require('../js/gens2.js');
const N = +process.env.N || 300;
let fails = 0, total = 0;
const seen = {}; const fail = (id, msg) => { fails++; seen[id] = (seen[id] || 0) + 1; if (seen[id] <= 2) console.log('FAIL', id, msg); };
// strip display markup to get plain ascii-ish answer for each field
function plain(ans) {
  let s = String(ans).replace(/~/g, '').replace(/\{([^{}|]*?)\s*±\s*([^{}|]*)\|([^{}]*)\}/g, '(($1)+($2))/($3), (($1)-($2))/($3)').replace(/\{([^{}|]*)\|([^{}]*)\}/g, '($1)/($2)').replace(/≈.*$/, '').replace(/−/g, '-').replace(/\(and[^)]*\)/g, '').replace(/ years$/, '');
  s = s.replace(/ and /g, ', ').replace(/\bx ?= ?/g, '').replace(/\by ?= ?/g, '').replace(/f\^\(-1\)\(x\) ?= ?/g, '');
  if (/±/.test(s)) { const m = /^(.*?)\s*±\s*(.*)$/.exec(s); if (m && !/,/.test(s)) s = '(' + m[1].replace(/^\(|\)$/g,'') + ')+(' + m[2] + '), (' + m[1] + ')-(' + m[2] + ')'; }
  return s.trim();
}
for (const id of Object.keys(AQ.gens)) {
  for (let n = 0; n < N; n++) {
    let p; try { p = AQ.gens[id](); } catch (e) { fail(id, 'threw ' + e.stack.split('\n').slice(0, 2).join(' ')); break; }
    total++;
    if (!p.prompt || !p.fields || !p.fields.length || !p.hints || p.hints.length < 2 || !p.solution) { fail(id, 'missing parts'); break; }
    for (const f of p.fields) {
      let canon;
      if (f.kind === 'choice') { const opt = f.options.find(o => o.k === f.check.__k) ; }
      // brute-force the correct value for choice/multi fields
      if (f.kind === 'choice') { const ok = f.options.filter(o => f.check(o.k).ok); if (ok.length !== 1) { fail(id, 'choice field must have exactly one right option: ' + f.label + ' -> ' + ok.length); } continue; }
      if (f.kind === 'multi') { const ks = f.options.map(o => o.k); let good = 0; for (let m = 1; m < 1 << ks.length; m++) { const sel = ks.filter((_, i) => m & (1 << i)); if (f.check(sel).ok) good++; } if (good !== 1) fail(id, 'multi field must have exactly one right set: ' + good); continue; }
      // text field: the displayed answer string must pass its own check (try variants)
      const raw = String(f.answer);
      const tries = [];
      // split alternatives like "x = 1 and x = 2" / "a, b"
      const cleaned = plain(raw);
      tries.push(cleaned);
      if (/^none|^no solution|^it never|^no/.test(raw)) tries.push('none');
      let ok = false, lastMsg = '';
      for (let t of tries) {
        t = t.replace(/^\(?[a-zA-Z]\^?\(?-?1?\)?\(?x?\)?\)? ?= ?/, (m) => m); // leave
        const r = f.check(t); if (r.ok) { ok = true; break; } lastMsg = t + ' => ' + r.msg;
      }
      if (!ok) { // try the structured alternatives manually
        const alts = [];
        const m = plain(raw);
        if (/±/.test(m)) { // x = ±3, ±5  -> 3,-3,5,-5
          const nums = (m.match(/\d+(\.\d+)?/g) || []); alts.push(nums.flatMap(v => [v, '-' + v]).join(', '));
        }
        if (/,/.test(m) && !/\(/.test(m.replace(/\(\s*-?\d+\s*,\s*-?[\d/]+\s*\)/g, ''))) alts.push(m);
        alts.push(m.replace(/\)\s*\/\s*\(/g, ')/(').replace(/ and /g, ', '));
        for (const a of alts) { if (f.check(a).ok) { ok = true; break; } }
      }
      if (!ok) { fail(id, 'own answer rejected: field=' + f.label + ' answer=' + raw + ' | ' + lastMsg + ' | ' + p.prompt.slice(0, 90)); continue; }
      // junk must not pass or crash
      for (const j of ['', '???', '(((', 'abc xyz', '1/0', '9999999', 'x=']) { try { const r = f.check(j); if (r.ok) { fail(id, 'junk accepted: ' + JSON.stringify(j) + ' field ' + f.label + ' answer ' + raw); } } catch (e) { fail(id, 'check threw on junk: ' + e.message); } }
      // hints must not contain the plain answer
      const ansTxt = plain(raw).replace(/\s+/g, '');
      if (ansTxt.length >= 4 && /\d/.test(ansTxt)) for (const h of p.hints) if (h.replace(/\s+/g, '').includes(ansTxt)) fail(id, 'hint leaks answer: ' + h);
    }
  }
}
console.log(`${Object.keys(AQ.gens).length} generators, ${total} problems, ${fails} failures`);
process.exit(fails ? 1 : 0);

const assert = require('node:assert/strict');
const thirds = AQ.numCheck(1 / 3, { roundedDecimal: true });
for (const answer of ['1/3', '.333', '0.3333']) assert.ok(thirds(answer).ok, answer);
for (const answer of ['.33', '.334', '.3330', '332/1000']) assert.ok(!thirds(answer).ok, answer);
assert.ok(!AQ.numCheck(1 / 3)('.333').ok);
