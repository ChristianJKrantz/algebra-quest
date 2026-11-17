"""Browser smoke test: python3 tests/test_ui.py  (needs `python3 -m http.server 8765` in the repo root)."""
import sys
from playwright.sync_api import sync_playwright
BASE = 'http://localhost:8765/index.html'
errs = []
with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_page(viewport={'width': 1200, 'height': 900})
    pg.on('pageerror', lambda e: errs.append('PAGEERR ' + str(e)))
    pg.on('console', lambda m: errs.append('CONSOLE ' + m.text) if m.type == 'error' else None)
    pg.goto(BASE); pg.wait_for_selector('.hero')
    topics = pg.evaluate("Object.values(AQ.topicIndex).map(t=>[t.ch,t.id])")
    for ch in range(1, 5):
        pg.goto(f'{BASE}#/ch/{ch}'); pg.wait_for_selector('.tgrid'); pg.goto(f'{BASE}#/ch/{ch}/cheat'); pg.wait_for_selector('.sheet')
    for ch, tid in topics:
        pg.goto(f'{BASE}#/ch/{ch}/{tid}'); pg.wait_for_selector('.lesson')
        for btn in pg.query_selector_all('.example .btn.small:nth-child(2)'): btn.click()
        for w in pg.query_selector_all('.widget'):
            if not w.query_selector('.wbody, svg, input'): errs.append('widget failed to render in ' + tid)
        pg.goto(f'{BASE}#/ch/{ch}/{tid}/practice'); pg.wait_for_selector('.pcard')
        for _ in range(3):
            pg.click('text=Show the answer'); pg.wait_for_selector('.sol:not([hidden])'); pg.click('.pnext .btn')
    # correct answer path: type each generator's own answer
    pg.goto(f'{BASE}#/ch/1/c1-linear/practice'); pg.wait_for_selector('.pcard')
    # real answering path through a generator
    pg.goto(f'{BASE}#/ch/1/c1-linear/practice'); pg.wait_for_selector('.pcard')
    pg.fill('.fld input', 'zzz'); pg.click('text=Check'); pg.wait_for_selector('.feed.bad')
    for ch in range(1, 5):
        pg.goto(f'{BASE}#/ch/{ch}/boss'); pg.wait_for_selector('.pcard')
        for _ in range(10):
            pg.click('text=Show the answer'); pg.click('.pnext .btn')
        pg.wait_for_selector('.result')
    pg.goto(f'{BASE}#/progress'); pg.wait_for_selector('.stat-grid')
    b.close()
print('\n'.join(errs) if errs else 'UI OK'); sys.exit(1 if errs else 0)
