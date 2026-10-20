// Bu dosyayı "secrets.h" adıyla kopyala ve kendi bilgilerinle doldur.
// secrets.h .gitignore'da; WiFi şifren ve modeminin MAC adresi GitHub'a gitmez.
// ESP32 yalnızca 2,4 GHz destekler.

#define WIFI_SSID "ag-adin"
#define WIFI_PASS "wifi-sifren"

// Modemin 2,4 GHz yayınının MAC adresi (BSSID) ve kanalı.
// Windows: netsh wlan show networks mode=bssid  ->  "Band: 2.4 GHz" olan BSSID satırı
#define WIFI_BSSID {0x00, 0x11, 0x22, 0x33, 0x44, 0x55}
#define WIFI_CHANNEL 1
