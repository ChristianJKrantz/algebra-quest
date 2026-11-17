/* Algebra Quest service worker: keeps a copy of the site on the device so it works offline.
   Pages are network-first; fonts and icons are cache-first. Only this site's own files are handled. */
const CACHE = 'algebra-quest-v1';
const FONTS = ['inter-latin-400', 'inter-latin-500', 'inter-latin-600', 'inter-latin-700', 'inter-latin-800',
  'jetbrains-mono-latin-400', 'jetbrains-mono-latin-600', 'jetbrains-mono-latin-700'].map(f => `fonts/${f}-normal.woff2`);
const CORE = ['./', 'index.html', 'css/style.css', 'js/engine.js', 'js/graph.js', 'js/gens1.js', 'js/gens2.js', 'js/content.js', 'js/widgets.js', 'js/app.js',
  'manifest.webmanifest', 'icon.svg', 'icon-192.png', 'icon-512.png', 'apple-touch-icon.png', ...FONTS];
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
  e.respondWith(fetch(req).then(res => {
    if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
    return res;
  }).catch(() => caches.match(req, { ignoreSearch: true })
    .then(hit => hit || (req.mode === 'navigate' ? caches.match('index.html') : Response.error()))));
});
