// ESP32 WiFi CSI receiver.
// Joins the home WiFi on 2.4 GHz, pings the modem ~100 times a second and
// prints the CSI of every reply from the modem over USB serial:
//   CSI,<millis>,<rssi>,<amp0>,...,<amp63>
// Lines starting with '#' are status messages.

#include <WiFi.h>
#include "esp_wifi.h"
#include "ping/ping_sock.h"
#include "lwip/ip_addr.h"
#include "secrets.h"  // copy secrets.example.h to secrets.h and fill it in

// Modem's 2.4 GHz radio, from secrets.h (a MAC address can reveal a home's location)
static const uint8_t AP_BSSID[6] = WIFI_BSSID;
static const int AP_CHANNEL = WIFI_CHANNEL;
static const int PING_HZ = 100;
static const int SUBCARRIERS = 64;  // L-LTF

struct CsiPacket {
  uint32_t ms;
  int8_t rssi;
  int8_t buf[SUBCARRIERS * 2];
};

static QueueHandle_t csiQueue;
static volatile uint32_t dropped = 0;

static void onCsi(void *ctx, wifi_csi_info_t *info) {
  if (!info || !info->buf || info->len < SUBCARRIERS * 2) return;
  if (memcmp(info->mac, AP_BSSID, 6) != 0) return;
  CsiPacket p;
  p.ms = millis();
  p.rssi = info->rx_ctrl.rssi;
  memcpy(p.buf, info->buf, SUBCARRIERS * 2);
  if (xQueueSend(csiQueue, &p, 0) != pdTRUE) dropped++;
}

static void enableCsi() {
  wifi_csi_config_t cfg = {};
  cfg.lltf_en = true;
  cfg.htltf_en = false;
  cfg.stbc_htltf2_en = false;
  cfg.ltf_merge_en = false;
  cfg.channel_filter_en = false;
  cfg.manu_scale = false;
  cfg.shift = 0;
  ESP_ERROR_CHECK(esp_wifi_set_csi_config(&cfg));
  ESP_ERROR_CHECK(esp_wifi_set_csi_rx_cb(onCsi, nullptr));
  ESP_ERROR_CHECK(esp_wifi_set_csi(true));
}

static void startPing() {
  esp_ping_config_t pc = ESP_PING_DEFAULT_CONFIG();
  ipaddr_aton(WiFi.gatewayIP().toString().c_str(), &pc.target_addr);
  pc.count = ESP_PING_COUNT_INFINITE;
  pc.interval_ms = 1000 / PING_HZ;
  pc.timeout_ms = 1000;
  pc.data_size = 1;
  pc.task_stack_size = 4096;
  esp_ping_callbacks_t cbs = {};
  esp_ping_handle_t ping;
  esp_ping_new_session(&pc, &cbs, &ping);
  esp_ping_start(ping);
  Serial.printf("# ping %s @ %d Hz\n", WiFi.gatewayIP().toString().c_str(), PING_HZ);
}

static void startPassive() {
  // Fallback without a password: listen on the modem's channel.
  // This modem sends few OFDM frames on 2.4 GHz, so expect little data.
  esp_wifi_set_promiscuous(true);
  esp_wifi_set_channel(AP_CHANNEL, WIFI_SECOND_CHAN_NONE);
  Serial.println("# passive mode (no password set)");
}

void setup() {
  Serial.begin(921600);
  delay(300);
  Serial.println("# esp32 csi receiver");
  csiQueue = xQueueCreate(64, sizeof(CsiPacket));

  WiFi.mode(WIFI_STA);
  WiFi.setSleep(false);

  if (strlen(WIFI_PASS) == 0) {
    startPassive();
    enableCsi();
    return;
  }

  WiFi.begin(WIFI_SSID, WIFI_PASS, AP_CHANNEL, AP_BSSID);
  Serial.print("# connecting");
  uint32_t t0 = millis();
  while (WiFi.status() != WL_CONNECTED && millis() - t0 < 20000) {
    delay(250);
    Serial.print(".");
  }
  Serial.println();
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("# ERROR: could not connect, check secrets.h");
    startPassive();
    enableCsi();
    return;
  }
  Serial.printf("# connected, ip %s, rssi %d\n", WiFi.localIP().toString().c_str(), WiFi.RSSI());
  enableCsi();
  startPing();
}

void loop() {
  static char line[SUBCARRIERS * 4 + 32];
  static uint32_t lastStat = 0, count = 0;
  CsiPacket p;
  while (xQueueReceive(csiQueue, &p, pdMS_TO_TICKS(20)) == pdTRUE) {
    int n = snprintf(line, sizeof(line), "CSI,%lu,%d", (unsigned long)p.ms, p.rssi);
    for (int i = 0; i < SUBCARRIERS; i++) {
      int im = p.buf[2 * i], re = p.buf[2 * i + 1];
      n += snprintf(line + n, sizeof(line) - n, ",%d", (int)lroundf(sqrtf(im * im + re * re)));
    }
    line[n++] = '\n';
    Serial.write((const uint8_t *)line, n);
    count++;
  }
  if (millis() - lastStat > 5000) {
    Serial.printf("# rate %.1f pkt/s, dropped %lu\n", count * 1000.0f / (millis() - lastStat), (unsigned long)dropped);
    lastStat = millis();
    count = 0;
  }
}
