self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open('crocante-v1').then(cache => cache.addAll([
      '/',
      '/index.html',
      '/css/global.css',
      '/script.js',
      '/android-chrome-192x192.png',
      '/android-chrome-512x512.png',
      '/favicon-32x32.png',
      '/favicon-16x16.png'
    ]))
  );
});
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => response || fetch(event.request))
  );
});
