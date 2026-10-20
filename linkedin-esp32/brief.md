# Tek LinkedIn gönderisi: ESP32 + ev modemi ile nefes ve konum tahmini

Bu gönderi, ESP32 ile yapılan iki deneyi (nefes ritmi ve oda içi konum) TEK bir paylaşımda anlatacak. Gönderiye 2 görsel eklenecek: 1) nefes grafiği, 2) kuşbakışı oda planı.

## Daha önce paylaşılan (kısa atıf yeterli)
Laptop RSSI ile "odada biri var mı?" denemesi: araya girince −43'ten −50 dBm'e düşüş; Windows değeri ~5 sn'de bir yenilediği için hızlı geçişler kaçıyordu. Kapanış: "sıradaki denemem ESP32 ile CSI".

## Ortak kurulum (gerçek)
- Elde olan bir ESP32 geliştirme kartı (ESP32-WROOM-32D) ve ev modemi.
- ESP32 modemin 2,4 GHz ağına bağlanıyor, modeme saniyede 100 ping atıyor; her cevaptan CSI okunuyor: 52 alt taşıyıcının genliği ayrı ayrı.
- Tarayıcıda canlı ısı haritası (Web Serial ile doğrudan USB'den).
- Yaşanan sorun: alıcının otomatik kazanç ayarı (AGC) her pakette tüm değerleri birlikte büyütüp küçültüyordu → sürekli "hareket var" yanlış alarmı. Çözüm: her paketi kendi ortalamasına bölmek.

## Deney 1: Nefes (gerçek sonuçlar)
- Hareketsiz oturulurken, son 60 sn'lik veride dakikada 6–42 nefes bandındaki en güçlü ritim aranıyor.
- Doğrulama için ekranda rehberli nefes dairesi kullanıldı.
- Rehber 10/dk → ölçülen 9,9–11,0 /dk. Rehber 6/dk → ölçülen 6,0–7,1 /dk.
- Odadan çıkınca ritmin gücü ~60 sn içinde gürültü seviyesine indi.
- Sınır: 30–60 sn gecikme; tutarlı sonuç rehberli, düzenli nefeste; doğal nefes daha düzensiz ölçüldü; tıbbi değil.

## Deney 2: Oda içinde konum (gerçek sonuçlar)
- Fikir: farklı bir noktada durunca sinyalin yansıma yolları değişiyor; 52 alt taşıyıcının deseni o nokta için tekrar tanınabilir bir "parmak izi" oluyor.
- 3×3 kuşbakışı oda planında 4 nokta öğretildi, her birinde 15 sn kıpırdamadan durularak.
- Test: her noktanın kaydının ilk yarısıyla öğrenildi, ikinci yarısıyla sınandı.
- Sonuç: 60 tahminin 48'i doğru (%80). 4 seçenek → şans seviyesi %25.
  - Orta %100 (15/15), Sol orta %93 (14/15), Orta ön %80 (12/15), Sağ arka %47 (7/15, çoğunlukla Orta ön ile karıştı; o kayıtta muhtemelen biraz hareket edildi).
- Sınır: bu bir harita değil, öğretilen noktalardan hangisine en yakın olunduğunun tahmini; eşyalar yer değişirse yeniden öğretmek gerekir; yürürken tahmin dalgalanıyor.

## Sıradaki adım (merak için)
Elde röle kartı var: hareket algılanınca ışık yakmak.

## İstenen
Samimi, meraklı "evde deney yapan maker" sesi. Abartı/korku dili yok ("gördü" değil "tahmin etti / ölçtü"). Gizliliğe tek cümle.
