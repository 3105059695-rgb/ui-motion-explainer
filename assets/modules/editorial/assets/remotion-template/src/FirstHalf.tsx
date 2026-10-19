import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";

// All scene time is an absolute, deterministic value supplied by the root.
const C = {
  paper: "#fafaf7",
  ink: "#1e1b18",
  orange: "#b65c3e",
  red: "#c93643",
  gold: "#c9a263",
  gray: "#e4ddd5",
  muted: "#817c74",
};
const sans = '"Noto Sans SC", sans-serif';
const serif = '"Noto Serif SC", serif';
const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const ease = (x: number) => 1 - Math.pow(1 - clamp(x), 3);
const fade = (d: number, delay = 0, duration = 0.26) =>
  ease((d - delay) / duration);
const enter = (d: number, delay = 0) => {
  const x = Math.max(0, d - delay);
  return x === 0 ? 0 : 1 - Math.exp(-10 * x) * Math.cos(10 * x);
};
const mix = (a: number, b: number, p: number) => a + (b - a) * p;
const seeded = (n: number) => {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

const Definitions: React.FC = () => (
  <defs>
    <radialGradient id="fh-paper">
      <stop stopColor="#fffffc" />
      <stop offset="1" stopColor="#f8f8f5" />
    </radialGradient>
    <radialGradient id="fh-idea">
      <stop stopColor="#fffdee" />
      <stop offset="1" stopColor="#dddeda" />
    </radialGradient>
    <linearGradient id="fh-tile" x2="0" y2="1">
      <stop stopColor="#f8f0f6" />
      <stop offset="1" stopColor="#ded9e1" />
    </linearGradient>
    <linearGradient id="fh-wallet" x1="0" y1="0" x2="0" y2="1">
      <stop stopColor="#d6b881" />
      <stop offset="1" stopColor="#c8a46c" />
    </linearGradient>
    <linearGradient id="fh-board">
      <stop stopColor="#bd7654" />
      <stop offset="1" stopColor="#a4593e" />
    </linearGradient>
    <linearGradient id="fh-leather" x1="0" y1="0" x2="1" y2="1">
      <stop stopColor="#cda578" />
      <stop offset="1" stopColor="#b9845b" />
    </linearGradient>
    <linearGradient id="fh-gold">
      <stop stopColor="#ead393" />
      <stop offset=".45" stopColor="#bb8f48" />
      <stop offset="1" stopColor="#dec28c" />
    </linearGradient>
    <filter id="fh-shadow" x="-40%" y="-40%" width="180%" height="210%">
      <feDropShadow
        dx="0"
        dy="11"
        stdDeviation="10"
        floodColor="#453a2b"
        floodOpacity=".16"
      />
    </filter>
    <filter id="fh-small-shadow" x="-40%" y="-40%" width="180%" height="220%">
      <feDropShadow
        dx="0"
        dy="5"
        stdDeviation="4"
        floodColor="#493d30"
        floodOpacity=".15"
      />
    </filter>
    <filter id="fh-blur">
      <feGaussianBlur stdDeviation="4" />
    </filter>
    <pattern id="fh-grain" width="2" height="2" patternUnits="userSpaceOnUse">
      <circle cx="0.6" cy="0.6" r=".32" fill="#85857e" opacity=".25" />
    </pattern>
    <clipPath id="fh-premium-clip">
      <rect x="108" y="247" width="330" height="300" rx="24" />
    </clipPath>
  </defs>
);

type Bit = string | { text: string; color: string };
const Headline: React.FC<{
  bits: Bit[];
  d: number;
  y?: number;
  size?: number;
}> = ({ bits, d, y = 107, size = 35 }) => (
  <text
    x="272"
    y={y}
    textAnchor="middle"
    fill={C.ink}
    fontFamily={sans}
    fontSize={size}
    fontWeight="700"
    letterSpacing="-.8"
  >
    {bits.map((bit, i) => (
      <tspan
        key={i}
        fill={typeof bit === "string" ? C.ink : bit.color}
        opacity={fade(d, i * 0.075, 0.28)}
      >
        {typeof bit === "string" ? bit : bit.text}
      </tspan>
    ))}
  </text>
);
const Label: React.FC<{
  x: number;
  y: number;
  text: string;
  fill?: string;
  width?: number;
  size?: number;
}> = ({ x, y, text, fill = C.orange, width = 73, size = 16 }) => (
  <g filter="url(#fh-small-shadow)">
    <rect
      x={x - width / 2}
      y={y - 19}
      width={width}
      height="29"
      rx="14.5"
      fill={fill}
    />
    <text
      x={x}
      y={y + 1}
      textAnchor="middle"
      fill="white"
      fontFamily={sans}
      fontWeight="650"
      fontSize={size}
    >
      {text}
    </text>
  </g>
);
const Star: React.FC<{ x: number; y: number; r?: number; color?: string }> = ({
  x,
  y,
  r = 19,
  color = C.gold,
}) => (
  <polygon
    fill={color}
    points={Array.from({ length: 10 }, (_, i) => {
      const a = -Math.PI / 2 + (i * Math.PI) / 5;
      const rr = i % 2 ? r * 0.43 : r;
      return `${x + Math.cos(a) * rr},${y + Math.sin(a) * rr}`;
    }).join(" ")}
  />
);
const Magnifier: React.FC<{ x: number; y: number; scale?: number }> = ({
  x,
  y,
  scale = 1,
}) => (
  <g
    transform={`translate(${x} ${y}) scale(${scale})`}
    filter="url(#fh-small-shadow)"
  >
    <circle
      r="33"
      fill="#fff"
      fillOpacity=".28"
      stroke={C.ink}
      strokeWidth="8"
    />
    <path
      d="M24 24 L54 56"
      stroke={C.ink}
      strokeWidth="12"
      strokeLinecap="round"
    />
  </g>
);
const Thumb: React.FC<{
  x: number;
  y: number;
  w: number;
  kind?: number;
  selected?: boolean;
  opacity?: number;
  rotation?: number;
}> = ({ x, y, w, kind = 0, selected = false, opacity = 1, rotation = 0 }) => (
  <g
    opacity={opacity}
    transform={`translate(${x + w / 2} ${y + w / 2}) rotate(${rotation}) translate(${-w / 2} ${-w / 2})`}
    filter="url(#fh-small-shadow)"
  >
    <rect
      width={w}
      height={w}
      rx={w * 0.075}
      fill="#fffdfa"
      stroke={selected ? C.orange : "white"}
      strokeWidth={selected ? 3 : 2}
    />
    <rect
      x={w * 0.06}
      y={w * 0.06}
      width={w * 0.88}
      height={w * 0.88}
      rx={w * 0.045}
      fill={selected ? "#fcfaf5" : "#e7e1dc"}
    />
    {kind % 4 === 0 ? (
      <circle
        cx={w * 0.5}
        cy={w * 0.42}
        r={w * 0.12}
        fill={selected ? C.orange : "#cec6bf"}
      />
    ) : kind % 4 === 1 ? (
      <rect
        x={w * 0.37}
        y={w * 0.27}
        width={w * 0.28}
        height={w * 0.28}
        rx={w * 0.03}
        fill="#cbc3bd"
        transform={`rotate(20 ${w * 0.5} ${w * 0.4})`}
      />
    ) : kind % 4 === 2 ? (
      <g fill="#cbc3bd">
        {[0.32, 0.55, 0.23, 0.43].map((h, i) => (
          <rect
            key={i}
            x={w * (0.22 + i * 0.15)}
            y={w * (0.68 - h)}
            width={w * 0.105}
            height={w * h}
          />
        ))}
      </g>
    ) : (
      <g>
        {(selected
          ? [
              [0.64, 0.3],
              [0.5, 0.5],
              [0.26, 0.47],
              [0.59, 0.72],
            ]
          : [
              [0.32, 0.38],
              [0.58, 0.23],
              [0.7, 0.57],
              [0.39, 0.72],
            ]
        ).map(([xx, yy], i) => (
          <circle
            key={i}
            cx={w * xx}
            cy={w * yy}
            r={w * (selected && i === 1 ? 0.068 : 0.052)}
            fill={selected ? [C.gold, C.ink, C.orange, C.gold][i] : "#cbc3bd"}
          />
        ))}
      </g>
    )}
    <path
      d={`M${w * 0.17} ${w * 0.82}H${w * 0.72}`}
      stroke={selected ? C.orange : "#cbc3bd"}
      strokeWidth="1.7"
    />
  </g>
);

const Wallet: React.FC<{ x: number; y: number; scale?: number }> = ({
  x,
  y,
  scale = 1,
}) => (
  <g
    transform={`translate(${x} ${y}) scale(${scale})`}
    filter="url(#fh-small-shadow)"
  >
    <rect x="4" y="4" width="74" height="59" rx="9" fill="#9d7944" />
    <rect x="16" y="-9" width="50" height="27" rx="3" fill="#315ab8" />
    <rect
      x="17"
      y="-7"
      width="48"
      height="2"
      rx="1"
      fill="#7392da"
      opacity=".5"
    />
    <rect x="22" y="0" width="21" height="5" rx="2" fill="#fff6db" />
    <rect x="1" y="14" width="83" height="58" rx="9" fill="#a48150" />
    <rect x="0" y="10" width="81" height="59" rx="9" fill="url(#fh-wallet)" />
    <rect x="0" y="10" width="81" height="18" rx="8" fill="#c8a46b" />
    <path
      d="M8 11H73M1 28H80"
      fill="none"
      stroke="#e8d3a3"
      strokeWidth="1"
      opacity=".55"
    />
    <circle cx="69" cy="39" r="4.5" fill="#ae894f" />
    <circle cx="68" cy="38" r="3.5" fill="#b48f54" />
    <path
      d="M8 67H73"
      fill="none"
      stroke="#a78755"
      strokeWidth="1"
      opacity=".42"
    />
  </g>
);
const Brand: React.FC<{
  x: number;
  y: number;
  kind: number;
  scale?: number;
}> = ({ x, y, kind, scale = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${scale})`}>
    <rect
      width="82"
      height="82"
      rx="10"
      fill={["#b76548", "#1e2321", "#c29c51", "#fcf6e9"][kind % 4]}
      filter="url(#fh-small-shadow)"
    />
    {kind % 4 === 0 ? (
      <g transform="translate(41 41)" fill="#fff5df">
        {Array.from({ length: 14 }, (_, i) => (
          <rect
            key={i}
            x="-3"
            y="-30"
            width="6"
            height="31"
            rx="3"
            transform={`rotate(${(i * 360) / 14})`}
          />
        ))}
      </g>
    ) : kind % 4 === 1 ? (
      <g>
        <path
          d="M41 16L66 59H16Z"
          fill="none"
          stroke="#d49b75"
          strokeWidth="10"
          strokeLinejoin="round"
        />
        <circle cx="41" cy="46" r="8" fill="#fbf8ec" />
      </g>
    ) : kind % 4 === 2 ? (
      <Star x={41} y={41} r={29} color="#fff9e9" />
    ) : (
      <g fill="none" stroke={C.orange} strokeWidth="9">
        <path d="M58 22C30 8 12 37 25 56C42 80 74 55 57 36C44 23 32 36 40 44" />
        <circle cx="53" cy="18" r="4" fill={C.orange} />
      </g>
    )}
  </g>
);

const Idea: React.FC<{ d: number }> = ({ d }) => {
  const assembled = fade(d, 0.15, 0.6),
    exit = fade(d, 1.58, 0.3);
  return (
    <>
      <rect width="544" height="720" fill="url(#fh-idea)" />
      <g opacity={1 - exit}>
        <text
          x="272"
          y="202"
          textAnchor="middle"
          fontFamily={serif}
          fontSize="23"
        >
          于是一个直观的
        </text>
        <g
          transform={`translate(272 345) scale(${0.95 + 0.05 * assembled})`}
          strokeLinecap="round"
          fill="none"
        >
          {assembled < 0.99
            ? Array.from({ length: 7 }, (_, i) => (
                <path
                  key={i}
                  d="M-20 -28Q-4 -42 16 -17"
                  stroke={["#85a993", "#baab67", "#b4a6b6"][i % 3]}
                  strokeWidth="2.5"
                  transform={`rotate(${i * 51 + 90 * (1 - assembled)}) translate(0 ${-25 * (1 - assembled)})`}
                  opacity={1 - assembled}
                />
              ))
            : null}
          <g opacity={assembled}>
            <path
              d="M-30 28C-70-9-51-73 0-73S70-9 30 28L24 42H-24Z"
              stroke={C.ink}
              strokeWidth="3.8"
            />
            <path
              d="M-24 50H24M-21 60H21M-12 69H12"
              stroke={C.ink}
              strokeWidth="4"
            />
            <path
              d="M-8 39L-13-11Q-30-31-14-34Q0-38 0-20Q0-38 14-34Q30-31 13-11L8 39"
              stroke="#c4a944"
              strokeWidth="3"
            />
            <circle cy="-8" r="36" fill="#ead37d" opacity=".1" />
          </g>
        </g>
        <text
          x="272"
          y="513"
          textAnchor="middle"
          fontFamily={serif}
          fontSize="79"
        >
          想法
        </text>
      </g>
      <text
        x="272"
        y="390"
        textAnchor="middle"
        fontFamily={serif}
        fontSize="69"
        opacity={fade(d, 1.67, 0.25) * (1 - fade(d, 2.55, 0.25))}
        style={{ filter: `blur(${(1 - fade(d, 1.65, 0.3)) * 8}px)` }}
      >
        诞生了
      </text>
    </>
  );
};

const ScriptDocument: React.FC<{ d: number }> = ({ d }) => {
  const lines = [
    "我们可以根据文案脚本，",
    "先找个差不多的高质量",
    "动效视频，让 astra 用",
    "remotion 复刻，再 vibe",
    "coding 替换成自己的",
    "内容。这个过程我称",
    "之为 remix！",
  ];
  const n = Math.floor(
    d < 0.4
      ? clamp((d - 0.25) / 0.15) * 2
      : d < 1
        ? 2 + ((d - 0.4) / 0.6) * 49
        : d < 1.2
          ? 51 + ((d - 1) / 0.2) * 12
          : 63 + ((d - 1.2) / 0.2) * 25,
  );
  return (
    <>
      <Headline
        d={d}
        bits={["根据", { text: "文案脚本", color: C.orange }]}
        size={49}
        y={128}
      />
      <g
        transform={`translate(272 415) rotate(${-1.8 - 1.5 * (1 - fade(d, 0.15, 0.4))}) scale(${0.91 + 0.09 * enter(d, 0.04)}) translate(-272 -415)`}
        opacity={fade(d, 0.03)}
        filter="url(#fh-shadow)"
      >
        <rect x="122" y="213" width="302" height="400" rx="18" fill="#fffefd" />
        <g fontFamily="monospace" fontSize="14" fill="#878980">
          <text x="188" y="244">
            script.md
          </text>
          {[C.orange, C.gold, "#b8bdb3"].map((c, i) => (
            <circle key={i} cx={146 + i * 14} cy="239" r="4.5" fill={c} />
          ))}
          <path d="M145 254H399" stroke="#d5d8ca" strokeWidth="1.5" />
        </g>
        <rect
          x="281"
          y="274"
          width={73 * fade(d, 0.44)}
          height="22"
          rx="2"
          fill="#ddb59f"
          opacity=".66"
        />
        {lines.map((line, i) => {
          const before = lines.slice(0, i).join("").length,
            shown = line.slice(0, Math.max(0, n - before));
          return (
            <text
              key={i}
              x="144"
              y={292 + i * 39}
              fontFamily={sans}
              fontSize="22.5"
              fontWeight="600"
              letterSpacing="-.3"
              fill={C.ink}
            >
              {shown}
              <tspan fill={C.orange}>
                {n >= before && n < before + line.length ? "▏" : ""}
              </tspan>
            </text>
          );
        })}
      </g>
    </>
  );
};
const FindReference: React.FC<{ d: number }> = ({ d }) => {
  const selected = fade(d, 1.03, 0.32),
    lift = fade(d, 1.72, 0.22);
  return (
    <>
      <Headline
        d={d}
        bits={["找一个", { text: "高质量", color: C.orange }, "动效参考"]}
        size={46.5}
        y={118}
      />
      <g opacity={1 - lift}>
        {Array.from({ length: 9 }, (_, i) =>
          i === 4 ? null : (
            <Thumb
              key={i}
              x={70 + (i % 3) * 141}
              y={205 + Math.floor(i / 3) * 140}
              w={117}
              kind={i}
              opacity={(1 - selected * 0.64) * fade(d, i * 0.025)}
            />
          ),
        )}
        <g opacity={1 - selected}>
          <Thumb x={211} y={345} w={117} kind={3} />
        </g>
      </g>
      <g
        opacity={selected}
        transform={`translate(${mix(272, 272, lift)} ${mix(403, 236, lift)}) scale(${mix(1.45, 1.128, lift)}) translate(-58.5 -58.5)`}
      >
        <Thumb x={0} y={0} w={117} kind={3} selected />
        <g opacity={1 - lift}>
          <rect
            x="37"
            y="-14"
            width="43"
            height="13"
            rx="6.5"
            fill={C.orange}
          />
          <text
            x="58.5"
            y="-4.5"
            textAnchor="middle"
            fontFamily={sans}
            fontSize="6.8"
            fontWeight="700"
            fill="white"
          >
            ★ 高质量
          </text>
        </g>
      </g>
      <g opacity={(1 - lift) * fade(d, 0.15)}>
        <Magnifier
          x={mix(432, 287, fade(d, 0.55, 0.75))}
          y={mix(263, 424, fade(d, 0.55, 0.75))}
          scale={1.1}
        />
      </g>
    </>
  );
};

const CodeConversion: React.FC<{ d: number }> = ({ d }) => {
  const p = clamp((d - 0.2) / 1.98),
    lines = [
      "import {spring} from 'remotion';",
      "",
      "export const Remix = () => {",
      "  const frame = useCurrentFrame();",
      "  const s = spring({frame, fps: 30});",
      "  return (",
      "    <AbsoluteFill>",
      "      <Tile scale={s} />",
      "    </AbsoluteFill>",
      "  );",
      "};",
    ];
  const n = Math.floor(Math.max(0, d - 0.25) * 119);
  return (
    <>
      <Headline
        d={d}
        bits={[
          { text: "astra", color: C.orange },
          " 用 ",
          { text: "remotion", color: C.orange },
          " 复刻",
        ]}
        size={44.5}
        y={117}
      />
      <Thumb x={207} y={170} w={132} kind={3} selected />
      <g opacity={fade(d, 0.08)}>
        <path
          d="M272 316V371"
          fill="none"
          stroke={C.orange}
          strokeWidth="2.2"
          strokeDasharray="3 6"
        />
        <path d="M263 365L272 378L281 365Z" fill={C.orange} />
        <Label x={334} y={346} text="astra" width={60} fill={C.ink} size={15} />
      </g>
      <g
        transform={`translate(0 ${22 * (1 - enter(d, 0.12))})`}
        opacity={fade(d, 0.12)}
        filter="url(#fh-shadow)"
      >
        <rect x="71" y="385" width="403" height="280" rx="15" fill="#211b17" />
        {["#e86b78", "#eac968", "#8ac679"].map((c, i) => (
          <circle key={i} cx={91 + i * 14} cy="403" r="4.5" fill={c} />
        ))}
        <text
          x="137"
          y="407"
          fontSize="12.5"
          fill="#898478"
          fontFamily="monospace"
        >
          Remix.tsx — remotion
        </text>
        <path d="M85 418H460" stroke="#29241f" />
        {lines.map((line, i) => {
          const before = lines.slice(0, i).join("").length,
            shown = line.slice(0, Math.max(0, n - before));
          return (
            <g key={i}>
              <text
                x="94"
                y={446 + i * 19}
                fontSize="14"
                fontFamily="monospace"
                fill="#645d50"
              >
                {i + 1}
              </text>
              <text
                x="113"
                y={446 + i * 19}
                fontSize="14"
                fontFamily="monospace"
                fill={i === 0 ? "#dcc598" : i > 4 ? "#98b8ca" : "#f0e3d7"}
              >
                {shown}
                <tspan fill={C.orange}>
                  {n >= before && n < before + line.length ? "▌" : ""}
                </tspan>
              </text>
            </g>
          );
        })}
        <rect x="86" y="641" width="278" height="5" rx="2.5" fill="#302720" />
        <rect
          x="86"
          y="641"
          width={278 * p}
          height="5"
          rx="2.5"
          fill={C.orange}
        />
        <text
          x="456"
          y="648"
          textAnchor="end"
          fontFamily={sans}
          fontSize="13.5"
          fontWeight="600"
          fill="#f3efe7"
        >
          复制中 {Math.round(p * 100)}%
        </text>
      </g>
    </>
  );
};
const PromptReplace: React.FC<{ d: number }> = ({ d }) => {
  const prompt = "把钱包都换成我的 logo ✦";
  return (
    <>
      <Headline
        d={d}
        bits={[{ text: "vibe coding", color: C.orange }, " 换成你的内容"]}
        size={44.5}
        y={119}
      />
      <g
        opacity={fade(d)}
        transform={`translate(272 349) scale(${0.94 + 0.06 * enter(d)}) translate(-272 -349)`}
        filter="url(#fh-shadow)"
      >
        <rect x="120" y="196" width="304" height="302" rx="19" fill="#fffefb" />
        <rect x="131" y="207" width="282" height="280" rx="11" fill="#eeeae3" />
        {Array.from({ length: 7 }, (_, i) => (
          <g key={i} stroke="#d7d0c6" strokeWidth=".8" fill="none">
            <path d={`M${132 + i * 47} 207V487`} />
            <path d={`M131 ${207 + i * 46.7}H413`} />
          </g>
        ))}
        {Array.from({ length: 4 }, (_, i) => {
          const q = clamp((d - 0.69 - i * 0.31) / 0.26),
            flip = Math.abs(Math.cos(q * Math.PI)),
            x = 156 + (i % 2) * 131,
            y = 231 + Math.floor(i / 2) * 131;
          return (
            <g
              key={i}
              transform={`translate(${x + 50.5} ${y + 50.5}) scale(${Math.max(0.04, flip)} 1) translate(${-x - 50.5} ${-y - 50.5})`}
            >
              <rect
                x={x}
                y={y}
                width="101"
                height="101"
                rx="4"
                fill={q > 0.5 ? "#dca88b" : "url(#fh-leather)"}
              />
              <path
                d={`M${x + 1} ${y + 4}Q${x + 1} ${y + 1} ${x + 4} ${y + 1}H${x + 97}`}
                fill="none"
                stroke="#ead0b6"
                opacity=".48"
              />
              {q < 0.5 ? (
                <Wallet x={x + 15.5} y={y + 24} scale={0.84} />
              ) : (
                <Brand x={x + 13.5} y={y + 13.5} kind={i} scale={0.9} />
              )}
            </g>
          );
        })}
      </g>
      <g opacity={fade(d, 0.13)} filter="url(#fh-small-shadow)">
        <rect x="64" y="541" width="415" height="60" rx="30" fill="#fffefd" />
        <text x="91" y="579" fontFamily={sans} fontWeight="600" fontSize="20.5">
          {prompt.slice(0, Math.floor(Math.max(0, d - 0.24) * 20))}
          <tspan fill={C.orange}>{d < 1.12 ? "▏" : ""}</tspan>
        </text>
        <circle cx="447" cy="571" r="21" fill={C.orange} />
        <path
          d="M447 582V560M439 569L447 560L455 569"
          fill="none"
          stroke="white"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </g>
    </>
  );
};
const RemixTitle: React.FC<{ d: number }> = ({ d }) => {
  const p = smooth((d - 0.76) / 0.12),
    radius = 250 * smooth((d - 0.76) / 0.34);
  return (
    <>
      <g opacity={1 - p}>
        <text
          x="272"
          y="238"
          textAnchor="middle"
          fontFamily={sans}
          fontSize="23"
          fill={C.muted}
        >
          这个过程我称之为
        </text>
        <g
          transform={`translate(272 350) scale(${1 - 0.92 * smooth((d - 0.48) / 0.2)}) translate(-272 -350)`}
        >
          <path
            d="M167 350H221M314 350H362"
            stroke="#b4b6ac"
            strokeWidth="1.3"
          />
          <path
            d="M216 346L222 350L216 354M357 346L363 350L357 354"
            stroke="#b4b6ac"
            fill="none"
            strokeWidth="1.3"
          />
          <g opacity={fade(d)}>
            <Label
              x={111}
              y={355}
              text="找参考"
              fill={C.ink}
              width={111}
              size={23}
            />
          </g>
          <g opacity={fade(d, 0.1)}>
            <Label
              x={273}
              y={355}
              text="复刻"
              fill={C.ink}
              width={87}
              size={23}
            />
          </g>
          <g opacity={fade(d, 0.2)}>
            <Label
              x={438}
              y={355}
              text="替换"
              fill={C.orange}
              width={84}
              size={23}
            />
          </g>
        </g>
      </g>
      <g
        opacity={p}
        transform={`translate(272 384) scale(${0.78 + 0.22 * enter(d, 0.76)}) translate(-272 -384)`}
      >
        <circle
          cx="272"
          cy="376"
          r={radius}
          fill="none"
          stroke={C.orange}
          strokeWidth="2"
          opacity={1 - fade(d, 1.25, 0.5)}
        />
        <circle
          cx="272"
          cy="376"
          r="173"
          fill="none"
          stroke="#b5aea1"
          strokeWidth="1"
          strokeDasharray="1 8"
          opacity=".65"
        />
        {[4, 3, 2, 1, 0].map((i) => (
          <text
            key={i}
            x={272 + i * 6}
            y={409 + i * 5}
            fontFamily="Arial, sans-serif"
            fontWeight="500"
            fontSize="126"
            letterSpacing="-6"
            textLength="398"
            lengthAdjust="spacingAndGlyphs"
            textAnchor="middle"
            fill={["#161513", "#c36647", "#d4966a", "#b5644b", "#d4ad78"][i]}
          >
            REMIX
          </text>
        ))}
        <path
          d={`M${272 - 145 * fade(d, 1.2)} 455H${272 + 145 * fade(d, 1.2)}`}
          stroke={C.orange}
          strokeWidth="5"
          strokeLinecap="round"
        />
        <text
          x="272"
          y="492"
          fontSize="19"
          textAnchor="middle"
          fontFamily={sans}
          fill={C.muted}
          opacity={fade(d, 1.35)}
        >
          参考 · 复刻 · 替换
        </text>
      </g>
    </>
  );
};

const ComparisonWallet: React.FC<{ x: number; y: number; kind: number }> = ({
  x,
  y,
  kind,
}) => (
  <g transform={`translate(${x} ${y})`} filter="url(#fh-small-shadow)">
    <path d="M0 7L43 2L48 60L4 68Z" fill="#a37b47" />
    <path d="M2 4L43 0L46 57L5 64Z" fill="#d1b688" />
    <path
      d="M5 61L45 55M3 8L42 4"
      stroke="#ebd4a6"
      strokeWidth="1"
      fill="none"
    />
    {kind === 0 ? (
      <g transform="rotate(-4 25 27)">
        <rect x="8" y="12" width="28" height="38" rx="2" fill="#748c65" />
        <rect x="11" y="15" width="22" height="31" rx="1" fill="#dae3ce" />
        <rect x="15" y="19" width="14" height="17" fill="#48866d" />
        <circle cx="22" cy="27" r="5" fill="#dcebc7" />
        <path d="M14 41H31" stroke="#84957b" strokeWidth="2" />
      </g>
    ) : kind === 1 ? (
      <g>
        <rect x="7" y="-8" width="29" height="40" rx="2" fill="#31529a" />
        <path d="M8-6H34" stroke="#86a4d8" strokeWidth="2" />
        <rect x="9" y="17" width="32" height="35" rx="3" fill="#d9bf91" />
        <rect x="12" y="-3" width="8" height="8" rx="1" fill="#e0dabf" />
      </g>
    ) : kind === 2 ? (
      <g>
        <rect x="9" y="6" width="29" height="47" rx="3" fill="#807e74" />
        <rect x="13" y="10" width="21" height="39" rx="2" fill="#b3b2a6" />
        <path
          d="M13 17H34M14 25H34M16 34H32"
          stroke="#4a4a43"
          strokeWidth="4"
        />
        <circle cx="25" cy="42" r="3" fill="#747366" />
      </g>
    ) : (
      <g>
        {["#3d679e", "#e5dbc0", "#77a2b4", "#ceac69"].map((c, i) => (
          <rect
            key={i}
            x={7 + i * 4}
            y={4 - i * 4}
            width="25"
            height="47"
            rx="2"
            fill={c}
            transform={`rotate(${i * 7 - 8} 26 29)`}
          />
        ))}
      </g>
    )}
  </g>
);
const ComparisonBrand: React.FC<{ x: number; y: number; kind: number }> = ({
  x,
  y,
  kind,
}) => (
  <g transform={`translate(${x} ${y})`} filter="url(#fh-small-shadow)">
    {kind === 0 ? (
      <g>
        <ellipse cx="29" cy="39" rx="27" ry="26" fill="#8f6d35" />
        <ellipse cx="29" cy="35" rx="27" ry="26" fill="#c9ad73" />
        <path
          d="M14 25H39L19 42H40"
          stroke="#463d2d"
          strokeWidth="5"
          fill="none"
        />
        <text
          x="29"
          y="52"
          fontFamily={sans}
          fontSize="12"
          fontWeight="800"
          textAnchor="middle"
          fill="#403b30"
        >
          GLM
        </text>
      </g>
    ) : kind === 1 ? (
      <g>
        <path d="M5 4L52 0L54 64L9 69Z" fill="#af9768" />
        <path d="M5 0L51-4L52 57L8 63Z" fill="#e8e0c6" />
        <text
          x="27"
          y="24"
          textAnchor="middle"
          fontFamily={sans}
          fontWeight="800"
          fontSize="29"
          fill="#292d2a"
        >
          K·
        </text>
        <ellipse cx="30" cy="45" rx="13" ry="11" fill="#6f7d78" />
        <ellipse cx="28" cy="42" rx="12" ry="10" fill="#87918a" />
      </g>
    ) : kind === 2 ? (
      <g transform="translate(30 35)">
        {[3, 0].map((z) => (
          <g
            key={z}
            transform={`translate(0 ${z})`}
            fill={z ? "#8f703d" : "#ceb47f"}
          >
            {Array.from({ length: 13 }, (_, i) => (
              <path
                key={i}
                d="M-3-4L-5-31L3-32L4-4Z"
                transform={`rotate(${(i * 360) / 13})`}
              />
            ))}
          </g>
        ))}
      </g>
    ) : (
      <g transform="translate(31 34)">
        {[4, 0].map((z) => (
          <g
            key={z}
            transform={`translate(0 ${z})`}
            fill="none"
            stroke={z ? "#8d713f" : "#d8bc82"}
            strokeWidth="8"
            strokeLinejoin="bevel"
          >
            <path d="M-25-14L0-27L25-13V14L0 27L-25 13ZM0-27L0-7L25 14M-25-14L-7-3L0 27M25-13L7-3L-25 13" />
          </g>
        ))}
      </g>
    )}
  </g>
);

// V3: source-derived independent object textures; the floor, staging, camera and
// transitions are authored here. Replace these PNGs or set sourceObjectTextures=false
// to use the native SVG object fallback. Provenance lives beside the textures.
const objectTextures = {
  front: [
    [
      {
        src: "reference-assets/first/wallet-0.png",
        x: 132,
        y: 107,
        w: 114,
        h: 96,
      },
      {
        src: "reference-assets/first/wallet-1.png",
        x: 188,
        y: 124,
        w: 114,
        h: 107,
      },
      {
        src: "reference-assets/first/wallet-2.png",
        x: 244,
        y: 162,
        w: 115,
        h: 98,
      },
      {
        src: "reference-assets/first/wallet-3.png",
        x: 301,
        y: 190,
        w: 115,
        h: 99,
      },
    ],
    [
      {
        src: "reference-assets/first/logo-0.png",
        x: 132,
        y: 107,
        w: 114,
        h: 96,
      },
      {
        src: "reference-assets/first/logo-1.png",
        x: 188,
        y: 124,
        w: 114,
        h: 107,
      },
      {
        src: "reference-assets/first/logo-2.png",
        x: 244,
        y: 162,
        w: 115,
        h: 98,
      },
      {
        src: "reference-assets/first/logo-3.png",
        x: 301,
        y: 190,
        w: 115,
        h: 99,
      },
    ],
  ],
  back: [
    [
      {
        src: "reference-assets/first/back-wallet-0.png",
        x: 152,
        y: 117,
        w: 74,
        h: 66,
      },
      {
        src: "reference-assets/first/back-wallet-1.png",
        x: 213,
        y: 151,
        w: 64,
        h: 49,
      },
      {
        src: "reference-assets/first/back-wallet-2.png",
        x: 272,
        y: 181,
        w: 65,
        h: 50,
      },
      {
        src: "reference-assets/first/back-wallet-3.png",
        x: 329,
        y: 213,
        w: 62,
        h: 48,
      },
    ],
    [
      {
        src: "reference-assets/first/back-logo-0.png",
        x: 152,
        y: 114,
        w: 73,
        h: 64,
      },
      {
        src: "reference-assets/first/back-logo-1.png",
        x: 212,
        y: 146,
        w: 71,
        h: 63,
      },
      {
        src: "reference-assets/first/back-logo-2.png",
        x: 270,
        y: 167,
        w: 61,
        h: 61,
      },
      {
        src: "reference-assets/first/back-logo-3.png",
        x: 325,
        y: 201,
        w: 72,
        h: 59,
      },
    ],
  ],
  ends: [
    {
      src: "reference-assets/first/ending-phone.png",
      x: 325,
      y: 200,
      w: 79,
      h: 73,
    },
    {
      src: "reference-assets/first/ending-cat.png",
      x: 327,
      y: 198,
      w: 73,
      h: 62,
    },
  ],
} as const;
const smooth = (n: number) => {
  const p = clamp(n);
  return p * p * (3 - 2 * p);
};
const ObjectTexture: React.FC<{
  asset: { src: string; x: number; y: number; w: number; h: number };
}> = ({ asset }) => (
  <foreignObject
    x={asset.x - 109}
    y={asset.y - 38}
    width={asset.w}
    height={asset.h}
    overflow="visible"
  >
    <Img
      src={staticFile(asset.src)}
      style={{ width: asset.w, height: asset.h, display: "block" }}
    />
  </foreignObject>
);
const TilePlane: React.FC<{
  d: number;
  remix: boolean;
  sourceObjectTextures: boolean;
}> = ({ d, remix, sourceObjectTextures }) => {
  const variant = remix ? 1 : 0;
  const end = smooth((d - 5.55) / 0.7);
  const layoutShift = [
    [6, 90],
    [-50, -26],
    [50, -60],
    [-59, -14],
  ];
  const camera = 1 + 0.012 * Math.sin(clamp(d / 6) * Math.PI);
  return (
    <g transform={`translate(163 155) scale(${camera}) translate(-163 -155)`}>
      <defs>
        <linearGradient id={`floor-${variant}`} x1="0" y1="0" x2="1" y2="1">
          <stop stopColor={remix ? "#e4e4e7" : "#f7eff4"} />
          <stop offset=".46" stopColor={remix ? "#eeeaf0" : "#efe7ee"} />
          <stop offset="1" stopColor={remix ? "#e0e0e6" : "#eae5ef"} />
        </linearGradient>
        <filter
          id={`floor-soft-${variant}`}
          x="-100%"
          y="-100%"
          width="300%"
          height="300%"
        >
          <feGaussianBlur stdDeviation="12" />
        </filter>
      </defs>
      <rect width="326" height="311" fill="#6c6268" />
      <g transform="matrix(.56 .28 -.54 .66 79 70)">
        {Array.from({ length: 11 }, (_, y) =>
          Array.from({ length: 12 }, (_, x) => (
            <rect
              key={`${x}-${y}`}
              x={(x - 5) * 100 + 0.6}
              y={(y - 5) * 100 + 0.6}
              width="98.8"
              height="98.8"
              rx="4"
              fill={`url(#floor-${variant})`}
            />
          )),
        )}
      </g>
      <g
        filter={`url(#floor-soft-${variant})`}
        fill="#686776"
        opacity={remix ? 0.17 : 0.2}
      >
        <path d="M-50 181L50 137L11 242L-20 235Z" />
        <path d="M196-65L230-65L323 39L290 42Z" />
        <path d="M354 272L412 286L392 335L322 319Z" />
      </g>
      {Array.from({ length: 4 }, (_, i) => {
        const reveal = smooth((d + 0.05 - i * 0.45) / 0.34);
        const row = smooth((d - 3.22 - i * 0.045) / 0.85);
        const flip = smooth((d - 4.33 - i * 0.16) / 0.43);
        const dx =
          layoutShift[i][0] * (1 - row) +
          [-92, -22, 25, 65][i] * Math.sin(row * Math.PI);
        const dy =
          layoutShift[i][1] * (1 - row) +
          [10, 16, -22, 8][i] * Math.sin(row * Math.PI);
        const height =
          Math.max(0.018, Math.abs(Math.cos(flip * Math.PI))) * reveal;
        const centerX = 78 + i * 56.5;
        const centerY = 117 + i * 28;
        const collapse = end * (3 - i);
        const flyX = collapse * 56.5;
        const flyY = collapse * 28;
        return (
          <g
            key={i}
            opacity={reveal * (1 - end)}
            transform={`translate(${dx + flyX} ${dy + flyY})`}
          >
            <ellipse
              cx={centerX + 8}
              cy={centerY + 22}
              rx="29"
              ry="8"
              fill="#665047"
              opacity={(1 - height) * 0.22}
              filter="url(#fh-blur)"
            />
            <g
              transform={`translate(${centerX} ${centerY}) matrix(1 0 ${(1 - height) * 0.28} ${height} 0 ${-18 * Math.sin(flip * Math.PI)}) translate(${-centerX} ${-centerY})`}
            >
              {sourceObjectTextures ? (
                flip < 0.5 ? (
                  <ObjectTexture asset={objectTextures.front[variant][i]} />
                ) : (
                  <ObjectTexture asset={objectTextures.back[variant][i]} />
                )
              ) : (
                <g transform={`translate(${centerX - 22} ${centerY - 35})`}>
                  {remix ? (
                    <ComparisonBrand x={0} y={0} kind={i} />
                  ) : (
                    <ComparisonWallet x={0} y={0} kind={i} />
                  )}
                </g>
              )}
            </g>
          </g>
        );
      })}
      <g opacity={end}>
        {sourceObjectTextures ? (
          <ObjectTexture asset={objectTextures.ends[variant]} />
        ) : (
          <ComparisonWallet x={220} y={168} kind={3} />
        )}
        <g transform="translate(128 139) rotate(27)">
          <text
            x="0"
            y={remix ? 8 : -4}
            textAnchor="middle"
            fill="#111"
            fontFamily={sans}
            fontSize={remix ? 31 : 14}
            fontWeight="750"
            letterSpacing={remix ? 9 : 0}
          >
            {remix ? "猫 学 长" : "A smart wallet is"}
          </text>
          {!remix ? (
            <text
              x="0"
              y="13"
              textAnchor="middle"
              fontFamily={sans}
              fontSize="14"
              fontWeight="700"
            >
              already in your Galaxy.
            </text>
          ) : null}
        </g>
      </g>
    </g>
  );
};
const OriginalRemix: React.FC<{ d: number; sourceObjectTextures: boolean }> = ({
  d,
  sourceObjectTextures,
}) => (
  <>
    {[false, true].map((remix, i) => (
      <g
        key={String(remix)}
        opacity={fade(d, 0.05 + i * 0.1)}
        transform={`translate(${112 + (i === 0 ? 30 : -30) * (1 - smooth(d / 0.2))} ${38 + i * 331 + (i === 0 ? -20 : 20) * (1 - smooth(d / 0.2))})`}
        filter="url(#fh-shadow)"
      >
        <defs>
          <clipPath id={`fh-tile-clip-${i}`}>
            <rect x="0" y="0" width="326" height="311" rx="16" />
          </clipPath>
        </defs>
        <g clipPath={`url(#fh-tile-clip-${i})`}>
          <TilePlane
            d={d}
            remix={remix}
            sourceObjectTextures={sourceObjectTextures}
          />
        </g>
        <rect
          x="0"
          y="0"
          width="326"
          height="311"
          rx="16"
          fill="none"
          stroke="white"
          strokeWidth="6"
        />
        <g opacity={fade(d, remix ? 1.8 : 0.8)}>
          <rect
            x="14"
            y="15"
            width={remix ? 107 : 161}
            height="25"
            rx="12"
            fill={remix ? C.orange : C.ink}
          />
          <text
            x="24"
            y="33"
            fill="white"
            fontFamily={sans}
            fontWeight="600"
            fontSize="15"
          >
            {remix ? "REMIX 视频" : "原始视频  ORIGINAL"}
          </text>
        </g>
        {remix ? (
          <rect
            x="-7"
            y="-7"
            width="340"
            height="325"
            rx="22"
            fill="none"
            stroke={C.orange}
            strokeWidth="2"
            strokeDasharray="8 5"
            opacity={fade(d, 5.05)}
          />
        ) : null}
      </g>
    ))}
    <g opacity={fade(d, 5.05)}>
      <rect x="162" y="343" width="218" height="36" rx="15" fill="#fffdf9" />
      <text
        x="271"
        y="369"
        textAnchor="middle"
        fontFamily={sans}
        fontSize="16"
        fill={C.muted}
      >
        钱包 <tspan fill={C.orange}> ⟶ AI 企业 logo</tspan>
      </text>
    </g>
  </>
);

