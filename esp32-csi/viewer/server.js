// Static server for the CSI viewer. Web Serial needs a secure context,
// and http://localhost counts as one.
// The page also posts a stats summary (POST /stat) and a waterfall snapshot
// (POST /snapshot) so the latest state can be checked from the command line:
//   curl http://localhost:8766/latest      -> last stats JSON
//   snapshots/latest.png                   -> last waterfall image
// Run: node server.js   then open http://localhost:8766 in Chrome

const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = 8766;
const MAX_BODY = 5 * 1024 * 1024;
const SNAP_DIR = path.join(__dirname, "snapshots");
const STATS_FILE = path.join(__dirname, "stats.jsonl");
fs.mkdirSync(SNAP_DIR, { recursive: true });

let latest = null;

// Reads a request body up to MAX_BODY bytes; larger requests are rejected.
function readBody(req, res, cb) {
  const chunks = [];
  let size = 0;
  req.on("data", (c) => {
    size += c.length;
    if (size > MAX_BODY) { res.writeHead(413); res.end(); req.destroy(); return; }
    chunks.push(c);
  });
  req.on("end", () => { if (size <= MAX_BODY) cb(Buffer.concat(chunks)); });
}

// Writes are accepted only from this page itself, not from other websites
// open in the same browser.
function sameOrigin(req) {
  const o = req.headers.origin;
  return !o || o === `http://localhost:${PORT}` || o === `http://127.0.0.1:${PORT}`;
}

function bad(res) { res.writeHead(400); res.end(); }

const MAX_LOG = 200 * 1024 * 1024; // stop appending to a log file past 200 MB
function appendCapped(file, line) {
  fs.stat(file, (err, st) => { if (err || st.size < MAX_LOG) fs.appendFile(file, line, () => {}); });
}

const PNG_SIG = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
// Returns the decoded image only if it really is a PNG.
function decodePng(dataUrl) {
  if (!dataUrl.startsWith("data:image/png;base64,")) return null;
  const buf = Buffer.from(dataUrl.slice(22), "base64");
  return buf.length > 8 && buf.subarray(0, 8).equals(PNG_SIG) ? buf : null;
}

const isObject = (v) => v !== null && typeof v === "object" && !Array.isArray(v);

http
  .createServer((req, res) => {
    if (req.method === "POST" && !sameOrigin(req)) { res.writeHead(403); return res.end(); }
    if (req.method === "POST" && req.url === "/stat") {
      return readBody(req, res, (buf) => {
        let stat;
        try { stat = JSON.parse(buf.toString()); } catch { return bad(res); }
        if (!isObject(stat)) return bad(res);
        latest = stat;
        appendCapped(STATS_FILE, JSON.stringify(stat) + "\n");
        res.end("ok");
      });
    }
    if (req.method === "POST" && req.url === "/zones") {
      return readBody(req, res, (buf) => {
        let zones;
        try { zones = JSON.parse(buf.toString()); } catch { return bad(res); }
        const valid = Array.isArray(zones) && zones.every((z) =>
          isObject(z) && Number.isInteger(z.label) && Array.isArray(z.f) && z.f.every((v) => typeof v === "number"));
        if (!valid) return bad(res);
        fs.writeFile(path.join(__dirname, "zones.json"), JSON.stringify(zones), () => {});
        res.end("ok");
      });
    }
    if (req.method === "POST" && req.url === "/snapshot") {
      return readBody(req, res, (buf) => {
        const png = decodePng(buf.toString());
        if (!png) return bad(res);
        fs.writeFile(path.join(SNAP_DIR, "latest.png"), png, () => {});
        res.end("ok");
      });
    }
    if (req.url === "/latest") {
      res.writeHead(200, { "Content-Type": "application/json" });
      return res.end(JSON.stringify(latest));
    }
    fs.readFile(path.join(__dirname, "index.html"), (err, data) => {
      res.writeHead(err ? 500 : 200, { "Content-Type": "text/html; charset=utf-8" });
      res.end(err ? "index.html bulunamadi" : data);
    });
  })
  // Only this computer can connect; other devices on the network cannot.
  .listen(PORT, "127.0.0.1", () => console.log(`CSI viewer: http://localhost:${PORT}`));
