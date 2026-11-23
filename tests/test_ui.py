"""Browser test of every page, lab, flashcard deck and practice flow, on desktop and phone sizes, in both themes.
   Run: python3 tests/test_ui.py  (needs Playwright)."""
import re, sys, os
sys.path.insert(0, os.path.dirname(__file__))
from serve import serve
from playwright.sync_api import sync_playwright
BASE = serve()[0] + 'index.html'
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
        answer = pg.locator('.fld input').first
        answer.fill('zzz')
        calc_button = pg.get_by_role('button', name='Calculator', exact=True)
        calc_button.click()
        calc = pg.get_by_role('dialog', name='Calculator')
        expression = calc.get_by_label('Expression')
        result = calc.locator('output')
        for key in ['1', 'Divide', '3', 'Calculate']:
            calc.get_by_role('button', name=key, exact=True).click()
        chk(result.inner_text() == '1/3', 'calculator lost exact fraction')
        calc.get_by_label('Show decimal').check()
        chk(result.inner_text() == '≈ 0.333333333333', 'calculator decimal result')
        for formula, expected in [('sqrt(9/16)', '0.75'), ('(2/3)^-2', '2.25'), ('-2^2', '-4')]:
            expression.fill(formula); expression.press('Enter')
            chk(result.inner_text().removeprefix('≈ ') == expected, 'calculator result for ' + formula)
        expression.fill('1/0'); expression.press('Enter')
        chk(result.inner_text().startswith('Check the expression'), 'calculator accepted division by zero')
        chk(calc.bounding_box()['width'] <= vw[0], 'calculator wider than viewport')
        pg.keyboard.press('Escape'); calc.wait_for(state='hidden')
        chk(answer.input_value() == 'zzz', 'calculator cleared the answer')
        chk(calc_button.evaluate('el => document.activeElement === el'), 'calculator did not restore focus')
        pg.click('text=Check answer'); pg.wait_for_selector('.feed.bad')
        # mixed review + boss
        pg.goto(f'{BASE}#/review/mix'); pg.wait_for_selector('.pcard')
        calc_button.click()
        calc.get_by_role('button', name='Close').click()
        calc.wait_for(state='hidden')
        for _ in range(8): pg.click('text=Show the worked answer'); pg.click('.pnext .btn')
        pg.wait_for_selector('.result')
        pg.goto(f'{BASE}#/ch/2/boss'); pg.wait_for_selector('.pcard')
        chk(calc_button.count() == 0, 'calculator available in chapter challenge')
        for _ in range(10): pg.click('text=Show the worked answer'); pg.click('.pnext .btn')
        pg.wait_for_selector('.result')
        # theme toggle, review, progress
        if label == 'mobile': pg.click('.menubtn')
        pg.locator('button.theme:visible').first.click(); chk(pg.evaluate("document.documentElement.dataset.theme") == 'dark', 'dark toggle failed')
        pg.goto(f'{BASE}#/review'); pg.wait_for_selector('.rgrid'); pg.goto(f'{BASE}#/review/cards'); pg.wait_for_selector('h1')
        pg.goto(f'{BASE}#/progress'); pg.wait_for_selector('.stat-grid'); overflow('progress')
        pg.goto(BASE + '#/'); pg.wait_for_selector('.plan'); overflow('home')
        saved = pg.evaluate("JSON.parse(localStorage.getItem('algebra-quest-v1'))")
        chk(saved['theme'] == 'dark' and len(saved['cards']) > 0 and len(saved['days']) == 1, 'progress not saved')
        ctx.close()
    b.close()
print('\n'.join(errs) if errs else 'UI OK'); sys.exit(1 if errs else 0)