const TwoChallenges: React.FC<{ d: number }> = ({ d }) => (
  <>
    <Headline
      d={d}
      bits={["但 ", { text: "remix", color: C.orange }, " 有两个难点"]}
      size={34}
    />
    {[0, 1].map((i) => (
      <g
        key={i}
        opacity={fade(d, 0.13 + i * 0.18)}
        transform={`translate(${169 + i * 206} 408) rotate(${i ? 4 : -4}) scale(${0.5 + 0.5 * enter(d, 0.13 + i * 0.18)}) translate(-94 -114)`}
        filter="url(#fh-shadow)"
      >
        <rect width="188" height="228" rx="16" fill="white" />
        <path d="M16 0H172Q188 0 188 16V35H0V16Q0 0 16 0" fill={C.orange} />
        <text
          x="94"
          y="25"
          textAnchor="middle"
          fontFamily={sans}
          fontSize="15"
          fill="white"
        >
          难点
        </text>
        <text
          x="94"
          y="132"
          textAnchor="middle"
          fontFamily={sans}
          fontWeight="750"
          fontSize="80"
        >
          0{i + 1}
        </text>
        <path d="M94 155L68 202H120Z" fill={i ? C.orange : C.gold} />
        <text
          x="94"
          y="195"
          textAnchor="middle"
          fontFamily={sans}
          fill="white"
          fontWeight="800"
          fontSize="29"
        >
          !
        </text>
      </g>
    ))}
  </>
);

