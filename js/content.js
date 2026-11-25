/* Algebra Workbook lessons. Text uses ~math~ segments (see AQ.H). All worked examples use their own numbers,
   different from the practice-test problems, and no answer to any practice-test problem appears anywhere. */
(function (root) {
'use strict';
const AQ = root.AQ = root.AQ || {};
const P = h => ({ t: 'p', h });
const R = (title, h) => ({ t: 'rule', title, h });
const T = h => ({ t: 'trap', h });
const TIP = h => ({ t: 'tip', h });
const E = (title, problem, steps) => ({ t: 'example', title, problem, steps });
const W = (id, title) => ({ t: 'widget', id, title });
const L = items => ({ t: 'list', items });
const SC = (label, pts, signs, note) => ({ t: 'signchart', label, pts, signs, note });

AQ.chapters = [
/* =============================================================== CHAPTER 1 */
{ n: 1, title: 'Equations & Inequalities', emoji: '🧮', color: 'teal',
  blurb: 'Solve almost anything with an x in it: linear, quadratic, rational, radical and absolute value equations, complex numbers, and inequalities in interval notation.',
  testMap: [
    [1, 'Solve a linear equation that needs distributing', 'c1-linear'], [2, 'Solve a formula for one variable', 'c1-linear'],
    [3, 'Money-mixture word problem (the Principal-Rate-Time-Interest table)', 'c1-apps'], [4, 'Add and subtract complex numbers', 'c1-complex'],
    [5, 'Divide complex numbers', 'c1-complex'], [6, 'Rectangle word problem that leads to a quadratic', 'c1-apps'],
    [7, 'Quadratic equation with complex solutions', 'c1-quad'], [8, 'Rational equation that turns into a quadratic', 'c1-rr'],
    [9, 'Radical equation (watch for a fake solution)', 'c1-rr'], [10, 'Equation that is quadratic in form (rational exponents)', 'c1-form'],
    [11, 'Compound inequality, answer in interval notation', 'c1-ineq'], [12, 'Rational inequality with a sign chart', 'c1-ineq'],
    [13, 'Quadratic inequality with a sign chart', 'c1-ineq'], [14, 'Absolute value equation', 'c1-abs']],
  topics: [
  { id: 'c1-linear', title: 'Linear Equations & Formulas', icon: '⚖️', tag: 'Isolate the variable like a pro', tests: [1, 2], practice: ['linear-eq', 'solve-formula'],
    cheat: ['Distribute, combine like terms, get x terms on one side, divide.', 'Solving a formula = the same steps, but with letters.'],
    learn: [
      P('An equation is a balance scale. Whatever you do to one side, you do to the other. Your mission is always the same: <b>get the variable alone</b>.'),
      R('The 4-step routine', 'Distribute any parentheses → combine like terms on each side → move variable terms to one side and plain numbers to the other → divide by the coefficient.'),
      E('Example: solve ~3(x - 2) + 4 = 5x - 8~', '~3(x - 2) + 4 = 5x - 8~', ['Distribute: ~3x - 6 + 4 = 5x - 8~', 'Combine like terms on the left: ~3x - 2 = 5x - 8~', 'Subtract ~3x~ from both sides: ~-2 = 2x - 8~', 'Add 8 to both sides: ~6 = 2x~', 'Divide by 2: ~x = 3~', 'Check: ~3(3 - 2) + 4 = 7~ and ~5(3) - 8 = 7~ ✓']),
      T('When you distribute a <b>minus sign</b> in front of a parenthesis, it flips EVERY sign inside: ~-(x - 4) = -x + 4~, not ~-x - 4~.'),
      P('<b>Solving a formula</b> for a letter is the exact same game. Treat every other letter like a number and isolate the one you want. If your target letter shows up in two terms, <b>factor it out</b> first.'),
      E('Example: solve ~A = P + Prt~ for ~r~', '~A = P + Prt~, for ~r~', ['The target ~r~ is only in one term. Subtract ~P~: ~A - P = Prt~', 'Divide both sides by ~Pt~ (everything multiplying ~r~): ~r = {A - P|Pt}~']),
      E('Example: solve ~y - y_1 = m(x - x_1)~ for ~x~', '~y - y_1 = m(x - x_1)~, for ~x~', ['Divide by ~m~ to undo the multiplication: ~{y - y_1|m} = x - x_1~', 'Add ~x_1~ to both sides: ~x = {y - y_1|m} + x_1~']),
      TIP('If the letter you want is in more than one term, get all those terms on one side and <b>factor the letter out</b> like a common factor. Then divide.')
    ] },
  { id: 'c1-apps', title: 'Word Problems: Mixtures & Area', icon: '📝', tag: 'Turn sentences into equations', tests: [3, 6], practice: ['interest-mix', 'rect-area'],
    cheat: ['Interest = Principal × Rate × Time (rate as a decimal).', 'Two accounts: one holds x, the other (total - x).', 'Reject negative lengths.'],
    learn: [
      P('Word problems are just equations in disguise. The trick is a calm routine: <b>name the unknown, write everything else in terms of it, and find the sentence that makes an equation.</b>'),
      R('Interest problems', 'Interest = Principal × Rate × Time. For one year, interest = principal × rate. Use a table with rows for each account and a total row.'),
      E('Example: $20,000 is split between a 6% account and a 10% account. After one year the interest is $1,520. How much was at 6%?', 'Total $20,000; rates 6% and 10%; interest $1,520', ['Let ~x~ = amount at 6%. Then ~20000 - x~ is at 10%.', 'Table: interest at 6% is ~0.06x~, interest at 10% is ~0.10(20000 - x)~', 'Interest adds up: ~0.06x + 0.10(20000 - x) = 1520~', 'Distribute: ~0.06x + 2000 - 0.10x = 1520~', 'Combine: ~-0.04x = -480~', 'Divide: ~x = 12000~. So $12,000 at 6% (and $8,000 at 10%).']),
      TIP('Check by plugging back in: ~0.06(12000) + 0.10(8000) = 720 + 800 = 1520~ ✓'),
      P('<b>Geometry problems</b> usually give you a relationship between sides and a total (area or perimeter). Write the formula first (Area = length × width), then substitute your expressions.'),
      E('Example: A rectangle’s length is 5 feet more than its width. Its area is 84 square feet. Find the dimensions.', 'length = width + 5; area 84', ['Let ~W~ = width. Length is ~W + 5~.', 'Area: ~W(W + 5) = 84~, so ~W^2 + 5W - 84 = 0~', 'Factor: ~(W + 12)(W - 7) = 0~, so ~W = -12~ or ~W = 7~', 'A width can’t be negative, so ~W = 7~.', 'Dimensions: width 7 ft, length 12 ft. Check: ~7 · 12 = 84~ ✓']),
      T('A quadratic gives two solutions, but only the ones that make sense in the story survive. Always say what your answer means with units.')
    ] },
  { id: 'c1-complex', title: 'Complex Numbers', icon: '🧙', tag: 'Meet i, the imaginary unit', tests: [4, 5], practice: ['cx-addsub', 'cx-mul', 'cx-div'],
    cheat: ['i = √(-1), i² = -1. Powers of i cycle every 4: i, -1, -i, 1.', '(a+bi)(a-bi) = a² + b².', 'Divide: multiply top and bottom by the conjugate of the bottom.'],
    learn: [
      P('We define <b>i = √(-1)</b>, so ~i^2 = -1~. A complex number looks like ~a + bi~: a real part ~a~ and an imaginary part ~b~.'),
      R('Add & subtract', 'Treat ~i~ like a variable: add real parts together and imaginary parts together. When subtracting, distribute the minus sign to <b>both</b> parts.'),
      E('Example: ~(2 + 5i) - (3 - 4i) + (-1 + i)~', '~(2 + 5i) - (3 - 4i) + (-1 + i)~', ['Remove parentheses, flipping signs of the subtracted one: ~2 + 5i - 3 + 4i - 1 + i~', 'Real parts: ~2 - 3 - 1 = -2~', 'Imaginary parts: ~5 + 4 + 1 = 10~ (so ~10i~)', 'Answer: ~-2 + 10i~']),
      R('Multiply', 'FOIL like normal, then replace ~i^2~ with ~-1~.'),
      E('Example: ~(3 + 2i)(1 - 4i)~', '~(3 + 2i)(1 - 4i)~', ['FOIL: ~3 - 12i + 2i - 8i^2~', 'Replace ~i^2 = -1~: ~3 - 12i + 2i + 8~', 'Combine: ~11 - 10i~']),
      R('Divide: use the conjugate', 'You can’t leave ~i~ in a denominator. The <b>conjugate</b> of ~c + di~ is ~c - di~. Multiply top and bottom by it. The bottom becomes the plain number ~c^2 + d^2~.'),
      E('Example: ~{3 + i|1 - 2i}~', '~{3 + i|1 - 2i}~', ['Conjugate of the bottom is ~1 + 2i~. Multiply top and bottom by it.', 'Top: ~(3 + i)(1 + 2i) = 3 + 6i + i + 2i^2 = 1 + 7i~', 'Bottom: ~(1 - 2i)(1 + 2i) = 1 + 4 = 5~', 'Split: ~{1|5} + {7|5}i~']),
      T('Don’t forget ~i^2 = -1~ in the middle of a product, and never leave a fraction with ~i~ on the bottom.'),
      P('<b>Powers of i</b> repeat in a cycle of four: ~i^1 = i~, ~i^2 = -1~, ~i^3 = -i~, ~i^4 = 1~, then it starts over. To simplify a big power, divide the exponent by 4 and use the remainder.')
    ] },
  { id: 'c1-quad', title: 'Quadratic Equations', icon: '🎯', tag: 'Factor, complete the square, or use the formula', tests: [7], practice: ['quad-real', 'quad-complex'],
    cheat: ['Quadratic formula: x = (-b ± √(b² - 4ac)) / 2a', 'Discriminant b² - 4ac: positive → 2 real, zero → 1 real, negative → 2 complex.', 'Complete the square: add (b/2)² to both sides.'],
    learn: [
      P('A quadratic equation looks like ~ax^2 + bx + c = 0~. You have three tools. Always <b>get 0 on one side first</b>.'),
      L(['<b>Factor</b> and use the zero-product rule (fastest when it works).', '<b>Complete the square</b> (always works; the tool behind the formula).', '<b>Quadratic formula</b> (always works, no thinking required).']),
      R('The quadratic formula', '~x = {-b ± sqrt(b^2 - 4ac)|2a}~. The part under the root, ~b^2 - 4ac~, is the <b>discriminant</b>. It tells you the kind of solutions before you solve.'),
      L(['Discriminant <b>positive</b> → two real solutions', 'Discriminant <b>zero</b> → one real solution (a double root)', 'Discriminant <b>negative</b> → two complex (imaginary) solutions, a conjugate pair']),
      E('Example (real roots): ~x^2 - 2x - 7 = 0~', '~x^2 - 2x - 7 = 0~', ['~a = 1~, ~b = -2~, ~c = -7~', 'Discriminant: ~(-2)^2 - 4(1)(-7) = 4 + 28 = 32~', '~x = {2 ± sqrt(32)|2} = {2 ± 4sqrt(2)|2} = 1 ± 2sqrt(2)~']),
      E('Example (complex roots): ~x^2 + 2x + 5 = 0~', '~x^2 + 2x + 5 = 0~', ['Discriminant: ~2^2 - 4(1)(5) = -16~', '~x = {-2 ± sqrt(-16)|2} = {-2 ± 4i|2}~', 'Divide each piece by 2: ~x = -1 ± 2i~']),
      T('A negative under the square root is not an error here. It just means complex answers: ~sqrt(-16) = 4i~. Also: divide the <b>whole</b> numerator by the 2 in the denominator.'),
      TIP('Complex roots of a real quadratic always come as a matching pair: ~p + qi~ and ~p - qi~.')
    ] },
  { id: 'c1-rr', title: 'Rational & Radical Equations', icon: '🕵️', tag: 'Beware of impostor solutions', tests: [8, 9], practice: ['rational-eq', 'radical-eq'],
    cheat: ['Rational: multiply by the LCD, solve, reject answers that make a denominator 0.', 'Radical: isolate the root, square both sides, solve, CHECK every answer.'],
    learn: [
      P('Both of these equation types can create <b>extraneous solutions</b>: answers that fall out of the algebra but don’t work in the original equation. So these problems always end with <b>checking</b>.'),
      R('Rational equations', 'Note what x can’t be (denominators ≠ 0). Multiply every term by the LCD to clear the fractions. Solve. Throw out anything that makes a denominator zero.'),
      E('Example: ~{3|x - 1} = {2|x + 2}~', '~{3|x - 1} = {2|x + 2}~  (x ≠ 1, x ≠ -2)', ['Cross-multiply (same as multiplying by the LCD): ~3(x + 2) = 2(x - 1)~', 'Distribute: ~3x + 6 = 2x - 2~', 'Solve: ~x = -8~', 'Check: neither denominator is zero at ~x = -8~ ✓']),
      E('Example (becomes a quadratic): ~1 - {1|x} - {12|x^2} = 0~', '~1 - {1|x} - {12|x^2} = 0~  (x ≠ 0)', ['Multiply every term by ~x^2~: ~x^2 - x - 12 = 0~', 'Factor: ~(x - 4)(x + 3) = 0~', '~x = 4~ or ~x = -3~. Both are allowed (neither is 0). ✓']),
      R('Radical equations', 'Isolate the square root on one side, square both sides, solve, then <b>plug every answer back into the ORIGINAL</b> equation.'),
      E('Example: ~sqrt(x + 6) = x~', '~sqrt(x + 6) = x~', ['The root is already alone. Square both sides: ~x + 6 = x^2~', 'Set to zero: ~x^2 - x - 6 = 0~, factor: ~(x - 3)(x + 2) = 0~', 'Check ~x = 3~: ~sqrt(9) = 3~ ✓', 'Check ~x = -2~: ~sqrt(4) = 2~, but the right side is ~-2~ ✗ (extraneous)', 'Answer: ~x = 3~ only']),
      T('Squaring both sides can turn a false statement into a true one (~2 = -2~ becomes ~4 = 4~). That’s exactly how extraneous solutions sneak in. Always check.')
    ] },
  { id: 'c1-form', title: 'Equations Quadratic in Form', icon: '🔀', tag: 'Spot the hidden quadratic', tests: [10], practice: ['sub-eq'],
    cheat: ['Let u = (the repeated chunk). Solve for u. Then undo the substitution.', 'x^(1/n) = u → x = u^n.'],
    learn: [
      P('Some equations look scary but are secretly quadratics. If the highest power of a chunk is the <b>square</b> of the middle chunk, substitute a new letter for the middle chunk.'),
      R('Substitution recipe', '1) Spot the pattern (one exponent is double the other). 2) Let ~u~ = the middle chunk. 3) Solve the quadratic in ~u~. 4) Replace ~u~ and solve for ~x~.'),
      E('Example: ~x^4 - 10x^2 + 9 = 0~', '~x^4 - 10x^2 + 9 = 0~', ['Notice ~x^4 = (x^2)^2~. Let ~u = x^2~.', 'Quadratic in ~u~: ~u^2 - 10u + 9 = 0~, so ~(u - 1)(u - 9) = 0~', '~u = 1~ or ~u = 9~', 'Undo: ~x^2 = 1~ gives ~x = ±1~, and ~x^2 = 9~ gives ~x = ±3~']),
      E('Example: ~x^(2/3) - 5x^(1/3) + 4 = 0~', '~x^(2/3) - 5x^(1/3) + 4 = 0~', ['Let ~u = x^(1/3)~, so ~x^(2/3) = u^2~', '~u^2 - 5u + 4 = 0~, so ~(u - 1)(u - 4) = 0~, giving ~u = 1~ or ~u = 4~', 'Undo by cubing: ~x = 1^3 = 1~ or ~x = 4^3 = 64~']),
      T('Don’t stop at the u-values. Those are not the answers to the original problem! Convert back to ~x~.'),
      TIP('To undo ~x^(1/n)~, raise both sides to the power ~n~. For odd roots you keep negative answers too (~(-2)^3 = -8~).')
    ] },
  { id: 'c1-ineq', title: 'Inequalities & Interval Notation', icon: '📏', tag: 'Number lines, brackets and sign charts', tests: [11, 12, 13], practice: ['compound-ineq', 'rational-ineq', 'quad-ineq'],
    cheat: ['Multiply/divide by a NEGATIVE → flip the inequality symbol.', '( ) for < or >, ∞; [ ] for ≤ or ≥.', 'Polynomial/rational inequality: boundary points → test each region.'],
    learn: [
      P('Inequalities work like equations with one new rule: <b>multiplying or dividing by a negative flips the symbol</b>. The answers are ranges, written in <b>interval notation</b>.'),
      W('intervalPainter', 'Interval painter: type an interval and see it on the number line'),
      L(['<b>Round bracket ( )</b>: the endpoint is NOT included (for < or >, and always for ±∞).', '<b>Square bracket [ ]</b>: the endpoint IS included (for ≤ or ≥).', 'Use <b>U</b> (union) to join separate pieces.']),
      E('Example (compound): ~1 ≤ -3x + 4 < 10~', '~1 ≤ -3x + 4 < 10~', ['Subtract 4 from all three parts: ~-3 ≤ -3x < 6~', 'Divide all parts by ~-3~ and FLIP both symbols: ~1 ≥ x > -2~', 'Read it from small to large: ~-2 < x ≤ 1~', 'Interval notation: ~(-2, 1]~']),
      R('Polynomial & rational inequalities (sign chart method)', '1) Move everything to one side so the other side is 0. 2) Find the boundary points: zeros of the top and zeros of the bottom. 3) Mark them on a number line. 4) Test a value in each region. 5) Keep the regions with the right sign, and decide on ( ) or [ ].'),
      E('Example: ~x^2 - x - 6 > 0~', '~x^2 - x - 6 > 0~', ['Factor: ~(x - 3)(x + 2) > 0~. Boundary points: ~-2~ and ~3~.', 'Test ~x = -3~: ~(−6)(−1) = 6~, positive ✓. Test ~x = 0~: ~(−3)(2) = −6~, negative ✗. Test ~x = 4~: ~(1)(6) = 6~, positive ✓.', 'Answer: ~(-∞, -2) U (3, ∞)~ (strict >, so round brackets)']),
      SC('(x - 3)(x + 2)', ['-2', '3'], ['+', '−', '+'], 'Signs of the product in each region'),
      E('Example (rational): ~{x + 1|x - 4} ≤ 0~', '~{x + 1|x - 4} ≤ 0~', ['Boundary points: top zero ~x = -1~, bottom zero ~x = 4~.', 'Test: left of ~-1~ the fraction is positive; between ~-1~ and ~4~ it’s negative; right of ~4~ it’s positive.', 'We want ≤ 0, so keep the middle region.', '~x = -1~ makes the fraction 0, so it’s included: <b>[ </b>. ~x = 4~ makes the bottom 0, so it’s never included: <b>)</b>.', 'Answer: ~[-1, 4)~']),
      T('Never include a value that makes a <b>denominator</b> zero, even for ≤ or ≥. And don’t just “multiply both sides by the denominator.” It might be negative!')
    ] },
  { id: 'c1-abs', title: 'Absolute Value', icon: '↔️', tag: 'Distance from zero', tests: [14], practice: ['abs-eq', 'abs-ineq'],
    cheat: ['|A| = c (c > 0) → A = c or A = -c.', '|A| < c → -c < A < c.  |A| > c → A < -c or A > c.', '|A| = negative → no solution.'],
    learn: [
      P('~|x|~ means “distance from zero,” so it’s never negative. That’s why an absolute value equation usually has <b>two</b> solutions: one on each side of zero.'),
      R('Solving |A| = c', '1) <b>Isolate</b> the absolute value first. 2) If the right side is negative → <b>no solution</b>. 3) Otherwise split: ~A = c~ OR ~A = -c~ and solve both.'),
      E('Example: ~2|x - 3| + 1 = 9~', '~2|x - 3| + 1 = 9~', ['Isolate: ~2|x - 3| = 8~, so ~|x - 3| = 4~', 'Split: ~x - 3 = 4~ or ~x - 3 = -4~', '~x = 7~ or ~x = -1~']),
      E('Example: ~|2x + 1| = 7~', '~|2x + 1| = 7~', ['~2x + 1 = 7~ gives ~x = 3~', '~2x + 1 = -7~ gives ~x = -4~']),
      T('~|x + 5| = -2~ has <b>no solution</b>. A distance can’t be negative. Don’t try to split it!'),
      R('Absolute value inequalities', '“Less than” stays in <b>one piece</b>: ~|A| < c~ means ~-c < A < c~. “Greater than” splits into <b>two pieces</b>: ~|A| > c~ means ~A < -c~ OR ~A > c~.'),
      TIP('Think of ~|x - 2| < 3~ as “the distance from 2 is less than 3”: ~-1 < x < 5~.')
    ] }
  ] },
/* =============================================================== CHAPTER 2 */
{ n: 2, title: 'Graphs & Functions', emoji: '📈', color: 'blue',
  blurb: 'Distance, midpoint, lines, circles, what makes a function a function, reading graphs, symmetry, and combining functions.',
  testMap: [
    [1, 'Distance between two points', 'c2-dm'], [2, 'Midpoint of two points', 'c2-dm'], [3, 'Equation of a line through two points', 'c2-lines'],
    [4, 'Circle all relations that are functions (pairs, graphs, tables)', 'c2-func'], [5, 'Graph a circle from its standard-form equation', 'c2-circle'],
    [6, 'Center and radius from a general-form equation', 'c2-circle'], [7, 'Increasing / decreasing / constant intervals from a graph', 'c2-read'],
    [8, 'Match a piecewise function to its graph', 'c2-piece'], [9, 'Write the equation of a graph', 'c2-read'],
    [10, 'Decide which symmetries an equation has', 'c2-sym'], [11, 'Evaluate (fg)(a)', 'c2-ops'], [12, 'Find (f − g)(x)', 'c2-ops'],
    [13, 'Evaluate (f ∘ g)(a)', 'c2-ops'], [14, 'Find (f ∘ g)(x)', 'c2-ops']],
  topics: [
  { id: 'c2-dm', title: 'Distance & Midpoint', icon: '📍', tag: 'Pythagoras on the coordinate plane', tests: [1, 2], practice: ['distance', 'midpoint'],
    cheat: ['d = √[(x₂ − x₁)² + (y₂ − y₁)²]', 'Midpoint = ((x₁ + x₂)/2, (y₁ + y₂)/2)'],
    learn: [
      P('The distance formula is just the <b>Pythagorean theorem</b> in disguise. The horizontal and vertical gaps are the legs of a right triangle, and the distance is the hypotenuse.'),
      R('Distance', '~d = sqrt((x_2 - x_1)^2 + (y_2 - y_1)^2)~'),
      E('Example: distance from ~(1, 2)~ to ~(7, 10)~', '~(1, 2)~ and ~(7, 10)~', ['Horizontal gap: ~7 - 1 = 6~. Vertical gap: ~10 - 2 = 8~.', '~d = sqrt(6^2 + 8^2) = sqrt(36 + 64) = sqrt(100)~', '~d = 10~']),
      E('Example (needs simplifying): ~(-2, 3)~ to ~(4, -1)~', '~(-2, 3)~ and ~(4, -1)~', ['Gaps: ~4 - (-2) = 6~ and ~-1 - 3 = -4~', '~d = sqrt(36 + 16) = sqrt(52)~', 'Simplify: ~sqrt(52) = sqrt(4 · 13) = 2sqrt(13)~']),
      T('Subtracting a negative: ~4 - (-2) = 6~, not 2. Put parentheses around negative numbers. And squaring makes negatives positive, so the order of the points doesn’t matter.'),
      R('Midpoint', 'The midpoint is the <b>average</b> of the x’s and the average of the y’s: ~({x_1 + x_2|2}, {y_1 + y_2|2})~'),
      E('Example: midpoint of ~(2, -3)~ and ~(8, 5)~', '~(2, -3)~ and ~(8, 5)~', ['x: ~{2 + 8|2} = 5~', 'y: ~{-3 + 5|2} = 1~', 'Midpoint: ~(5, 1)~'])
    ] },
  { id: 'c2-lines', title: 'Equations of Lines', icon: '📐', tag: 'Slope, intercepts, and y = mx + b', tests: [3], practice: ['line-two', 'line-slope-point'],
    cheat: ['m = (y₂ − y₁)/(x₂ − x₁)', 'Slope-intercept: y = mx + b (b = y-intercept).', 'Point-slope: y − y₁ = m(x − x₁)'],
    learn: [
      P('A line is described by its <b>slope</b> (steepness) and <b>y-intercept</b> (where it crosses the y-axis). Slope-intercept form is ~y = mx + b~.'),
      R('Slope', '~m = {y_2 - y_1|x_2 - x_1}~ = rise over run. Positive slope goes up to the right; negative goes down.'),
      E('Example: line through ~(-1, 5)~ and ~(3, -3)~', '~(-1, 5)~ and ~(3, -3)~', ['Slope: ~m = {-3 - 5|3 - (-1)} = {-8|4} = -2~', 'Plug the slope and one point into ~y = mx + b~: ~5 = -2(-1) + b~', '~5 = 2 + b~, so ~b = 3~', 'Equation: ~y = -2x + 3~', 'Check with the other point: ~-2(3) + 3 = -3~ ✓']),
      W('lineMatch', 'Line match: read two points off the target, find its equation, set the sliders'),
      TIP('Prefer <b>point-slope form</b>? ~y - y_1 = m(x - x_1)~ gets you there faster. Then distribute and move ~y_1~ over.'),
      T('Be consistent: subtract in the SAME order on top and bottom. ~{y_2 - y_1|x_2 - x_1}~ and ~{y_1 - y_2|x_1 - x_2}~ both work, but mixing them flips the sign.')
    ] },
  { id: 'c2-func', title: 'What Is a Function?', icon: '🎰', tag: 'One input, one output', tests: [4], practice: ['is-function'],
    cheat: ['Function: every x has exactly ONE y.', 'Vertical line test on graphs.', 'Repeated y-values are fine; repeated x with different y is not.'],
    learn: [
      P('A <b>function</b> is a machine: put an input ~x~ in, get exactly <b>one</b> output ~y~ out. A relation fails to be a function if one input can lead to two different outputs.'),
      R('How to test it', '<b>Ordered pairs:</b> any x repeated with a different y? Not a function. <b>Table:</b> same idea; check the input column. <b>Graph:</b> the <b>vertical line test</b>: if a vertical line ever hits the graph twice, it’s not a function. <b>Equation:</b> can one x give two y’s (like ~y = ±sqrt(x)~)?'),
      E('Example: is ~{(1, 4), (2, 4), (3, 7)}~ a function?', '~{(1, 4), (2, 4), (3, 7)}~', ['Look only at the inputs (x): 1, 2, 3. None repeat.', 'The output 4 appears twice, but that’s allowed.', 'Yes, it IS a function.']),
      E('Example: is ~x^2 + y^2 = 4~ a function of ~x~?', '~x^2 + y^2 = 4~', ['Try ~x = 0~: ~y^2 = 4~, so ~y = 2~ OR ~y = -2~.', 'One input gave two outputs, so it is NOT a function (it’s a circle: a vertical line hits it twice).']),
      T('Students often get it backwards: <b>two different inputs</b> sharing an output is fine. It’s one input with two outputs that breaks the rule.')
    ] },
  { id: 'c2-circle', title: 'Circles', icon: '⭕', tag: 'Center, radius, completing the square', tests: [5, 6], practice: ['circle-std', 'circle-general', 'circle-write'],
    cheat: ['(x − h)² + (y − k)² = r², center (h, k), radius r.', 'General form → complete the square for x and y.'],
    learn: [
      P('A circle is every point at a fixed distance (the <b>radius</b>) from a <b>center</b>. That’s literally the distance formula, set equal to ~r~.'),
      R('Standard form', '~(x - h)^2 + (y - k)^2 = r^2~ has center ~(h, k)~ and radius ~r~. The signs inside are <b>opposite</b> of the center’s coordinates, and the right side is ~r^2~.'),
      E('Example: ~(x + 1)^2 + (y - 3)^2 = 16~', '~(x + 1)^2 + (y - 3)^2 = 16~', ['~x + 1 = x - (-1)~, so ~h = -1~', '~y - 3~, so ~k = 3~', 'Center: ~(-1, 3)~. Radius: ~sqrt(16) = 4~']),
      W('circleMatch', 'Circle match: use the two labeled points to find the circle'),
      R('General form → standard form', 'Group the x terms and the y terms, move the constant, and <b>complete the square</b> for each: add ~({b|2})^2~ to BOTH sides.'),
      E('Example: ~x^2 + y^2 + 6x - 4y - 12 = 0~', '~x^2 + y^2 + 6x - 4y - 12 = 0~', ['Group: ~(x^2 + 6x) + (y^2 - 4y) = 12~', 'Half of 6 is 3, and ~3^2 = 9~. Half of -4 is -2, and ~(-2)^2 = 4~.', 'Add 9 and 4 to both sides: ~(x^2 + 6x + 9) + (y^2 - 4y + 4) = 12 + 9 + 4~', 'Factor: ~(x + 3)^2 + (y - 2)^2 = 25~', 'Center ~(-3, 2)~, radius ~5~']),
      T('The number on the right is ~r^2~. Take its square root for the radius. And remember to add the completed-square numbers to the <b>right side</b> too.')
    ] },
  { id: 'c2-read', title: 'Reading Graphs', icon: '🔍', tag: 'Increasing, decreasing, and graph → equation', tests: [7, 9], practice: ['inc-dec', 'graph-eq'],
    cheat: ['Read left to right: up = increasing, down = decreasing, flat = constant.', 'Intervals are in x-values, with ( ).', 'Vertex form y = a(x−h)²+k; absolute value y = a|x−h|+k.'],
    learn: [
      P('To describe how a function behaves, <b>read the graph left to right</b> (like text). Going uphill means increasing, downhill means decreasing, flat means constant.'),
      R('Writing intervals', 'Use the <b>x-values</b> where the behavior happens, in interval notation. Use round brackets because the function changes direction at the turning points. Example: increasing on ~(-4, 1)~ and decreasing on ~(1, 6)~.'),
      T('Intervals describe <b>x-values</b> (positions left to right), never y-values.'),
      P('<b>Finding an equation from a graph</b> means recognizing the shape and using the labeled points to pin down the numbers.'),
      L(['<b>Line</b> → compute the slope from two points, then find ~b~.', '<b>Parabola</b> → vertex form ~y = a(x - h)^2 + k~; use the vertex for ~h, k~ and another point for ~a~.', '<b>V-shape</b> → ~y = a|x - h| + k~ with the corner at ~(h, k)~.']),
      E('Example: a parabola has vertex ~(2, -1)~ and passes through ~(3, 1)~', 'vertex ~(2, -1)~, point ~(3, 1)~', ['Vertex form: ~y = a(x - 2)^2 - 1~', 'Plug in ~(3, 1)~: ~1 = a(1)^2 - 1~, so ~a = 2~', 'Equation: ~y = 2(x - 2)^2 - 1~'])
    ] },
  { id: 'c2-piece', title: 'Piecewise Functions', icon: '🧩', tag: 'Different rules for different x', tests: [8], practice: ['piecewise-eval'],
    cheat: ['Check which condition the x-value satisfies, then use ONLY that rule.', 'Solid dot for ≤ or ≥, open dot for < or >.'],
    learn: [
      P('A <b>piecewise function</b> uses different formulas on different parts of the x-axis. Like a speed limit that changes by zone.'),
      R('To evaluate f(a)', '1) Decide which condition ~a~ satisfies. 2) Use <b>only</b> that formula. 3) Ignore the other pieces.'),
      E('Example: ~f(x) = x + 3~ if ~x < 1~, and ~f(x) = 5 - x~ if ~x ≥ 1~. Find ~f(-2)~, ~f(1)~, ~f(4)~.', '~f(x) = x + 3~ for ~x < 1~; ~5 - x~ for ~x ≥ 1~', ['~-2 < 1~ → first rule: ~f(-2) = -2 + 3 = 1~', '~x = 1~ satisfies ~x ≥ 1~ (second rule): ~f(1) = 5 - 1 = 4~', '~4 ≥ 1~ → second rule: ~f(4) = 5 - 4 = 1~']),
      R('Graphing it', 'Graph each piece only on its own x-range. At a boundary, use a <b>solid dot</b> if that piece includes the boundary (≤ or ≥) and an <b>open dot</b> if it doesn’t (< or >).'),
      T('Boundaries are the trap. Read the symbols carefully: whichever rule has the “or equal to” owns the boundary point.')
    ] },
  { id: 'c2-sym', title: 'Symmetry', icon: '🦋', tag: 'Mirror, mirror…', tests: [10], practice: ['symmetry'],
    cheat: ['x-axis: replace y with −y, same equation?', 'y-axis: replace x with −x, same equation?', 'Origin: replace both, same equation?', 'Even function → y-axis symmetry; odd function → origin symmetry.'],
    learn: [
      P('A graph has <b>symmetry</b> if it can be flipped and land on itself. There are three kinds to test, and the test is always the same: <b>substitute and see if you get the same equation back</b>.'),
      L(['<b>y-axis symmetry</b>: replace ~x~ with ~-x~.', '<b>x-axis symmetry</b>: replace ~y~ with ~-y~.', '<b>Origin symmetry</b>: replace BOTH ~x~ with ~-x~ and ~y~ with ~-y~.']),
      E('Example: test ~y = x^4 - 3x^2~', '~y = x^4 - 3x^2~', ['y-axis: ~y = (-x)^4 - 3(-x)^2 = x^4 - 3x^2~, the same ✓', 'x-axis: ~-y = x^4 - 3x^2~ gives ~y = -x^4 + 3x^2~, different ✗', 'Origin: ~-y = x^4 - 3x^2~, different ✗', 'So only y-axis symmetry.']),
      TIP('Shortcut for polynomials: only <b>even</b> powers → y-axis symmetry. Only <b>odd</b> powers → origin symmetry. A mix → usually neither.'),
      T('If the equation is still “the same” only after multiplying everything by -1, that still counts as the same equation. Rewrite it and compare carefully.')
    ] },
  { id: 'c2-ops', title: 'Function Operations & Composition', icon: '🔗', tag: 'Combine functions like LEGO', tests: [11, 12, 13, 14], practice: ['fn-arith', 'fn-comp'],
    cheat: ['(f ± g)(x) = f(x) ± g(x);  (fg)(x) = f(x)·g(x);  (f/g)(x) = f(x)/g(x)', '(f ∘ g)(x) = f(g(x)): inner function first.', 'Composition is NOT commutative.'],
    learn: [
      P('You can add, subtract, multiply and divide functions: you just do the operation to their <b>outputs</b>.'),
      L(['~(f + g)(x) = f(x) + g(x)~', '~(f - g)(x) = f(x) - g(x)~ (distribute the minus!)', '~(fg)(x) = f(x) · g(x)~', '~({f|g})(x) = {f(x)|g(x)}~ (with ~g(x) ≠ 0~)']),
      E('Example: ~f(x) = 2x + 1~, ~g(x) = x^2 - 3~', '~f(x) = 2x + 1~ and ~g(x) = x^2 - 3~', ['~(f + g)(x) = 2x + 1 + x^2 - 3 = x^2 + 2x - 2~', '~(f - g)(x) = (2x + 1) - (x^2 - 3) = -x^2 + 2x + 4~', '~(fg)(2) = f(2) · g(2) = 5 · 1 = 5~']),
      R('Composition', '~(f ∘ g)(x) = f(g(x))~. Work from the <b>inside out</b>: plug ~g(x)~ into ~f~ wherever you see ~x~.'),
      E('Example: same ~f~ and ~g~', '~f(x) = 2x + 1~, ~g(x) = x^2 - 3~', ['~(f ∘ g)(x) = f(g(x)) = 2(x^2 - 3) + 1 = 2x^2 - 5~', '~(g ∘ f)(x) = g(f(x)) = (2x + 1)^2 - 3 = 4x^2 + 4x - 2~', 'Notice the answers are different: order matters!', 'To evaluate ~(f ∘ g)(2)~: first ~g(2) = 1~, then ~f(1) = 3~.']),
      T('~(2x + 1)^2~ is NOT ~4x^2 + 1~. Square the whole thing: ~(2x + 1)(2x + 1)~. And write the substituted expression in parentheses before you simplify.')
    ] }
  ] },
/* =============================================================== CHAPTER 3 */
{ n: 3, title: 'Polynomial & Rational Functions', emoji: '📊', color: 'gold',
  blurb: 'Parabolas and their maximums, dividing polynomials, the Remainder and Factor Theorems, end behavior, and asymptotes of rational functions.',
  testMap: [
    [1, 'Parabola: opens, vertex, intercepts, and picking its graph', 'c3-quad'], [2, 'Maximum profit word problem', 'c3-quad'],
    [3, 'Divide with synthetic division', 'c3-synth'], [4, 'Use the Remainder Theorem to find f(k)', 'c3-synth'],
    [5, 'Use the Factor Theorem (is it a factor?)', 'c3-factor'], [6, 'Factor into linear factors given one zero', 'c3-factor'],
    [7, 'Choose the correct end-behavior diagram', 'c3-end'], [8, 'Write a polynomial equation from its graph', 'c3-end'],
    [9, 'Factored polynomial: end behavior, intercepts, multiplicities, graph', 'c3-end'], [10, 'Rational function: asymptotes, intercepts, crossing, graph', 'c3-rational'],
    [11, 'Find all asymptotes of a rational function', 'c3-rational']],
  topics: [
  { id: 'c3-quad', title: 'Quadratic Functions & Max/Min', icon: '🌈', tag: 'Parabolas from every angle', tests: [1, 2], practice: ['parabola-features', 'max-profit'],
    cheat: ['f(x) = ax² + bx + c: opens up if a > 0, down if a < 0.', 'Vertex x = −b/(2a); y = f(that x).', 'y-intercept: f(0) = c. x-intercepts: solve f(x) = 0.', 'Max/min value = the vertex’s y-value.'],
    learn: [
      P('The graph of ~f(x) = ax^2 + bx + c~ is a <b>parabola</b>. Five facts describe it completely.'),
      L(['<b>Direction:</b> ~a > 0~ opens up (a valley); ~a < 0~ opens down (a hill).', '<b>Vertex:</b> the turning point. Its x-coordinate is ~x = {-b|2a}~; plug that back in for the y.', '<b>Axis of symmetry:</b> the vertical line through the vertex.', '<b>y-intercept:</b> let ~x = 0~: it’s just ~c~.', '<b>x-intercepts:</b> set ~f(x) = 0~ and solve. There may be 0, 1 or 2 of them.']),
      E('Example: ~f(x) = x^2 - 6x + 5~', '~f(x) = x^2 - 6x + 5~', ['~a = 1 > 0~, so it opens up.', 'Vertex x: ~{-(-6)|2(1)} = 3~. Then ~f(3) = 9 - 18 + 5 = -4~. Vertex ~(3, -4)~.', 'y-intercept: ~f(0) = 5~.', 'x-intercepts: ~x^2 - 6x + 5 = 0~ gives ~(x - 1)(x - 5) = 0~, so ~x = 1~ and ~x = 5~.']),
      W('parabolaMatch', 'Parabola match: adjust a, h and k until you cover the target'),
      R('Max / min word problems', 'If profit (or height) is a downward parabola, the best value happens at the vertex. The <b>x</b> of the vertex tells you <i>how many</i> / <i>when</i>; the <b>y</b> tells you the maximum value.'),
      E('Example: ~R(x) = -2x^2 + 40x~ (revenue in dollars, x items)', '~R(x) = -2x^2 + 40x~', ['Opens down (~a = -2~), so the vertex is a maximum.', '~x = {-40|2(-2)} = 10~ items', '~R(10) = -2(100) + 400 = 200~ dollars is the maximum revenue']),
      T('Two different questions, two different numbers: “how many to sell” is the vertex’s <b>x</b>; “what is the maximum profit” is the vertex’s <b>y</b>. Read what the question asks!')
    ] },
  { id: 'c3-synth', title: 'Synthetic Division & Remainder Theorem', icon: '⚡', tag: 'The fast way to divide polynomials', tests: [3, 4], practice: ['synth-div', 'remainder'],
    cheat: ['Synthetic division only works for divisors (x − k). Corner number = k.', 'Zero for any missing power!', 'Remainder Theorem: f(k) = remainder when dividing by (x − k).'],
    learn: [
      P('<b>Synthetic division</b> is a shortcut for dividing a polynomial by a linear factor ~x - k~. It’s all small arithmetic.'),
      R('The recipe', '1) Write the coefficients in a row, using ~0~ for any missing power. 2) Put ~k~ in the corner (<b>the zero of the divisor</b>: for ~x + 3~, use ~-3~). 3) Bring down the first coefficient. 4) Multiply it by ~k~, write under the next coefficient, add. Repeat. 5) The last number is the <b>remainder</b>; the others are the quotient’s coefficients (one degree lower).'),
      E('Example: divide ~2x^3 - 5x^2 + x + 6~ by ~x - 2~', '~(2x^3 - 5x^2 + x + 6) ÷ (x - 2)~', ['Coefficients: ~2, -5, 1, 6~. Corner number: ~2~.', 'Bring down ~2~. Multiply: ~2 · 2 = 4~. Add to ~-5~: ~-1~.', 'Multiply: ~2 · (-1) = -2~. Add to ~1~: ~-1~.', 'Multiply: ~2 · (-1) = -2~. Add to ~6~: ~4~.', 'Bottom row: ~2, -1, -1 | 4~', 'Quotient: ~2x^2 - x - 1~, remainder ~4~. So ~{2x^3 - 5x^2 + x + 6|x - 2} = 2x^2 - x - 1 + {4|x - 2}~']),
      R('Remainder Theorem', 'When you divide ~f(x)~ by ~x - k~, the remainder equals ~f(k)~. So synthetic division is also a fast way to <b>evaluate</b> a polynomial!'),
      E('Example: find ~f(3)~ for ~f(x) = x^3 - 4x + 1~', '~f(x) = x^3 - 4x + 1~, ~k = 3~', ['Include the missing ~x^2~ term as ~0~: coefficients ~1, 0, -4, 1~', 'Bring down ~1~; ~1·3 = 3~, ~0 + 3 = 3~; ~3·3 = 9~, ~-4 + 9 = 5~; ~5·3 = 15~, ~1 + 15 = 16~', 'Remainder ~16~, so ~f(3) = 16~. (Check: ~27 - 12 + 1 = 16~ ✓)']),
      T('Missing powers need a <b>0 placeholder</b>. And for a divisor like ~x + 3~ the corner number is ~-3~ (the opposite sign).')
    ] },
  { id: 'c3-factor', title: 'Factor Theorem & Factoring', icon: '🔓', tag: 'Zeros are factors in disguise', tests: [5, 6], practice: ['factor-yn', 'factor-zero'],
    cheat: ['Factor Theorem: (x − k) is a factor ⇔ f(k) = 0 ⇔ remainder 0.', 'Given a zero: divide it out, factor the quotient.'],
    learn: [
      P('The <b>Factor Theorem</b> connects zeros and factors: ~x - k~ is a factor of ~f(x)~ exactly when ~f(k) = 0~, that is, when the remainder is zero.'),
      E('Example: is ~x - 1~ a factor of ~x^3 - 7x + 6~?', '~x^3 - 7x + 6~, test ~x - 1~', ['Synthetic division with ~1~ on ~1, 0, -7, 6~: bottom row ~1, 1, -6 | 0~', 'Remainder 0, so YES, ~x - 1~ is a factor.', 'And we got the quotient for free: ~x^2 + x - 6~.']),
      R('Factoring when you know a zero', '1) Divide by ~(x - k)~ using synthetic division. 2) Factor the quotient (a quadratic) the usual way. 3) Write the product of ALL the linear factors.'),
      E('Continuing the example', '~x^3 - 7x + 6~ with zero ~1~', ['Quotient: ~x^2 + x - 6 = (x + 3)(x - 2)~', 'Full factorization: ~(x - 1)(x + 3)(x - 2)~', 'Zeros: ~1, -3, 2~']),
      TIP('Not given a zero? Try small whole-number guesses (±1, ±2, factors of the constant term). Plugging in or doing a quick synthetic division tells you if one works.')
    ] },
  { id: 'c3-end', title: 'End Behavior & Polynomial Graphs', icon: '🎢', tag: 'Leading terms, zeros and multiplicities', tests: [7, 8, 9], practice: ['end-behavior', 'poly-from-graph', 'multiplicity'],
    cheat: ['Leading term ax^n decides the ends.', 'Even n: ends match (a > 0 both up, a < 0 both down). Odd n: ends opposite (a > 0: left down, right up).', 'Odd multiplicity: crosses. Even multiplicity: touches/bounces.', 'y-intercept: plug in x = 0.'],
    learn: [
      P('Far to the left and right, a polynomial’s graph is controlled by only its <b>leading term</b> ~a x^n~ (the highest power). The rest are too small to matter out there.'),
      W('endBehaviorLab', 'End-behavior lab: change the degree and the sign of the leading coefficient'),
      R('End behavior rules', '<b>Even degree:</b> both ends go the same way: up if ~a > 0~, down if ~a < 0~. <b>Odd degree:</b> the ends go opposite ways: if ~a > 0~ the left goes down and the right goes up (flip for ~a < 0~).'),
      T('If the terms aren’t written in order, hunt for the <b>highest power</b>. The first term you see isn’t always the leading one.'),
      R('Zeros and multiplicity', 'If ~(x - r)^m~ is a factor, then ~r~ is a zero of <b>multiplicity ~m~</b>. <b>Odd</b> multiplicity: the graph crosses the x-axis there. <b>Even</b> multiplicity: the graph touches the axis and bounces back. Higher multiplicity flattens the graph near the zero.'),
      W('multiplicityLab', 'Multiplicity lab: choose how many times each zero is repeated'),
      E('Example: analyze ~f(x) = -(x + 1)(x - 2)^2~', '~f(x) = -(x + 1)(x - 2)^2~', ['Degree: ~1 + 2 = 3~ (odd). Leading coefficient ~-1~ (negative). So the left goes up and the right goes down.', 'Zeros: ~x = -1~ (multiplicity 1, crosses) and ~x = 2~ (multiplicity 2, touches).', 'y-intercept: ~f(0) = -(1)(4) = -4~.']),
      R('Equation from a graph', 'Each x-intercept ~r~ gives a factor ~(x - r)~. Write ~f(x) = a(x - r_1)(x - r_2)...~, then plug in one more point (often the y-intercept) to find ~a~.'),
      E('Example: zeros ~-1~, ~2~ and ~4~, y-intercept ~(0, 16)~', 'zeros ~-1, 2, 4~; passes through ~(0, 16)~', ['~f(x) = a(x + 1)(x - 2)(x - 4)~', 'Plug in ~(0, 16)~: ~16 = a(1)(-2)(-4) = 8a~, so ~a = 2~', '~f(x) = 2(x + 1)(x - 2)(x - 4)~'])
    ] },
  { id: 'c3-rational', title: 'Rational Functions & Asymptotes', icon: '🚧', tag: 'Graphs with invisible walls', tests: [10, 11], practice: ['rational-asym', 'rational-features'],
    cheat: ['Vertical asymptote: zeros of the denominator (that aren’t cancelled).', 'Compare degrees: top < bottom → y = 0; equal → y = ratio of leading coefficients; top = bottom + 1 → oblique, divide.', 'x-intercepts: zeros of the numerator. y-intercept: f(0).', 'Crossing an asymptote: set f(x) = asymptote and solve.'],
    learn: [
      P('A <b>rational function</b> is a fraction of polynomials, ~f(x) = {p(x)|q(x)}~. Where the denominator is 0, the function blows up, and that creates <b>asymptotes</b>: lines the graph hugs but doesn’t (usually) touch.'),
      W('rationalLab', 'Rational lab: move the zeros and poles and watch the asymptotes'),
      R('Vertical asymptotes', 'Set the denominator equal to 0 and solve (after canceling common factors). Each solution is a vertical asymptote ~x = r~.'),
      R('Horizontal / oblique asymptote (compare degrees)', '<b>Top degree smaller</b>: ~y = 0~. <b>Equal degrees</b>: ~y =~ (leading coefficient of top) ÷ (leading coefficient of bottom). <b>Top degree exactly one more</b>: an <b>oblique</b> (slanted) asymptote; divide the polynomials (synthetic division) and drop the remainder. <b>Top degree two or more higher</b>: no horizontal asymptote.'),
      E('Example: ~f(x) = {x^2 - 9|x^2 - 4}~', '~f(x) = {x^2 - 9|x^2 - 4}~', ['Factor: ~{(x - 3)(x + 3)|(x - 2)(x + 2)}~. No common factors.', 'Vertical asymptotes: ~x = 2~ and ~x = -2~.', 'Equal degrees, leading coefficients ~1/1~: horizontal asymptote ~y = 1~.', 'x-intercepts: ~x = 3, -3~. y-intercept: ~f(0) = {-9|-4} = {9|4}~.']),
      E('Example (oblique): ~f(x) = {x^2 - 3x + 1|x + 2}~', '~f(x) = {x^2 - 3x + 1|x + 2}~', ['Vertical asymptote: ~x = -2~.', 'Top degree is one more than the bottom, so divide. Synthetic division with ~-2~ on ~1, -3, 1~: bottom row ~1, -5 | 11~', 'Quotient ~x - 5~, so the oblique asymptote is ~y = x - 5~ (ignore the remainder).']),
      R('Does it cross its asymptote?', 'A graph can never cross a vertical asymptote, but it <b>can</b> cross a horizontal or oblique one. To test: set ~f(x)~ equal to the asymptote’s equation and solve. A solution is an x-value where it crosses; no solution means it never does. Show this work.'),
      T('Cancel common factors <b>first</b>: a canceled factor gives a hole, not an asymptote. And horizontal asymptotes depend only on the leading terms, not on the other coefficients.')
    ] }
  ] },
/* =============================================================== CHAPTER 4 */
{ n: 4, title: 'Exponential & Logarithmic Functions', emoji: '🚀', color: 'violet',
  blurb: 'Inverse functions, exponential growth and compound interest, logarithms and their properties, and solving exponential and log equations.',
  testMap: [
    [1, 'Is this graph one-to-one?', 'c4-inverse'], [2, 'Find the inverse of a function', 'c4-inverse'],
    [3, 'Solve an exponential equation by matching bases', 'c4-exp'], [4, 'Future value with compound interest', 'c4-interest'],
    [5, 'Write an exponential equation in logarithmic form', 'c4-logform'], [6, 'Write a logarithmic equation in exponential form', 'c4-logform'],
    [7, 'Expand a logarithm', 'c4-logprops'], [8, 'Condense logarithms into one', 'c4-logprops'],
    [9, 'Solve an exponential equation that needs logarithms', 'c4-exp'], [10, 'Solve a logarithmic equation (log rules)', 'c4-logeq'],
    [11, 'Solve a logarithmic equation (exponential form)', 'c4-logeq'], [12, 'How long until money grows to a target?', 'c4-interest']],
  topics: [
  { id: 'c4-inverse', title: 'One-to-One Functions & Inverses', icon: '🪞', tag: 'Undoing a function', tests: [1, 2], practice: ['one-to-one', 'inverse-fn'],
    cheat: ['One-to-one ⇔ passes the horizontal line test.', 'Inverse: replace f(x) with y, swap x and y, solve for y.', 'Graph of f⁻¹ is the mirror image of f across y = x.'],
    learn: [
      P('A function is <b>one-to-one</b> if different inputs always give different outputs. Only one-to-one functions have inverses, because an inverse has to “undo” the function without ambiguity.'),
      R('Horizontal line test', 'If any horizontal line crosses the graph more than once, the function is NOT one-to-one.'),
      R('Finding an inverse', '1) Replace ~f(x)~ with ~y~. 2) <b>Swap</b> ~x~ and ~y~. 3) Solve for ~y~. 4) Write ~f^(-1)(x)~.'),
      E('Example: inverse of ~f(x) = 3x + 5~', '~f(x) = 3x + 5~', ['~y = 3x + 5~', 'Swap: ~x = 3y + 5~', 'Solve for ~y~: ~x - 5 = 3y~, so ~y = {x - 5|3}~', '~f^(-1)(x) = {x - 5|3}~']),
      W('inverseMirror', 'Inverse mirror: watch a function and its inverse reflect across y = x'),
      TIP('Check yourself: ~f(f^(-1)(x))~ should simplify to just ~x~. Also, ~f^(-1)~ does NOT mean ~{1|f}~. The “-1” is not an exponent here.'),
      T('~f^(-1)(x)~ means “inverse function.” It is NOT the reciprocal ~{1|f(x)}~.')
    ] },
  { id: 'c4-exp', title: 'Exponential Equations', icon: '🌱', tag: 'Variables in the exponent', tests: [3, 9], practice: ['exp-same-base', 'exp-logs'],
    cheat: ['Same base ⇒ set exponents equal: bᵐ = bⁿ ⇒ m = n.', 'Can’t match bases? Take ln (or log) of both sides and use the power rule.', 'Isolate the exponential before taking the log.'],
    learn: [
      P('In an <b>exponential equation</b> the unknown lives in the exponent. There are two strategies, and picking the right one saves lots of work.'),
      R('Strategy 1: match the bases', 'If both sides can be written with the <b>same base</b>, the exponents must be equal: if ~b^m = b^n~ then ~m = n~.'),
      E('Example: ~2^(x + 1) = 16~', '~2^(x + 1) = 16~', ['Write ~16 = 2^4~.', '~2^(x + 1) = 2^4~, so ~x + 1 = 4~', '~x = 3~']),
      R('Strategy 2: take a log of both sides', 'If you can’t match the bases, take ~ln~ (or ~log~) of both sides, use the <b>power rule</b> to bring the exponent down, and solve.'),
      E('Example: ~5^x = 20~', '~5^x = 20~', ['Take ln of both sides: ~ln(5^x) = ln 20~', 'Power rule: ~x · ln 5 = ln 20~', '~x = {ln 20|ln 5} ≈ 1.861~']),
      T('~ln 20 ÷ ln 5~ is NOT ~ln(20 ÷ 5)~. Keep the logs as separate numbers on your calculator, then divide.'),
      TIP('If there’s a number multiplying the exponential (like ~3 · 2^x = 24~), divide it away FIRST so the exponential is alone, then use a log.')
    ] },
  { id: 'c4-interest', title: 'Compound Interest', icon: '🏦', tag: 'Money that makes money', tests: [4, 12], practice: ['fv-interest', 'present-value', 'time-to-grow'],
    cheat: ['A = P(1 + r/n)^(nt)  (n times per year)', 'A = Pe^(rt)  (continuous)', 'Rates as decimals: 6% = 0.06.', 'Solving for t → use a log.'],
    learn: [
      P('When interest is added to the balance and then earns interest itself, that’s <b>compound interest</b>. How often it compounds matters.'),
      R('Formulas', '<b>n times per year:</b> ~A = P(1 + {r|n})^(nt)~. <b>Continuously:</b> ~A = Pe^(rt)~. Here ~P~ is the starting amount, ~r~ the annual rate as a <b>decimal</b>, ~t~ the years, and ~A~ the final amount.'),
      L(['Annually: ~n = 1~', 'Semiannually: ~n = 2~', 'Quarterly: ~n = 4~', 'Monthly: ~n = 12~']),
      W('growthLab', 'Growth lab: how much does the compounding frequency matter? (starting from $1,000)'),
      E('Example: $5,000 at 6% for 3 years, compounded quarterly', '~P = 5000, r = 0.06, n = 4, t = 3~', ['~A = 5000(1 + {0.06|4})^(4 · 3) = 5000(1.015)^12~', '~(1.015)^12 ≈ 1.19562~, so ~A ≈ $5,978.09~', 'Interest earned: ~5978.09 - 5000 = $978.09~']),
      E('Example: how long for $2,000 to reach $5,000 at 7% compounded monthly?', '~2000 → 5000~, ~r = 0.07~, ~n = 12~', ['~5000 = 2000(1 + {0.07|12})^(12t)~', 'Divide by 2000: ~2.5 = (1.005833…)^(12t)~', 'Take ln: ~ln 2.5 = 12t · ln(1.005833…)~', '~t = {ln 2.5|12 ln(1.005833…)} ≈ 13.1~ years']),
      T('Use the decimal form of the rate (0.06, not 6) and don’t round the middle steps. Keep full calculator precision until the very end.')
    ] },
  { id: 'c4-logform', title: 'Logarithms ↔ Exponents', icon: '🔄', tag: 'Two ways to say the same thing', tests: [5, 6], practice: ['exp-to-log', 'log-to-exp'],
    cheat: ['y = log_b(x) ⇔ bʸ = x', 'log_b(b) = 1, log_b(1) = 0', 'A log is an exponent: “what power of b gives x?”'],
    learn: [
      P('A <b>logarithm</b> answers the question “<i>what exponent do I need?</i>” So ~log_2(8) = 3~ because ~2^3 = 8~. Logs and exponents are two ways to write the same fact.'),
      R('The conversion rule', '~y = log_b(x)~  ⇔  ~b^y = x~. The <b>base</b> stays the base, the log’s <b>value</b> is the exponent, and the number <b>inside</b> the log is the result.'),
      E('Example: exponential → log', '~2^5 = 32~', ['Base is ~2~, exponent is ~5~, result is ~32~', 'Log form: ~log_2(32) = 5~']),
      E('Example: log → exponential', '~log_7(49) = 2~', ['Base ~7~, value ~2~, inside ~49~', 'Exponential form: ~7^2 = 49~']),
      W('expLogLab', 'Exp & log lab: see why b^x and log_b(x) are mirror images'),
      TIP('Handy: ~log_b(b) = 1~ and ~log_b(1) = 0~ for any valid base. Also ~log~ with no base means base 10, and ~ln~ means base ~e~.'),
      T('You can’t take the log of zero or a negative number. The inside of a log must be positive.')
    ] },
  { id: 'c4-logprops', title: 'Properties of Logs: Expand & Condense', icon: '🧰', tag: 'Product, quotient, power', tests: [7, 8], practice: ['log-expand', 'log-condense'],
    cheat: ['log_b(xy) = log_b x + log_b y', 'log_b(x/y) = log_b x − log_b y', 'log_b(xʳ) = r·log_b x', 'Expand: break apart. Condense: ONE log, coefficient 1.'],
    learn: [
      R('The three properties', '<b>Product:</b> ~log_b(xy) = log_b x + log_b y~. <b>Quotient:</b> ~log_b({x|y}) = log_b x - log_b y~. <b>Power:</b> ~log_b(x^r) = r · log_b x~.'),
      P('<b>Expanding</b> means breaking one log into many small ones, so every log holds a single variable. Roots are fractional powers: ~sqrt(x) = x^(1/2)~.'),
      E('Example: expand ~log_3({x^2 y|z^4})~', '~log_3({x^2 y|z^4})~', ['Quotient rule: ~log_3(x^2 y) - log_3(z^4)~', 'Product rule: ~log_3(x^2) + log_3(y) - log_3(z^4)~', 'Power rule: ~2log_3 x + log_3 y - 4log_3 z~']),
      P('<b>Condensing</b> is the same story backwards. Do the <b>power rule first</b> (coefficients become exponents), then combine: <b>added → multiplied</b>, <b>subtracted → divided</b>. End with a single log with coefficient 1.'),
      E('Example: condense ~3log_2 a + log_2 b - 2log_2 c~', '~3log_2 a + log_2 b - 2log_2 c~', ['Power rule: ~log_2(a^3) + log_2 b - log_2(c^2)~', 'Added terms multiply, subtracted divides: ~log_2({a^3 b|c^2})~']),
      T('~log(x + y)~ does <b>not</b> split into ~log x + log y~, and ~{log x|log y}~ is not ~log(x/y)~. The rules only apply to products, quotients and powers <b>inside</b> the log.'),
      TIP('Only bring a coefficient up as an exponent on the <b>term it belongs to</b>, and check that the base is the same on every log before you combine.')
    ] },
  { id: 'c4-logeq', title: 'Solving Logarithmic Equations', icon: '🧩', tag: 'Collapse the logs, then solve', tests: [10, 11], practice: ['log-eq-basic', 'log-eq-prop'],
    cheat: ['One log = a number: convert to exponential form.', 'Log = log (same base): set the insides equal.', 'ALWAYS check: log arguments must be positive.'],
    learn: [
      R('Case 1: one log equals a number', 'Convert to exponential form and solve. ~log_b(A) = k~ ⇒ ~A = b^k~.'),
      E('Example: ~log_2(x + 3) = 4~', '~log_2(x + 3) = 4~', ['Exponential form: ~x + 3 = 2^4 = 16~', '~x = 13~', 'Check: ~x + 3 = 16 > 0~ ✓']),
      R('Case 2: logs on both sides', 'Use the properties to collapse each side to a single log. If ~log_b A = log_b B~ then ~A = B~.'),
      E('Example: ~ln(x) + ln(x - 1) = ln(6)~', '~ln(x) + ln(x - 1) = ln(6)~', ['Product rule on the left: ~ln(x(x - 1)) = ln 6~', 'Drop the logs: ~x^2 - x = 6~, so ~x^2 - x - 6 = 0~', 'Factor: ~(x - 3)(x + 2) = 0~', 'Check ~x = 3~: ~ln 3 + ln 2~ ✓. Check ~x = -2~: ~ln(-2)~ is undefined ✗', 'Answer: ~x = 3~ only']),
      T('Log equations create extraneous solutions just like radical equations. <b>Always</b> plug each answer back in and make sure every log argument is positive.'),
      TIP('Not enough logs to combine? Combine what you can, then switch to exponential form. Two roads lead to the same place.')
    ] }
  ] }
];

AQ.topicIndex = {};
AQ.chapters.forEach(ch => ch.topics.forEach(t => { t.ch = ch.n; AQ.topicIndex[t.id] = t; }));
if (typeof module !== 'undefined' && module.exports) module.exports = AQ;
})(typeof window !== 'undefined' ? window : globalThis);
