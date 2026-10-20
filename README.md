# WiFi ile Varlık, Nefes ve Konum Algılama

Evdeki modem ve WiFi sinyaliyle odada biri var mı, hareket ediyor mu, nefes ritmi ne, odanın neresinde duruyor diye ölçme denemeleri. Önce laptopun WiFi sinyal gücüyle (RSSI), sonra bir ESP32'nin okuduğu kanal bilgisiyle (CSI).

## Sonuçlar

- **Laptop RSSI:** Laptop ile modem arasına girince sinyal −43'ten −50 dBm'e düştü. Windows değeri ~5 sn'de bir yenilediği için hızlı geçişler kaçıyor.
- **ESP32 CSI:** Saniyede 100 ölçüm, her ölçümde 52 alt taşıyıcı. Alıcının otomatik kazanç ayarı (AGC) her paketi ölçeklediği için her paket kendi ortalamasına bölünüyor. Hareketsizken hareket skoru ~4–6, hareketliyken 12–29.
- **Nefes:** Rehber 10 nefes/dk → ölçülen 9,9–11,0. Rehber 6 nefes/dk → ölçülen 6,0–7,1. Odadan çıkınca ritmin gücü gürültü seviyesine indi. 60 sn pencere, 30–60 sn gecikme. Tıbbi bir ölçüm değildir.
- **Oda içi konum:** 4 noktanın "parmak izi" öğretildi (k-en yakın komşu). Her kaydın ilk yarısıyla öğrenilip ikinci yarısıyla sınandığında %80 doğru (şans %25). Orta %100, Sol orta %93, Orta ön %80, Sağ arka %47.

## Klasörler

| Klasör | İçerik |
|---|---|
| `rssi-monitor/` | Laptopun WiFi sinyal gücünü (RSSI) canlı çizen sayfa. `node rssi-monitor/server.js` → http://localhost:8765 (ağ adını ve modem MAC adresini hiç okumaz) |
| `esp32-csi/csi_recv/` | ESP32 programı. Modeme bağlanır, saniyede 100 ping atar, her cevabın CSI verisini USB'den gönderir |
| `esp32-csi/viewer/` | Canlı CSI izleyici: şelale ısı haritası, hareket skoru, nefes hızı, rehberli nefes, oda haritası. `node esp32-csi/viewer/server.js` → Chrome'da http://localhost:8766 |
| `ses-sonari/` | Laptop hoparlörü ve mikrofonuyla deneysel ses sonarı (yarım kaldı). `node ses-sonari/server.js` → http://localhost:8767 |
| `rssi-nasil-calisir.html` | RSSI'ı anlatan etkileşimli sayfa |
| `linkedin/`, `linkedin-2/`, `linkedin-3/`, `linkedin-esp32/` | LinkedIn gönderileri: görseller, videolar, metinler |
| `linkedin-video/` | 1. bölümün canlandırma videosunun (Remotion) kaynak kodu |

## Kurulum

1. [Arduino CLI](https://arduino.github.io/arduino-cli/) ve ESP32 kart paketini kur:
   ```
   arduino-cli config add board_manager.additional_urls https://espressif.github.io/arduino-esp32/package_esp32_index.json
   arduino-cli core install esp32:esp32
   ```
2. `esp32-csi/csi_recv/secrets.example.h` dosyasını `secrets.h` adıyla kopyala ve doldur: ağ adı, şifre, modemin 2,4 GHz BSSID'si ve kanalı. BSSID ve kanalı Windows'ta şu komutla bulabilirsin:
   ```
   netsh wlan show networks mode=bssid
   ```
3. Derle ve yükle (port numarası sende farklı olabilir):
   ```
   arduino-cli compile --fqbn esp32:esp32:esp32 esp32-csi/csi_recv
   arduino-cli upload --fqbn esp32:esp32:esp32 -p COM6 esp32-csi/csi_recv
   ```
   Kart bağlanmazsa: Boot'a basılı tut, EN'e bas, Boot'u bırak. Bilgisayarın kendi USB girişini kullan.
4. `node esp32-csi/viewer/server.js` çalıştır, Chrome'da http://localhost:8766 adresini aç ve "ESP32'ye bağlan"a bas.

## Gizlilik

Bu depoda **yok**: WiFi şifresi, ağ adı, modemin MAC adresi (bir MAC adresi evin konumunu ele verebilir), derlenmiş program, ham ölçüm kayıtları (nefes, konum, sinyal), ham ekran kayıtları ve ekran görüntüleri. Hepsi `.gitignore` ile dışarıda tutuluyor. Depodaki videolar LinkedIn için hazırlanmış hâlleri; ağ adı gizlenmiş ve ses içermiyorlar.

Yerel sunucular (`server.js`) sadece bu bilgisayardan erişilebilir (`127.0.0.1`), başka sitelerden gelen yazma isteklerini reddeder ve modemin MAC adresini okumaz. Bu yüzden `linkedin-2/build-chart.js` ve `linkedin-3/build-map.js` kendi ölçüm verin olmadan çalışmaz; görsellerin kendisi depoda.

WiFi ile algılama sadece kendi evinde ve evde yaşayanların bilgisiyle yapılmalı.