const RejectGrid: React.FC<{ d: number }> = ({ d }) => {
  const cursor = clamp((d - 0.37) / 1.93) * 25,
    ix = Math.min(24, Math.floor(cursor)),
    progress = cursor >= 25 ? 1 : cursor % 1;
  const prev = Math.max(0, ix - 1),
    mx = mix(99 + (prev % 5) * 85, 99 + (ix % 5) * 85, ease(progress)),
    my = mix(
      243 + Math.floor(prev / 5) * 85,
      243 + Math.floor(ix / 5) * 85,
      ease(progress),
    );
  return (
    <>
      <Label x={272} y={56} text="难点 01" width={76} size={15} />
      <Headline
        d={d}
        bits={[{ text: "高质量动效", color: C.orange }, " 其实不好找"]}
        size={33}
      />
      {Array.from({ length: 25 }, (_, i) => {
        const settle = fade(d, i * 0.007, 0.38),
          x = 64 + (i % 5) * 85,
          y = 207 + Math.floor(i / 5) * 85;
        return (
          <g
            key={i}
            opacity={settle}
            transform={`translate(${(1 - settle) * (seeded(i) * 260 - 130)} ${(1 - settle) * (seeded(i + 25) * 390 - 100)})`}
          >
            <Thumb x={x} y={y} w={71} kind={i % 4} />
            <g
              opacity={fade(cursor, i, 0.23)}
              stroke={C.red}
              strokeWidth="5"
              strokeLinecap="round"
            >
              <path
                d={`M${x + 22} ${y + 21}L${x + 49} ${y + 48}M${x + 49} ${y + 21}L${x + 22} ${y + 48}`}
              />
            </g>
          </g>
        );
      })}
      <g opacity={fade(d, 0.34)}>
        <Magnifier x={mx} y={my} scale={0.88} />
      </g>
      <text
        x="272"
        y="649"
        textAnchor="middle"
        fontFamily={sans}
        fontSize="20"
        fill={C.muted}
      >
        已筛 {Math.min(25, Math.floor(cursor))} · 合格{" "}
        <tspan fill={C.red} fontWeight="700">
          0
        </tspan>
      </text>
    </>
  );
};

