/* Algebra Quest engine: random helpers, fractions, a small expression parser (real + complex),
   answer checkers, and the text-to-HTML math renderer. No eval anywhere. */
(function (root) {
'use strict';
const AQ = root.AQ = root.AQ || {};

/* ---------------- random ---------------- */
const rnd = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
const pick = arr => arr[Math.floor(Math.random() * arr.length)];
const nz = (a, b) => { let v; do v = rnd(a, b); while (v === 0); return v; };
function shuffle(a) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = rnd(0, i); [a[i], a[j]] = [a[j], a[i]]; } return a; }

/* ---------------- fractions ---------------- */
const gcd = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) [a, b] = [b, a % b]; return a; };
function Fr(n, d = 1) { if (d < 0) { n = -n; d = -d; } const g = gcd(n, d) || 1; return { n: n / g, d: d / g }; }
const fadd = (a, b) => Fr(a.n * b.d + b.n * a.d, a.d * b.d);
const fsub = (a, b) => Fr(a.n * b.d - b.n * a.d, a.d * b.d);
const fmul = (a, b) => Fr(a.n * b.n, a.d * b.d);
const fdiv = (a, b) => Fr(a.n * b.d, a.d * b.n);
const fval = f => f.n / f.d;
/* pretty-ready string: 3, -3, {3|4}, -{3|4} */
const fq = f => f.d === 1 ? String(f.n) : (f.n < 0 ? '-' : '') + '{' + Math.abs(f.n) + '|' + f.d + '}';
/* plain ascii string for input boxes: 3/4 */
const fa = f => f.d === 1 ? String(f.n) : f.n + '/' + f.d;

/* ---------------- polynomial text helpers ---------------- */
function term(c, pow, v, first) {
  if (c === 0) return '';
  const a = Math.abs(c);
  let body;
  if (pow === 0) body = String(a);
  else body = (a === 1 ? '' : a) + v + (pow === 1 ? '' : '^' + pow);
  if (first) return (c < 0 ? '-' : '') + body;
  return (c < 0 ? ' - ' : ' + ') + body;
}
/* coefs high -> low, e.g. [1,-4,0,9] -> x^3 - 4x^2 + 9 */
function poly(coefs, v = 'x') {
  let s = '', n = coefs.length - 1;
  coefs.forEach((c, i) => { s += term(c, n - i, v, s === ''); });
  return s || '0';
}
const lin = (a, b, v = 'x') => poly([a, b], v);
const sgn = n => (n < 0 ? '- ' + (-n) : '+ ' + n);               // "+ 3" / "- 3"
const paren = n => (n < 0 ? '(' + n + ')' : String(n));
function polyEval(c, x) { return c.reduce((s, k) => s * x + k, 0); }
function synth(c, k) {                // divide by (x - k): returns bottom row (last = remainder)
  const row = [c[0]];
  for (let i = 1; i < c.length; i++) row.push(c[i] + row[i - 1] * k);
  return row;
}
function polyMul(a, b) { const r = Array(a.length + b.length - 1).fill(0); a.forEach((x, i) => b.forEach((y, j) => { r[i + j] += x * y; })); return r; }
/* (x - r) factors -> coefficient array */
const fromRoots = (roots, lead = 1) => roots.reduce((p, r) => polyMul(p, [1, -r]), [lead]);
const factorStr = (r, v = 'x') => r === 0 ? v : '(' + v + (r < 0 ? ' + ' + (-r) : ' - ' + r) + ')';

/* ---------------- complex numbers ---------------- */
const C = (re, im = 0) => ({ re, im });
const cadd = (a, b) => C(a.re + b.re, a.im + b.im);
const csub = (a, b) => C(a.re - b.re, a.im - b.im);
const cmul = (a, b) => C(a.re * b.re - a.im * b.im, a.re * b.im + a.im * b.re);
const cdiv = (a, b) => { const d = b.re * b.re + b.im * b.im; return C((a.re * b.re + a.im * b.im) / d, (a.im * b.re - a.re * b.im) / d); };
const cneg = a => C(-a.re, -a.im);
const isReal = a => Math.abs(a.im) < 1e-9;
const NaNc = () => C(NaN, NaN);
function oddDen(x) { for (let q = 1; q <= 9; q++) { const p = x * q; if (Math.abs(p - Math.round(p)) < 1e-9) return q % 2 === 1 ? q : 0; } return 0; }
function cpow(a, b) {
  if (isReal(b) && Number.isInteger(Math.round(b.re * 1e9) / 1e9) && Math.abs(b.re) <= 64) {
    const n = Math.round(b.re); let r = C(1); for (let i = 0; i < Math.abs(n); i++) r = cmul(r, a);
    return n < 0 ? cdiv(C(1), r) : r;
  }
  if (isReal(a) && isReal(b)) {
    if (a.re >= 0) return C(Math.pow(a.re, b.re));
    const q = oddDen(b.re); if (!q) return NaNc();
    const p = Math.round(b.re * q);
    return C((Math.abs(p) % 2 === 1 ? -1 : 1) * Math.pow(-a.re, b.re));
  }
  return NaNc();
}
const csqrt = a => isReal(a) ? (a.re >= 0 ? C(Math.sqrt(a.re)) : C(0, Math.sqrt(-a.re))) : NaNc();
const ceq = (a, b, tol = 1e-6) => {
  if (!Number.isFinite(a.re) || !Number.isFinite(a.im) || !Number.isFinite(b.re) || !Number.isFinite(b.im)) return false;
  return Math.hypot(a.re - b.re, a.im - b.im) <= tol * (1 + Math.max(Math.hypot(a.re, a.im), Math.hypot(b.re, b.im)));
};

