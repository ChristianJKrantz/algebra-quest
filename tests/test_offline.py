"""Offline and install checks: loads the site once, cuts the network, then studies a lesson, flashcards and a
practice problem offline; checks a new version is picked up when back online and that the app manifest is valid.
Run: python3 tests/test_offline.py  (needs Playwright)."""
import os, sys, json
sys.path.insert(0, os.path.dirname(__file__))
from serve import serve, ROOT
from playwright.sync_api import sync_playwright
URL, SITE = serve()
fails = []
def ok(c, msg):
    print(('  ✓ ' if c else '  ✗ ') + msg)
    if not c: fails.append(msg)
man = json.load(open(os.path.join(ROOT, 'manifest.webmanifest')))
ok(man['display'] == 'standalone' and man['start_url'] == './' and all(os.path.exists(os.path.join(ROOT, i['src'].split('?')[0])) for i in man['icons']) and man['icons'][0]['sizes'] == '180x180' and all(i['type'] == 'image/png' for i in man['icons']), 'app manifest is valid, lists PNG icons only (180px iPhone icon first) and every icon exists')
ok(any(i.get('purpose') == 'maskable' for i in man['icons']) and os.path.exists(os.path.join(ROOT, 'apple-touch-icon.png')), 'maskable Android icon and iPhone home-screen icon are included')
sw = open(os.path.join(ROOT, 'sw.js')).read()
missing = [f for f in __import__('re').findall(r"'((?:js|css|fonts)/[^'?]+|[\w.-]+\.(?:html|png|svg|webmanifest))(?:\?v=\d+)?'", sw) if not os.path.exists(os.path.join(ROOT, f))]
fonts = [f for f in os.listdir(os.path.join(ROOT, 'fonts')) if f.endswith('.woff2')]
ok(not missing and all(f[:-6] in sw for f in fonts), f'the service worker saves every page file and font {missing}')
with sync_playwright() as pw:
    b = pw.chromium.launch(); ctx = b.new_context(); pg = ctx.new_page(); errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.goto(URL); pg.wait_for_selector('.plan')
    pg.evaluate("navigator.serviceWorker.ready"); pg.reload(); pg.wait_for_selector('.plan')
    ok(pg.evaluate("!!navigator.serviceWorker.controller"), 'service worker installs and takes control on the first visit')
    pg.wait_for_timeout(500)
    ctx.set_offline(True)
    pg.reload(); pg.wait_for_selector('.plan', timeout=8000)
    ok('college algebra' in pg.locator('h1').inner_text().lower(), 'home page loads with no internet connection')
    ok(pg.evaluate("Promise.all(['800 16px Fraunces','400 16px Serif4','600 16px Inter','700 16px AtkMono'].map(f=>document.fonts.load(f))).then(r=>r.every(x=>x.length>0))"), 'fonts load offline')
    pg.goto(URL + '#/ch/3/c3-quad'); pg.wait_for_selector('.widget svg')
    ok(True, 'lesson with graph lab works offline')
    pg.goto(URL + '#/ch/3/c3-quad/cards'); pg.wait_for_selector('.fc'); pg.keyboard.press('Space'); pg.keyboard.press('3')
    ok(pg.locator('.fcbar').inner_text().startswith('1 /'), 'flashcards work offline and save progress')
    pg.goto(URL + '#/ch/3/c3-quad/practice'); pg.wait_for_selector('.pcard'); pg.click('text=Show the worked answer')
    ok(pg.locator('.sol').is_visible(), 'practice problems are generated and checked offline')
    p2 = ctx.new_page(); p2.goto(URL + 'index.html#/ch/4'); p2.wait_for_selector('.tgrid', timeout=8000)
    ok(True, 'a brand-new tab opens the site offline')
    ctx.set_offline(False)
    idx = os.path.join(SITE, 'index.html'); s = open(idx).read(); open(idx, 'w').write(s.replace('Algebra Workbook is a free study tool.', 'NEW-VERSION-MARKER'))
    pg.goto(URL); pg.reload(); pg.wait_for_selector('.plan')
    ok('NEW-VERSION-MARKER' in pg.locator('footer').inner_text(), 'back online, the newest version is loaded (network first)')
    ok(not errs, f'no errors {errs[:2]}')
    b.close()
print(f'\n{len(fails)} failed' if fails else '\nAll offline checks passed')
sys.exit(1 if fails else 0)
