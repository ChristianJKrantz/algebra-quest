/* Algebra Quest service worker: keeps a copy of the site on the device so it works offline.
   Pages are network-first and skip the browser's HTTP cache, so updates show up right away; fonts and icons
   (versioned URLs) are cache-first. Only this site's own files are handled. */
const CACHE = 'algebra-quest-v10';
const FONTS = ['fraunces-latin-600-normal', 'fraunces-latin-600-italic', 'fraunces-latin-800-normal',
  'source-serif-4-latin-400-normal', 'source-serif-4-latin-400-italic', 'source-serif-4-latin-600-normal', 'source-serif-4-latin-700-normal',
  'inter-latin-400-normal', 'inter-latin-500-normal', 'inter-latin-600-normal', 'inter-latin-700-normal',
  'aq-legible-mono-latin-400-normal', 'aq-legible-mono-latin-700-normal'].map(f => `fonts/${f}.woff2`);
const CORE = ['./', 'index.html', 'css/style.css', 'js/engine.js', 'js/graph.js', 'js/gens1.js', 'js/gens2.js', 'js/content.js', 'js/cards.js', 'js/widgets.js', 'js/app.js',
  'manifest.webmanifest?v=5', 'icon.svg?v=5', 'icon-192.png?v=5', 'icon-512.png?v=5', 'icon-maskable-512.png?v=5', 'apple-touch-icon.png?v=5', ...FONTS];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;
  if (/\.(png|svg|webmanifest|woff2)$/.test(url.pathname)) {
    e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(res => {
      if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
      return res;
    })));
    return;
  }
  e.respondWith(fetch(req, { cache: 'no-cache' }).then(res => {
    if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
    return res;
  }).catch(() => caches.match(req, { ignoreSearch: true })
    .then(hit => hit || (req.mode === 'navigate' ? caches.match('index.html') : Response.error()))));
});
