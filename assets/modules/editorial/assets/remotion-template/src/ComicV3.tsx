import React from "react";
import { Img, staticFile } from "remotion";

// V3: reference-measured geometry. Only the independently cropped pixel avatar
// is raster material; every stage, stroke, prop, price and motion is editable.
const ink = "#29253f";
const font = "Noto Sans SC, sans-serif";
const clamp = (x: number) => Math.max(0, Math.min(1, x));
const ease = (x: number) => 1 - Math.pow(1 - clamp(x), 3);
const mix = (a: number, b: number, p: number) => a + (b - a) * p;
const pop = (x: number) => {
  const p = clamp(x);
  return 1 + 2.1 * Math.pow(p - 1, 3) + 1.1 * Math.pow(p - 1, 2);
};
const label = (x: number, y: number, text: string, size = 22, fill = ink) => (
  <text
    x={x}
    y={y}
    fontFamily={font}
    fontSize={size}
    fill={fill}
    fontWeight={800}
    textAnchor="middle"
  >
    {text}
  </text>
);

const Spark = ({
  x,
  y,
  s = 8,
  color = "#ffdb47",
  turn = 0,
}: {
  x: number;
  y: number;
  s?: number;
  color?: string;
  turn?: number;
}) => (
  <g transform={`translate(${x} ${y}) rotate(${turn})`}>
    <path
      d={`M0 ${-s}Q${s * 0.18} ${-s * 0.18} ${s} 0Q${s * 0.18} ${s * 0.18} 0 ${s}Q${-s * 0.18} ${s * 0.18} ${-s} 0Q${-s * 0.18} ${-s * 0.18} 0 ${-s}Z`}
      fill={color}
      stroke={ink}
      strokeWidth={1.4}
    />
  </g>
);

const Ground = ({
  bg,
  rays = false,
  dark = false,
  t,
  children,
}: {
  bg: string;
  rays?: boolean;
  dark?: boolean;
  t: number;
  children: React.ReactNode;
}) => (
  <g>
    <rect width={544} height={720} fill={bg} />
    {rays && (
      <g transform="translate(272 320)" opacity={dark ? 0.1 : 0.3}>
        {Array.from({ length: 22 }, (_, i) => {
          const a = (i * Math.PI) / 11,
            b = a + 0.125;
          return (
            <path
              key={i}
              d={`M0 0L${Math.sin(a) * 930} ${Math.cos(a) * 930}L${Math.sin(b) * 930} ${Math.cos(b) * 930}Z`}
              fill={dark ? "#d8caaa" : "#fff9da"}
            />
          );
        })}
      </g>
    )}
    <defs>
      <pattern
        id={`comic-v3-paper-${bg.slice(1)}`}
        width={27.2}
        height={27.2}
        patternUnits="userSpaceOnUse"
      >
        <circle
          cx={13.6}
          cy={13.6}
          r={1.5}
          fill={dark ? "#faf2df" : "#8b787a"}
          opacity={dark ? 0.08 : 0.11}
        />
      </pattern>
    </defs>
    <rect
      width={544}
      height={720}
      fill={`url(#comic-v3-paper-${bg.slice(1)})`}
    />
    <g opacity={0.95}>
      {(bg === "#d3f5ff"
        ? [
            [52, 292, 8],
            [153, 347, 9],
            [194, 481, 7],
            [462, 77, 12],
          ]
        : dark
          ? [
              [338, 67, 6],
              [394, 180, 10],
              [125, 261, 9],
            ]
          : bg === "#ccb9ff"
            ? [
                [241, 52, 7],
                [273, 132, 9],
                [36, 234, 6],
              ]
            : bg === "#ffd693"
              ? [
                  [234, 117, 6],
                  [467, 421, 6],
                ]
              : bg === "#ffdfdf"
                ? [
                    [24, 441, 8],
                    [456, 234, 6],
                  ]
                : bg === "#fff0ae"
                  ? [
                      [53, 110, 11],
                      [97, 132, 6],
                      [514, 377, 6],
                    ]
                  : []
      ).map(([x, y, size], i) => (
        <Spark
          key={i}
          x={x}
          y={y}
          s={size}
          color={
            dark
              ? "#ffdc4a"
              : ["#ffdc4a", "#f799bc", "#ffdc4a", "#89d9f2"][i % 4]
          }
          turn={Math.sin(t * 0.6 + i) * 8}
        />
      ))}
      {(bg === "#ffdfdf"
        ? [
            [20, 503, 5],
            [88, 466, 3],
            [389, 107, 4],
            [191, 410, 5],
          ]
        : bg === "#ccb9ff"
          ? [
              [131, 31, 5],
              [402, 148, 4],
            ]
          : bg === "#ffd693"
            ? [
                [366, 39, 3.5],
                [235, 425, 5],
              ]
            : dark
              ? [
                  [457, 390, 5],
                  [69, 519, 4],
                  [119, 213, 4],
                ]
              : bg === "#fff0ae"
                ? [
                    [389, 230, 5],
                    [88, 466, 3],
                  ]
                : []
      ).map(([x, y, r], i) => (
        <circle
          key={i}
          cx={x}
          cy={y}
          r={r}
          fill="none"
          stroke={dark ? "white" : ink}
          strokeWidth={2.2}
        />
      ))}
      {(bg === "#d3f5ff"
        ? [
            [263, 167],
            [460, 329],
            [158, 252],
            [448, 390],
          ]
        : bg === "#ccb9ff"
          ? [
              [179, 46],
              [45, 95],
            ]
          : bg === "#ffd693"
            ? [
                [31, 126],
                [394, 342],
              ]
            : []
      ).map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={2.5} fill={dark ? "white" : ink} />
      ))}
      <path
        d={
          bg === "#ffd693"
            ? "M69 97l8 7m-1 -9l-6 11M37 272l10 7m-2 -10l-6 11"
            : bg === "#ff5d63"
              ? ""
              : "M244 549l11 3m-7 -7l-2 11M456 250l12 5m-4 -9l-4 14"
        }
        stroke={dark ? "white" : ink}
        strokeWidth={2.3}
      />
    </g>
    {children}
  </g>
);

