import {
  AbsoluteFill,
  Easing,
  interpolate,
  random,
  useCurrentFrame,
} from "remotion";
import { loadFont as loadArchivo } from "@remotion/google-fonts/Archivo";
import { loadFont as loadMono } from "@remotion/google-fonts/JetBrainsMono";

const { fontFamily: display } = loadArchivo("normal", {
  weights: ["500", "700", "800"],
  subsets: ["latin", "latin-ext"],
});
const { fontFamily: mono } = loadMono("normal", {
  weights: ["500", "700"],
  subsets: ["latin", "latin-ext"],
});

// Same palette as the LinkedIn still image.
const C = {
  bg: "#0d1b2a",
  panel: "#12263a",
  line: "#22384d",
  wave: "#22d8ec",
  drop: "#f5a524",
  text: "#f2f6fa",
  muted: "#8aa0b4",
  person: "#5f7fa3",
  desk: "#7a5a46",
  device: "#e8edf2",
};

const BASE = -43; // dBm measured at home
const BODY_DB = 6; // illustrative body attenuation at 5 GHz
const SAMPLE_EVERY = 15; // frames between RSSI updates (2 per second)

// Scene geometry (inside the 1080x560 scene SVG)
const MODEM_X = 170;
const LAPTOP_X = 900;
const FLOOR_Y = 540;
const DESK_Y = 400;
const EYE_Y = DESK_Y - 30; // height of the radio path

const ease = Easing.inOut(Easing.cubic);
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

const personX = (f: number) =>
  interpolate(f, [60, 120, 300, 360], [1200, 540, 540, 1200], { ...clamp, easing: ease });

const isWalking = (f: number) => (f > 60 && f < 120) || (f > 300 && f < 360);

// 0 = nobody on the path, 1 = fully blocking the modem-laptop line
const blockage = (x: number) =>
  interpolate(x, [MODEM_X + 60, MODEM_X + 160, LAPTOP_X - 160, LAPTOP_X - 60], [0, 1, 1, 0], clamp);

const rssiAt = (f: number) => {
  const s = Math.floor(f / SAMPLE_EVERY);
  const noise = (random(`n${s}`) - 0.5) * 1.6;
  return Math.round(BASE - BODY_DB * blockage(personX(s * SAMPLE_EVERY)) + noise);
};

const fmt = (v: number) => (v < 0 ? "−" : "") + Math.abs(v);