const TokenSink: React.FC<{ d: number }> = ({ d }) => {
  const p = clamp(d / 4.12),
    count = Math.round(2450080 * Math.pow(p, 3));
  return (
    <>
      <Label x={272} y={56} text="难点 02" width={76} size={15} />
      <Headline
        d={d}
        bits={["复制 非常烧 ", { text: "tokens", color: C.orange }]}
        size={35}
      />
      {Array.from({ length: 115 }, (_, i) => {
        const birth = 0.13 + seeded(i) * 3.8,
          age = d - birth,
          dur = 0.73 + seeded(i + 80) * 0.45;
        if (age < 0 || age > dur) return null;
        const v = age / dur,
          x = mix(
            63 + seeded(i + 130) * 420,
            267 + seeded(i + 18) * 22,
            Math.pow(v, 1.4),
          ),
          y = mix(139, 366, v * v * 0.48 + v * 0.52);
        return (
          <g
            key={i}
            transform={`translate(${x} ${y}) rotate(${mix(-40 + seeded(i + 250) * 80, 40 - seeded(i) * 80, v)})`}
            opacity={fade(age, 0, 0.1) * (1 - fade(v, 0.87, 0.13))}
          >
            <rect
              x="-12"
              y="-7"
              width="25"
              height="14"
              rx="3"
              fill={i % 3 === 0 ? C.orange : C.gold}
            />
            <text
              x="0"
              y="3"
              textAnchor="middle"
              fontFamily={sans}
              fontSize="7"
              fontWeight="700"
              fill="white"
            >
              tok
            </text>
          </g>
        );
      })}
      <g opacity={fade(d, 0.02)} filter="url(#fh-shadow)">
        <rect x="165" y="358" width="223" height="147" rx="24" fill="#1e1916" />
        <g transform={`rotate(${d * 190} 217 430)`}>
          <circle
            cx="217"
            cy="430"
            r="30"
            fill="none"
            stroke="#514238"
            strokeWidth="5"
          />
          <circle
            cx="217"
            cy="430"
            r="30"
            fill="none"
            stroke={C.orange}
            strokeWidth="5"
            strokeDasharray="129 60"
            strokeLinecap="round"
          />
          <circle
            cx="217"
            cy="430"
            r="20"
            fill="none"
            stroke={C.gold}
            strokeWidth="3"
            strokeDasharray="80 45"
          />
        </g>
        <text
          x="264"
          y="433"
          fontFamily={sans}
          fontSize="30"
          fontWeight="650"
          fill="white"
        >
          复制
        </text>
        <text x="266" y="455" fontFamily={sans} fontSize="11" fill="#8d8377">
          gpt6 astra
        </text>
      </g>
      <text
        x="272"
        y="570"
        textAnchor="middle"
        fontFamily="monospace"
        fontSize="47"
        fontWeight="800"
        fill={p > 0.48 ? C.red : C.ink}
      >
        {count.toLocaleString("en-US")}
      </text>
      <text
        x="272"
        y="594"
        textAnchor="middle"
        fontFamily={sans}
        fontSize="17"
        fill={C.muted}
      >
        tokens 消耗
      </text>
      <rect x="77" y="625" width="390" height="14" rx="7" fill={C.gray} />
      <rect
        x="77"
        y="625"
        width={390 * p * p * p}
        height="14"
        rx="7"
        fill={p > 0.48 ? C.red : C.gold}
      />
    </>
  );
};

