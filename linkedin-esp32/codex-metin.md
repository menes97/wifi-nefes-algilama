## Önerilen gönderi metni

Evdeki Wi-Fi sinyalinde nefes ritmine benzeyen bir iz buldum.  
Aynı sinyal, odada durduğum noktayı da tahmin etmeye başladı.

Önceki laptop denememde RSSI ile “odada biri var mı?” diye bakmıştım; şimdi elimdeki ESP32-WROOM-32D ve ev modemimle CSI verisini denedim.

ESP32, modemin 2,4 GHz ağına bağlanıp saniyede 100 ping gönderiyor. Her cevaptan 52 alt taşıyıcının genliğini okuyup tarayıcıda canlı ısı haritasına döküyorum. Başta alıcının otomatik kazanç ayarı (AGC) bütün değerleri birlikte değiştirince sistem sürekli hareket var sanıyordu; her paketi kendi ortalamasına bölerek bu sorunu giderdim.

1️⃣ **Nefes**  
Hareketsiz otururken son 60 saniyedeki en güçlü ritmi aradım. Ekrandaki rehber 10 nefes/dk iken ölçüm 9,9–11,0; 6 nefes/dk iken 6,0–7,1 nefes/dk çıktı. Odadan çıkınca ritmin gücü yaklaşık 60 saniyede gürültü düzeyine indi. 1. görselde nefes grafiği var.

2️⃣ **Oda içi konum**  
Kuşbakışı oda planında dört noktayı, her birinde 15 saniye hareketsiz durarak öğrettim. Kayıtların ilk yarısıyla öğrenip ikinci yarısıyla sınadığımda 60 tahminin 48’i doğru çıktı (%80). Bu, odanın tam haritası değil; öğretilen noktalardan hangisine yakın olduğumun tahmini. 2. görselde oda planı var.

Nefeste 30–60 saniye gecikme var ve doğal nefes daha düzensiz ölçüldü; bu tıbbi bir ölçüm değil. Konum tahmini yürürken dalgalanıyor, eşyalar değişirse noktaları yeniden öğretmek gerekiyor. Gizlilik açısından, bu denemede kamera veya mikrofon yerine Wi-Fi sinyalindeki değişimi kullandım.

Sıradaki adım: elimdeki röle kartıyla hareket algılanınca ışığı yakmak.

Sizce önce hangisini geliştirmeliyim: nefes ölçümünü mü, konum tahminini mi?

#ESP32 #WiFi #CSI #Maker #IoT

## Alternatif ilk 2 satır

1. Evdeki modemle nefes ritmini ölçmeyi denedim.  
   Aynı kurulumla odada nerede durduğumu da tahmin ettim.

2. Bir ESP32 ve ev modemiyle iki soru sordum:  
   Nefes ritmi ve oda içindeki konum Wi-Fi sinyalinde iz bırakıyor mu?

3. Wi-Fi sinyalindeki değişim önce nefes grafiğinde belirdi.  
   Sonra odadaki dört noktayı ayırt etmeyi denedim.