// Builds chart.html (1080x1350) from the real 6/min breathing test log.
// Run: node build-chart.js   then screenshot chart.html with headless Chrome.

const fs = require("fs");
const path = require("path");

const rows = JSON.parse(fs.readFileSync(path.join(__dirname, "olcum-6dk.json"), "utf8"));
const t0 = new Date(rows[0].t).getTime();
const pts = rows
  .filter((r) => r.raw != null)
  .map((r) => ({ s: (new Date(r.t).getTime() - t0) / 1000, raw: r.raw, conf: r.conf, score: r.score }));

const LEFT_S = (new Date("2026-10-19T21:14:21Z").getTime() - t0) / 1000; // motion spike when getting up
const BACK_S = LEFT_S + 60; // user reported 60 s out of the room
const T_MAX = Math.ceil(pts[pts.length - 1].s / 10) * 10;

const W = 960, PADL = 70, PADR = 20;
const x = (s) => PADL + (s / T_MAX) * (W - PADL - PADR);

// Chart 1: estimated breaths per minute
const H1 = 380, T1 = 20, B1 = 40;
const y1 = (v) => T1 + (1 - v / 20) * (H1 - T1 - B1);
// Chart 2: rhythm strength (log scale 1..2000)
const H2 = 340, T2 = 20, B2 = 40;
const y2 = (v) => T2 + (1 - Math.log10(Math.max(1, v)) / Math.log10(2000)) * (H2 - T2 - B2);

const C = { bg: "#0d1b2a", panel: "#12263a", line: "#22384d", text: "#f2f6fa", muted: "#8aa0b4", wave: "#22d8ec", drop: "#f5a524" };

function xAxis(h, b) {
  let s = "";
  for (let t = 0; t <= T_MAX; t += 30) {
    const anchor = t === 0 ? "start" : t + 30 > T_MAX ? "end" : "middle";
    s += `<text x="${x(t)}" y="${h - b + 26}" fill="${C.muted}" font-size="20" text-anchor="${anchor}">${t} sn</text>`;
  }
  return s;
}

function roomBand(h, t, b, labelY) {
  return `<rect x="${x(LEFT_S)}" y="${t}" width="${x(BACK_S) - x(LEFT_S)}" height="${h - t - b}" fill="${C.muted}" opacity="0.12"/>
    <line x1="${x(LEFT_S)}" x2="${x(LEFT_S)}" y1="${t}" y2="${h - b}" stroke="${C.muted}" stroke-width="2" stroke-dasharray="6 6"/>
    ${labelY ? `<text x="${(x(LEFT_S) + x(BACK_S)) / 2}" y="${labelY}" fill="${C.muted}" font-size="22" text-anchor="middle">oda boş</text>` : ""}`;
}

// chart 1
let c1 = "";
for (const v of [0, 5, 10, 15, 20]) {
  c1 += `<line x1="${PADL}" x2="${W - PADR}" y1="${y1(v)}" y2="${y1(v)}" stroke="${C.line}" stroke-width="2"/>
         <text x="${PADL - 12}" y="${y1(v) + 7}" fill="${C.muted}" font-size="20" text-anchor="end">${v}</text>`;
}
c1 += roomBand(H1, T1, B1, T1 + 30);
c1 += `<line x1="${PADL}" x2="${W - PADR}" y1="${y1(6)}" y2="${y1(6)}" stroke="${C.drop}" stroke-width="3" stroke-dasharray="10 8"/>
       <text x="${PADL + 10}" y="${y1(6) + 30}" fill="${C.drop}" font-size="22" font-weight="700">rehber: 6 nefes/dk</text>`;
// Only while seated: after leaving, the 60 s window still holds old breathing data.
const seated = pts.filter((p) => p.s < LEFT_S);
c1 += `<polyline fill="none" stroke="${C.wave}" stroke-width="4" stroke-linejoin="round" points="${seated.map((p) => `${x(p.s).toFixed(1)},${y1(p.raw).toFixed(1)}`).join(" ")}"/>`;
c1 += `<text x="${x(12)}" y="${y1(16) - 14}" fill="${C.muted}" font-size="19" text-anchor="middle">önceki veri</text>`;
c1 += xAxis(H1, B1);

