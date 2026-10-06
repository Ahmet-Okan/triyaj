// Triyaj servis çalışanı: oyunu çevrimdışı çalıştırır (önce önbellek).
// Dosya eklenince ya da değişince SURUM'u artır ki telefonlar yeni sürümü alsın.
var SURUM = "triyaj-20261006-135213";
var DOSYALAR = [
  "./", "./index.html", "./vakalar.js", "./manifest.webmanifest",
  "./icons/icon-180.png", "./icons/icon-192.png", "./icons/icon-512.png",
  "./img/gogus-1.svg", "./img/gogus-2.svg", "./img/karin-1.svg", "./img/karin-2.svg",
  "./img/nefes-1.svg", "./img/nefes-2.svg", "./img/nefes-3.svg"
];

self.addEventListener("install", function (e) {
  e.waitUntil(caches.open(SURUM).then(function (c) { return c.addAll(DOSYALAR); }).then(function () { return self.skipWaiting(); }));
});

self.addEventListener("activate", function (e) {
  e.waitUntil(caches.keys().then(function (adlar) {
    return Promise.all(adlar.filter(function (a) { return a !== SURUM; }).map(function (a) { return caches.delete(a); }));
  }).then(function () { return self.clients.claim(); }));
});

// Önce ağ (yeni sürüm hemen gelsin), ağ yoksa önbellek. Yazı tipleri önce önbellekten.
self.addEventListener("fetch", function (e) {
  if (e.request.method !== "GET") return;
  var yaziTipi = e.request.url.indexOf("fonts.g") !== -1;
  function sakla(yanit) {
    if (yanit && (yanit.ok || yanit.type === "opaque")) {
      var kopya = yanit.clone();
      caches.open(SURUM).then(function (c) { c.put(e.request, kopya); });
    }
    return yanit;
  }
  if (yaziTipi) {
    e.respondWith(caches.match(e.request).then(function (o) { return o || fetch(e.request).then(sakla); }));
    return;
  }
  e.respondWith(fetch(e.request).then(sakla).catch(function () {
    return caches.match(e.request, { ignoreSearch: true });
  }));
});