const Plaque = ({
  x,
  y,
  w,
  h = 46,
  fill = "white",
  angle = 0,
  children,
}: {
  x: number;
  y: number;
  w: number;
  h?: number;
  fill?: string;
  angle?: number;
  children: React.ReactNode;
}) => (
  <g transform={`translate(${x} ${y}) rotate(${angle})`}>
    <rect
      x={-w / 2 - 2}
      y={-h / 2 + 3}
      width={w}
      height={h}
      rx={h * 0.41}
      fill={fill}
      stroke={ink}
      strokeWidth={2.8}
    />
    <rect
      x={-w / 2}
      y={-h / 2}
      width={w}
      height={h}
      rx={h * 0.41}
      fill={fill}
      stroke={ink}
      strokeWidth={3.5}
    />
    <path d={`M${w * 0.11} ${h / 2}h10m12 0h7`} stroke={fill} strokeWidth={5} />
    {children}
  </g>
);

const Head = ({
  x,
  y,
  s = 1,
  color = "#fb79b5",
  hair = "#302247",
  worried = false,
  wave = false,
}: {
  x: number;
  y: number;
  s?: number;
  color?: string;
  hair?: string;
  worried?: boolean;
  wave?: boolean;
}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {wave && (
      <path d="M-13 15L-27 -55" stroke={ink} strokeWidth={3} fill="none" />
    )}
    <path
      d="M-26 38Q-26 10 0 10Q27 10 27 38Z"
      fill={color}
      stroke={ink}
      strokeWidth={2.5}
    />
    <path
      d="M-19 -6Q-24 -30 0 -30Q23 -30 21 -5Z"
      fill={hair}
      stroke={ink}
      strokeWidth={2.5}
    />
    <path
      d="M-20 -8Q0 -22 20 -8V-1Q18 18 0 19Q-20 17 -20 -8Z"
      fill="#ffe6c3"
      stroke={ink}
      strokeWidth={2.4}
    />
    <ellipse cx={-7.5} cy={-1} rx={2.2} ry={2.5} fill={ink} />
    <ellipse cx={8} cy={-1} rx={2.2} ry={2.5} fill={ink} />
    <circle cx={-13} cy={7} r={3.3} fill="#f59ead" />
    <circle cx={14} cy={7} r={3.3} fill="#f59ead" />
    {worried ? (
      <ellipse cy={10} rx={4} ry={5.5} fill={ink} />
    ) : (
      <path d="M-5 7Q0 13 6 7" fill="none" stroke={ink} strokeWidth={2} />
    )}
    {worried && (
      <path
        d="M21 -20Q30 -8 23 -2Q17 -6 21 -20Z"
        fill="#69caf0"
        stroke={ink}
        strokeWidth={1.4}
      />
    )}
  </g>
);

const Coin = ({
  x,
  y,
  r = 20,
  turn = 0,
  flip = 1,
}: {
  x: number;
  y: number;
  r?: number;
  turn?: number;
  flip?: number;
}) => (
  <g transform={`translate(${x} ${y}) rotate(${turn}) scale(${flip} 1)`}>
    <ellipse
      cx={3}
      rx={r * 0.73}
      ry={r}
      fill="#d3a723"
      stroke={ink}
      strokeWidth={r * 0.055}
    />
    <ellipse
      rx={r * 0.73}
      ry={r}
      fill="#ffdc44"
      stroke={ink}
      strokeWidth={r * 0.06}
    />
    <ellipse
      rx={r * 0.55}
      ry={r * 0.78}
      fill="none"
      stroke={ink}
      strokeWidth={r * 0.035}
      strokeDasharray={`${r * 0.16} ${r * 0.09}`}
    />
    <ellipse
      cx={-r * 0.2}
      cy={-r * 0.15}
      rx={r * 0.055}
      ry={r * 0.08}
      fill={ink}
    />
    <ellipse
      cx={r * 0.22}
      cy={-r * 0.15}
      rx={r * 0.055}
      ry={r * 0.08}
      fill={ink}
    />
    <path
      d={`M${-r * 0.2} ${r * 0.11}Q0 ${r * 0.4} ${r * 0.23} ${r * 0.11}`}
      fill="none"
      stroke={ink}
      strokeWidth={r * 0.055}
    />
    <path
      d={`M${r * 0.2} ${-r * 0.69}q${r * 0.15} ${r * 0.05} ${r * 0.18} ${r * 0.2}`}
      fill="none"
      stroke="white"
      strokeWidth={r * 0.06}
    />
  </g>
);