/* ---------------- expression parser ---------------- */
function normalize(s) {
  const sup = { '²': '^2', '³': '^3', '⁴': '^4', '⁵': '^5', '⁶': '^6', '⁷': '^7', '⁸': '^8', '⁹': '^9', '¹': '^1', '⁰': '^0' };
  return String(s).replace(/[−–—]/g, '-').replace(/[×·⋅]/g, '*').replace(/÷/g, '/').replace(/[²³⁴⁵⁶⁷⁸⁹¹⁰]/g, c => sup[c])
    .replace(/√/g, 'sqrt').replace(/∛/g, 'cbrt').replace(/π/g, 'pi').replace(/∞/g, 'inf').replace(/[\[]/g, '(').replace(/\]/g, ')')
    .replace(/\binfinity\b/gi, 'inf').replace(/\bpi\b/gi, 'pi').replace(/\{/g, '(').replace(/\}/g, ')');
}
const FN = ['infinity', 'sqrt', 'cbrt', 'abs', 'log', 'ln', 'inf', 'pi'];
function tokenize(src) {
  const toks = []; let i = 0;
  while (i < src.length) {
    const ch = src[i];
    if (/\s/.test(ch)) { i++; continue; }
    let m = /^(\d+\.?\d*|\.\d+)/.exec(src.slice(i));
    if (m) { toks.push({ t: 'num', v: m[1] }); i += m[1].length; continue; }
    if (/[A-Za-z]/.test(ch)) {
      const rest = src.slice(i);
      const f = FN.find(f => rest.startsWith(f));
      if (f) { toks.push({ t: (f === 'pi' || f === 'inf' || f === 'infinity') ? 'const' : 'fn', v: f }); i += f.length; }
      else { toks.push({ t: 'id', v: ch }); i++; }
      continue;
    }
    if ('+-*/^(),_=|'.includes(ch)) { toks.push({ t: 'op', v: ch }); i++; continue; }
    throw new Error('char:' + ch);
  }
  return toks;
}
const cache = new Map();
const expressionOps = {
  number: text => C(Number(text)),
  '+': cadd, '-': csub, '*': cmul, '/': cdiv, '^': cpow,
  negate: cneg, sqrt: csqrt
};
function compile(str, ops = expressionOps) {
  const key = String(str);
  if (ops === expressionOps && cache.has(key)) return cache.get(key);
  const toks = tokenize(normalize(key));
  let p = 0;
  const peek = (o = 0) => toks[p + o];
  const isOp = (t, v) => t && t.t === 'op' && t.v === v;
  let absDepth = 0;
  const startsAtom = t => t && (t.t === 'num' || t.t === 'id' || t.t === 'fn' || t.t === 'const' || isOp(t, '(') || (isOp(t, '|') && absDepth === 0));
  const bin = (o, a, b) => env => ops[o](a(env), b(env));
  function expr() { let n = termP(); while (peek() && (isOp(peek(), '+') || isOp(peek(), '-'))) { const o = toks[p++].v; n = bin(o, n, termP()); } return n; }
  function termP() {
    let n = unary();
    for (;;) {
      const t = peek();
      if (isOp(t, '*') || isOp(t, '/')) { p++; n = bin(t.v, n, unary()); }
      else if (startsAtom(t)) n = bin('*', n, power());
      else break;
    }
    return n;
  }
  function unary() {
    if (isOp(peek(), '-')) { p++; const u = unary(); return env => ops.negate(u(env)); }
    if (isOp(peek(), '+')) { p++; return unary(); }
    return power();
  }
  function power() {
    const b = atom();
    if (isOp(peek(), '^')) { p++; const e = unary(); return bin('^', b, e); }
    return b;
  }
  function parenOrPower() {
    if (isOp(peek(), '(')) { p++; const e = expr(); if (!isOp(peek(), ')')) throw new Error('paren'); p++; return e; }
    return power();
  }
  function atom() {
    const t = toks[p++];
    if (!t) throw new Error('end');
    if (t.t === 'num') { const v = ops.number(t.v); return () => v; }
    if (t.t === 'const') { const v = t.v === 'pi' ? C(Math.PI) : C(Infinity); return () => v; }
    if (t.t === 'id') {
      if (t.v === 'i') return env => (env && env.i !== undefined) ? env.i : C(0, 1);
      if (t.v === 'e') return env => (env && env.e !== undefined) ? env.e : C(Math.E);
      return env => { const v = env && env[t.v]; if (v === undefined) throw new Error('var:' + t.v); return v; };
    }
    if (t.t === 'fn') {
      if (t.v === 'log') {
        let base = null;
        if (isOp(peek(), '_')) {
          p++;
          if (isOp(peek(), '(')) { p++; base = expr(); if (!isOp(peek(), ')')) throw new Error('paren'); p++; }
          else base = atom();
        } else if (peek() && (peek().t === 'num' || peek().t === 'id') && isOp(peek(1), '(')) base = atom();
        const arg = parenOrPower();
        return env => {
          const a = arg(env); if (!isReal(a) || a.re <= 0) return NaNc();
          if (!base) return C(Math.log10(a.re));
          const b = base(env); if (!isReal(b) || b.re <= 0 || Math.abs(b.re - 1) < 1e-12) return NaNc();
          return C(Math.log(a.re) / Math.log(b.re));
        };
      }
      const arg = parenOrPower();
      if (t.v === 'sqrt') return env => ops.sqrt(arg(env));
      if (t.v === 'cbrt') return env => { const a = arg(env); return isReal(a) ? C(Math.cbrt(a.re)) : NaNc(); };
      if (t.v === 'abs') return env => { const a = arg(env); return C(Math.hypot(a.re, a.im)); };
      if (t.v === 'ln') return env => { const a = arg(env); return (isReal(a) && a.re > 0) ? C(Math.log(a.re)) : NaNc(); };
    }
    if (isOp(t, '(')) { const e = expr(); if (!isOp(peek(), ')')) throw new Error('paren'); p++; return e; }
    if (isOp(t, '|')) { absDepth++; const e = expr(); absDepth--; if (!isOp(peek(), '|')) throw new Error('bar'); p++; return env => { const a = e(env); return C(Math.hypot(a.re, a.im)); }; }
    throw new Error('tok');
  }
  const f = expr();
  if (p < toks.length) throw new Error('extra');
  if (ops === expressionOps) cache.set(key, f);
  return f;
}
function evalStr(str, env) { return compile(str)(env || {}); }
function evalReal(str, env) { const v = evalStr(str, env); if (!isReal(v) || !Number.isFinite(v.re)) throw new Error('notreal'); return v.re; }
function tryEval(str, env) { try { return evalStr(str, env); } catch (e) { return null; } }