const CompareBars: React.FC<{ d: number }> = ({ d }) => (
  <>
    <Headline
      d={d}
      bits={[
        "复制 ",
        { text: "vs", color: "#888078" },
        { text: " vibe coding", color: C.orange },
      ]}
      size={35}
    />
    <g opacity={fade(d, 0.14)}>
      <text x="65" y="267" fontFamily={sans} fontWeight="650" fontSize="22">
        复制
      </text>
      <rect x="65" y="286" width="414" height="59" rx="15" fill={C.gray} />
      <rect
        x="65"
        y="286"
        width={414 * fade(d, 0.17, 0.7)}
        height="59"
        rx="15"
        fill={C.red}
      />
      <text
        x="456"
        y="323"
        textAnchor="end"
        fontFamily={sans}
        fontWeight="600"
        fontSize="18"
        fill="white"
        opacity={fade(d, 0.48)}
      >
        海量 tokens
      </text>
    </g>
    <g opacity={fade(d, 1.2)}>
      <text x="65" y="440" fontFamily={sans} fontWeight="600" fontSize="22">
        vibe coding 修改
      </text>
      <rect x="65" y="459" width="414" height="59" rx="15" fill={C.gray} />
      <rect
        x="65"
        y="459"
        width={30 * fade(d, 1.3)}
        height="59"
        rx="14"
        fill={C.orange}
      />
      <g opacity={fade(d, 1.85)}>
        <circle
          cx="80"
          cy="488"
          r="42"
          fill="none"
          stroke={C.orange}
          strokeWidth="2"
        />
        <path d="M116 515L168 549" stroke={C.orange} strokeWidth="2" />
        <Label x={205} y={560} width={111} text="只需很少" size={18} />
      </g>
    </g>
    <text
      x="272"
      y="629"
      textAnchor="middle"
      fontFamily={sans}
      fontSize="20"
      fill={C.muted}
      opacity={fade(d, 2.8)}
    >
      贵的是「复制」，不是「修改」
    </text>
  </>
);