const glyphs: Record<string, string> = {
  "0": "M3 2L22 0L20 33L0 35Z",
  "1": "M5 8L14 0L11 35",
  "2": "M0 8L6 0L23 3L21 16L0 33L22 32",
  "3": "M0 5L21 0L13 16L23 21L18 34L0 31",
  "4": "M16 0L0 21L23 19M17 12L14 35",
  "5": "M23 0L3 1L0 17L18 15L21 30L1 35",
  "6": "M21 0L3 8L0 32L19 35L23 18L1 16",
  "7": "M0 1L23 0L7 35",
  "8": "M3 0L22 2L20 15L1 16ZM1 16L20 15L23 34L0 35Z",
  "9": "M21 17L0 13L4 0L24 2L18 35",
  S: "M26 1L4 3L2 19L22 22L22 39L0 38",
  s: "M24 10L3 12L3 23L22 26L20 39L0 38",
  o: "M1 13L24 10L25 38L0 39Z",
  c: "M23 10L1 12L1 38L24 38",
  i: "M9 14L8 39M9 1L9 5",
  a: "M1 13L22 11L22 39L0 38L0 27L21 24",
  l: "M8 0L6 39",
  m: "M0 39L1 13L25 11L26 39M13 13L13 37",
  "!": "M9 0L8 25M7 34L7 39",
  f: "M18 0L8 2L8 39M0 14L22 13",
  r: "M2 39L2 13L20 11",
  "¥": "M0 0L12 13L24 0M2 16H23M2 22H23M12 13V35",
  ",": "M6 30L4 40",
  ".": "M7 32L7 35",
};
const RoughLetters = ({
  text,
  x,
  y,
  size = 1,
  color = "#ffdd49",
  rotate = 0,
  gap = 33,
}: {
  text: string;
  x: number;
  y: number;
  size?: number;
  color?: string;
  rotate?: number;
  gap?: number;
}) => (
  <g transform={`translate(${x} ${y}) rotate(${rotate}) scale(${size})`}>
    {text.split("").map((c, i) => (
      <g
        key={i}
        transform={`translate(${i * gap} ${[0, -1, 1, 0][i % 4]}) rotate(${[-4, 2, 0, 4][i % 4]})`}
      >
        <path
          d={glyphs[c] ?? glyphs["0"]}
          fill="none"
          stroke={ink}
          strokeWidth={10}
          strokeLinejoin="miter"
          strokeLinecap="square"
        />
        <path
          d={glyphs[c] ?? glyphs["0"]}
          fill="none"
          stroke={color}
          strokeWidth={5.4}
          strokeLinejoin="miter"
          strokeLinecap="square"
        />
      </g>
    ))}
  </g>
);

const Creator = ({ t }: { t: number }) => {
  const a = t - 114.27;
  const enter = pop(a / 0.34);
  return (
    <Ground bg="#ccb9ff" rays t={t}>
      <g transform={`translate(272 285) scale(${enter})`}>
        <circle cx={-3} cy={9} r={122} fill="#ffdb49" />
        <defs>
          <clipPath id="comic-v3-cat">
            <circle r={114} />
          </clipPath>
        </defs>
        <circle r={121} fill="#aa8aed" />
        <g clipPath="url(#comic-v3-cat)">
          <foreignObject x={-122} y={-122} width={243} height={229}>
            <Img
              src={staticFile("reference-assets/comic-v3/pixel-cat-avatar.png")}
              style={{ width: 243, height: 229, imageRendering: "pixelated" }}
            />
          </foreignObject>
        </g>
        <path
          d="M-52 -111A121 121 0 1 1-122 25"
          fill="none"
          stroke={ink}
          strokeWidth={4.5}
        />
        <path d="M-81 -93L-71 -101" stroke={ink} strokeWidth={5} />
      </g>
      <g
        transform={`translate(370 161) rotate(15) scale(${pop((a - 0.2) / 0.35)})`}
      >
        <path
          d="M-50 -18L-24 4L-6 -29L20 2L46 -15L37 24L-45 23Z"
          fill="#ffdc4a"
          stroke={ink}
          strokeWidth={3.5}
        />
        <circle
          cx={-6}
          cy={-29}
          r={5.5}
          fill="#fa83b1"
          stroke={ink}
          strokeWidth={2}
        />
        <path d="M42 -10l3 -7" stroke={ink} strokeWidth={2.5} />
      </g>
      <g transform={`translate(272 407) scale(${pop((a - 0.12) / 0.3)})`}>
        <path
          d="M-153 -19L-190 1L-176 12L-191 26L-145 37M153 -19L190 1L176 12L191 27L145 37"
          fill="#cf538d"
          stroke={ink}
          strokeWidth={3}
        />
        <path
          d="M-157 -25Q0 -33 157 -22L157 34Q0 12 -157 33Z"
          fill="#fa7eb4"
          stroke={ink}
          strokeWidth={3.5}
        />
        <text
          x={0}
          y={12}
          textAnchor="middle"
          fontSize={33}
          fontWeight={900}
          fontFamily={font}
          fill="white"
          stroke={ink}
          strokeWidth={4}
          paintOrder="stroke"
        >
          社区发起人
        </text>
        <path d="M84 23h9m11 1h16" stroke={ink} strokeWidth={3} />
      </g>
      <Plaque
        x={mix(134, 157, ease((a - 0.9) / 0.6))}
        y={127}
        w={147}
        h={48}
        angle={-5}
      >
        {label(0, 8, "@猫学长", 22)}
      </Plaque>
      <Spark x={116} y={232} s={17} color="#ff86bb" />
      <Spark x={431} y={233} s={18} color="#69d6ef" />
      <g
        transform={`translate(-65 ${mix(434, 487, ease((a - 0.9) / 0.8))}) rotate(-4)`}
      >
        <rect x={-20} width={730} height={119} fill={ink} />
        {Array.from({ length: 52 }, (_, i) => (
          <g key={i}>
            <rect x={i * 22} y={6} width={11} height={8} rx={2} fill="white" />
            <rect
              x={i * 22}
              y={104}
              width={11}
              height={8}
              rx={2}
              fill="white"
            />
          </g>
        ))}
        <g>
          {Array.from({ length: 8 }, (_, i) => {
            const x = ((i * 116 - a * 45 + 1100) % 928) - 116;
            return (
              <g key={i} transform={`translate(${x} 23)`}>
                <rect
                  width={102}
                  height={75}
                  rx={7}
                  fill={
                    ["#ffdd46", "#57c4f3", "#65d874", "#ffab47", "#a480f5"][
                      i % 5
                    ]
                  }
                />
                {label(51, 48, ["★", "●", "</>", "▲", "♥"][i % 5], 29)}
              </g>
            );
          })}
        </g>
      </g>
      {a > 1.65 && (
        <Plaque x={449} y={584} w={126} h={39} fill="#ffda45" angle={7}>
          {label(0, 8, "所有视频", 20)}
        </Plaque>
      )}
    </Ground>
  );
};

