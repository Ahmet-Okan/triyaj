/* =====================================================================
   TRİYAJ · TERİMLER (terimler.js)
   ---------------------------------------------------------------------
   Crusader Kings III'teki iç içe ipuçları gibi: metinde geçen terimin
   üstüne gelince (telefonda dokununca) açıklaması açılır. Açıklamanın
   içindeki terimler de açılır; tıklayınca pencere sabitlenir.
   desen: metinde aranacak yazılışlar (en uzunu önce eşleşir, büyük/küçük
   harf fark etmez; sondaki ekler dışarıda kalır: "troponini" → troponin).
   Ortak düzenleyebilir; tanımlar kısa ve hekim onaylı olmalı.
   ===================================================================== */
window.TERIMLER = {
  ekg:         { ad: "EKG", desen: ["12 derivasyonlu EKG", "EKG"], tanim: "Elektrokardiyografi: kalbin elektriksel etkinliğinin 12 farklı açıdan (derivasyon) kaydı. Göğüs ağrısında ilk 10 dakikada çekilir." },
  derivasyon:  { ad: "Derivasyon", desen: ["derivasyon"], tanim: "EKG'de kalbe bakılan açılardan her biri. V1–V4 kalbin ön duvarına bakar." },
  st:          { ad: "ST yükselmesi", desen: ["ST segment elevasyonu", "ST elevasyonu", "ST yükselmesi"], tanim: "EKG'de ST segmentinin taban çizgisinin üstüne çıkması. Belli bir bölgenin derivasyonlarında görülürse o bölgede tam tıkanma (STEMI) düşündürür." },
  stemi:       { ad: "STEMI", desen: ["STEMI"], tanim: "ST yükselmeli miyokart enfarktüsü: bir koroner arter tamamen tıkanmış, kalp kasının bir bölgesi kansız kalıyor. Tanı EKG ile konur, troponin beklenmez; tedavi primer PKG." },
  troponin:    { ad: "Troponin", desen: ["troponin"], tanim: "Kalp kası hasar görünce kana karışan protein. Sonucu geç gelir; STEMI tanısı için beklenmez." },
  pkg:         { ad: "Primer PKG", desen: ["primer PKG", "kateter laboratuvarı", "anjiyografi", "PKG"], tanim: "Perkütan koroner girişim: kasıktan ya da bilekten girilen kateterle tıkalı damar balon ve stentle açılır. STEMI'de ilk tedavi." },
  aspirin:     { ad: "Aspirin", desen: ["aspirin"], tanim: "Pıhtılaşmayı azaltan ilaç. Akut koroner sendromda 150–300 mg çiğnetilir." },
  nitrat:      { ad: "Nitrat", desen: ["nitrat"], tanim: "Damar genişletici ilaç; göğüs ağrısını azaltabilir. Tansiyon düşükken (hipotansiyon) verilmez." },
  diseksiyon:  { ad: "Aort diseksiyonu", desen: ["aort diseksiyonu", "diseksiyon"], tanim: "Aortun iç tabakasının yırtılması. Yırtılır tarzda, sırta vuran ağrı ve kollar arasında nabız ya da tansiyon farkı beklenir." },
  pe:          { ad: "Pulmoner emboli", desen: ["pulmoner emboli"], tanim: "Akciğer atardamarına pıhtı atması. Ani nefes darlığı, düşük SpO₂ ve risk faktörü (uzun yolculuk, ameliyat) beklenir." },
  spo2:        { ad: "SpO₂", desen: ["SpO₂", "saturasyon", "satürasyon"], tanim: "Nabız oksimetresiyle ölçülen oksijen doygunluğu. Karbonmonoksit zehirlenmesinde yanıltıcı biçimde normal görünür." },
  oksimetre:   { ad: "Nabız oksimetresi", desen: ["nabız oksimetresi"], tanim: "Parmaktan ışıkla SpO₂ ölçen cihaz. COHb'yi oksijenli hemoglobinden ayıramaz." },
  cohb:        { ad: "COHb", desen: ["COHb", "karboksihemoglobin"], tanim: "Karbonmonoksitin bağlandığı hemoglobin. Kan gazında CO-oksimetriyle ölçülür; yüksekliği zehirlenmeyi gösterir." },
  cooksimetri: { ad: "CO-oksimetri", desen: ["CO-oksimetri"], tanim: "Kan gazı cihazında hemoglobin türlerini (COHb dahil) ayrı ayrı ölçen yöntem." },
  kangazi:     { ad: "Kan gazı", desen: ["kan gazı", "kan gazında", "kan gazını"], tanim: "Kandaki pH, oksijen, karbondioksit ve laktat ölçümü. Cihaz CO-oksimetri yapıyorsa COHb de ölçülür." },
  laktat:      { ad: "Laktat", desen: ["laktat"], tanim: "Dokular yeterince oksijen alamayınca yükselen madde; doku oksijensizliğinin göstergesi." },
  hbo:         { ad: "Hiperbarik oksijen", desen: ["hiperbarik oksijen", "hiperbarik"], tanim: "Basınçlı odada %100 oksijen solutma. Ağır karbonmonoksit zehirlenmesinde (bilinç değişikliği, nörolojik bulgu, gebelik, yüksek COHb) düşünülür." },
  gsm:         { ad: "Geri solumasız maske", desen: ["geri solumasız maske", "geri solumasız"], tanim: "Rezervuar torbalı oksijen maskesi; 15 L/dk ile en yüksek oksijen oranını verir." },
  anafilaksi:  { ad: "Anafilaksi", desen: ["anafilaksi"], tanim: "Alerjenden dakikalar sonra cilt, solunum ve dolaşımı birlikte tutan ağır alerjik tepki. Tanı kliniktir; ilk ilaç kas içine adrenalin." },
  adrenalin:   { ad: "Adrenalin", desen: ["adrenalin"], tanim: "Anafilakside hayat kurtaran ilaç: 0,5 mg kas içine (IM), uyluğun dış yanına. Damardan bolus yalnız kalp durmasında." },
  stridor:     { ad: "Stridor", desen: ["stridor"], tanim: "Üst hava yolu daraldığında nefes alırken duyulan yüksek perdeli ses; acil hava yolu tehlikesi." },
  hirilti:     { ad: "Hırıltı (wheezing)", desen: ["wheezing", "hırıltı"], tanim: "Alt hava yolları daraldığında, çoğunlukla nefes verirken duyulan ıslık sesi." },
  urtiker:     { ad: "Ürtiker", desen: ["ürtiker", "kurdeşen"], tanim: "Kaşıntılı, kabarık kızarıklıklar; alerjik tepkinin cilt bulgusu." },
  anjiyoodem:  { ad: "Anjiyoödem", desen: ["anjiyoödem"], tanim: "Dudak, göz kapağı, dil gibi bölgelerde derin doku şişmesi. ACE inhibitörüne bağlı olanında ürtiker olmaz." },
  bifazik:     { ad: "Bifazik reaksiyon", desen: ["bifazik reaksiyon", "bifazik"], tanim: "Anafilaksi düzeldikten saatler sonra tablonun yeniden başlaması; bu yüzden hasta gözlemde tutulur." },
  apandisit:   { ad: "Apandisit", desen: ["apandisit", "apendiks"], tanim: "Apendiksin iltihabı. Göbekten başlayıp sağ alta göçen ağrı, iştahsızlık ve McBurney hassasiyeti tipiktir; geç kalınırsa perforasyon." },
  mcburney:    { ad: "McBurney noktası", desen: ["McBurney"], tanim: "Sağ alt karında apendiksin izdüşümündeki nokta; apandisitte bastırınca ağrır." },
  rebound:     { ad: "Rebound", desen: ["rebound"], tanim: "Karına bastırıp aniden bırakınca ağrının artması; karın zarı (periton) tahrişini gösterir." },
  defans:      { ad: "Defans", desen: ["defans"], tanim: "Karın kaslarının istemsiz kasılması; karın zarı tahrişi bulgusu." },
  perforasyon: { ad: "Perforasyon", desen: ["perforasyon"], tanim: "İltihaplı organın delinmesi; yaygın karın zarı iltihabına (peritonit) yol açar." },
  crp:         { ad: "CRP", desen: ["CRP"], tanim: "İltihapta yükselen kan proteini; tek başına tanı koydurmaz." },
  lokosit:     { ad: "Lökosit", desen: ["lökositoz", "lökosit"], tanim: "Beyaz kan hücresi; enfeksiyon ve iltihapta sayısı artar (lökositoz)." },
  usg:         { ad: "USG", desen: ["USG", "ultrason"], tanim: "Ses dalgalarıyla görüntüleme. Apandisitte kalınlaşmış, basıyla kapanmayan apendiks görülebilir." },
  gks:         { ad: "GKS", desen: ["GKS"], tanim: "Glasgow Koma Skalası: göz, sözel ve motor yanıtla bilinç düzeyi (3–15)." },
  tasikardi:   { ad: "Taşikardi", desen: ["taşikardi"], tanim: "Kalp hızının dakikada 100'ün üstünde olması." },
  hipotansiyon:{ ad: "Hipotansiyon", desen: ["hipotansiyon", "hipotansif"], tanim: "Düşük tansiyon; dolaşım yetersizliğinin (şok) habercisi olabilir." },
  triyaj:      { ad: "Triyaj", desen: ["triyaj"], tanim: "Hastaları aciliyetine göre sıralama. Türkiye'de kırmızı (hemen), sarı (acil), yeşil (bekleyebilir) alan." },
  enabiz:      { ad: "e-Nabız", desen: ["e-Nabız"], tanim: "Türkiye'nin kişisel sağlık kaydı sistemi: önceki başvurular, tahliller, reçeteler. Oyundaki ekran temsilîdir." },
  menenjit:    { ad: "Menenjit", desen: ["menenjit"], tanim: "Beyin zarlarının iltihabı. Ateş, ense sertliği, bilinç değişikliği beklenir." },
  sak:         { ad: "Subaraknoid kanama", desen: ["subaraknoid kanama"], tanim: "Beyin zarları arasına kanama. Birden başlayan, hayatın en şiddetli 'gök gürültüsü' baş ağrısıyla gelir." },
  konfuzyon:   { ad: "Konfüzyon", desen: ["konfüzyon", "konfüze"], tanim: "Bilinç bulanıklığı; yer, zaman ve kişi karışıklığı." }
};
