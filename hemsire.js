/* =====================================================================
   TRİYAJ · HEMŞİRE (hemsire.js)
   ---------------------------------------------------------------------
   Oyuncunun yanındaki kıdemli acil hemşiresi: Disco Elysium'daki Kim
   Kitsuragi gibi bir yol arkadaşı. Kaynak: ../arastirma/hemsire-karakteri.md
   KURALLAR: tanı adını asla söylemez. Danışmak (ipucu) puan ve süre yemez.
   Replikleri ortak düzenleyebilir: listeye cümle ekle, virgülü unutma.

   Anahtarlar: "genel" her vakada; vaka kimliği (gogus-agrisi, karin-agrisi,
   nefes-darligi) varsa o vakada önce o liste kullanılır.
   Etkileşim: hemşire soru sorar, oyuncu seçer.
     sonraSn  vaka saatinin kaçıncı saniyesinden sonra sorar
     varsa    bu iş yapılmışsa sorar   (ör. "muayene:batin")
     yoksa    bu iş yapılmamışsa sorar (ör. "tetkik:ekg"); yapılınca hiç sormaz
     eylem    seçilince oyunda yapılan iş: "monitor", "tetkik:ekg",
              "mudahale:damar_yolu", "vital:spo2", "sekme:mudahale" (sekme açar)
              ya da sırayla yapılacak işler listesi; null = hiçbir şey
     tekrarSn iş hâlâ yapılmadıysa kaç saniye sonra yeniden sorar
   ===================================================================== */