/* ---------------- calculator ---------------- */
function rational(n, d = 1n) {
  if (!d || n.toString().length > 250 || d.toString().length > 250) return null;
  if (d < 0n) { n = -n; d = -d; }
  let a = n < 0n ? -n : n, b = d;
  while (b) [a, b] = [b, a % b];
  return { n: n / a, d: d / a };
}

function carryExact(approximate, exact) {
  return (a, b) => {
    const fraction = a.fraction && b.fraction ? exact(a.fraction, b.fraction) : null;
    const value = fraction ? C(Number(fraction.n) / Number(fraction.d)) : approximate(a, b);
    return { ...value, fraction };
  };
}

function integerSqrt(n) {
  if (n < 2n) return n;
  let root = 1n << BigInt(Math.ceil(n.toString(2).length / 2));
  for (;;) {
    const next = (root + n / root) / 2n;
    if (next >= root) return root;
    root = next;
  }
}

const calculatorOps = {
  number(text) {
    const [whole, decimal = ''] = text.split('.');
    return { ...C(Number(text)), fraction: rational(BigInt(whole + decimal), 10n ** BigInt(decimal.length)) };
  },
  '+': carryExact(cadd, (a, b) => rational(a.n * b.d + b.n * a.d, a.d * b.d)),
  '-': carryExact(csub, (a, b) => rational(a.n * b.d - b.n * a.d, a.d * b.d)),
  '*': carryExact(cmul, (a, b) => rational(a.n * b.n, a.d * b.d)),
  '/': carryExact(cdiv, (a, b) => rational(a.n * b.d, a.d * b.n)),
  '^': carryExact(cpow, (a, b) => {
    if (b.d !== 1n || b.n < -64n || b.n > 64n) return null;
    return b.n < 0n ? rational(a.d ** -b.n, a.n ** -b.n) : rational(a.n ** b.n, a.d ** b.n);
  }),
  negate: a => ({ ...cneg(a), fraction: a.fraction && { n: -a.fraction.n, d: a.fraction.d } }),
  sqrt(a) {
    const value = csqrt(a);
    if (!a.fraction || a.fraction.n < 0n) return value;
    const { n, d } = a.fraction;
    const rn = integerSqrt(n), rd = integerSqrt(d);
    if (rn * rn === n && rd * rd === d) value.fraction = { n: rn, d: rd };
    return value;
  }
};

