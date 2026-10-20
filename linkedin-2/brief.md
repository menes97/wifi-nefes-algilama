# LinkedIn serisi 2. bölüm: WiFi ile nefes ölçümü (ESP32 + CSI)

## 1. bölümde ne paylaşılmıştı
"WiFi sinyalinden odada biri olduğunu anlayabilir miyim?" Laptop RSSI ile denendi. Modemle laptop arasında durunca sinyal −43'ten −50 dBm'e düştü, ama Windows değeri ~5 sn'de bir yenilediği için hızlı geçişler kaçtı. Kapanış: "Sıradaki denemem ESP32 ile CSI."

## 2. bölümde gerçekten yapılanlar (uydurma yok, sadece bunlar)
- Elde zaten olan bir ESP32 geliştirme kartı (ESP32-WROOM-32D) kullanıldı.
- ESP32 modemin 2,4 GHz ağına bağlandı ve modeme saniyede 100 ping attı. Modemin her cevabından CSI (Channel State Information) okundu: her ölçümde 52 alt taşıyıcının genliği ayrı ayrı. Laptop RSSI: 5 sn'de 1 sayı → ESP32 CSI: saniyede 100 ölçüm × 52 değer.
- Tarayıcıda canlı bir "şelale" ısı haritası yapıldı (Web Serial ile doğrudan USB'den okuyor).
- Karşılaşılan sorun: alıcının otomatik kazanç kontrolü (AGC) paketten pakete tüm genliği ölçekliyordu, ekranda yatay titreşim ve sürekli "hareket var" yanlış alarmı oluşuyordu. Çözüm: her paketi kendi ortalamasına bölmek (normalize etmek). Sonrasında hareketsizken hareket skoru ~4–6, hareket edince 12–29.
- Nefes deneyi: hareketsiz oturulurken, son 60 sn'lik veride 0,1–0,7 Hz (dakikada 6–42 nefes) bandında en güçlü periyodik bileşen arandı. Doğrulamak için ekranda rehberli nefes dairesi kullanıldı (belirli tempoda "nefes al / nefes ver").
  - Rehber 10/dk → ölçülen 9,9–11,0 /dk.
  - Rehber 6/dk → ölçülen 6,0–7,1 /dk; ritmin "güven" değeri 1250'ye kadar çıktı. Saf gürültüde bu değer 2–3 civarı.
  - Kişi odadan çıkınca güven değeri ~60 sn içinde gürültü seviyesine (~4) düştü ve ekran nefes hızı göstermeyi bıraktı.
- Sınırlar (dürüstçe söylenmeli):
  - Tahmin 60 sn'lik pencereyle yapıldığı için 30–60 sn gecikmeli.
  - Rehbersiz, doğal nefes daha düzensiz ölçüldü; tutarlı sonuç rehberli, düzenli nefeste alındı.
  - Kişinin hareketsiz olması gerekiyor; tek ESP32, tek anten, aynı oda.
  - Tıbbi bir ölçüm değil.
- Görsel: gerçek ölçüm verisinden çizilmiş bir grafik (6/dk testinde tahmin edilen nefes hızı zaman içinde, güven değeri, "odadan çıktım" anı).

## İstenen
Samimi, meraklı "evde deney yapan maker" sesi. 1. bölüme kısa bir atıf. Abartı ve clickbait yok ("WiFi seni izliyor!" gibi korku dili yok), ama gizlilik boyutuna tek cümleyle değinmek iyi olabilir. Sonraki adım için bir soru ya da merak bırakmalı (ör. oda içinde konum tahmini, rölelerle ışık yakmak).
