"""Security checks: tries to inject code through every input, the address bar and tampered browser storage, checks
the Content Security Policy, that nothing loads from other sites, and that the page refuses to run inside another
site's frame.  Run: python3 tests/test_security.py  (needs Playwright)."""
import os, sys, re, json, glob
sys.path.insert(0, os.path.dirname(__file__))
from serve import serve, ROOT
from playwright.sync_api import sync_playwright
URL, SITE = serve()
open(os.path.join(SITE, 'evil.html'), 'w').write('<iframe id="f" src="index.html" width="900" height="600"></iframe>')
fails = []
def ok(c, msg):
    print(('  ✓ ' if c else '  ✗ ') + msg)
    if not c: fails.append(msg)
PAYLOADS = ['<img src=x onerror="window.__pwned=1">', '"><svg onload="window.__pwned=1">', "'><script>window.__pwned=1</script>",
            '<a href="javascript:window.__pwned=1">x</a>', '{{7*7}}${7*7}', '</span><b id=inj>INJECTED</b>', '~<b id=inj>x</b>~', '{<b id=inj>|x}']

print('Static checks')
html = open(os.path.join(ROOT, 'index.html')).read()
csp = re.search(r'http-equiv="Content-Security-Policy" content="([^"]+)"', html).group(1)
script_src = re.search(r"script-src([^;]*)", csp).group(1)
ok("'self'" in script_src and "unsafe" not in script_src and 'http' not in script_src, 'CSP runs only this site’s own script files (no inline, eval or outside scripts)')
ok(all(d in csp for d in ["object-src 'none'", "base-uri 'none'", "form-action 'none'", "default-src 'self'"]), 'CSP blocks plugins, <base> hijacking, form submissions and outside resources')
ok('<script>' not in html and not re.search(r'<[a-z][^>]*\son[a-z]+=', html), 'no inline scripts or inline event handlers in the page')
ok('name="referrer" content="no-referrer"' in html, 'the page sends no referrer to other sites')
js = ''.join(open(f).read() for f in glob.glob(os.path.join(ROOT, 'js', '*.js')))
ok(not re.search(r'\beval\(|new Function|document\.write|setTimeout\([\'"`]|setInterval\([\'"`]', js), 'no eval-style code execution (math answers use their own parser)')
ok(not re.search(r'<[a-z][^>\'"]*\son[a-z]+=', js), 'scripts never build HTML with inline event handlers')
ok(not re.search(r'https?://(?!www\.w3\.org)', js + html.split('<body>')[1]), 'scripts and page body reference no outside URLs')