function calculate(text) {
  if (text.length > 160 || /[\d.]\s+[\d.]|\.\d*\./.test(text)) throw new Error('expression');
  const value = compile(text, calculatorOps)(Object.create(null));
  if (!isReal(value) || !Number.isFinite(value.re)) throw new Error('real result required');
  const f = value.fraction;
  return {
    exact: f ? (f.d === 1n ? String(f.n) : f.n + '/' + f.d) : null,
    decimal: String(Number(value.re.toPrecision(12)))
  };
}

/* ---------------- answer checkers (each returns {ok,msg}) ---------------- */
const OK = (msg = '') => ({ ok: true, msg });
const NO = (msg = '') => ({ ok: false, msg });
const READ_FAIL = 'I couldn’t read that. Use numbers, fractions like 3/4, ^ for powers, and sqrt( ) for roots (the keyboard row helps).';
const stripLabel = s => String(s).replace(/^\s*[A-Za-z]{1,3}(\^\(?-1\)?)?(\([a-z]\))?\s*=\s*/, '');
function readReal(str) {
  let s = String(str).trim().replace(/^\$\s*/, '');
  if (/^-?\d{1,3}(,\d{3})+(\.\d+)?$/.test(s)) s = s.replace(/,/g, '');
  s = s.replace(/\s+(years?|yrs?|dollars?|meters?|metres?|feet|ft|units?|cm|km|kilometers?|centimeters?)\s*$/i, '');
  if (!s) throw new Error('empty');
  return evalReal(stripLabel(s));
}
function numCheck(expected, o = {}) {
  const tol = o.tol === undefined ? 1e-6 : o.tol;
  return str => {
    let v; try { v = readReal(str); } catch (e) { return NO(READ_FAIL); }
    if (Math.abs(v - expected) <= tol * (o.relative ? Math.max(1, Math.abs(expected)) : 1)) return OK();
    if (o.roundedDecimal) {
      const decimal = String(str).trim().match(/^[+-]?\d*\.(\d{3,})$/);
      if (decimal && Math.abs(v - expected) <= 0.5 * 10 ** -decimal[1].length + Number.EPSILON * Math.abs(expected)) return OK();
    }
    for (const b of (o.bad || [])) if (Math.abs(v - b.val) <= Math.max(tol, 1e-6)) return NO(b.msg);
    if (o.nudge) { const m = o.nudge(v); if (m) return NO(m); }
    return NO('Not quite. Check your arithmetic and try again.');
  };
}
const NONE_RE = /^(none|no solutions?|no sol|dne|empty( set)?|∅|\{\}|nothing)$/i;
function setCheck(expected, o = {}) {
  const tol = o.tol === undefined ? 1e-6 : o.tol;
  const exp = expected.slice().sort((a, b) => a - b);
  return str => {
    const s = String(str).trim();
    if (!s) return NO(READ_FAIL);
    if (NONE_RE.test(s)) return exp.length === 0 ? OK() : NO('There is at least one solution. Keep working.');
    if (exp.length === 0) return NO('Plug your value back into the original equation. Does it really work?');
    let vals;
    try { vals = s.replace(/\bor\b|;|\band\b/gi, ',').split(',').map(t => t.trim()).filter(Boolean).map(t => evalReal(stripLabel(t))); }
    catch (e) { return NO(READ_FAIL + ' Separate several answers with commas.'); }
    const uniq = [...new Set(vals.map(v => Math.round(v / (tol * 10 || 1e-9))))].length;
    const got = vals.slice().sort((a, b) => a - b);
    const hit = exp.filter(e => got.some(g => Math.abs(g - e) <= tol));
    const extra = got.filter(g => !exp.some(e => Math.abs(g - e) <= tol));
    if (hit.length === exp.length && extra.length === 0) return OK();
    if (o.bad) for (const b of o.bad) if (got.some(g => Math.abs(g - b.val) <= 1e-6)) return NO(b.msg);
    if (extra.length === 0 && hit.length < exp.length) return NO('Good so far, but there ' + (exp.length - hit.length === 1 ? 'is one more solution' : 'are more solutions') + '. Did you use both ± cases?');
    if (hit.length > 0) return NO('At least one of those doesn’t work. Check each value in the original equation.');
    void uniq;
    return NO('Not quite. Try again.');
  };
}
function ptCheck(x, y, o = {}) {
  const tol = o.tol === undefined ? 1e-6 : o.tol;
  return str => {
    const m = /^\s*[A-Za-z]?\s*\((.*),(.*)\)\s*$/.exec(normalize(str).replace(/\)\s*$/, ')') );
    let a, b;
    try {
      const mm = /^\s*[A-Za-z]?\s*\(\s*(.+?)\s*,\s*(.+?)\s*\)\s*$/.exec(String(str));
      if (!mm) throw new Error('shape');
      a = evalReal(mm[1]); b = evalReal(mm[2]);
    } catch (e) { void m; return NO('Write it as an ordered pair like (3, -2).'); }
    if (Math.abs(a - x) <= tol && Math.abs(b - y) <= tol) return OK();
    if (Math.abs(a - y) <= tol && Math.abs(b - x) <= tol && x !== y) return NO('You have the right numbers but in the wrong order. x comes first.');
    if (Math.abs(a - x) <= tol) return NO('The x-coordinate is right. Recheck the y-coordinate.');
    if (Math.abs(b - y) <= tol) return NO('The y-coordinate is right. Recheck the x-coordinate.');
    return NO('Not quite. Check both coordinates.');
  };
}
const SAMPLES = [-3.7, -2.3, -1.1, -0.45, 0.6, 1.3, 1.9, 2.9, 4.3, 6.1];
function exprCheck(expectedFn, o = {}) {
  const vars = o.vars || ['x'];
  return str => {
    let s = String(str).trim();
    if (!s) return NO(READ_FAIL);
    s = s.replace(/^\s*[A-Za-z]{1,3}(\^\(?-1\)?)?(\([a-z,]*\))?\s*=\s*/, '');
    if (s.includes('=')) return NO('Give just the expression (one side), not an equation.');
    if (o.ban && o.ban.test(s)) return NO(o.banMsg || 'Simplify further.');
    let f; try { f = compile(s); } catch (e) { return NO(READ_FAIL); }
    let tested = 0;
    for (let k = 0; k < 12; k++) {
      const env = {}, plain = {};
      vars.forEach((v, i) => {
        const val = o.domain === 'pos' ? 0.6 + ((k * 7 + i * 3) % 11) * 0.73 + Math.random() * 0.2 : SAMPLES[(k + i * 3) % SAMPLES.length] + (i ? 0.17 : 0);
        env[v] = C(val); plain[v] = val;
      });
      let want; try { want = vars.length === 1 ? expectedFn(plain[vars[0]]) : expectedFn(plain); } catch (e) { continue; }
      if (want === undefined || want === null || !Number.isFinite(want)) continue;
      let got; try { got = f(env); } catch (e) { return NO(/var:/.test(e.message) ? 'Your answer uses a variable that isn’t in this problem (' + e.message.slice(4) + ').' : READ_FAIL); }
      if (!ceq(got, C(want), 1e-6)) return NO(o.wrong || 'Not quite. Your expression doesn’t match the real one. Check signs and distributing.');
      tested++;
    }
    if (tested < 3) return NO('I couldn’t test that. Check the form of your answer.');
    if (o.after) { const m = o.after(s); if (m) return NO(m); }
    return OK();
  };
}
/* a + bi, accepts value-equal, nags if not simplified */
function complexCheck(re, im, o = {}) {
  return str => {
    let v; try { v = evalStr(String(str).trim()); } catch (e) { return NO('Write it as a + bi, for example 3 - 4i.'); }
    if (!str.trim()) return NO('Write it as a + bi, for example 3 - 4i.');
    if (!ceq(v, C(re, im), 1e-6)) return NO(o.wrong || 'Not quite. Check the real part and the imaginary part separately.');
    const s = String(str).replace(/\s+/g, '');
    if (/\/\([^()]*i[^()]*\)/.test(s) || /\/i/.test(s) || /\([^()]*i[^()]*\)\s*[(\d*\/]/.test(s) || /[\d)]\*?\([^()]*i[^()]*\)/.test(s) || /i\^/.test(s))
      return NO('That’s the right value, but it isn’t simplified yet. Write it in the form a + bi.');
    return OK();
  };
}
function complexSetCheck(list) {
  return str => {
    const parts = String(str).split(/;|\bor\b|\band\b|,(?![^()]*\))/i).map(t => t.trim()).filter(Boolean);
    if (parts.length === 0) return NO(READ_FAIL);
    let vs; try { vs = parts.map(t => evalStr(stripLabel(t))); } catch (e) { return NO('Write each root as a + bi and separate the two roots with a semicolon or “or”.'); }
    const need = list.map(([r, i]) => C(r, i));
    const ok = need.every(n => vs.some(v => ceq(v, n))) && vs.every(v => need.some(n => ceq(v, n)));
    if (ok) return OK();
    if (vs.length < need.length) return NO('A quadratic has two roots. Give both (separate with a semicolon).');
    return NO('Not quite. Make sure you used ± on the imaginary part and halved correctly.');
  };
}