const Microphone = ({ t }: { t: number }) => {
  const a = t - 121.55;
  const sway = Math.sin(a * 5) * 1.1;
  return (
    <Ground bg="#ffd693" t={t}>
      <g transform={`rotate(${sway} 272 397)`}>
        <path
          d="M205 369Q204 445 270 445Q337 445 338 369"
          fill="none"
          stroke={ink}
          strokeWidth={6}
        />
        <path d="M271 445L269 542" stroke={ink} strokeWidth={7} />
        <path
          d="M193 560Q197 540 270 541Q338 539 345 561Z"
          fill="#7d7b96"
          stroke={ink}
          strokeWidth={3.5}
        />
        <path d="M195 560L311 561m9 0h9m6 0h6" stroke={ink} strokeWidth={3.5} />
        <path
          d="M206 551Q265 539 324 552"
          stroke="#c7c4db"
          strokeWidth={2.5}
          fill="none"
        />
        <path
          d="M224 303C224 238 320 239 320 303L321 369Q321 406 274 407Q221 408 222 369Z"
          fill="#b6b2c9"
          stroke={ink}
          strokeWidth={4.5}
        />
        <path
          d="M242 293Q245 281 254 281M260 279h.5"
          stroke="white"
          strokeWidth={3.5}
          fill="none"
        />
        {[291, 311, 330, 351].map((y) => (
          <path
            key={y}
            d={`M244 ${y}H303`}
            stroke="#625d74"
            strokeWidth={2.7}
          />
        ))}
        <path
          d="M222 360H322V375H222Z"
          fill="#ff5968"
          stroke={ink}
          strokeWidth={3}
        />
        <path
          d="M229 384l2 5m5 6l3 3"
          stroke={ink}
          strokeWidth={3}
          fill="none"
        />
        {[-1, 1].map((s) => (
          <g key={s} transform={`translate(272 0) scale(${s} 1)`}>
            {[0, 1, 2].map((n) => (
              <path
                key={n}
                d={`M${90 + n * 20} ${274 - n * 13}Q${114 + n * 20} 340 ${89 + n * 20} ${407 + n * 13}`}
                fill="none"
                stroke={ink}
                strokeWidth={4.1}
                opacity={(0.86 - n * 0.28) * (0.9 + 0.1 * Math.sin(a * 8 - n))}
              />
            ))}
          </g>
        ))}
      </g>
      <g
        transform={`translate(385 173) rotate(5) scale(${pop((a - 0.1) / 0.32)})`}
      >
        <path
          d="M-95 -48Q-95 -62 -75 -60L81 -60Q99 -59 99 -41L99 34Q99 51 82 52L-28 52L-63 77L-58 49L-80 49Q-96 48 -95 31Z"
          fill="white"
          stroke={ink}
          strokeWidth={4}
        />
        <path d="M10 51h11m15 0h10" stroke="white" strokeWidth={6} />
        {[-40, 0, 40].map((x, i) => (
          <circle
            key={x}
            cx={x}
            cy={-13}
            r={12}
            fill={["#ff83bc", "#ffdb4a", "#61cdf6"][i]}
            stroke={ink}
            strokeWidth={3}
          />
        ))}
      </g>
      <Spark x={111} y={150} s={18} color="white" turn={-24} />
      <Spark x={168} y={423} s={8} color="#fa8dbb" />
      <Spark x={523} y={519} s={9} color="white" />
    </Ground>
  );
};

