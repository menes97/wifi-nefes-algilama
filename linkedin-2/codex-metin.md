## Önerilen gönderi metni

Evdeki ESP32 ile WiFi sinyalinden nefes ritmimi okumayı denedim.  
Düzenli nefes aldığımda, ekrandaki tahmin rehberin temposunu takip etti.

İlk bölümde laptopla odadaki hareketi anlamaya çalışmış, sonraki deneme için ESP32’ye geçeceğimi söylemiştim.

Bu kez ESP32’yi modemin 2,4 GHz ağına bağladım. Modeme saniyede 100 ping gönderip her cevaptan 52 ayrı sinyal değeri okudum; tarayıcıda da bunları canlı bir ısı haritasına döktüm.

İlk başta ekran sürekli “hareket var” diyordu. Alıcının otomatik kazanç ayarı (AGC), her gelen pakette bütün değerleri birlikte büyütüp küçültüyordu; her paketi kendi ortalamasına bölünce bu yalancı titreşim azaldı.

Sonra hareketsiz oturup ekrandaki daireye uyarak düzenli nefes aldım. Rehber dakikada 10 nefesi gösterirken tahmin 9,9–11,0; dakikada 6 nefesi gösterirken 6,0–7,1 aralığındaydı. Grafikte ikinci denemenin tahminini, ritmin güven değerini ve odadan çıktığım anı görebilirsiniz. Ben çıktıktan yaklaşık 60 saniye sonra ekran nefes hızı göstermeyi bıraktı.

Tahmin 30–60 saniye gecikiyor; tutarlı sonucu hareketsizken, rehberli ve düzenli nefeste aldım. Bu tıbbi bir ölçüm değil. WiFi sinyalinden böyle bir çıkarım yapılabilmesi, gizlilik üzerine de düşünmeye değer.

Sizce sonraki ev deneyi oda içinde konum tahmini mi olsun, hareketle ışık yakmak mı?

#ESP32 #WiFi #Maker #Elektronik #EvdeDeney

## Alternatif ilk 2 satır

1. WiFi sinyalindeki küçük değişimlerden nefes ritmimi aradım.  
   Rehberli nefeste ekrandaki tahmin tempoya yaklaştı.

2. ESP32 ile odadaki hareketten sonra nefesi denedim.  
   Düzenli nefes aldığımda sinyalde ritmik bir iz gördüm.

3. Modeme gönderdiğim pinglerin cevaplarında nefes ritmi var mı?  
   Evdeki denemede, rehberli nefeste bunu ölçebildim.

## Grafik için öneri

- **Tahmin edilen nefes hızı (nefes/dk)**
- **Ritmin güven değeri · Odadan çıktığım an**