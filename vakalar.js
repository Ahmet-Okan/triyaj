/* =====================================================================
   TRİYAJ · VAKA DOSYASI (vakalar.js)
   ---------------------------------------------------------------------
   Bu dosyada sadece veri var; oyunun kodu index.html içinde.
   Not Defteri ya da VS Code ile aç. Kaydederken kodlama UTF-8 olmalı,
   yoksa Türkçe harfler bozulur.

   NASIL VAKA EKLENİR
   1. En kolayı: VAKALAR listesindeki bir vakayı { ... } baştan sona
      kopyala, listenin sonuna virgülle ekle, alanları değiştir.
   2. "id" benzersiz olsun, Türkçe harf ve boşluk içermesin
      (ör. "gogus-agrisi-2").
   3. Tetkik ve müdahale kimlikleri (ekg, aspirin, pkg ...) aşağıdaki
      ISLEM_TABLOSU'ndaki "id" ile birebir aynı yazılır. Yeni bir tetkik ya
      da müdahale gerekiyorsa önce ISLEM_TABLOSU'na ekle, sonra her vakada
      sonucunu ve sınıfını yaz. Vakada yazılmayan tetkik "Normal." döner,
      yazılmayan müdahale "gereksiz" sayılır.
   4. Birimler: ISLEM_TABLOSU'nda saniye (sureSn) ve TL (ucret).
      Vaka içindeki saatler dakika (saatDk, hedefDk, sonraDk).
   5. Hasta durumları ("durumlar"): "baslangic" zorunlu. Diğerleri
      (ör. "sok") "seyir" kurallarıyla tetiklenir. Bir durumda sadece
      değişen vitalleri yaz; yazmadıkların "baslangic"tan gelir.
      "kayip: true" olan durum vakayı kaybettirir.
   6. Bir metin duruma göre değişiyorsa düz metin yerine şunu yaz:
        { varsayilan: "normal metin", sok: "şok durumunda görülen metin" }
   7. Sınıflar:
        tetkik   → "zorunlu" | "gerekli" | "notr" | "gereksiz" (−30 puan)
        müdahale → "kritik" | "gerekli" | "notr" | "gereksiz" (ceza yok,
                   sonuçta not düşülür) | "zararli" (−100 puan)
      Kritik müdahalelerin puanı ve hedef süresi "puanlama.kritikler"
      içinde yazılır; sınıf sadece etiket.
   8. Kaydet, index.html'i tarayıcıda yenile. Bir şey bozulursa F12 →
      Console'da satır numarası yazar; çoğu hata eksik virgül ya da tırnak.
   9. Hekim onayı verince vakanın "onay" alanını doldur.
   ===================================================================== */

/* ---------------------------------------------------------------------
   İŞLEM TABLOSU · tüm süre ve fiyatlar burada (tahmini, ortak düzeltecek)
   --------------------------------------------------------------------- */
window.ISLEM_TABLOSU = {
  oykuSn: 20,          // her öykü sorusu
  muayeneSn: 45,       // her sistem muayenesi
  tetkikIstekSn: 30,   // tetkik istemek (sonuç arka planda gelir)
  monitorSn: 120,      // monitöre bağlamak: sonra nabız, SpO₂, TA, ritim sürekli görünür
  // Hasta geçmişi: hastaya ya da yakınına sormak 20 sn, e-Nabız'dan bir kaydı açmak 30 sn
  gecmisSn: { hasta: 20, yakin: 20, enabiz: 30 },
  // e-Nabız: hastayı sorgulamak 30 sn, her bölümü ilk açış 10 sn (sonra serbest)
  enabizSn: 30, enabizBolumSn: 10,

  // Vital ölçümleri: sadece zaman, para yok. "gosterir" = ölçümün açtığı değerler.
  vitaller: [
    { id: "ates",    ad: "Ateş",                  sureSn: 5,  gosterir: ["ates"] },
    { id: "spo2",    ad: "SpO₂",                  sureSn: 20, gosterir: ["spo2", "nabiz"] },
    { id: "nabiz",   ad: "Nabız (elle)",          sureSn: 30, gosterir: ["nabiz"] },
    { id: "solunum", ad: "Solunum sayısı",        sureSn: 30, gosterir: ["solunum"] },
    { id: "ta",      ad: "Tansiyon",              sureSn: 60, gosterir: ["ta"] },
    { id: "seker",   ad: "Parmak ucu kan şekeri", sureSn: 60, gosterir: ["seker"] },
    { id: "gks",     ad: "Bilinç (GKS)",          sureSn: 30, gosterir: ["gks"] }
  ],

  muayeneSistemleri: [
    { id: "genel",     ad: "Genel durum" },
    { id: "kvs",       ad: "Kardiyovasküler" },
    { id: "solunum",   ad: "Solunum" },
    { id: "batin",     ad: "Batın" },
    { id: "cilt",      ad: "Cilt" },
    { id: "norolojik", ad: "Nörolojik" }
  ],

  // Tetkikler: istek 30 sn; sonuç "istek anı + sureSn" geldiğinde açılır.
  tetkikler: [
    { id: "ekg",       ad: "12 derivasyonlu EKG", grup: "Yatak başı",   sureSn: 300,  ucret: 150 },
    { id: "kan_gazi",  ad: "Kan gazı",            grup: "Yatak başı",   sureSn: 300,  ucret: 200 },
    { id: "yb_usg",    ad: "Yatak başı USG",      grup: "Yatak başı",   sureSn: 600,  ucret: 0 },
    { id: "idrar",     ad: "Tam idrar tahlili",   grup: "Laboratuvar",  sureSn: 1500, ucret: 60 },
    { id: "hemogram",  ad: "Hemogram",            grup: "Laboratuvar",  sureSn: 1800, ucret: 120 },
    { id: "biyokimya", ad: "Biyokimya",           grup: "Laboratuvar",  sureSn: 2700, ucret: 300 },
    { id: "crp",       ad: "CRP",                 grup: "Laboratuvar",  sureSn: 2700, ucret: 90 },
    { id: "troponin",  ad: "Troponin",            grup: "Laboratuvar",  sureSn: 3600, ucret: 350 },
    { id: "akc_grafi", ad: "Akciğer grafisi",     grup: "Görüntüleme",  sureSn: 1200, ucret: 250 },
    { id: "rad_usg",   ad: "USG (radyoloji)",     grup: "Görüntüleme",  sureSn: 2700, ucret: 450 },
    { id: "bt",        ad: "BT (radyoloji)",      grup: "Görüntüleme",  sureSn: 3600, ucret: 1800 }
  ],

  // Müdahaleler: ilaç, damar yolu, oksijen, pozisyon 1 dk; konsültasyon/aktivasyon 2 dk.
  // onkosul: önce yapılması gereken müdahale (IV ilaçlar damar yolu ister).
  // bitirir: true → vakayı bitirir (taburcu).
  mudahaleler: [
    { id: "damar_yolu",     ad: "Damar yolu aç",                       grup: "Damar yolu ve sıvı",    sureSn: 60 },
    { id: "iv_sivi",        ad: "IV sıvı bolusu (serum fizyolojik)",   grup: "Damar yolu ve sıvı",    sureSn: 60, onkosul: "damar_yolu" },
    { id: "oksijen",        ad: "Oksijen ver (maske)",                 grup: "Solunum ve pozisyon",   sureSn: 60 },
    { id: "bacak_kaldir",   ad: "Sırtüstü yatır, bacaklarını kaldır",  grup: "Solunum ve pozisyon",   sureSn: 60 },
    { id: "oral_kes",       ad: "Ağızdan alımı kes",                   grup: "Solunum ve pozisyon",   sureSn: 60 },
    { id: "aspirin",        ad: "Aspirin çiğnet (150–300 mg)",         grup: "İlaç",                  sureSn: 60 },
    { id: "nitrat",         ad: "Dil altı nitrat",                     grup: "İlaç",                  sureSn: 60 },
    { id: "adrenalin_im",   ad: "Adrenalin 0,5 mg IM (uyluk dış yan)", grup: "İlaç",                  sureSn: 60 },
    { id: "adrenalin_iv",   ad: "Adrenalin IV bolus",                  grup: "İlaç",                  sureSn: 60, onkosul: "damar_yolu" },
    { id: "antihistaminik", ad: "Antihistaminik IV",                   grup: "İlaç",                  sureSn: 60, onkosul: "damar_yolu" },
    { id: "steroid",        ad: "Steroid IV",                          grup: "İlaç",                  sureSn: 60, onkosul: "damar_yolu" },
    { id: "salbutamol",     ad: "Salbutamol nebül",                    grup: "İlaç",                  sureSn: 60 },
    { id: "analjezi",       ad: "IV analjezik",                        grup: "İlaç",                  sureSn: 60, onkosul: "damar_yolu" },
    { id: "antibiyotik",    ad: "IV antibiyotik",                      grup: "İlaç",                  sureSn: 60, onkosul: "damar_yolu" },
    { id: "antiasit",       ad: "Antiasit (ağızdan)",                  grup: "İlaç",                  sureSn: 60 },
    { id: "pkg",            ad: "Kardiyoloji · primer PKG aktivasyonu", grup: "Konsültasyon ve karar", sureSn: 120 },
    { id: "cerrahi",        ad: "Genel cerrahi konsültasyonu",         grup: "Konsültasyon ve karar", sureSn: 120 },
    { id: "gozlem",         ad: "Gözleme al",                          grup: "Konsültasyon ve karar", sureSn: 60 },
    { id: "aile",           ad: "Evdekileri acile çağır (112)",         grup: "Konsültasyon ve karar", sureSn: 60 },
    { id: "hbo",            ad: "Hiperbarik oksijen merkezine danış",  grup: "Konsültasyon ve karar", sureSn: 120 },
    { id: "taburcu",        ad: "Taburcu et",                          grup: "Konsültasyon ve karar", sureSn: 0, bitirir: true }
  ]
};

/* ---------------------------------------------------------------------
   VAKALAR
   --------------------------------------------------------------------- */
