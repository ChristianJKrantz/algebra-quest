/* Regression checks for graph ranges that exclude zero. */
const assert = require('node:assert/strict');
const { plot } = require('../js/graph');

const growth = plot({
  xmin: 0, xmax: 10, ymin: 960, ymax: 1900, step: 200, xStep: 2, leftMargin: 48,
  curves: [{ f: t => 1000 * Math.exp(0.06 * t) }]
});
assert.match(growth, /<path class="curve c-a" d="M[^"]+L/);
assert.match(growth, /text-anchor="end">1000<\/text>/);
assert.match(growth, /text-anchor="middle">10<\/text>/);

const negative = plot({
  xmin: 0, xmax: 2, ymin: -1900, ymax: -950, step: 200, xStep: 1,
  curves: [{ pts: [[0, -1000], [1, -1100], null, [2, -1500]] }]
});
const path = negative.match(/<path [^>]*d="([^"]+)"/)[1];
assert.equal((path.match(/M/g) || []).length, 2, 'a gap should still split the curve');
assert.match(path, /L/);
console.log('Graph range regression checks passed');
