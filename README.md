# Triyaj

Tıp öğrencileri için acil servis vaka oyunu. Hasta kapıdan girer; oyuncu onu triyaj alanına alır, öyküsünü dinler, geçmişine ve e-Nabız kayıtlarına bakar, muayene eder, tetkik ister, müdahale eder ve tanısını koyar. Vitaller kapalıdır ve ölçmeden görünmez, her işlem vaka saatinden zaman yer, geciken hasta kötüleşir. Yanında kıdemli acil hemşiresi Ercan Abi vardır: kızar, onaylar, sorar; ona danışmak puan kırmaz. Sonunda puan, ideal yolla kendi yolunun karşılaştırması ve kılavuz kartı gelir.

**Oyna:** https://ahmet-okan.github.io/triyaj/ (bilgisayarda en iyi deneyim; telefonda "Ana ekrana ekle" ile uygulama gibi kurulur)

> Eğitim amaçlı demo, tıbbi tavsiye değildir. Vakalar hekim onayı bekliyor. Oyundaki e-Nabız ekranı temsilîdir, T.C. Sağlık Bakanlığı sistemi değildir; kayıtlar kurgusaldır.

HASAT 2026 (Teknopark İstanbul) başvurusu için geliştirildi.

## Şu an oyunda
- 4 acil vaka: göğüs ağrısı, karın ağrısı, arı sokması sonrası nefes darlığı ve Türkiye'ye özgü kış gecesi baş ağrısı (soba / karbonmonoksit zehirlenmesi)
- Giriş sahnesi ve triyaj kararı (kırmızı / sarı / yeşil alan)
- Zamanla açılan vitaller, arka planda gelen tetkikler, kötüleşen hasta
- Hasta geçmişi (hastaya ve yakınına sorma) ve e-Nabız penceresi
- Kıdemli hemşire Ercan Abi: tepki, ipucu, etkileşimli sorular
- Hasta yakını baskını: üç cevap ya da görmezden gelmek
- Paradox oyunlarından öğrenilenler: iç içe terim ipuçları (tıbbi terimin üstüne gelince açıklama, açıklamanın içindeki terim de açılır), üst çubukta uyarılar, kısayollar (1-6, N, Space), duraklatma, kütüphane (terimler, kılavuz kartları), rozetler
- Serbest soru: öğrenci hastaya istediğini yazar, sistem en uygun hazır (hekim onaylı) cevabı bulur; emin değilse "bunu mu demek istedin?" diye önerir (çevrimdışı, yapay zekâ yok)
- Ayarlar: müzik, ortam sesi, efektler, monitör bipi ve Ercan Abi'nin sesi ayrı ayrı; nasıl oynanır, kısayollar, kütüphane
- Rehberli ilk vaka, Ercan Abi'nin seslendirilmiş replikleri, günün vakası ve meydan okuma (düello) bağlantısı
- Ses: müzik ve acil servis ortam sesi (Higgsfield ile üretildi), saturasyona göre perdesi değişen monitör bipi ve alarmlar (WebAudio)
- Ayırıcı tanı dolabı: bulgular "düşünce" olarak açılır, oyuncu en fazla 3'ünü dolaba koyar; kanıt geldikçe düşünce güçlenir ya da zayıflar (Disco Elysium'un düşünce dolabından esinlenildi)
- Sonuç ekranı: puan kırılımı, senin yolun ile ideal yol, kılavuz kartı, paylaşım metni

## Gelecek özellikler (HASAT 2026 sonrası)
- **Vaka editörü:** tıp fakültesi hocaları ve asistanlar kod yazmadan vaka ekler; her vaka hekim onay akışından geçer (kim onayladı, ne zaman). Fakülteler kendi vaka setini oluşturur.
- **Türkiye'ye özgü yeni vakalar:** ilaç zehirlenmesi, deprem/ezilme, mantar zehirlenmesi, gece trafik travması.
- **Sıralama tablosu ve sınıf modu:** günün vakasında fakülte/sınıf sıralaması.
- **Yapay zekâ destekli soru anlama:** serbest soruyu Claude ile anlama (cevaplar yine hazır ve onaylı metinlerden).
- **Mobil ve masaüstü uygulama:** aynı kodla Android/iOS (Capacitor) ve masaüstü (Tauri) paketleri.

## Emeği geçenler
- Görseller, müzik ve ortam sesi: Higgsfield ile üretildi (görsel dil Disco Elysium'dan esinlenildi)
- Ercan Abi'nin sesi: Microsoft Edge sinir ağı sesi (tr-TR-AhmetNeural, edge-tts), demo amaçlı
- Hasta yakını efekti: "Shrieking Jump Scare Blast" by BudgetPixel AI (https://budgetpixel.com/sfx/shrieking-jump-scare-blast-258d1f28), CC BY 4.0
- Monitör, alarm ve arayüz sesleri: WebAudio ile kodla üretildi
- Yazı tipleri: Libre Baskerville, Barlow Condensed (SIL Open Font License)
