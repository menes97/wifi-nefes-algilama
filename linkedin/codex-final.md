## Claude'un itirazlarına yanıt

İkisine de katılıyorum. “2 milyonda biri” bilgisi akılda kalıyor; hesabın dayandığı modem gücü varsayımını da aynı cümlede belirtmek gerekir. Kodlama asistanı katkısını kısa, opsiyonel bir satırla ekledim.

## Son gönderi metni

WiFi sinyalinden odada biri olduğunu anlayabilir miyim diye evde denedim. Modemle laptop arasında birkaç saniye durunca grafikte bir düşüş gördüm; hızlı geçişleri ise yakalayamadım.

Laptopun aldığı sinyal gücünü (RSSI) okuyan küçük bir Node.js aracı yazıp canlı grafik çizdim.  
[Aracı bir yapay zekâ kodlama asistanıyla birlikte yazdım.]

Ölçtüğüm −43 dBm, modemin 100 mW güçle yayın yaptığı varsayımıyla, yayılan gücün yaklaşık 2 milyonda biri.

Asıl sürpriz ölçümün yenilenme hızıydı: Windows, bağlı olduğum ağın RSSI değerini her okumada güncellemiyordu. 16 saniye boyunca saniyede 4 kez okudum; değer hiç değişmedi. Ping trafiği de işe yaramadı. WiFi taraması tetikleyince yeni değer geldi, ancak yaklaşık 5 saniyede bir.

Bu kurulumda birkaç saniye duran birinin sinyale etkisini görebildim. Sıradaki denemem, ESP32 ile sinyali CSI üzerinden daha ayrıntılı incelemek.

Hazırladığım interaktif sayfada insan figürünü sürükleyip RSSI’nin nasıl değiştiğini görebilirsiniz: [LINK]

Siz olsanız sonraki denemede neyi ölçerdiniz?

#WiFi #RSSI #ESP32 #IoT