const PremiumCard: React.FC<{ d: number }> = ({ d }) => {
  const phrase = d > 2.12,
    coinTime = d - 2.62;
  return (
    <>
      <Headline
        d={phrase ? d - 2.12 : d}
        bits={
          phrase
            ? ["只能用", { text: "昂贵的", color: C.red }, " gpt6 astra"]
            : ["为了", { text: "最好的复刻效果", color: C.orange }]
        }
        size={phrase ? 43 : 44.5}
        y={128}
      />
      {Array.from({ length: 12 }, (_, i) => {
        const age = coinTime - (i < 4 ? i * 0.03 : 0.65 + seeded(i) * 0.7);
        if (age < 0) return null;
        const y = -45 + (age % 2.2) * 90 + (age % 2.2) ** 2 * 350;
        if (i % 3 !== 0) return null;
        return (
          <Coin
            key={i}
            x={i < 4 ? [133, 220, 312, 495][i] : 37 + seeded(i + 4) * 474}
            y={y}
            r={12 + seeded(i) * 4}
            turn={age * 7 + i}
          />
        );
      })}
      <g
        transform={`translate(272 ${397 + 8 * (1 - fade(d, 0.8, 0.6))}) scale(${0.86 + 0.14 * enter(d)}) translate(-272 -397)`}
        opacity={fade(d)}
      >
        <g filter="url(#fh-shadow)">
          <rect
            x="108"
            y="247"
            width="330"
            height="300"
            rx="24"
            fill="#1e1916"
          />
          <rect
            x="114"
            y="253"
            width="318"
            height="288"
            rx="19"
            fill="none"
            stroke="#ba985a"
            strokeWidth="1.5"
          />
          <rect
            x="120"
            y="259"
            width="306"
            height="276"
            rx="15"
            fill="none"
            stroke="#554632"
            strokeWidth=".8"
          />
        </g>
        <g clipPath="url(#fh-premium-clip)" opacity=".11">
          <path
            d={`M${-140 + d * 150} 580L${40 + d * 150} 220H${118 + d * 150}L${-62 + d * 150} 580Z`}
            fill="#9c8e70"
          />
        </g>
        <text
          x="273"
          y="303"
          textAnchor="middle"
          fontFamily={sans}
          fontSize="15"
          fontWeight="550"
          fill={C.gold}
        >
          FLAGSHIP MODEL
        </text>
        <text
          x="273"
          y="399"
          textAnchor="middle"
          fontFamily={sans}
          fontSize="86"
          textLength="278"
          lengthAdjust="spacingAndGlyphs"
          fontWeight="500"
          letterSpacing="0"
          fill="white"
        >
          GPT–6
        </text>
        <text
          x="273"
          y="451"
          textAnchor="middle"
          fontFamily={sans}
          fontSize="40"
          fontWeight="650"
          fill={C.gold}
        >
          astra
        </text>
        {Array.from({ length: 5 }, (_, i) => (
          <g
            key={i}
            opacity={fade(d, 0.57 + i * 0.25)}
            transform={`translate(${194 + i * 39} 494) scale(${enter(d, 0.57 + i * 0.25)}) translate(${-194 - i * 39} -494)`}
          >
            <Star x={194 + i * 39} y={494} r={16.5} />
          </g>
        ))}
      </g>
      <g
        opacity={fade(d, 2.12)}
        transform={`translate(449 247) rotate(${9 + Math.sin((d - 2.12) * 9) * 12 * Math.exp(-Math.max(0, d - 2.12) * 2)}) translate(-449 -247)`}
      >
        <path
          d="M444 224L442 277"
          fill="none"
          stroke={C.ink}
          strokeWidth="1.6"
        />
        <g filter="url(#fh-small-shadow)">
          <path d="M406 282L443 262L483 282V353H406Z" fill={C.red} />
          <circle cx="443" cy="284" r="4.5" fill="white" />
          <text
            x="445"
            y="321"
            textAnchor="middle"
            fontFamily={sans}
            fontWeight="700"
            fontSize="24"
            fill="white"
          >
            昂贵
          </text>
          <text
            x="445"
            y="343"
            textAnchor="middle"
            fontFamily={sans}
            fontSize="20"
            fill="white"
          >
            $$$
          </text>
        </g>
      </g>
      {Array.from({ length: 12 }, (_, i) => {
        const age = coinTime - (i < 4 ? i * 0.03 : 0.65 + seeded(i) * 0.7);
        if (age < 0 || i % 3 === 0) return null;
        return (
          <Coin
            key={i}
            x={i < 4 ? [133, 220, 312, 495][i] : 37 + seeded(i + 4) * 474}
            y={-45 + (age % 2.2) * 90 + (age % 2.2) ** 2 * 350}
            r={12 + seeded(i) * 4}
            turn={age * 7 + i}
          />
        );
      })}
    </>
  );
};
const Coin: React.FC<{ x: number; y: number; r: number; turn: number }> = ({
  x,
  y,
  r,
  turn,
}) => (
  <g
    transform={`translate(${x} ${y}) scale(${0.13 + 0.87 * Math.abs(Math.cos(turn))} 1)`}
  >
    <ellipse rx={r} ry={r * 1.05} fill="#8f682e" />
    <ellipse cx="-2" cy="-1" rx={r * 0.9} ry={r} fill="url(#fh-gold)" />
    <ellipse
      cx="-2"
      cy="-1"
      rx={r * 0.69}
      ry={r * 0.79}
      fill="none"
      stroke="#edd89f"
      strokeWidth="1"
    />
    <text
      x="-2"
      y={r * 0.4}
      textAnchor="middle"
      fontFamily={sans}
      fontWeight="700"
      fontSize={r * 1.25}
      fill="#fff7dc"
    >
      $
    </text>
  </g>
);

