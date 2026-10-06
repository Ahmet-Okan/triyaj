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
      { id: "baslangic", soru: "Ağrı ne zaman başladı, o sırada ne yapıyordunuz?", cevap: "Yarım saat kadar önce. Oturmuş televizyon izliyordum, hiç yorulmamıştım bile." },
      { id: "nitelik",   soru: "Ağrıyı nasıl tarif edersiniz?",                      cevap: "Batma gibi değil. Sanki göğsüme ağır bir şey oturmuş, sıkıştırıyor. Tam ortada." },
      { id: "yayilim",   soru: "Ağrı bir yere yayılıyor mu?",                        cevap: "Sol koluma vuruyor, kolum uyuşur gibi oldu." },
      { id: "eslik",     soru: "Yanında bulantı, terleme gibi başka şikâyet var mı?", cevap: "Midem bulanıyor ama kusmadım. Bir de soğuk soğuk terliyorum." },
      { id: "pozisyon",  soru: "Nefes alınca ya da pozisyon değiştirince ağrı değişiyor mu?", cevap: "Yok, değişmiyor. Otursam da uzansam da aynı baskı." },
      { id: "sirt",      soru: "Ağrı sırtınıza vuruyor mu, yırtılır gibi mi?",       cevap: "Sırtıma vurmuyor. Yırtılma gibi değil, baskı gibi." },
      { id: "ozgecmis",  soru: "Bilinen hastalığınız, kullandığınız ilaç var mı?",   cevap: "Tansiyonum var, hap içiyorum ama bazen unutuyorum. Başka hastalığım yok." },
      { id: "sigara",    soru: "Sigara içiyor musunuz?",                             cevap: "İçiyorum. Gençlikten beri günde bir paket." },
      { id: "emboli",    soru: "Son zamanda uzun yolculuk, ameliyat ya da bacakta şişlik oldu mu?", cevap: "Hayır, hiçbiri olmadı." },
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
      { id: "yer",       soru: "Ağrı ilk nerede başladı, şimdi nerede?",              cevap: "Önce göbeğimin etrafındaydı, tam yerini gösteremiyordum. Sonra sağ alta indi, şimdi hep burada." },
      { id: "nitelik",   soru: "Ağrı nasıl? Hareketle ya da öksürünce artıyor mu?",   cevap: "Sürekli bir ağrı. Yürürken, öksürünce daha çok saplanıyor." },
      { id: "istah",     soru: "İştahınız nasıl? Bulantı, kusma var mı?",             cevap: "Dünden beri hiçbir şey yiyemedim, canım istemiyor. Midem bulanıyor ama kusmadım." },
      { id: "ates",      soru: "Ateşiniz oldu mu?",                                   cevap: "Biraz halsizim, ateşim var gibi ama ölçmedim." },
      { id: "idrar",     soru: "İdrar yaparken yanma, sık idrara çıkma ya da kan var mı?", cevap: "Yok, idrarım normal." },
      { id: "kolik",     soru: "Ağrı dalga dalga mı geliyor? Sırtınıza ya da kasığınıza vuruyor mu?", cevap: "Gelip giden bir ağrı değil, hep orada. Sırtıma, kasığıma vurmuyor." },
      { id: "ishal",     soru: "İshal ya da kabızlık var mı? Çevrenizde benzer şikâyeti olan var mı?", cevap: "İshal olmadım, tuvaletim normal. Evde herkes iyi." },
      { id: "ozgecmis",  soru: "Daha önce ameliyat oldunuz mu? Hastalığınız, ilacınız var mı?", cevap: "Hiç ameliyat olmadım. Hastalığım yok, ilaç kullanmıyorum." },
      { id: "son-yemek", soru: "En son ne zaman yediniz, içtiniz?",                   cevap: "Dün öğlen yemek yedim. Sabah birkaç yudum su içtim, o kadar." }
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
      { id: "ne-oldu",      soru: "Ne oldu, ne zaman oldu?",                              cevap: "Bahçede çiçekleri suluyordum, bir arı elimin üstünden soktu. On dakika falan oldu, sonra her şey hızlandı." },
      { id: "belirti",      soru: "Şu an neler hissediyorsunuz?",                         cevap: "Boğazım şişiyor gibi, yutkunamıyorum. Nefes alırken hırıltı geliyor. Her yerim kaşınıyor." },
      { id: "once",         soru: "Daha önce arı soktu mu, böyle bir şey oldu mu?",       cevap: "Çocukken bir kere soktu, sadece o yer şişmişti. Böyle bir şey hiç olmadı." },
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
  }
];