/* ---- intervals ---- */
function parseIntervals(str) {
  const s = normalize(String(str)).replace(/\(\s*\)/g, '').replace(/\bU\b|∪|\bu\b|\bor\b/g, ' ; ').replace(/\binf\b/g, 'inf');
  const re = /([(\[])\s*([^,;()\[\]]+?)\s*,\s*([^,;()\[\]]+?)\s*([)\]])/g;
  // brackets were normalized to ( ) by normalize(); recover square brackets from the raw string
  const raw = String(str).replace(/∪|\bU\b|\bor\b/g, ' ; ');
  const out = []; let m;
  const rawRe = /([(\[])\s*([^,;()\[\]]+?)\s*,\s*([^,;()\[\]]+?)\s*([)\]])/g;
  while ((m = rawRe.exec(raw))) {
    const clean = t => t.replace(/\binfinity\b|∞|\boo\b/gi, 'inf').replace(/−/g, '-');
    const lo = evalStr(clean(m[2])).re, hi = evalStr(clean(m[3])).re;
    out.push({ lo, hi, loC: m[1] === '[', hiC: m[4] === ']' });
  }
  void s; void re;
  return out;
}
function sameIv(a, b) {
  const near = (x, y) => (x === y) || Math.abs(x - y) < 1e-9;
  return near(a.lo, b.lo) && near(a.hi, b.hi);
}
function ivCheck(expected) {
  const exp = expected.slice().sort((a, b) => a.lo - b.lo);
  return str => {
    const s = String(str).trim();
    if (!s) return NO('Write it in interval notation, like (-2, 5] or (-inf, 1) U (4, inf).');
    if (NONE_RE.test(s) && exp.length === 0) return OK();
    let got; try { got = parseIntervals(s); } catch (e) { return NO('Write it in interval notation, like (-2, 5] or (-inf, 1) U (4, inf).'); }
    if (!got.length) return NO('Write it in interval notation, like (-2, 5] or (-inf, 1) U (4, inf).');
    got.sort((a, b) => a.lo - b.lo);
    for (const g of got) if (g.lo > g.hi) return NO('The smaller number goes first inside the brackets.');
    if (got.length === exp.length && got.every((g, i) => sameIv(g, exp[i]))) {
      for (let i = 0; i < got.length; i++) {
        const g = got[i], e = exp[i];
        if (Number.isFinite(g.lo) && g.loC !== e.loC) return NO('Right endpoints. Check the brackets: [ ] when the endpoint is included, ( ) when it isn’t.');
        if (Number.isFinite(g.hi) && g.hiC !== e.hiC) return NO('Right endpoints. Check the brackets: [ ] when the endpoint is included, ( ) when it isn’t.');
        if (!Number.isFinite(g.lo) && g.loC) return NO('Infinity always gets a round bracket.');
        if (!Number.isFinite(g.hi) && g.hiC) return NO('Infinity always gets a round bracket.');
      }
      return OK();
    }
    if (got.length !== exp.length) return NO(exp.length > 1 ? 'The solution has more than one piece. Join the pieces with U.' : 'This solution is a single interval. Check whether you split it unnecessarily.');
    return NO('Not quite. Check your endpoints and which side of them works.');
  };
}
/* turn expected intervals into display text */
function ivStr(list) {
  return list.map(i => (i.loC ? '[' : '(') + (i.lo === -Infinity ? '-inf' : i.lo) + ', ' + (i.hi === Infinity ? 'inf' : i.hi) + (i.hiC ? ']' : ')')).join(' U ') || 'none';
}
const noneAllowedIv = expected => ivCheck(expected);