const CostColumns: React.FC<{ d: number }> = ({ d }) => {
  const base = fade(d, 0.25, 0.55),
    p = fade(d, 1.35, 1.9),
    ratio = 2.5 * p;
  return (
    <>
      <Headline
        d={d}
        bits={["每百兆 tokens ", { text: "成本", color: C.orange }]}
        size={44.5}
        y={118}
      />
      <path d="M65 610H479" stroke="#c0bdb3" strokeWidth="1.4" />
      <g opacity={fade(d, 0.16)}>
        <rect
          x="104"
          y={610 - 150 * base}
          width="119"
          height={150 * base}
          rx="13"
          fill={C.ink}
        />
        <rect x="104" y="597" width="119" height="13" fill={C.ink} />
        <text
          x="163"
          y={595 - 150 * base}
          textAnchor="middle"
          fontFamily={sans}
          fontWeight="550"
          fontSize="23"
          opacity={base}
        >
          1×
        </text>
        <text
          x="163"
          y="643"
          textAnchor="middle"
          fontFamily={sans}
          fontWeight="600"
          fontSize="23"
        >
          5.6 sol
        </text>
      </g>
      <g opacity={fade(d, 1.3)}>
        <rect
          x="316"
          y={610 - 150 * ratio}
          width="119"
          height={150 * ratio}
          rx="13"
          fill={C.red}
        />
        <rect x="316" y="597" width="119" height="13" fill={C.red} />
        <text
          x="375"
          y={590 - 150 * ratio}
          textAnchor="middle"
          fontFamily={sans}
          fontWeight="650"
          fontSize="54"
          textLength="114"
          lengthAdjust="spacingAndGlyphs"
          fill={C.red}
        >
          {ratio.toFixed(1)}×
        </text>
        <text
          x="375"
          y="643"
          textAnchor="middle"
          fontFamily={sans}
          fontWeight="600"
          fontSize="23"
          fill={C.red}
        >
          gpt6 astra
        </text>
      </g>
      <g opacity={fade(d, 3.65)}>
        <path
          d="M104 460H437"
          stroke="#8f897f"
          strokeWidth="1"
          strokeDasharray="4 5"
        />
        <Label
          x={187}
          y={301}
          text="贵了整整 2.5 倍"
          fill={C.red}
          width={184}
          size={20}
        />
      </g>
    </>
  );
};

const QuotaRing: React.FC<{ d: number }> = ({ d }) => {
  const loss = clamp((d - 0.55) / 1.0),
    remaining = 1 - loss,
    consumption = 17 * fade(d, 0.45, 0.8),
    circ = 2 * Math.PI * 120,
    stamp = fade(d, 1.8, 0.12);
  return (
    <>
      <Headline
        d={d}
        bits={["Plus 用户 ", { text: "5h 额度", color: C.orange }]}
        size={35}
      />
      <g
        opacity={fade(d)}
        transform={`translate(272 347) scale(${0.91 + 0.09 * enter(d)})`}
        filter="url(#fh-shadow)"
      >
        <circle r="139" fill="#fffdf9" />
        <circle r="120" fill="none" stroke={C.gray} strokeWidth="22" />
        <circle
          r="120"
          fill="none"
          stroke={remaining < 0.5 ? C.orange : C.ink}
          strokeWidth="22"
          strokeLinecap="round"
          strokeDasharray={`${circ * remaining} ${circ}`}
          opacity={remaining > 0 ? 1 : 0}
          transform="rotate(-90)"
        />
        <text
          x="0"
          y="16"
          textAnchor="middle"
          fontFamily="monospace"
          fontWeight="800"
          fontSize="57"
          fill={remaining < 0.5 ? C.orange : C.ink}
          opacity={1 - stamp}
        >
          {Math.round(remaining * 100)}%
        </text>
        <text
          x="0"
          y="46"
          textAnchor="middle"
          fontFamily={sans}
          fontSize="17"
          fill={C.muted}
          opacity={1 - stamp}
        >
          剩余额度 · 5h
        </text>
      </g>
      <g opacity={fade(d, 0.4)} filter="url(#fh-shadow)">
        <rect x="77" y="525" width="390" height="98" rx="15" fill="#fffefa" />
        <text x="100" y="564" fontFamily={sans} fontWeight="600" fontSize="20">
          remix 一段动效
        </text>
        <text
          x="444"
          y="563"
          textAnchor="end"
          fontFamily={sans}
          fontSize="16"
          fill={loss > 0.5 ? C.red : C.muted}
        >
          {Math.round(consumption)}%
        </text>
        <rect x="99" y="583" width="346" height="14" rx="7" fill={C.gray} />
        <rect
          x="99"
          y="583"
          width={(346 * consumption) / 100}
          height="14"
          rx="7"
          fill={loss > 0.5 ? C.red : C.orange}
        />
      </g>
      <g
        opacity={stamp}
        transform={`translate(272 346) rotate(-13) scale(${1 + 0.35 * Math.exp(-Math.max(0, d - 1.8) * 16)})`}
      >
        <rect
          x="-151"
          y="-42"
          width="302"
          height="84"
          rx="8"
          fill="#fffdfa"
          fillOpacity=".83"
          stroke={C.red}
          strokeWidth="4"
        />
        <rect
          x="-142"
          y="-33"
          width="284"
          height="66"
          rx="3"
          fill="none"
          stroke={C.red}
          strokeWidth="1.5"
        />
        <text
          x="0"
          y="15"
          textAnchor="middle"
          fontFamily={sans}
          fontWeight="750"
          fontSize="39"
          fill={C.red}
        >
          额度已耗尽
        </text>
      </g>
      <text
        x="272"
        y="656"
        textAnchor="middle"
        fontFamily={sans}
        fontWeight="600"
        fontSize="22"
        opacity={fade(d, 2.4)}
      >
        根本做不了什么
      </text>
    </>
  );
};

const GalleryArt: React.FC<{
  x: number;
  y: number;
  w: number;
  h: number;
  index: number;
}> = ({ x, y, w, h, index }) => (
  <g transform={`translate(${x} ${y})`}>
    <rect width={w} height={h} rx="6" fill="white" />
    <rect
      x="4"
      y="4"
      width={w - 8}
      height={h * 0.72}
      rx="4"
      fill={
        ["#132362", "#243678", "#cff1ac", "#88c9ef", "#1c1d21", "#eee2d4"][
          index % 6
        ]
      }
    />
    {index % 3 === 0 ? (
      <circle
        cx={w * 0.64}
        cy={h * 0.39}
        r={w * 0.23}
        fill="none"
        stroke="#82b6ff"
        strokeWidth={w * 0.025}
      />
    ) : index % 3 === 1 ? (
      <text
        x={w * 0.13}
        y={h * 0.44}
        fill={index % 6 === 4 ? "#f4ece4" : "white"}
        fontFamily={sans}
        fontSize={w * 0.14}
        fontWeight="700"
      >
        {["CREATE", "ENERGY", "UI", "Motion"][index % 4]}
      </text>
    ) : (
      <g transform={`translate(${w * 0.35} ${h * 0.18}) rotate(18)`}>
        <rect
          width={w * 0.33}
          height={h * 0.45}
          rx="4"
          fill={index % 2 ? "#191c2a" : "#66a17d"}
        />
      </g>
    )}
    <rect
      x={w * 0.1}
      y={h * 0.84}
      width={w * 0.56}
      height={h * 0.035}
      rx="1"
      fill="#deded5"
    />
    <rect
      x={w * 0.1}
      y={h * 0.91}
      width={w * 0.3}
      height={h * 0.025}
      rx="1"
      fill="#eeeee7"
    />
  </g>
);
const GalleryCamera: React.FC<{ d: number }> = ({ d }) => {
  const upright = fade(d, 1.22, 0.75),
    logo = fade(d, 1.78, 0.3);
  return (
    <>
      <g
        opacity={1 - upright * 0.52}
        style={{ filter: `blur(${upright * 4}px)` }}
      >
        {Array.from({ length: 14 }, (_, row) =>
          Array.from({ length: 7 }, (_, col) => {
            const near = (row + 1) / 14,
              scale = 0.12 + Math.pow(near, 1.7) * 1.02,
              z = (d * 0.16) % 1;
            const x = mix(
                272 + (col - 3.5) * 145 * scale,
                col * 91 - 46,
                upright,
              ),
              y = mix(
                178 + Math.pow(near, 2.12) * 590 - z * 25,
                row * 107 - 70,
                upright,
              ),
              w = mix(131 * scale, 82, upright),
              h = mix(102 * scale * (0.6 + near * 0.35), 95, upright);
            return (
              <g
                key={`${row}-${col}`}
                transform={`rotate(${mix((col - 3) * -2, 0, upright)} ${x + w / 2} ${y + h / 2})`}
                filter={near > 0.65 ? "url(#fh-small-shadow)" : undefined}
              >
                <GalleryArt x={x} y={y} w={w} h={h} index={row * 7 + col} />
              </g>
            );
          }),
        )}
      </g>
      <g
        opacity={logo}
        transform={`translate(272 354) scale(${0.8 + 0.2 * enter(d, 1.78)})`}
      >
        <rect
          x="-71"
          y="-72"
          width="142"
          height="142"
          rx="28"
          fill="#fffef7"
          filter="url(#fh-shadow)"
        />
        <path
          d="M-45 10Q-18-67-8-7Q17-55 36 9Q42 26 29 21L13 4Q-2 34-16 12L-22-4Q-41 33-45 10"
          fill="#20231d"
        />
        <path
          d="M-6 25Q7 35 18 22"
          stroke="#20231d"
          strokeWidth="5"
          fill="none"
          strokeLinecap="round"
        />
        <text
          x="0"
          y="124"
          textAnchor="middle"
          fontFamily={sans}
          fontSize="42"
          fontWeight="800"
          fill={C.ink}
        >
          Motion Face
        </text>
        <text
          x="0"
          y="160"
          textAnchor="middle"
          fontFamily={sans}
          fontSize="16"
          fill={C.muted}
        >
          猫学长 出品
        </text>
      </g>
    </>
  );
};

