"""Browser test: python3 tests/test_ui.py  (needs `python3 -m http.server 8765` in the repo root and Playwright)."""
import re, sys
from playwright.sync_api import sync_playwright
BASE = 'http://localhost:8765/index.html'
errs = []
def chk(cond, msg):
    if not cond: errs.append(msg)
with sync_playwright() as p:
    b = p.chromium.launch()
    for vw, label in [((1280, 900), 'desktop'), ((390, 844), 'mobile')]:
        ctx = b.new_context(viewport={'width': vw[0], 'height': vw[1]}); pg = ctx.new_page()
        pg.on('pageerror', lambda e: errs.append('PAGEERR ' + str(e)))
        pg.on('console', lambda m: errs.append('CONSOLE ' + m.text) if m.type == 'error' else None)
        pg.goto(BASE); pg.wait_for_selector('.hero')
        topics = pg.evaluate("Object.values(AQ.topicIndex).map(t=>[t.ch,t.id])")
        nocards = pg.evaluate("Object.keys(AQ.topicIndex).filter(id=>!(AQ.cards[id]||[]).length)")
        chk(not nocards, 'topics without flashcards: %s' % nocards)
        def overflow(where):
            w = pg.evaluate("document.documentElement.scrollWidth - window.innerWidth")
            chk(w <= 1, f'{label}: horizontal overflow {w}px on {where}')
        def raw(where):
            t = pg.inner_text('main')
            chk('~' not in t and not re.search(r'\{[^{}|]*\|[^{}]*\}', t), f'{label}: unrendered markup on {where}: ' + t[:80])
        for ch in range(1, 5):
            pg.goto(f'{BASE}#/ch/{ch}'); pg.wait_for_selector('.tgrid'); overflow(f'ch{ch}')
            pg.goto(f'{BASE}#/ch/{ch}/cheat'); pg.wait_for_selector('.sheet'); pg.click('text=Quiz me'); pg.click('.sheet li >> nth=0')
        for ch, tid in (topics if label == 'desktop' else topics[::5]):
            pg.goto(f'{BASE}#/ch/{ch}/{tid}'); pg.wait_for_selector('.lesson'); raw(tid); overflow(tid)
            for btn in pg.query_selector_all('.example .ctl .btn:nth-child(2)'): btn.click()
            for w in pg.query_selector_all('.widget'):
                chk(bool(w.query_selector('.wbody, svg, input')), 'widget failed to render in ' + tid)
            pg.goto(f'{BASE}#/ch/{ch}/{tid}/cards'); pg.wait_for_selector('.fc')
            n = pg.evaluate(f"AQ.cards['{tid}'].length")
            for i in range(n):
                raw(tid + ' card'); pg.keyboard.press('Space'); pg.wait_for_selector('.fc.flipped')
                pg.keyboard.press('3' if i % 3 else '2')
            pg.wait_for_selector('.result .boxes')
            pg.goto(f'{BASE}#/ch/{ch}/{tid}/practice'); pg.wait_for_selector('.pcard')
            for _ in range(2):
                raw(tid + ' practice'); pg.click('text=Show the worked answer'); pg.wait_for_selector('.sol:not([hidden])'); pg.click('.pnext .btn')
        # recall mode hides rules and reveals on tap
        pg.goto(f'{BASE}#/ch/1/c1-quad'); pg.wait_for_selector('.lesson')
        if not pg.is_checked('.switch input'): pg.click('.switch')
        chk(not pg.is_visible('.callout.rule .cbody >> nth=0'), 'recall mode did not hide rule')
        pg.click('.callout.rule .cover >> nth=0'); chk(pg.is_visible('.callout.rule .cbody >> nth=0'), 'cover tap did not reveal')
        pg.click('.switch')
        # answering: wrong then right with the generator's own answer
        pg.goto(f'{BASE}#/ch/1/c1-linear/practice'); pg.wait_for_selector('.pcard')
        pg.fill('.fld input', 'zzz'); pg.click('text=Check answer'); pg.wait_for_selector('.feed.bad')
        # mixed review + boss
        pg.goto(f'{BASE}#/review/mix'); pg.wait_for_selector('.pcard')
        for _ in range(8): pg.click('text=Show the worked answer'); pg.click('.pnext .btn')
        pg.wait_for_selector('.result')
        pg.goto(f'{BASE}#/ch/2/boss'); pg.wait_for_selector('.pcard')
        for _ in range(10): pg.click('text=Show the worked answer'); pg.click('.pnext .btn')
        pg.wait_for_selector('.result')
        # theme toggle, review, progress
        if label == 'mobile': pg.click('.menubtn')
        pg.click('text=Night study mode'); chk(pg.evaluate("document.documentElement.dataset.theme") == 'dark', 'dark toggle failed')
        pg.goto(f'{BASE}#/review'); pg.wait_for_selector('.rgrid'); pg.goto(f'{BASE}#/review/cards'); pg.wait_for_selector('h1')
        pg.goto(f'{BASE}#/progress'); pg.wait_for_selector('.stat-grid'); overflow('progress')
        pg.goto(BASE + '#/'); pg.wait_for_selector('.plan'); overflow('home')
        saved = pg.evaluate("JSON.parse(localStorage.getItem('algebra-quest-v1'))")
        chk(saved['theme'] == 'dark' and len(saved['cards']) > 0 and len(saved['days']) == 1, 'progress not saved')
        ctx.close()
    b.close()
print('\n'.join(errs) if errs else 'UI OK'); sys.exit(1 if errs else 0)
