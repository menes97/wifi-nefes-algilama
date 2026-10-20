// Builds map.html (1080x1350): a top-down room plan showing, for each trained
// spot, how often the ESP32 CSI fingerprint picked the right spot.
// Accuracy is recomputed here from esp32-csi/viewer/zones.json:
// first half of each spot's recording trains, second half tests (k-NN, k=7).
// Run: node build-map.js   then screenshot map.html with headless Chrome.

const fs = require("fs");
const path = require("path");

const CELLS = ["Sol arka", "Orta arka", "Sağ arka", "Sol orta", "Orta", "Sağ orta", "Sol ön", "Orta ön", "Sağ ön"];
const samples = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "esp32-csi", "viewer", "zones.json"), "utf8"));

const byLabel = {};
for (const s of samples) (byLabel[s.label] = byLabel[s.label] || []).push(s.f);
const train = [], test = [];
for (const l in byLabel) {
  const a = byLabel[l], h = Math.floor(a.length / 2);
  a.slice(0, h).forEach((f) => train.push({ label: +l, f }));
  a.slice(h).forEach((f) => test.push({ label: +l, f }));
}
const knn = (f, k = 7) => {
  const near = train
    .map((s) => ({ l: s.label, d: s.f.reduce((a, v, i) => a + (v - f[i]) ** 2, 0) }))
    .sort((a, b) => a.d - b.d).slice(0, k);
  const v = {}; near.forEach((x) => (v[x.l] = (v[x.l] || 0) + 1));
  return +Object.keys(v).reduce((a, b) => (v[a] >= v[b] ? a : b));
};
const stats = {};
let ok = 0;
for (const t of test) {
  const p = knn(t.f);
  const s = (stats[t.label] = stats[t.label] || { ok: 0, n: 0, wrong: {} });
  s.n++;
  if (p === t.label) { s.ok++; ok++; } else s.wrong[p] = (s.wrong[p] || 0) + 1;
}
const labels = Object.keys(byLabel).map(Number);
const overall = Math.round((100 * ok) / test.length);
const chance = Math.round(100 / labels.length);

const C = { bg: "#0d1b2a", panel: "#12263a", line: "#22384d", text: "#f2f6fa", muted: "#8aa0b4", wave: "#22d8ec", drop: "#f5a524", good: "#3ecf8e" };
const cellColor = (pct) => (pct >= 90 ? C.good : pct >= 70 ? C.wave : C.drop);

const cells = CELLS.map((name, i) => {
  const s = stats[i];
  if (!s) return `<div class="cell off"><div class="nm">${name}</div><div class="sm">öğretilmedi</div></div>`;
  const pct = Math.round((100 * s.ok) / s.n);
  const worst = Object.entries(s.wrong).sort((a, b) => b[1] - a[1])[0];
  const note = worst ? `çoğu hata: ${CELLS[worst[0]]}` : "hiç karışmadı";
  return `<div class="cell on" style="--c:${cellColor(pct)}">
      <div class="nm">${name}</div>
      <div class="pct">%${pct}</div>
      <div class="sm">${s.ok}/${s.n} doğru · ${note}</div>
    </div>`;
}).join("");

const card = (big, small) => `<div class="card"><div class="big">${big}</div><div class="small">${small}</div></div>`;

const html = `<!doctype html><html lang="tr"><head><meta charset="utf-8"><style>
  * { box-sizing: border-box; margin: 0; }
  body { width: 1080px; height: 1350px; background: ${C.bg}; color: ${C.text}; font-family: "Segoe UI", system-ui, sans-serif; padding: 56px 60px 44px; display: flex; flex-direction: column; gap: 26px; }
  h1 { font-size: 64px; font-weight: 800; letter-spacing: -1px; line-height: 1.05; }
  .sub { font-size: 28px; color: ${C.wave}; margin-top: 10px; }
  .roomwrap { position: relative; padding-top: 44px; }
  .wall { position: absolute; top: 0; left: 0; right: 0; display: flex; align-items: center; gap: 14px; font-size: 22px; color: ${C.muted}; }
  .wall .bar { flex: 1; height: 8px; border-radius: 4px; background: ${C.wave}; }
  .room { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; padding: 14px; border: 3px solid ${C.line}; border-top: 0; border-radius: 0 0 22px 22px; height: 760px; }
  .cell { border-radius: 16px; padding: 18px; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; gap: 6px; }
  .cell.off { background: #0b1622; border: 2px dashed ${C.line}; color: ${C.muted}; }
  .cell.on { background: color-mix(in srgb, var(--c) 16%, ${C.panel}); border: 3px solid var(--c); }
  .nm { font-size: 24px; font-weight: 600; }
  .pct { font-size: 64px; font-weight: 800; color: var(--c); line-height: 1; }
  .sm { font-size: 18px; color: ${C.muted}; line-height: 1.3; }
  .cell.off .sm { font-size: 18px; }
  .cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
  .card { background: ${C.panel}; border-radius: 18px; padding: 16px 18px; }
  .big { font-size: 34px; font-weight: 800; }
  .small { font-size: 19px; color: ${C.muted}; margin-top: 4px; line-height: 1.3; }
  .foot { font-size: 19px; color: ${C.muted}; line-height: 1.4; }
</style></head><body>
  <div>
    <h1>WiFi, odada nerede<br>durduğumu tahmin etti</h1>
    <div class="sub">ESP32 + ev modemi · 52 alt taşıyıcının "parmak izi" · gerçek test</div>
  </div>
  <div class="roomwrap">
    <div class="wall"><span>modemin olduğu duvar</span><span class="bar"></span></div>
    <div class="room">${cells}</div>
  </div>
  <div class="cards">
    ${card(`%${overall}`, `genel doğruluk<br>(${ok}/${test.length} tahmin)`)}
    ${card(`%${chance}`, `rastgele tahmin<br>(${labels.length} seçenek)`)}
    ${card("15 sn", "her nokta için<br>öğrenme süresi")}
  </div>
  <div class="foot">Her noktanın kaydının ilk yarısıyla öğrenildi, ikinci yarısıyla sınandı. Kıpırdamadan durarak ölçüldü; eşyalar yer değiştirirse yeniden öğretmek gerekir.</div>
</body></html>`;

fs.writeFileSync(path.join(__dirname, "map.html"), html);
console.log("map.html yazildi; genel %" + overall, labels.map((l) => `${CELLS[l]} ${stats[l].ok}/${stats[l].n}`).join(", "));
