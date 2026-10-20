// Static server for the sonar page. The microphone needs a secure context,
// and http://localhost counts as one.
// The page posts a stats summary (POST /stat) and an echogram snapshot
// (POST /snapshot) so results can be checked afterwards.
// Run: node server.js   then open http://localhost:8767 in Chrome

const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = 8767;
const MAX_BODY = 5 * 1024 * 1024;
const STATS_FILE = path.join(__dirname, "stats.jsonl");
const SNAP_FILE = path.join(__dirname, "ekogram.png");

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
        appendCapped(STATS_FILE, JSON.stringify(stat) + "\n");
        res.end("ok");
      });
    }
    if (req.method === "POST" && req.url === "/snapshot") {
      return readBody(req, res, (buf) => {
        const png = decodePng(buf.toString());
        if (!png) return bad(res);
        fs.writeFile(SNAP_FILE, png, () => {});
        res.end("ok");
      });
    }
    fs.readFile(path.join(__dirname, "index.html"), (err, data) => {
      res.writeHead(err ? 500 : 200, { "Content-Type": "text/html; charset=utf-8" });
      res.end(err ? "index.html bulunamadi" : data);
    });
  })
  // Only this computer can connect; other devices on the network cannot.
  .listen(PORT, "127.0.0.1", () => console.log(`Ses sonari: http://localhost:${PORT}`));
