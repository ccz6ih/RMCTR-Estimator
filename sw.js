var CACHE_NAME = 'rmctr-v3';
var URLS_TO_CACHE = [
  './',
  './index.html',
  './css/main.css',
  './css/dark.css',
  './css/print.css',
  './js/data.js',
  './js/form.js',
  './js/dashboard.js',
  './js/pdf.js',
  './js/templates.js',
  './js/share.js',
  './js/shortcuts.js',
  './js/margin.js',
  './js/app.js',
  './manifest.json'
];

// Install: cache all app files
self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(URLS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Activate: clean old caches
self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(names) {
      return Promise.all(
        names.filter(function(n) { return n !== CACHE_NAME; })
          .map(function(n) { return caches.delete(n); })
      );
    })
  );
  self.clients.claim();
});

// Fetch: cache-first for app files, network-first for CDN
self.addEventListener('fetch', function(e) {
  e.respondWith(
    caches.match(e.request).then(function(cached) {
      if (cached) return cached;
      return fetch(e.request).then(function(response) {
        // Cache CDN resources on first fetch
        if (response.ok && (
          e.request.url.indexOf('cdnjs.cloudflare.com') >= 0 ||
          e.request.url.indexOf('fonts.googleapis.com') >= 0 ||
          e.request.url.indexOf('fonts.gstatic.com') >= 0
        )) {
          var clone = response.clone();
          caches.open(CACHE_NAME).then(function(cache) {
            cache.put(e.request, clone);
          });
        }
        return response;
      }).catch(function() {
        // Offline fallback
        if (e.request.destination === 'document') {
          return caches.match('./index.html');
        }
      });
    })
  );
});