// chart 2
let c2 = "";
for (const v of [1, 10, 100, 1000]) {
  c2 += `<line x1="${PADL}" x2="${W - PADR}" y1="${y2(v)}" y2="${y2(v)}" stroke="${C.line}" stroke-width="2"/>
         <text x="${PADL - 12}" y="${y2(v) + 7}" fill="${C.muted}" font-size="20" text-anchor="end">${v}</text>`;
}
c2 += `<rect x="${PADL}" y="${y2(4)}" width="${W - PADL - PADR}" height="${y2(1) - y2(4)}" fill="${C.muted}" opacity="0.18"/>
       <text x="${W - PADR - 8}" y="${y2(1) - 10}" fill="${C.muted}" font-size="20" text-anchor="end">gürültü seviyesi</text>`;
c2 += roomBand(H2, T2, B2, 0);
c2 += `<polyline fill="none" stroke="${C.wave}" stroke-width="4" stroke-linejoin="round" points="${pts.map((p) => `${x(p.s).toFixed(1)},${y2(p.conf).toFixed(1)}`).join(" ")}"/>`;
// Peak while sitting still; standing up briefly inflates the value, so it is excluded.
const peak = pts.filter((p) => p.s < LEFT_S - 2).reduce((a, p) => (p.conf > a.conf ? p : a));
c2 += `<circle cx="${x(peak.s)}" cy="${y2(peak.conf)}" r="8" fill="${C.drop}"/>
       <text x="${x(peak.s) + 16}" y="${y2(peak.conf) + 8}" fill="${C.drop}" font-size="24" font-weight="700">${Math.round(peak.conf)}</text>`;
const standUp = pts.filter((p) => p.s >= LEFT_S - 2).reduce((a, p) => (p.conf > a.conf ? p : a));
c2 += `<text x="${x(standUp.s) + 14}" y="${y2(standUp.conf) - 4}" fill="${C.muted}" font-size="19">ayağa kalkış</text>`;
c2 += xAxis(H2, B2);

const card = (big, small) => `<div class="card"><div class="big">${big}</div><div class="small">${small}</div></div>`;

const html = `<!doctype html><html lang="tr"><head><meta charset="utf-8"><style>
  * { box-sizing: border-box; margin: 0; }
  body { width: 1080px; height: 1350px; background: ${C.bg}; color: ${C.text}; font-family: "Segoe UI", system-ui, sans-serif; padding: 56px 60px 40px; display: flex; flex-direction: column; gap: 22px; }
  h1 { font-size: 68px; font-weight: 800; letter-spacing: -1px; line-height: 1.05; }
  .sub { font-size: 28px; color: ${C.wave}; margin-top: 8px; }
  .panel { background: ${C.panel}; border-radius: 22px; padding: 18px 20px 6px; }
  .panel h2 { font-size: 24px; font-weight: 600; color: ${C.muted}; margin: 0 0 4px 10px; }
  .cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
  .card { background: ${C.panel}; border-radius: 18px; padding: 16px 18px; }
  .big { font-size: 30px; font-weight: 800; }
  .small { font-size: 19px; color: ${C.muted}; margin-top: 4px; line-height: 1.3; }
  .foot { font-size: 19px; color: ${C.muted}; }
</style></head><body>
  <div>
    <h1>WiFi nefesimi saydı</h1>
    <div class="sub">ESP32 + ev modemi · 52 alt taşıyıcı · saniyede 100 ölçüm · gerçek kayıt</div>
  </div>
  <div class="panel"><h2>Tahmin edilen nefes hızı (nefes/dk)</h2>
    <svg width="${W}" height="${H1}">${c1}</svg></div>
  <div class="panel"><h2>Ritmin gücü (logaritmik ölçek)</h2>
    <svg width="${W}" height="${H2}">${c2}</svg></div>
  <div class="cards">
    ${card("6 → 6,0–7,1", "rehber 6 nefes/dk<br>ölçülen")}
    ${card("10 → 9,9–11,0", "rehber 10 nefes/dk<br>ölçülen")}
    ${card("~4", "odadan çıkınca ritim gücü<br>gürültü seviyesine indi")}
  </div>
  <div class="foot">Son 60 sn'lik veriyle hesaplanır, bu yüzden 30–60 sn gecikmeli. Düzenli, rehberli nefeste ölçüldü. Tıbbi ölçüm değildir.</div>
</body></html>`;

fs.writeFileSync(path.join(__dirname, "chart.html"), html);
console.log("chart.html yazildi; nokta:", pts.length, "T_MAX:", T_MAX, "cikis sn:", LEFT_S, "tepe:", Math.round(peak.conf), "@", peak.s, "sn");