const Cost = ({ t }: { t: number }) => {
  const a = t - 125.2;
  const grow = ease((a - 0.34) / 1.65);
  const priceKeys = [
    [0.3, 0.01],
    [0.8, 287.78],
    [1.5, 2685],
    [2.1, 8186],
    [2.5, 9999],
  ];
  let countPrice = 0.01;
  for (let n = 1; n < priceKeys.length; n++) {
    if (a >= priceKeys[n - 1][0])
      countPrice = mix(
        priceKeys[n - 1][1],
        priceKeys[n][1],
        clamp(
          (a - priceKeys[n - 1][0]) / (priceKeys[n][0] - priceKeys[n - 1][0]),
        ),
      );
  }
  countPrice = Math.round(countPrice);
  const price = a < 0.4 ? "¥0.01" : `¥${countPrice.toLocaleString("en-US")}`;
  const w = mix(350, 264, ease((a - 0.32) / 0.44));
  const signScale = mix(1.05, 0.91, ease((a - 0.32) / 0.44));
  const signAngle = -Math.sin(a * 8) * 7 * Math.exp(-a * 0.6);
  return (
    <Ground bg="#ffdfdf" t={t}>
      <g transform={`translate(276 145) rotate(${signAngle})`}>
        <path d="M0 -91V-43" stroke={ink} strokeWidth={2.5} />
        <rect
          x={-w / 2}
          y={-48}
          width={w}
          height={100}
          rx={8}
          fill="white"
          stroke={ink}
          strokeWidth={4}
        />
        <circle cy={-31} r={6} fill="none" stroke={ink} strokeWidth={2.7} />
        <path d={`M${-w * 0.27} 52h12m14 0h9`} stroke="white" strokeWidth={6} />
        <RoughLetters
          text={price}
          x={(-price.length * 25 * signScale) / 2}
          y={-3}
          gap={25}
          size={signScale * 1.02}
          color={countPrice > 7000 ? "#ff626d" : "#ffdd49"}
        />
      </g>
      {a > 0.58 && (
        <Head
          x={71}
          y={249}
          s={1.16 * pop((a - 0.58) / 0.28)}
          color="#f884ba"
          hair="#865229"
          worried
        />
      )}
      <path d="M41 567H503" stroke={ink} strokeWidth={3.8} />
      {[0, 1, 2, 3].map((n) => {
        const count = 2 + Math.round([2, 5, 9, 14][n] * grow);
        return (
          <g key={n}>
            {Array.from({ length: count }, (_, k) => {
              const y = 551 - k * 12;
              return (
                <g key={k}>
                  <path
                    d={`M${59 + n * 106} ${y - 4}v10C${59 + n * 106} ${y + 22} ${132 + n * 106} ${y + 22} ${132 + n * 106} ${y + 6}v-10Z`}
                    fill="#e9b627"
                    stroke={ink}
                    strokeWidth={2.6}
                  />
                  <ellipse
                    cx={95 + n * 106}
                    cy={y - 3}
                    rx={36.5}
                    ry={12}
                    fill="#ffdf50"
                    stroke={ink}
                    strokeWidth={2.6}
                  />
                </g>
              );
            })}
            <text
              x={96 + n * 106}
              y={551 - (count - 1) * 12 + 1}
              textAnchor="middle"
              fontSize={16}
              fontFamily={font}
              fontWeight={600}
              fill={ink}
              transform={`rotate(2 ${96 + n * 106} ${551 - (count - 1) * 12})`}
            >
              Token
            </text>
          </g>
        );
      })}
      <path
        d="M49 501L105 465L204 429L308 377L410 309L462 246"
        fill="none"
        stroke={ink}
        strokeWidth={13}
        pathLength={1}
        strokeDasharray={1}
        strokeDashoffset={1 - ease((a - 0.73) / 1.28)}
      />
      <path
        d="M49 501L105 465L204 429L308 377L410 309L462 246"
        fill="none"
        stroke="#ff767d"
        strokeWidth={7}
        pathLength={1}
        strokeDasharray={1}
        strokeDashoffset={1 - ease((a - 0.73) / 1.28)}
      />
      {a > 1.5 && (
        <path
          d="M445 248L473 252L476 274"
          fill="none"
          stroke={ink}
          strokeWidth={4}
        />
      )}
      <g opacity={ease((a - 1.05) / 0.2)}>
        <Plaque x={442} y={235} w={111} h={45} fill="#ff6572" angle={8}>
          {label(0, 7, "越来越贵", 20, "white")}
        </Plaque>
      </g>
    </Ground>
  );
};