window.HEMSIRE = {
  ad: "Ercan Demirtaş",
  hitap: "Ercan Abi",
  unvan: "Kıdemli acil hemşiresi · 21 yıl",
  portre: "img/ai/hemsire.webp",

  karsilama: {
    "gogus-agrisi": [
      "Hocam, elli sekiz yaşında bir amca. Yarım saattir göğsünde bir ağırlık var, terli geldi.",
      "Kapıdan girerken elini göğsünden ayırmadı hocam. Ben monitöre hazırım.",
      "Hocam, amcanın yüzü kül gibi. Vakit kaybetmeyelim."
    ],
    "karin-agrisi": [
      "Hocam, yirmi sekiz yaşında bir delikanlı. Karnı dünden beri ağrıyormuş, eliyle sağ altı tutuyor.",
      "Dünden beri bir şey yememiş hocam. Bir bakar mısın?",
      "Genç hasta hocam, sağ alt karın. Acelesi yok gibi duruyor ama ben o kadar emin değilim."
    ],
    "nefes-darligi": [
      "Hocam, yirmi dört yaşında bir hanım. Bahçede çiçek sularken arı sokmuş, boğazı şişiyor!",
      "Hocam, hızlı! Dudağı şişmiş, hırıltılı soluyor.",
      "Hocam, bu hastayı bekletemeyiz. Gözünün kapağına bak, dudağına bak."
    ]
  },

  kotulesti: {
    genel: [
      "Hocam, hastaya bir bakar mısın?",
      "Hocam, durum değişti. Şimdi!",
      "Rengi attı hocam, bak.",
      "Hocam, bu gidiş iyi değil."
    ],
    "gogus-agrisi": [
      "Hocam, tansiyon düştü, alnı soğuk terle doldu!",
      "Amcanın rengi gri hocam. Bu iş artık beklemez.",
      "Bu adam kayıyor hocam. Telefon ne zaman açılacak?"
    ],
    "karin-agrisi": [
      "Hocam, ateşi çıktı, dizlerini karnına çekti. Karnına dokundurmuyor!",
      "Karın tahta gibi oldu hocam. Bu çocuk kötüleşti.",
      "Nabız yüz on sekiz hocam. Bak ona."
    ],
    "nefes-darligi": [
      "Hocam, dudakları mor! Hışırtı çıkarıyor, nefes alamıyor!",
      "Tansiyon yetmiş hocam, hemen bir şey yapmamız lazım!",
      "Saturasyon seksen beş hocam! Boğazını tutuyor!"
    ]
  },

  hedefGecti: [
    "Hocam, saat işliyor. Unuttuğun bir şey var gibi.",
    "Bir şeyin zamanı geçti hocam. Ben söyledim sanma.",
    "Hocam, o iş bu saatte yapılırdı. Bir bakar mısın?",
    "Süre doldu hocam. Not aldım."
  ],

  vitalYok90: [
    "Hocam, hastanın rakamını bilmiyoruz.",
    "Hocam, nabız, tansiyon, saturasyon... Hiçbirini görmedik. Ben bağlayayım mı?",
    "Hocam, rakamsız hasta kör uçuş demek."
  ],

  gereksizTetkik: {
    genel: [
      "Hocam, bu hastaya ne söyleyecek bu tetkik?",
      "Hocam, bu tetkik sonuç gelince hastaya bir şey katar mı?",
      "Bunun parası var, vakti var hocam."
    ],
    bt: ["Hocam, hastayı BT'ye götürürsek monitörden uzak kalır. Gerekli mi?"],
    rad_usg: ["Hocam, radyoloji sırası uzun. Bu hastanın o kadar vakti var mı?"],
    troponin: ["Hocam, bunun sonucu bir saat sonra gelir. Hasta ne yapsın o zamana kadar?"]
  },

  zararli: {
    genel: [
      "Hocam, bunu bir daha konuşmayalım.",
      "Hocam, emri verdin ama ben yapmadan bir daha düşünmeni isterdim.",
      "Not aldım hocam.",
      "Hocam, hasta bunu kaldırmaz."
    ],
    adrenalin_im: ["Hocam, bu hastada ne için adrenalin? Kalbi zaten yoruluyor."],
    adrenalin_iv: ["Hocam, damardan bolus mu? Ritim bozulabilir, bu iş böyle yapılmaz."],
    nitrat: ["Hocam, tansiyon düşükken dil altı nitrat mı? Elini çek."],
    taburcu: ["Hocam, bu hastayı bu hâlde mi gönderdin? Ben kapıyı açmazdım."]
  },

  onay: {
    genel: ["Bak şimdi oldu.", "Hm. Tamam hocam.", "İşte bu. Sıradaki?"],
    ekg: ["Bak şimdi oldu. Kâğıt birazdan elinde, yorum senin."],
    pkg: ["Hocam, kardiyolojiye haber gitti. Tahlili beklemedin, iyi ettin."],
    aspirin: ["Hocam, çiğnetiyorum. Bu ucuz ilaç bazen çok şey yapar."],
    monitor: ["Rakamlar ekranda hocam. Artık kör değiliz."],
    damar_yolu: ["Damar yolu açık hocam. Kan da hazır."],
    oral_kes: ["Hocam, ağzına bir şey vermeyeceğim. Hasta aç, doğru."],
    analjezi: ["Hocam, ağrı kesiciyi geciktirmemen iyi oldu. Ağrıyan hasta anlatamaz."],
    cerrahi: ["Cerrahi nöbetçisi yolda hocam. Zamanında aradın."],
    adrenalin_im: ["Bak şimdi oldu. Uyluğa yaptım hocam.", "İşte bu hocam, ilk ilaç buydu."],
    bacak_kaldir: ["Bacaklarını kaldırdım hocam, tansiyon toparlar."],
    oksijen: ["Maske takıldı hocam, yüksek akım."],
    gozlem: ["Gözleme aldım hocam. Bu hastayı erken göndermeyelim, iyi karar."]
  },

  anormalSonuc: {
    genel: ["Hocam, sonuç geldi. Bir bakar mısın?", "Sonuç elimde hocam, yorum senin.", "Hocam, bu sonuçla iş değişir."],
    ekg: ["Hocam, kâğıtta bir şey var. Ön taraftaki derivasyonlara bak."],
    troponin: ["Hocam, troponin geldi. Ama sen bunu beklemeden de karar verebilirdin, değil mi?"],
    crp: ["CRP de geldi hocam. Tablo birbirini tutuyor mu, bir bak."]
  },

  hareketsiz: [
    "Hocam, hasta orada.",
    "Hocam, çay soğur ama hasta soğumasın.",
    "Hocam, ben bekliyorum; hasta da bekliyor.",
    "Hocam? Emir verecek misin?"
  ],

  duzeldi: {
    genel: ["Hocam, rakamlar toparlıyor.", "Rengi geldi hocam. Ama gözümüzü ayırmayalım."],
    "karin-agrisi": [
      "Hocam, ağrısı hafifledi, konuşabiliyor. Ama muayene bulguları duruyor, değil mi?",
      "Çocuk rahatladı hocam, ama bu rahatlık karnın içindekini değiştirmedi."
    ],
    "nefes-darligi": [
      "Nefesi rahatladı hocam, hırıltı azaldı!",
      "Hocam, konuşabiliyor artık. Ama gözlemden çıkarmayalım."
    ]
  },

  vakaSonu: {
    iyi: {
      genel: ["İyi nöbetti hocam.", "Hm. Bu sefer not aldım ama iyi taraftan.", "Hocam, sana bir şey diyeceğim: iyiydin."],
      "gogus-agrisi": ["Hocam, amca kateter laboratuvarına zamanında girdi. Bu iş böyle yapılır."],
      "karin-agrisi": ["Cerrahi aldı hocam. Çocuk patlamadan gitti."],
      "nefes-darligi": ["Hanım gözlemde hocam. İlk ilaç doğru yerdeydi."]
    },
    kotu: {
      genel: ["Hocam, bu hasta kurtuldu ama biz şanslıydık.", "Bir daha olursa ilk dakikaya bakalım hocam.", "Not aldım hocam. Hepsini."],
      "gogus-agrisi": ["Hocam, amca yetişti ama kalbin bir kısmı geç kaldı."],
      "karin-agrisi": ["Bu kadar beklemek gerekmiyordu hocam."],
      "nefes-darligi": ["Hanım toparladı ama dudaklar morarırken çok geç kalmıştık."]
    },
    kayip: {
      genel: ["Hocam.", "Bu iş bazen böyle olur hocam. Ama bazen olmazdı.", "Yirmi bir yıldır bu kapıdan giriyorum. Alışılmıyor."],
      "gogus-agrisi": ["Bu hastayı kateter laboratuvarında görmemiz gerekiyordu hocam."],
      "karin-agrisi": ["Hocam, bu çocuk bu yaşta, bu kadar kolay bir tablodan gitmemeliydi."],
      "nefes-darligi": ["Hocam, o çanta yanımızdaydı."]
    }
  },

  // "Ercan Abi'ye danış": her danışmada bir kademe ilerler, en fazla 3. Puan ve süre yemez.
  ipucu: {
    "gogus-agrisi": [
      "Hocam, bu adam yarım saattir bu hâlde. Burada dakika para gibi harcanıyor; ilk neye bakman gerektiğini bir düşün.",
      "Göğüs ağrısında kalbin elektriğine bakmadan hiçbir şeye karar verilmez. Kâğıdı çıkar; tahlil sonucunu da bekleme, o saat geç saat.",
      "EKG'de ön duvara bakan derivasyonlarda yükselme görürsen kateter laboratuvarını ara; tahlil beklenmez. Çiğnetilecek o ucuz beyaz hapı da unutma."
    ],
    "karin-agrisi": [
      "Hocam, bu çocuğun ağrısı bir yerden başlayıp başka bir yere inmiş. Anlattığı yolu iyi dinle.",
      "Karnına elle bak, ağrı bir noktaya oturmuş mu. Kanını ve ultrasonu öne al. Ağrısını da kes; ağrı kesmek muayeneyi bozmaz.",
      "Bu iş bıçak işi hocam: ağzına bir şey verme, damar yolu ve serum, cerrahi nöbetçisini ara. Geç kalırsak karnın her yeri ağrır."
    ],
    "nefes-darligi": [
      "Dakikalar önemli hocam. Bahçeden gelen, her tarafı şişen bir hasta; neyin hızla kötüleştiğini düşün.",
      "Tahlil de film de bu hastayı kurtarmaz. Acil çantasında dakikalar içinde fark yaratan tek bir ilaç var. Cilde, dudağa, tansiyona bak.",
      "Uyluğun dış yanına, kasa, tek doz: çantadaki o ampul. Sonra oksijen, sonra yatır, bacaklarını kaldır. Kaşıntı ilacı en sona kalır."
    ]
  },
  ipucuBitti: "Daha fazlasını söylersem sen gitmiş olursun hocam.",

  etkilesim: {
    "gogus-agrisi": [
      { id: "gogus-ekg", sonraSn: 60, yoksa: "tetkik:ekg", tekrarSn: 120,
        soru: "Hocam, EKG'yi çekeyim mi, yoksa önce öykü mü alıyorsun?",
        secenekler: [
          { ad: "Çek", eylem: "tetkik:ekg", hemsire: "Çekiyorum hocam, kâğıt birkaç dakikada elinde." },
          { ad: "Önce öykü", eylem: "sekme:oyku", hemsire: "Tamam hocam. Ama göğüs ağrısı ilk on dakikayı sever." },
          { ad: "Troponin gönder", eylem: "tetkik:troponin", hemsire: "Gönderiyorum hocam. Bir saat sonra bakarız. Hasta ne yapacak o zamana kadar?" }
        ] },
      { id: "gogus-damar", sonraSn: 0, varsa: "tetkik:ekg", yoksa: "mudahale:damar_yolu", tekrarSn: 120,
        soru: "Hocam, damar yolunu açıp kan alayım mı?",
        secenekler: [
          { ad: "Aç, kan al", eylem: "mudahale:damar_yolu", hemsire: "Açıyorum hocam. Kan bekler, damar yolu beklemez." },
          { ad: "Sonra", eylem: null, hemsire: "Sonra olmaz hocam, ama sen bilirsin." }
        ] }
    ],
    "karin-agrisi": [
      { id: "karin-analjezi", sonraSn: 0, varsa: "muayene:batin", yoksa: "mudahale:analjezi", tekrarSn: 180,
        soru: "Hocam, çocuk çok ağrıda. Ağrı kesici yazacak mısın?",
        secenekler: [
          { ad: "Ağrı kesici ver", eylem: ["mudahale:damar_yolu", "mudahale:analjezi"], hemsire: "Veriyorum hocam. Ağrı kesmek bulgunun üstüne örtü çekmez." },
          { ad: "Önce muayene bitsin", eylem: null, hemsire: "Tamam hocam. Ama çocuk kıvranıyor." },
          { ad: "Ağrı kesme, bulgu bozulur", eylem: null, hemsire: "Hocam, bu eski bir yanlış. Ağrı kesmek muayeneyi bozmaz. Not aldım." }
        ] },
      { id: "karin-su", sonraSn: 240, yoksa: "mudahale:oral_kes", tekrarSn: 0,
        soru: "Hocam, hasta su istiyor. Birkaç yudum versem?",
        secenekler: [
          { ad: "Hiçbir şey verme", eylem: "mudahale:oral_kes", hemsire: "Tamam hocam, ağzına bir şey yok." },
          { ad: "Birkaç yudum ver", eylem: null, hemsire: "Verdim hocam. Ama ameliyata giderse bu iş sorun çıkarabilir." }
        ] }
    ],
    "nefes-darligi": [
      { id: "nefes-canta", sonraSn: 40, yoksa: "mudahale:adrenalin_im", tekrarSn: 60,
        soru: "Hocam, acil çantası elimde. Emir ver, ilacı çekeyim mi, yoksa önce monitör mü?",
        secenekler: [
          { ad: "İlacı çek (müdahaleye geç)", eylem: "sekme:mudahale", hemsire: "Çekiyorum hocam, hangisi? Emir ver." },
          { ad: "Önce monitörü bağla", eylem: "monitor", hemsire: "Bağladım hocam. Ama bu hastada dakika ilaçtan geçer." },
          { ad: "Önce tetkik iste", eylem: "sekme:tetkik", hemsire: "Hocam, tanı klinik. Tetkik bekleme." }
        ] },
      { id: "nefes-pozisyon", sonraSn: 90, yoksa: "mudahale:bacak_kaldir", tekrarSn: 0,
        soru: "Hocam, başı dönüyor, tansiyonu düşük. Nasıl yerleştireyim?",
        secenekler: [
          { ad: "Yatır, bacaklarını kaldır", eylem: "mudahale:bacak_kaldir", hemsire: "Yatırıyorum hocam. Bacaklarını da kaldırdım." },
          { ad: "Oturt", eylem: null, hemsire: "Oturtuyorum hocam. Ama tansiyon bu kadar düşükken dik oturtmak iyi olmaz, bir daha düşün." }
        ] }
    ]
  }
};