/* equation answer: user types A = B; passes when (A - B) is a constant multiple of the expected g(x,y) = 0 form */
function eqCheck(expectedFn, o = {}) {
  const vars = o.vars || ['x', 'y'];
  return str => {
    const s = String(str).trim();
    const parts = s.split('=');
    if (parts.length !== 2 || !parts[0].trim() || !parts[1].trim()) return NO('Write it as an equation with one = sign.');
    let fa, fb; try { fa = compile(parts[0]); fb = compile(parts[1]); } catch (e) { return NO(READ_FAIL); }
    let ratio = null, n = 0;
    for (let k = 0; k < 14; k++) {
      const env = {}, plain = {};
      vars.forEach((v, i) => { const val = SAMPLES[(k * 3 + i * 5) % SAMPLES.length] + i * 0.31 + k * 0.07; env[v] = C(val); plain[v] = val; });
      const want = expectedFn(plain); let got;
      try { const a = fa(env), b = fb(env); got = csub(a, b); } catch (e) { return NO('Your equation uses a variable that isn’t in this problem.'); }
      if (!isReal(got) || !Number.isFinite(got.re)) return NO(READ_FAIL);
      if (Math.abs(want) < 1e-9) { if (Math.abs(got.re) > 1e-6) return NO(o.wrong || 'Not quite. Check the center and the radius.'); continue; }
      const r = got.re / want;
      if (ratio === null) ratio = r; else if (Math.abs(r - ratio) > 1e-6 * (1 + Math.abs(ratio))) return NO(o.wrong || 'Not quite. Check the center and the radius.');
      n++;
    }
    if (n < 3 || Math.abs(ratio) < 1e-9) return NO('Not quite.');
    return OK();
  };
}
/* simplify sqrt(n) -> [outside, inside] */
function simpRad(n) { let out = 1, inn = n; for (let f = 2; f * f <= inn; f++) while (inn % (f * f) === 0) { inn /= f * f; out *= f; } return [out, inn]; }
const radStr = n => { const [o, i] = simpRad(n); return i === 1 ? String(o) : (o === 1 ? '' : o) + 'sqrt(' + i + ')'; };
const money = n => '$' + Math.round(n).toLocaleString('en-US');

