/* Algebra Quest practice generators, chapters 1 and 2.
   Every generator returns {prompt, fields:[{key,label,check,answer,...}], hints:[], solution:[], visual?}.
   Strings use ~math~ segments (see AQ.H). Hints nudge toward the method and never state the answer. */
(function (root) {
'use strict';
const AQ = root.AQ = root.AQ || {};
const { rnd, pick, nz, shuffle, Fr, fadd, fsub, fmul, fdiv, fval, fq, fa, poly, lin, sgn, paren, polyEval, OK, NO } = AQ;
const G = AQ.gens = AQ.gens || {};
const one = (label, check, answer, ph, extra) => [Object.assign({ key: 'a', label, check, answer, ph }, extra || {})];
const xp = (v, b) => (b < 0 ? v + ' - ' + (-b) : v + ' + ' + b);        // x + 3 / x - 3
const ci = n => (n === 1 ? 'i' : n === -1 ? '-i' : n + 'i');
function cstr(re, im) {                                                    // a + bi as prompt text
  if (im === 0) return String(re);
  if (re === 0) return ci(im);
  return re + (im < 0 ? ' - ' : ' + ') + (Math.abs(im) === 1 ? '' : Math.abs(im)) + 'i';
}
const cfq = (re, im) => {                                                  // fractions allowed
  const R = typeof re === 'object' ? re : Fr(re), I = typeof im === 'object' ? im : Fr(im);
  const rs = fq(R), is = (Math.abs(I.n) === 1 && I.d === 1 ? '' : fq(Fr(Math.abs(I.n), I.d))) + 'i';
  if (I.n === 0) return rs;
  if (R.n === 0) return (I.n < 0 ? '-' : '') + is;
  return rs + (I.n < 0 ? ' - ' : ' + ') + is;
};
const cases = rows => '<div class="cases"><span class="bigbrace">{</span><span class="rows">' + rows.map(r => '<div>' + AQ.H(r) + '</div>').join('') + '</span></div>';
const num = n => n.toLocaleString('en-US');

/* ============ CHAPTER 1 ============ */

G['linear-eq'] = function () {
  for (;;) {
    const a = rnd(2, 7), d = rnd(1, 6), b = nz(-6, 6), f = nz(-6, 6), c = nz(-9, 9), e = nz(-14, 14);
    const k = e - d * f - a * b - c, s = a + d;                       // (a+d)x = k
    if (a === 2 && b === 1 && c === 5 && d === 6) continue;
    const x0 = Fr(k, s);
    if (x0.d > 6 || Math.abs(x0.n) > 40) continue;
    return {
      prompt: `Solve for x: ~${a}(${xp('x', b)}) ${sgn(c)} = ${e} - ${d}(${xp('x', f)})~`,
      fields: one('x =', AQ.numCheck(fval(x0), { roundedDecimal: true }), '~x = ' + fq(x0) + '~', 'fraction or decimal (round to 3+ places)'),
      hints: [`Expand each parenthesis. On the right, multiply both terms inside by −${d}. What sign does the constant have?`,
        'Combine like terms on each side separately before you move anything across the equals sign.',
        `Add ${d}x to both sides. Once you have the x terms together, which coefficient will you divide by?`],
      solution: [`Distribute: ~${poly([a, a * b + c])} = ${e - d * f} - ${d}x~`,
        `Add ~${d}x~ to both sides and subtract ~${a * b + c}~: ~${s}x = ${k}~`,
        `Divide by ${s}: ~x = ${fq(x0)}~`]
    };
  }
};

const FORMULAS = [
  { f: 'T = a + bc + bd', v: 'b', vars: ['T', 'a', 'c', 'd'], fn: e => (e.T - e.a) / (e.c + e.d), ans: 'b = {T - a|c + d}', hints: ['Which terms contain b? Get those on one side, everything else on the other.', 'Factor b out of the terms that contain it.', 'Divide both sides by what is multiplying b.'], sol: ['Subtract ~a~: ~T - a = bc + bd~', 'Factor: ~T - a = b(c + d)~', 'Divide by ~(c + d)~'] },
  { f: 'A = P + Prt', v: 'P', vars: ['A', 'r', 't'], fn: e => e.A / (1 + e.r * e.t), ans: 'P = {A|1 + rt}', hints: ['P shows up in two terms. Can you pull it out as a common factor?', 'After factoring, P is multiplied by a group. Undo that multiplication.'], sol: ['Factor P: ~A = P(1 + rt)~', 'Divide by ~(1 + rt)~'] },
  { f: 'K = {1|2}mv^2', v: 'm', vars: ['K', 'v'], fn: e => 2 * e.K / (e.v * e.v), ans: 'm = {2K|v^2}', hints: ['Clear the fraction first by multiplying both sides by 2.', 'Then divide away everything that is multiplying m.'], sol: ['Multiply by 2: ~2K = mv^2~', 'Divide by ~v^2~'] },
  { f: 'F = {G m M|d^2}', v: 'M', vars: ['F', 'G', 'm', 'd'], fn: e => e.F * e.d * e.d / (e.G * e.m), ans: 'M = {F d^2|G m}', hints: ['Get M out of the fraction by multiplying both sides by the denominator.', 'Then divide by whatever is still multiplying M.'], sol: ['Multiply by ~d^2~: ~F d^2 = G m M~', 'Divide by ~Gm~'] },
  { f: 'I = {E|R + r}', v: 'R', vars: ['I', 'E', 'r'], fn: e => e.E / e.I - e.r, ans: 'R = {E|I} - r', hints: ['R is in the denominator. Multiply both sides by (R + r) to bring it out.', 'Now divide by I, then deal with the + r.'], sol: ['Multiply by ~(R + r)~: ~I(R + r) = E~', 'Divide by ~I~: ~R + r = {E|I}~', 'Subtract ~r~'] },
  { f: 'A = {h|2}(b + c)', v: 'b', vars: ['A', 'h', 'c'], fn: e => 2 * e.A / e.h - e.c, ans: 'b = {2A|h} - c', hints: ['Undo the fraction by multiplying both sides by 2.', 'Then divide by h, and finally move c over.'], sol: ['Multiply by 2: ~2A = h(b + c)~', 'Divide by ~h~: ~{2A|h} = b + c~', 'Subtract ~c~'] }
];
G['solve-formula'] = function () {
  const t = pick(FORMULAS);
  return {
    prompt: `Solve the formula ~${t.f}~ for ~${t.v}~.`,
    fields: one(t.v + ' =', AQ.exprCheck(t.fn, { vars: t.vars, domain: 'pos', wrong: 'Not quite. Check which side each term belongs on and what you divided by.' }), '~' + t.ans + '~', 'an expression, like (T - a)/(c + d)'),
    hints: t.hints, solution: t.sol
  };
};

G['interest-mix'] = function () {
  const pairs = [[12, 5], [9, 4], [10, 6], [7, 3], [11, 5], [14, 6], [8, 3], [13, 7]];
  const [r1, r2] = pick(pairs);
  const N = rnd(20, 90) * 1000, x = rnd(5, Math.floor(N / 500) - 3) * 500;
  const I = (r1 * x + r2 * (N - x)) / 100;
  if (N === 54000 && r1 === 15) return G['interest-mix']();
  return {
    prompt: `An investor put ~$${num(N)}~ into two accounts. One paid ~${r1}%~ simple interest per year and the other paid ~${r2}%~. After one year the interest totalled ~$${num(I)}~. How much was in the ~${r1}%~ account?`,
    fields: one('Amount at ' + r1 + '% ($)', AQ.numCheck(x, { tol: 0.5, bad: [{ val: N - x, msg: 'That’s the amount at the other rate. Reread which account the question asks about.' }] }), '~$' + num(x) + '~', 'dollars, like 12000'),
    hints: ['Let x be the amount at ' + r1 + '%. Then the other account holds the total minus x.', 'Fill in a table: Principal, Rate, Time, Interest. Interest = Principal × Rate × Time.', 'The two interests add up to the total interest. Write that as one equation in x.'],
    solution: [`Let ~x~ = amount at ${r1}%, so ~${N} - x~ is at ${r2}%`, `Interest: ~${r1 / 100}x + ${r2 / 100}(${N} - x) = ${I}~`, 'Distribute, combine, and solve for ~x~']
  };
};

G['rect-area'] = function () {
  const unit = pick(['meters', 'feet', 'centimeters', 'kilometers']);
  if (Math.random() < 0.5) {
    const m = pick([3, 4]), L = rnd(3, 9), k = rnd(2, m * L - 2), W = m * L - k, A = L * W;
    if (A === 216 || (L === 12 && W === 18) || (L === 18 && W === 12)) return G['rect-area']();   // the practice test's own rectangle
    return {
      prompt: `The width of a rectangle is ${k} ${unit} less than ${m === 3 ? 'three times' : 'four times'} its length. Its area is ${A} square ${unit}. Find the dimensions.`,
      fields: [{ key: 'L', label: 'length', check: AQ.numCheck(L), answer: '~' + L + '~', ph: 'number' }, { key: 'W', label: 'width', check: AQ.numCheck(W), answer: '~' + W + '~', ph: 'number' }],
      hints: ['Let L be the length. Write the width using L, then write Area = length × width.', 'Move everything to one side to get a quadratic equal to 0, then factor or use the quadratic formula.', 'You’ll get two solutions for L. Can a length be negative?'],
      solution: [`Let ~L~ = length, width = ~${m}L - ${k}~`, `~L(${m}L - ${k}) = ${A}~, so ~${m}L^2 - ${k}L - ${A} = 0~`, `Solve and keep the positive length ~L = ${L}~, then width = ~${W}~`]
    };
  }
  const W = rnd(3, 14), k = rnd(2, 9), L = W + k, A = W * L;
  if (A === 216 || (L === 18 && W === 12)) return G['rect-area']();   // the practice test's own rectangle
  return {
    prompt: `The length of a rectangle is ${k} ${unit} more than its width. The area is ${A} square ${unit}. Find the length and the width.`,
    fields: [{ key: 'L', label: 'length', check: AQ.numCheck(L), answer: '~' + L + '~', ph: 'number' }, { key: 'W', label: 'width', check: AQ.numCheck(W), answer: '~' + W + '~', ph: 'number' }],
    hints: ['Let W be the width. How can you write the length using W?', 'Area = length × width gives you a quadratic. Set it equal to zero first.', 'Reject any negative solution. A dimension can’t be negative.'],
    solution: [`Let ~W~ = width, length = ~W + ${k}~`, `~W(W + ${k}) = ${A}~, so ~W^2 + ${k}W - ${A} = 0~`, `Factor, keep the positive root: ~W = ${W}~, length ~${L}~`]
  };
};

function cxPrompt() { return null; }
G['cx-addsub'] = function () {
  const t = [[nz(-9, 9), nz(-9, 9)], [nz(-9, 9), nz(-9, 9)], [nz(-9, 9), nz(-9, 9)]], s2 = pick([1, -1]), s3 = pick([1, -1]);
  const re = t[0][0] + s2 * t[1][0] + s3 * t[2][0], im = t[0][1] + s2 * t[1][1] + s3 * t[2][1];
  const wrap = z => '(' + cstr(z[0], z[1]) + ')';
  return {
    prompt: `Perform the operations and write the result as ~a + bi~:<br>~${wrap(t[0])} ${s2 > 0 ? '+' : '-'} ${wrap(t[1])} ${s3 > 0 ? '+' : '-'} ${wrap(t[2])}~`,
    fields: one('Result', AQ.complexCheck(re, im), '~' + cstr(re, im) + '~', 'like 3 - 4i'),
    hints: ['A minus sign in front of a parenthesis flips the sign of BOTH the real and the imaginary part.', 'Add the real parts together and the imaginary parts together separately.'],
    solution: ['Remove parentheses, distributing every minus sign', `Real parts: ~${re}~`, `Imaginary parts: ~${im}i~`]
  };
};
G['cx-mul'] = function () {
  const v = rnd(0, 3);
  if (v === 0) { const a = nz(-6, 6), b = nz(-6, 6), c = nz(-6, 6), d = nz(-6, 6); const re = a * c - b * d, im = a * d + b * c;
    return { prompt: `Multiply and simplify: ~(${cstr(a, b)})(${cstr(c, d)})~`, fields: one('Result', AQ.complexCheck(re, im), '~' + cstr(re, im) + '~', 'like 3 - 4i'),
      hints: ['FOIL it: first, outer, inner, last.', 'Remember i² = -1. Replace it before you combine like terms.'], solution: [`FOIL: ~${a * c} + ${a * d}i + ${b * c}i + ${b * d}i^2~`, 'Replace ~i^2~ with ~-1~', `Combine: ~${cstr(re, im)}~`] }; }
  if (v === 1) { const a = nz(-7, 7), b = nz(-7, 7); const re = a * a - b * b, im = 2 * a * b;
    return { prompt: `Square and simplify: ~(${cstr(a, b)})^2~`, fields: one('Result', AQ.complexCheck(re, im), '~' + cstr(re, im) + '~', 'like 3 - 4i'),
      hints: ['(a + bi)² means (a + bi)(a + bi). Don’t just square each piece.', 'The middle term appears twice. And i² = -1.'], solution: [`~(${cstr(a, b)})(${cstr(a, b)})~`, `~${a * a} + ${2 * a * b}i + ${b * b}i^2~`, `~${cstr(re, im)}~`] }; }
  if (v === 2) { const a = rnd(2, 9), b = rnd(2, 9); const re = a * a + b * b;
    return { prompt: `Multiply a number by its conjugate: ~(${cstr(a, b)})(${cstr(a, -b)})~`, fields: one('Result', AQ.complexCheck(re, 0), '~' + re + '~', 'a number'),
      hints: ['Conjugates make the middle terms cancel.', 'What does -(bi)(bi) become once i² = -1?'], solution: [`~${a * a} - ${b * b}i^2~`, `~${a * a} + ${b * b} = ${re}~`] }; }
  const n = rnd(13, 99), r = n % 4, vals = [[1, 0], [0, 1], [-1, 0], [0, -1]][r];
  return { prompt: `Simplify: ~i^${n}~`, fields: one('Result', AQ.complexCheck(vals[0], vals[1]), '~' + cstr(vals[0], vals[1]) + '~', 'like -i'),
    hints: ['Powers of i repeat in a cycle of 4: i, -1, -i, 1.', 'Divide the exponent by 4 and look only at the remainder.'], solution: [`~${n} ÷ 4~ leaves remainder ${r}`, `~i^${r === 0 ? 4 : r} = ${cstr(vals[0], vals[1])}~`] };
};
G['cx-div'] = function () {
  for (;;) {
    const a = nz(-8, 8), b = nz(-8, 8), c = nz(1, 6), d = nz(-6, 6);
    if (a === 9 && b === 2 && c === 2 && d === -7) continue;
    const den = c * c + d * d, re = Fr(a * c + b * d, den), im = Fr(b * c - a * d, den);
    return {
      prompt: `Divide and write in ~a + bi~ form: ~{${cstr(a, b)}|${cstr(c, d)}}~`,
      fields: one('Result', AQ.complexCheck(fval(re), fval(im)), '~' + cfq(re, im) + '~', 'like 3/5 - 2/5i'),
      hints: ['You can’t leave i in a denominator. Multiply top and bottom by the conjugate of the bottom.', 'The conjugate of c + di is c - di. The new denominator becomes c² + d², a plain number.', 'Multiply out the top with FOIL, replace i² with -1, then split into a real fraction and an imaginary fraction.'],
      solution: [`Conjugate of the bottom: ~${cstr(c, -d)}~`, `Bottom: ~${c * c} + ${d * d} = ${den}~`, `Top (FOIL, then ~i^2 = -1~): ~${cstr(a * c + b * d, b * c - a * d)}~`, `Split: ~${cfq(re, im)}~`]
    };
  }
};

G['quad-complex'] = function () {
  for (;;) {
    const b = pick([-10, -8, -6, -4, -2, 2, 4, 6, 8, 10]), m = rnd(1, 8), h = -b / 2, c = h * h + m * m;
    if (b === 4 && m === 7) continue;
    return {
      prompt: `Solve over the complex numbers: ~${poly([1, b, c])} = 0~`,
      fields: one('x =', AQ.complexSetCheck([[h, m], [h, -m]]), '~x = ' + cstr(h, m) + '~ and ~x = ' + cstr(h, -m) + '~', 'two roots, separated by ;  e.g. 1 + 2i ; 1 - 2i'),
      hints: ['This doesn’t factor over the integers. Try completing the square or the quadratic formula.', 'Compute the discriminant b² - 4ac first. If it’s negative, you’ll get imaginary roots.', 'The ± gives you a conjugate pair: same real part, opposite imaginary parts.'],
      solution: [`Discriminant: ~${b}^2 - 4(${c}) = ${b * b - 4 * c}~ (negative)`, `~x = {${-b} ± sqrt(${b * b - 4 * c})|2}~`, `~sqrt(${b * b - 4 * c}) = ${2 * m}i~, so ~x = ${cstr(h, m)}~ or ~${cstr(h, -m)}~`]
    };
  }
};
G['quad-real'] = function () {
  const v = rnd(0, 2);
  if (v === 0) {
    const r1 = nz(-9, 9), r2 = nz(-9, 9); if (r1 === r2 || [r1, r2].sort().join() === '-3,5') return G['quad-real']();
    const s = r1 + r2, p = r1 * r2;
    return { prompt: `Solve by factoring: ~x^2 = ${s}x ${p <= 0 ? '+' : '-'} ${Math.abs(p)}~`, fields: one('x =', AQ.setCheck([r1, r2]), '~x = ' + r1 + '~ or ~x = ' + r2 + '~', 'two answers, separated by commas'),
      hints: ['Get zero on one side first.', 'Look for two numbers that multiply to the constant and add to the middle coefficient.', 'Set each factor equal to zero.'],
      solution: [`Move everything left: ~${poly([1, -s, p])} = 0~`, `Factor: ~${AQ.factorStr(r1)}${AQ.factorStr(r2)} = 0~`, `~x = ${r1}~ or ~x = ${r2}~`] };
  }
  if (v === 1) {
    for (;;) {
      const b = nz(-9, 9), c = nz(-9, 9), D = b * b - 4 * c; if (D <= 0 || Math.round(Math.sqrt(D)) ** 2 === D) continue;
      const r = [(-b + Math.sqrt(D)) / 2, (-b - Math.sqrt(D)) / 2];
      return { prompt: `Use the quadratic formula: ~${poly([1, b, c])} = 0~. Give exact values or decimals rounded to 2 places.`, fields: one('x =', AQ.setCheck(r, { tol: 0.011 }), '~x = {' + (-b) + ' ± sqrt(' + D + ')|2}~ ≈ ' + r[0].toFixed(2) + ', ' + r[1].toFixed(2), 'e.g. 1.25, -3.5 or (-3+sqrt(5))/2, (-3-sqrt(5))/2'),
        hints: ['Identify a, b and c, including their signs.', 'Compute b² - 4ac inside the root first.', 'The ± gives two answers. Don’t forget the second.'],
        solution: [`~a = 1, b = ${b}, c = ${c}~`, `~b^2 - 4ac = ${D}~`, `~x = {${-b} ± sqrt(${D})|2}~`] };
    }
  }
  const a = rnd(1, 3), b = nz(-6, 6), c = nz(-6, 6), D = b * b - 4 * a * c, cnt = D > 0 ? '2' : D === 0 ? '1' : '0';
  if (D === 0 || Math.abs(b) > 8) return G['quad-real']();
  return { prompt: `How many real solutions does ~${poly([a, b, c])} = 0~ have? Use the discriminant, no solving needed.`,
    fields: [{ key: 'a', label: 'Real solutions', kind: 'choice', options: [{ k: '0', l: '0' }, { k: '1', l: '1' }, { k: '2', l: '2' }], check: AQ.choiceCheck(cnt, 'Compute b² - 4ac again. Positive → 2, zero → 1, negative → 0.'), answer: cnt }],
    hints: ['Find a, b and c with signs.', 'The sign of b² - 4ac tells you everything.'], solution: [`~b^2 - 4ac = ${b * b} - 4(${a})(${c}) = ${D}~`, D > 0 ? 'Positive → two real solutions' : 'Negative → no real solutions'] };
};

G['rational-eq'] = function () {
  if (Math.random() < 0.25) {
    const p = nz(-6, 6), k = pick([2, 3, 4, 5, -2, -3]);
    return {
      prompt: `Solve: ~{x|x ${p < 0 ? '+' : '-'} ${Math.abs(p)}} = {${p}|x ${p < 0 ? '+' : '-'} ${Math.abs(p)}} + ${k}~. Watch out for values that make a denominator zero. If nothing works, answer “none”.`,
      fields: one('x =', AQ.setCheck([], {}), 'none (no solution)', 'a number, or none'),
      hints: ['Multiply every term by the common denominator to clear the fractions.', 'Solve the resulting equation, then check your answer in the ORIGINAL equation.', 'If your answer makes a denominator zero, it is extraneous and must be thrown out.'],
      solution: ['Multiply through by the denominator and solve', `You get ~x = ${p}~, but that makes the denominator 0`, 'So it is extraneous: there is no solution']
    };
  }
  for (;;) {
    const r1 = nz(-9, 9), r2 = nz(-9, 9); if (r1 === r2) continue;
    const s = r1 + r2, p = r1 * r2; if ((s === 3 && p === -40) || (s === 2 && p === -15) || s === 0) continue;
    return {
      prompt: `Solve: ~1 ${s > 0 ? '-' : '+'} {${Math.abs(s)}|x} ${p >= 0 ? '+' : '-'} {${Math.abs(p)}|x^2} = 0~`,
      fields: one('x =', AQ.setCheck([r1, r2]), '~x = ' + r1 + '~ and ~x = ' + r2 + '~', 'two answers, separated by commas'),
      hints: ['What number can’t x be? Note it before you start.', 'Multiply every term by x² to clear all the denominators.', 'You’ll get a quadratic. Factor it, then check both answers.'],
      solution: ['Multiply every term by ~x^2~', `~${poly([1, -s, p])} = 0~`, `Factor: ~${AQ.factorStr(r1)}${AQ.factorStr(r2)} = 0~, so ~x = ${r1}~ or ~${r2}~`]
    };
  }
};

G['radical-eq'] = function () {
  for (;;) {
    const r = rnd(1, 6), s1 = rnd(0, 8), s2 = -rnd(r + 1, r + 8), p = s1 + s2 + 2 * r, q = r * r - s1 * s2;
    if (p < 1 || (p === 3 && q === 31)) continue;
    return {
      prompt: `Solve: ~sqrt(${lin(p, q)}) = x + ${r}~. Check for extraneous solutions.`,
      fields: one('x =', AQ.setCheck([s1], { bad: [{ val: s2, msg: 'Plug that value into the original equation. The right side comes out negative, but a square root can’t equal a negative number. It’s extraneous.' }] }), '~x = ' + s1 + '~ (and ~' + s2 + '~ is extraneous)', 'the valid answer(s)'),
      hints: ['The square root is already alone, so square both sides. Remember (x + c)² = x² + 2cx + c².', 'Solve the quadratic you get.', 'Radical equations can create fake solutions. Plug each answer into the ORIGINAL equation.'],
      solution: [`Square both sides: ~${lin(p, q)} = (x + ${r})^2~`, `~x^2 + ${2 * r - p}x + ${r * r - q} = 0~ → ~x = ${s1}~ or ~x = ${s2}~`, `Check: ~x = ${s2}~ gives a negative right side, so it’s extraneous. Answer ~x = ${s1}~`]
    };
  }
};

G['sub-eq'] = function () {
  const v = rnd(0, 2);
  if (v === 2) {
    const s1 = rnd(1, 5), s2 = rnd(1, 5); if (s1 === s2) return G['sub-eq']();
    const b = s1 * s1 + s2 * s2, c = s1 * s1 * s2 * s2;
    return { prompt: `Solve: ~x^4 - ${b}x^2 + ${c} = 0~. Find all real solutions.`, fields: one('x =', AQ.setCheck([s1, -s1, s2, -s2]), '~x = ±' + s1 + '~, ~±' + s2 + '~', 'all four, separated by commas'),
      hints: ['Notice x⁴ = (x²)². Let u = x².', 'Solve the quadratic in u, then go back: x² = each u value.', 'Each positive u gives two x values (±√u).'],
      solution: [`Let ~u = x^2~: ~u^2 - ${b}u + ${c} = 0~`, `~u = ${s1 * s1}~ or ~u = ${s2 * s2}~`, `~x = ±${s1}~ or ~x = ±${s2}~`] };
  }
  const den = pick([3, 5]);
  if (v === 0) {
    const lim = den === 3 ? 4 : 3; let u1 = nz(-lim, lim), u2 = nz(-lim, lim); if (u1 === u2) return G['sub-eq']();
    const b = -(u1 + u2), c = u1 * u2, x1 = Math.pow(u1, den), x2 = Math.pow(u2, den);
    if (b === 0) return G['sub-eq']();
    return { prompt: `Solve: ~x^(${2}/${den}) ${b >= 0 ? '+' : '-'} ${Math.abs(b) === 1 ? '' : Math.abs(b)}x^(1/${den}) ${c >= 0 ? '+' : '-'} ${Math.abs(c)} = 0~`, fields: one('x =', AQ.setCheck([x1, x2]), '~x = ' + x1 + '~ and ~x = ' + x2 + '~', 'two answers, separated by commas'),
      hints: [`Let u = x^(1/${den}). Then x^(2/${den}) is u².`, 'Solve the quadratic in u first.', `To get back to x, raise each u to the power ${den}.`],
      solution: [`Let ~u = x^(1/${den})~: ~u^2 ${sgn(b)}u ${sgn(c)} = 0~`, `~u = ${u1}~ or ~u = ${u2}~`, `~x = u^${den}~: ~x = ${x1}~ or ~x = ${x2}~`] };
  }
  const a = pick([2, 3]), p = pick([1, 2, 4, 5]), q = rnd(1, 5);
  if (AQ.gcd(a, p) !== 1 || (a === 3 && p === 1 && q === 5 && den === 5)) return G['sub-eq']();
  const B = a * q - p, Cc = -p * q;
  if (B === 0) return G['sub-eq']();
  const x1 = Math.pow(p / a, den), x2 = Math.pow(-q, den);
  return { prompt: `Solve: ~${a}x^(2/${den}) ${B >= 0 ? '+' : '-'} ${Math.abs(B)}x^(1/${den}) - ${-Cc} = 0~. Exact values or decimals to 4 places.`, fields: one('x =', AQ.setCheck([x1, x2], { tol: 5e-5 }), '~x = ' + fq(Fr(Math.pow(p, den), Math.pow(a, den))) + '~ and ~x = ' + x2 + '~', 'two answers, separated by commas'),
    hints: [`Let u = x^(1/${den}) and rewrite as a regular quadratic in u.`, 'Factor it (the leading coefficient isn’t 1, so try the AC method or the quadratic formula).', `Go back: x = u^${den} for each u.`],
    solution: [`Let ~u = x^(1/${den})~: ~${a}u^2 ${sgn(B)}u - ${-Cc} = 0~`, `Factor: ~(${a}u - ${p})(u + ${q}) = 0~ → ~u = ${p}/${a}~ or ~${-q}~`, `Raise to the ${den}: ~x = (${p}/${a})^${den}~ or ~(${-q})^${den}~`] };
};

function fmtBound(fr) { return fa(fr); }
function ivAnswerStr(list) {
  const f = v => v === -Infinity ? '-inf' : v === Infinity ? 'inf' : (v.__f ? fa(v.__f) : String(v));
  return list.map(i => (i.loC ? '[' : '(') + f(i.loF || i.lo) + ', ' + f(i.hiF || i.hi) + (i.hiC ? ']' : ')')).join(' U ');
}
const asFrStr = v => (v === -Infinity ? '-inf' : v === Infinity ? 'inf' : v);
G['compound-ineq'] = function () {
  for (;;) {
    const p = pick([2, 3, 4, 5, -2, -3, -4, -5]), q = nz(-9, 9), L = nz(-9, 6), R = L + rnd(3, 14);
    const s1 = pick(['<', '<=']), s2 = pick(['<', '<=']);
    if (p === 5 && q === 4 && L === -1) continue;
    const a = Fr(L - q, p), b = Fr(R - q, p);
    let lo, hi, loC, hiC, loF, hiF;
    if (p > 0) { lo = fval(a); hi = fval(b); loC = s1 === '<='; hiC = s2 === '<='; loF = a; hiF = b; }
    else { lo = fval(b); hi = fval(a); loC = s2 === '<='; hiC = s1 === '<='; loF = b; hiF = a; }
    const ans = (loC ? '[' : '(') + fa(loF) + ', ' + fa(hiF) + (hiC ? ']' : ')');
    return {
      prompt: `Solve and give the answer in interval notation: ~${L} ${s1} ${lin(p, q)} ${s2} ${R}~`,
      fields: one('Interval', AQ.ivCheck([{ lo, hi, loC, hiC }]), '~' + ans + '~', 'like (-2, 5/3]'),
      hints: ['It’s a three-part inequality. Whatever you do to the middle, do to the left and right too.', 'First get rid of the constant term, then divide.', p < 0 ? 'Dividing by a NEGATIVE number reverses both inequality symbols. Re-order so the smaller number is on the left.' : 'Then write it in interval notation: ( ) for strict, [ ] for ≤ or ≥.']
        , solution: [`Subtract ${q} from all three parts: ~${L - q} ${s1} ${p}x ${s2} ${R - q}~`, `Divide by ${p}${p < 0 ? ' (flip the symbols!)' : ''}`, `Interval: ~${ans}~`]
    };
  }
};

function signSolve(f, crit, strictness, want, closedAt) {          // returns list of intervals where sign matches
  const pts = crit.slice().sort((a, b) => a - b), out = [];
  const edges = [-Infinity, ...pts, Infinity];
  for (let i = 0; i < edges.length - 1; i++) {
    const lo = edges[i], hi = edges[i + 1], t = lo === -Infinity ? hi - 1 : hi === Infinity ? lo + 1 : (lo + hi) / 2;
    const v = f(t); if ((want > 0 && v > 0) || (want < 0 && v < 0)) out.push({ lo, hi, loC: lo !== -Infinity && closedAt(lo), hiC: hi !== Infinity && closedAt(hi) });
  }
  return out;
}
G['rational-ineq'] = function () {
  for (;;) {
    const a = nz(-9, 9), d = nz(-9, 9); if (a === d || (a === 5 && d === -11)) continue;
    const op = pick(['>', '<', '>=', '<=']), want = op[0] === '>' ? 1 : -1, strict = op.length === 1;
    const f = x => (x - a) / (x - d);
    const iv = signSolve(f, [a, d], strict, want, c => !strict && c === a);
    return {
      prompt: `Solve and give the answer in interval notation: ~{${xp('x', -a)}|${xp('x', -d)}} ${op} 0~`,
      fields: one('Interval', AQ.ivCheck(iv), '~' + ivAnswerStr(iv) + '~', 'like (-inf, 2) U [5, inf)'),
      hints: ['Find the critical numbers: where is the top zero and where is the bottom zero?', 'Draw a number line, mark both numbers, and pick a test value in each region to find the sign of the fraction.', 'Zeros of the bottom are never included (use a round bracket). A zero of the top is included only for ≤ or ≥.'],
      solution: [`Critical numbers: ~x = ${a}~ (top) and ~x = ${d}~ (bottom)`, 'Test a value in each of the three regions and keep the ones with the right sign', `Answer: ~${ivAnswerStr(iv)}~`]
    };
  }
};
G['quad-ineq'] = function () {
  for (;;) {
    const r1 = nz(-8, 4), r2 = r1 + rnd(2, 9); if (r1 === -3 && r2 === 5) continue;
    const op = pick(['<', '>', '<=', '>=']), want = op[0] === '>' ? 1 : -1, strict = op.length === 1;
    const f = x => (x - r1) * (x - r2), iv = signSolve(f, [r1, r2], strict, want, () => !strict);
    const s = r1 + r2, pr = r1 * r2, side = Math.random() < 0.5;
    const left = side ? poly([1, -s, pr]) : 'x^2', right = side ? '0' : poly([s, -pr], 'x').replace(/^-?\d*x?/, m => m);
    const rhs = side ? '0' : (s === 0 ? String(-pr) : lin(s, -pr));
    return {
      prompt: `Solve and give the answer in interval notation: ~${left} ${op} ${rhs}~`,
      fields: one('Interval', AQ.ivCheck(iv), '~' + ivAnswerStr(iv) + '~', 'like [-2, 5] or (-inf, 1) U (4, inf)'),
      hints: side ? ['Factor the quadratic and find where it equals zero. Those are your boundary points.', 'Test a value in each region of the number line.', 'For < or > use round brackets; for ≤ or ≥ use square brackets at the boundary points.'] : ['First move everything to one side so the other side is 0.', 'Factor, find the boundary points, and test a value in each region.', 'For < or > use round brackets; for ≤ or ≥ use square brackets.'],
      solution: [side ? 'Factor to find the boundary points' : 'Move all terms to one side, then factor', `Boundary points: ~x = ${r1}~ and ~x = ${r2}~`, `Answer: ~${ivAnswerStr(iv)}~`]
    };
    void right;
  }
};

G['abs-eq'] = function () {
  for (;;) {
    const p = nz(-5, 5), q = nz(-9, 9), noSol = Math.random() < 0.13, c = noSol ? -rnd(1, 9) : rnd(1, 12);
    if (p === 3 && q === -2 && c === 7) continue;
    const sols = noSol ? [] : [Fr(-q + c, p), Fr(-q - c, p)];
    if (!noSol && sols.some(s => s.d > 5)) continue;
    const vals = sols.map(fval), shift = Math.random() < 0.4 ? rnd(1, 6) : 0, sign = pick([1, -1]);
    const lhsAbs = `|${lin(p, q)}|`;
    const prompt = shift ? `Solve: ~${lhsAbs} ${sign > 0 ? '+' : '-'} ${shift} = ${c + sign * shift}~` : `Solve: ~${lhsAbs} = ${c}~`;
    return {
      prompt, fields: one('x =', AQ.setCheck(vals), noSol ? 'no solution' : '~x = ' + sols.map(fq).join('~ or ~x = ') + '~', 'two answers separated by commas, or none'),
      hints: [shift ? 'Isolate the absolute value first, before you split into cases.' : 'The expression inside the bars can equal the positive number OR the negative of it.', 'Can an absolute value ever equal a negative number?', 'Solve two separate linear equations.'],
      solution: [shift ? `Isolate: ~${lhsAbs} = ${c}~` : 'Set up two cases', noSol ? 'An absolute value is never negative, so there is no solution' : `~${lin(p, q)} = ${c}~ or ~${lin(p, q)} = ${-c}~`, noSol ? 'No solution' : '~x = ' + sols.map(fq).join('~ or ~x = ') + '~']
    };
  }
};
G['abs-ineq'] = function () {
  for (;;) {
    const p = rnd(2, 5), q = nz(-8, 8), c = rnd(2, 12), op = pick(['<', '<=', '>', '>=']), strict = op.length === 1;
    if (p === 3 && q === -2 && c === 7) continue;   // the practice test's own absolute value expression
    const a = Fr(-c - q, p), b = Fr(c - q, p); if (a.d > 5 || b.d > 5) continue;
    const iv = op[0] === '<' ? [{ lo: fval(a), hi: fval(b), loC: !strict, hiC: !strict }] : [{ lo: -Infinity, hi: fval(a), loC: false, hiC: !strict }, { lo: fval(b), hi: Infinity, loC: !strict, hiC: false }];
    const show = op[0] === '<' ? (strict ? '(' : '[') + fa(a) + ', ' + fa(b) + (strict ? ')' : ']') : '(-inf, ' + fa(a) + (strict ? ')' : ']') + ' U ' + (strict ? '(' : '[') + fa(b) + ', inf)';
    return {
      prompt: `Solve and give the answer in interval notation: ~|${lin(p, q)}| ${op} ${c}~`,
      fields: one('Interval', AQ.ivCheck(iv), '~' + show + '~', 'like [-2, 3) or (-inf, 1] U [4, inf)'),
      hints: ['“Less than” stays in one piece: -c < inside < c. “Greater than” splits into two pieces: inside < -c OR inside > c.', 'Solve for x in each part (or across all three parts).', 'Use [ ] if the symbol has “or equal to”.'],
      solution: [op[0] === '<' ? `Rewrite: ~${-c} ${op} ${lin(p, q)} ${op} ${c}~` : `Two cases: ~${lin(p, q)} ${op === '>' ? '<' : '<='} ${-c}~ or ~${lin(p, q)} ${op} ${c}~`, 'Solve for x', `Answer: ~${show}~`]
    };
  }
};

/* ============ CHAPTER 2 ============ */
const pt = (x, y) => '(' + x + ', ' + y + ')';
// the practice test's two point pairs (either order) never appear in the distance or midpoint generators
const testPts = (a, b, c, d) => [[-5, -4, 3, -6], [-7, 4, -2, 2]].some(([p, q, r, s]) => (a === p && b === q && c === r && d === s) || (a === r && b === s && c === p && d === q));
G['distance'] = function () {
  for (;;) {
    const x1 = rnd(-9, 9), y1 = rnd(-9, 9), x2 = rnd(-9, 9), y2 = rnd(-9, 9);
    const dx = x2 - x1, dy = y2 - y1; if (dx === 0 && dy === 0) continue; if (testPts(x1, y1, x2, y2)) continue;
    const n = dx * dx + dy * dy, d = Math.sqrt(n);
    return {
      prompt: `Find the distance between ~P${pt(x1, y1)}~ and ~Q${pt(x2, y2)}~. Exact (like 2sqrt(17)) or decimal to 2 places both work.`,
      fields: one('d =', AQ.numCheck(d, { tol: 0.011 }), '~d = ' + AQ.radStr(n).replace('sqrt', 'sqrt') + '~ ≈ ' + d.toFixed(2), 'like 2sqrt(5) or 4.47'),
      hints: ['Use d = √[(x₂ - x₁)² + (y₂ - y₁)²]. Subtract the x’s and the y’s separately.', 'Put parentheses around negative numbers when you square them.', 'Add the two squares, then take the square root. Simplify if you can.'],
      solution: [`~Δx = ${x2} - ${paren(x1)} = ${dx}~, ~Δy = ${y2} - ${paren(y1)} = ${dy}~`, `~d = sqrt(${dx * dx} + ${dy * dy}) = sqrt(${n})~`, `~d = ${AQ.radStr(n)}~`]
    };
  }
};
G['midpoint'] = function () {
  for (;;) {
    const x1 = rnd(-9, 9), y1 = rnd(-9, 9), x2 = rnd(-9, 9), y2 = rnd(-9, 9);
    if (testPts(x1, y1, x2, y2)) continue;
    const mx = Fr(x1 + x2, 2), my = Fr(y1 + y2, 2);
    return {
      prompt: `Find the midpoint of ~P${pt(x1, y1)}~ and ~Q${pt(x2, y2)}~.`,
      fields: one('Midpoint', AQ.ptCheck(fval(mx), fval(my), { tol: 1e-9 }), '~(' + fq(mx) + ', ' + fq(my) + ')~', 'like (3, -1/2)'),
      hints: ['The midpoint is the average of the x’s and the average of the y’s.', 'Add, then divide by 2. Mind your negatives.', 'Leave fractions as fractions or write decimals. Both are fine.'],
      solution: [`~x = {${x1} + ${paren(x2)}|2}~`, `~y = {${y1} + ${paren(y2)}|2}~`, `~(${fq(mx)}, ${fq(my)})~`]
    };
  }
};

function lineText(m, b) {
  const ms = m.n === 0 ? '' : (m.d === 1 && Math.abs(m.n) === 1 ? (m.n < 0 ? '-' : '') : fq(m)) + 'x';
  if (m.n === 0) return fq(b);
  if (b.n === 0) return ms;
  return ms + (b.n < 0 ? ' - ' : ' + ') + fq(Fr(Math.abs(b.n), b.d));
}
G['line-two'] = function () {
  for (;;) {
    const x1 = Math.random() < 0.45 ? 0 : rnd(-7, 7), y1 = rnd(-7, 7), x2 = rnd(-7, 7), y2 = rnd(-7, 7);
    if (x1 === x2 || y1 === y2) continue; if ((x1 === 5 && y1 === -3 && x2 === 0 && y2 === 4) || (x2 === 5 && y2 === -3 && x1 === 0 && y1 === 4)) continue;
    const m = Fr(y2 - y1, x2 - x1), b = fsub(Fr(y1), fmul(m, Fr(x1)));
    if (m.d > 6) continue;
    return {
      prompt: `Find the equation of the line through ~${pt(x1, y1)}~ and ~${pt(x2, y2)}~ in slope-intercept form.`,
      fields: one('y =', AQ.exprCheck(x => fval(m) * x + fval(b), { wrong: 'Not quite. Check your slope first, then the y-intercept.' }), '~y = ' + lineText(m, b) + '~', 'like -7/5x + 4'),
      hints: ['First find the slope: m = (y₂ - y₁)/(x₂ - x₁).', 'Plug the slope and ONE of the points into y = mx + b and solve for b.', 'Write the final answer as y = mx + b with your numbers filled in.'],
      solution: [`~m = {${y2} - ${paren(y1)}|${x2} - ${paren(x1)}} = ${fq(m)}~`, `Use ~${pt(x1, y1)}~: ~${y1} = ${fq(m)}(${x1}) + b~ → ~b = ${fq(b)}~`, `~y = ${lineText(m, b)}~`]
    };
  }
};
G['line-slope-point'] = function () {
  const m = pick([Fr(2), Fr(-3), Fr(1, 2), Fr(-2, 3), Fr(3, 4), Fr(-1, 4), Fr(5), Fr(-1), Fr(4, 3), Fr(-5, 2)]), x1 = rnd(-6, 6), y1 = rnd(-6, 6);
  const b = fsub(Fr(y1), fmul(m, Fr(x1)));
  const form = rnd(0, 1);
  return {
    prompt: `Write the equation of the line with slope ~${fq(m)}~ that passes through ~${pt(x1, y1)}~, in slope-intercept form.`,
    fields: one('y =', AQ.exprCheck(x => fval(m) * x + fval(b)), '~y = ' + lineText(m, b) + '~', 'like 2/3x - 1'),
    hints: ['Start with y = mx + b. You know m and a point (x, y).', 'Substitute the point to find b.', 'Rewrite with m and b filled in.'],
    solution: [`~${y1} = ${fq(m)}(${x1}) + b~`, `~b = ${fq(b)}~`, `~y = ${lineText(m, b)}~`].concat(form ? [] : [])
  };
};

G['is-function'] = function () {
  if (Math.random() < 0.5) {
    const xs = shuffle([-6, -4, -3, -1, 0, 2, 3, 5, 7]).slice(0, 4), isF = Math.random() < 0.5;
    const pairs = xs.map(x => [x, rnd(-8, 8)]);
    if (!isF) { const k = rnd(0, 3); let y; do y = rnd(-8, 8); while (y === pairs[k][1]); pairs.push([pairs[k][0], y]); }
    const sh = shuffle(pairs);
    return {
      prompt: `Is this relation a function? ~{${sh.map(p => pt(p[0], p[1])).join(', ')}}~`,
      fields: [{ key: 'a', label: 'Function?', kind: 'choice', options: [{ k: 'y', l: 'Yes' }, { k: 'n', l: 'No' }], check: AQ.choiceCheck(isF ? 'y' : 'n', 'Look at the x-values only. Does any x appear with two different y-values?'), answer: isF ? 'Yes' : 'No' }],
      hints: ['Every input (x) must have exactly ONE output (y).', 'Scan the x-values. Do any repeat?', 'A repeated x is only a problem if its y-values are different.'],
      solution: [isF ? 'No x-value repeats with a different y' : 'One x-value appears twice with different y-values', isF ? 'So it IS a function' : 'So it is NOT a function']
    };
  }
  const bank = [['y = x^2 - 4', 1], ['x = y^2 + 1', 0], ['y = |x + 2|', 1], ['x^2 + y^2 = 16', 0], ['y = sqrt(x - 3)', 1], ['x = -3', 0], ['y = 2', 1], ['x = |y|', 0], ['y = x^3 - x', 1], ['|y| = x', 0], ['y^2 = x + 5', 0], ['y = {1|x - 2}', 1]];
  const [eq, isF] = pick(bank);
  return {
    prompt: `Does the equation ~${eq}~ define y as a function of x?`,
    fields: [{ key: 'a', label: 'Function?', kind: 'choice', options: [{ k: 'y', l: 'Yes' }, { k: 'n', l: 'No' }], check: AQ.choiceCheck(isF ? 'y' : 'n', 'Pick an x-value. Can you get more than one y from it?'), answer: isF ? 'Yes' : 'No' }],
    hints: ['Try to solve for y. Do you get exactly one y for each x?', 'A ± in front of a root, or an even power of y, usually means two outputs.', 'Think of the vertical line test.'],
    solution: [isF ? 'Each x gives exactly one y' : 'Some x-values give two different y-values (or every y for one x)', isF ? 'Yes, it’s a function' : 'No, it’s not a function']
  };
};

const sq = (v, h) => (h === 0 ? v + '^2' : '(' + xp(v, -h) + ')^2');
G['circle-std'] = function () {
  for (;;) {
    const h = rnd(-8, 8), k = rnd(-8, 8), r2 = Math.random() < 0.7 ? rnd(1, 9) ** 2 : pick([2, 5, 7, 10, 13, 20]);
    if (h === 2 && k === 4 && r2 === 9) continue;
    const r = Math.sqrt(r2);
    return {
      prompt: `Find the center and radius of the circle ~${sq('x', h)} + ${sq('y', k)} = ${r2}~`,
      fields: [{ key: 'c', label: 'Center', check: AQ.ptCheck(h, k), answer: '~' + pt(h, k) + '~', ph: 'like (3, -2)' }, { key: 'r', label: 'Radius', check: AQ.numCheck(r, { tol: 0.011, bad: [{ val: r2, msg: 'That’s r². The equation shows r², so take the square root.' }] }), answer: '~' + AQ.radStr(r2) + '~', ph: 'like 3 or sqrt(5)' }],
      hints: ['Standard form is (x - h)² + (y - k)² = r². The center is (h, k).', 'The signs inside the parentheses are the OPPOSITE of the center’s coordinates.', 'The number on the right is r², not r.'],
      solution: [`Compare with ~(x - h)^2 + (y - k)^2 = r^2~`, `Center ~${pt(h, k)}~`, `~r^2 = ${r2}~, so ~r = ${AQ.radStr(r2)}~`]
    };
  }
};
G['circle-general'] = function () {
  for (;;) {
    const h = nz(-8, 8), k = nz(-8, 8), r = rnd(1, 9);
    if (h === 9 && k === -7 && r === 3) continue;
    const D = -2 * h, E = -2 * k, Fc = h * h + k * k - r * r;
    return {
      prompt: `Find the center and radius of the circle ~x^2 + y^2 ${sgn(D)}x ${sgn(E)}y ${sgn(Fc)} = 0~ (complete the square).`,
      fields: [{ key: 'c', label: 'Center', check: AQ.ptCheck(h, k), answer: '~' + pt(h, k) + '~', ph: 'like (3, -2)' }, { key: 'r', label: 'Radius', check: AQ.numCheck(r, { bad: [{ val: r * r, msg: 'That’s r². Take the square root.' }] }), answer: '~' + r + '~', ph: 'number' }],
      hints: ['Group the x terms together and the y terms together, and move the constant to the right.', 'Complete the square: add (half the coefficient)² to BOTH sides, once for x and once for y.', 'Rewrite as (x - h)² + (y - k)² = r² and read off the center and radius.'],
      solution: [`Group: ~(x^2 ${sgn(D)}x) + (y^2 ${sgn(E)}y) = ${-Fc}~`, `Add ~${h * h}~ and ~${k * k}~ to both sides: ~${sq('x', h)} + ${sq('y', k)} = ${r * r}~`, `Center ~${pt(h, k)}~, radius ~${r}~`]
    };
  }
};
G['circle-write'] = function () {
  const h = rnd(-6, 6), k = rnd(-6, 6), r = rnd(2, 8);
  return {
    prompt: `Write the equation of the circle with center ~${pt(h, k)}~ and radius ~${r}~.`,
    fields: one('Equation', AQ.eqCheck(e => (e.x - h) ** 2 + (e.y - k) ** 2 - r * r), '~' + sq('x', h) + ' + ' + sq('y', k) + ' = ' + r * r + '~', 'like (x-1)^2 + (y+2)^2 = 9'),
    hints: ['Start from (x - h)² + (y - k)² = r².', 'Subtract h and k, so a center of 3 means (x - 3).', 'Square the radius on the right side.'],
    solution: ['Plug the center and radius into the standard form', `~${sq('x', h)} + ${sq('y', k)} = ${r * r}~`]
  };
};

G['inc-dec'] = function () {
  for (;;) {
    const types = shuffle(['u', 'd', 'f', pick(['u', 'd', 'f'])]), xs = [-6, -3, 0, 3, 6];
    let y = rnd(-3, 3); const ys = [y];
    for (const t of types) { y += t === 'u' ? rnd(2, 4) : t === 'd' ? -rnd(2, 4) : 0; ys.push(y); }
    if (Math.max(...ys) > 8 || Math.min(...ys) < -8) continue;
    const groups = { u: [], d: [], f: [] };
    let i = 0;
    while (i < 4) { let j = i; while (j + 1 < 4 && types[j + 1] === types[i]) j++; groups[types[i]].push({ lo: xs[i], hi: xs[j + 1], loC: false, hiC: false }); i = j + 1; }
    const show = g => groups[g].length ? groups[g].map(v => '(' + v.lo + ', ' + v.hi + ')').join(' U ') : 'none';
    const visual = AQ.plot({ xmin: -8, xmax: 8, ymin: -9, ymax: 9, step: 1, lab: 2, curves: [{ pts: xs.map((x, k) => [x, ys[k]]), cls: 'c-a' }], points: xs.map((x, k) => ({ x, y: ys[k], cls: 'c-w', r: 4 })), label: 'a piecewise linear graph' });
    return {
      visual, prompt: 'Using the graph (read left to right, by x-value), give the open intervals where the function is increasing, decreasing, and constant. Write <b>none</b> if there are no such intervals.',
      fields: [{ key: 'u', label: 'Increasing', check: AQ.ivCheck(groups.u), answer: '~' + show('u') + '~', ph: 'like (-6, 0) U (3, 6)' }, { key: 'd', label: 'Decreasing', check: AQ.ivCheck(groups.d), answer: '~' + show('d') + '~', ph: 'or none' }, { key: 'f', label: 'Constant', check: AQ.ivCheck(groups.f), answer: '~' + show('f') + '~', ph: 'or none' }],
      hints: ['Trace the graph with your finger from left to right. Going up means increasing, going down means decreasing, flat means constant.', 'Intervals use x-values (the left-to-right positions), never y-values.', 'Write each interval with round brackets, and join separate pieces with U.'],
      solution: ['Read the turning points’ x-values from the graph', `Increasing: ~${show('u')}~`, `Decreasing: ~${show('d')}~`, `Constant: ~${show('f')}~`]
    };
  }
};

G['graph-eq'] = function () {
  const v = rnd(0, 2);
  if (v === 0) {
    for (;;) {
      const m = pick([-3, -2, -1, 1, 2, 3, Fr(1, 2), Fr(-1, 2)].map(z => typeof z === 'number' ? Fr(z) : z)), x1 = rnd(-4, 0) * (m.d === 2 ? 2 : 1), b = rnd(-4, 4);
      const X1 = x1, Y1 = fval(m) * X1 + b, x2 = X1 + (m.d === 2 ? 2 * rnd(1, 3) : rnd(1, 3)), Y2 = fval(m) * x2 + b;
      if (![Y1, Y2].every(v2 => Number.isInteger(v2) && Math.abs(v2) <= 8) || Math.abs(x2) > 8) continue;
      const visual = AQ.plot({ xmin: -9, xmax: 9, ymin: -9, ymax: 9, step: 1, lab: 3, curves: [{ f: x => fval(m) * x + b }], points: [{ x: X1, y: Y1, label: pt(X1, Y1) }, { x: x2, y: Y2, label: pt(x2, Y2) }], label: 'a line with two labeled points' });
      return { visual, prompt: 'State the equation of the line shown (two points are labeled).', fields: one('y =', AQ.exprCheck(x => fval(m) * x + b), '~y = ' + lineText(m, Fr(b)) + '~', 'like 2x - 1'),
        hints: ['Read the two labeled points and compute the slope (rise over run).', 'The y-intercept is where the line crosses the y-axis. You can read it or compute it.', 'Write y = mx + b.'], solution: [`Slope from the two points: ~${fq(m)}~`, `y-intercept: ~${b}~`, `~y = ${lineText(m, Fr(b))}~`] };
    }
  }
  const h = rnd(-3, 3), k = rnd(-4, 4), a = pick([-2, -1, 1, 2]);
  if (v === 1) {
    const visual = AQ.plot({ xmin: -9, xmax: 9, ymin: -9, ymax: 9, step: 1, lab: 3, curves: [{ f: x => a * (x - h) ** 2 + k }], points: [{ x: h, y: k, label: 'vertex ' + pt(h, k) }, { x: h + 1, y: k + a, label: pt(h + 1, k + a), dx: 8, dy: 14 }], label: 'a parabola with its vertex and one more point labeled' });
    return { visual, prompt: 'This graph is a parabola. The vertex and one more point are labeled. State its equation.', fields: one('y =', AQ.exprCheck(x => a * (x - h) ** 2 + k), '~y = ' + (a === 1 ? '' : a === -1 ? '-' : a) + sq('x', h) + ' ' + sgn(k) + '~', 'like -2(x-1)^2 + 3'),
      hints: ['Vertex form is y = a(x - h)² + k, where (h, k) is the vertex.', 'Plug in the other point to find a.', 'Write the final equation with a, h and k filled in.'], solution: [`Vertex ~${pt(h, k)}~: ~y = a(${xp('x', -h)})^2 ${sgn(k)}~`, `Use ~${pt(h + 1, k + a)}~ to get ~a = ${a}~`, `~y = ${a === 1 ? '' : a === -1 ? '-' : a}${sq('x', h)} ${sgn(k)}~`] };
  }
  const aa = pick([-2, -1, 1, 2]);
  const visual = AQ.plot({ xmin: -9, xmax: 9, ymin: -9, ymax: 9, step: 1, lab: 3, curves: [{ f: x => aa * Math.abs(x - h) + k }], points: [{ x: h, y: k, label: 'corner ' + pt(h, k) }, { x: h + 2, y: k + 2 * aa, label: pt(h + 2, k + 2 * aa), dx: 8, dy: 14 }], label: 'a V-shaped graph with two labeled points' });
  return { visual, prompt: 'This V-shaped graph is an absolute value function. The corner and another point are labeled. State its equation.', fields: one('y =', AQ.exprCheck(x => aa * Math.abs(x - h) + k), '~y = ' + (aa === 1 ? '' : aa === -1 ? '-' : aa) + '|' + xp('x', -h).replace(/^x \+ 0$/, 'x') + '| ' + sgn(k) + '~', 'use abs( ) like 2abs(x-1) + 3'),
    hints: ['Absolute value form: y = a|x - h| + k, with the corner at (h, k).', 'Use the second point to find a (it controls the steepness and the direction).', 'Type absolute value as abs( ).'], solution: [`Corner ~${pt(h, k)}~`, `Second point gives ~a = ${aa}~`, `~y = ${aa}|${xp('x', -h)}| ${sgn(k)}~`] };
};

G['piecewise-eval'] = function () {
  for (;;) {
    const c = rnd(-2, 3), m1 = nz(-4, 4), b1 = nz(-6, 6), m2 = nz(-4, 4), b2 = nz(-6, 6), strictRight = Math.random() < 0.5;
    const right = x => m1 * x + b1, left = x => m2 * x + b2, f = x => (strictRight ? x > c : x >= c) ? right(x) : left(x);
    const p1 = c + rnd(1, 4), p2 = c - rnd(1, 4);
    if (m1 === 2 && b1 === 2 && c === 0) continue;
    const rows = [`${lin(m1, b1)}, if x ${strictRight ? '>' : '>='} ${c}`, `${lin(m2, b2)}, if x ${strictRight ? '<=' : '<'} ${c}`].map(r => r.replace(/^(.*), if (.*)$/, '~$1~, if ~$2~'));
    return {
      prompt: `Let ~f(x) =~ ${cases(rows.map(r => r.replace(/~/g, '~')).map(r => r))} Evaluate each.`.replace(/<div>/g, '<div>'),
      fields: [{ key: 'a', label: `f(${p1})`, check: AQ.numCheck(f(p1)), answer: '~' + f(p1) + '~', ph: 'number' }, { key: 'b', label: `f(${p2})`, check: AQ.numCheck(f(p2)), answer: '~' + f(p2) + '~', ph: 'number' }, { key: 'c', label: `f(${c})`, check: AQ.numCheck(f(c)), answer: '~' + f(c) + '~', ph: 'number' }],
      hints: ['For each input, first decide which condition it satisfies. Only then plug into that piece.', `Be careful at x = ${c}: look closely at which row has the “or equal to”.`, 'Only ONE piece is used for any single input.'],
      solution: [`~${p1}~ is ${p1 > c ? 'greater' : 'less'} than ${c}`, 'Use the matching piece', `~f(${p1}) = ${f(p1)}~, ~f(${p2}) = ${f(p2)}~, ~f(${c}) = ${f(c)}~`]
    };
  }
};

const SYM = [
  () => { const a = nz(1, 4), b = nz(-6, 6), c = nz(-6, 6); return { eq: `y = ${poly([a, 0, b, 0, c].filter((_, i, arr) => true))}`.replace(/ [+-] 0x?\^?\d?/g, ''), F: (x, y) => y - (a * x ** 4 + b * x * x + c), sym: ['y'] }; },
  () => { const a = nz(1, 4), b = nz(-6, 6); return { eq: `y = ${poly([a, 0, b, 0], 'x').replace(/ [+-] 0$/, '')}`, F: (x, y) => y - (a * x ** 3 + b * x), sym: ['o'] }; },
  () => { const a = nz(1, 3), b = nz(-5, 5), c = nz(-5, 5); return { eq: `y = ${poly([a, b, c])}`, F: (x, y) => y - (a * x * x + b * x + c), sym: b === 0 ? ['y'] : [] }; },
  () => { const a = pick([1, 2, -1]), c = nz(-6, 6); return { eq: `x = ${a === 1 ? '' : a === -1 ? '-' : a}y^2 ${sgn(c)}`, F: (x, y) => x - (a * y * y + c), sym: ['x'] }; },
  () => { const r = rnd(2, 9); return { eq: `x^2 + y^2 = ${r * r}`, F: (x, y) => x * x + y * y - r * r, sym: ['x', 'y', 'o'] }; },
  () => { const k = nz(-9, 9); if (k === 0) return null; return { eq: `xy = ${k}`, F: (x, y) => x * y - k, sym: ['o'] }; },
  () => { const c = nz(-5, 5); return { eq: `y = |x| ${sgn(c)}`, F: (x, y) => y - (Math.abs(x) + c), sym: ['y'] }; },
  () => { const a = nz(1, 3), b = nz(1, 4); return { eq: `y = x^3 ${sgn(b)}x^2`, F: (x, y) => y - (x ** 3 + b * x * x), sym: [] }; }
];
G['symmetry'] = function () {
  for (;;) {
    const t = pick(SYM)(); if (!t) continue;
    const eq = t.eq.replace(/\+ -/g, '- ').replace(/ 1x/g, ' x');
    if (/^y = 2x\^4 \+ 8x\^2 - 4$/.test(eq)) continue;
    const ok = (a, b) => [1, 2, 3, 4, 5].every(k => { const x = 0.7 * k + 0.3, y = 1.1 * k - 0.4, F0 = t.F(x, y), F1 = t.F(a * x, b * y); return Math.abs(F1 - F0) < 1e-9 || Math.abs(F1 + F0) < 1e-9; });
    const sx = ok(1, -1), sy = ok(-1, 1), so = ok(-1, -1);
    const keys = [sx && 'x', sy && 'y', so && 'o'].filter(Boolean), want = keys.length ? keys : ['n'];
    const names = { x: 'x-axis', y: 'y-axis', o: 'origin', n: 'none of these' };
    return {
      prompt: `Which kinds of symmetry does the graph of ~${eq}~ have? Select all that apply.`,
      fields: [{ key: 'a', label: 'Symmetry', kind: 'multi', options: [{ k: 'x', l: 'x-axis' }, { k: 'y', l: 'y-axis' }, { k: 'o', l: 'origin' }, { k: 'n', l: 'none' }], check: AQ.multiCheck(want, 'Test each one separately: replace the variables and see whether you get the SAME equation back.'), answer: want.map(k => names[k]).join(', ') }],
      hints: ['x-axis: replace y with -y. y-axis: replace x with -x. Origin: replace both.', 'If the equation comes out exactly the same, that symmetry holds.', 'Remember: even powers lose their sign; odd powers keep it.'],
      solution: ['Test each replacement', 'Keep the ones that return the original equation', 'Symmetry: ' + want.map(k => names[k]).join(', ')]
    };
  }
};

function fnPair() {
  const f = [nz(-5, 5), nz(-9, 9)], g = pick([[nz(-5, 5), nz(-9, 9)], [nz(1, 4), nz(-6, 6), nz(-5, 5)]]);
  return { f, g };
}
// the practice test's linear f and g pairs never appear in the function-operation generators
const testFG = (a, b, c, d) => (a === -4 && b === 9 && c === 5 && d === 3) || (a === 3 && b === -6 && c === 9 && d === -5);
G['fn-arith'] = function () {
  const v = rnd(0, 3);
  for (;;) {
    const f = [nz(-5, 5), nz(-9, 9)], gq = [nz(1, 4), nz(-6, 6), nz(-7, 7)], gl = [nz(-6, 6), nz(-9, 9)];
    const k = nz(-4, 4); if (testFG(f[0], f[1], gl[0], gl[1])) continue;
    if (v === 0) { const op = pick(['+', '-']), s = op === '+' ? 1 : -1, r = [f[0] + s * gl[0], f[1] + s * gl[1]]; if (r[0] === 0) continue;
      return { prompt: `Let ~f(x) = ${lin(f[0], f[1])}~ and ~g(x) = ${lin(gl[0], gl[1])}~. Find ~(f ${op} g)(x)~.`, fields: one('(f ' + op + ' g)(x) =', AQ.exprCheck(x => (f[0] * x + f[1]) + s * (gl[0] * x + gl[1])), '~' + lin(r[0], r[1]) + '~', 'like 3x - 2'),
        hints: [`(f ${op} g)(x) means f(x) ${op} g(x).`, op === '-' ? 'Put g(x) in parentheses and distribute the minus sign to EVERY term.' : 'Combine like terms.', 'Write the result as simplified as you can.'], solution: [`~(${lin(f[0], f[1])}) ${op} (${lin(gl[0], gl[1])})~`, op === '-' ? 'Distribute the minus sign' : 'Remove parentheses', `~${lin(r[0], r[1])}~`] }; }
    if (v === 1) { const val = (f[0] * k + f[1]) * (gq[0] * k * k + gq[1] * k + gq[2]);
      return { prompt: `Let ~f(x) = ${lin(f[0], f[1])}~ and ~g(x) = ${poly(gq)}~. Find ~(fg)(${k})~.`, fields: one('(fg)(' + k + ') =', AQ.numCheck(val), '~' + val + '~', 'a number'),
        hints: ['(fg)(k) means f(k) times g(k).', 'Evaluate each function separately at ' + k + ' (use parentheses for negatives).', 'Then multiply the two results.'], solution: [`~f(${k}) = ${f[0] * k + f[1]}~`, `~g(${k}) = ${gq[0] * k * k + gq[1] * k + gq[2]}~`, `Multiply: ~${val}~`] }; }
    if (v === 2) { const gv = gq[0] * k * k + gq[1] * k + gq[2]; if (gv === 0) continue; const fv = f[0] * k + f[1], q = Fr(fv, gv);
      return { prompt: `Let ~f(x) = ${lin(f[0], f[1])}~ and ~g(x) = ${poly(gq)}~. Find ~({f|g})(${k})~.`, fields: one('(f/g)(' + k + ') =', AQ.numCheck(fval(q), { roundedDecimal: true }), '~' + fq(q) + '~', 'fraction or decimal (round to 3+ places)'),
        hints: ['(f/g)(k) means f(k) divided by g(k).', 'Evaluate the top and bottom separately.', 'Simplify the fraction.'], solution: [`~f(${k}) = ${fv}~`, `~g(${k}) = ${gv}~`, `~${fq(q)}~`] }; }
    const r = gq.slice(); r[1] += f[0]; r[2] += f[1];
    return { prompt: `Let ~f(x) = ${lin(f[0], f[1])}~ and ~g(x) = ${poly(gq)}~. Find ~(f + g)(x)~.`, fields: one('(f + g)(x) =', AQ.exprCheck(x => f[0] * x + f[1] + gq[0] * x * x + gq[1] * x + gq[2]), '~' + poly(r) + '~', 'like x^2 + 3x - 1'),
      hints: ['(f + g)(x) means f(x) + g(x).', 'Line up like terms: x² terms, x terms, constants.'], solution: ['Add the two expressions', `~${poly(r)}~`] };
  }
};
G['fn-comp'] = function () {
  const v = rnd(0, 2);
  for (;;) {
    const fa1 = [nz(-5, 5), nz(-9, 9)], gl = [nz(-5, 5), nz(-9, 9)], fq2 = [nz(-4, 4), nz(-8, 8), nz(-9, 9)], k = nz(-3, 3);
    if (testFG(fa1[0], fa1[1], gl[0], gl[1])) continue;
    if (v === 0) { const inner = gl[0] * k + gl[1], val = fq2[0] * inner * inner + fq2[1] * inner + fq2[2];
      return { prompt: `Let ~f(x) = ${poly(fq2)}~ and ~g(x) = ${lin(gl[0], gl[1])}~. Find ~(f ∘ g)(${k})~.`, fields: one('(f∘g)(' + k + ') =', AQ.numCheck(val), '~' + val + '~', 'a number'),
        hints: ['(f ∘ g)(k) means f(g(k)): do g FIRST.', `Find g(${k}), then use that number as the input to f.`, 'Parentheses around negatives when you square!'], solution: [`~g(${k}) = ${inner}~`, `~f(${inner}) = ${val}~`] }; }
    if (v === 1) { const c = [fa1[0] * gl[0], fa1[0] * gl[1] + fa1[1]];
      return { prompt: `Let ~f(x) = ${lin(fa1[0], fa1[1])}~ and ~g(x) = ${lin(gl[0], gl[1])}~. Find ~(f ∘ g)(x)~.`, fields: one('(f∘g)(x) =', AQ.exprCheck(x => fa1[0] * (gl[0] * x + gl[1]) + fa1[1]), '~' + lin(c[0], c[1]) + '~', 'like 6x - 11'),
        hints: ['(f ∘ g)(x) = f(g(x)). Replace every x in f with the whole expression g(x).', 'Put g(x) in parentheses, then distribute.'], solution: [`~f(g(x)) = ${fa1[0]}(${lin(gl[0], gl[1])}) ${sgn(fa1[1])}~`, `~${lin(c[0], c[1])}~`] }; }
    const gf = [gl[0] * fa1[0], gl[0] * fa1[1] + gl[1]];
    return { prompt: `Let ~f(x) = ${lin(fa1[0], fa1[1])}~ and ~g(x) = ${lin(gl[0], gl[1])}~. Find ~(g ∘ f)(x)~. (Careful: this is the OTHER order.)`, fields: one('(g∘f)(x) =', AQ.exprCheck(x => gl[0] * (fa1[0] * x + fa1[1]) + gl[1]), '~' + lin(gf[0], gf[1]) + '~', 'like 6x - 11'),
      hints: ['(g ∘ f)(x) = g(f(x)). Now f goes INSIDE g.', 'Replace every x in g with the whole expression f(x).'], solution: [`~g(f(x)) = ${gl[0]}(${lin(fa1[0], fa1[1])}) ${sgn(gl[1])}~`, `~${lin(gf[0], gf[1])}~`] };
  }
};
void cxPrompt; void fnPair; void fmtBound; void asFrStr;
if (typeof module !== 'undefined' && module.exports) module.exports = AQ;
})(typeof window !== 'undefined' ? window : globalThis);
