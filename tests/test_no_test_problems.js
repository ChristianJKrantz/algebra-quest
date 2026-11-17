/* Node test: no generated problem, lesson example or flashcard reuses a practice-test problem.
   practice_test_fingerprints.json holds only SHA-256 hashes of each test problem's numbers and variables (tagged
   with the quest it belongs to), so the test problems themselves are not stored in this repo.
   Run: N=2000 node tests/test_no_test_problems.js */
const crypto = require('crypto'), { candidates } = require('./fingerprint.js');
const AQ = require('../js/engine.js'); require('../js/graph.js'); require('../js/gens1.js'); require('../js/gens2.js'); require('../js/content.js'); require('../js/cards.js');
const FP = require('./practice_test_fingerprints.json');
const N = +process.env.N || 2000;
const hash = (tid, seq) => crypto.createHash('sha256').update(tid + '|' + seq.join(',')).digest('hex');
/* A fingerprint matches when it equals a whole math expression (or a run of neighbouring ones). Word-problem
   fingerprints (numbers only) and long math ones (6+ tokens, very specific) also match as a window inside. */
function hits(tid, text) {
  const out = [];
  for (const f of FP.filter(f => f.topic === tid))
    for (const c of candidates(text, f.mode === 'w')) {
      if (c.length === f.len && hash(tid, c) === f.h) out.push(c.join(','));
      else if (f.mode === 'w' || f.len >= 6) for (let i = 0; i + f.len <= c.length; i++) if (hash(tid, c.slice(i, i + f.len)) === f.h) out.push(c.join(','));
    }
  return out;
}
let fails = 0, checked = 0;
// 0. the detector itself works (positive control with a made-up fingerprint)
FP.push({ topic: '__ctl', mode: 'm', len: 4, h: hash('__ctl', ['4', 'x', '-7', '12']) });
if (!hits('__ctl', 'Solve ~4x − 7 = 12~').length || hits('__ctl', 'Solve ~4x + 7 = 12~').length || hits('__ctl', 'Solve ~|4x − 7| + 1 = 12~').length) { console.log('FAIL detector control'); fails++; }
FP.pop();
const topics = Object.keys(AQ.topicIndex);
for (const tid of topics) {
  const t = AQ.topicIndex[tid];
  // 1. generated problems
  for (const gid of t.practice) for (let n = 0; n < N; n++) {
    const p = AQ.gens[gid](); checked++;
    const h = hits(tid, p.prompt).concat(p.visual ? hits(tid, '~' + p.visual.replace(/<[^>]+>/g, ' ') + '~') : []);
    if (h.length) { fails++; if (fails < 10) console.log('FAIL', gid, 'reproduced a practice-test problem:', p.prompt); }
  }
  // 2. lesson text, worked examples and flashcards
  const text = [];
  const walk = o => { if (typeof o === 'string') text.push(o); else if (Array.isArray(o)) o.forEach(walk); else if (o && typeof o === 'object') Object.values(o).forEach(walk); };
  walk(t.learn); walk(t.cheat); walk(AQ.cards[tid] || []);
  for (const s of text) { checked++; const h = hits(tid, s); if (h.length) { fails++; console.log('FAIL lesson/card in', tid, 'matches a practice-test problem:', s.slice(0, 90)); } }
}
console.log(`${FP.length} practice-test fingerprints, ${checked} problems and lesson texts checked, ${fails} matches`);
process.exit(fails ? 1 : 0);
