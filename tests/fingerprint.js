/* Turns problem text into a token sequence so the same problem matches however it is formatted.
   Math mode keeps numbers (with signs) and letters (variables, function names) and fraction bars; words mode keeps only numbers. */
function toks(s, words) {
  s = String(s).replace(/<[^>]+>/g, ' ').replace(/[−–]/g, '-').replace(/(\d),(\d{3})(?!\d)/g, (m, a, b) => a + b)
    .replace(/\{([^{}|]*)\|/g, (m, a) => '{' + a + ' / ').replace(/[,|]/g, '#').replace(/[{}~$%]/g, ' ');
  let prev; do { prev = s; s = s.replace(/(\d)\s+(?=[\d.])/g, (m, a) => a + '#'); } while (s !== prev);
  s = s.replace(/\s+/g, '');
  return (s.match(words ? /-?\d+(?:\.\d+)?/g : /-?\d+(?:\.\d+)?|[a-z]+|\//gi) || []).map(t => /\d/.test(t) ? String(Number(t)) : t.toLowerCase());
}
/* What a problem "is": each math expression, each run of neighbouring expressions (a point P and a point Q, or
   f and g), and for word problems the whole text. */
function candidates(text, words) {
  const segs = String(text).split('~').filter((_, i) => i % 2).map(s => toks(s, words)), out = words ? [toks(text, true)] : [];
  for (let i = 0; i < segs.length; i++) { let run = []; for (let j = i; j < segs.length; j++) { run = run.concat(segs[j]); out.push(run); } }
  return out.filter(c => c.length);
}
module.exports = { toks, candidates };
