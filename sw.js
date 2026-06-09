const CACHE = 'lvs-gsm-tracker-v1';
const ASSETS = [
  '/lvs-gsm-tracker/',
  '/lvs-gsm-tracker/index.html',
  '/lvs-gsm-tracker/manifest.json',
  '/lvs-gsm-tracker/icon-192.png',
  '/lvs-gsm-tracker/icon-512.png'
];

// Install: cache all assets
self.addEventListener('install', ev => {
  ev.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS))
  );
  self.skipWaiting();
});

// Activate: remove old caches
self.addEventListener('activate', ev => {
  ev.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch: cache-first, fall back to network
self.addEventListener('fetch', ev => {
  ev.respondWith(
    caches.match(ev.request).then(cached => {
      if (cached) return cached;
      return fetch(ev.request).then(resp => {
        if (!resp || resp.status !== 200 || resp.type !== 'basic') return resp;
        const clone = resp.clone();
        caches.open(CACHE).then(c => c.put(ev.request, clone));
        return resp;
      }).catch(() => caches.match('/lvs-gsm-tracker/index.html'));
    })
  );
});