export const RssiVideo = () => {
  const f = useCurrentFrame();
  const px = personX(f);
  const value = rssiAt(f);
  const dropped = value <= BASE - 3;

  const intro = interpolate(f, [0, 20], [0, 1], { ...clamp, easing: ease });
  const outro = interpolate(f, [372, 396], [0, 1], { ...clamp, easing: ease });

  return (
    <AbsoluteFill style={{ backgroundColor: C.bg, fontFamily: display, color: C.text }}>
      {/* Title */}
      <div
        style={{
          position: "absolute",
          top: 96,
          left: 72,
          right: 72,
          opacity: intro,
          translate: `0px ${interpolate(f, [0, 20], [24, 0], { ...clamp, easing: ease })}px`,
        }}
      >
        <div style={{ fontSize: 76, fontWeight: 800, lineHeight: 1.05, letterSpacing: -1 }}>
          WiFi ile odada biri var mı?
        </div>
        <div style={{ fontSize: 44, fontWeight: 500, color: C.wave, marginTop: 14 }}>
          Evde bir RSSI denemesi
        </div>
      </div>

      {/* Scene */}
      <svg
        width={1080}
        height={560}
        viewBox="0 0 1080 560"
        style={{ position: "absolute", top: 300, left: 0, opacity: intro }}
      >
        <defs>
          <clipPath id="sceneClip">
            <rect x={0} y={0} width={1080} height={FLOOR_Y} />
          </clipPath>
        </defs>

        <g clipPath="url(#sceneClip)">
          <Waves f={f} />
          <Shadow px={px} />
        </g>

        {/* line of sight */}
        <line
          x1={MODEM_X + 60}
          y1={EYE_Y}
          x2={LAPTOP_X - 90}
          y2={EYE_Y}
          stroke={dropped ? C.drop : C.wave}
          strokeWidth={4}
          strokeDasharray="10 12"
          opacity={0.35 + 0.4 * (1 - blockage(px))}
        />

        <Desk x={MODEM_X} width={260} />
        <Desk x={LAPTOP_X} width={320} />
        <Modem />
        <Laptop f={f} />
        <Person x={px} f={f} />
      </svg>

      {/* Readout panel */}
      <div
        style={{
          position: "absolute",
          left: 56,
          right: 56,
          top: 900,
          height: 330,
          background: C.panel,
          borderRadius: 28,
          padding: "30px 40px",
          opacity: intro,
          display: "flex",
          flexDirection: "column",
          gap: 18,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div>
            <div style={{ fontSize: 26, color: C.muted, fontWeight: 500 }}>Laptopun ölçtüğü sinyal</div>
            <div
              style={{
                fontFamily: mono,
                fontSize: 104,
                fontWeight: 700,
                lineHeight: 1,
                marginTop: 8,
                color: dropped ? C.drop : C.text,
                fontVariantNumeric: "tabular-nums",
              }}
            >
              <span style={{ marginRight: "-0.1em" }}>−</span>
              {Math.abs(value)}
              <span style={{ fontSize: 40, fontWeight: 500, color: C.muted, marginLeft: 14 }}>dBm</span>
            </div>
          </div>
          <div
            style={{
              fontSize: 32,
              fontWeight: 700,
              padding: "14px 26px",
              borderRadius: 999,
              border: `3px solid ${dropped ? C.drop : C.wave}`,
              color: dropped ? C.drop : C.wave,
              marginBottom: 10,
            }}
          >
            {dropped ? "Sinyal düştü" : "Sakin"}
          </div>
        </div>
        <Chart f={f} width={888} height={120} />
      </div>

      <div
        style={{
          position: "absolute",
          left: 72,
          bottom: 52,
          fontSize: 24,
          color: C.muted,
          opacity: intro * (1 - outro),
        }}
      >
        Canlandırma · evdeki ölçüm: −43 dBm, 5 GHz
      </div>

      {/* End card */}
      <AbsoluteFill
        style={{
          backgroundColor: `rgba(13, 27, 42, ${0.9 * outro})`,
          justifyContent: "center",
          alignItems: "center",
          padding: 80,
          textAlign: "center",
        }}
      >
        <div
          style={{
            opacity: outro,
            translate: `0px ${interpolate(f, [372, 396], [30, 0], { ...clamp, easing: ease })}px`,
            display: "flex",
            flexDirection: "column",
            gap: 26,
          }}
        >
          <div style={{ fontSize: 64, fontWeight: 800, lineHeight: 1.12 }}>
            Birkaç saniye duranı görüyor,
            <br />
            hızlı geçişi kaçırıyor.
          </div>
          <div
            style={{
              fontSize: 44,
              fontWeight: 600,
              color: C.wave,
              opacity: interpolate(f, [396, 414], [0, 1], clamp),
            }}
          >
            Sonraki adım: ESP32 ile CSI
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const Waves = ({ f }: { f: number }) => {
  const spacing = 70;
  const maxR = 900;
  const rings = [];
  for (let k = 0; k < Math.ceil(maxR / spacing); k++) {
    const r = (f * 3 + k * spacing) % maxR;
    if (r < 40) continue;
    const a = Math.max(0, 1 - r / (maxR * 0.9));
    rings.push(
      <circle
        key={k}
        cx={MODEM_X}
        cy={EYE_Y}
        r={r}
        fill="none"
        stroke={C.wave}
        strokeWidth={5}
        opacity={a * 0.75}
      />,
    );
  }
  return <g>{rings}</g>;
};

// Darker wedge behind the person, as seen from the modem.
const Shadow = ({ px }: { px: number }) => {
  if (px < MODEM_X + 80 || px > 1150) return null;
  // Spread grows with distance from the person, like a shadow cast by the modem.
  const spread = (1100 - px) * 0.18;
  const pts = [
    [px - 30, 112],
    [1120, 112 - spread],
    [1120, FLOOR_Y + spread],
    [px - 30, FLOOR_Y],
  ];
  return <polygon points={pts.map((p) => p.join(",")).join(" ")} fill={C.bg} opacity={0.72} />;
};

const Desk = ({ x, width }: { x: number; width: number }) => (
  <g>
    <rect x={x - width / 2} y={DESK_Y} width={width} height={16} rx={3} fill={C.desk} />
    <rect x={x - width / 2 + 34} y={DESK_Y + 16} width={14} height={FLOOR_Y - DESK_Y - 16} fill={C.desk} />
    <rect x={x + width / 2 - 48} y={DESK_Y + 16} width={14} height={FLOOR_Y - DESK_Y - 16} fill={C.desk} />
  </g>
);

const Modem = () => (
  <g>
    <rect x={MODEM_X - 22} y={DESK_Y - 150} width={9} height={110} rx={4} fill={C.device} />
    <rect x={MODEM_X + 14} y={DESK_Y - 150} width={9} height={110} rx={4} fill={C.device} />
    <rect x={MODEM_X - 75} y={DESK_Y - 52} width={150} height={52} rx={10} fill={C.device} />
    {[0, 1, 2, 3, 4].map((i) => (
      <circle key={i} cx={MODEM_X - 20 + i * 14} cy={DESK_Y - 26} r={3.5} fill={C.wave} />
    ))}
  </g>
);

const Laptop = ({ f }: { f: number }) => {
  const w = 250;
  const h = 160;
  const x0 = LAPTOP_X - w / 2;
  const y0 = DESK_Y - h - 12;
  return (
    <g>
      <rect x={x0} y={y0} width={w} height={h} rx={10} fill="#c5ced8" />
      <rect x={x0 + 9} y={y0 + 9} width={w - 18} height={h - 18} rx={5} fill={C.bg} />
      <g transform={`translate(${x0 + 22}, ${y0 + 30})`}>
        <ChartPath f={f} width={w - 44} height={h - 60} strokeWidth={4} window={150} />
      </g>
      <rect x={x0 - 20} y={DESK_Y - 12} width={w + 40} height={12} rx={4} fill="#c5ced8" />
    </g>
  );
};

const Person = ({ x, f }: { x: number; f: number }) => {
  const walking = isWalking(f);
  const swing = walking ? Math.sin(f * 0.45) * 20 : 0;
  const bob = walking ? Math.abs(Math.sin(f * 0.45)) * -6 : 0;
  const hipY = 360 + bob;
  return (
    <g fill={C.person}>
      {/* legs */}
      <rect x={x - 26} y={hipY - 10} width={30} height={180} rx={14} transform={`rotate(${swing} ${x - 11} ${hipY})`} />
      <rect x={x - 4} y={hipY - 10} width={30} height={180} rx={14} transform={`rotate(${-swing} ${x + 11} ${hipY})`} />
      {/* torso */}
      <rect x={x - 44} y={190 + bob} width={88} height={180} rx={36} />
      {/* arms */}
      <rect x={x - 58} y={200 + bob} width={24} height={150} rx={12} transform={`rotate(${-swing * 0.6} ${x - 46} ${210 + bob})`} />
      <rect x={x + 34} y={200 + bob} width={24} height={150} rx={12} transform={`rotate(${swing * 0.6} ${x + 46} ${210 + bob})`} />
      {/* head */}
      <circle cx={x} cy={148 + bob} r={36} />
    </g>
  );
};

// Step line of RSSI samples; drops are drawn in orange.
const ChartPath = ({
  f,
  width,
  height,
  strokeWidth,
  window,
}: {
  f: number;
  width: number;
  height: number;
  strokeWidth: number;
  window: number; // frames visible on the x axis
}) => {
  const lo = BASE - 10;
  const hi = BASE + 4;
  const y = (v: number) => height - ((v - lo) / (hi - lo)) * height;
  const start = Math.max(0, f - window);
  const x = (fr: number) => ((fr - start) / window) * width;
  const segs = [];
  const firstSample = Math.floor(start / SAMPLE_EVERY) * SAMPLE_EVERY;
  for (let s = firstSample; s <= f; s += SAMPLE_EVERY) {
    const v = rssiAt(s);
    const x1 = x(Math.max(s, start));
    const x2 = x(Math.min(s + SAMPLE_EVERY, f));
    if (x2 <= x1) continue;
    const next = s + SAMPLE_EVERY <= f ? rssiAt(s + SAMPLE_EVERY) : v;
    const col = v <= BASE - 3 ? C.drop : C.wave;
    segs.push(
      <path
        key={s}
        d={`M${x1},${y(v)} L${x2},${y(v)}${next !== v && s + SAMPLE_EVERY <= f ? ` L${x2},${y(next)}` : ""}`}
        stroke={col}
        strokeWidth={strokeWidth}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />,
    );
  }
  return <g>{segs}</g>;
};

const Chart = ({ f, width, height }: { f: number; width: number; height: number }) => {
  const lo = BASE - 10;
  const hi = BASE + 4;
  const y = (v: number) => height - ((v - lo) / (hi - lo)) * height;
  return (
    <svg width={width} height={height + 4} style={{ overflow: "visible" }}>
      {[BASE, BASE - 6].map((v) => (
        <g key={v}>
          <line x1={64} x2={width} y1={y(v)} y2={y(v)} stroke={C.line} strokeWidth={2} strokeDasharray="6 8" />
          <text x={0} y={y(v) + 8} fill={C.muted} fontSize={22} fontFamily={mono}>
            {fmt(v)}
          </text>
        </g>
      ))}
      <g transform="translate(70, 0)">
        <ChartPath f={f} width={width - 70} height={height} strokeWidth={6} window={240} />
      </g>
    </svg>
  );
};