/* ---- multiple choice ---- */
const choiceCheck = (correct, wrongMsg) => v => (v === correct ? OK() : NO(wrongMsg || 'Not quite. Think about the rule again.'));
const multiCheck = (correctKeys, wrongMsg) => v => {
  const got = (Array.isArray(v) ? v : []).slice().sort().join('|'), want = correctKeys.slice().sort().join('|');
  return got === want ? OK() : NO(wrongMsg || 'Not quite. Test each option separately.');
};

/* ---- log / exponential form ---- */
function logFormCheck(base, arg, val) {
  return str => {
    const s = normalize(str).replace(/\s+/g, '');
    const m = /^log_?\(?([^()=]+?)\)?\(([^=]+)\)=(.+)$/.exec(s) || /^log_?\(?([^()=]+?)\)?([^()=]+)=(.+)$/.exec(s) || /^ln\(?([^=]+?)\)?=(.+)$/.exec(s);
    if (!m) return NO('Use the form log_b(x) = y, for example log_2(8) = 3.');
    try {
      const b = evalReal(m[1]), a = evalReal(m[2]), v = evalReal(m[3]);
      if (Math.abs(b - base) < 1e-9 && Math.abs(a - arg) < 1e-9 && Math.abs(v - val) < 1e-9) return OK();
      if (Math.abs(b - base) < 1e-9) return NO('Right base. Which number is the exponent, and which is the result?');
    } catch (e) { return NO('Use the form log_b(x) = y.'); }
    return NO('Not quite. The base of the exponent becomes the base of the log, and the exponent becomes the answer of the log.');
  };
}
function expFormCheck(base, exp, result) {
  return str => {
    const s = normalize(str);
    const sides = s.split('=');
    if (sides.length !== 2) return NO('Write it as an equation, like 2^3 = 8.');
    const tryOrder = (L, R) => {
      const idx = (() => { let d = 0; for (let i = 0; i < L.length; i++) { const c = L[i]; if (c === '(') d++; else if (c === ')') d--; else if (c === '^' && d === 0) return i; } return -1; })();
      if (idx < 0) return null;
      const b = evalReal(L.slice(0, idx)), e = evalReal(L.slice(idx + 1)), r = evalReal(R);
      return { b, e, r };
    };
    try {
      const o = tryOrder(sides[0], sides[1]) || tryOrder(sides[1], sides[0]);
      if (!o) return NO('Write it with a base and an exponent, like 2^3 = 8.');
      if (Math.abs(o.b - base) < 1e-9 && Math.abs(o.e - exp) < 1e-9 && Math.abs(o.r - result) < 1e-9) return OK();
      if (Math.abs(o.b - base) < 1e-9) return NO('Right base. Which number is the exponent and which is the result?');
    } catch (e) { return NO(READ_FAIL); }
    return NO('Not quite. The log’s base is the base; the log’s value is the exponent.');
  };
}
/* log expand / condense structure checks */
function logAtomic(s) {   // every log argument is a single variable or number
  const t = normalize(s).replace(/\s+/g, '');
  const re = /(?:log_?\(?[A-Za-z0-9.]*\)?|ln)\(([^()]*)\)/g; let m;
  while ((m = re.exec(t))) if (!/^[A-Za-z0-9.]+$/.test(m[1])) return false;
  return true;
}
function logCount(s) { return (normalize(s).match(/log|ln/g) || []).length; }

