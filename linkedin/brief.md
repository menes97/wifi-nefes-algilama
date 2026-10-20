# LinkedIn paylaşımı: WiFi ile varlık algılama (RSSI) denemesi

## Bağlam (gerçek olanlar, uydurma yok)
- Paylaşan kişi evde bir deney yaptı: "WiFi ile odada biri var mı anlaşılabilir mi?"
- Laptop: Intel Wi-Fi 6 AX201, modem: Vodafone, 5 GHz, kanal 104.
- Laptoptan RSSI (alınan sinyal gücü) okuyan küçük bir Node.js aracı yaptı, canlı grafik çiziyor.
- Ölçülen değer: -43 dBm (mükemmel bölge). Modemin ~100 mW (20 dBm) yaydığı varsayımıyla bu, yaklaşık 2 milyon kat zayıflama (63 dB).
- Bulgu 1: Windows bağlı ağın RSSI değerini her pakette değil, sadece WiFi taraması yaptıkça yeniliyor. 16 sn boyunca 4 Hz okuma: değer hiç değişmedi. Ping trafiği de değiştirmedi. Tarama tetikleyince değişti; Windows taramaları kısıtladığı için ~5 sn'de bir yeni değer geliyor.
- Bulgu 2: İnsan vücudu (%60 su) 5 GHz sinyali birkaç dB zayıflatıyor. Laptop ile modem arasında birkaç saniye durunca grafikte basamaklı düşüş görüldü. Hızlı geçişler kaçıyor.
- Sorun çözme anı: Windows konum izni kapalıydı (AtlasOS kurulu sistemde), netsh WiFi bilgisini vermiyordu; AtlasOS'un kendi "Enable Location" betiğiyle açıldı. (Gönderide şart değil.)
- Bir de interaktif açıklama sayfası hazırlandı: simülatörde insan figürü sürüklenince RSSI düşüyor; dBm merdiveni; mesafe grafiği; RSSI vs CSI karşılaştırması.
- Sonraki adım: ESP32 ile CSI (64+ alt taşıyıcının her biri ayrı ölçülüyor), konum/hareket için.
- Link: [LINK] (claude.ai artifact sayfası)

## Taslak metin (Türkçe)

Evde WiFi ile "odada biri var mı?" sorusunu cevaplamaya çalıştım. 📡

İlk adım RSSI'dı: laptopun modemden gelen sinyalin gücünü ölçmesi. Öğrendiklerim:
• −43 dBm, modemin yaydığı gücün yaklaşık 2 milyonda biri demek.
• İnsan vücudu %60 su olduğu için 5 GHz sinyali birkaç dB zayıflatıyor. Biri modemle laptop arasına girince bu ölçülebiliyor.
• Windows bu değeri sadece WiFi taraması yaptıkça, yaklaşık 5 saniyede bir yeniliyor. Varlık algılamaya yetiyor ama konum için yetmiyor.

Sonraki adım: ESP32 ile CSI. Tek bir sayı yerine 64+ alt frekansın her birini ayrı ölçmek.

Nasıl çalıştığını interaktif bir sayfada anlattım, insan figürünü sürükleyip sinyalin düşüşünü görebilirsiniz 👇
[link]

#WiFiSensing #IoT #ESP32 #Elektronik

## Görsel fikri (taslak)
Tek kare, 1080x1350 (4:5) LinkedIn görseli. Modem solda, laptop sağda, arada bir insan silueti; modemden yayılan dalgalar insanın arkasında gölge bırakıyor. Büyük "−43 dBm" yazısı ve küçük bir sinyal grafiğinde basamaklı düşüş. Başlık: "WiFi odada biri olduğunu anlayabilir mi?"
