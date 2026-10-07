// Triyaj servis çalışanı: oyunu çevrimdışı da çalıştırır (önce ağ, ağ yoksa önbellek).
// Dosya eklenince ya da değişince SURUM'u artır ki telefonlar yeni sürümü alsın.
var SURUM = "triyaj-20261007-182136";
var DOSYALAR = [
  "./", "./index.html", "./vakalar.js", "./hemsire.js", "./terimler.js", "./manifest.webmanifest",
  "./icons/icon-180.png", "./icons/icon-192.png", "./icons/icon-512.png",
  "./img/ai/gogus-1.webp", "./img/ai/gogus-2.webp", "./img/ai/karin-1.webp", "./img/ai/karin-2.webp",
  "./img/ai/nefes-1.webp", "./img/ai/nefes-2.webp", "./img/ai/nefes-3.webp",
  "./img/ai/hemsire.webp", "./img/ai/hemsire-kizgin.webp",
  "./img/ai/yakin-gogus.webp", "./img/ai/yakin-karin.webp", "./img/ai/yakin-nefes.webp",
  "./img/ai/co-1.webp", "./img/ai/co-2.webp", "./img/ai/co-3.webp", "./img/ai/yakin-co.webp",
  "./img/ai/bg-kirmizi-alan.webp", "./img/ai/bg-sari-alan.webp", "./img/ai/bg-triaj-girisi.webp"
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
