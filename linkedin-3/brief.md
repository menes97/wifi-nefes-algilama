# LinkedIn serisi 3. bölüm: WiFi ile odadaki konumu tahmin etmek (ESP32 + CSI)

## Önceki bölümler
- 1. bölüm: Laptop RSSI ile "odada biri var mı?" Araya girince −43'ten −50 dBm'e düşüş; Windows değeri ~5 sn'de bir yenilediği için hızlı geçişler kaçtı.
- 2. bölüm: ESP32 + CSI ile nefes ritmi. Rehber 10/dk → ölçülen 9,9–11,0; rehber 6/dk → 6,0–7,1. Kapanış sorusu: "Sonraki deney oda içinde konum tahmini mi olsun, hareketle ışık yakmak mı?"

## 3. bölümde gerçekten yapılanlar (sadece bunlar, uydurma yok)
- Aynı ESP32 ve ev modemi. ESP32 modeme saniyede 100 ping atıyor; her cevaptan 52 alt taşıyıcının genliği okunuyor.
- Fikir ("parmak izi" yöntemi): Odada farklı bir noktada durunca sinyalin duvarlardan, eşyalardan ve vücuttan yansıyan yolları değişiyor; 52 alt taşıyıcının oluşturduğu desen her nokta için farklı ve tekrarlanabilir oluyor.
- Tarayıcıdaki izleyiciye kuşbakışı 3×3'lük bir oda planı eklendi. Bir kareye gidip 15 sn kıpırdamadan durunca sistem o noktanın desenini öğreniyor (0,5 sn'lik 30 örnek). Sonra en yakın örneklere bakarak (k-en yakın komşu) şu an hangi karede olunduğunu tahmin edip o kareyi yakıyor.
- 4 nokta öğretildi: Sol orta, Orta, Orta ön, Sağ arka.
- Test yöntemi (dürüst olsun diye): her noktanın kaydının ilk yarısıyla öğrenildi, ikinci yarısıyla sınandı (yan yana örneklerle kendini kandırmamak için).
- Sonuç: genel %80 doğru (48/60). 4 seçenek olduğu için şans seviyesi %25.
  - Orta: %100 (15/15)
  - Sol orta: %93 (14/15)
  - Orta ön: %80 (12/15)
  - Sağ arka: %47 (7/15), çoğunlukla "Orta ön" ile karıştı; o kayıt sırasında muhtemelen biraz hareket edildi.
- Sınırlar:
  - Bu bir harita değil, öğretilen birkaç noktadan hangisine en yakın olunduğunun tahmini.
  - Eşyalar yer değiştirirse veya başka biri odadaysa yeniden öğretmek gerekir.
  - Kıpırdamadan durmak gerekiyor; yürürken tahmin dalgalanıyor.
  - Odada kimse yokken ("boş oda") ayrıca öğretilmedi; sistematik canlı yürüme testi henüz yapılmadı.
- Bir yan not (isteğe bağlı): aynı hafta laptop hoparlörü + mikrofonuyla ses sonarı da denendi; yankılar uzaklaşmayı gösterdi ama laptopun ses efekti yazılımı sesi 20 ms gecikmeli ikinci kez çaldığı için sonuç henüz temiz değil. Bu, sonraki bölüm için bir merak noktası olabilir.

## Görsel
Gerçek sonuçlardan çizilmiş kuşbakışı oda planı: 4 öğretilen kare doğruluk yüzdeleriyle renkli, diğerleri gri; üst kenarda modem duvarı; altta özet kartlar.

## İstenen
Samimi, meraklı maker sesi. 2. bölümdeki "konum mu, ışık mı?" sorusuna kısa atıf (konum seçildi gibi). Abartı yok: "WiFi beni gördü" değil, "WiFi hangi noktada durduğumu tahmin etti". Gizliliğe tek cümle. Kapanışta kolay cevaplanır tek soru.
