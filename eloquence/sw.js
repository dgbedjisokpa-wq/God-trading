/* Service worker : rend l'application utilisable hors ligne.
   Pense à changer VERSION à chaque mise à jour des fichiers. */
var VERSION = 'ahouefa-v2';
var FILES = [
  './', 'index.html', 'manifest.webmanifest', 'css/app.css',
  'js/util.js', 'js/icons.js', 'js/store.js', 'js/sound.js', 'js/mascot.js', 'js/speech.js', 'js/analysis.js',
  'js/data/banks.js', 'js/data/course.js', 'js/generators.js', 'js/ui.js', 'js/exercises.js', 'js/lesson.js',
  'js/plan.js', 'js/pages.js', 'js/onboarding.js', 'js/app.js',
  'icons/icon-192.png', 'icons/icon-512.png', 'icons/icon-maskable-512.png', 'icons/apple-touch-icon.png'
];

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(VERSION).then(function (c) { return c.addAll(FILES); }).then(function () { return self.skipWaiting(); }));
});

self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (k) { return k !== VERSION; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});

/* Réseau d'abord (pour avoir les mises à jour), cache en secours hors ligne. */
self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET') return;
  var url = new URL(req.url);
  var sameOrigin = url.origin === self.location.origin;
  var font = /fonts\.(googleapis|gstatic)\.com$/.test(url.hostname);
  if (!sameOrigin && !font) return;
  e.respondWith(
    fetch(req).then(function (res) {
      if (res && (res.ok || res.type === 'opaque')) {
        var copy = res.clone();
        caches.open(VERSION).then(function (c) { c.put(req, copy); });
      }
      return res;
    }).catch(function () {
      return caches.match(req).then(function (m) { return m || caches.match('index.html'); });
    })
  );
});