const Chip = ({
  x,
  y,
  s = 1,
  pins = true,
}: {
  x: number;
  y: number;
  s?: number;
  pins?: boolean;
}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {pins &&
      [-18, -6, 6, 18].map((p) => (
        <path
          key={p}
          d={`M${p} -35v8M${p} 27v8M-35 ${p}h8M27 ${p}h8`}
          stroke={ink}
          strokeWidth={2}
        />
      ))}
    <rect
      x={-30}
      y={-29}
      width={60}
      height={60}
      rx={8}
      fill="#a79348"
      stroke={ink}
      strokeWidth={2}
    />
    <rect
      x={-26}
      y={-32}
      width={59}
      height={61}
      rx={8}
      fill="#ffdf56"
      stroke={ink}
      strokeWidth={2}
    />
    <rect x={-12} y={-17} width={31} height={33} rx={4} fill="#514d61" />
    {label(3, 6, "AI", 17, "white")}
    <path
      d="M-26 -27v45q0 6 6 6H0m7 0h5m6 0h5"
      stroke="#f4e4a2"
      strokeWidth={2.3}
      fill="none"
    />
  </g>
);
const Ban = ({
  x,
  y,
  r,
  s = 1,
}: {
  x: number;
  y: number;
  r: number;
  s?: number;
}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <circle r={r} fill="none" stroke={ink} strokeWidth={34} />
    <circle r={r} fill="none" stroke="#ff5b62" strokeWidth={28} />
    <path
      d={`M${-r * 0.75} ${-r * 0.61}L${r * 0.75} ${r * 0.61}`}
      stroke={ink}
      strokeWidth={35}
    />
    <path
      d={`M${-r * 0.75} ${-r * 0.61}L${r * 0.75} ${r * 0.61}`}
      stroke="#ff5b62"
      strokeWidth={29}
    />
  </g>
);

const Consumable = ({ t }: { t: number }) => {
  const a = t - 129.67;
  const drop = ease((a - 1.03) / 0.39);
  const ban = pop((a - 1.82) / 0.28);
  const hidden = drop >= 1;
  return (
    <Ground bg="#d3f5ff" t={t}>
      <Plaque x={272} y={110} w={191} h={49} fill="#ffa44b" angle={-4}>
        {label(0, 8, "一次性消费品?", 23, "white")}
      </Plaque>
      <g transform="translate(434 548)">
        <path
          d="M-63 -44L-51 49Q-50 60 -40 60H39Q49 60 50 49L60 -43Z"
          fill="#7f7a94"
          stroke={ink}
          strokeWidth={3.5}
        />
        <path d="M-62 -42l9 86" stroke="#aba7bd" strokeWidth={3} />
        <rect
          x={-71}
          y={-58}
          width={141}
          height={19}
          rx={6}
          fill="#a9a3bf"
          stroke={ink}
          strokeWidth={3.5}
        />
        <path d="M-66 -44H25m8 0h7m8 0h10" stroke={ink} strokeWidth={3} />
        <path d="M57 4v8m-2 9v6" stroke={ink} strokeWidth={3} />
      </g>
      {!hidden && (
        <g
          transform={`translate(${mix(272 + 15 * ease((a - 0.63) / 0.4), 434, drop)} ${mix(299 - 14 * ease((a - 0.63) / 0.4), 500, drop)}) rotate(${Math.sin((a - 0.7) * 6) * 10 + drop * 80}) scale(${mix(1 - 0.18 * ease((a - 0.63) / 0.4), 0.18, drop)})`}
        >
          <path
            d="M-78 -75H77L60 91H-56Z"
            fill="white"
            stroke={ink}
            strokeWidth={3.5}
          />
          <path d="M-72 -28H72L67 20H-66Z" fill="#4ec1ef" />
          <path
            d="M-58 -54L-29 -20L-53 4M39 -62L9 -14L49 28M-8 70L8 82L-14 94"
            fill="none"
            stroke={ink}
            strokeWidth={1.8}
          />
          <rect
            x={-85}
            y={-87}
            width={173}
            height={18}
            rx={6}
            fill="#bcb8ce"
            stroke={ink}
            strokeWidth={3.5}
          />
          <path
            d="M18 -69h9m8 0h6M-16 91h13m13 0h8"
            stroke="white"
            strokeWidth={5}
          />
          <Chip x={0} y={-7} s={0.59} />
          {label(0, 66, "算力", 21)}
        </g>
      )}
      {hidden && a < 1.76 && (
        <g stroke={ink} strokeWidth={3.8}>
          <path d="M434 469v-15M415 478l-12 -11M455 478l11 -11M414 523l-12 12M455 523l12 12M434 532v15" />
        </g>
      )}
      {a > 1.8 && (
        <g transform={`translate(273 326) scale(${ban})`}>
          <path
            d="M-38 -43H36L25 42H-25Z"
            fill="white"
            stroke={ink}
            strokeWidth={2.5}
          />
          <rect
            x={-40}
            y={-51}
            width={79}
            height={10}
            rx={3}
            fill="#b4b1c7"
            stroke={ink}
            strokeWidth={2.5}
          />
          <Ban x={0} y={0} r={105} />
        </g>
      )}
    </Ground>
  );
};

