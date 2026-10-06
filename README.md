# Triyaj

Tıp öğrencileri için acil servis vaka oyunu. Hasta kapıdan girer; oyuncu onu triyaj alanına alır, öyküsünü dinler, geçmişine ve e-Nabız kayıtlarına bakar, muayene eder, tetkik ister, müdahale eder ve tanısını koyar. Vitaller kapalıdır ve ölçmeden görünmez, her işlem vaka saatinden zaman yer, geciken hasta kötüleşir. Yanında kıdemli acil hemşiresi Ercan Abi vardır: kızar, onaylar, sorar; ona danışmak puan kırmaz. Sonunda puan, ideal yolla kendi yolunun karşılaştırması ve kılavuz kartı gelir.

**Oyna:** https://ahmet-okan.github.io/triyaj/ (bilgisayarda en iyi deneyim; telefonda "Ana ekrana ekle" ile uygulama gibi kurulur)

> Eğitim amaçlı demo, tıbbi tavsiye değildir. Vakalar hekim onayı bekliyor. Oyundaki e-Nabız ekranı temsilîdir, T.C. Sağlık Bakanlığı sistemi değildir; kayıtlar kurgusaldır.

HASAT 2026 (Teknopark İstanbul) başvurusu için geliştirildi.

## Şu an oyunda
- 3 acil vaka: göğüs ağrısı, karın ağrısı, arı sokması sonrası nefes darlığı
- Giriş sahnesi ve triyaj kararı (kırmızı / sarı / yeşil alan)
- Zamanla açılan vitaller, arka planda gelen tetkikler, kötüleşen hasta
- Hasta geçmişi (hastaya ve yakınına sorma) ve e-Nabız penceresi
- Kıdemli hemşire Ercan Abi: tepki, ipucu, etkileşimli sorular
- Hasta yakını baskını: üç cevap ya da görmezden gelmek
- Sonuç ekranı: puan kırılımı, senin yolun ile ideal yol, kılavuz kartı, paylaşım metni

## Gelecek özellikler (HASAT 2026 sonrası)
- **Vaka editörü:** tıp fakültesi hocaları ve asistanlar kod yazmadan vaka ekler; her vaka hekim onay akışından geçer (kim onayladı, ne zaman). Fakülteler kendi vaka setini oluşturur.
- **Türkiye'ye özgü yeni vakalar:** kış gecesi soba (karbonmonoksit) zehirlenmesi, ilaç zehirlenmesi, deprem/ezilme, mantar zehirlenmesi, gece trafik travması.
- **Ayırıcı tanı dolabı:** vaka boyunca toplanan bulgular "düşünce" olarak açılır, oyuncu ayırıcı tanı listesini kurar (Disco Elysium'un düşünce dolabından esinlenildi).
- **Günün vakası, düello ve paylaşım kartı:** herkes aynı vakayı oynar, sonuçlar tanıyı ele vermeden paylaşılır.
- **Seslendirme ve acil servis ambiyansı.**
- **Mobil ve masaüstü uygulama:** aynı kodla Android/iOS (Capacitor) ve masaüstü (Tauri) paketleri.
