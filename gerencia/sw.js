// SIVIL PWA Service Worker v2.0
// POSTEC DE OCCIDENTE S.A.S.
const CACHE_NAME = 'sivil-cache-v13';
const PRECACHE = ['./index.html', './manifest.json', './icon-192.png', './icon-512.png'];

// INSTALL — cachear recursos base
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(PRECACHE))
  );
});

self.addEventListener('message', event => {
  if (event.data === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// ACTIVATE — limpiar caches viejos
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

// FETCH — network first, cache fallback
self.addEventListener('fetch', event => {
  const url = event.request.url;

  // No interceptar llamadas externas
  if (url.includes('script.google.com') ||
      url.includes('docs.google.com')   ||
      url.includes('maps.google.com')   ||
      url.includes('wa.me')             ||
      url.includes('googleapis.com')) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Guardar en cache si es válido
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