const Luxury = ({ t }: { t: number }) => {
  const a = t - 132.47;
  return (
    <Ground bg="#30274e" rays dark t={t}>
      <g transform={`translate(273 376) scale(${pop(a / 0.32)})`}>
        <rect
          x={-112}
          y={75}
          width={222}
          height={115}
          rx={12}
          fill="#853064"
          stroke={ink}
          strokeWidth={4}
        />
        <path
          d="M-107 79v98q0 9 12 9H12m11 0h12m14 0h59"
          fill="none"
          stroke="#a94278"
          strokeWidth={3}
        />
        <path
          d="M-101 124H92M-101 154H92"
          stroke="#ffda4f"
          strokeWidth={3}
          strokeDasharray="1 9"
        />
        <path
          d="M-122 75V-53Q-123 -164 -1 -164Q122 -164 121 -55V76"
          fill="#d7d8f2"
          fillOpacity={0.17}
          stroke="white"
          strokeWidth={4}
        />
        <path
          d="M-121 -53Q-121 -137 -58 -140"
          fill="none"
          stroke="#e2ddef"
          strokeWidth={4}
        />
        <path d="M31 -161l14 2" stroke="#30274e" strokeWidth={7} />
        <circle
          cy={-173}
          r={10}
          fill="#ffdd50"
          stroke="white"
          strokeWidth={2.3}
        />
        <Chip x={-5} y={-4} s={1.26} pins={false} />
        <rect
          x={-126}
          y={72}
          width={252}
          height={28}
          rx={9}
          fill="#bc377c"
          stroke={ink}
          strokeWidth={3.5}
        />
        <path d="M-123 98H44m15 0h8m12 0h14" stroke={ink} strokeWidth={3} />
      </g>
      <Plaque x={273} y={128} w={250} h={64} fill="#ffdc46" angle={-6}>
        <RoughLetters text="¥99,999,999" x={-98} y={-11} size={0.56} gap={36} />
      </Plaque>
      <g transform="translate(420 498) rotate(11)">
        <path
          d="M-30 -17L-12 -25L24 -22L33 -7L0 33Z"
          fill="#99def5"
          stroke={ink}
          strokeWidth={2.7}
        />
        <path
          d="M-30 -17L33 -7M-12 -25L0 33L24 -22"
          fill="none"
          stroke={ink}
          strokeWidth={2}
        />
      </g>
      <Plaque x={100} y={579} w={116} h={42} angle={-8}>
        {label(0, 8, "奢侈品?", 22)}
      </Plaque>
      <Spark x={422} y={299} s={12} color="white" />
      <Spark x={150} y={414} s={11} color="white" />
      {a > 1.12 && <Ban x={273} y={358} r={144} s={pop((a - 1.12) / 0.26)} />}
    </Ground>
  );
};

const Sharing = ({ t }: { t: number }) => {
  const a = t - 134.3;
  return (
    <Ground bg="#fff0ae" rays t={t}>
      <Plaque x={272} y={101} w={313} h={72}>
        <text
          x={0}
          y={14}
          textAnchor="middle"
          fontFamily={font}
          fontSize={35}
          fontWeight={900}
          fill="#ffdc45"
          stroke={ink}
          strokeWidth={4.5}
          paintOrder="stroke"
        >
          词元共享
        </text>
        <path d="M-69 14l3 -2" stroke="white" strokeWidth={1} />
      </Plaque>
      <ellipse
        cx={272}
        cy={351}
        rx={204}
        ry={75}
        fill="none"
        stroke={ink}
        strokeWidth={4.3}
        strokeDasharray="1 13"
      />
      <ellipse cx={272} cy={357} rx={61} ry={13} fill={ink} opacity={0.15} />
      {[
        { x: 120, y: 290, c: "#f8d648", h: "#53406c" },
        { x: 406, y: 284, c: "#ff9c51", h: "#885531" },
        { x: 473, y: 329, c: "#f47eb4", h: "#ff9d4e" },
        { x: 424, y: 387, c: "#54c8f2", h: "#3c2755" },
        { x: 285, y: 412, c: "#f584bb", h: "#342246" },
        { x: 141, y: 393, c: "#52c8f2", h: "#81502e" },
        { x: 71, y: 340, c: "#69d377", h: "#ffac52" },
      ].map((p, i) => (
        <Head
          key={i}
          x={p.x}
          y={p.y}
          s={pop((a - i * 0.055) / 0.28)}
          color={p.c}
          hair={p.h}
        />
      ))}
      <Coin x={272} y={300} r={67} flip={0.92 + Math.sin(a * 3) * 0.06} />
      {Array.from({ length: 7 }, (_, n) => {
        const ang = a * 1.7 + (n * Math.PI * 2) / 7;
        const x = 272 + Math.cos(ang) * 122,
          y = 272 + Math.sin(ang) * 60;
        return (
          <Coin
            key={n}
            x={x}
            y={y}
            r={14}
            flip={0.3 + 0.7 * Math.abs(Math.cos(ang))}
            turn={Math.sin(ang) * 12}
          />
        );
      })}
      <g transform="translate(166 555) rotate(3)">
        <rect
          x={-22}
          y={-21}
          width={43}
          height={43}
          rx={11}
          fill="#b394f8"
          stroke={ink}
          strokeWidth={2.5}
        />
        <circle cx={-8} cy={-2} r={2.5} fill={ink} />
        <circle cx={6} cy={-2} r={2.5} fill={ink} />
        <path
          d="M-10 8Q-2 17 10 8"
          fill="none"
          stroke={ink}
          strokeWidth={2.4}
        />
        <path
          d="M-17 -9q0 -6 5 -7"
          stroke="white"
          strokeWidth={2}
          fill="none"
        />
      </g>
      <text
        x={342}
        y={569}
        textAnchor="middle"
        fontFamily="monospace"
        fontSize={28}
        fontWeight={700}
        fill={ink}
        transform="rotate(1 342 569)"
      >
        Motionface · 新模式
      </text>
    </Ground>
  );
};

