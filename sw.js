const CACHE_NAME = 'holocron-v1';
const ASSETS = [
  'index.html',
  'css/tokens.css',
  'css/base.css',
  'css/components.css',
  'js/state.js',
  'js/router.js',
  'js/dashboard.js',
  'js/projects.js',
  'js/memory.js',
  'js/weekly.js',
  'assets/logo.svg',
  'assets/icon-192.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