with sync_playwright() as pw:
    b = pw.chromium.launch(); ctx = b.new_context(); pg = ctx.new_page(); errs = []; offsite = []; cspv = []
    pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.on('request', lambda r: offsite.append(r.url) if not r.url.startswith(URL) and not r.url.startswith('data:') else None)
    pg.on('console', lambda m: cspv.append(m.text) if 'Content Security Policy' in m.text else None)
    pwned = lambda: pg.evaluate("!!window.__pwned || !!document.getElementById('inj')")

    print('Normal use')
    pg.goto(URL); pg.wait_for_selector('.plan')
    for h in ['#/ch/1', '#/ch/1/c1-linear', '#/ch/3/c3-quad', '#/ch/4/c4-logeq/cards', '#/ch/2/c2-circle/practice', '#/review', '#/progress', '#/ch/2/cheat']:
        pg.goto(URL + h); pg.wait_for_timeout(150)
    ok(not offsite, f'pages load nothing from other sites {offsite[:3]}')
    ok(not cspv, f'the site itself triggers no CSP violations {cspv[:2]}')

    print('Typed input')
    topics = pg.evaluate("Object.values(AQ.topicIndex).map(t=>[t.ch,t.id])")
    typed = 0
    for ch, tid in topics:
        pg.goto(f'{URL}#/ch/{ch}/{tid}/practice'); pg.wait_for_selector('.pcard')
        for p in PAYLOADS:
            boxes = pg.locator('.fld input[type=text]').all()
            if not boxes: break
            for inp in boxes: inp.fill(p); typed += 1
            pg.click('text=Check answer'); pg.wait_for_timeout(20)
        msgs = ' '.join(pg.locator('.fmsg').all_inner_texts())
        if pwned() or '7*7' in msgs and '49' in msgs: break
    ok(not pwned(), f'{typed} injection attempts in the answer boxes of all 27 quests run nothing')
    pg.goto(f'{URL}#/ch/1/c1-ineq'); pg.wait_for_selector('.widget .wtext')
    for p in PAYLOADS: pg.fill('.widget .wtext', p); pg.wait_for_timeout(20)
    ok(not pwned(), 'injection attempts in the interval lab’s text box run nothing')

    print('Address bar')
    for p in PAYLOADS:
        pg.goto(URL + '#/ch/1/' + p); pg.wait_for_timeout(60)
        pg.goto(URL + '#/' + p + '/x'); pg.wait_for_timeout(60)
    ok(not pwned() and pg.locator('h1').count() == 1, 'malicious links (#/ch/1/<payload>) are cleaned and fall back to a normal page')

    print('Tampered saved data')
    evil = {'xp': '<img src=x onerror="window.__pwned=1">', 'best': 1e99, 'theme': '"><img src=x onerror="window.__pwned=1">',
            'last': '<img src=x onerror="window.__pwned=1">', 'mixDay': '<b id=inj>', 'recall': '<b>',
            'topics': {'c1-linear': {'tried': '<b id=inj>', 'first': -5, 'miss': 'x', 'last': {}, 'read': '<b>'}, '<img src=x onerror=window.__pwned=1>': {'tried': 9}},
            'boss': {'1': '<b id=inj>', '9': 50}, 'cards': {'c1-linear:0': {'b': '<b id=inj>', 'd': 'soon'}, '<b id=inj>': {'b': 3, 'd': 0}},
            'days': ['<b id=inj>', '2026-01-01', 7, None], '__proto__': {'polluted': 1}}
    for data in [json.dumps(evil), '{not json', '"just a string"', '[1,2,3]', 'null', json.dumps({'xp': 10**30, 'cards': 'x', 'topics': [], 'days': 'x'})]:
        pg.evaluate("d => localStorage.setItem('algebra-quest-v1', d)", data)
        for h in ['#/', '#/progress', '#/review', '#/ch/1/c1-linear/cards', '#/ch/1']:
            pg.goto(URL + h); pg.wait_for_timeout(80)
        if pwned() or errs: break
    ok(not pwned(), 'tampered saved data runs nothing on any page')
    ok(not errs, f'tampered or corrupt saved data never crashes the site {errs[:2]}')
    pg.evaluate("d => localStorage.setItem('algebra-quest-v1', d)", json.dumps(evil)); pg.goto(URL + '#/progress'); pg.wait_for_selector('.stat-grid')
    ok(pg.evaluate("({}).polluted") is None, 'saved data cannot pollute JavaScript object prototypes')
    xp = pg.locator('.xpline b').first.inner_text()
    ok(xp == '0 XP', f'invalid saved values are reset to safe defaults (XP shows "{xp}")')

    print('Storage blocked')
    c2 = b.new_context(); c2.add_init_script("Object.defineProperty(window,'localStorage',{get(){throw new Error('blocked')}})")
    p2 = c2.new_page(); e2 = []; p2.on('pageerror', lambda e: e2.append(str(e)))
    p2.goto(URL); p2.wait_for_selector('.plan'); p2.goto(URL + '#/ch/1/c1-linear/cards'); p2.wait_for_selector('.fc'); p2.keyboard.press('Space'); p2.keyboard.press('3')
    ok(not e2, f'with browser storage blocked the site still works (progress lasts for the visit) {e2[:1]}')
    c2.close()

    print('Framing')
    p3 = ctx.new_page(); p3.goto(URL + 'evil.html'); p3.wait_for_timeout(800)
    fr = p3.frame_locator('#f')
    ok(fr.locator('a', has_text='Open Algebra Quest').count() == 1 and fr.locator('.plan').count() == 0, 'inside another site’s frame it shows only a link to the real page')
    b.close()
print(f'\n{len(fails)} failed' if fails else '\nAll security checks passed')
sys.exit(1 if fails else 0)