window.VAKALAR = [

  /* ===================================================================
     VAKA 1 · GÖĞÜS AĞRISI (gizli tanı: akut anterior STEMI)
     =================================================================== */
  {
    id: "gogus-agrisi",
    baslik: "Göğüs ağrısı",                 // giriş kartında görünür, tanıyı vermez
    sahne: "img/ai/bg-kirmizi-alan.webp",                 // PC sürümünde sahnenin arka planı
    triyaj: "kirmizi",               // doğru triyaj alanı: kirmizi | sari | yesil (hekim onayı)
    // Hasta yakını: belli bir anda bütün ekranı kaplar, soru sorar. 3 cevap + görmezden gel. Puanı etkilemez, sonuçta "İletişim" olarak görünür.
    // tur: iyi (dürüst ve net) | kotu (boş güvence) | sert. sureSn: cevabın vaka saatinden yediği süre.
    yakin: {
      ad: "Eşi", portre: "img/ai/yakin-gogus.webp",
      olaylar: [
        { id: "es-1", sonraSn: 150,
          soru: "Hocam! Kocam ne olacak? Kalp krizi mi geçiriyor? Bir şey söyleyin!",
          tekrarSoru: "Hocam, bana bakın! Kocam içeride, kimse bir şey söylemiyor!",
          secenekler: [
            { ad: "“Kalbiyle ilgili ciddi bir durum olabilir. Tetkiklerini yapıyoruz, tedaviye başladık. Bir gelişme olunca size hemen söyleyeceğim.”", tur: "iyi", sureSn: 30,
              cevap: "Tamam hocam... Tamam. Ben buradayım, ne lazımsa.", ercan: "Güzel konuştun hocam. Kısa, net, dürüst." },
            { ad: "“Merak etmeyin, bir şeyi yok. Mideden olabilir.”", tur: "kotu", sureSn: 15,
              cevap: "Mide mi? Ama eli hep göğsünde... Peki, siz bilirsiniz.", ercan: "Hocam, emin olmadığın şeyi söyleme. Kadın sonra bize hesap sorar." },
            { ad: "“Şu an çok meşgulüm, lütfen dışarıda bekleyin.”", tur: "sert", sureSn: 10,
              cevap: "Dışarıda mı? Kocam içeride ölüyor!", ercan: "Hocam, bir cümle de olsa bilgi ver. Korkan insan kapıda bekleyemez." }
          ],
          gormezden: { cevap: "Hocam! Bana bakın! Hocam!", ercan: "Hocam, kadına bir dakika ver, yoksa güvenliği çağırmak zorunda kalacağım.", tekrarSn: 120 } }
      ]
    },
    onay: { durum: "DEMO — hekim onayı bekliyor", dogrulayan: "", tarih: "" },
    hasta: { yas: 58, cinsiyet: "Erkek" },
    sikayet: "Yarım saattir göğsümün ortasında bir baskı var, sol koluma vuruyor.",

    // Hasta durumları. gorunus = kapıdan bakınca görülen; vitaller = o durumdaki gerçek değerler.
    // gorsel: img/ içindeki resim (yoksa yer tutucu görünür). gri: true → görsel gri tonlu.
    durumlar: {
      baslangic: {
        gorsel: "img/ai/gogus-1.webp",
        ton: ["soluk", "terli"],
        gorunus: "Terli ve soluk. Yumruğunu göğsünün ortasına bastırıyor, endişeli görünüyor.",
        vitaller: { ta: "150/90", nabiz: 104, spo2: 95, solunum: 22, ates: 36.7, seker: 142, gks: 15, ritim: "Sinüs taşikardisi" }
      },
      sok: {
        gorsel: "img/ai/gogus-2.webp",
        ton: ["gri", "terli"],
        gorunus: "Daha da soldu, alnında soğuk ter var. Halsiz, sedyede kıpırdamadan yatıyor.",
        mesaj: "Hastanın durumu kötüleşiyor: daha soluk, soğuk terli.",
        vitaller: { ta: "95/60", nabiz: 118 },
        ceza: { puan: 100, ad: "Kardiyojenik şok başladı (reperfüzyon gecikti)" }
      },
      vf: {
        gorsel: "img/ai/gogus-2.webp",
        gri: true,
        ton: ["gri"],
        gorunus: "Hasta aniden yanıtsızlaştı. Monitörde ventriküler fibrilasyon.",
        mesaj: "Ventriküler fibrilasyon gelişti.",
        kayip: true,
        vitaller: { ta: null, nabiz: null, spo2: null, solunum: null, gks: 3, ritim: "Ventriküler fibrilasyon" }
      }
    },

    // Seyir: saatDk'da durum değişir; "onleyen" müdahale o saatten önce yapıldıysa değişmez.
    seyir: [
      { saatDk: 30, durum: "sok", onleyen: ["pkg"] },
      { saatDk: 60, durum: "vf",  onleyen: ["pkg"] }
    ],

    // Öykü: soru → hastanın cevabı. Her soru 20 sn.
    oyku: [
      { id: "baslangic", soru: "Ağrı ne zaman başladı, o sırada ne yapıyordunuz?", anahtar: "ne zaman başladı kaç saattir ne zamandır", cevap: "Yarım saat kadar önce. Oturmuş televizyon izliyordum, hiç yorulmamıştım bile." },
      { id: "nitelik",   soru: "Ağrıyı nasıl tarif edersiniz?", anahtar: "nasıl bir ağrı baskı sıkışma batma yanma tarif",                      cevap: "Batma gibi değil. Sanki göğsüme ağır bir şey oturmuş, sıkıştırıyor. Tam ortada." },
      { id: "yayilim",   soru: "Ağrı bir yere yayılıyor mu?", anahtar: "kola koluma sol kol vuruyor gidiyor çene omuz yayılım",                        cevap: "Sol koluma vuruyor, kolum uyuşur gibi oldu." },
      { id: "eslik",     soru: "Yanında bulantı, terleme gibi başka şikâyet var mı?", anahtar: "terleme terliyor bulantı kusma", cevap: "Midem bulanıyor ama kusmadım. Bir de soğuk soğuk terliyorum." },
      { id: "pozisyon",  soru: "Nefes alınca ya da pozisyon değiştirince ağrı değişiyor mu?", cevap: "Yok, değişmiyor. Otursam da uzansam da aynı baskı." },
      { id: "sirt",      soru: "Ağrı sırtınıza vuruyor mu, yırtılır gibi mi?", anahtar: "sırt sırtıma sırtınıza yırtılma bıçak",       cevap: "Sırtıma vurmuyor. Yırtılma gibi değil, baskı gibi." },
      { id: "ozgecmis",  soru: "Bilinen hastalığınız, kullandığınız ilaç var mı?",   cevap: "Tansiyonum var, hap içiyorum ama bazen unutuyorum. Başka hastalığım yok." },
      { id: "sigara",    soru: "Sigara içiyor musunuz?",                             cevap: "İçiyorum. Gençlikten beri günde bir paket." },
      { id: "emboli",    soru: "Son zamanda uzun yolculuk, ameliyat ya da bacakta şişlik oldu mu?", anahtar: "yolculuk ameliyat bacak şişlik pıhtı", cevap: "Hayır, hiçbiri olmadı." },
      { id: "alerji",    soru: "İlaç alerjiniz var mı?",                             cevap: "Bildiğim bir alerjim yok." }
    ],

    // Hasta geçmişi (kaynak: arastirma/hasta-gecmisi-ve-gorsel-ipuclari.md). kaynak: hasta | yakin | enabiz.
    // onem: ipucu | notr | celdirici (oyunda gösterilmez; sonuç ekranında kaçırılan ipuçları için).
    gecmis: [
      { id: "ozgecmis_hipertansiyon", kategori: "Özgeçmiş", ad: "Kronik hastalıkları var mı?", ozet: "Yüksek tansiyon", kaynak: "hasta", cevap: "Altı yıl önce tansiyonum çıktı, hap başlandı. Ama kendimi iyi hissedince içmiyorum, sık sık atlıyorum.", onem: "ipucu", not: "Hipertansiyon majör koroner risk faktörüdür [K1][K2]. Düzensiz ilaç = kontrolsüz TA; hasta 150/90 ile geldi." },
      { id: "ozgecmis_dislipidemi", kategori: "e-Nabız", ad: "Tahlil ve reçete geçmişi", ozet: "Yüksek kolesterol (3 yıl önce) ve yarım bırakılmış statin", kaynak: "enabiz", cevap: "3 yıl önce aile hekimi: LDL 172 mg/dL, atorvastatin 20 mg reçete edilmiş. Eczaneden yalnızca 2 kutu çekilmiş, yenilenmemiş. (Hastaya sorulursa: \"Kolesterol yüksekti, hastalık saymadım, bıraktım.\")", onem: "ipucu", not: "LDL yüksekliği ve tedaviye uyumsuzluk aterosklerotik risk faktörüdür; yüksek riskte LDL hedefi çok daha düşüktür [K4]. Hasta öyküde 'başka hastalığım yok' demişti; e-Nabız bunu çürütür." },
      { id: "soygecmis_kalp", kategori: "Soygeçmiş", ad: "Ailede kalp hastalığı var mı?", ozet: "Ailede kalp hastalığı", kaynak: "hasta", cevap: "Babam 52 yaşında kalp krizi geçirdi, bypass oldu. Abim de stent taktırmıştı.", onem: "ipucu", not: "Birinci derece yakında erken KAH (erkekte <55 yaş) ESC risk faktörü [K2]. Baba 52 = eşik altı; abinin yaşı belirtilmedi (hekim onayı gerekli: kardeş için de aynı eşik)." },
      { id: "ilac_amlodipin", kategori: "Kullandığı ilaçlar", ad: "Düzenli kullandığı ilaçlar", ozet: "Tansiyon ilacı (amlodipin 5 mg)", kaynak: "yakin", cevap: "(Eşi) Amlodipin kullanıyor ama kutular dolu duruyor, haftada iki üç gün içiyor. Aspirin ya da kan sulandırıcı kullanmıyor.", onem: "notr", not: "Beta bloker/antikoagülan yok: aspirin yüklemesi ve PKG öncesi kanama riski için güvenlik bilgisi. Düzensiz kullanım hipertansiyon kontrolsüzlüğünü açıklar." },
      { id: "ilac_pde5", kategori: "Kullandığı ilaçlar", ad: "Son iki günde cinsel güç ilacı aldı mı?", ozet: "Sildenafil/tadalafil kullanımı", kaynak: "hasta", cevap: "Hayır, öyle bir hap kullanmıyorum.", onem: "notr", not: "Son 24 saatte (sildenafil) / 48 saatte (tadalafil) PDE5 inhibitörü alınmışsa nitrat verilmez [K1][K5]. Burada yok; nitrat güvenliğini sorgulatan bir öğretici kayıt. Süreler için hekim onayı gerekli." },
      { id: "sosyal_sigara", kategori: "Sosyal öykü", ad: "Sigara içiyor mu?", ozet: "Sigara (≈40 paket-yıl)", kaynak: "hasta", cevap: "Yirmi yaşından beri günde bir paket. Bırakmayı denedim, tutmadı.", onem: "ipucu", not: "Aktif sigara MI riskini belirgin artırır (INTERHEART) [K3]; ESC risk faktörü [K1][K2]. Paket-yıl: 20 yaşında başlamış, günde 1 paket, 38 yıl ≈ 38 paket-yıl." },
      { id: "ozgecmis_reflu", kategori: "Özgeçmiş", ad: "Mide şikâyetleri var mı?", ozet: "Mide yanması / reflü", kaynak: "hasta", cevap: "Arada akşam yemeğinden sonra mide yanmam olur, antiasit içerim. Bugün de ilk onu düşündüm, bir kaşık içtim, geçmedi.", onem: "celdirici", not: "Antiasit tuzağı: reflü öyküsü AKS'yi dışlamaz; tipik iskemik ağrı + EKG belirleyicidir [K1]. Oyundaki `antiasit` müdahalesiyle uyumlu ('ağrı değişmedi'). Hekim onayı gerekli: ESC metninde 'antiasite yanıt tanısal değildir' ifadesi doğrudan geçmiyor, klinik öğretim." },
      { id: "enabiz_acil", kategori: "e-Nabız", ad: "Önceki acil başvuruları", ozet: "8 ay önce acil: eforla göğüs sıkışması", kaynak: "enabiz", cevap: "8 ay önce acil: yokuş çıkarken göğüste sıkışma. EKG normal, troponin negatif, taburcu; kardiyoloji poliklinik önerisi. Sonraki kardiyoloji muayene kaydı yok.", onem: "ipucu", not: "Olası stabil angina belirtisi atlanmış. Aynı zamanda eski EKG 'normal' = baz çizgi: bugünkü V1-V4 ST elevasyonunun yeni olduğunu gösterir (ESC: önceki EKG ile karşılaştır, hekim onayı gerekli: atıf maddesi). Önceki negatif tetkik ise yanlış güven verir." },
      { id: "sosyal_yasam", kategori: "Sosyal öykü", ad: "Meslek, yaşam tarzı, alkol", ozet: "Meslek, yaşam tarzı, alkol", kaynak: "hasta", cevap: "Emekli muhasebeciyim, eşimle oturuyoruz. Alkol içmem. Yürüyüş yapmıyorum, günüm koltukta geçiyor.", onem: "notr", not: "Hareketsizlik ve emeklilik gevşek bir risk modifiye edicisi; tek başına tanı yönlendirmez. Alkol yok: ayırıcıda pankreatit/gastrit olasılığını yormaz." }
    ],

    // e-Nabız (oyun içi temsilî kayıt). gecmisId: bu satırı görünce o geçmiş kaydı "bakıldı" sayılır.
    enabiz: {
      ziyaretler: [
        { tarih: "8 ay önce", kurum: "Devlet Hastanesi · Acil Servis", tani: "Göğüs ağrısı, tanımlanmamış (R07.4)", not: "Yokuş çıkarken göğüste sıkışma. EKG normal sinüs ritmi, troponin negatif. Taburcu, kardiyoloji polikliniği önerildi. Sonraki kardiyoloji muayene kaydı yok.", gecmisId: "enabiz_acil" },
        { tarih: "3 yıl önce", kurum: "Aile Sağlığı Merkezi", tani: "Saf hiperkolesterolemi (E78.0)", not: "Kolesterol yüksekliği, statin başlandı.", gecmisId: "ozgecmis_dislipidemi" },
        { tarih: "6 yıl önce", kurum: "Aile Sağlığı Merkezi", tani: "Esansiyel hipertansiyon (I10)", not: "Tansiyon yüksekliği, amlodipin başlandı.", gecmisId: "ozgecmis_hipertansiyon" },
        { tarih: "Kasım 2020", kurum: "Aile Sağlığı Merkezi · filyasyon", tani: "COVID-19, virüs tanımlandı (U07.1)", not: "PCR pozitif. Ateş, öksürük, koku kaybı. 14 gün evde izolasyon; filyasyon ekibi ilacını eve bıraktı." }
      ],
      tahliller: [
        { tarih: "8 ay önce", test: "Troponin", sonuc: "Negatif", birim: "", referans: "Negatif", durum: "normal", gecmisId: "enabiz_acil" },
        { tarih: "3 yıl önce", test: "LDL kolesterol", sonuc: "172", birim: "mg/dL", referans: "< 130", durum: "yuksek", gecmisId: "ozgecmis_dislipidemi" },
        { tarih: "3 yıl önce", test: "Açlık kan şekeri", sonuc: "98", birim: "mg/dL", referans: "70–100", durum: "normal" },
        { tarih: "Aralık 2020", test: "SARS-CoV-2 PCR", sonuc: "Negatif", birim: "", referans: "Negatif", durum: "normal" },
        { tarih: "Kasım 2020", test: "SARS-CoV-2 PCR", sonuc: "Pozitif", birim: "", referans: "Negatif", durum: "yuksek" }
      ],
      receteler: [
        { tarih: "2 ay önce", ilac: "Amlodipin 5 mg", kullanim: "Günde 1", not: "Reçete düzenli yenileniyor." },
        { tarih: "3 yıl önce", ilac: "Atorvastatin 20 mg", kullanim: "Günde 1", not: "2 kutu alınmış, yenilenmemiş.", gecmisId: "ozgecmis_dislipidemi" },
        { tarih: "Kasım 2020", ilac: "Favipiravir 200 mg", kullanim: "5 gün", not: "COVID-19 tedavisi, filyasyon ekibi verdi." }
      ],
      asilar: [
        { tarih: "Ağustos 2021", asi: "COVID-19 · BioNTech", doz: "3. doz (hatırlatma)", kurum: "Devlet Hastanesi aşı noktası" },
        { tarih: "Mayıs 2021", asi: "COVID-19 · CoronaVac (Sinovac)", doz: "2. doz", kurum: "Aile Sağlığı Merkezi" },
        { tarih: "Nisan 2021", asi: "COVID-19 · CoronaVac (Sinovac)", doz: "1. doz", kurum: "Aile Sağlığı Merkezi" }
      ],
      hastaliklar: [
        { tani: "Esansiyel hipertansiyon", kod: "I10", tarih: "6 yıl önce", gecmisId: "ozgecmis_hipertansiyon" },
        { tani: "Saf hiperkolesterolemi", kod: "E78.0", tarih: "3 yıl önce", gecmisId: "ozgecmis_dislipidemi" }
      ],
      alerjiler: [],
      radyoloji: [
        { tarih: "8 ay önce", tetkik: "Akciğer grafisi (PA)", rapor: "Aktif akciğer patolojisi izlenmedi." }
      ]
    },

    // Muayene: sistem → bulgu. Her sistem 45 sn.
    muayene: {
      genel:     { varsayilan: "Bilinç açık, koopere. Terli, soluk ve huzursuz; elini göğsünün ortasına bastırıyor.", sok: "Bilinç açık ama halsiz. Belirgin soluk, soğuk terli." },
      kvs:       { varsayilan: "Kalp sesleri ritmik, taşikardik. Üfürüm ve frotman yok. Periferik nabızlar iki kolda eşit alınıyor.", sok: "Taşikardik. Periferik nabızlar zayıf, kapiller dolum uzamış." },
      solunum:   "Solunum sesleri iki tarafta eşit; ral ve ronküs yok.",
      batin:     "Batın rahat. Hassasiyet, defans ve rebound yok.",
      cilt:      { varsayilan: "Nemli ve soluk.", sok: "Soğuk, nemli, belirgin soluk." },
      norolojik: "Bilinç açık, oryante. Lateralize nörolojik bulgu yok."
    },

    // Tetkik sonuçları. sinif puanlamada kullanılır, oyuncuya gösterilmez. not = sonuç ekranındaki açıklama.
    // sekil: EKG çizimi ("stemi-anterior" | "sinus" | "sinus-tasikardi").
    tetkikler: {
      ekg:       { sinif: "zorunlu", sekil: "stemi-anterior", sonuc: "Sinüs taşikardisi, 104/dk. V1–V4'te ST segment elevasyonu.", not: "Tanıyı koyan tetkik: STEMI tanısı EKG ile konur." },
      kan_gazi:  { sinif: "notr", sonuc: { varsayilan: "pH 7,40 · pCO₂ 38 mmHg · HCO₃ 24 mmol/L · laktat 1,5 mmol/L. Belirgin bozukluk yok.", sok: "Metabolik asidoza eğilim, laktat yükselmiş: doku perfüzyonu bozuluyor." } },
      yb_usg:    { sinif: "notr", sonuc: "Sol ventrikül ön duvarında hareket azlığı düşündüren görünüm. Perikardiyal sıvı yok.", not: "Tanı belirsizse yardımcı olur; PKG'yi geciktirmemeli." },
      idrar:     { sinif: "notr", sonuc: "Protein, glukoz negatif; lökosit ve eritrosit yok. Normal." },
      hemogram:  { sinif: "notr", sonuc: "Lökosit 9.600/µL · Hb 14,8 g/dL · Trombosit 248.000/µL. Normal." },
      biyokimya: { sinif: "notr", sonuc: "Glukoz 142 mg/dL · Kreatinin 0,9 mg/dL · Na 139 · K 4,1 mmol/L · ALT 24 U/L." },
      crp:       { sinif: "notr", sonuc: "3 mg/L (normal)." },
      troponin:  { sinif: "notr", sonuc: "Yüksek duyarlıklı troponin T: 64 ng/L (üst sınır 14). Yüksek.", not: "Tanı için beklenmez; STEMI'de aktivasyon EKG ile yapılır." },
      akc_grafi: { sinif: "notr", sonuc: "Kalp boyutu normal, mediasten geniş değil. Akciğer alanları temiz.", not: "Rutin; PKG'yi geciktirmemeli." },
      rad_usg:   { sinif: "gereksiz", sonuc: "Batın USG: karaciğer, safra kesesi, böbrekler ve abdominal aorta olağan.", not: "Göğüs ağrısında batın USG gereksiz; reperfüzyonu geciktirir." },
      bt:        { sinif: "gereksiz", sonuc: "Toraks BT anjiyografi: aort diseksiyonu ve pulmoner emboli lehine bulgu yok.", not: "Tipik klinik ve tanısal EKG varken BT reperfüzyonu geciktirir." }
    },
    zorunluTetkikler: [
      { ad: "12 derivasyonlu EKG", idler: ["ekg"] }
    ],

    // Müdahaleler. yanit = oyunda günlüğe düşen cevap. zararliDurumlar = bu durumdayken yapılırsa zararlı.
    // gerekenSonuc = bu tetkikin sonucu gelmeden müdahale kabul edilmez (gerekenYoksa metni yazılır).
    mudahaleler: {
      damar_yolu:     { sinif: "kritik", yanit: "Damar yolu açıldı, kan örnekleri alınabilir." },
      aspirin:        { sinif: "kritik", yanit: "Aspirin çiğnetildi." },
      pkg:            { sinif: "kritik", yanit: "Kardiyoloji aktive edildi: kateter laboratuvarı ekibi çağrıldı, hasta anjiyografiye alınacak.",
                        gerekenSonuc: "ekg", gerekenYoksa: "Kardiyoloji: \"EKG'yi görmeden kateter laboratuvarını açamayız. Önce EKG çekip gönderin.\"" },
      oksijen:        { sinif: "gereksiz", yanit: "Maske ile oksijen başlandı.", not: "SpO₂ %90 ve üstündeyken rutin oksijen önerilmez (ESC). Ceza yok, sadece not." },
      nitrat:         { sinif: "notr", zararliDurumlar: ["sok"], yanit: "Dil altı nitrat verildi.", not: "Tansiyon yüksekken ağrı için verilebilir; hipotansiyonda (şok) verilmez." },
      iv_sivi:        { sinif: "gereksiz", yanit: "Serum fizyolojik bolusu başlandı.", not: "Hipotansiyon yokken sıvı bolusu endike değil." },
      adrenalin_im:   { sinif: "zararli", yanit: "Adrenalin IM yapıldı. Nabız hızlandı.", not: "Anafilaksi yokken adrenalin kalbin yükünü ve iskemiyi artırır." },
      adrenalin_iv:   { sinif: "zararli", yanit: "Adrenalin IV bolus verildi.", not: "Arrest dışında IV bolus adrenalin zararlıdır." },
      antihistaminik: { sinif: "gereksiz", yanit: "Antihistaminik verildi." },
      steroid:        { sinif: "gereksiz", yanit: "Steroid verildi." },
      salbutamol:     { sinif: "gereksiz", yanit: "Salbutamol nebül başlandı.", not: "Bronkospazm yok; taşikardiyi artırır." },
      analjezi:       { sinif: "notr", yanit: "IV analjezik verildi.", not: "Puan etkisi yok. Not: akut koroner sendromda NSAİİ kullanılmaz." },
      antibiyotik:    { sinif: "gereksiz", yanit: "IV antibiyotik başlandı." },
      antiasit:       { sinif: "gereksiz", yanit: "Antiasit verildi. Ağrı değişmedi.", not: "Reflü çeldiricidir: EKG'ye bakmadan antiasitle geçiştirmek klasik hatadır." },
      oral_kes:       { sinif: "notr", yanit: "Ağızdan alım kesildi." },
      bacak_kaldir:   { sinif: "gereksiz", yanit: "Hasta sırtüstü yatırıldı, bacakları kaldırıldı." },
      cerrahi:        { sinif: "gereksiz", yanit: "Genel cerrahi: \"Cerrahi bir sorun düşünmüyoruz.\"", not: "Cerrahi bir tablo yok; zaman kaybı." },
      gozlem:         { sinif: "gereksiz", yanit: "Hasta gözlem alanına alındı.", not: "STEMI gözlemle yönetilmez; reperfüzyon gecikir." },
      aile:           { sinif: "gereksiz", yanit: "Eşi zaten yanında; evde başka hasta yok." },
      hbo:            { sinif: "gereksiz", yanit: "Hiperbarik merkez: \"Endikasyon yok.\"" },
      taburcu:        { sinif: "zararli", yanit: "Hasta taburcu edildi.", not: "STEMI'li hasta taburcu edilmez." }
    },

    // Puanlama (toplam 1000). Ayrıntı README'de.
    puanlama: {
      tani: 400,
      // Kritikler: hedefDk içinde tam puan, geç yapılırsa yarım, hiç yapılmazsa 0.
      // beklemeden: bu tetkikin sonucu geldikten SONRA yapılırsa geç sayılır.
      kritikler: [
        { id: "ekg",        ad: "12 derivasyonlu EKG çekildi",        puan: 100, hedefDk: 10 },
        { id: "pkg",        ad: "Primer PKG aktivasyonu",             puan: 100, hedefDk: 30, beklemeden: "troponin", not: "Tanı EKG ile konur; troponin beklenmez." },
        { id: "aspirin",    ad: "Aspirin çiğnetildi",                 puan: 75,  hedefDk: 30 },
        { id: "monitor",    ad: "Monitöre bağlandı",                  puan: 40,  hedefDk: 10 },
        { id: "damar_yolu", ad: "Damar yolu açıldı",                  puan: 35,  hedefDk: 30 }
      ],
      // Hedef süreler: içinde ise tam puan, değilse 0. baslangic verilirse süre o işlemden itibaren sayılır.
      hedefler: [
        { id: "ekg", ad: "İlk EKG ≤ 10 dk", hedefDk: 10, puan: 90, kaynak: "ESC 2023" },
        { id: "pkg", baslangic: "ekg", ad: "EKG sonucundan PKG aktivasyonuna ≤ 10 dk", hedefDk: 10, puan: 60, kaynak: "oyun hedefi" }
      ],
      // Verimlilik: maliyet ve toplam vaka süresi hedefin altındaysa tam, "sifir" değerinde 0.
      verimlilik: { puan: 100, maliyetHedef: 1000, maliyetSifir: 3000, sureHedefDk: 20, sureSifirDk: 60 }
    },

    // Tanı listesi (oyuncuya bu sırayla gösterilir). not = sonuç ekranında açıklama.
    tanilar: [
      { id: "reflu",      ad: "Gastroözofageal reflü",          not: "Yanma tarzında, yemekle ilişkili ağrı beklenirdi. Terleme, kola yayılan baskı ve EKG değişikliği reflüyle açıklanmaz." },
      { id: "diseksiyon", ad: "Aort diseksiyonu",               not: "Ani, yırtılır tarzda, sırta yayılan ağrı ve kollar arasında nabız/tansiyon farkı beklenirdi. Bu hastada yok." },
      { id: "stemi",      ad: "Akut anterior STEMI", dogru: true, not: "Tipik iskemik ağrı + V1–V4'te ST elevasyonu. Tanı EKG ile konur, troponin beklenmez." },
      { id: "perikardit", ad: "Akut perikardit",                not: "Nefesle ve pozisyonla değişen ağrı, yaygın ST elevasyonu beklenirdi. Burada ST elevasyonu V1–V4 ile sınırlı ve ağrı pozisyonla değişmiyor." },
      { id: "pe",         ad: "Pulmoner emboli",                not: "Ani nefes darlığı, plöretik ağrı, belirgin hipoksemi ve risk faktörü (yolculuk, ameliyat, bacak şişliği) beklenirdi." },
      { id: "panik",      ad: "Panik atak",                     not: "Dışlama tanısıdır; EKG'de ST elevasyonu varken konmaz." },
      { id: "kas",        ad: "Kas-iskelet kaynaklı ağrı",      not: "Bastırmakla ve hareketle artan ağrı beklenirdi; EKG değişikliğini açıklamaz." }
    ],

    // Sonuç ekranındaki kılavuz kartı (QRH tarzı).
    // Düşünce dolabı (Disco Elysium'un düşünce dolabı gibi): bulgu toplandıkça açılır, oyuncu en fazla 3'ünü dolaba koyar.
    // acan: herhangi biri görülünce açılır · destek / curutur: görülen kanıt düşünceyi güçlendirir ya da zayıflatır. Puanı etkilemez.
    // Kanıt anahtarları: soru:<id> · muayene:<id> · sonuc:<tetkik> · gecmis:<id> · vital:<k> · eb:<bölüm> · mudahale:<id>
    dusunceler: [
      { id: "iskemi", ad: "Kalp mi sıkışıyor?", tani: "stemi", metin: "Göğüste baskı, sola yayılım, soğuk ter. Kalbin bir bölgesi kansız kalıyor olabilir.",
        acan: ["soru:nitelik", "soru:yayilim", "soru:eslik"],
        destek: ["soru:yayilim", "soru:eslik", "sonuc:ekg", "gecmis:soygecmis_kalp", "soru:sigara", "gecmis:enabiz_acil"], curutur: [] },
      { id: "diseksiyon", ad: "Aort yırtılıyor olabilir mi?", tani: "diseksiyon", metin: "Göğüs ağrısında atlanmaması gereken tehlike: yırtılır gibi, sırta vuran ağrı, kollar arasında nabız farkı.",
        acan: ["soru:sirt", "soru:nitelik"],
        destek: [], curutur: ["soru:sirt", "muayene:kvs"] },
      { id: "pe", ad: "Akciğere pıhtı mı attı?", tani: "pe", metin: "Ani nefes darlığı, düşük satürasyon, uzun yolculuk ya da ameliyat?",
        acan: ["soru:emboli", "vital:spo2"],
        destek: [], curutur: ["soru:emboli", "vital:spo2"] },
      { id: "perikardit", ad: "Kalp zarı mı iltihaplı?", tani: "perikardit", metin: "Nefesle ve pozisyonla değişen ağrı, yaygın ST yükselmesi?",
        acan: ["soru:pozisyon"],
        destek: [], curutur: ["soru:pozisyon", "sonuc:ekg"] },
      { id: "reflu", ad: "Mide mi yanıyor?", tani: "reflu", metin: "Reflüsü varmış. Ama mide ağrısı soğuk ter döktürür mü?",
        acan: ["gecmis:ozgecmis_reflu", "soru:nitelik"],
        destek: ["gecmis:ozgecmis_reflu"], curutur: ["soru:eslik", "sonuc:ekg"] }
    ],

    kilavuz: {
      baslik: "Akut anterior STEMI",
      adimlar: [
        "Göğüs ağrısında ilk 10 dakika içinde 12 derivasyonlu EKG çek ve yorumla.",
        "Monitöre bağla, damar yolu aç, defibrilatörü hazır tut.",
        "ST elevasyonu varsa tanı EKG ile konur: primer PKG'yi hemen aktive et, troponini bekleme.",
        "Kontrendikasyon yoksa aspirin çiğnet (yükleme dozu 150–300 mg, ağızdan).",
        "SpO₂ %90'ın altında değilse rutin oksijen verme.",
        "Hastayı kateter laboratuvarına aktar. PKG merkezinde tanıdan tel geçişine ≤ 60 dk; 120 dk içinde PKG yapılamayacaksa fibrinolitik düşünülür."
      ],
      kirmiziBayraklar: [
        "Hipotansiyon, soğuk-nemli cilt, taşikardi: kardiyojenik şok.",
        "VF / VT: defibrilasyon. Monitörsüz STEMI hastası bırakılmaz.",
        "Yırtılır tarzda, sırta yayılan ağrı veya kollar arası nabız farkı: aort diseksiyonunu düşün, antitrombotik vermeden önce dışla."
      ],
      kaynak: "ESC 2023 Akut Koroner Sendrom Kılavuzu (Byrne ve ark., European Heart Journal 2023)"
    }
  },

  /* ===================================================================
     VAKA 2 · KARIN AĞRISI (gizli tanı: akut apandisit)
     =================================================================== */
  {
    id: "karin-agrisi",
    baslik: "Karın ağrısı",
    sahne: "img/ai/bg-sari-alan.webp",                 // PC sürümünde sahnenin arka planı
    triyaj: "sari",               // doğru triyaj alanı: kirmizi | sari | yesil (hekim onayı)
    // Hasta yakını: belli bir anda bütün ekranı kaplar, soru sorar. 3 cevap + görmezden gel. Puanı etkilemez.
    yakin: {
      ad: "Ev arkadaşı", portre: "img/ai/yakin-karin.webp",
      olaylar: [
        { id: "arkadas-1", sonraSn: 120,
          soru: "Hocam, triyajda bir saat bekledik zaten! Çocuk kıvranıyor, ne zaman bir şey yapacaksınız?",
          tekrarSoru: "Hocam, size diyorum! Bu ne biçim acil ya?",
          secenekler: [
            { ad: "“Arkadaşınla şu an ilgileniyorum. Muayene ediyorum, tahlillerini istiyorum, ağrısı için de ilaç vereceğiz. Sonuçlar gelince seni bilgilendireceğim.”", tur: "iyi", sureSn: 25,
              cevap: "Tamam hocam, kusura bakmayın. Çok korktum.", ercan: "Hocam, ağrı kesici dedin; sözünü tut, unutma." },
            { ad: "“Önemli bir şey değil, gaz sancısıdır. Rahat ol.”", tur: "kotu", sureSn: 15,
              cevap: "Gaz mı? Dünden beri kıvranıyor...", ercan: "Hocam, muayene bitmeden 'önemli değil' deme." },
            { ad: "“Burası acil, sırayla bakıyoruz. Dışarı çık.”", tur: "sert", sureSn: 10,
              cevap: "Bu ne biçim hastane ya! Şikâyet edeceğim!", ercan: "Hocam, sesini yükseltene sesini yükseltme. İki cümle bilgi, sorun biter." }
          ],
          gormezden: { cevap: "Hocam! Hocam, size diyorum!", ercan: "Hocam, çocuk sinirlendi. Bir dakikanı ver, yoksa iş büyür.", tekrarSn: 120 } }
      ]
    },
    onay: { durum: "DEMO — hekim onayı bekliyor", dogrulayan: "", tarih: "" },
    hasta: { yas: 28, cinsiyet: "Erkek" },
    sikayet: "Dünden beri karnım ağrıyor, şimdi sağ tarafıma vurdu.",

    durumlar: {
      baslangic: {
        gorsel: "img/ai/karin-1.webp",
        ton: ["agri"],
        gorunus: "Hafif öne eğik yürüyor, eli sağ alt karnında. Yüzünde ağrı ifadesi var.",
        vitaller: { ta: "124/78", nabiz: 98, spo2: 98, solunum: 18, ates: 37.9, seker: 96, gks: 15, ritim: "Sinüs ritmi" }
      },
      rahatladi: {
        gorsel: "img/ai/karin-1.webp",
        ton: [],
        gorunus: "Ağrısı biraz hafiflemiş, sedyede daha rahat yatıyor. Eli hâlâ sağ alt karnında.",
        mesaj: "Analjezi sonrası hastanın ağrısı hafifledi.",
        iyi: true,
        vitaller: { nabiz: 88 }
      },
      perforasyon: {
        gorsel: "img/ai/karin-2.webp",
        ton: ["terli", "agri"],
        gorunus: "Dizlerini karnına çekmiş, kıpırdamadan yatıyor. Terli ve ateşli; karnına dokunulmasına izin vermiyor.",
        mesaj: "Hastanın durumu kötüleşiyor: ateş yükseldi, karın her yerde ağrıyor.",
        vitaller: { ates: 38.8, nabiz: 118, ritim: "Sinüs taşikardisi" },
        ceza: { puan: 150, ad: "Perforasyon gelişti (cerrahi gecikti)" }
      }
    },

    seyir: [
      { mudahale: "analjezi", sonraDk: 10, durum: "rahatladi", sadece: ["baslangic"] },
      // Perforasyon riski semptom başlangıcından ~36 saat sonra belirgin artar (Bickell 2006); ≤24 sa hastane içi
      // gecikme perforasyonu artırmaz (WSES 2020). Hasta 12. saatte geldi → oyunda 24. saatte perforasyon.
      { saatDk: 1440, durum: "perforasyon", onleyen: ["cerrahi"] }
    ],

    oyku: [
      { id: "baslangic", soru: "Ağrı ne zaman başladı?",                              cevap: "Dün akşam başladı. On iki saat falan oldu." },
      { id: "yer",       soru: "Ağrı ilk nerede başladı, şimdi nerede?", anahtar: "nerede hangi taraf sağ alt göbek yer",              cevap: "Önce göbeğimin etrafındaydı, tam yerini gösteremiyordum. Sonra sağ alta indi, şimdi hep burada." },
      { id: "nitelik",   soru: "Ağrı nasıl? Hareketle ya da öksürünce artıyor mu?",   cevap: "Sürekli bir ağrı. Yürürken, öksürünce daha çok saplanıyor." },
      { id: "istah",     soru: "İştahınız nasıl? Bulantı, kusma var mı?", anahtar: "iştah bulantı kusma yemek yiyemedim",             cevap: "Dünden beri hiçbir şey yiyemedim, canım istemiyor. Midem bulanıyor ama kusmadım." },
      { id: "ates",      soru: "Ateşiniz oldu mu?",                                   cevap: "Biraz halsizim, ateşim var gibi ama ölçmedim." },
      { id: "idrar",     soru: "İdrar yaparken yanma, sık idrara çıkma ya da kan var mı?", cevap: "Yok, idrarım normal." },
      { id: "kolik",     soru: "Ağrı dalga dalga mı geliyor? Sırtınıza ya da kasığınıza vuruyor mu?", anahtar: "dalga dalga kasık sırt gelip giden", cevap: "Gelip giden bir ağrı değil, hep orada. Sırtıma, kasığıma vurmuyor." },
      { id: "ishal",     soru: "İshal ya da kabızlık var mı? Çevrenizde benzer şikâyeti olan var mı?", cevap: "İshal olmadım, tuvaletim normal. Evde herkes iyi." },
      { id: "ozgecmis",  soru: "Daha önce ameliyat oldunuz mu? Hastalığınız, ilacınız var mı?", cevap: "Hiç ameliyat olmadım. Hastalığım yok, ilaç kullanmıyorum." },
      { id: "son-yemek", soru: "En son ne zaman yediniz, içtiniz?", anahtar: "en son yemek içmek ne zaman yedi",                   cevap: "Dün öğlen yemek yedim. Sabah birkaç yudum su içtim, o kadar." }
    ],

    // Hasta geçmişi (kaynak: arastirma/hasta-gecmisi-ve-gorsel-ipuclari.md). kaynak: hasta | yakin | enabiz.
    // onem: ipucu | notr | celdirici (oyunda gösterilmez; sonuç ekranında kaçırılan ipuçları için).
    gecmis: [
      { id: "ozgecmis_ameliyat", kategori: "Özgeçmiş", ad: "Geçirilmiş ameliyatlar", ozet: "Geçirilmiş ameliyatlar", kaynak: "hasta", cevap: "Hiç ameliyat olmadım. Apandisitim de alınmadı, o yüzden bu sefer korkuyorum.", onem: "ipucu", not: "Apendektomi öyküsü yok = apendiks yerinde, tanı mümkün. Karın ameliyatı/yapışıklık da yok." },
      { id: "ozgecmis_gastrit", kategori: "e-Nabız", ad: "Poliklinik başvuruları", ozet: "1 yıl önce poliklinik: dispepsi", kaynak: "enabiz", cevap: "1 yıl önce aile hekimi: üst karın yanması, 2 hafta PPI. Endoskopi yapılmamış. (Hastaya sorulursa: \"Mide yanmam olmuştu, geçti.\")", onem: "celdirici", not: "Eski dispepsi 'mide ağrısı' yanılgısını besler; ama mevcut ağrı göbekten sağ alt kadrana göç etti, üst karın değil [K6]. Çeldirici." },
      { id: "soygecmis_apandisit", kategori: "Soygeçmiş", ad: "Ailede karın ameliyatı olan var mı?", ozet: "Ailede apandisit", kaynak: "hasta", cevap: "Kardeşim 15 yaşındayken apandisit ameliyatı oldu.", onem: "notr", not: "Aile öyküsü riski hafif artırır ama AIR/Alvarado/AAS içinde yoktur ve tanıyı koydurmaz [K6][K7][K8]. Tanıya katkısı sınırlı: bu yüzden ipucu değil nötr (hekim onayı gerekli: ilişki büyüklüğü)." },
      { id: "soygecmis_crohn", kategori: "Soygeçmiş", ad: "Ailede bağırsak hastalığı var mı?", ozet: "Ailede bağırsak hastalığı", kaynak: "hasta", cevap: "Dayım Crohn hastası, sık hastaneye yatardı.", onem: "celdirici", not: "Crohn terminal ileiti sağ alt kadran ağrısı ve CRP yüksekliği yapabilir. Ama kronik/tekrarlayan seyir, ishal ve kilo kaybı beklenir; bu hastada akut başlangıç, göç eden ağrı, iştahsızlık ve USG'de 9 mm apendiks var. İkinci derece akraba, risk artışı küçük. Klinik bilgi, kılavuz maddesi yok (hekim onayı gerekli)." },
      { id: "ilac_analjezik", kategori: "Kullandığı ilaçlar", ad: "Gelmeden önce ilaç aldı mı?", ozet: "Dün gece ağrı kesici", kaynak: "yakin", cevap: "(Ev arkadaşı) Dün gece 500 mg parasetamol içti, ağrısı biraz azaldı, sabaha doğru geri geldi. Düzenli ilacı yok.", onem: "notr", not: "Oral analjezik ağrıyı bastırabilir ama tanıyı maskelemez; analjezi tanı hatasını artırmaz [K9]. Bu yüzden analjezi vermekten kaçınılmaz." },
      { id: "alerji_ilac", kategori: "Alerjiler", ad: "İlaç ve lateks alerjisi", ozet: "İlaç ve lateks alerjisi", kaynak: "hasta", cevap: "Yok. Penisilin de dahil, hiçbir ilaca alerjim olmadı.", onem: "notr", not: "Ameliyat öncesi tek doz geniş spektrumlu antibiyotik için güvenlik bilgisi (WSES Rec 7.1) [K6]." },
      { id: "sosyal_yemek", kategori: "Sosyal öykü", ad: "Dün ne yedi, çevrede hasta var mı?", ozet: "Dün ne yedi, kimlerle", kaynak: "yakin", cevap: "(Ev arkadaşı) Dün öğlen beraber dışarıda tavuk dürüm yedik, ben gayet iyiyim. Evde de kimse hasta değil. Sigara içmez, alkolü ara sıra içer; üniversitede mühendislik okuyor.", onem: "ipucu", not: "Aynı yemeği yiyen kişide belirti yok, çevrede ishal/kusma yok: gıda zehirlenmesi/gastroenterit olasılığını azaltır; apandisit lehine dolaylı ipucu. Klinik mantık, kılavuz maddesi yok (hekim onayı gerekli)." },
      { id: "enabiz_bobrek_tasi", kategori: "e-Nabız", ad: "Önceki acil başvuruları", ozet: "4 yıl önce acil: böbrek taşı", kaynak: "enabiz", cevap: "4 yıl önce acil: sağ böğürde dalga dalga ağrı, idrarda kan. BT'de 4 mm sağ üreter taşı, kendiliğinden düştü, taburcu. (Hastaya sorulursa: \"Taş düşürmüştüm ama o ağrı çok başkaydı.\")", onem: "celdirici", not: "Üreter taşı ayırıcı tanıdır; ama kolik tarzı (dalga dalga, kasığa yayılan), hematüri ve normal iştah beklenir. Bu hastada sürekli ağrı, idrar normal, iştahsızlık: taş öyküsü yanıltıcıdır [K6]." },
      { id: "enabiz_tahlil", kategori: "e-Nabız", ad: "Eski tahlilleri", ozet: "6 ay önce check-up tahlili", kaynak: "enabiz", cevap: "6 ay önce işe giriş muayenesi: lökosit 6.800/µL, CRP 1 mg/L, hemoglobin 15,3 g/dL. Hepsi normal.", onem: "ipucu", not: "Kendi baz çizgisi normal: güncel lökosit 14.200/µL ve CRP 48 mg/L akut inflamasyonu gösterir. Kılavuz değil, klinik mantık (hekim onayı gerekli)." }
    ],

    // e-Nabız (oyun içi temsilî kayıt). gecmisId: bu satırı görünce o geçmiş kaydı "bakıldı" sayılır.
    enabiz: {
      ziyaretler: [
        { tarih: "6 ay önce", kurum: "İş yeri hekimliği", tani: "İşe giriş muayenesi (Z02.1)", not: "Muayene ve tahliller normal.", gecmisId: "enabiz_tahlil" },
        { tarih: "1 yıl önce", kurum: "Aile Sağlığı Merkezi", tani: "Dispepsi (K30)", not: "Üst karında yanma. 2 hafta mide koruyucu verildi. Endoskopi yapılmamış.", gecmisId: "ozgecmis_gastrit" },
        { tarih: "4 yıl önce", kurum: "Devlet Hastanesi · Acil Servis", tani: "Üreter taşı (N20.1)", not: "Sağ böğürde dalga dalga ağrı, idrarda kan. BT'de 4 mm sağ üreter taşı. Kendiliğinden düştü, taburcu.", gecmisId: "enabiz_bobrek_tasi" },
        { tarih: "Ocak 2022", kurum: "Aile Sağlığı Merkezi", tani: "COVID-19, virüs tanımlandı (U07.1)", not: "Hafif seyir: boğaz ağrısı, halsizlik. 7 gün evde izolasyon." }
      ],
      tahliller: [
        { tarih: "6 ay önce", test: "Lökosit (WBC)", sonuc: "6,8", birim: "10³/µL", referans: "4,0–10,0", durum: "normal", gecmisId: "enabiz_tahlil" },
        { tarih: "6 ay önce", test: "CRP", sonuc: "1", birim: "mg/L", referans: "< 5", durum: "normal", gecmisId: "enabiz_tahlil" },
        { tarih: "6 ay önce", test: "Hemoglobin", sonuc: "15,3", birim: "g/dL", referans: "13,5–17,5", durum: "normal", gecmisId: "enabiz_tahlil" },
        { tarih: "Ocak 2022", test: "SARS-CoV-2 PCR", sonuc: "Pozitif", birim: "", referans: "Negatif", durum: "yuksek" },
        { tarih: "Temmuz 2021", test: "SARS-CoV-2 PCR", sonuc: "Negatif", birim: "", referans: "Negatif", durum: "normal" }
      ],
      receteler: [
        { tarih: "1 yıl önce", ilac: "Pantoprazol 40 mg", kullanim: "Günde 1, 14 gün", not: "", gecmisId: "ozgecmis_gastrit" }
      ],
      asilar: [
        { tarih: "Ağustos 2021", asi: "COVID-19 · BioNTech", doz: "2. doz", kurum: "Aile Sağlığı Merkezi" },
        { tarih: "Temmuz 2021", asi: "COVID-19 · BioNTech", doz: "1. doz", kurum: "Aile Sağlığı Merkezi" },
        { tarih: "Mart 2019", asi: "Td (tetanoz-difteri)", doz: "Rapel", kurum: "Devlet Hastanesi · Acil Servis" }
      ],
      hastaliklar: [],
      alerjiler: [],
      radyoloji: [
        { tarih: "4 yıl önce", tetkik: "BT (üriner sistem)", rapor: "Sağ üreterde 4 mm taş.", gecmisId: "enabiz_bobrek_tasi" }
      ]
    },

    muayene: {
      genel:     { varsayilan: "Bilinç açık, koopere. Ağrılı görünüyor, hareket etmekten kaçınıyor.", rahatladi: "Bilinç açık, koopere. Ağrısı hafiflemiş, daha rahat.", perforasyon: "Ağrılı ve terli; dizlerini karnına çekmiş, kıpırdamıyor." },
      kvs:       { varsayilan: "Kalp sesleri ritmik; ek ses ve üfürüm yok.", perforasyon: "Taşikardik; ek ses ve üfürüm yok." },
      solunum:   "Solunum sesleri doğal.",
      batin:     {
        varsayilan: "Sağ alt kadranda, McBurney noktasında belirgin hassasiyet; rebound pozitif. Yaygın defans yok. Kostovertebral açı hassasiyeti yok.",
        rahatladi: "Sağ alt kadranda McBurney hassasiyeti ve rebound devam ediyor: analjezi bulguyu ortadan kaldırmadı.",
        perforasyon: "Batında yaygın hassasiyet ve yaygın defans; rebound her yerde pozitif."
      },
      cilt:      { varsayilan: "Doğal.", perforasyon: "Sıcak ve terli." },
      norolojik: "Doğal. Lateralize bulgu yok."
    },

    tetkikler: {
      ekg:       { sinif: "notr", sekil: "sinus", sonuc: "Sinüs ritmi, 98/dk. Normal EKG." },
      kan_gazi:  { sinif: "notr", sonuc: "pH 7,40 · pCO₂ 39 mmHg · HCO₃ 24 mmol/L · laktat 1,2 mmol/L. Normal." },
      yb_usg:    { sinif: "gerekli", sonuc: "Sağ alt kadranda, ağrılı noktada basıyla kapanmayan, yaklaşık 9 mm çaplı tübüler yapı. Akut apandisit lehine (yatak başı bakış, radyoloji raporu değil)." },
      idrar:     { sinif: "gerekli", sonuc: "Lökosit 0–1, eritrosit 0–1, nitrit negatif. Normal.", not: "Üreter taşı ve idrar yolu enfeksiyonunu ayırmaya yardım eder." },
      hemogram:  { sinif: "zorunlu", sonuc: "Lökosit 14.200/µL (nötrofil hâkimiyeti) · Hb 15,1 g/dL · Trombosit 262.000/µL." },
      biyokimya: { sinif: "notr", sonuc: "Glukoz 96 mg/dL · Kreatinin 0,8 mg/dL · Na 140 · K 4,0 mmol/L · ALT 18 U/L · bilirubin normal." },
      crp:       { sinif: "gerekli", sonuc: "48 mg/L (yüksek; normal < 5)." },
      troponin:  { sinif: "gereksiz", sonuc: "< 5 ng/L (normal).", not: "Kardiyak bir tablo düşündüren bulgu yok." },
      akc_grafi: { sinif: "notr", sonuc: "Akciğer alanları temiz; diyafram altında serbest hava yok." },
      rad_usg:   { sinif: "zorunlu", sonuc: "Apendiks çapı 9 mm, basıyla kapanmıyor. Akut apandisit ile uyumlu." },
      bt:        { sinif: "gereksiz", sonuc: "Batın BT: apendiks çapı artmış, çevre yağlı dokuda inflamasyon. Akut apandisit ile uyumlu.", not: "Genç erkekte tipik klinik ve tanısal USG varken BT gereksiz radyasyon ve maliyettir." }
    },
    zorunluTetkikler: [
      { ad: "Hemogram",          idler: ["hemogram"] },
      { ad: "Görüntüleme (USG)", idler: ["rad_usg", "yb_usg", "bt"] }
    ],

    mudahaleler: {
      oral_kes:       { sinif: "kritik", yanit: "Ağızdan alım kesildi." },
      damar_yolu:     { sinif: "kritik", yanit: "Damar yolu açıldı, kan örnekleri alınabilir." },
      iv_sivi:        { sinif: "kritik", yanit: "Serum fizyolojik başlandı." },
      analjezi:       { sinif: "kritik", yanit: "IV analjezik verildi." },
      cerrahi:        { sinif: "kritik", yanit: "Genel cerrahi asistanı geldi, hastayı ameliyat açısından değerlendiriyor." },
      antibiyotik:    { sinif: "notr", yanit: "IV antibiyotik başlandı.", not: "Doğru adım: WSES ameliyat öncesi tek doz geniş spektrumlu antibiyotik önerir; genelde cerrahi kararıyla verilir. Bu demoda puanlanmıyor." },
      oksijen:        { sinif: "gereksiz", yanit: "Maske ile oksijen başlandı.", not: "SpO₂ %98; oksijen gerekmez." },
      bacak_kaldir:   { sinif: "gereksiz", yanit: "Hasta sırtüstü yatırıldı, bacakları kaldırıldı." },
      aspirin:        { sinif: "gereksiz", yanit: "Aspirin çiğnetildi.", not: "Endikasyon yok; ameliyat adayına antiagregan verilmez." },
      nitrat:         { sinif: "gereksiz", yanit: "Dil altı nitrat verildi." },
      adrenalin_im:   { sinif: "zararli", yanit: "Adrenalin IM yapıldı. Nabız hızlandı.", not: "Endikasyonu olmayan adrenalin zararlıdır." },
      adrenalin_iv:   { sinif: "zararli", yanit: "Adrenalin IV bolus verildi.", not: "Arrest dışında IV bolus adrenalin zararlıdır." },
      antihistaminik: { sinif: "gereksiz", yanit: "Antihistaminik verildi." },
      steroid:        { sinif: "gereksiz", yanit: "Steroid verildi." },
      salbutamol:     { sinif: "gereksiz", yanit: "Salbutamol nebül başlandı." },
      antiasit:       { sinif: "gereksiz", yanit: "Antiasit verildi. Ağrı değişmedi.", not: "Ağızdan alım kesilmesi gereken hastada ağızdan ilaç verilmez." },
      pkg:            { sinif: "gereksiz", yanit: "Kardiyoloji: \"Kardiyak bir tablo düşündüren bulgu yok.\"", not: "Kardiyak bir tablo yok; zaman kaybı." },
      gozlem:         { sinif: "gereksiz", yanit: "Hasta gözlem alanına alındı.", not: "Tanı belliyken cerrahi konsültasyon yerine gözlem ameliyatı geciktirir." },
      aile:           { sinif: "gereksiz", yanit: "Ev arkadaşı burada; evde başka hasta yok." },
      hbo:            { sinif: "gereksiz", yanit: "Hiperbarik merkez: \"Endikasyon yok.\"" },
      taburcu:        { sinif: "zararli", yanit: "Hasta taburcu edildi.", not: "Akut apandisitli hasta taburcu edilmez; perforasyon riski." }
    },

    puanlama: {
      tani: 400,
      kritikler: [
        { id: "oral_kes",   ad: "Ağızdan alım kesildi",          puan: 60,  hedefDk: 30 },
        { id: "damar_yolu", ad: "Damar yolu açıldı",             puan: 50,  hedefDk: 30 },
        { id: "iv_sivi",    ad: "IV sıvı başlandı",              puan: 50,  hedefDk: 60 },
        { id: "analjezi",   ad: "Analjezi verildi",              puan: 90,  hedefDk: 30, not: "Analjezi tanıyı maskelemez; ağrılı hasta bekletilmez." },
        { id: "cerrahi",    ad: "Genel cerrahi konsültasyonu",   puan: 100, hedefDk: 90 }
      ],
      hedefler: [
        { id: "analjezi", ad: "Analjezi ≤ 20 dk", hedefDk: 20, puan: 50, kaynak: "oyun hedefi" },
        { id: ["rad_usg", "yb_usg"], olcut: "istek", ad: "USG istemi ≤ 20 dk", hedefDk: 20, puan: 40, kaynak: "oyun hedefi" },
        { id: "cerrahi", ad: "Cerrahi konsültasyonu ≤ 60 dk", hedefDk: 60, puan: 60, kaynak: "oyun hedefi" }
      ],
      verimlilik: { puan: 100, maliyetHedef: 1100, maliyetSifir: 3500, sureHedefDk: 60, sureSifirDk: 180 }
    },

    tanilar: [
      { id: "gastroenterit", ad: "Akut gastroenterit",       not: "İshal ve kusma ön planda, yaygın kramp tarzı ağrı beklenirdi; lokalize periton bulgusu beklenmez." },
      { id: "ureter",        ad: "Sağ üreter taşı",          not: "Dalga dalga gelen, böğürden kasığa yayılan ağrı ve idrarda eritrosit beklenirdi; idrar normal." },
      { id: "apandisit",     ad: "Akut apandisit", dogru: true, not: "Göbek çevresinden sağ alt kadrana göç eden ağrı, iştahsızlık, McBurney hassasiyeti, rebound, lökositoz, CRP yüksekliği ve USG'de 9 mm basıyla kapanmayan apendiks." },
      { id: "kolesistit",    ad: "Akut kolesistit",          not: "Sağ üst kadran ağrısı, Murphy bulgusu ve safra kesesinde duvar kalınlaşması beklenirdi." },
      { id: "lenfadenit",    ad: "Mezenter lenfadenit",      not: "Genellikle çocuk ve gençlerde, çoğu kez üst solunum yolu enfeksiyonu sonrası; USG'de büyümüş lenf nodları ve normal apendiks beklenirdi." },
      { id: "meckel",        ad: "Meckel divertiküliti",     not: "Apandisite benzeyebilir ama nadirdir; burada USG apendiks patolojisini gösterdi." }
    ],

    // Düşünce dolabı: bulgu toplandıkça açılır, en fazla 3'ü dolaba konur. Puanı etkilemez.
    dusunceler: [
      { id: "apandisit", ad: "Apandiks mi iltihaplandı?", tani: "apandisit", metin: "Göbekten başlayıp sağ alta inen ağrı, iştahsızlık. Klasik yolculuk.",
        acan: ["soru:yer", "muayene:batin"],
        destek: ["soru:yer", "soru:istah", "muayene:batin", "sonuc:hemogram", "sonuc:crp", "sonuc:rad_usg", "gecmis:ozgecmis_ameliyat"], curutur: [] },
      { id: "tas", ad: "Böbrek taşı mı düşüyor?", tani: "ureter", metin: "Daha önce taş düşürmüş. Ama taş ağrısı dalga dalga gelir, kasığa vurur.",
        acan: ["soru:kolik", "soru:idrar", "gecmis:enabiz_bobrek_tasi"],
        destek: ["gecmis:enabiz_bobrek_tasi"], curutur: ["soru:kolik", "soru:idrar", "sonuc:idrar"] },
      { id: "enfeksiyon", ad: "Bağırsak enfeksiyonu mu?", tani: "gastroenterit", metin: "Kusma, bulantı... İshal ve aynı yemeği yiyenlerde şikâyet var mı?",
        acan: ["soru:ishal", "gecmis:sosyal_yemek"],
        destek: [], curutur: ["soru:ishal", "gecmis:sosyal_yemek"] },
      { id: "safra", ad: "Safra kesesi mi?", tani: "kolesistit", metin: "Yemekten sonra sağ üstte ağrı olurdu. Bu ağrı nerede?",
        acan: ["soru:son-yemek", "soru:yer"],
        destek: [], curutur: ["soru:yer", "muayene:batin"] },
      { id: "mide", ad: "Midesi mi?", tani: "", metin: "Geçen yıl mide yanması için ilaç almış. Ama ağrı mideden aşağı inmiş.",
        acan: ["gecmis:ozgecmis_gastrit", "eb:ziyaretler"],
        destek: ["gecmis:ozgecmis_gastrit"], curutur: ["soru:yer", "muayene:batin"] }
    ],

    kilavuz: {
      baslik: "Akut apandisit",
      adimlar: [
        "Öykü ve muayene: göbek çevresinden sağ alt kadrana göç eden ağrı, iştahsızlık, McBurney hassasiyeti, rebound.",
        "Hemogram ve CRP iste; klinik skorla (AIR, AAS, Alvarado) riski sınıfla.",
        "Görüntülemede önce USG. Genç hastada tipik klinik ve tanısal USG varsa BT gerekmez.",
        "Ağızdan alımı kes, damar yolu aç, IV sıvı başla.",
        "Analjeziyi geciktirme: analjezi tanıyı maskelemez.",
        "Genel cerrahiye danış. Ameliyat öncesi tek doz geniş spektrumlu antibiyotik önerilir."
      ],
      kirmiziBayraklar: [
        "Yaygın defans, yüksek ateş, taşikardi: perforasyon / peritonit.",
        "Doğurganlık çağındaki kadında gebelik testi (dış gebelik ayırıcı tanıda).",
        "Yaşlı, gebe ve küçük çocukta tablo atipik olabilir."
      ],
      kaynak: "WSES 2020 Kudüs Kılavuzu: Akut Apandisit Tanı ve Tedavisi (Di Saverio ve ark., World Journal of Emergency Surgery 2020)"
    }
  },

  /* ===================================================================
     VAKA 3 · NEFES DARLIĞI (gizli tanı: anafilaksi, arı sokması)
     =================================================================== */
  {
    id: "nefes-darligi",
    baslik: "Nefes darlığı",
    sahne: "img/ai/bg-kirmizi-alan.webp",                 // PC sürümünde sahnenin arka planı
    triyaj: "kirmizi",               // doğru triyaj alanı: kirmizi | sari | yesil (hekim onayı)
    // Hasta yakını: belli bir anda bütün ekranı kaplar, soru sorar. 3 cevap + görmezden gel. Puanı etkilemez.
    yakin: {
      ad: "Annesi", portre: "img/ai/yakin-nefes.webp",
      olaylar: [
        { id: "anne-1", sonraSn: 75,
          soru: "Kızım nefes alamıyor! Bir şey yapın! Ölecek mi?!",
          tekrarSoru: "Hocam, kızım! Lütfen!",
          secenekler: [
            { ad: "“Ağır bir alerjik reaksiyon. İlacını hemen yapıyoruz. Yanında kalabilirsiniz, ama bize alan bırakın.”", tur: "iyi", sureSn: 15,
              cevap: "Tamam... tamam. Kızım, buradayım annecim.", ercan: "Doğru. Anneyi yanında tut, hasta sakinleşir." },
            { ad: "“Sakin olun, basit bir arı sokması, geçer.”", tur: "kotu", sureSn: 10,
              cevap: "Basit mi? Dudakları morarıyor!", ercan: "Hocam, buna basit denmez. Anneyi de kandırma, kendini de." },
            { ad: "“Lütfen çıkın, çalışamıyorum!”", tur: "sert", sureSn: 10,
              cevap: "Bırakmam onu!", ercan: "Hocam, kadını kapıya ben götürürüm, sen hastaya dön. Ama bir cümle bilgi verseydin kendisi çıkardı." }
          ],
          gormezden: { cevap: "Hocam! Kızım!", ercan: "Hocam, anneye bir cümle, sonra hastaya dön.", tekrarSn: 90 } }
      ]
    },
    onay: { durum: "DEMO — hekim onayı bekliyor", dogrulayan: "", tarih: "" },
    hasta: { yas: 24, cinsiyet: "Kadın" },
    sikayet: "Bahçede arı soktu, nefesim daralıyor, boğazım şişiyor gibi.",

    durumlar: {
      baslangic: {
        gorsel: "img/ai/nefes-1.webp",
        ton: ["kizarik", "sis"],
        gorunus: "Dudakları ve göz kapakları şiş. Boynunda ve kollarında kızarık kabarıklar var. Hırıltılı soluyor. Elinin üstünde sokma izi.",
        vitaller: { ta: "85/50", nabiz: 128, spo2: 91, solunum: 28, ates: 36.9, seker: 98, gks: 15, ritim: "Sinüs taşikardisi" }
      },
      agir: {
        gorsel: "img/ai/nefes-2.webp",
        ton: ["kizarik", "sis", "morarma"],
        gorunus: "Dudakları morarmış, konuşmakta çok zorlanıyor. Her nefeste hışırtılı bir ses (stridor) geliyor. Terli, huzursuz.",
        mesaj: "Hastanın durumu kötüleşiyor: dudaklarda morarma, stridor.",
        oykuCevabi: "(Konuşamıyor. Boğazını tutuyor, güçlükle tek kelime çıkarıyor.) \"Nefes... alamıyorum...\"",
        vitaller: { ta: "70/40", nabiz: 136, spo2: 85, solunum: 32 },
        ceza: { puan: 50, ad: "Hava yolu ve dolaşım ağırlaştı (adrenalin gecikti)" }
      },
      duzelme: {
        gorsel: "img/ai/nefes-3.webp",
        ton: ["kizarik"],
        gorunus: "Nefesi rahatladı, hırıltısı azaldı. Dudaklarındaki şişlik geriliyor, konuşabiliyor.",
        mesaj: "Adrenalin etkisini gösterdi: nefesi rahatlıyor, tansiyon yükseliyor.",
        iyi: true,
        vitaller: { ta: "105/65", nabiz: 105, spo2: 95, solunum: 22 }
      },
      arrest: {
        gorsel: "img/ai/nefes-2.webp",
        gri: true,
        ton: ["morarma"],
        gorunus: "Solunumu durdu, yanıt vermiyor.",
        mesaj: "Solunum arresti gelişti.",
        kayip: true,
        vitaller: { ta: null, nabiz: null, spo2: null, solunum: 0, gks: 3, ritim: "Nabız alınamıyor" }
      }
    },

    seyir: [
      { saatDk: 3, durum: "agir",   onleyen: ["adrenalin_im"] },
      { saatDk: 8, durum: "arrest", onleyen: ["adrenalin_im"] },
      { mudahale: "adrenalin_im", sonraDk: 3, durum: "duzelme", sadece: ["baslangic", "agir"] }
    ],

    oyku: [
      { id: "ne-oldu",      soru: "Ne oldu, ne zaman oldu?", anahtar: "arı sokma soktu ne oldu ne zaman",                              cevap: "Bahçede çiçekleri suluyordum, bir arı elimin üstünden soktu. On dakika falan oldu, sonra her şey hızlandı." },
      { id: "belirti",      soru: "Şu an neler hissediyorsunuz?", anahtar: "ne hissediyorsun şikâyet boğaz kaşıntı",                         cevap: "Boğazım şişiyor gibi, yutkunamıyorum. Nefes alırken hırıltı geliyor. Her yerim kaşınıyor." },
      { id: "once",         soru: "Daha önce arı soktu mu, böyle bir şey oldu mu?", anahtar: "daha önce arı soktu reaksiyon",       cevap: "Çocukken bir kere soktu, sadece o yer şişmişti. Böyle bir şey hiç olmadı." },
      { id: "astim",        soru: "Astımınız ya da başka bir alerjiniz var mı?",          cevap: "Astımım yok. İlaç ya da yiyecek alerjim yok." },
      { id: "ilac",         soru: "Düzenli kullandığınız bir ilaç var mı?",               cevap: "Tansiyon ya da kalp ilacı kullanmıyorum, doğum kontrol hapı dışında bir şey yok." },
      { id: "bas-donmesi",  soru: "Başınız dönüyor mu, bayılacak gibi oluyor musunuz?",   cevap: "Evet, başım dönüyor, gözlerim kararıyor." },
      { id: "karin",        soru: "Karın ağrısı, bulantı ya da kusma var mı?",            cevap: "Midem bulanıyor, karnıma kramp giriyor." },
      { id: "panik",        soru: "Daha önce panik atak ya da benzer nöbetler yaşadınız mı?", cevap: "Hayır, hiç. Bu farklı, gerçekten nefes alamıyorum." },
      { id: "otoenjektor",  soru: "Yanınızda adrenalin kalemi (oto-enjektör) var mı?",    cevap: "Hayır, öyle bir şeyim yok. Hiç duymadım." },
      { id: "gebelik",      soru: "Hamilelik ihtimaliniz var mı?",                        cevap: "Hayır, yok." }
    ],

    // Hasta geçmişi (kaynak: arastirma/hasta-gecmisi-ve-gorsel-ipuclari.md). kaynak: hasta | yakin | enabiz.
    // onem: ipucu | notr | celdirici (oyunda gösterilmez; sonuç ekranında kaçırılan ipuçları için).
    gecmis: [
      { id: "ozgecmis_onceki_sokma", kategori: "Özgeçmiş", ad: "Daha önce arı soktu mu?", ozet: "Daha önceki arı sokması", kaynak: "hasta", cevap: "Çocukken bir kere soktu, kolum bir gün şişmişti. Ondan sonra hiç sokulmadım.", onem: "ipucu", not: "Geniş lokal reaksiyon duyarlanma gösterir; sonraki sokmada sistemik reaksiyon olasılığı artar (JTF 2016, rakam için hekim onayı gerekli) [K10]." },
      { id: "ozgecmis_atopi", kategori: "e-Nabız", ad: "Poliklinik kayıtları", ozet: "Alerjik rinit (2 yıl önce KBB)", kaynak: "enabiz", cevap: "2 yıl önce KBB poliklinik: mevsimsel alerjik rinit, loratadin yazılmış. Ek not: çocuklukta hafif egzama. (Hastaya sorulursa: \"Baharda burnum akar ama buna alerji demezdim.\")", onem: "notr", not: "Atopi arı venomu anafilaksisini belirgin artırmaz [K11]; 'alerjik zemin' tuzağına düşmemeli (hekim onayı gerekli). Bu kayıt astım olmadığını da netleştirir." },
      { id: "ozgecmis_astim", kategori: "Özgeçmiş", ad: "Astım ya da kronik hastalık var mı?", ozet: "Astım ve kronik hastalık", kaynak: "hasta", cevap: "Astımım yok, hiç inhaler kullanmadım. Kalp, böbrek, tansiyon, şeker gibi bir hastalığım da yok.", onem: "notr", not: "Astım ağır anafilaksi için risk faktörüdür [K12][K13]; yokluğu hırıltıyı astım atağıyla açıklamayı zorlaştırır. Ürtiker, ödem ve hipotansiyon astımla açıklanmaz." },
      { id: "ilac_yok", kategori: "Kullandığı ilaçlar", ad: "Düzenli kullandığı ilaçlar", ozet: "Tansiyon/kalp ilacı (beta bloker, ACE inhibitörü)", kaynak: "hasta", cevap: "Tansiyon ya da kalp ilacı kullanmıyorum. Doğum kontrol hapı dışında bir şey içmiyorum.", onem: "ipucu", not: "Beta bloker adrenalin yanıtını zayıflatır; ACE-i anjiyoödem/ağır anafilaksi riskini artırır [K12][K13][K14]. Bunlar yok: adrenalinden iyi yanıt beklenir, 'ACE-i anjiyoödemi' ayırıcısı elenir." },
      { id: "ilac_oks", kategori: "e-Nabız", ad: "Reçete kayıtları", ozet: "Doğum kontrol hapı (OKS) reçetesi", kaynak: "enabiz", cevap: "8 ay önce kadın doğum poliklinik: kombine OKS yazılmış, 3 aylık yenilemeler düzenli.", onem: "celdirici", not: "OKS venöz tromboemboli riskini artırır: 'nefes darlığı + OKS' PE çeldiricisini besler. Ama ürtiker, dudak/göz kapağı ödemi, wheezing ve alerjen teması PE ile açıklanmaz [K12]. Risk artışı oranı için hekim onayı gerekli." },
      { id: "alerji_yok", kategori: "Alerjiler", ad: "İlaç ve yiyecek alerjisi", ozet: "İlaç ve yiyecek alerjisi", kaynak: "hasta", cevap: "İlaç ya da yiyecek alerjim yok. Lateks, fındık, deniz ürünü dahil hiçbirinde sorun yaşamadım.", onem: "notr", not: "Tedavi güvenliği (steroid/antihistaminik/lateks eldiven) için gerekli; 'başka tetikleyici yok' = tek aday arı sokması [K12]." },
      { id: "soygecmis_alerji", kategori: "Soygeçmiş", ad: "Ailede alerji ya da astım var mı?", ozet: "Ailede alerji ve astım", kaynak: "hasta", cevap: "Annem penisilinden alerjik olmuş. Kardeşim çocukken astım tedavisi gördü. Arıya alerjisi olan kimse yok.", onem: "notr", not: "Venom alerjisinde aile öyküsü zayıf bir belirleyicidir; tanıyı koydurmaz (kılavuz maddesi bulunamadı, hekim onayı gerekli)." },
      { id: "sosyal_kovan", kategori: "Sosyal öykü", ad: "Ev, bahçe ve alışkanlıklar", ozet: "Bahçe ve arı maruziyeti", kaynak: "yakin", cevap: "(Annesi) Komşunun kovanları bahçe duvarının dibinde, yaz boyunca arılar bahçeye geliyor. Kızım çiçekleri sulamayı çok sever. Sigara ve alkol kullanmaz, üniversite öğrencisi.", onem: "ipucu", not: "Tekrarlayan venom maruziyeti ve temas ile reaksiyon arasındaki dakikalar anafilaksi tanısını destekler [K12][K13]. Alerjenin açık kaynağı: tanı kliniktir, tetkik beklenmez." },
      { id: "enabiz_kayit_yok", kategori: "e-Nabız", ad: "Önceki acil başvuruları", ozet: "Önceki anafilaksi ve oto-enjektör kaydı", kaynak: "enabiz", cevap: "Önceki acil/yatış kaydı yok. Adrenalin oto-enjektör reçetesi yok. Alerji uzmanı muayenesi, venom testi ya da triptaz tetkiki yok.", onem: "notr", not: "İlk sistemik reaksiyon: oto-enjektör ve venom immünoterapisi yönlendirmesi taburculukta yapılmalı [K12][K13][K15]. İmmünoterapi atfı için hekim onayı gerekli." }
    ],

    // e-Nabız (oyun içi temsilî kayıt). gecmisId: bu satırı görünce o geçmiş kaydı "bakıldı" sayılır.
    enabiz: {
      ziyaretler: [
        { tarih: "8 ay önce", kurum: "Kadın Hastalıkları ve Doğum Polikliniği", tani: "Kontrasepsiyon danışmanlığı", not: "Kombine oral kontraseptif başlandı, 3 aylık yenilemeler düzenli.", gecmisId: "ilac_oks" },
        { tarih: "2 yıl önce", kurum: "KBB Polikliniği", tani: "Mevsimsel alerjik rinit (J30.2)", not: "Baharda burun akıntısı ve hapşırık. Çocuklukta hafif egzama.", gecmisId: "ozgecmis_atopi" }
      ],
      tahliller: [
        { tarih: "Eylül 2021", test: "SARS-CoV-2 PCR", sonuc: "Negatif", birim: "", referans: "Negatif", durum: "normal" }
      ],
      receteler: [
        { tarih: "1 ay önce", ilac: "Kombine oral kontraseptif", kullanim: "Günde 1", not: "3 aylık reçete.", gecmisId: "ilac_oks" },
        { tarih: "2 yıl önce", ilac: "Loratadin 10 mg", kullanim: "Günde 1, mevsimsel", not: "", gecmisId: "ozgecmis_atopi" }
      ],
      asilar: [
        { tarih: "Ağustos 2021", asi: "COVID-19 · BioNTech", doz: "2. doz", kurum: "Aile Sağlığı Merkezi" },
        { tarih: "Temmuz 2021", asi: "COVID-19 · BioNTech", doz: "1. doz", kurum: "Aile Sağlığı Merkezi" }
      ],
      hastaliklar: [
        { tani: "Mevsimsel alerjik rinit", kod: "J30.2", tarih: "2 yıl önce", gecmisId: "ozgecmis_atopi" }
      ],
      alerjiler: [
        { alerjen: "Kayıt yok", not: "Kayıtlı ilaç, besin ya da arı alerjisi yok. Adrenalin oto-enjektör reçetesi yok. Önceki acil başvurusu yok.", gecmisId: "enabiz_kayit_yok" }
      ],
      radyoloji: []
    },

    muayene: {
      genel:     { varsayilan: "Bilinç açık, ajite ve korkmuş. Sesi boğuk, kısa cümlelerle konuşuyor.", agir: "Huzursuz, konuşmakta çok zorlanıyor; boğazını tutuyor.", duzelme: "Bilinç açık, daha sakin; rahat konuşabiliyor." },
      kvs:       { varsayilan: "Taşikardik. Periferik nabızlar zayıf.", agir: "Belirgin taşikardik; periferik nabızlar güçlükle alınıyor.", duzelme: "Kalp hızı azalıyor; periferik nabızlar daha dolgun." },
      solunum:   { varsayilan: "Yardımcı solunum kaslarını kullanıyor. İki tarafta yaygın hırıltı (wheezing).", agir: "İnspiratuvar stridor; solunum sesleri azalmış.", duzelme: "Hırıltı belirgin azalmış; stridor yok." },
      batin:     "Batın yumuşak; defans ve rebound yok.",
      cilt:      { varsayilan: "Boyun, gövde ve kollarda yaygın kabarık kızarıklıklar (ürtiker). Dudaklar ve göz kapakları şiş. El sırtında sokma izi.", agir: "Yaygın ürtiker, dudak ve göz kapaklarında ödem; dudaklarda morarma.", duzelme: "Ürtiker solmaya başlamış, dudaklardaki şişlik geriliyor." },
      norolojik: { varsayilan: "Bilinç açık, oryante; lateralize bulgu yok.", agir: "Bilinç açık ama huzursuz; lateralize bulgu yok." }
    },

    tetkikler: {
      ekg:       { sinif: "notr", sekil: "sinus-tasikardi", sonuc: "Sinüs taşikardisi, 128/dk. İskemik değişiklik yok." },
      kan_gazi:  { sinif: "notr", sonuc: "Hipoksemi; laktat hafif yüksek. Tanıya katkısı yok." },
      yb_usg:    { sinif: "notr", sonuc: "Kalp hızlı ve güçlü kasılıyor; perikardiyal sıvı yok. Vena kava inferior ince." },
      idrar:     { sinif: "notr", sonuc: "Normal." },
      hemogram:  { sinif: "notr", sonuc: "Normal sınırlarda." },
      biyokimya: { sinif: "notr", sonuc: "Normal sınırlarda." },
      crp:       { sinif: "notr", sonuc: "2 mg/L (normal)." },
      troponin:  { sinif: "notr", sonuc: "Normal." },
      akc_grafi: { sinif: "notr", sonuc: "Akciğer alanları temiz; pnömotoraks yok." },
      rad_usg:   { sinif: "gereksiz", sonuc: "Batın USG: olağan.", not: "Anafilakside batın görüntülemesinin yeri yok." },
      bt:        { sinif: "gereksiz", sonuc: "Toraks BT: akciğer parankimi olağan, pulmoner emboli yok.", not: "Anafilaksi klinik tanıdır; BT gereksizdir ve hastayı resüsitasyon alanından uzaklaştırır." }
    },
    // Adrenalinden önce istenen HER tetkik gereksiz sayılır (tanı kliniktir, tetkik tedaviyi geciktirir).
    gereksizKurali: { once: "adrenalin_im", not: "Anafilaksi klinik tanıdır; adrenalinden önce istenen tetkik tedaviyi geciktirir." },
    zorunluTetkikler: [],

    mudahaleler: {
      adrenalin_im:   { sinif: "kritik", yanit: "Adrenalin 0,5 mg uyluk dış yanına IM yapıldı." },
      oksijen:        { sinif: "kritik", yanit: "Maske ile yüksek akım oksijen başlandı." },
      iv_sivi:        { sinif: "kritik", yanit: "Serum fizyolojik bolusu hızla başlandı." },
      bacak_kaldir:   { sinif: "kritik", yanit: "Hasta sırtüstü yatırıldı, bacakları kaldırıldı." },
      gozlem:         { sinif: "kritik", yanit: "Hasta gözleme alındı: bifazik reaksiyon için izlenecek." },
      damar_yolu:     { sinif: "gerekli", yanit: "Damar yolu açıldı." },
      antihistaminik: { sinif: "gereksiz", oncesindeKritikHata: "adrenalin_im", yanit: "Antihistaminik verildi. Kaşıntısı biraz azaldı.",
                        not: "Üçüncü basamak (RCUK 2021): sadece cilt belirtileri için, hasta stabil olunca, tercihen ağızdan. Hipotansif hastada IV antihistaminik tansiyonu düşürebilir. Adrenalinin yerini tutmaz." },
      steroid:        { sinif: "gereksiz", oncesindeKritikHata: "adrenalin_im", yanit: "Steroid verildi.",
                        not: "Güncel kılavuzlar (RCUK 2021) anafilaksinin acil tedavisinde steroidi rutin önermiyor. Adrenalinin yerini tutmaz." },
      salbutamol:     { sinif: "notr", oncesindeKritikHata: "adrenalin_im", yanit: "Salbutamol nebül başlandı.",
                        not: "Hırıltı için adrenalinden sonra eklenebilir; adrenalinin yerini tutmaz." },
      adrenalin_iv:   { sinif: "zararli", yanit: "Adrenalin IV bolus verildi. Nabız fırladı.", not: "Arrest dışında IV bolus adrenalin ciddi aritmi ve hipertansiyon yapabilir. Doğrusu IM." },
      nitrat:         { sinif: "zararli", yanit: "Dil altı nitrat verildi.", not: "Hipotansif hastada nitrat tansiyonu daha da düşürür." },
      aspirin:        { sinif: "gereksiz", yanit: "Aspirin çiğnetildi.", not: "Endikasyon yok." },
      analjezi:       { sinif: "gereksiz", yanit: "IV analjezik verildi." },
      antibiyotik:    { sinif: "gereksiz", yanit: "IV antibiyotik başlandı.", not: "Enfeksiyon yok; alerjik hastaya gereksiz ilaç yeni risk demek." },
      antiasit:       { sinif: "gereksiz", yanit: "Antiasit verildi." },
      oral_kes:       { sinif: "notr", yanit: "Ağızdan alım kesildi." },
      pkg:            { sinif: "gereksiz", yanit: "Kardiyoloji: \"Kardiyak bir tablo düşündüren bulgu yok.\"" },
      cerrahi:        { sinif: "gereksiz", yanit: "Genel cerrahi: \"Cerrahi bir sorun yok.\"" },
      aile:           { sinif: "gereksiz", yanit: "Annesi burada; evde başka hasta yok." },
      hbo:            { sinif: "gereksiz", yanit: "Hiperbarik merkez: \"Endikasyon yok.\"" },
      taburcu:        { sinif: "zararli", yanit: "Hasta taburcu edildi.", not: "Bifazik reaksiyon riski: anafilaksi sonrası gözlem gerekir, erken taburculuk zararlıdır." }
    },

    puanlama: {
      tani: 400,
      kritikler: [
        { id: "adrenalin_im", ad: "IM adrenalin (uyluk dış yan)",      puan: 150, hedefDk: 5, not: "Anafilakside ilk ve tek hayat kurtarıcı ilaç adrenalindir." },
        { id: "oksijen",      ad: "Oksijen",                            puan: 50,  hedefDk: 5 },
        { id: "bacak_kaldir", ad: "Sırtüstü yatırıp bacakları kaldırma", puan: 50,  hedefDk: 5 },
        { id: "iv_sivi",      ad: "IV sıvı (hipotansiyon)",            puan: 50,  hedefDk: 10 },
        { id: "gozlem",       ad: "Gözleme alma (bifazik reaksiyon)",  puan: 50 }
      ],
      hedefler: [
        { id: "adrenalin_im", ad: "Adrenalin ≤ 3 dk (kötüleşmeden önce)", hedefDk: 3, puan: 100, kaynak: "oyun hedefi" },
        { id: "iv_sivi", ad: "IV sıvı ≤ 10 dk", hedefDk: 10, puan: 50, kaynak: "oyun hedefi" }
      ],
      verimlilik: { puan: 100, maliyetHedef: 200, maliyetSifir: 1500, sureHedefDk: 15, sureSifirDk: 45 }
    },

    tanilar: [
      { id: "astim",      ad: "Astım atağı",                    not: "Hırıltı var ama ürtiker, dudak-göz kapağı ödemi ve hipotansiyon astımla açıklanmaz; astım öyküsü de yok." },
      { id: "urtiker",    ad: "İzole ürtiker",                  not: "Sadece cilt tutulumu olurdu; burada solunum ve dolaşım da tutulmuş." },
      { id: "panik",      ad: "Panik atak",                     not: "Hipotansiyon, ürtiker ve SpO₂ düşüklüğü panik atakla açıklanmaz." },
      { id: "anafilaksi", ad: "Anafilaksi", dogru: true,        not: "Alerjenle (arı) temastan dakikalar sonra cilt-mukoza tutulumu + solunum sıkıntısı + hipotansiyon. Tanı kliniktir." },
      { id: "anjiyoodem", ad: "Anjiyoödem (ACE inhibitörü)",    not: "Ürtikersiz, kaşıntısız şişlik ve ACE inhibitörü kullanımı beklenirdi; hasta ilaç kullanmıyor." },
      { id: "vazovagal",  ad: "Vazovagal senkop",               not: "Bradikardi ve kısa sürede kendiliğinden düzelme beklenirdi; burada taşikardi, ürtiker ve hırıltı var." },
      { id: "yabanci",    ad: "Yabancı cisim aspirasyonu",      not: "Ani öksürük ve boğulma öyküsü beklenirdi; cilt bulgularını açıklamaz." }
    ],

    // Düşünce dolabı: bulgu toplandıkça açılır, en fazla 3'ü dolaba konur. Puanı etkilemez.
    dusunceler: [
      { id: "anafilaksi", ad: "Ağır alerjik reaksiyon mu?", tani: "anafilaksi", metin: "Arıdan dakikalar sonra cilt, nefes ve tansiyon birlikte bozuldu.",
        acan: ["soru:ne-oldu", "soru:belirti", "muayene:cilt"],
        destek: ["soru:ne-oldu", "muayene:cilt", "vital:ta", "soru:bas-donmesi", "gecmis:ozgecmis_onceki_sokma", "gecmis:sosyal_kovan"], curutur: [] },
      { id: "astim", ad: "Astım krizi mi?", tani: "astim", metin: "Hırıltı var. Ama astım kurdeşen döktürüp tansiyonu düşürür mü?",
        acan: ["muayene:solunum", "soru:belirti"],
        destek: ["muayene:solunum"], curutur: ["soru:astim", "gecmis:ozgecmis_astim", "muayene:cilt"] },
      { id: "panik", ad: "Panik atak mı?", tani: "panik", metin: "Korkmuş, hızlı soluyor. Ama panik tansiyonu ve satürasyonu düşürmez.",
        acan: ["soru:panik", "muayene:genel"],
        destek: [], curutur: ["soru:panik", "vital:ta", "vital:spo2"] },
      { id: "anjiyoodem", ad: "İlaca bağlı şişlik mi?", tani: "anjiyoodem", metin: "Dudak ve göz kapağı şiş. Tansiyon ilacı (ACE inhibitörü) kullanıyor mu? Kurdeşen var mı?",
        acan: ["soru:ilac", "muayene:cilt"],
        destek: [], curutur: ["soru:ilac", "gecmis:ilac_yok", "muayene:cilt"] },
      { id: "pe", ad: "Akciğere pıhtı mı?", tani: "", metin: "Doğum kontrol hapı kullanıyor, nefesi daralmış. Ama pıhtı kurdeşen yapmaz.",
        acan: ["gecmis:ilac_oks", "eb:receteler"],
        destek: ["gecmis:ilac_oks"], curutur: ["muayene:cilt", "soru:ne-oldu"] }
    ],

    kilavuz: {
      baslik: "Anafilaksi",
      adimlar: [
        "Tanı kliniktir: alerjenden dakikalar sonra cilt-mukoza tutulumu + solunum ya da dolaşım bulgusu. Tetkik bekleme.",
        "Hemen adrenalin IM, uyluk dış yanına: 0,01 mg/kg (erişkinde en fazla 0,5 mg), 1 mg/mL ampulden. Yanıt yoksa 5 dk sonra tekrarla.",
        "Sırtüstü yatır, bacaklarını kaldır (nefes darlığında rahat ettiği pozisyon). Hastayı aniden ayağa kaldırma.",
        "Yüksek akım oksijen ver, damar yolu aç, hipotansiyonda hızlı kristaloid bolusu başla.",
        "Antihistaminik üçüncü basamaktır: sadece cilt belirtileri için, hasta stabil olunca. Steroid rutin önerilmez. İkisi de adrenalinin yerini tutmaz.",
        "Bifazik reaksiyon riski için gözleme al. Taburculukta adrenalin oto-enjektörü reçete et, alerji uzmanına yönlendir."
      ],
      kirmiziBayraklar: [
        "Stridor, ses kısıklığı, yutma güçlüğü: üst hava yolu ödemi.",
        "Dudaklarda morarma, SpO₂ düşüşü, hipotansiyon, bilinç bulanıklığı.",
        "IV bolus adrenalin sadece arrestte; arrest dışında IM yol."
      ],
      kaynak: "WAO Anafilaksi Kılavuzu 2020 (Cardona ve ark.) · EAACI Anafilaksi Kılavuzu, 2021 güncellemesi (Muraro ve ark.) · Resuscitation Council UK, 2021"
    }
  },
  /* ===================================================================
     VAKA 4 · BAŞ AĞRISI (gizli tanı: karbonmonoksit zehirlenmesi, kış gecesi soba)
     Türkiye'ye özgü vaka. Tuzak: nabız oksimetresi normal görünür; tanı COHb ile konur.
     =================================================================== */
  {
    id: "bas-agrisi",
    baslik: "Baş ağrısı",
    sahne: "img/ai/bg-sari-alan.webp",
    triyaj: "sari",               // doğru triyaj alanı: kirmizi | sari | yesil (hekim onayı)
    yakin: {
      ad: "Eşi", portre: "img/ai/yakin-co.webp",
      olaylar: [
        { id: "es-co-1", sonraSn: 100,
          soru: "Hocam... benim de başım zonkluyor. Oğlan da evde kustu, kızım halsiz. Bu ne? Mikrop mu kaptık?",
          tekrarSoru: "Hocam, başım çatlıyor, ben de oturamıyorum...",
          secenekler: [
            { ad: "“Evdeki soba hepinizi zehirlemiş olabilir. Siz de muayene olacaksınız; çocukları hemen getirtelim, evi havalandırsınlar.”", tur: "iyi", sureSn: 30,
              cevap: "Soba mı?! Tamam hocam, komşuyu arıyorum, çocukları getirsin.", ercan: "İyi yakaladın hocam. Müdahaleden 'evdekileri çağır' emrini de ver, 112 ile ben ilgilenirim." },
            { ad: "“Mevsim geçişi, grip olmuşsunuzdur. Geçer.”", tur: "kotu", sureSn: 15,
              cevap: "Grip mi? Hepimiz aynı gece mi?", ercan: "Hocam, aynı gece, aynı ev, herkesin başı ağrıyor... Bunu grip diye geçme." },
            { ad: "“Siz dışarıda bekleyin, sırası gelince size de bakarız.”", tur: "sert", sureSn: 10,
              cevap: "Başım çatlıyor ama... tamam.", ercan: "Hocam, adamın da rengi atmış. Bekleme salonunda bayılırsa iki hastamız olur." }
          ],
          gormezden: { cevap: "Hocam... başım...", ercan: "Hocam, adamın rengi atmış. Ona da bir bakmamız lazım.", tekrarSn: 120 } }
      ]
    },
    onay: { durum: "DEMO — hekim onayı bekliyor", dogrulayan: "", tarih: "" },
    hasta: { yas: 41, cinsiyet: "Kadın" },
    sikayet: "Gece uyandım, başım çatlıyor. Midem bulanıyor, iki kere kustum, başım dönüyor.",

    durumlar: {
      baslangic: {
        gorsel: "img/ai/co-1.webp",
        ton: ["soluk"],
        gorunus: "Soluk ve uykulu. Elini alnına bastırıyor, kucağında kusma kabı var. Kalın hırkası pijamasının üstünde.",
        vitaller: { ta: "128/82", nabiz: 112, spo2: 98, solunum: 22, ates: 36.6, seker: 104, gks: 15, ritim: "Sinüs taşikardisi" }
      },
      konfuzyon: {
        gorsel: "img/ai/co-2.webp",
        ton: ["soluk"],
        gorunus: "Uykuya kayıyor, sorulara geç ve karışık cevap veriyor. Bir kez daha kustu.",
        mesaj: "Hastanın durumu kötüleşiyor: bilinci bulanıklaştı.",
        oykuCevabi: "(Cümleleri karışık, soruyu anlamıyor gibi.) \"Neredeyim... çocuklar nerede?\"",
        vitaller: { ta: "118/74", nabiz: 124, spo2: 98, solunum: 24, gks: 13 },
        ceza: { puan: 60, ad: "Bilinç bulanıklaştı (oksijen gecikti)" }
      },
      agir: {
        gorsel: "img/ai/co-2.webp",
        ton: ["soluk"],
        gorunus: "Kısa bir kasılma nöbeti geçirdi; şimdi uykulu, ağrılı uyaranla gözünü açıyor.",
        mesaj: "Hasta nöbet geçirdi.",
        oykuCevabi: "(Yanıt vermiyor; ağrılı uyaranla inliyor.)",
        vitaller: { ta: "108/68", nabiz: 132, spo2: 97, solunum: 26, gks: 9 },
        ceza: { puan: 120, ad: "Nöbet geçirdi (oksijen çok gecikti)" }
      },
      duzelme: {
        gorsel: "img/ai/co-3.webp",
        ton: ["soluk"],
        gorunus: "Oksijen maskesiyle daha uyanık. Baş ağrısının azaldığını, bulantısının geçtiğini söylüyor.",
        mesaj: "Oksijen etkisini gösteriyor: hasta daha uyanık, baş ağrısı azaldı.",
        iyi: true,
        vitaller: { nabiz: 98, solunum: 18, gks: 15 }
      }
    },

    seyir: [
      { saatDk: 20, durum: "konfuzyon", onleyen: ["oksijen"] },
      { saatDk: 45, durum: "agir",      onleyen: ["oksijen"] },
      { mudahale: "oksijen", sonraDk: 15, durum: "duzelme", sadece: ["baslangic", "konfuzyon"] },
      { mudahale: "oksijen", sonraDk: 30, durum: "duzelme", sadece: ["agir"] }
    ],

    oyku: [
      { id: "baslangic",          soru: "Şikâyetleriniz ne zaman başladı?",                                   cevap: "Akşam yemekten sonra hafif başım ağrıyordu. Gece üçte uyandım, başım çatlıyor. İki kere kustum." },
      { id: "bas-agrisi-nitelik", soru: "Baş ağrınız nasıl? Birden mi patladı, hayatınızın en şiddetli ağrısı mı?", anahtar: "nasıl bir ağrı şiddetli birden patladı zonklama", cevap: "Zonklayan, bütün başımda bir ağrı. Çok kötü ama birden patlamadı, yavaş yavaş arttı." },
      { id: "evdekiler",          soru: "Evde başka kimsede benzer şikâyet var mı?", anahtar: "evdekiler aile çocuklar eşiniz kocanız evde başka",                         cevap: "Kocam da başım ağrıyor diyordu. Küçük oğlan da akşam halsizdi, erken yattı." },
      { id: "isinma",             soru: "Evi neyle ısıtıyorsunuz?", anahtar: "soba kalorifer doğalgaz şofben kömür ısınma ısıtma",                                           cevap: "Kömür sobası. Akşam doldurup yattık, gece soğuk oluyor." },
      { id: "disari",             soru: "Evden çıkınca şikâyetleriniz değişti mi?",                          cevap: "Arabaya binince biraz açıldım galiba. Bilmiyorum, çok kötüydüm." },
      { id: "ates-ense",          soru: "Ateşiniz, ense sertliğiniz, ışıktan rahatsızlık var mı?", anahtar: "ateş ense sertlik ışık",            cevap: "Ateşim yok, ensem tutulmadı. Işık biraz rahatsız ediyor ama başım ağrıyınca hep öyle olur." },
      { id: "migren",             soru: "Daha önce böyle baş ağrılarınız olur mu, migreniniz var mı?",       cevap: "Arada migrenim olur ama bu farklı. Hiç böyle kusturmazdı." },
      { id: "yemek",              soru: "Akşam ne yediniz? Başkaları da aynı şeyi yedi mi?",                 cevap: "Mercimek çorbası, pilav. Hepimiz aynı şeyi yedik. İshal olmadım." },
      { id: "gogus-nefes",        soru: "Göğüs ağrısı, çarpıntı ya da nefes darlığı var mı?",                 cevap: "Kalbim çok hızlı atıyor gibi. Göğsümde ağrı yok." },
      { id: "gebelik",            soru: "Hamilelik ihtimaliniz var mı?",                                      cevap: "Hayır, yok." }
    ],

    gecmis: [
      { id: "ozgecmis_migren", kategori: "Özgeçmiş", ad: "Kronik hastalıkları var mı?", ozet: "Migren", kaynak: "hasta", cevap: "Yıllardır migrenim var, ayda bir iki kez olur; ilacı alınca geçer.", onem: "celdirici", not: "Migren öyküsü yeni ve farklı bir baş ağrısını açıklamaz; evdekilerde de benzer şikâyet olması migrenle açıklanmaz (hekim onayı)." },
      { id: "ilaclar", kategori: "Kullandığı ilaçlar", ad: "Düzenli kullandığı ilaçlar", ozet: "İlaçlar", kaynak: "hasta", cevap: "Migren için ağrı kesici, o kadar.", onem: "notr", not: "" },
      { id: "sigara", kategori: "Sosyal öykü", ad: "Sigara içiyor mu?", ozet: "Sigara", kaynak: "hasta", cevap: "İçmiyorum. Kocam içer ama balkonda.", onem: "notr", not: "Sigara içenlerde COHb tabanı yüksek olabilir; bu hasta içmiyor, yüksek COHb'yi sigara açıklamaz (hekim onayı)." },
      { id: "evdekiler_yakin", kategori: "Sosyal öykü", ad: "Evde başka hasta var mı?", ozet: "Evdekilerde de baş ağrısı ve kusma", kaynak: "yakin", cevap: "(Eşi) Benim de başım zonkluyor. Oğlan akşam kustu, kızım da halsiz. Çocukları komşuya bıraktım.", onem: "ipucu", not: "Aynı evde birden fazla kişide eş zamanlı baş ağrısı, bulantı: karbonmonoksit zehirlenmesinin en güçlü klinik ipucu." },
      { id: "soba_bakim", kategori: "Sosyal öykü", ad: "Ev ve ısınma", ozet: "Eski kömür sobası, temizlenmemiş baca", kaynak: "yakin", cevap: "(Eşi) Soba eski, bacayı bu kış temizletemedik. Dün gece rüzgâr vardı, soba biraz tütüyordu.", onem: "ipucu", not: "Kömür sobası, temizlenmemiş baca ve rüzgârlı gece: CO kaynağı." },
      { id: "enabiz_onceki_kis", kategori: "e-Nabız", ad: "Önceki acil başvuruları", ozet: "Geçen ocak ailece baş ağrısıyla acil başvurusu", kaynak: "enabiz", cevap: "Geçen ocak: gece baş ağrısı ve bulantıyla acil başvurusu; eşi ve çocuğu da aynı gece başvurmuş. Ağrı kesici verilip taburcu edilmiş.", onem: "ipucu", not: "Kışın tekrarlayan, ailece aynı gece başvurular: atlanmış CO zehirlenmesini düşündürür." },
      { id: "enabiz_migren", kategori: "e-Nabız", ad: "Poliklinik kayıtları", ozet: "Aurasız migren (nöroloji, 3 yıl önce)", kaynak: "enabiz", cevap: "3 yıl önce nöroloji: aurasız migren. Beyin MR normal.", onem: "notr", not: "Bilinen migren yeni tabloyu açıklamaz." }
    ],

    enabiz: {
      ziyaretler: [
        { tarih: "Geçen ocak", kurum: "Devlet Hastanesi · Acil Servis", tani: "Baş ağrısı (R51)", not: "Gece baş ağrısı ve bulantı. Eşi ve küçük oğlu da aynı gece başvurmuş. Ağrı kesici verildi, taburcu.", gecmisId: "enabiz_onceki_kis" },
        { tarih: "3 yıl önce", kurum: "Nöroloji Polikliniği", tani: "Aurasız migren (G43.0)", not: "Ayda 1-2 atak. Beyin MR normal.", gecmisId: "enabiz_migren" },
        { tarih: "Aralık 2020", kurum: "Aile Sağlığı Merkezi · filyasyon", tani: "COVID-19, virüs tanımlandı (U07.1)", not: "PCR pozitif. Halsizlik, kas ağrısı. 14 gün evde izolasyon." }
      ],
      tahliller: [
        { tarih: "Aralık 2020", test: "SARS-CoV-2 PCR", sonuc: "Pozitif", birim: "", referans: "Negatif", durum: "yuksek" }
      ],
      receteler: [
        { tarih: "6 ay önce", ilac: "Naproksen sodyum 550 mg", kullanim: "Gerektiğinde", not: "Migren atakları için.", gecmisId: "enabiz_migren" },
        { tarih: "Aralık 2020", ilac: "Favipiravir 200 mg", kullanim: "5 gün", not: "COVID-19 tedavisi, filyasyon ekibi verdi." }
      ],
      asilar: [
        { tarih: "Ekim 2021", asi: "COVID-19 · BioNTech", doz: "3. doz (hatırlatma)", kurum: "Aile Sağlığı Merkezi" },
        { tarih: "Temmuz 2021", asi: "COVID-19 · CoronaVac (Sinovac)", doz: "2. doz", kurum: "Aile Sağlığı Merkezi" },
        { tarih: "Haziran 2021", asi: "COVID-19 · CoronaVac (Sinovac)", doz: "1. doz", kurum: "Aile Sağlığı Merkezi" }
      ],
      hastaliklar: [
        { tani: "Aurasız migren", kod: "G43.0", tarih: "3 yıl önce", gecmisId: "enabiz_migren" }
      ],
      alerjiler: [],
      radyoloji: [
        { tarih: "3 yıl önce", tetkik: "Beyin MR", rapor: "Normal.", gecmisId: "enabiz_migren" }
      ]
    },

    muayene: {
      genel:     { varsayilan: "Bilinç açık ama uykulu; yavaş yanıt veriyor. Soluk.", konfuzyon: "Uykuya meyilli, yer ve zaman oryantasyonu bozuk.", agir: "Uykulu, ağrılı uyaranla gözünü açıyor; nöbet sonrası durumda.", duzelme: "Bilinç açık, oryante; daha canlı." },
      kvs:       "Taşikardik, ritmik. Üfürüm yok. Periferik nabızlar dolgun.",
      solunum:   "Takipneik; solunum sesleri doğal, ral ve ronküs yok.",
      batin:     "Batın yumuşak, hassasiyet yok. Barsak sesleri normal.",
      cilt:      "Soluk, hafif terli. Döküntü yok. (Ders kitaplarındaki 'kiraz kırmızısı' renk nadirdir, burada yok.)",
      norolojik: { varsayilan: "Ense sertliği yok. Pupiller izokorik, ışık refleksi var. Lateralize bulgu yok. Tandem yürüyüşte dengesiz.", konfuzyon: "Konfüze; ense sertliği yok, lateralize bulgu yok.", agir: "Postiktal; lateralize bulgu yok, ense sertliği yok.", duzelme: "Oryante; ense sertliği yok, lateralize bulgu yok." }
    },

    tetkikler: {
      ekg:       { sinif: "gerekli", sekil: "sinus-tasikardi", sonuc: "Sinüs taşikardisi, 112/dk. Belirgin iskemik değişiklik yok." },
      kan_gazi:  { sinif: "zorunlu", sonuc: { varsayilan: "Venöz kan gazı (CO-oksimetri): COHb %28 (yüksek). pH 7,33, laktat 3,4 mmol/L. Nabız oksimetresi bunu göremez: COHb'yi oksijenli hemoglobin sanar.", duzelme: "Venöz kan gazı (CO-oksimetri): COHb %12 (oksijenle düşüyor). Laktat 1,9 mmol/L." } },
      yb_usg:    { sinif: "notr", sonuc: "Kalp kasılmaları iyi, perikardiyal sıvı yok." },
      idrar:     { sinif: "notr", sonuc: "Normal. Gebelik testi negatif." },
      hemogram:  { sinif: "notr", sonuc: "Normal sınırlarda." },
      biyokimya: { sinif: "notr", sonuc: "Normal; CK hafif yüksek." },
      crp:       { sinif: "notr", sonuc: "3 mg/L (normal)." },
      troponin:  { sinif: "gerekli", sonuc: "Hafif yüksek. Karbonmonoksit kalbi de etkileyebilir: monitörde izle, EKG'yi tekrarla." },
      akc_grafi: { sinif: "notr", sonuc: "Normal." },
      rad_usg:   { sinif: "gereksiz", sonuc: "Batın USG: olağan.", not: "Tablo karın kaynaklı değil." },
      bt:        { sinif: "notr", sonuc: "Beyin BT: kanama ya da kitle yok.", not: "Bilinç değişikliğinde ayırıcı tanı için çekilebilir; karbonmonoksit zehirlenmesini göstermez." }
    },
    zorunluTetkikler: [
      { ad: "Kan gazı (COHb)", idler: ["kan_gazi"] }
    ],

    mudahaleler: {
      oksijen:        { sinif: "kritik", yanit: "Geri solumasız maskeyle %100 oksijen başlandı (15 L/dk)." },
      aile:           { sinif: "kritik", yanit: "112 arandı: evdekiler acile getiriliyor; sobanın söndürülmesi ve evin havalandırılması istendi." },
      hbo:            { sinif: "kritik", yanit: "Hiperbarik oksijen merkeziyle görüşüldü: COHb sonucu ve klinik bilgiler gönderildi, hasta değerlendirmeye kabul edildi.",
                        gerekenSonuc: "kan_gazi", gerekenYoksa: "Hiperbarik merkez: \"COHb değeri olmadan karar veremeyiz. Kan gazını gönderin.\"" },
      damar_yolu:     { sinif: "gerekli", yanit: "Damar yolu açıldı." },
      iv_sivi:        { sinif: "notr", yanit: "Serum fizyolojik başlandı." },
      oral_kes:       { sinif: "notr", yanit: "Ağızdan alım kesildi." },
      analjezi:       { sinif: "notr", yanit: "IV analjezik verildi. Baş ağrısı biraz hafifledi.", not: "Belirtiyi hafifletir ama asıl tedavi oksijendir." },
      gozlem:         { sinif: "notr", yanit: "Gözleme alındı; oksijen sürüyor." },
      bacak_kaldir:   { sinif: "gereksiz", yanit: "Bacakları kaldırıldı.", not: "Hipotansiyon yok." },
      aspirin:        { sinif: "gereksiz", yanit: "Aspirin çiğnetildi.", not: "Akut koroner sendrom bulgusu yok." },
      nitrat:         { sinif: "gereksiz", yanit: "Dil altı nitrat verildi.", not: "Endikasyon yok; baş ağrısını artırabilir." },
      adrenalin_im:   { sinif: "zararli", yanit: "Adrenalin IM yapıldı. Nabız fırladı.", not: "Endikasyonu olmayan adrenalin zararlıdır." },
      adrenalin_iv:   { sinif: "zararli", yanit: "Adrenalin IV bolus verildi.", not: "Arrest dışında IV bolus adrenalin zararlıdır." },
      antihistaminik: { sinif: "gereksiz", yanit: "Antihistaminik verildi. Uykusu arttı.", not: "Endikasyon yok; bilinç değerlendirmesini zorlaştırır." },
      steroid:        { sinif: "gereksiz", yanit: "Steroid verildi.", not: "Endikasyon yok." },
      salbutamol:     { sinif: "gereksiz", yanit: "Salbutamol nebül verildi.", not: "Bronkospazm yok." },
      antibiyotik:    { sinif: "gereksiz", yanit: "IV antibiyotik başlandı.", not: "Ateş ve enfeksiyon bulgusu yok." },
      antiasit:       { sinif: "gereksiz", yanit: "Antiasit verildi.", not: "Bulantının kaynağı mide değil." },
      pkg:            { sinif: "gereksiz", yanit: "Kardiyoloji: \"ST elevasyonu yok. Troponin yüksekse monitörde izleyin.\"" },
      cerrahi:        { sinif: "gereksiz", yanit: "Genel cerrahi: \"Cerrahi bir sorun yok.\"" },
      taburcu:        { sinif: "zararli", yanit: "Hasta taburcu edildi.", not: "COHb yüksekken ve soba kontrol edilmeden eve göndermek: hasta ve ailesi aynı zehirli ortama döner." }
    },

    puanlama: {
      tani: 400,
      kritikler: [
        { id: "oksijen",  ad: "%100 oksijen (geri solumasız maske)",  puan: 150, hedefDk: 10, not: "Tanı beklenmeden başlanır; karbonmonoksitin vücuttan atılmasını hızlandırır." },
        { id: "kan_gazi", ad: "COHb ölçümü (kan gazı, CO-oksimetri)",  puan: 80,  hedefDk: 30, not: "Nabız oksimetresi yanıltır; tanı COHb ile konur." },
        { id: "aile",     ad: "Evdekileri acile çağırma",              puan: 50,  hedefDk: 60, not: "Aynı evdekiler de zehirleniyor olabilir." },
        { id: "hbo",      ad: "Hiperbarik oksijen için danışma",        puan: 40,  hedefDk: 90 },
        { id: "monitor",  ad: "Monitöre bağlandı",                      puan: 30,  hedefDk: 15 }
      ],
      hedefler: [
        { id: "oksijen",  ad: "Oksijen ≤ 10 dk (tanı beklenmeden)", hedefDk: 10, puan: 100, kaynak: "ACEP 2017 · oyun hedefi" },
        { id: "kan_gazi", ad: "COHb sonucu ≤ 30 dk", hedefDk: 30, puan: 50, kaynak: "oyun hedefi" }
      ],
      verimlilik: { puan: 100, maliyetHedef: 600, maliyetSifir: 3000, sureHedefDk: 30, sureSifirDk: 90 }
    },

    tanilar: [
      { id: "co",           ad: "Karbonmonoksit zehirlenmesi", dogru: true, not: "Kışın sobalı evde gece başlayan baş ağrısı, bulantı ve baş dönmesi; evdekilerde de benzer şikâyet. SpO₂ normal görünür; tanı CO-oksimetriyle (COHb) konur." },
      { id: "migren",       ad: "Migren atağı",                 not: "Migreni var ama bu ağrı farklı; evdekilerde de baş ağrısı ve kusma olması migrenle açıklanmaz." },
      { id: "gastroenterit", ad: "Besin zehirlenmesi",          not: "Aynı yemeği yiyenlerde şikâyet var ama baskın belirti baş ağrısı ve baş dönmesi; ishal yok, COHb yüksek." },
      { id: "menenjit",     ad: "Menenjit",                     not: "Ateş ve ense sertliği beklenirdi; ikisi de yok." },
      { id: "sak",          ad: "Subaraknoid kanama",           not: "Ani başlayan, hayatının en şiddetli 'gök gürültüsü' baş ağrısı beklenirdi; ağrı yavaş arttı." },
      { id: "gerilim",      ad: "Gerilim tipi baş ağrısı",      not: "Kusma, baş dönmesi, taşikardi ve bilinç değişikliği gerilim tipi baş ağrısıyla açıklanmaz." },
      { id: "viral",        ad: "Grip / viral enfeksiyon",      not: "Ateş ve kas ağrısı beklenirdi; COHb yüksekliğini açıklamaz." }
    ],

    dusunceler: [
      { id: "co", ad: "Evde bir zehir mi var?", tani: "co", metin: "Gece, sobalı bir ev, başı ağrıyan bir aile. Baş ağrısının kaynağı hastanın içinde değil, evin havasında olabilir.",
        acan: ["soru:evdekiler", "soru:isinma", "gecmis:evdekiler_yakin", "gecmis:soba_bakim"],
        destek: ["soru:evdekiler", "soru:isinma", "soru:disari", "gecmis:soba_bakim", "gecmis:enabiz_onceki_kis", "sonuc:kan_gazi"], curutur: [] },
      { id: "migren", ad: "Bildiğimiz migren mi?", tani: "migren", metin: "Migreni var. Ama migren evdekilerin de başını ağrıtır mı?",
        acan: ["soru:migren", "gecmis:ozgecmis_migren", "eb:hastaliklar"],
        destek: ["gecmis:ozgecmis_migren"], curutur: ["soru:migren", "soru:evdekiler", "sonuc:kan_gazi"] },
      { id: "menenjit", ad: "Beyin zarı iltihabı mı?", tani: "menenjit", metin: "Baş ağrısı, kusma, ışıktan rahatsızlık. Ateş ve ense sertliği var mı?",
        acan: ["soru:ates-ense", "muayene:norolojik"],
        destek: [], curutur: ["soru:ates-ense", "vital:ates", "muayene:norolojik"] },
      { id: "sak", ad: "Beyinde kanama mı?", tani: "sak", metin: "Hayatının en şiddetli baş ağrısı mı, birden mi patladı?",
        acan: ["soru:bas-agrisi-nitelik"],
        destek: [], curutur: ["soru:bas-agrisi-nitelik", "muayene:norolojik"] },
      { id: "besin", ad: "Yemekten mi zehirlendiler?", tani: "gastroenterit", metin: "Aynı sofradan kalkan bir aile, kusma... Ama ishal nerede?",
        acan: ["soru:yemek", "gecmis:evdekiler_yakin"],
        destek: ["soru:yemek"], curutur: ["muayene:batin", "sonuc:kan_gazi"] }
    ],

    kilavuz: {
      baslik: "Karbonmonoksit zehirlenmesi",
      adimlar: [
        "Şüphelen: kışın, sobalı ya da şofbenli evde gece başlayan baş ağrısı, bulantı, baş dönmesi; evde birden fazla kişide aynı şikâyet.",
        "Tanı beklenmeden %100 oksijen: geri solumasız maske, 15 L/dk.",
        "Nabız oksimetresi yanıltır (COHb'yi oksijenli hemoglobin sanar): COHb'yi kan gazında CO-oksimetriyle ölç.",
        "Monitöre bağla, EKG çek, troponine bak: karbonmonoksit kalbi de etkileyebilir.",
        "Hiperbarik oksijen için danış: bilinç kaybı ya da değişikliği, nörolojik bulgu, kardiyak iskemi, gebelik, yüksek COHb (ör. > %25).",
        "Evdekileri de acile çağır; soba ve baca kontrol edilmeden kimseyi aynı eve gönderme."
      ],
      kirmiziBayraklar: [
        "Bilinç bulanıklığı, nöbet, bayılma.",
        "Göğüs ağrısı, EKG değişikliği, troponin yüksekliği.",
        "Gebelik: fetüs karbonmonoksitten daha çok etkilenir."
      ],
      kaynak: "ACEP Klinik Politikası: karbonmonoksit zehirlenmesi (2017) · UHMS hiperbarik oksijen endikasyonları · hekim onayı bekliyor"
    }
  }
];