/* ---------------- math text renderer ---------------- */
const escHtml = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
/* tidy generated math before it's shown: "x^2 + 0x + -64" → "x^2 − 64", "1x" → "x", "y = x + 0" → "y = x".
   Only clean-ups a textbook would make; substituted numbers like "3 - 0" or "{1 + 0|2}" are left as worked. */
function tidy(t) {
  return String(t)
    .replace(/(\s)[+-] 0[a-z](\^\d+|\^\([^()]*\))?(?![\w.(])/g, '')                 // a 0x term
    .replace(/([a-z\]]|\)(?:\^\d+)?) [+-] 0(?![\d.\w(])(?=\s*(?:$|[|),]))/g, '$1')   // "x + 0" at the end of an expression
    .replace(/\+ ?-(?=[\d.A-Za-z(√{])/g, '- ')                                       // "+ -3" → "- 3"
    .replace(/(^|[\s(=])- ?-(?=\d)/g, '$1+ ')                                         // "- -3" → "+ 3"
    .replace(/(^|[^\d.^\w])1(?=[xyi](?![a-z]))/g, '$1')                               // "1x" → "x", "-1x" → "-x"
    .replace(/(=\s*-?)1(?=\|)/g, '$1');                                              // "y = 1|x|" → "y = |x|"
}
function pretty(src) {
  let s = escHtml(tidy(src));
  let prev;
  do { prev = s; s = s.replace(/\{([^{}|]*)\|([^{}]*)\}/g, '<span class="fr"><span class="n">$1</span><span class="d">$2</span></span>'); } while (s !== prev);
  s = s.replace(/_\(([^()]*)\)/g, '<sub>$1</sub>').replace(/_([A-Za-z0-9.]+)/g, '<sub>$1</sub>');
  s = s.replace(/\^\(((?:[^()]|\([^()]*\))*)\)/g, '<sup>$1</sup>').replace(/\^(-?\d+(?:\.\d+)?|-?[A-Za-z])/g, '<sup>$1</sup>');
  s = s.replace(/&lt;=/g, '≤').replace(/&gt;=/g, '≥').replace(/-&gt;/g, '→').replace(/!=/g, '≠');
  s = s.replace(/sqrt\(/g, '√(').replace(/sqrt(?=[\dA-Za-z])/g, '√').replace(/cbrt\(/g, '∛(').replace(/\bpi\b/g, 'π').replace(/\binf\b/g, '∞');
  s = s.replace(/ \* /g, ' · ').replace(/\*/g, '·');
  s = s.replace(/(^|[\s(\[,=+·^|>])-(?=[\dA-Za-zπ(√∛{<])/g, '$1−').replace(/ - /g, ' − ');
  return s;
}
/* "text with ~math~ pieces": odd segments are math */
function H(str) {
  return String(str).split('~').map((seg, i) => (i % 2 ? '<span class="m">' + pretty(seg) + '</span>' : seg)).join('');
}

Object.assign(AQ, {
  rnd, pick, nz, shuffle, gcd, Fr, fadd, fsub, fmul, fdiv, fval, fq, fa,
  poly, lin, sgn, paren, term, polyEval, synth, polyMul, fromRoots, factorStr,
  C, cadd, csub, cmul, cdiv, cneg, csqrt, ceq, isReal,
  normalize, compile, evalStr, evalReal, tryEval, calculate,
  eqCheck, simpRad, radStr, money, OK, NO, READ_FAIL, numCheck, setCheck, ptCheck, exprCheck, complexCheck, complexSetCheck,
  parseIntervals, ivCheck, ivStr, noneAllowedIv, choiceCheck, multiCheck, logFormCheck, expFormCheck, logAtomic, logCount,
  escHtml, tidy, pretty, H
});
if (typeof module !== 'undefined' && module.exports) module.exports = AQ;
})(typeof window !== 'undefined' ? window : globalThis);