const WebsiteFocus: React.FC<{ d: number }> = ({ d }) => {
  const tilt = -4 + Math.sin(d * 0.9) * 2,
    zoom = 1.05 + d * 0.018;
  return (
    <g
      transform={`translate(272 340) rotate(${tilt}) scale(${zoom}) translate(-272 -340)`}
    >
      <rect x="-34" y="-30" width="614" height="790" fill="#f8faf6" />
      <g stroke="#e6e8df" opacity=".6" fill="none">
        {Array.from({ length: 65 }, (_, i) => (
          <path
            key={i}
            d={`M-30 ${i * 12}Q272 ${i * 12 - 9} 585 ${i * 12}`}
            strokeWidth=".5"
          />
        ))}
      </g>
      <text x="52" y="71" fontFamily={sans} fontWeight="750" fontSize="25">
        〰 Motion Face
      </text>
      <text x="408" y="73" fontFamily={sans} fontSize="12">
        探索广场
      </text>
      <path d="M418 91H459" stroke="#66786a" strokeWidth="2" />
      <text
        x="272"
        y="191"
        textAnchor="middle"
        fontFamily={sans}
        fontSize="10"
        letterSpacing="3"
        fill="#879086"
      >
        REPLICATE ONCE, REMIX FOREVER.
      </text>
      <rect
        x="103"
        y="222"
        width={334 * fade(d, 0.18, 0.35)}
        height="66"
        fill="#f0d32d"
      />
      <text x="112" y="276" fontFamily={sans} fontWeight="800" fontSize="59">
        一人复刻，
      </text>
      <rect
        x="99"
        y="300"
        width={335 * fade(d, 0.8, 0.35)}
        height="62"
        fill="#b7d3b4"
      />
      <text
        x="111"
        y="350"
        fontFamily={sans}
        fontWeight="750"
        fontSize="57"
        fill="#637264"
      >
        万人共享
      </text>
      <text
        x="272"
        y="401"
        textAnchor="middle"
        fontFamily={sans}
        fontSize="14"
        fill="#959b91"
      >
        一个人用 AI 复刻好的动效代码，所有人都能 remix
      </text>
      <rect
        x="81"
        y="441"
        width="382"
        height="85"
        rx="8"
        fill="white"
        stroke="#e4e9df"
      />
      <text x="102" y="472" fontFamily={sans} fontSize="13" fill="#939a91">
        传统 vibe motion 找参考 → AI 代码复制 → remix
      </text>
      <text x="102" y="507" fontFamily={sans} fontSize="14" fill="#4c6356">
        Motion Face 找参考 → remix 内容
      </text>
      <text
        x="272"
        y="578"
        textAnchor="middle"
        fontFamily={sans}
        fontSize="17"
        fill="#667267"
      >
        tokens 消耗减少{" "}
        <tspan fontSize="33" fill="#81a283" fontWeight="800">
          95%
        </tspan>
      </text>
      <rect x="153" y="608" width="241" height="48" rx="10" fill="#465d4b" />
      <text
        x="273"
        y="638"
        fontFamily={sans}
        textAnchor="middle"
        fill="white"
        fontSize="16"
      >
        如何分享动效片段 ↗
      </text>
    </g>
  );
};

const TraditionalFlow: React.FC<{ d: number }> = ({ d }) => (
  <>
    <rect width="544" height="720" fill="#fcf5e3" />
    <rect
      x="197"
      y="103"
      width="150"
      height="32"
      rx="16"
      fill="#f8f4e8"
      stroke={C.ink}
      strokeWidth="1.6"
    />
    <text
      x="272"
      y="126"
      textAnchor="middle"
      fontFamily={sans}
      fontSize="16"
      fontWeight="600"
    >
      传统 vibe motion
    </text>
    <g transform={`translate(141 369) scale(${enter(d, 0.08)})`}>
      <rect
        x="-52"
        y="-56"
        width="104"
        height="112"
        rx="22"
        fill="#d5eae1"
        stroke={C.ink}
        strokeWidth="3"
        transform="rotate(-2)"
      />
      <Magnifier x={-6} y={-9} scale={0.46} />
      <text
        x="0"
        y="87"
        textAnchor="middle"
        fontFamily={sans}
        fontSize="21"
        fontWeight="650"
      >
        找参考
      </text>
    </g>
    <g opacity={fade(d, 0.44)}>
      <path
        d={`M205 369H${205 + 57 * fade(d, 0.44)}`}
        stroke={C.ink}
        strokeWidth="2.5"
      />
      <path
        d="M253 361L264 369L253 377"
        fill="none"
        stroke={C.ink}
        strokeWidth="2.5"
      />
    </g>
    <g transform={`translate(343 369) scale(${enter(d, 0.62)})`}>
      <rect
        x="-54"
        y="-56"
        width="108"
        height="112"
        rx="20"
        fill="#f0b7a2"
        stroke={C.ink}
        strokeWidth="3"
        transform="rotate(2)"
      />
      <rect
        x="-27"
        y="-22"
        width="55"
        height="43"
        rx="5"
        fill="#fff1d9"
        stroke={C.ink}
        strokeWidth="2"
      />
      <text
        x="0"
        y="10"
        textAnchor="middle"
        fontFamily="monospace"
        fontSize="31"
      >
        &lt;/&gt;
      </text>
      <text
        x="0"
        y="87"
        textAnchor="middle"
        fontFamily={sans}
        fontSize="19"
        fontWeight="650"
      >
        AI 代码复制
      </text>
      <rect
        x="-53"
        y="-106"
        width="106"
        height="28"
        rx="14"
        fill="#fffdf3"
        stroke={C.ink}
        strokeWidth="1.8"
      />
      <text x="0" y="-86" textAnchor="middle" fontFamily={sans} fontSize="14">
        词元 {Math.round(clamp((d - 0.7) / 1.1) * 1280)}k 🔥
      </text>
    </g>
    <circle cx="234" cy="225" r="4" fill="#a8d6bc" />
    <path d="M452 158l8 10m-1-12l-7 14" stroke="#dcc16f" strokeWidth="2" />
  </>
);

export const FirstHalf: React.FC<{
  t: number;
  sourceObjectTextures?: boolean;
}> = ({ t, sourceObjectTextures = true }) => {
  if (t < 20 || t >= 72) return null;
  let content: React.ReactNode;
  if (t < 22.8) content = <Idea d={t - 20} />;
  else if (t < 24.4) content = <ScriptDocument d={t - 22.8} />;
  else if (t < 26.35) content = <FindReference d={t - 24.4} />;
  else if (t < 28.65) content = <CodeConversion d={t - 26.35} />;
  else if (t < 31.08) content = <PromptReplace d={t - 28.65} />;
  else if (t < 33.3) content = <RemixTitle d={t - 31.08} />;
  else if (t < 41.15)
    content = (
      <OriginalRemix d={t - 33.3} sourceObjectTextures={sourceObjectTextures} />
    );
  else if (t < 43.3) content = <TwoChallenges d={t - 41.15} />;
  else if (t < 45.83) content = <RejectGrid d={t - 43.3} />;
  else if (t < 50.08) content = <TokenSink d={t - 45.83} />;
  else if (t < 53.45) content = <CompareBars d={t - 50.08} />;
  else if (t < 58.2) content = <PremiumCard d={t - 53.45} />;
  else if (t < 62.43) content = <CostColumns d={t - 58.2} />;
  else if (t < 65.53) content = <QuotaRing d={t - 62.43} />;
  else if (t < 68.67) content = <GalleryCamera d={t - 65.53} />;
  else if (t < 70.7) content = <WebsiteFocus d={t - 68.67} />;
  else content = <TraditionalFlow d={t - 70.7} />;
  return (
    <AbsoluteFill style={{ background: C.paper }}>
      <svg
        width="544"
        height="720"
        viewBox="0 0 544 720"
        style={{ fontFamily: sans, color: C.ink, overflow: "hidden" }}
      >
        <Definitions />
        <rect width="544" height="720" fill="url(#fh-paper)" />
        {content}
        <rect
          width="544"
          height="720"
          fill="url(#fh-grain)"
          pointerEvents="none"
          opacity=".25"
        />
      </svg>
    </AbsoluteFill>
  );
};
