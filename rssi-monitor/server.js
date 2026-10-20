// Laptop WiFi RSSI monitor: polls `netsh wlan show interfaces` and streams
// readings to index.html over Server-Sent Events.
// Run: node server.js   then open http://localhost:8765

const http = require("http");
const fs = require("fs");
const path = require("path");
const { execFile } = require("child_process");

const PORT = 8765;
const POLL_MS = 250;
// Windows only refreshes the connected AP's RSSI after a WiFi scan, and it
// throttles scans (~1 real update every few seconds). Nudge a scan regularly.
const SCAN_MS = 2000;

const LOG_FILE = path.join(__dirname, "rssi-log.csv");
if (!fs.existsSync(LOG_FILE)) fs.writeFileSync(LOG_FILE, "time,rssi_dbm,signal_pct\n");

const clients = new Set();
let last = null;

function parse(out) {
  const get = (re) => {
    const m = out.match(re);
    return m ? m[1].trim() : null;
  };
  const signal = get(/^\s*(?:Signal|Sinyal)\s*:\s*(\d+)\s*%/im);
  const rssi = get(/^\s*Rssi\s*:\s*(-?\d+)/im);
  return {
    t: Date.now(),
    // The network name (SSID) and the modem's MAC address (BSSID) are
    // deliberately not read or sent: a BSSID can be looked up in public WiFi
    // location databases, and neither is needed to plot signal strength.
    channel: get(/^\s*(?:Channel|Kanal)\s*:\s*(\d+)/im),
    band: get(/^\s*(?:Band|Bant)\s*:\s*(.+)$/im),
    signal: signal === null ? null : Number(signal),
    rssi: rssi === null ? null : Number(rssi),
    error: null,
  };
}

function poll() {
  execFile("netsh", ["wlan", "show", "interfaces"], { windowsHide: true }, (err, stdout) => {
    let reading;
    if (/location permission|konum/i.test(stdout || "")) {
      reading = { t: Date.now(), error: "location" };
    } else if (err && !stdout) {
      reading = { t: Date.now(), error: String(err.message || err) };
    } else {
      reading = parse(stdout);
      if (reading.signal === null && reading.rssi === null) {
        reading.error = "disconnected";
      }
    }
    last = reading;
    if (!reading.error) {
      fs.appendFile(LOG_FILE, `${new Date(reading.t).toISOString()},${reading.rssi ?? ""},${reading.signal ?? ""}\n`, () => {});
    }
    const msg = `data: ${JSON.stringify(reading)}\n\n`;
    for (const res of clients) res.write(msg);
    setTimeout(poll, POLL_MS);
  });
}

// Only triggers a WiFi scan so Windows refreshes the RSSI value; the command's
// output (which lists nearby networks) is discarded unread.
function scan() {
  execFile("netsh", ["wlan", "show", "networks", "mode=bssid"], { windowsHide: true }, () => {
    setTimeout(scan, SCAN_MS);
  });
}

http
  .createServer((req, res) => {
    if (req.url === "/events") {
      res.writeHead(200, {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      });
      if (last) res.write(`data: ${JSON.stringify(last)}\n\n`);
      clients.add(res);
      req.on("close", () => clients.delete(res));
      return;
    }
    fs.readFile(path.join(__dirname, "index.html"), (err, data) => {
      res.writeHead(err ? 500 : 200, { "Content-Type": "text/html; charset=utf-8" });
      res.end(err ? "index.html bulunamadi" : data);
    });
  })
  // Only this computer can connect; other devices on the network cannot.
  .listen(PORT, "127.0.0.1", () => {
    console.log(`RSSI monitor: http://localhost:${PORT}`);
    poll();
    scan();
  });
