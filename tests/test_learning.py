"""The learning loop: every lesson ends with a "Your turn" problem before its summary, and practice shows the goal
for the next star and, once a star is earned, the next section. Run: python3 tests/test_learning.py"""
import sys, os
sys.path.insert(0, os.path.dirname(__file__))
from serve import serve
from playwright.sync_api import sync_playwright
BASE = serve()[0] + 'index.html'
fails = []
def ok(c, msg):
    print(('  ✓ ' if c else '  ✗ ') + msg)
    if not c: fails.append(msg)
with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_page(viewport={'width': 390, 'height': 844}); errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.goto(BASE); pg.evaluate('localStorage.clear()'); pg.reload(); pg.wait_for_selector('.hero')
    topics = pg.evaluate("Object.values(AQ.topicIndex).map(t=>[t.ch,t.id])")
    missing = []
    for ch, tid in topics:
        pg.goto(f'{BASE}#/ch/{ch}/{tid}'); pg.wait_for_selector('.lockin')
        if not pg.evaluate("(()=>{const t=document.querySelector('.tryit'),l=document.querySelector('.lockin');return !!t&&!!t.querySelector('.pcard .pprompt')&&!!(t.compareDocumentPosition(l)&Node.DOCUMENT_POSITION_FOLLOWING)})()"): missing.append(tid)
    ok(not missing, f'all {len(topics)} lessons have a Your turn problem before the summary {missing[:3]}')
    ch, tid = topics[0]
    pg.goto(f'{BASE}#/ch/{ch}/{tid}'); pg.wait_for_selector('.tryit .pcard')
    pg.click('.tryit >> text=Show the worked answer')
    ok(pg.is_visible('.tryit .sol') and pg.is_visible('.tryit >> text=Try another one'), 'the worked answer is there, then another one')
    first = pg.inner_text('.tryit .pprompt'); pg.click('.tryit >> text=Try another one')
    ok(pg.is_visible('.tryit .pcard') and not pg.is_visible('.tryit .sol'), 'Try another one gives a fresh problem')
    ok(pg.evaluate(f"JSON.parse(localStorage.getItem('algebra-quest-v1')).topics['{tid}'].tried") == 1, 'the lesson problem counts as practice')
    pg.goto(f'{BASE}#/ch/{ch}/{tid}/practice'); pg.wait_for_selector('.pgoal')
    ok('Goal: 3' in pg.inner_text('.pgoal') and '0 / 3' in pg.inner_text('.pgoal'), 'practice shows the goal for the first star')
    pg.evaluate(f"(()=>{{const s=JSON.parse(localStorage.getItem('algebra-quest-v1'));s.topics['{tid}']={{tried:3,first:3,miss:0,last:Date.now(),read:1}};localStorage.setItem('algebra-quest-v1',JSON.stringify(s));}})()")
    pg.reload(); pg.wait_for_selector('.pgoal')
    nx = topics[1][1]
    ok(pg.is_visible('.pgoal.done') and pg.get_attribute('.pgoal.done a', 'href').endswith(nx), 'after the first star, practice points to the next section')
    ok(pg.evaluate("document.documentElement.scrollWidth<=window.innerWidth+1"), 'no overflow on a phone')
    ok(not errs, 'no page errors ' + str(errs[:2]))
    b.close()
print('\nall passed' if not fails else f'\n{len(fails)} failed'); sys.exit(1 if fails else 0)