const StarFace = ({ t }: { t: number }) => {
  const a = t - 137.67;
  const turn = mix(24, 0, ease((a - 0.02) / 0.83)) + Math.sin(a * 3) * 1.5;
  const y = 272 + Math.sin(a * 5) * 5;
  const pts =
    "0,-130 35,-49 125,-44 60,16 79,101 0,55 -73,111 -54,27 -121,-34 -31,-43";
  return (
    <g transform={`translate(272 ${y}) rotate(${turn})`}>
      <polygon
        points={pts}
        fill="#ffdc42"
        stroke={ink}
        strokeWidth={5}
        strokeLinejoin="round"
      />
      <path d="M-71 100l9 -4" stroke="#ffdc42" strokeWidth={7} />
      <path d="M-72 100l5 -3M-51 78l7 -39" stroke={ink} strokeWidth={5} />
      <ellipse cx={-20} cy={2} rx={7} ry={7.5} fill={ink} />
      <ellipse cx={20} cy={2} rx={7} ry={7.5} fill={ink} />
      <circle cx={-37} cy={18} r={7} fill="#f58c92" />
      <circle cx={36} cy={18} r={7} fill="#f58c92" />
      <path d="M-14 20Q0 37 16 20" fill="none" stroke={ink} strokeWidth={4} />
      <path
        d="M-30 -34Q-28 -53 -14 -61M-9 -65h.5"
        stroke="white"
        strokeWidth={6}
        fill="none"
      />
    </g>
  );
};
const Celebrate = ({ t }: { t: number }) => {
  const a = t - 137.67;
  const title = "Socialism!";
  return (
    <g>
      <Ground bg="#ff5d63" rays t={t}>
        {Array.from({ length: 59 }, (_, n) => {
          const randomX = Math.sin(n * 127.1 + 3) * 43758.5453;
          const randomY = Math.sin(n * 311.7 + 19) * 23748.5453;
          const x = 9 + (randomX - Math.floor(randomX)) * 526,
            y =
              (((randomY - Math.floor(randomY)) * 758 +
                a * (30 + (n % 5) * 11)) %
                758) -
              20;
          return (
            <rect
              key={n}
              x={x}
              y={y}
              width={6 + (n % 3) * 2}
              height={12}
              rx={1.5}
              fill={
                ["#ffdb47", "#65cdf2", "#6dda81", "#fca1cf", "white"][n % 5]
              }
              stroke={ink}
              strokeWidth={1.1}
              transform={`rotate(${n * 31 + a * 28} ${x} ${y})`}
            />
          );
        })}
        <StarFace t={t} />
        {"for".split("").map((c, i) => {
          const p = ease((a - 0.08 - i * 0.07) / 1.13),
            x = mix(272 + Math.sin(i * 3) * 185, 231 + i * 29, p),
            y = mix(664 + i * 66, 417, p);
          return (
            <RoughLetters
              key={i}
              text={c}
              x={x}
              y={y}
              size={0.98}
              color="white"
              rotate={(1 - p) * [-80, 65, -110][i]}
            />
          );
        })}
        {title.split("").map((c, i) => {
          const p = ease((a - 0.13 - i * 0.045) / 1.2);
          const x = mix(63 + ((i * 83) % 439), 108 + i * 35, p),
            y = mix(744 + (i % 3) * 95, 471, p);
          return (
            <RoughLetters
              key={i}
              text={c}
              x={x}
              y={y}
              size={1.2}
              color="#ffdc47"
              rotate={mix(
                [-75, 36, 83, -24, 54, -39][i % 6],
                [-6, 3, -3, -6, 4, 1, -3, 4, -5, 6][i],
                p,
              )}
            />
          );
        })}
        {[76, 174, 272, 372, 469].map((x, i) => {
          const p = ease((a - 0.16 - i * 0.065) / 0.9),
            y = mix(790 + (i % 2) * 90, 583, p);
          return (
            <g key={i}>
              <Head
                x={x}
                y={y}
                s={0.93}
                color={
                  ["#ffdc4b", "#57c7f1", "#6ddc79", "#f38cbf", "#9d88fa"][i]
                }
                hair={
                  ["#27213f", "#976037", "#ee983d", "#52406c", "#27213f"][i]
                }
                wave
              />
              <Coin
                x={x - 29}
                y={y - 76}
                r={15}
                flip={0.35 + 0.65 * Math.abs(Math.sin(a * 2 + i))}
              />
            </g>
          );
        })}
        <path
          d="M52 101h17m-8 -8v17M476 151h17m-8 -8v17"
          stroke="white"
          strokeWidth={2.4}
        />
      </Ground>
      <rect
        width={544}
        height={720}
        fill="black"
        opacity={clamp((t - 140.27) / 0.23)}
      />
    </g>
  );
};

/** Scene IDs match SecondHalf. Return null to keep unmodified scenes. */
export const comicV3Scene = (id: string, t: number): React.ReactNode | null => {
  if (id === "founder") return <Creator t={t} />;
  if (id === "microphone") return <Microphone t={t} />;
  if (id === "cost") return <Cost t={t} />;
  if (id === "consumable") return <Consumable t={t} />;
  if (id === "luxury") return <Luxury t={t} />;
  if (id === "sharing") return <Sharing t={t} />;
  if (id === "celebration") return <Celebrate t={t} />;
  return null;
};
