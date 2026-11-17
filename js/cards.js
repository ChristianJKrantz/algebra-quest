/* Algebra Quest flashcards: one deck per quest. Front = a question to answer from memory, back = the fact.
   Text uses the same ~math~ markup as the lessons. Cards teach rules and methods only, never test answers. */
(function (root) {
'use strict';
const AQ = root.AQ = root.AQ || {};
AQ.cards = {
/* ---------------- Chapter 1 ---------------- */
'c1-linear': [
  ['What are the 4 steps for solving a linear equation?', '1. Distribute. 2. Combine like terms on each side. 3. Variable terms to one side, numbers to the other. 4. Divide by the coefficient.'],
  ['An equation has fractions. What is the fastest first move?', 'Multiply <b>every</b> term on both sides by the LCD so the fractions disappear.'],
  ['How do you solve a formula like ~A = P + Prt~ for one letter?', 'Same steps as a number equation. If the letter shows up twice, move both terms to one side and <b>factor it out</b>, then divide.'],
  ['When you distribute a minus sign over ~(a - b)~, what do you get?', '~-a + b~. The minus changes the sign of <b>every</b> term inside.'],
],
'c1-apps': [
  ['Simple interest formula?', '~I = Prt~: interest = principal × rate (as a decimal) × time in years.'],
  ['Two accounts share a total ~T~. One holds ~x~. What does the other hold?', '~T - x~'],
  ['In a two-account problem, what equation do you write?', 'Interest from account 1 + interest from account 2 = total interest.'],
  ['Area and perimeter of a rectangle?', 'Area ~= lw~. Perimeter ~= 2l + 2w~.'],
  ['A length problem gives a negative solution. What do you do with it?', 'Reject it. A length can’t be negative.'],
],
'c1-complex': [
  ['What is ~i~, and what is ~i^2~?', '~i = sqrt(-1)~, so ~i^2 = -1~.'],
  ['Powers of ~i~ repeat every how many steps?', 'Every 4: ~i, -1, -i, 1~. Divide the exponent by 4 and use the remainder.'],
  ['How do you add or subtract complex numbers?', 'Real parts together, imaginary parts together. Subtracting: distribute the minus to both parts.'],
  ['What is the conjugate of ~a + bi~?', '~a - bi~ (flip the sign of the imaginary part only).'],
  ['~(a + bi)(a - bi)~ = ?', '~a^2 + b^2~, a plain real number.'],
  ['How do you divide complex numbers?', 'Multiply top and bottom by the conjugate of the bottom, then write the result as ~a + bi~.'],
],
'c1-quad': [
  ['The quadratic formula?', '~x = {-b ± sqrt(b^2 - 4ac)|2a}~'],
  ['Before using the formula, what form must the equation be in?', 'Standard form ~ax^2 + bx + c = 0~: everything on one side, zero on the other.'],
  ['Discriminant ~b^2 - 4ac~ is positive. How many and what kind of solutions?', 'Two different real solutions.'],
  ['Discriminant is zero?', 'One real solution (a repeated root).'],
  ['Discriminant is negative?', 'Two complex solutions (a conjugate pair).'],
  ['~sqrt(-n)~ for positive ~n~ equals?', '~i·sqrt(n)~. Pull the ~i~ out first, then simplify the root.'],
],
'c1-rr': [
  ['Rational equation: what do you write down before solving?', 'The values of x that make any denominator 0. Those can never be answers.'],
  ['How do you clear the fractions in a rational equation?', 'Multiply every term on both sides by the LCD.'],
  ['Radical equation: what is the first step?', 'Isolate the radical by itself on one side.'],
  ['After squaring both sides, what must you always do?', 'Plug every answer into the <b>original</b> equation and throw out the fakes (extraneous solutions).'],
  ['Why do fake solutions appear when you square both sides?', 'Squaring makes a negative and a positive look the same, so it can add solutions that don’t really work.'],
],
'c1-form': [
  ['What does “quadratic in form” mean?', 'The equation looks like ~a(u)^2 + b(u) + c = 0~ where ~u~ is some expression, like ~x^2~ or ~x^(1/3)~.'],
  ['How do you pick ~u~?', 'Look for a power that is exactly double another: ~x^4~ and ~x^2~, or ~x^(2/3)~ and ~x^(1/3)~. Let ~u~ be the smaller one.'],
  ['After solving for ~u~, are you done?', 'No. Substitute back and solve for x (and check, if you raised to an even power).'],
  ['~x^(m/n) = k~. How do you undo the exponent?', 'Raise both sides to the power ~{n|m}~. If ~m~ is even, remember ±.'],
],
'c1-ineq': [
  ['When does an inequality sign flip?', 'When you multiply or divide both sides by a <b>negative</b> number.'],
  ['Parenthesis or bracket in interval notation?', 'Bracket [ ] includes the endpoint (≤, ≥). Parenthesis ( ) leaves it out (<, >, and always next to ∞).'],
  ['Compound inequality ~a < 3x + b < c~: how do you solve it?', 'Do the same step to all three parts until x is alone in the middle.'],
  ['Sign chart steps for a polynomial or rational inequality?', '1. Get 0 on one side. 2. Find zeros of the top and bottom. 3. Mark them on a number line. 4. Test one point per interval. 5. Pick the intervals with the right sign.'],
  ['In a rational inequality, can a zero of the denominator be included?', 'Never. It always gets a parenthesis, even with ≤ or ≥.'],
  ['What symbol joins two separate intervals?', '∪ (union), as in ~(-inf, 1) ∪ (4, inf)~.'],
],
'c1-abs': [
  ['~|X| = k~ with ~k > 0~ becomes?', '~X = k~ or ~X = -k~. Solve both.'],
  ['~|X| = k~ with ~k < 0~?', 'No solution. An absolute value is never negative.'],
  ['First step before splitting an absolute value equation?', 'Isolate the absolute value: get ~|...|~ alone on one side.'],
  ['~|X| < k~ becomes? (“less than” = …)', '~-k < X < k~. “Less thAND”: one connected interval.'],
  ['~|X| > k~ becomes? (“greater than” = …)', '~X < -k~ or ~X > k~. “GreatOR”: two pieces joined with ∪.'],
],
/* ---------------- Chapter 2 ---------------- */
'c2-dm': [
  ['Distance formula?', '~d = sqrt((x_2 - x_1)^2 + (y_2 - y_1)^2)~. It is the Pythagorean theorem in disguise.'],
  ['Midpoint formula?', '~({x_1 + x_2|2}, {y_1 + y_2|2})~: average the x’s, average the y’s.'],
  ['Distance: should you leave a square root in the answer?', 'Simplify it (pull out perfect squares), unless the problem asks for a decimal.'],
],
'c2-lines': [
  ['Slope formula?', '~m = {y_2 - y_1|x_2 - x_1}~ (rise over run).'],
  ['Point-slope form?', '~y - y_1 = m(x - x_1)~'],
  ['Slope-intercept form?', '~y = mx + b~. ~m~ is the slope, ~b~ is the y-intercept.'],
  ['Slopes of parallel lines?', 'Equal.'],
  ['Slopes of perpendicular lines?', 'Negative reciprocals: flip the fraction and change the sign. Their product is ~-1~.'],
  ['Slope of a horizontal line? Of a vertical line?', 'Horizontal: 0 (~y = b~). Vertical: undefined (~x = a~).'],
],
'c2-func': [
  ['What makes a relation a function?', 'Every input (x) has exactly <b>one</b> output (y).'],
  ['Vertical line test?', 'If any vertical line hits the graph more than once, it is <b>not</b> a function.'],
  ['Equation test: when does solving for y show “not a function”?', 'When you get ± (like ~y = ±sqrt(...)~) or an even power of y, because one x gives two y’s.'],
  ['Domain of a function with a fraction?', 'All x except the ones that make the denominator 0.'],
  ['Domain of a function with an even root?', 'Set the inside ≥ 0 and solve.'],
],
'c2-circle': [
  ['Standard form of a circle?', '~(x - h)^2 + (y - k)^2 = r^2~ with center ~(h, k)~ and radius ~r~.'],
  ['~(x + 3)^2~ in the circle equation means h is…?', '~h = -3~. The sign inside is the opposite of the center coordinate.'],
  ['How do you go from general form to standard form?', 'Group x’s and y’s, move the constant over, complete the square for each, add the same amounts to the right side.'],
  ['Completing the square for ~x^2 + bx~: what do you add?', '~({b|2})^2~'],
  ['The right side ends up equal to 9. What is the radius?', '3. The right side is ~r^2~, so take the square root.'],
],
'c2-read': [
  ['On a graph, where is a function increasing?', 'On x-intervals where the graph goes up as you read left to right.'],
  ['Increasing/decreasing intervals use which coordinates?', 'The x-values only, written with parentheses.'],
  ['What is a relative maximum?', 'A hilltop: a y-value higher than everything near it. It happens at the x where the graph turns from increasing to decreasing.'],
  ['How do you read ~f(a)~ off a graph?', 'Go to ~x = a~, find the graph’s height there. That y is ~f(a)~.'],
],
'c2-piece': [
  ['How do you evaluate a piecewise function at ~x = a~?', 'Find the piece whose condition ~a~ satisfies, then plug ~a~ into <b>only</b> that piece.'],
  ['At a boundary value, which piece do you use?', 'The one whose condition includes it (≤ or ≥), not the one with < or >.'],
  ['Open vs. closed dot on a piecewise graph?', 'Closed dot: the endpoint is included (≤, ≥). Open dot: not included (<, >).'],
],
'c2-sym': [
  ['Test for symmetry about the y-axis?', 'Replace x with −x. If the equation doesn’t change, it is symmetric about the y-axis.'],
  ['Test for symmetry about the x-axis?', 'Replace y with −y. Unchanged equation = symmetric about the x-axis.'],
  ['Test for symmetry about the origin?', 'Replace both x with −x and y with −y. Unchanged = symmetric about the origin.'],
  ['Even function and odd function?', 'Even: ~f(-x) = f(x)~ (y-axis symmetry). Odd: ~f(-x) = -f(x)~ (origin symmetry).'],
],
'c2-ops': [
  ['~(f + g)(x)~ means?', '~f(x) + g(x)~. Same pattern for −, ×, ÷.'],
  ['Domain of ~(f/g)(x)~?', 'Everywhere both f and g are defined, <b>minus</b> the x’s where ~g(x) = 0~.'],
  ['What does ~(f ∘ g)(x)~ mean?', '~f(g(x))~: put g(x) into f. Work from the inside out.'],
  ['Is ~f(g(x))~ the same as ~g(f(x))~?', 'Usually not. Order matters in composition.'],
  ['Difference quotient?', '~{f(x + h) - f(x)|h}~, with ~h ≠ 0~.'],
],
/* ---------------- Chapter 3 ---------------- */
'c3-quad': [
  ['Vertex x-coordinate of ~f(x) = ax^2 + bx + c~?', '~x = {-b|2a}~. Plug it back in for the y.'],
  ['Vertex form of a parabola?', '~f(x) = a(x - h)^2 + k~ with vertex ~(h, k)~.'],
  ['Opens up or down?', '~a > 0~ opens up (minimum). ~a < 0~ opens down (maximum).'],
  ['Axis of symmetry?', 'The vertical line ~x = h~ through the vertex.'],
  ['“How many units maximize profit?” vs “What is the maximum profit?”', 'The first is the vertex’s <b>x</b>. The second is the vertex’s <b>y</b>.'],
],
'c3-synth': [
  ['Dividing by ~x - k~ with synthetic division: which number goes in the box?', '~k~. For ~x + 3~, use ~-3~.'],
  ['What must you do if a power of x is missing?', 'Write a 0 coefficient in its place.'],
  ['Synthetic division loop?', 'Bring down the first number. Multiply by k, write under the next column, add. Repeat.'],
  ['How do you read the answer row?', 'The last number is the remainder. The others are the quotient’s coefficients, one degree lower than the original.'],
  ['Remainder Theorem?', 'Dividing ~f(x)~ by ~x - k~ leaves the remainder ~f(k)~.'],
],
'c3-factor': [
  ['Factor Theorem?', '~x - k~ is a factor of ~f(x)~ exactly when ~f(k) = 0~ (remainder 0).'],
  ['You found one zero of a cubic. How do you find the rest?', 'Synthetic divide by it. The quotient is a quadratic: factor it or use the quadratic formula.'],
  ['Zero ~k~ ↔ factor?', 'Zero ~k~ ↔ factor ~(x - k)~. Zero ~-2~ ↔ factor ~(x + 2)~.'],
  ['Rational Zero Theorem candidates?', '~±{p|q}~, where p divides the constant term and q divides the leading coefficient.'],
],
'c3-end': [
  ['What decides end behavior?', 'Only the leading term: its degree (even/odd) and the sign of its coefficient.'],
  ['Even degree, positive leading coefficient?', 'Up on both ends (↑ ↑).'],
  ['Even degree, negative leading coefficient?', 'Down on both ends (↓ ↓).'],
  ['Odd degree, positive leading coefficient?', 'Down on the left, up on the right (↓ ↑).'],
  ['Odd degree, negative leading coefficient?', 'Up on the left, down on the right (↑ ↓).'],
  ['Zero with odd multiplicity vs even multiplicity?', 'Odd: the graph <b>crosses</b> the x-axis. Even: it <b>touches</b> and turns around.'],
  ['Most turning points a degree-n polynomial can have?', '~n - 1~'],
],
'c3-rational': [
  ['Vertical asymptotes of a rational function?', 'Simplify first. Then the zeros of the denominator are vertical asymptotes.'],
  ['A factor cancels from top and bottom. What is there?', 'A hole, not an asymptote.'],
  ['Horizontal asymptote: degree of top < degree of bottom?', '~y = 0~'],
  ['Horizontal asymptote: degrees equal?', '~y = {leading coef of top|leading coef of bottom}~'],
  ['Horizontal asymptote: degree of top > degree of bottom?', 'None. (If the top is exactly one degree higher, there is a slant asymptote.)'],
  ['x-intercepts and y-intercept of a rational function?', 'x-intercepts: zeros of the simplified top. y-intercept: plug in ~x = 0~.'],
],
/* ---------------- Chapter 4 ---------------- */
'c4-inverse': [
  ['When does a function have an inverse?', 'When it is one-to-one: it passes the <b>horizontal</b> line test.'],
  ['4 steps to find ~f^(-1)(x)~?', '1. Write ~y = f(x)~. 2. Swap x and y. 3. Solve for y. 4. Rename y as ~f^(-1)(x)~.'],
  ['How are the graphs of f and ~f^(-1)~ related?', 'Mirror images across the line ~y = x~.'],
  ['How do you verify two functions are inverses?', 'Show ~f(f^(-1)(x)) = x~ and ~f^(-1)(f(x)) = x~.'],
  ['Domain and range of the inverse?', 'They swap: domain of ~f^(-1)~ = range of f, and range of ~f^(-1)~ = domain of f.'],
],
'c4-exp': [
  ['Solving ~b^M = b^N~ with the same base?', 'Set the exponents equal: ~M = N~.'],
  ['How do you get the same base?', 'Rewrite both sides as powers of one number, e.g. ~8 = 2^3~ and ~{1|4} = 2^(-2)~.'],
  ['Bases can’t match. What now?', 'Take ln (or log) of both sides, bring the exponent down, solve.'],
  ['~(b^m)^n~ = ?', '~b^(mn)~: multiply the exponents.'],
  ['~b^(-n)~ = ?', '~{1|b^n}~'],
],
'c4-interest': [
  ['Compound interest formula (n times per year)?', '~A = P(1 + {r|n})^(nt)~'],
  ['Continuous compounding formula?', '~A = Pe^(rt)~'],
  ['n for annually, semiannually, quarterly, monthly?', '1, 2, 4, 12.'],
  ['Interest earned vs. future value?', 'Future value is A. Interest earned is ~A - P~.'],
  ['Present value: what are you solving for?', 'P, the amount to invest now: ~P = {A|(1 + r/n)^(nt)}~.'],
  ['Time to reach a goal: which tool do you need?', 'Logarithms. Isolate the power, take ln of both sides, divide.'],
],
'c4-logform': [
  ['~log_b(x) = y~ means?', '~b^y = x~. A log <b>is</b> an exponent.'],
  ['Remember the conversion with the “loop”:', 'Start at the base, go past the equals sign to y, loop back to x: ~log_b x = y~ → ~b^y = x~.'],
  ['~ln x~ means?', '~log_e x~, the natural log.'],
  ['~log x~ with no base written?', 'Base 10.'],
  ['~log_b 1~ and ~log_b b~?', '~log_b 1 = 0~ and ~log_b b = 1~.'],
],
'c4-logprops': [
  ['Product rule?', '~log_b(MN) = log_b M + log_b N~'],
  ['Quotient rule?', '~log_b({M|N}) = log_b M - log_b N~'],
  ['Power rule?', '~log_b(M^r) = r·log_b M~'],
  ['How do you expand ~log(sqrt(x))~?', 'Rewrite the root as a power: ~sqrt(x) = x^(1/2)~, so it becomes ~{1|2}log x~.'],
  ['Condensing: what must happen to coefficients first?', 'Move them up as exponents (power rule). Then combine pluses into products and minuses into quotients.'],
  ['Change of base formula?', '~log_b x = {ln x|ln b}~'],
],
'c4-logeq': [
  ['~log_b(M) = c~ (one log): how do you solve it?', 'Rewrite in exponential form: ~M = b^c~.'],
  ['~log_b M = log_b N~: how do you solve it?', 'Drop the logs: ~M = N~.'],
  ['Several logs on one side?', 'Condense them into one log first, then switch to exponential form.'],
  ['What must you check at the end?', 'Every log argument must be <b>positive</b>. Reject any answer that makes one zero or negative.'],
],
};
if (typeof module !== 'undefined' && module.exports) module.exports = AQ;
})(typeof window !== 'undefined' ? window : globalThis);
