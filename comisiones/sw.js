// Service worker de SIVIL Comisiones: permite instalar la app y abrirla aunque no haya internet.
// Estrategia: red primero (siempre la versión más nueva) y copia local si no hay conexión.
const CACHE = 'sivil-comisiones-v2';
const PRECARGA = ['./', 'index.html', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png'];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE).then(c => c.addAll(PRECARGA)).catch(() => {}).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  // Las descargas grandes (zip, ejecutables) no se guardan en caché
  if (/\.(zip|exe|tgz)$/i.test(url.pathname)) return;

  event.respondWith(
    fetch(req)
      .then(res => {
        if (res && res.ok) {
          const copia = res.clone();
          caches.open(CACHE).then(c => c.put(req, copia)).catch(() => {});
        }
        return res;
      })
      .catch(() =>
        caches.match(req).then(hit => hit || (req.mode === 'navigate' ? caches.match('index.html') : undefined))
      )
  );
});
