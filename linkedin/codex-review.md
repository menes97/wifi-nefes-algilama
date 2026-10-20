## Taslağa eleştiri

- Deneyin sorusu iyi bir giriş; ilk iki satırda beklenmedik bulguyu da göstermek merakı artırır.
- “Varlık algılamaya yetiyor” sonucu fazla kesin. Deneyde, modem ile laptop arasında birkaç saniye durunca sinyalde düşüş görülmüş; hızlı geçişler kaçmış.
- −43 dBm ve “2 milyon kat” hesabı ilginç, ama bu gönderinin odağı için gerekli değil. Okuyucunun aklında ölçümün sınırı kalmalı.

## Önerilen gönderi metni

WiFi sinyalinden odada biri olduğunu anlayabilir miyim diye evde denedim.  
Grafikte birini gördüm; hızlı geçişleri ise kaçırdım.

Laptopun aldığı sinyal gücünü (RSSI) okuyan küçük bir Node.js aracı yapıp canlı grafiğe baktım. Modemle laptop arasında birkaç saniye durunca sinyalde basamaklı bir düşüş görünüyordu.

Asıl sürpriz ölçümün hızıydı: Windows, bağlı olduğum ağın RSSI değerini her okumada yenilemiyordu. 16 saniye boyunca saniyede 4 kez okudum; değer hiç değişmedi. Ping trafiği de bunu değiştirmedi. WiFi taraması tetikleyince yeni değer geldi, ama yaklaşık 5 saniyede bir.

Yani bu kurulumda birinin arada durduğunu görebildim; hızlı hareketleri yakalayamadım. Sıradaki denemem, ESP32 ile sinyali CSI üzerinden daha ayrıntılı incelemek.

Deneyi anlatan interaktif sayfada insan figürünü sürükleyip RSSI’nin nasıl değiştiğini görebilirsiniz: [LINK]

Sizce böyle bir denemede önce ölçüm sıklığını mı, sinyalin ayrıntısını mı iyileştirmek daha öğretici olur?

#WiFi #RSSI #ESP32 #Maker

## Görsel önerisi

**1080 × 1350 px, tek kare:** Solda modem, sağda canlı RSSI grafiği açık bir laptop; aralarında duran sade bir insan silueti. Sinyal dalgaları siluetin ardından daha soluk devam etsin. Laptop ekranındaki grafik, gözlenen basamaklı düşüşü göstersin; eksenlerde sayı veya ağ bilgisi olmasın. Koyu lacivert zemin, turkuaz sinyal çizgileri ve düşüşte sıcak turuncu vurgu; temiz, teknik illüstrasyon stili.

Görselde yalnızca iki kısa satır yazı olsun:

> WiFi ile odada biri var mı?  
> Evde bir RSSI denemesi

## Alternatif ilk 2 satır

1. WiFi sinyalinden odada biri olduğunu anlamaya çalıştım.  
   Birkaç saniye duran kişiyi gördüm; hızlı geçişi kaçırdım.

2. Evdeki WiFi sinyalini grafiğe dökünce bir düşüş gördüm.  
   Sonra ölçümün sandığım kadar sık yenilenmediğini fark ettim.

3. Modemle laptop arasına geçince RSSI grafiği değişti.  
   Peki aynı yöntem hareket eden birini de yakalar mı?