/* Algebra Workbook practice generators, chapters 3 and 4. */
(function (root) {
'use strict';
const AQ = root.AQ = root.AQ || {};
const { rnd, pick, nz, shuffle, Fr, fsub, fmul, fval, fq, fa, poly, lin, sgn, paren, polyEval, synth, fromRoots, factorStr, money } = AQ;
const G = AQ.gens = AQ.gens || {};
const one = (label, check, answer, ph, extra) => [Object.assign({ key: 'a', label, check, answer, ph }, extra || {})];
const pt = (x, y) => '(' + x + ', ' + y + ')';
const xp = (v, b) => (b < 0 ? v + ' - ' + (-b) : v + ' + ' + b);
const ud = [{ k: 'u', l: 'goes up ↑' }, { k: 'd', l: 'goes down ↓' }];
const num = n => n.toLocaleString('en-US');
const frStr = f => (f.d === 1 ? String(f.n) : f.n + '/' + f.d);

/* ============ CHAPTER 3 ============ */
G['parabola-features'] = function () {
  for (;;) {
    const a = pick([1, 1, -1, 2, -2]);
    let b, c, h, k, xints, hasX = Math.random() < 0.75;
    if (hasX) {
      const r1 = rnd(-6, 6), d = 2 * rnd(1, 4), r2 = r1 + d; h = r1 + d / 2; k = -a * (d / 2) ** 2;
      if (a === 1 && r1 === -1 && r2 === 3) continue;
      b = -2 * a * h; c = a * h * h + k; xints = [r1, r2];
    } else {
      h = rnd(-5, 5); k = (a > 0 ? 1 : -1) * rnd(1, 6); b = -2 * a * h; c = a * h * h + k; xints = [];
    }
    if (Math.abs(b) > 30) continue;
    if (Math.abs(a) === 1 && b === -2 && c === -3) continue;   // the practice test's own parabola
    return {
      prompt: `For ~f(x) = ${poly([a, b, c])}~, answer each part.`,
      fields: [
        { key: 'o', label: 'The parabola…', kind: 'choice', options: [{ k: 'u', l: 'opens up' }, { k: 'd', l: 'opens down' }], check: AQ.choiceCheck(a > 0 ? 'u' : 'd', 'Look at the sign of the x² coefficient.'), answer: a > 0 ? 'opens up' : 'opens down' },
        { key: 'v', label: 'Vertex', check: AQ.ptCheck(h, k), answer: '~' + pt(h, k) + '~', ph: 'like (2, -5)' },
        { key: 'y', label: 'y-intercept', check: AQ.numCheck(c), answer: '~' + c + '~', ph: 'a number' },
        { key: 'x', label: 'x-intercept(s)', check: AQ.setCheck(xints), answer: xints.length ? '~x = ' + xints.join('~, ~x = ') + '~' : 'none', ph: 'comma separated, or none' }
      ],
      hints: ['Opens up if a > 0, down if a < 0.', 'Vertex: x = -b/(2a). Then plug that x back into f to get the y-coordinate.', 'y-intercept: let x = 0. x-intercepts: set f(x) = 0 and solve (they may not exist!).'],
      solution: [`~a = ${a}~, so it opens ${a > 0 ? 'up' : 'down'}`, `~x = {-${paren(b)}|2(${a})} = ${h}~, ~f(${h}) = ${k}~`, `y-intercept: ~f(0) = ${c}~`, xints.length ? `Solve ~f(x) = 0~: ~x = ${xints.join(', ')}~` : 'f(x) = 0 has no real solutions, so there are no x-intercepts']
    };
  }
};
G['max-profit'] = function () {
  for (;;) {
    const a = rnd(1, 5), xs = rnd(8, 60), b = 2 * a * xs, c = rnd(2, 40) * 10, mx = a * xs * xs + c;
    if (a === 1 && b === 56) continue;
    const ctx = pick([['a lemonade stand', 'cups sold'], ['a bakery', 'loaves baked'], ['a phone-case shop', 'cases sold'], ['a food truck', 'meals sold'], ['a print shop', 'posters printed']]);
    return {
      prompt: `The weekly profit of ${ctx[0]} is ~P(x) = ${poly([-a, b, c], 'x')}~ dollars, where ~x~ is the number of ${ctx[1]}.`,
      fields: [{ key: 'x', label: 'x for maximum profit', check: AQ.numCheck(xs), answer: '~' + xs + '~', ph: 'number' }, { key: 'p', label: 'Maximum profit ($)', check: AQ.numCheck(mx), answer: '~$' + num(mx) + '~', ph: 'dollars' }],
      hints: ['A downward-opening parabola has its highest point at the vertex.', 'The vertex is at x = -b/(2a). That’s the x that gives the maximum.', 'For the maximum profit itself, plug that x back into P(x).'],
      solution: [`~x = {-${b}|2(-${a})} = ${xs}~`, `~P(${xs}) = ${mx}~`]
    };
  }
};

function synthHTML(k, c) {
  const cells = c.map(v => `<td>${AQ.pretty(String(v))}</td>`).join('');
  return `<div class="synthwrap"><table class="synth"><tr><td class="kcell">${AQ.pretty(String(k))}</td><td class="sep"></td>${cells}</tr><tr><td class="kcell"></td><td class="sep"></td>${c.map(() => '<td class="blank">·</td>').join('')}</tr><tr class="rule"><td class="kcell"></td><td class="sep"></td>${c.map(() => '<td class="blank">?</td>').join('')}</tr></table></div>`;
}
G['synth-div'] = function () {
  const deg = pick([3, 4]), k = pick([-6, -5, -4, -3, -2, -1, 1, 2, 3, 4, 5]);
  const c = Array.from({ length: deg + 1 }, (_, i) => (i === 0 ? pick([1, 1, 2, 3]) : rnd(-9, 9)));
  const row = synth(c, k), q = row.slice(0, -1), rem = row[row.length - 1];
  const fields = row.map((v, i) => ({ key: 'r' + i, label: i === row.length - 1 ? 'remainder' : 'row ' + (i + 1), check: AQ.numCheck(v, i === 0 ? { nudge: () => 'The first number just drops straight down.' } : {}), answer: '~' + v + '~', ph: '' }));
  return {
    visual: synthHTML(k, c),
    prompt: `Use synthetic division to divide ~${poly(c)}~ by ~${xp('x', -k)}~. The setup is shown. Fill in the bottom row left to right (the last box is the remainder).`,
    fields,
    hints: [`The number in the corner is the ZERO of the divisor: for ${xp('x', -k)} that is x = ${k}.`, 'Bring the first coefficient straight down. Then repeat: multiply by the corner number, write it under the next coefficient, add the column.', 'The last number you get is the remainder. The others are the quotient’s coefficients.'],
    solution: [`Corner number: ~${k}~`, `Bottom row: ~${row.join(', ')}~`, `Quotient: ~${poly(q)}~, remainder ~${rem}~`]
  };
};
G['remainder'] = function () {
  const deg = pick([3, 4]), k = pick([-4, -3, -2, -1, 1, 2, 3, 4]);
  const c = Array.from({ length: deg + 1 }, (_, i) => (i === 0 ? pick([1, 2, 3, -1]) : rnd(-9, 9)));
  if (deg === 3 && k === -3 && c.join() === '3,-3,-4,12') return G['remainder']();
  const v = polyEval(c, k);
  return {
    prompt: `Use the Remainder Theorem (with synthetic division) to find ~f(${k})~ for ~f(x) = ${poly(c)}~.`,
    fields: one(`f(${k}) =`, AQ.numCheck(v), '~' + v + '~', 'a number'),
    hints: ['The Remainder Theorem says: dividing f(x) by (x - k) leaves a remainder equal to f(k).', `Run synthetic division with ${k} in the corner.`, 'The last number in the bottom row is your answer. (You can double-check by plugging in directly.)'],
    solution: [`Synthetic division with ~${k}~: bottom row ~${synth(c, k).join(', ')}~`, `Remainder = ~f(${k}) = ${v}~`]
  };
};
G['factor-yn'] = function () {
  const k = nz(-6, 6), yes = Math.random() < 0.5, quad = Math.random() < 0.55;
  let c;
  if (quad) { const r = nz(-7, 7); c = fromRoots(yes ? [k, r] : [r, r + nz(1, 3)]); if (!yes && polyEval(c, k) === 0) return G['factor-yn'](); }
  else { c = fromRoots(yes ? [k, nz(-5, 5), nz(-5, 5)] : [nz(-5, 5), nz(-5, 5), nz(-5, 5)]); if (!yes && polyEval(c, k) === 0) return G['factor-yn'](); }
  if (c[0] === 3 && k === 4) return G['factor-yn']();
  const v = polyEval(c, k);
  return {
    prompt: `Is ~${xp('x', -k)}~ a factor of ~${poly(c)}~? First find ~p(${k})~, then decide.`,
    fields: [{ key: 'v', label: `p(${k}) =`, check: AQ.numCheck(v), answer: '~' + v + '~', ph: 'a number' }, { key: 'a', label: 'Is it a factor?', kind: 'choice', options: [{ k: 'y', l: 'Yes' }, { k: 'n', l: 'No' }], check: AQ.choiceCheck(yes ? 'y' : 'n', 'The Factor Theorem: (x - k) is a factor exactly when p(k) = 0.'), answer: yes ? 'Yes' : 'No' }],
    hints: [`The Factor Theorem: (x - k) is a factor of p(x) if and only if p(k) = 0. Here k = ${k}.`, `Find p(${k}) by synthetic division (the remainder) or by direct substitution.`, 'Remainder zero → factor. Anything else → not a factor.'],
    solution: [`~p(${k}) = ${v}~`, v === 0 ? 'Zero remainder, so it IS a factor' : 'Non-zero remainder, so it is NOT a factor']
  };
};
G['factor-zero'] = function () {
  for (;;) {
    const r = shuffle([-9, -8, -7, -6, -5, -4, -3, -2, -1, 1, 2, 3, 4, 5, 6, 7, 8, 9]).slice(0, 3), k = r[0];
    if ([...r].sort((a, b) => a - b).join() === '-6,4,6') continue;
    const c = fromRoots(r), fact = r.slice().sort((a, b) => a - b).map(v => factorStr(v)).join('');
    return {
      prompt: `Factor ~f(x) = ${poly(c)}~ completely into linear factors, given that ~${k}~ is a zero of ~f~.`,
      fields: one('f(x) =', AQ.exprCheck(x => polyEval(c, x), { after: s => (/\^/.test(s) || (s.match(/\(/g) || []).length < 3) ? 'Write it as a product of three linear factors, like (x - 2)(x + 1)(x - 5).' : null }), '~f(x) = ' + fact + '~', 'like (x-2)(x+1)(x-5)'),
      hints: [`Since ${k} is a zero, (x - ${k < 0 ? '(' + k + ')' : k}) is a factor. Divide f(x) by it using synthetic division.`, 'The quotient is a quadratic. Factor that too.', 'Write f(x) as the product of all three linear factors.'],
      solution: [`Synthetic division with ~${k}~: bottom row ~${synth(c, k).join(', ')}~`, `Quotient: ~${poly(synth(c, k).slice(0, -1))}~, which factors into the other two factors`, `~f(x) = ${fact}~`]
    };
  }
};

function polyDisplay(terms) { let s = ''; terms.forEach(([c, p], i) => { s += AQ.term(c, p, 'x', i === 0); }); return s; }
G['end-behavior'] = function () {
  const deg = rnd(2, 7), pows = [deg];
  for (let p = deg - 1; p >= 0; p--) if (Math.random() < 0.6 || p === 0) pows.push(p);
  const terms = pows.map((p, i) => [i === 0 ? nz(-5, 5) : nz(-9, 9), p]);
  if (deg === 6 && terms[0][0] === -1) return G['end-behavior']();
  const shuffled = Math.random() < 0.35, shown = shuffled ? shuffle(terms) : terms;
  const lead = terms[0][0], right = lead > 0 ? 'u' : 'd', left = (deg % 2 === 0) ? right : (right === 'u' ? 'd' : 'u');
  const nm = { u: 'up (→ +∞)', d: 'down (→ -∞)' };
  return {
    prompt: `Describe the end behavior of ~f(x) = ${polyDisplay(shown)}~.`,
    fields: [{ key: 'l', label: 'As x → -∞, the graph…', kind: 'choice', options: ud, check: AQ.choiceCheck(left, 'Only the leading term (highest power) matters. Think: what does an even/odd power do to a negative x?'), answer: nm[left] }, { key: 'r', label: 'As x → +∞, the graph…', kind: 'choice', options: ud, check: AQ.choiceCheck(right, 'Only the leading term matters. Is its coefficient positive or negative?'), answer: nm[right] }],
    hints: [shuffled ? 'The terms aren’t in order! Find the term with the HIGHEST power. That’s the leading term.' : 'Look only at the leading term, the one with the highest power.', 'Right end: up if the leading coefficient is positive, down if negative.', 'Left end: same as the right end if the degree is even, opposite if the degree is odd.'],
    solution: [`Degree ${deg} (${deg % 2 ? 'odd' : 'even'}), leading coefficient ${lead} (${lead > 0 ? 'positive' : 'negative'})`, `Right end goes ${nm[right]}`, `Left end goes ${nm[left]}`]
  };
};

G['poly-from-graph'] = function () {
  for (;;) {
    const r = shuffle([-5, -4, -3, -2, -1, 1, 2, 3, 4, 5]).slice(0, 3).sort((a, b) => a - b), a = pick([1, -1, 2, -2]);
    if (a === 1 && r.join() === '-2,1,3') continue;
    const y0 = a * (-r[0]) * (-r[1]) * (-r[2]); if (Math.abs(y0) > 12) continue;
    const f = x => a * (x - r[0]) * (x - r[1]) * (x - r[2]);
    const visual = AQ.plot({ xmin: -6, xmax: 6, ymin: -13, ymax: 13, step: 1, lab: 2, curves: [{ f }], points: r.map(v => ({ x: v, y: 0, label: pt(v, 0), dy: -10, dx: -14 })).concat([{ x: 0, y: y0, label: pt(0, y0), dx: 8, dy: -8, cls: 'c-b' }]), label: 'a cubic graph with zeros and the y-intercept labeled' });
    return {
      visual, prompt: 'The graph of a cubic polynomial is shown, with its zeros and its y-intercept labeled. Find the equation ~f(x)~. (Remember the leading coefficient!)',
      fields: one('f(x) =', AQ.exprCheck(f, { wrong: 'Not quite. Make sure each zero gives a factor, then use the y-intercept to find the leading coefficient a.' }), '~f(x) = ' + (a === 1 ? '' : a === -1 ? '-' : a) + r.map(v => factorStr(v)).join('') + '~', 'like -2(x-1)(x+3)(x-4)'),
      hints: ['Each x-intercept r gives a factor (x - r).', 'Write f(x) = a(x - r₁)(x - r₂)(x - r₃) with a unknown.', 'Plug in the point (0, y-intercept) and solve for a.'],
      solution: [`Factors: ~${r.map(v => factorStr(v)).join('')}~`, `~f(0) = a(${-r[0]})(${-r[1]})(${-r[2]}) = ${y0}~, so ~a = ${a}~`, `~f(x) = ${a === 1 ? '' : a === -1 ? '-' : a}${r.map(v => factorStr(v)).join('')}~`]
    };
  }
};

G['multiplicity'] = function () {
  for (;;) {
    const a = pick([-3, -2, -1, 1, 2, 3]), p = nz(-5, 5), q = nz(-5, 5), m = rnd(1, 3), n = rnd(1, 3);
    if (p === q || (a === 2 && m + n === 3)) continue;
    const deg = m + n, right = a > 0 ? 'u' : 'd', left = deg % 2 === 0 ? right : (right === 'u' ? 'd' : 'u');
    const touch = [m % 2 === 0 ? p : null, n % 2 === 0 ? q : null].filter(v => v !== null), y0 = a * Math.pow(-p, m) * Math.pow(-q, n);
    const fac = (r, e) => factorStr(r) + (e > 1 ? '^' + e : '');
    const nm = { u: 'up', d: 'down' };
    return {
      prompt: `Analyze ~f(x) = ${a === 1 ? '' : a === -1 ? '-' : a}${fac(p, m)}${fac(q, n)}~.`,
      fields: [
        { key: 'd', label: 'Degree', check: AQ.numCheck(deg), answer: '~' + deg + '~', ph: 'a number' },
        { key: 'r', label: 'Right end goes', kind: 'choice', options: [{ k: 'u', l: 'up' }, { k: 'd', l: 'down' }], check: AQ.choiceCheck(right, 'Check the sign of the leading coefficient.'), answer: nm[right] },
        { key: 'l', label: 'Left end goes', kind: 'choice', options: [{ k: 'u', l: 'up' }, { k: 'd', l: 'down' }], check: AQ.choiceCheck(left, 'Even degree: both ends match. Odd degree: ends go opposite ways.'), answer: nm[left] },
        { key: 't', label: 'Touches (bounces) at x =', check: AQ.setCheck(touch), answer: touch.length ? '~' + touch.join(', ') + '~' : 'none', ph: 'x-value(s), or none' },
        { key: 'y', label: 'y-intercept', check: AQ.numCheck(y0), answer: '~' + y0 + '~', ph: 'a number' }
      ],
      hints: ['Degree = add up the exponents (a factor without a visible exponent has exponent 1).', 'A zero with an EVEN multiplicity touches the axis and bounces; an ODD multiplicity crosses.', 'For the y-intercept plug in x = 0 and multiply it all out carefully.'],
      solution: [`Degree: ~${m} + ${n} = ${deg}~`, `Leading coefficient ${a > 0 ? 'positive' : 'negative'}, degree ${deg % 2 ? 'odd' : 'even'}`, touch.length ? `Even multiplicity at ~x = ${touch.join(', ')}~, so it touches` : 'Every multiplicity is odd, so it crosses everywhere', `~f(0) = ${y0}~`]
    };
  }
};

G['rational-features'] = function () {
  for (;;) {
    const a = pick([1, 2, 3, -1, -2]), v = shuffle([-7, -6, -5, -4, -3, -2, -1, 1, 2, 3, 4, 5, 6, 7]).slice(0, 4), [p, q, r, s] = v;
    if (p * q === r * s || (a === 2 && [p, q].sort().join() === '-6,2')) continue;
    const num = fromRoots([p, q], a), den = fromRoots([r, s]);
    const f = x => polyEval(num, x) / polyEval(den, x);
    const cross = (r + s) - (p + q) === 0 ? null : (r * s - p * q) / ((r + s) - (p + q));
    const y0 = Fr(a * p * q, r * s);
    return {
      prompt: `Analyze ~f(x) = {${poly(num)}|${poly(den)}}~. (The numerator and denominator don’t share a factor.)`,
      fields: [
        { key: 'va', label: 'Vertical asymptote(s)  x =', check: AQ.setCheck([r, s]), answer: '~x = ' + r + '~, ~x = ' + s + '~', ph: 'comma separated' },
        { key: 'ha', label: 'Horizontal asymptote  y =', check: AQ.numCheck(a), answer: '~y = ' + a + '~', ph: 'a number' },
        { key: 'xi', label: 'x-intercept(s)', check: AQ.setCheck([p, q]), answer: '~x = ' + p + '~, ~x = ' + q + '~', ph: 'comma separated' },
        { key: 'yi', label: 'y-intercept', check: AQ.numCheck(fval(y0), { roundedDecimal: true }), answer: '~' + fq(y0) + '~', ph: 'fraction or decimal (round to 3+ places)' },
        { key: 'cr', label: 'The graph crosses its horizontal asymptote at x =', check: cross === null ? AQ.setCheck([]) : AQ.numCheck(cross, { tol: 1e-6 }), answer: cross === null ? 'it never crosses' : '~' + fq(Fr(r * s - p * q, (r + s) - (p + q))) + '~', ph: 'a number, or none' }
      ],
      hints: ['Factor the top and bottom. Vertical asymptotes come from the zeros of the DENOMINATOR; x-intercepts from the zeros of the NUMERATOR.', 'Same degree on top and bottom? The horizontal asymptote is the ratio of the leading coefficients.', 'y-intercept: plug in x = 0. To test crossing: set f(x) equal to the asymptote’s y-value and solve. A solution means it crosses there.'],
      solution: [`~f(x) = {${a === 1 ? '' : a}${factorStr(p)}${factorStr(q)}|${factorStr(r)}${factorStr(s)}}~`, `Vertical: ~x = ${r}, ${s}~. Horizontal: ~y = ${a}~`, `x-intercepts: ~x = ${p}, ${q}~. y-intercept: ~${fq(y0)}~`, cross === null ? 'Setting f(x) = a leads to no solution, so no crossing' : `Setting ~f(x) = ${a}~ gives ~x = ${fq(Fr(r * s - p * q, (r + s) - (p + q)))}~`]
    };
    void f;
  }
};
G['rational-asym'] = function () {
  const v = rnd(0, 2);
  for (;;) {
    if (v === 0) {
      const k = nz(-6, 6), b = nz(-9, 9), c = nz(-9, 9); if ((k === 2 && b === 7 && c === -6) || k * k + b * k + c === 0) continue;
      return {
        prompt: `Find all asymptotes of ~f(x) = {${poly([1, b, c])}|${xp('x', -k)}}~.`,
        fields: [{ key: 'v', label: 'Vertical asymptote  x =', check: AQ.numCheck(k), answer: '~x = ' + k + '~', ph: 'a number' }, { key: 'o', label: 'Non-vertical asymptote  y =', check: AQ.exprCheck(x => x + b + k), answer: '~y = x ' + sgn(b + k) + '~', ph: 'like x + 3' }],
        hints: ['Set the denominator equal to 0 for the vertical asymptote.', 'The numerator’s degree is exactly one more than the denominator’s, so there’s an oblique (slanted) asymptote.', 'Divide (synthetic division works!) and throw away the remainder. The quotient is the line.'],
        solution: [`Vertical: ~x = ${k}~`, `Synthetic division with ~${k}~: bottom row ~${synth([1, b, c], k).join(', ')}~`, `Quotient ~x ${sgn(b + k)}~, so the oblique asymptote is ~y = x ${sgn(b + k)}~`]
      };
    }
    if (v === 1) {
      const a = rnd(1, 4), d = rnd(1, 4), r = nz(-6, 6), s = nz(-6, 6); if (r === s || AQ.gcd(a, d) === 0) continue;
      const num = [a, nz(-6, 6), nz(-9, 9)], den = fromRoots([r, s], d); if (polyEval(num, r) === 0 || polyEval(num, s) === 0) continue;
      const ha = Fr(a, d);
      return {
        prompt: `Find all asymptotes of ~f(x) = {${poly(num)}|${poly(den)}}~.`,
        fields: [{ key: 'v', label: 'Vertical asymptote(s)  x =', check: AQ.setCheck([r, s]), answer: '~x = ' + r + '~, ~x = ' + s + '~', ph: 'comma separated' }, { key: 'o', label: 'Horizontal asymptote  y =', check: AQ.numCheck(fval(ha), { roundedDecimal: true }), answer: '~y = ' + fq(ha) + '~', ph: 'fraction or decimal (round to 3+ places)' }],
        hints: ['Factor the denominator and set each factor to 0.', 'Compare the degrees of the top and bottom. They’re equal here.', 'When the degrees are equal, the horizontal asymptote is leading coefficient ÷ leading coefficient.'],
        solution: [`Denominator: ~${d === 1 ? '' : d}${factorStr(r)}${factorStr(s)}~`, `Vertical: ~x = ${r}, ${s}~`, `Horizontal: ~y = ${a}/${d} = ${fq(ha)}~`]
      };
    }
    const r = nz(-6, 6), s = nz(-6, 6); if (r === s) continue;
    const num = [nz(-4, 4), nz(-9, 9)], den = fromRoots([r, s]); if (polyEval(num, r) === 0 || polyEval(num, s) === 0) continue;
    return {
      prompt: `Find all asymptotes of ~f(x) = {${lin(num[0], num[1])}|${poly(den)}}~.`,
      fields: [{ key: 'v', label: 'Vertical asymptote(s)  x =', check: AQ.setCheck([r, s]), answer: '~x = ' + r + '~, ~x = ' + s + '~', ph: 'comma separated' }, { key: 'o', label: 'Horizontal asymptote  y =', check: AQ.numCheck(0), answer: '~y = 0~', ph: 'a number' }],
      hints: ['Factor the denominator and set each factor to 0.', 'Compare degrees. Which is bigger, the top or the bottom?', 'When the bottom has the higher degree, the graph flattens toward the x-axis.'],
      solution: [`Denominator: ~${factorStr(r)}${factorStr(s)}~`, `Vertical: ~x = ${r}, ${s}~`, 'Bottom degree is higher, so the horizontal asymptote is ~y = 0~']
    };
  }
};

/* ============ CHAPTER 4 ============ */
G['one-to-one'] = function () {
  if (Math.random() < 0.35) {
    const ins = shuffle([-4, -2, 0, 1, 3, 5, 6]).slice(0, 4), yes = Math.random() < 0.5;
    let outs = shuffle([-5, -3, -1, 2, 4, 7, 8]).slice(0, 4);
    if (!yes) outs[rnd(1, 3)] = outs[0];
    return {
      prompt: `Is this function one-to-one? ~{${ins.map((x, i) => pt(x, outs[i])).join(', ')}}~`,
      fields: [{ key: 'a', label: 'One-to-one?', kind: 'choice', options: [{ k: 'y', l: 'Yes' }, { k: 'n', l: 'No' }], check: AQ.choiceCheck(yes ? 'y' : 'n', 'One-to-one means no two inputs share the same OUTPUT. Check the y-values.'), answer: yes ? 'Yes' : 'No' }],
      hints: ['It’s already a function (no repeated x). One-to-one adds a second rule: no repeated y.', 'Scan the y-values for a repeat.'], solution: [yes ? 'All the y-values are different' : 'Two different inputs give the same output', yes ? 'One-to-one' : 'Not one-to-one']
    };
  }
  const h = rnd(-2, 2), k = rnd(-2, 2), T = [
    { eq: `f(x) = ${AQ.lin(pick([-2, -1, 1, 2]), k)}`, f: null, yes: true },
    { eq: `f(x) = (x ${h < 0 ? '+ ' + (-h) : '- ' + h})^2 ${sgn(k)}`.replace('(x - 0)', 'x'), f: x => (x - h) ** 2 + k, yes: false },
    { eq: `f(x) = x^3 ${sgn(k)}`, f: x => x ** 3 / 4 + k, yes: true },
    { eq: `f(x) = |x ${h < 0 ? '+ ' + (-h) : '- ' + h}|`, f: x => Math.abs(x - h), yes: false },
    { eq: `f(x) = sqrt(x + 5) ${sgn(k)}`, f: x => Math.sqrt(x + 5) + k, yes: true },
    { eq: `f(x) = 2^x ${sgn(k)}`, f: x => 2 ** x + k, yes: true }
  ];
  const t = pick(T); const fn = t.f || (() => { const m = Number(t.eq.match(/= (-?\d*)x/)[1] === '' ? 1 : t.eq.match(/= (-?\d*)x/)[1] === '-' ? -1 : t.eq.match(/= (-?\d*)x/)[1]); return x => m * x + k; })();
  const visual = AQ.plot({ xmin: -8, xmax: 8, ymin: -8, ymax: 8, step: 1, lab: 2, curves: [{ f: fn }], label: 'graph of ' + t.eq });
  return {
    visual, prompt: `The graph of ~${t.eq}~ is shown. Is it one-to-one?`,
    fields: [{ key: 'a', label: 'One-to-one?', kind: 'choice', options: [{ k: 'y', l: 'Yes' }, { k: 'n', l: 'No' }], check: AQ.choiceCheck(t.yes ? 'y' : 'n', 'Imagine sliding a horizontal line up and down. Can it ever hit the graph twice?'), answer: t.yes ? 'Yes' : 'No' }],
    hints: ['Use the HORIZONTAL line test: if any horizontal line touches the graph more than once, it is not one-to-one.', 'Picture lines at different heights. Does the graph ever turn around?'], solution: [t.yes ? 'No horizontal line hits the graph twice' : 'Some horizontal lines hit the graph twice', t.yes ? 'One-to-one' : 'Not one-to-one']
  };
};
G['inverse-fn'] = function () {
  const v = rnd(0, 3);
  for (;;) {
    if (v === 0) { const a = nz(-6, 6), b = nz(-9, 9); if (a === 4 && b === -2) continue; if (Math.abs(a) === 1) continue;
      return { prompt: `Find the inverse of ~f(x) = ${lin(a, b)}~.`, fields: one('f⁻¹(x) =', AQ.exprCheck(x => (x - b) / a), '~f^(-1)(x) = {x ' + sgn(-b) + '|' + a + '}~', 'like (x - 3)/2'),
        hints: ['Replace f(x) with y, then swap x and y.', 'Solve the new equation for y.', 'Name the result f⁻¹(x).'], solution: [`~y = ${lin(a, b)}~, swap: ~x = ${a}y ${sgn(b)}~`, `Solve for ~y~: ~y = {x ${sgn(-b)}|${a}}~`] }; }
    if (v === 1) { const a = nz(-5, 5), b = nz(-9, 9), c = rnd(2, 6); if (Math.abs(a) === c) continue;
      return { prompt: `Find the inverse of ~f(x) = {${lin(a, b)}|${c}}~.`, fields: one('f⁻¹(x) =', AQ.exprCheck(x => (c * x - b) / a), '~f^(-1)(x) = {' + c + 'x ' + sgn(-b) + '|' + a + '}~', 'like (4x - 1)/3'),
        hints: ['Replace f(x) with y and swap x and y.', 'Multiply both sides by the denominator first.', 'Then isolate y.'], solution: [`Swap: ~x = {${lin(a, b)}|${c}}~`, `~${c}x = ${lin(a, b).replace('x', 'y')}~`, `~y = {${c}x ${sgn(-b)}|${a}}~`] }; }
    if (v === 2) { const k = nz(-9, 9);
      return { prompt: `Find the inverse of ~f(x) = x^3 ${sgn(k)}~. (Cube root is typed cbrt( ).)`, fields: one('f⁻¹(x) =', AQ.exprCheck(x => Math.cbrt(x - k)), '~f^(-1)(x) = cbrt(x ' + sgn(-k) + ')~', 'like cbrt(x - 2)'),
        hints: ['Replace f(x) with y and swap x and y.', 'Undo the + constant first, then undo the cube with a cube root.'], solution: [`Swap: ~x = y^3 ${sgn(k)}~`, `~y^3 = x ${sgn(-k)}~`, `~y = cbrt(x ${sgn(-k)})~`] }; }
    const a = nz(-6, 6), b = nz(-6, 6); if (a === 4 && b === -2) continue;   // too close to the practice test's function
    return { prompt: `Find the inverse of ~f(x) = {${a}|x} ${sgn(b)}~.`, fields: one('f⁻¹(x) =', AQ.exprCheck(x => a / (x - b)), '~f^(-1)(x) = {' + a + '|x ' + sgn(-b) + '}~', 'like 3/(x - 1)'),
      hints: ['Replace f(x) with y and swap x and y.', 'Subtract the constant first, so the fraction stands alone.', 'Then solve for y. It’s in a denominator, so multiply it out.'], solution: [`Swap: ~x = {${a}|y} ${sgn(b)}~`, `~x ${sgn(-b)} = {${a}|y}~`, `~y = {${a}|x ${sgn(-b)}}~`] };
  }
};

G['exp-same-base'] = function () {
  for (;;) {
    if (Math.random() < 0.65) {
      const b = pick([2, 3, 5, 4, 10]), m = rnd(2, 5), p = nz(-5, 5), q = nz(-9, 9); if (b === 3 && p === -2 && q === 10 && m === 2) continue;
      if (Math.abs(Math.pow(b, m)) > 1e5) continue;
      const x = Fr(m - q, p); if (x.d > 5) continue;
      return { prompt: `Solve: ~${b}^(${lin(p, q)}) = ${Math.pow(b, m)}~`, fields: one('x =', AQ.numCheck(fval(x), { roundedDecimal: true }), '~x = ' + fq(x) + '~', 'fraction or decimal (round to 3+ places)'),
        hints: [`Write the right side as a power of ${b}.`, 'When the bases match, the exponents must be equal. Set them equal.', 'Solve the resulting linear equation.'], solution: [`~${Math.pow(b, m)} = ${b}^${m}~`, `~${lin(p, q)} = ${m}~`, `~x = ${fq(x)}~`] };
    }
    const bases = pick([[2, 4, 8, 16], [3, 9, 27, 81]]), u = rnd(1, 3), vv = rnd(1, 4), B1 = bases[u], B2 = bases[vv - 1 < bases.length ? vv - 1 : 0];
    void B2;
    const b1 = pick(bases.slice(1)), b2 = pick(bases.slice(1)), base0 = bases[0];
    const e1 = Math.round(Math.log(b1) / Math.log(base0)), e2 = Math.round(Math.log(b2) / Math.log(base0));
    const p = nz(-4, 4), q = nz(-6, 6), x = Fr(e2 - e1 * q, e1 * p); void B1; void u; void vv;
    if (x.d > 5) continue;
    return { prompt: `Solve: ~${b1}^(${lin(p, q)}) = ${b2}~`, fields: one('x =', AQ.numCheck(fval(x), { roundedDecimal: true }), '~x = ' + fq(x) + '~', 'fraction or decimal (round to 3+ places)'),
      hints: [`Both ${b1} and ${b2} are powers of ${base0}. Rewrite each one that way.`, 'Use (aᵐ)ⁿ = aᵐⁿ to combine exponents, then set the exponents equal.', 'Solve the linear equation that’s left.'], solution: [`~${b1} = ${base0}^${e1}~ and ~${b2} = ${base0}^${e2}~`, `~${e1}(${lin(p, q)}) = ${e2}~`, `~x = ${fq(x)}~`] };
  }
};
G['exp-logs'] = function () {
  for (;;) {
    const b = pick([2, 3, 5, 7]), c = rnd(3, 40);
    if (Math.random() < 0.5) {
      const k = nz(-8, 8); if (b === 3 && k === 6 && c === 4) continue; if (Number.isInteger(Math.log(c) / Math.log(b))) continue;
      const x = Math.log(c) / Math.log(b) - k;
      return { prompt: `Solve: ~${b}^(x ${sgn(k)}) = ${c}~. Give an exact answer or a decimal to 3 places.`, fields: one('x =', AQ.numCheck(x, { tol: 0.011 }), '~x = {ln ' + c + '|ln ' + b + '} ' + sgn(-k) + '~ ≈ ' + x.toFixed(3), 'like log(9)/log(2) - 3 or 0.17'),
        hints: ['The right side isn’t a nice power of the base, so take a logarithm of both sides.', 'Use the power rule to bring the exponent down: (x + k)·ln b = ln c.', 'Divide by ln b, then subtract k.'], solution: [`Take ln of both sides: ~(x ${sgn(k)}) ln ${b} = ln ${c}~`, `~x ${sgn(k)} = {ln ${c}|ln ${b}}~`, `~x ≈ ${x.toFixed(3)}~`] };
    }
    const a = rnd(2, 6), p = pick([1, 2, 3]), d = a * rnd(2, 20) + rnd(1, a - 1 || 1); if (Number.isInteger(Math.log(d / a) / Math.log(b))) continue;
    const x = Math.log(d / a) / (p * Math.log(b));
    return { prompt: `Solve: ~${a}·${b}^(${p === 1 ? '' : p}x) = ${d}~. Give a decimal to 3 places or an exact expression.`, fields: one('x =', AQ.numCheck(x, { tol: 0.011 }), '~x = {ln(' + d + '/' + a + ')|' + (p === 1 ? '' : p + ' ') + 'ln ' + b + '}~ ≈ ' + x.toFixed(3), 'like log(5)/log(2)'),
      hints: ['First divide both sides by the number out front so the exponential stands alone.', 'Take a log (or ln) of both sides and use the power rule.', 'Solve for x.'], solution: [`Divide by ${a}: ~${b}^(${p === 1 ? '' : p}x) = ${d}/${a}~`, `~${p === 1 ? '' : p + 'x·'}ln ${b} = ln(${d}/${a})~`, `~x ≈ ${x.toFixed(3)}~`] };
  }
};

const RATES = [3, 3.5, 4, 4.5, 5, 5.5, 6, 6.5, 7, 8, 9];
G['fv-interest'] = function () {
  const P = rnd(10, 90) * 500 + pick([0, 0, 250]), r = pick(RATES), t = rnd(2, 15), cont = Math.random() < 0.3, n = pick([1, 2, 4, 12]), nm = { 1: 'annually', 2: 'semiannually', 4: 'quarterly', 12: 'monthly' };
  const A = cont ? P * Math.exp(r / 100 * t) : P * Math.pow(1 + r / 100 / n, n * t);
  if (P === 47757) return G['fv-interest']();
  return {
    prompt: `Find the future value and the interest earned if ~${money(P)}~ is invested for ~${t}~ years at ~${r}%~ compounded ${cont ? 'continuously' : nm[n]}. Round to the nearest dollar.`,
    fields: [{ key: 'a', label: 'Future value ($)', check: AQ.numCheck(A, { tol: 1.01 }), answer: '~' + money(A) + '~', ph: 'dollars' }, { key: 'i', label: 'Interest earned ($)', check: AQ.numCheck(A - P, { tol: 1.01 }), answer: '~' + money(A - P) + '~', ph: 'dollars' }],
    hints: cont ? ['For continuous compounding use A = P·e^(rt). Write r as a decimal (5% = 0.05).', 'Enter e^(…) with your calculator’s e^x button (or exp).', 'Interest earned = future value - original principal.'] : ['Use A = P(1 + r/n)^(nt). Write r as a decimal (5% = 0.05).', `n is how many times per year it compounds (${nm[n]} → n = ${n}).`, 'Interest earned = future value - original principal.'],
    solution: cont ? [`~A = ${P}·e^(${r / 100}·${t})~`, `~A ≈ ${money(A)}~`, `Interest = ~${money(A)} - ${money(P)} = ${money(A - P)}~`] : [`~A = ${P}(1 + {${r / 100}|${n}})^(${n}·${t})~`, `~A ≈ ${money(A)}~`, `Interest = ~${money(A - P)}~`]
  };
};
G['present-value'] = function () {
  const A = rnd(2, 30) * 1000, r = pick(RATES), t = rnd(3, 20), n = pick([1, 2, 4, 12]), nm = { 1: 'annually', 2: 'semiannually', 4: 'quarterly', 12: 'monthly' };
  const P = A / Math.pow(1 + r / 100 / n, n * t);
  return {
    prompt: `Find the present value that will grow to ~${money(A)}~ in ~${t}~ years at ~${r}%~ compounded ${nm[n]}.`,
    fields: one('Present value ($)', AQ.numCheck(P, { tol: 1.01 }), '~' + money(P) + '~', 'dollars'),
    hints: ['Start from A = P(1 + r/n)^(nt) and solve for P.', 'Divide both sides by the growth factor (1 + r/n)^(nt).', 'Write r as a decimal.'], solution: [`~P = {A|(1 + r/n)^(nt)}~`, `~P = {${A}|(1 + ${r / 100}/${n})^(${n}·${t})}~`, `~P ≈ ${money(P)}~`]
  };
};
G['time-to-grow'] = function () {
  for (;;) {
    const P = rnd(2, 20) * 500, mult = pick([1.5, 2, 2.5, 3, 4, 5, 6]), A = P * mult, r = pick([3, 4, 5, 6, 7, 8, 9]), n = pick([1, 2, 4, 12]), cont = Math.random() < 0.3;
    const t = cont ? Math.log(A / P) / (r / 100) : Math.log(A / P) / (n * Math.log(1 + r / 100 / n));
    if (P === 2400 || (A === 10000 && r === 5 && n === 2)) continue;
    const nm = { 1: 'annually', 2: 'semiannually', 4: 'quarterly', 12: 'monthly' };
    return {
      prompt: `How many years will it take ~${money(P)}~ to grow to ~${money(A)}~ at ~${r}%~ compounded ${cont ? 'continuously' : nm[n]}? Round to the nearest tenth of a year.`,
      fields: one('t ≈ (years)', AQ.numCheck(t, { tol: 0.06 }), '~' + t.toFixed(1) + '~ years', 'like 12.4'),
      hints: [cont ? 'Use A = Pe^(rt). Divide by P first.' : 'Use A = P(1 + r/n)^(nt). Divide both sides by P first.', 'The unknown t is in the exponent, so take a natural log (or common log) of both sides.', 'The power rule brings the exponent down. Then divide to isolate t.'],
      solution: cont ? [`~${mult} = e^(${r / 100}t)~`, `~ln(${mult}) = ${r / 100}t~`, `~t = {ln ${mult}|${r / 100}} ≈ ${t.toFixed(1)}~`] : [`~${mult} = (1 + {${r / 100}|${n}})^(${n}t)~`, `~ln(${mult}) = ${n}t·ln(1 + {${r / 100}|${n}})~`, `~t ≈ ${t.toFixed(1)}~`]
    };
  }
};

const FRACROOTS = [[9, 1, 2, 3], [8, 1, 3, 2], [16, 1, 4, 2], [27, 1, 3, 3], [25, 1, 2, 5], [81, 1, 4, 3], [64, 1, 3, 4], [49, 1, 2, 7], [125, 1, 3, 5]];
function logPair() {
  if (Math.random() < 0.3) { const [b, , q, r] = pick(FRACROOTS); return { base: b, exp: 1 / q, expF: '{1|' + q + '}', res: r, resF: String(r), expS: '1/' + q }; }
  const b = pick([2, 3, 4, 5, 6, 7, 8, 9, 10]), y = pick([-3, -2, -1, 2, 3, 4, 5]);
  if (b === 5 && y === 2) return logPair(); if (Math.abs(Math.pow(b, y)) > 5000 || (b === 3 && y === -3)) return logPair();
  const res = Math.pow(b, y), resF = y < 0 ? '{1|' + Math.pow(b, -y) + '}' : String(res);
  return { base: b, exp: y, expF: String(y), res, resF, expS: String(y) };
}
G['exp-to-log'] = function () {
  const t = logPair();
  return {
    prompt: `Write in logarithmic form: ~${t.base}^(${t.expF}) = ${t.resF}~`,
    fields: one('Log form', AQ.logFormCheck(t.base, t.res, t.exp), '~log_' + t.base + '(' + t.resF + ') = ' + t.expF + '~', 'like log_2(8) = 3'),
    hints: ['Remember: the log answers the question “what exponent?”', 'The base of the exponential becomes the base of the log (the small subscript).', 'The exponent becomes what the log equals.'], solution: [`~b^y = x~ becomes ~log_b(x) = y~`, `~log_${t.base}(${t.resF}) = ${t.expF}~`]
  };
};
G['log-to-exp'] = function () {
  const t = logPair();
  return {
    prompt: `Write in exponential form: ~log_${t.base}(${t.resF}) = ${t.expF}~`,
    fields: one('Exponential form', AQ.expFormCheck(t.base, t.exp, t.res), '~' + t.base + '^(' + t.expF + ') = ' + t.resF + '~', 'like 2^3 = 8'),
    hints: ['The base of the log becomes the base of the power.', 'What the log equals is the exponent.', 'The number inside the log is the result.'], solution: [`~log_b(x) = y~ becomes ~b^y = x~`, `~${t.base}^(${t.expF}) = ${t.resF}~`]
  };
};

G['log-expand'] = function () {
  for (;;) {
    const b = pick([2, 3, 4, 5, 6, 7, 10]), vars = shuffle(['x', 'y', 'z', 't', 'w', 'a', 'c']).slice(0, 4);
    const nv = rnd(1, 2), dv = rnd(1, 2), nump = Array.from({ length: nv }, () => rnd(1, 5)), denp = Array.from({ length: dv }, () => rnd(1, 3));
    const nvs = vars.slice(0, nv), dvs = vars.slice(nv, nv + dv), root = Math.random() < 0.25 ? 3 : 1;
    const pw = (v, e) => v + (e > 1 ? '^' + e : '');
    const numS = nvs.map((v, i) => pw(v, nump[i])).join(''), denS = dvs.map((v, i) => pw(v, denp[i])).join('');
    const inner = '{' + numS + '|' + denS + '}';
    const argS = root === 3 ? 'cbrt(' + inner + ')' : inner;
    const f = e => { let s = 0; nvs.forEach((v, i) => { s += nump[i] * Math.log(e[v]); }); dvs.forEach((v, i) => { s -= denp[i] * Math.log(e[v]); }); return s / (root === 3 ? 3 : 1) / Math.log(b); };
    const cf = e => { const f = Fr(e, root); return (f.n === 1 && f.d === 1) ? '' : fq(f); };
    const parts = nvs.map((v, i) => cf(nump[i]) + 'log_' + b + ' ' + v).join(' + ') + dvs.map((v, i) => ' - ' + cf(denp[i]) + 'log_' + b + ' ' + v).join('');
    return {
      prompt: `Expand using the properties of logarithms (all variables positive): ~log_${b}(${argS})~`,
      fields: one('Expanded', AQ.exprCheck(f, { vars: vars.slice(0, nv + dv), domain: 'pos', after: s => (AQ.logAtomic(s) ? null : 'Expand fully: each log should contain just a single variable, with exponents moved out front.'), wrong: 'Not quite. Check which terms are added and which are subtracted, and that each exponent moved to the front.' }), '~' + parts + '~', 'like 2log_5(x) + 3log_5(y) - log_5(z)'),
      hints: ['Division becomes subtraction (quotient rule). Multiplication becomes addition (product rule).', 'Bring every exponent down in front of its log (power rule). A cube root is the exponent 1/3.', 'Type logs like log_5(x), and put each variable alone inside its own log.'],
      solution: [root === 3 ? 'Rewrite the cube root as a ^(1/3) power' : 'Split the quotient: top minus bottom', 'Split the products into sums', 'Move every exponent out front']
    };
  }
};
G['log-condense'] = function () {
  for (;;) {
    const varBase = Math.random() < 0.25, b = varBase ? 'x' : pick([2, 3, 4, 5, 6, 7, 10]);
    const names = varBase ? ['a', 'b', 'c'] : pick([['x', 'y', 'z'], ['a', 'b', 'c'], ['m', 'n', 't']]);
    const co = [rnd(1, 4), rnd(1, 4), rnd(1, 3)], form = rnd(0, 1);
    if (varBase && co[0] === 1 && co[1] === 3 && co[2] === 1) continue;
    const frac = Math.random() < 0.2 ? 2 : 1;
    const cs = co.map(c => (frac === 2 ? Fr(c, 2) : Fr(c)));
    const f = e => { const base = varBase ? e.x : b; return (fval(cs[0]) * Math.log(e[names[0]]) + fval(cs[1]) * Math.log(e[names[1]]) - fval(cs[2]) * Math.log(e[names[2]])) / Math.log(base); };
    const L = (n, c, first) => (c.n === 1 && c.d === 1 ? '' : fq(c)) + 'log_' + b + ' ' + n;
    const expr = form === 0 ? L(names[0], cs[0]) + ' + ' + L(names[1], cs[1]) + ' - ' + L(names[2], cs[2]) : L(names[0], cs[0]) + ' - ' + L(names[2], cs[2]) + ' + ' + L(names[1], cs[1]);
    const vars = varBase ? ['x', ...names] : names;
    const ans = 'log_' + b + '(' + names[0] + (cs[0].n === 1 && cs[0].d === 1 ? '' : '^(' + fa(cs[0]) + ')') + names[1] + (cs[1].n === 1 && cs[1].d === 1 ? '' : '^(' + fa(cs[1]) + ')') + ' / ' + names[2] + (cs[2].n === 1 && cs[2].d === 1 ? '' : '^(' + fa(cs[2]) + ')') + ')';
    return {
      prompt: `Write as a single logarithm with coefficient 1 (variables are positive): ~${expr}~`,
      fields: one('Single log', AQ.exprCheck(f, { vars, domain: 'pos', after: s => (AQ.logCount(s) !== 1 ? 'Condense it into ONE logarithm.' : (/^\s*(log|ln)/.test(s) ? null : 'Your single logarithm should have coefficient 1, with no number multiplying it.')), wrong: 'Not quite. Move each coefficient up as an exponent, then multiply the added logs and divide the subtracted one.' }), '~' + ans + '~', 'like log_3(x^2 y / z)'),
      hints: ['First use the power rule backwards: a coefficient in front becomes an exponent.', 'Added logs combine by MULTIPLYING arguments; subtracted logs by DIVIDING.', 'Finish with a single log, base unchanged, with nothing in front of it.'],
      solution: ['Power rule backwards: coefficients become exponents', 'Added → multiply, subtracted → divide', '~' + ans + '~']
    };
  }
};

G['log-eq-basic'] = function () {
  for (;;) {
    const b = pick([2, 3, 5, 10]), k = rnd(2, 4), p = rnd(1, 5), q = nz(-9, 9);
    if (b === 3 && p === 5 && q === 1 && k === 4) continue; if (Math.pow(b, k) > 1500) continue;
    const x = Fr(Math.pow(b, k) - q, p); if (x.d > 5) continue;
    return {
      prompt: `Solve: ~log_${b}(${lin(p, q)}) = ${k}~`,
      fields: one('x =', AQ.numCheck(fval(x), { roundedDecimal: true }), '~x = ' + fq(x) + '~', 'fraction or decimal (round to 3+ places)'),
      hints: ['Convert to exponential form: the base ' + b + ' raised to the log’s value equals the stuff inside.', 'Now solve the linear equation.', 'Check that what’s inside the log ends up positive.'],
      solution: [`Exponential form: ~${lin(p, q)} = ${b}^${k} = ${Math.pow(b, k)}~`, `~x = ${fq(x)}~`]
    };
  }
};
const LOGPAIRS = [[4, 2, 3], [8, 6, 4], [8, 4, 5], [16, 12, 6], [4, 3, 2], [8, 7, 3]];
G['log-eq-prop'] = function () {
  if (Math.random() < 0.5) {
    for (;;) {
      const b = rnd(2, 5), a = b + rnd(1, 5), c = rnd(1, 8); if (a === 5 && b === 2 && c === 3) continue;
      const x = Fr(b * c, a - b); if (x.d > 4) continue;
      return {
        prompt: `Solve: ~ln(${a}x) = ln(${b}) + ln(x + ${c})~`,
        fields: one('x =', AQ.numCheck(fval(x), { roundedDecimal: true }), '~x = ' + fq(x) + '~', 'fraction or decimal (round to 3+ places)'),
        hints: ['Combine the right side into ONE log using the product rule.', 'If ln(A) = ln(B) then A = B. Drop the logs.', 'Solve, then check that every log argument is positive.'],
        solution: [`Product rule: ~ln(${a}x) = ln(${b}(x + ${c}))~`, `~${a}x = ${b}x + ${b * c}~`, `~x = ${fq(x)}~`]
      };
    }
  }
  const [x1, k, m] = pick(LOGPAIRS), other = k - x1;
  return {
    prompt: `Solve: ~log_2(x) + log_2(x - ${k}) = ${m}~. Reject any solution that makes a log undefined.`,
    fields: one('x =', AQ.setCheck([x1], { bad: [{ val: other, msg: 'Check that value: it makes a log argument negative, so it’s extraneous. Throw it out.' }] }), '~x = ' + x1 + '~ (and ~' + other + '~ is extraneous)', 'the valid answer(s)'),
    hints: ['Combine the left side into one log (product rule).', 'Rewrite in exponential form, which gives you a quadratic.', 'Solve the quadratic, then test each answer in the ORIGINAL equation. You can’t take the log of a negative number.'],
    solution: [`~log_2(x(x - ${k})) = ${m}~`, `~x(x - ${k}) = ${Math.pow(2, m)}~ → ~x^2 - ${k}x - ${Math.pow(2, m)} = 0~`, `~x = ${x1}~ or ~x = ${other}~; the second makes ~log_2(x)~ undefined, so only ~x = ${x1}~ works`]
  };
};
if (typeof module !== 'undefined' && module.exports) module.exports = AQ;
})(typeof window !== 'undefined' ? window : globalThis);
