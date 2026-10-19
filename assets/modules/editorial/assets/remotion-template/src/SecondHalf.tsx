import React from "react";
import { Img, staticFile } from "remotion";
import { webUIV3Scene } from "./WebUIV3";
import { comicV3Scene } from "./ComicV3";

// Native layout and animation with replaceable, locally cropped page content.
// Browser shells, phone controls, reactions and transitions remain editable.
const I = "#282338";
const C = {
  cream: "#fff8dc",
  blue: "#a9e5f8",
  violet: "#e5d6fb",
  mint: "#c3f5df",
  peach: "#ffd697",
  pink: "#fbdade",
  yellow: "#fff29a",
  dark: "#282043",
  coral: "#f65362",
  green: "#77ed85",
  white: "#fffefa",
  gold: "#ffda57",
};
const clamp = (v: number) => Math.max(0, Math.min(1, v));
const ease = (v: number) => {
  const p = clamp(v);
  return 1 - Math.pow(1 - p, 3);
};
const inOut = (v: number) => {
  const p = clamp(v);
  return p * p * (3 - 2 * p);
};
const pop = (v: number) => {
  const p = clamp(v);
  return p === 0 ? 0 : 1 + 2.1 * Math.pow(p - 1, 3) + 1.1 * Math.pow(p - 1, 2);
};
const enter = (age: number, delay = 0, duration = 0.36) =>
  pop((age - delay) / duration);
const mix = (a: number, b: number, v: number) => a + (b - a) * v;
const font = "Noto Sans SC, sans-serif";
const serif = "Noto Serif SC, serif";

const Txt: React.FC<{
  x: number;
  y: number;
  size?: number;
  fill?: string;
  bold?: boolean;
  anchor?: "start" | "middle" | "end";
  children: React.ReactNode;
}> = ({
  x,
  y,
  size = 18,
  fill = I,
  bold = false,
  anchor = "middle",
  children,
}) => (
  <text
    x={x}
    y={y}
    textAnchor={anchor}
    fontFamily={font}
    fontSize={size}
    fontWeight={bold ? 800 : 500}
    fill={fill}
    stroke="none"
  >
    {children}
  </text>
);

const Star: React.FC<{
  x: number;
  y: number;
  r?: number;
  fill?: string;
  turn?: number;
  smile?: boolean;
}> = ({ x, y, r = 14, fill = C.gold, turn = 0, smile = false }) => {
  const pts = Array.from({ length: 10 }, (_, n) => {
    const a = (n * Math.PI) / 5 - Math.PI / 2;
    const rr = r * (n % 2 ? 0.45 : 1);
    return `${Math.cos(a) * rr},${Math.sin(a) * rr}`;
  }).join(" ");
  return (
    <g transform={`translate(${x} ${y}) rotate(${turn})`}>
      <polygon
        points={pts}
        fill={fill}
        stroke={I}
        strokeWidth={Math.max(1.3, r / 28)}
        strokeLinejoin="round"
      />
      {smile && (
        <g fill={I} stroke="none">
          <circle cx={-r * 0.2} cy={-r * 0.05} r={r * 0.035} />
          <circle cx={r * 0.2} cy={-r * 0.05} r={r * 0.035} />
          <path
            d={`M ${-r * 0.15} ${r * 0.12} Q 0 ${r * 0.3} ${r * 0.15} ${r * 0.12}`}
            fill="none"
            stroke={I}
            strokeWidth={r / 35}
            strokeLinecap="round"
          />
        </g>
      )}
    </g>
  );
};

const Sticker: React.FC<{
  x: number;
  y: number;
  w: number;
  h?: number;
  text: string;
  fill?: string;
  angle?: number;
  size?: number;
  scale?: number;
  ink?: string;
}> = ({
  x,
  y,
  w,
  h = 38,
  text,
  fill = C.white,
  angle = 0,
  size = 17,
  scale = 1,
  ink = I,
}) => (
  <g transform={`translate(${x} ${y}) rotate(${angle}) scale(${scale})`}>
    <rect
      x={-w / 2 + 3}
      y={-h / 2 + 4}
      width={w}
      height={h}
      rx={h / 2.6}
      fill={I}
      opacity={0.15}
    />
    <rect
      x={-w / 2}
      y={-h / 2}
      width={w}
      height={h}
      rx={h / 2.6}
      fill={fill}
      stroke={I}
      strokeWidth={2.5}
    />
    <Txt x={0} y={size * 0.35} size={size} fill={ink} bold>
      {text}
    </Txt>
  </g>
);

const Doodles: React.FC<{ t: number; light?: boolean }> = ({
  t,
  light = false,
}) => (
  <g opacity={0.85}>
    {Array.from({ length: 28 }, (_, n) => {
      const x = 19 + ((n * 107) % 509);
      const y = 35 + ((n * 151) % 590);
      if (x > 135 && x < 410 && y > 170 && y < 560) return null;
      const s = 3 + (n % 3) * 2;
      const turn = Math.sin(t * 0.65 + n) * 12;
      return n % 3 === 0 ? (
        <Star
          key={n}
          x={x}
          y={y}
          r={s + 2}
          turn={turn}
          fill={[C.gold, C.blue, C.pink, C.white][n % 4]}
        />
      ) : n % 3 === 1 ? (
        <circle
          key={n}
          cx={x}
          cy={y}
          r={s / 2}
          fill="none"
          stroke={light ? C.white : I}
          strokeWidth={1}
        />
      ) : (
        <path
          key={n}
          d={`M${x - s} ${y}h${s * 2}M${x} ${y - s}v${s * 2}`}
          stroke={light ? C.white : I}
          strokeWidth={1.2}
          transform={`rotate(${turn} ${x} ${y})`}
        />
      );
    })}
  </g>
);

const Stage: React.FC<{
  bg: string;
  t: number;
  rays?: boolean;
  dark?: boolean;
  children?: React.ReactNode;
}> = ({ bg, t, rays = false, dark = false, children }) => (
  <g>
    <rect width={544} height={720} fill={bg} />
    <defs>
      <pattern
        id={`paper-dots-${bg.replace("#", "")}`}
        width={38}
        height={38}
        patternUnits="userSpaceOnUse"
      >
        <circle cx={6} cy={7} r={0.7} fill={dark ? C.white : I} />
        <circle cx={25} cy={27} r={0.55} fill={dark ? C.white : I} />
      </pattern>
    </defs>
    <rect
      width={544}
      height={720}
      fill={`url(#paper-dots-${bg.replace("#", "")})`}
      opacity={dark ? 0.08 : 0.045}
    />
    {rays && (
      <g
        transform={`translate(272 335) rotate(${Math.sin(t * 0.18) * 4})`}
        opacity={dark ? 0.25 : 0.18}
      >
        {Array.from({ length: 20 }, (_, n) => {
          const a = (n * Math.PI) / 10;
          const b = a + Math.PI / 25;
          return (
            <path
              key={n}
              d={`M0 0L${Math.cos(a) * 920} ${Math.sin(a) * 920}L${Math.cos(b) * 920} ${Math.sin(b) * 920}Z`}
              fill={dark ? "#7d649b" : "#ffffff"}
            />
          );
        })}
      </g>
    )}
    <Doodles t={t} light={dark} />
    {children}
  </g>
);

const Cursor: React.FC<{ x: number; y: number; click?: number }> = ({
  x,
  y,
  click = 0,
}) => (
  <g transform={`translate(${x} ${y})`}>
    {click > 0 && click < 1 && (
      <circle
        r={6 + click * 22}
        fill="none"
        stroke="#67c5a1"
        strokeWidth={3}
        opacity={1 - click}
      />
    )}
    <path
      d="M0 0L0 25L7 19L13 30L19 27L13 17L23 16Z"
      fill={C.white}
      stroke={I}
      strokeWidth={1.5}
    />
  </g>
);
const Shadow: React.FC<{ x?: number; y?: number; w?: number }> = ({
  x = 272,
  y = 555,
  w = 180,
}) => <ellipse cx={x} cy={y} rx={w / 2} ry={12} fill={I} opacity={0.11} />;

const Coin: React.FC<{
  x: number;
  y: number;
  r?: number;
  angle?: number;
  smile?: boolean;
}> = ({ x, y, r = 17, angle = 0, smile = false }) => (
  <g transform={`translate(${x} ${y}) rotate(${angle})`}>
    <ellipse
      cx={3}
      rx={r * 0.8}
      ry={r}
      fill="#d7a42f"
      stroke={I}
      strokeWidth={1.5}
    />
    <ellipse rx={r * 0.8} ry={r} fill={C.gold} stroke={I} strokeWidth={1.5} />
    <ellipse
      rx={r * 0.6}
      ry={r * 0.8}
      fill="none"
      stroke={I}
      strokeDasharray="2 3"
      strokeWidth={1}
    />
    {smile ? (
      <g fill={I}>
        <circle cx={-r * 0.24} cy={-r * 0.12} r={r * 0.08} />
        <circle cx={r * 0.24} cy={-r * 0.12} r={r * 0.08} />
        <path
          d={`M${-r * 0.3} ${r * 0.18}Q0 ${r * 0.65} ${r * 0.3} ${r * 0.18}`}
          fill="none"
          stroke={I}
          strokeWidth={r * 0.07}
        />
      </g>
    ) : (
      <Txt x={0} y={r * 0.26} size={r * 0.65} bold>
        F
      </Txt>
    )}
  </g>
);

const Person: React.FC<{
  x: number;
  y: number;
  color?: string;
  scale?: number;
  wave?: boolean;
  worried?: boolean;
}> = ({ x, y, color = C.blue, scale = 1, wave = false, worried = false }) => (
  <g transform={`translate(${x} ${y}) scale(${scale})`}>
    <path
      d="M-23 36Q-20 10 0 11Q20 10 23 36Z"
      fill={color}
      stroke={I}
      strokeWidth={2.5}
    />
    <circle cy={-1} r={17} fill="#ffe5c0" stroke={I} strokeWidth={2} />
    <path
      d="M-17 -2Q-20 -25 0 -22Q19 -21 18 -2Q11 -16 2 -11Q-7 -8 -17 -2"
      fill={I}
    />
    <circle cx={-6} r={1.5} fill={I} />
    <circle cx={6} r={1.5} fill={I} />
    {worried ? (
      <g>
        <ellipse cy={7} rx={3} ry={4} fill={I} />
        <path d="M-11 -6L-4 -4M4 -4L11 -6" stroke={I} strokeWidth={1.4} />
        <path
          d="M17 -14Q26 -3 21 1Q15 3 17 -14Z"
          fill={C.blue}
          stroke={I}
          strokeWidth={1}
        />
      </g>
    ) : (
      <path d="M-5 5Q0 10 6 5" fill="none" stroke={I} strokeWidth={1.5} />
    )}
    {wave && (
      <path
        d="M22 20L34 -22"
        fill="none"
        stroke={I}
        strokeWidth={3}
        strokeLinecap="round"
      />
    )}
  </g>
);

const Logo: React.FC<{ x: number; y: number; size?: number }> = ({
  x,
  y,
  size = 42,
}) => (
  <g transform={`translate(${x} ${y}) scale(${size / 42})`}>
    <rect
      x={-21}
      y={-21}
      width={42}
      height={42}
      rx={11}
      fill="#a38bf5"
      stroke={I}
      strokeWidth={2}
    />
    <circle cx={-7} cy={-4} r={2.6} fill={I} />
    <circle cx={7} cy={-4} r={2.6} fill={I} />
    <path
      d="M-9 5Q0 17 10 5"
      fill="none"
      stroke={I}
      strokeWidth={2}
      strokeLinecap="round"
    />
  </g>
);

const Thumb: React.FC<{
  x: number;
  y: number;
  down?: boolean;
  scale?: number;
}> = ({ x, y, down = false, scale = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${scale})`}>
    <circle r={43} fill={down ? C.coral : C.green} stroke={I} strokeWidth={3} />
    <g transform={down ? "rotate(180)" : ""}>
      <path
        d="M-15 22L-15 -3L-3 -7L3 -28Q16 -31 15 -17L12 -6L29 -5Q35 -3 32 5L26 23Z"
        fill={C.white}
        stroke={I}
        strokeWidth={2.5}
      />
      <rect
        x={-26}
        y={-5}
        width={11}
        height={29}
        rx={2}
        fill={C.white}
        stroke={I}
        strokeWidth={2.5}
      />
    </g>
  </g>
);

const Crown: React.FC<{
  x: number;
  y: number;
  scale?: number;
  turn?: number;
}> = ({ x, y, scale = 1, turn = 7 }) => (
  <g transform={`translate(${x} ${y}) rotate(${turn}) scale(${scale})`}>
    <path
      d="M-45 -17L-29 3L-9 -28L9 -4L37 -22L29 30L-35 30Z"
      fill={C.gold}
      stroke={I}
      strokeWidth={3}
    />
    <circle cx={-45} cy={-17} r={4} fill={C.pink} stroke={I} strokeWidth={2} />
    <circle cx={-9} cy={-28} r={4} fill={C.pink} stroke={I} strokeWidth={2} />
    <circle cx={37} cy={-22} r={4} fill={C.pink} stroke={I} strokeWidth={2} />
  </g>
);

const Chip: React.FC<{ x: number; y: number; scale?: number }> = ({
  x,
  y,
  scale = 1,
}) => (
  <g transform={`translate(${x} ${y}) scale(${scale})`}>
    <rect
      x={-27}
      y={-27}
      width={54}
      height={54}
      rx={6}
      fill={C.gold}
      stroke={I}
      strokeWidth={3}
    />
    <rect x={-16} y={-16} width={32} height={32} rx={2} fill={I} />
    <Txt x={0} y={5} size={16} fill="white" bold>
      AI
    </Txt>
    {[-18, -6, 6, 18].map((v) => (
      <g key={v} stroke={I} strokeWidth={2}>
        <path d={`M${v} -33v6M${v} 27v6M-33 ${v}h6M27 ${v}h6`} />
      </g>
    ))}
  </g>
);

const Badge: React.FC<{
  x: number;
  y: number;
  w: number;
  h: number;
  fill?: string;
  children?: React.ReactNode;
  rotate?: number;
}> = ({ x, y, w, h, fill = C.white, children, rotate = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rotate})`}>
    <rect x={4} y={6} width={w} height={h} rx={12} fill={I} opacity={0.16} />
    <rect
      width={w}
      height={h}
      rx={12}
      fill={fill}
      stroke={I}
      strokeWidth={2.6}
    />
    {children}
  </g>
);

const ThumbContent: React.FC<{
  kind: number;
  w: number;
  h: number;
  t: number;
  gray?: boolean;
}> = ({ kind, w, h, t, gray = false }) => {
  const colors = gray
    ? [
        "#b1b1b8",
        "#d5d6d5",
        "#bbbdc8",
        "#dddde1",
        "#b4b8bd",
        "#8c929c",
        "#cacaca",
        "#dddde2",
      ]
    : [
        "#434747",
        "#136653",
        "#a9c4fa",
        "#f9f6ec",
        "#171e29",
        "#072076",
        "#dddafa",
        "#eaf5da",
      ];
  return (
    <g>
      <rect width={w} height={h} rx={4} fill={colors[kind % 8]} />
      {kind % 8 === 0 ? (
        <g>
          {Array.from({ length: 14 }, (_, n) => (
            <Star
              key={n}
              x={10 + ((n * 41) % (w - 20))}
              y={10 + ((n * 27) % (h - 20))}
              r={2 + (n % 3)}
              fill={n % 3 ? C.white : C.gold}
            />
          ))}
          <path
            d={`M12 ${h * 0.7}L${w * 0.8} ${h * 0.25}`}
            stroke="#bbc6c1"
            strokeWidth={1}
          />
        </g>
      ) : kind % 8 === 1 ? (
        <g opacity={0.8}>
          {Array.from({ length: 8 }, (_, n) => (
            <path
              key={n}
              d={`M${w * 0.18 + n * 8} 8L${w * 0.75 - n * 4} ${h - 8}`}
              stroke="#a3e5b9"
              strokeWidth={0.6}
            />
          ))}
          <Txt x={w / 2} y={h * 0.55} size={Math.min(w / 5, 23)} fill="#c5f7d2">
            动效
          </Txt>
        </g>
      ) : kind % 8 === 2 ? (
        <g>
          <path
            d={`M${w * 0.25} ${h * 0.8}L${w * 0.74} ${h * 0.22}l-3 20M${w * 0.74} ${h * 0.22}l-20 6`}
            fill="none"
            stroke={I}
            strokeWidth={2}
          />
          <Txt x={w * 0.42} y={h * 0.62} size={9} bold>
            保持好奇
          </Txt>
        </g>
      ) : kind % 8 === 3 ? (
        <g>
          <text
            x={w / 2}
            y={h * 0.62}
            textAnchor="middle"
            fontFamily={serif}
            fontSize={w * 0.27}
            fontStyle="italic"
            fill={I}
          >
            i&apos;m
          </text>
          <circle cx={w * 0.6} cy={h * 0.15} r={3} fill={I} />
        </g>
      ) : kind % 8 === 4 ? (
        <g>
          {Array.from({ length: 6 }, (_, n) => (
            <rect
              key={n}
              x={8 + ((n % 3) * (w - 16)) / 3}
              y={8 + (Math.floor(n / 3) * (h - 16)) / 2}
              width={(w - 22) / 3}
              height={(h - 22) / 2}
              rx={2}
              fill={["#f9bf64", "#87e9c3", "#4a6df0"][n % 3]}
              stroke="#d5d5d5"
              strokeWidth={1}
            />
          ))}
          <rect
            x={w * 0.2}
            y={h * 0.44}
            width={w * 0.6}
            height={h * 0.14}
            fill="#171c27"
          />
        </g>
      ) : kind % 8 === 5 ? (
        <g>
          {Array.from({ length: 8 }, (_, n) => (
            <rect
              key={n}
              x={(n * w) / 8}
              y={h * (0.3 + (n % 3) * 0.13)}
              width={w / 8 - 2}
              height={h * 0.8}
              fill={n % 2 ? "#09284c" : "#081425"}
            />
          ))}
          <circle cx={w * 0.76} cy={h * 0.2} r={w * 0.1} fill="#4369be" />
        </g>
      ) : kind % 8 === 6 ? (
        <g>
          {[0, 1, 2].map((n) => (
            <g
              key={n}
              transform={`translate(${w * 0.3 + n * 3} ${h * 0.2 + n * 15}) rotate(${-9 + n * 5})`}
            >
              <rect
                width={w * 0.45}
                height={h * 0.3}
                fill={["#ad8aff", "#dcc7fe", "#6568e8"][n]}
                stroke={I}
                strokeWidth={0.7}
              />
              <path
                d={`M4 6h${w * 0.3}M4 10h${w * 0.23}`}
                stroke="white"
                strokeWidth={1}
              />
            </g>
          ))}
        </g>
      ) : (
        <g>
          <circle
            cx={w / 2}
            cy={h / 2}
            r={Math.min(w, h) * 0.3}
            fill={C.gold}
          />
          <path
            d={`M${w * 0.2} ${h * 0.72}Q${w * 0.4} ${h * 0.2} ${w * 0.8} ${h * 0.3}`}
            stroke={I}
            fill="none"
            strokeWidth={2}
          />
          <circle
            cx={w * 0.5}
            cy={h * 0.2 + Math.sin(t) * 2}
            r={4}
            fill="#80cc85"
          />
        </g>
      )}
    </g>
  );
};

const Gallery: React.FC<{
  t: number;
  quality?: boolean;
  scroll?: number;
  retire?: number;
  reward?: number;
  ordinary?: boolean;
}> = ({
  t,
  quality = false,
  scroll = 0,
  retire = 0,
  reward = 0,
  ordinary = false,
}) => {
  const gid = `gallery-${quality ? "q" : "n"}-${ordinary ? "o" : "p"}`;
  const cardW = 149;
  return (
    <g>
      <rect x={25} y={34} width={494} height={599} rx={12} fill={I} />
      <rect
        x={21}
        y={27}
        width={494}
        height={599}
        rx={12}
        fill="#fffefa"
        stroke={I}
        strokeWidth={3}
      />
      <path d="M22 49H514" stroke={I} strokeWidth={2} />
      {[34, 45, 56].map((x, n) => (
        <circle
          key={x}
          cx={x}
          cy={38}
          r={2.8}
          fill={[C.coral, C.gold, C.mint][n]}
          stroke={I}
          strokeWidth={0.9}
        />
      ))}
      <Txt x={268} y={41} size={8}>
        {ordinary ? "Motion inspiration" : "Motionface · 动效广场"}
      </Txt>
      <defs>
        <clipPath id={gid}>
          <rect x={29} y={57} width={478} height={560} rx={3} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${gid})`}>
        <g transform={`translate(34 ${65 - scroll})`}>
          {Array.from({ length: 12 }, (_, n) => {
            const col = n % 3;
            const row = Math.floor(n / 3);
            const h = ordinary ? 116 : [155, 173, 137, 143][row];
            const yy = row * 171 + (col === 2 ? 4 : 0);
            const bad = retire > 0 && (n === 4 || n === 7);
            const selected = n === 4 && reward > 0;
            return (
              <g
                key={n}
                transform={`translate(${col * (cardW + 7)} ${yy})`}
                opacity={bad ? mix(1, 0.35, retire) : 1}
              >
                <ThumbContent
                  kind={ordinary ? (n + 2) % 8 : n % 8}
                  w={cardW}
                  h={h - 35}
                  t={t}
                  gray={bad}
                />
                <rect y={h - 35} width={cardW} height={35} fill="#fffefa" />
                <Txt x={7} y={h - 23} anchor="start" size={8} bold>
                  {
                    [
                      "星际粒子",
                      "绿色几何",
                      "保持好奇",
                      "创意字形",
                      "界面叙事",
                      "深蓝空间",
                      "灵感堆叠",
                      "共享思路",
                    ][n % 8]
                  }
                </Txt>
                <path
                  d={`M7 ${h - 15}h${60 + (n % 4) * 9}M7 ${h - 10}h${40 + (n % 3) * 7}`}
                  stroke="#bbbfb6"
                  strokeWidth={1}
                />
                <Txt
                  x={cardW - 12}
                  y={h - 10}
                  size={7}
                  anchor="end"
                  fill="#668471"
                >
                  {quality || reward ? "♡ " + (32 + n * 13) : "○  " + (7 + n)}
                </Txt>
                {selected && (
                  <rect
                    x={-3}
                    y={-3}
                    width={cardW + 6}
                    height={h + 6}
                    fill="none"
                    stroke="#64c58d"
                    strokeWidth={3}
                  />
                )}{" "}
                {bad && retire > 0.5 && (
                  <g
                    transform={`translate(${cardW / 2} ${h * 0.45}) rotate(-13)`}
                  >
                    <rect
                      x={-50}
                      y={-17}
                      width={100}
                      height={34}
                      fill="#eeeeee"
                      stroke={I}
                      strokeWidth={2}
                    />
                    <Txt x={0} y={7} size={19} bold>
                      已清退
                    </Txt>
                  </g>
                )}
              </g>
            );
          })}
        </g>
      </g>
      <Txt x={483} y={613} size={7} anchor="end" fill="#8a8b86">
        界面复原示意
      </Txt>
    </g>
  );
};

const Flow = ({ t }: { t: number }) => {
  const p = ease((t - 72.4) / 0.8);
  return (
    <Stage bg={C.cream} t={t}>
      <Sticker
        x={272}
        y={97}
        w={140}
        h={34}
        text={p > 0.4 ? "Motion Face" : "传统 vibe motion"}
        fill={p > 0.4 ? C.mint : C.white}
        size={15}
      />
      <g transform="translate(39 245)">
        <rect
          width={85}
          height={88}
          rx={14}
          fill={C.mint}
          stroke={I}
          strokeWidth={2.5}
        />
        <circle cx={40} cy={38} r={14} fill="none" stroke={I} strokeWidth={3} />
        <path d="M50 49L64 62" stroke={I} strokeWidth={3} />
        <Txt x={42} y={111} size={15}>
          找参考
        </Txt>
      </g>
      <g transform="translate(233 245)" opacity={1 - p}>
        <rect
          width={85}
          height={88}
          rx={14}
          fill="#ffc8ae"
          stroke={I}
          strokeWidth={2.5}
        />
        <Txt x={42} y={53} size={27} bold>
          &lt;/&gt;
        </Txt>
        <path d="M8 9L76 78M76 9L8 78" stroke={C.coral} strokeWidth={5} />
        <Txt x={42} y={112} size={13}>
          AI 代码复刻
        </Txt>
      </g>
      <g transform="translate(424 245)">
        <rect
          width={85}
          height={88}
          rx={14}
          fill={C.violet}
          stroke={I}
          strokeWidth={2.5}
        />
        <Star x={43} y={42} r={25} />
        <Txt x={42} y={111} size={13}>
          remix 内容
        </Txt>
      </g>
      <path
        d="M128 288H223M323 288H414"
        fill="none"
        stroke={I}
        strokeWidth={2}
        opacity={1 - p}
      />
      <path
        d="M105 235Q272 75 457 235"
        fill="none"
        stroke={I}
        strokeWidth={3}
        strokeDasharray={500}
        strokeDashoffset={500 * (1 - p)}
      />
      <g
        transform={`translate(${mix(110, 465, p)} ${235 - 125 * Math.sin(p * Math.PI)})`}
      >
        <path
          d="M-14 3L-8 -12L-1 -1L8 -9L16 5"
          fill="none"
          stroke={I}
          strokeWidth={6}
          strokeLinecap="round"
        />
      </g>
      <Sticker
        x={272}
        y={471}
        w={210}
        h={64}
        fill={C.gold}
        text="词元 −95%"
        size={27}
        angle={-4}
        scale={enter(t - 73.5)}
      />
    </Stage>
  );
};

const DetailPanel = ({
  age,
  unlocked = false,
}: {
  age: number;
  unlocked?: boolean;
}) => (
  <g>
    <rect width={257} height={490} rx={8} fill="#ffffff" />
    <Txt x={17} y={40} anchor="start" size={20} bold>
      Giga · 幻觉检测与纠正
    </Txt>
    <Txt x={17} y={67} anchor="start" size={10} fill="#738779">
      @ guangye9802
    </Txt>
    <path
      d="M16 95H235M16 107H226M16 119H188"
      stroke="#c9d0c9"
      strokeWidth={2}
    />
    <Txt x={17} y={158} anchor="start" size={12}>
      ♡ 13 ☞ 0 分享
    </Txt>
    <rect x={17} y={188} width={224} height={112} rx={6} fill="#f0f7ef" />
    {unlocked ? (
      <g>
        <Txt x={29} y={212} anchor="start" size={10}>
          GitHub 仓库已解锁
        </Txt>
        <Txt x={29} y={234} anchor="start" size={9}>
          sxhziuj/giga-hallucination-remotion ↗
        </Txt>
        <Txt x={29} y={267} anchor="start" size={9}>
          sxhziuj/giga-headline-motion ↗
        </Txt>
        <path
          d="M216 223h10v11h-10zM212 228h10v11h-10z"
          fill="none"
          stroke={I}
        />
      </g>
    ) : (
      <g>
        <Txt x={27} y={213} anchor="start" size={10}>
          解锁此视频的 GitHub 仓库
        </Txt>
        <rect x={28} y={230} width={160} height={35} rx={5} fill="#385749" />
        <Txt x={108} y={252} size={11} fill="white" bold>
          {age > 0.7 && age < 1.05 ? "正在解锁…" : "10 Face · 解锁仓库"}
        </Txt>
      </g>
    )}
    <Txt x={18} y={335} anchor="start" size={14} bold>
      &lt;/&gt; Remotion 复刻
    </Txt>
    <path
      d="M18 365H220M18 378H239M18 391H190"
      stroke="#ced2cc"
      strokeWidth={2}
    />
    <Txt x={18} y={445} anchor="start" size={9} fill="#8b958d">
      记录来源 · 界面复原示意
    </Txt>
  </g>
);

const Software = ({ t, phase }: { t: number; phase: string }) => {
  const dark = phase !== "gallery";
  const detailAge = t - 78.47;
  const base = (
    <>
      <rect width={544} height={720} fill="#edf2ed" />
      <g
        opacity={dark ? 0.55 : 1}
        transform={
          phase === "gallery"
            ? `translate(${mix(-26, 0, ease((t - 75) / 1.5))} ${mix(-120, 0, ease((t - 75) / 1.5))}) scale(${mix(1.35, 1, ease((t - 75) / 1.5))})`
            : undefined
        }
      >
        <Gallery t={t} scroll={Math.max(0, (t - 76) * 10)} />
      </g>
    </>
  );
  if (phase === "gallery")
    return (
      <g>
        {base}
        <Cursor
          x={mix(480, 200, ease((t - 76) / 1.7))}
          y={mix(560, 390, ease((t - 76) / 1.7))}
          click={clamp((t - 78.2) * 4)}
        />
      </g>
    );
  const isFocus = ["unlock", "copy"].includes(phase);
  const scale = isFocus ? 1.1 : 1;
  return (
    <g>
      {base}
      <rect width={544} height={720} fill="#14221e" opacity={0.72} />
      <g
        transform={`translate(${isFocus ? -78 : 26} ${isFocus ? 75 : 145}) scale(${isFocus ? scale : enter(detailAge, 0, 0.3)})`}
      >
        <rect x={-4} y={-6} width={500} height={438} rx={7} fill="#fafcf8" />
        <rect x={7} y={16} width={290} height={404} fill="#101e18" />
        <rect x={7} y={89} width={290} height={234} fill="#fffefa" />
        <text
          x={22}
          y={167}
          fontFamily={serif}
          fontSize={15}
          fill={I}
          fontWeight={700}
        >
          <tspan x={22}>NYC&apos;s official chatbot hallucinates,</tspan>
          <tspan x={22} dy={21}>
            tells businesses to break the law.
          </tspan>
        </text>
        <g
          transform={`translate(${isFocus ? 184 : 306} ${isFocus ? -34 : 11}) scale(${isFocus ? 1.35 : 0.73})`}
        >
          <DetailPanel age={t - 80.1} unlocked={t > 81.25} />
        </g>
      </g>
      {phase === "unlock" && (
        <Cursor
          x={mix(453, 323, ease((t - 80.1) / 0.6))}
          y={mix(451, 382, ease((t - 80.1) / 0.6))}
          click={clamp((t - 80.75) / 0.5)}
        />
      )}{" "}
      {phase === "unlock" && t > 81.25 && t < 82.7 && (
        <Sticker
          x={291}
          y={210}
          w={420}
          h={42}
          text="✓ GitHub 仓库已解锁"
          size={15}
          scale={enter(t - 81.25)}
        />
      )}{" "}
      {phase === "repository" && (
        <g transform={`translate(37 ${mix(440, 139, enter(t - 83.2))})`}>
          <Badge x={0} y={0} w={466} h={485}>
            <Txt x={23} y={36} size={13} anchor="start" fill="#4278a3">
              ◉ sxhziuj / giga-hallucination-remotion
            </Txt>
            <Txt x={23} y={72} size={11} anchor="start">
              Code Issues Pull requests Actions
            </Txt>
            {[
              "public",
              "src",
              "package-lock.json",
              "package.json",
              "README.md",
              "remotion.config.ts",
              "tsconfig.json",
            ].map((name, n) => (
              <g key={name}>
                <path d={`M17 ${111 + n * 29}H449`} stroke="#e5e8e4" />
                <Txt x={26} y={101 + n * 29} anchor="start" size={12}>
                  ▱ {name}
                </Txt>
              </g>
            ))}
            <Txt x={23} y={359} size={18} anchor="start" bold>
              Giga · 幻觉检测与纠正
            </Txt>
            <path
              d="M24 389H421M24 402H398M24 415H300"
              stroke="#ccd3cb"
              strokeWidth={2}
            />
          </Badge>
          <g
            transform={`translate(${mix(600, 238, enter(t - 83.9))} 366) rotate(-4)`}
          >
            <rect
              width={228}
              height={122}
              rx={7}
              fill="#192522"
              stroke={I}
              strokeWidth={2}
            />
            {[
              "const progress = interpolate(frame,",
              " [0, 30], [0, 1]);",
              "return <AbsoluteFill>",
              "  <Sequence from={90}>",
              "    <Headline content={title}/>",
              "  </Sequence>",
            ].map((s, n) => (
              <Txt
                key={n}
                x={11}
                y={20 + n * 15}
                anchor="start"
                size={8}
                fill={n % 2 ? "#ddd5ac" : "#8ac5af"}
              >
                {s}
              </Txt>
            ))}
          </g>
        </g>
      )}{" "}
      {phase === "copy" && (
        <g>
          <Cursor x={456} y={373} click={clamp((t - 86.5) / 0.5)} />
          {t > 86.7 && (
            <Sticker
              x={287}
              y={352}
              w={330}
              h={35}
              text="◉ sxhziuj/giga-hallucination-remotion"
              size={12}
              scale={enter(t - 86.7)}
            />
          )}
        </g>
      )}
    </g>
  );
};

const Prompt = ({ t }: { t: number }) => {
  const a = t - 87.47;
  const p = enter(a, 0, 0.32);
  const typed =
    "把标题和正文换成 Motion Face 的内容：一人复刻，万人共享。".slice(
      0,
      Math.floor(clamp((a - 0.8) / 1.45) * 39),
    );
  return (
    <Stage bg="#edf8f1" t={t}>
      <g transform={`translate(272 362) scale(${p})`}>
        <Badge x={-223} y={-161} w={446} h={310}>
          <path d="M0 40H446" stroke={I} strokeWidth={2} />
          {[19, 32, 45].map((x, n) => (
            <circle
              key={x}
              cx={x}
              cy={21}
              r={4}
              fill={[C.gold, C.pink, C.mint][n]}
              stroke={I}
            />
          ))}
          <Txt x={222} y={27} size={17} bold>
            ◉ 和 AI 说
          </Txt>
          <Sticker
            x={220}
            y={78}
            w={341}
            h={36}
            text="◉ sxhziuj/giga-hallucination-remotion"
            fill={C.mint}
            size={12}
          />
          <g transform={`translate(23 107) scale(${enter(a, 0.35)})`}>
            <rect
              width={308}
              height={45}
              rx={7}
              fill={C.yellow}
              stroke={I}
              strokeWidth={2}
            />
            <rect
              x={7}
              y={7}
              width={54}
              height={30}
              fill={C.white}
              stroke={I}
            />
            <path d="M12 15H54M12 21H45" stroke="#92908b" />
            <Txt x={77} y={28} size={12} anchor="start">
              参考：Giga · 幻觉检测与纠正
            </Txt>
          </g>
          <Txt x={24} y={191} size={21} anchor="start">
            {typed.slice(0, 24)}
          </Txt>
          <Txt x={24} y={224} size={21} anchor="start">
            {typed.slice(24)}
            {a < 2.5 ? "│" : ""}
          </Txt>
          <g
            transform={`translate(397 268) scale(${1 + 0.12 * Math.sin(clamp((a - 2.3) / 0.3) * Math.PI)})`}
          >
            <circle r={18} fill={C.mint} stroke={I} strokeWidth={2} />
            <path
              d="M0 10V-9M-8 -1L0 -9L8 -1"
              stroke={I}
              strokeWidth={3}
              fill="none"
            />
            {a > 2.3 &&
              Array.from({ length: 8 }, (_, n) => (
                <path
                  key={n}
                  d="M24 0h12"
                  stroke={n % 2 ? C.gold : C.mint}
                  strokeWidth={2}
                  transform={`rotate(${n * 45})`}
                  opacity={1 - clamp((a - 2.3) / 0.45)}
                />
              ))}
          </g>
        </Badge>
      </g>
    </Stage>
  );
};

const Paper: React.FC<{
  x: number;
  y: number;
  s?: number;
  original?: boolean;
  highlight?: number;
  t: number;
}> = ({ x, y, s = 1, original = false, highlight = 0, t }) => (
  <g
    transform={`translate(${x} ${y}) rotate(${original ? -1.5 : 1}) scale(${s})`}
  >
    <rect
      x={5}
      y={11}
      width={426}
      height={223}
      rx={3}
      fill="#283629"
      opacity={0.12}
    />
    <rect width={426} height={223} rx={3} fill="#fffffb" />
    <path d="M31 45H378" stroke="#afb8ae" strokeWidth={1} />
    {highlight > 0 && (
      <rect
        x={original ? 82 : 78}
        y={original ? 79 : 102}
        width={90 * highlight}
        height={13}
        fill={C.gold}
        opacity={0.7}
      />
    )}
    <text
      x={31}
      y={90}
      fontSize={original ? 17 : 19}
      fontFamily={serif}
      fontWeight={600}
      fill={I}
    >
      <tspan x={31}>
        {original
          ? "NYC's official chatbot hallucinates,"
          : "一人用 AI 复刻好的动效代码，"}
      </tspan>
      <tspan x={31} dy={25}>
        {original
          ? "tells businesses to break the law."
          : "让所有人都不必从零复刻。"}
      </tspan>
    </text>
    <path d="M31 142H321M31 150H243" stroke="#b8c0b7" strokeWidth={1} />
    <rect
      x={original ? 319 : 300}
      y={185}
      width={original ? 89 : 109}
      height={24}
      rx={2}
      fill={original ? "#263a31" : C.mint}
    />
    <Txt
      x={original ? 363 : 354}
      y={201}
      size={9}
      fill={original ? "white" : I}
    >
      {original ? "原视频 · Giga" : "Remix · 保留风格"}
    </Txt>
    <circle cx={15 + Math.sin(t) * 1.5} cy={15} r={0.5} fill="#f7f7ef" />
  </g>
);

const Results = ({ t, compare = false }: { t: number; compare?: boolean }) => {
  const a = t - (compare ? 91.7 : 90.17);
  return (
    <Stage bg="#eef3e9" t={t}>
      {compare ? (
        <g>
          <Paper
            x={54}
            y={133}
            s={1.03}
            original
            highlight={clamp(a - 1)}
            t={t}
          />
          <Paper x={43} y={405} s={1.03} highlight={clamp(a - 1)} t={t} />
          <path
            d="M93 223Q-5 368 98 499M448 219Q547 370 446 503"
            stroke={I}
            strokeWidth={2}
            strokeDasharray="3 5"
            fill="none"
            opacity={ease((a - 0.4) / 0.4)}
          />
          <Sticker
            x={87}
            y={379}
            w={134}
            h={39}
            text="✓ 画面风格"
            fill={C.gold}
            angle={-7}
            size={17}
            scale={enter(a, 0.8)}
          />
          <Sticker
            x={438}
            y={379}
            w={138}
            h={39}
            text="✓ 动效质感"
            fill={C.mint}
            angle={6}
            size={17}
            scale={enter(a, 1.3)}
          />
        </g>
      ) : (
        <g transform={`translate(272 344) scale(${enter(a)})`}>
          <Paper x={-214} y={-111} t={t} />
        </g>
      )}
    </Stage>
  );
};

const RefImage: React.FC<{
  src: string;
  x: number;
  y: number;
  w: number;
  h: number;
  gray?: number;
  feather?: boolean;
}> = ({ src, x, y, w, h, gray = 0, feather = false }) => (
  <foreignObject x={x} y={y} width={w} height={h}>
    <Img
      src={staticFile(`reference-assets/second/${src}`)}
      style={{
        display: "block",
        width: "100%",
        height: "100%",
        objectFit: "fill",
        filter: gray ? `grayscale(${gray})` : undefined,
        maskImage: feather
          ? "linear-gradient(to right, transparent, black 7%, black 91%, transparent), linear-gradient(to bottom, transparent, black 5%, black 94%, transparent)"
          : undefined,
        maskComposite: feather ? "intersect" : undefined,
      }}
    />
  </foreignObject>
);

const referenceCards = [
  { name: "music", x: 50, y: 54, w: 143, h: 167 },
  { name: "green", x: 205, y: 54, w: 143, h: 167 },
  { name: "blue", x: 359, y: 124, w: 141, h: 294 },
  { name: "type", x: 50, y: 232, w: 143, h: 141 },
  { name: "screens", x: 205, y: 232, w: 143, h: 126 },
  { name: "news", x: 205, y: 367, w: 143, h: 123 },
  { name: "city", x: 50, y: 387, w: 143, h: 229 },
  { name: "stack", x: 205, y: 501, w: 143, h: 114 },
  { name: "pastel", x: 359, y: 428, w: 141, h: 185 },
];

const ReferenceGallery: React.FC<{
  t: number;
  ordinary?: boolean;
  retire?: number;
  reward?: number;
}> = ({ t, ordinary = false, retire = 0, reward = 0 }) => {
  const id = ordinary ? "reference-ordinary" : "reference-curated";
  const scroll = ordinary
    ? t < 97
      ? mix(-72, 0, ease((t - 96.27) / 0.68))
      : Math.min(600, (t - 97) * 570)
    : 0;
  return (
    <g>
      <rect
        x={18}
        y={33}
        width={505}
        height={596}
        rx={17}
        fill="#302641"
        opacity={0.14}
      />
      <rect x={18} y={32} width={505} height={593} rx={18} fill="#29213b" />
      <rect
        x={23}
        y={28}
        width={499}
        height={591}
        rx={17}
        fill="#fffefd"
        stroke={I}
        strokeWidth={2.4}
      />
      <path d="M25 53H520" stroke={I} strokeWidth={1.8} />
      {[40, 54, 68].map((x, n) => (
        <circle
          key={x}
          cx={x}
          cy={41}
          r={3.3}
          fill={[C.coral, C.gold, C.mint][n]}
          stroke={I}
          strokeWidth={1.2}
        />
      ))}
      <defs>
        <clipPath id={id}>
          <rect x={28} y={55} width={485} height={561} rx={4} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${id})`}>
        <rect x={28} y={55} width={485} height={561} fill="#fffefd" />
        {ordinary ? (
          <g>
            <Txt x={270} y={71 - scroll} size={7}>
              All Text Background Logos Social media Charts & Data UI Elements
            </Txt>
            {Array.from({ length: 40 }, (_, n) => (
              <RefImage
                key={n}
                src={`ordinary-${String(n % 25).padStart(2, "0")}.png`}
                x={36 + (n % 5) * 98}
                y={77 + Math.floor(n / 5) * 173 - scroll}
                w={88}
                h={166}
              />
            ))}
          </g>
        ) : (
          referenceCards.map((c, n) => {
            const removed = retire > 0 && (n === 4 || n === 5);
            return (
              <g key={c.name} opacity={removed ? mix(1, 0.35, retire) : 1}>
                <RefImage
                  src={`gallery-${c.name}.png`}
                  x={c.x}
                  y={c.y}
                  w={c.w}
                  h={c.h}
                  gray={removed ? retire : 0}
                />
                {reward > 0 && n === 4 && (
                  <rect
                    x={c.x - 2}
                    y={c.y - 2}
                    width={c.w + 4}
                    height={c.h + 4}
                    rx={12}
                    fill="none"
                    stroke="#338866"
                    strokeWidth={3}
                  />
                )}
                {removed && retire > 0.6 && (
                  <g
                    transform={`translate(${c.x + c.w / 2} ${c.y + c.h * 0.55}) rotate(-12)`}
                  >
                    <rect
                      x={-52}
                      y={-19}
                      width={104}
                      height={38}
                      rx={2}
                      fill="#ebebeb"
                      stroke="#66656b"
                      strokeWidth={2.5}
                    />
                    <Txt x={0} y={8} size={23} fill="#66656b" bold>
                      已清退
                    </Txt>
                  </g>
                )}
              </g>
            );
          })
        )}
      </g>
    </g>
  );
};

const Phone = ({ t }: { t: number }) => {
  const a = t - 101.6;
  const win = ease((t - 102.76) / 0.27);
  const zoom = ease((t - 103.25) / 1.35);
  const z = 1 + zoom * 0.12;
  const cy = 336 - zoom * 12;
  const frame = Math.max(0, Math.min(39, Math.round((t - 102.8) * 15)));
  return (
    <Stage bg="#91d9f7" t={t} rays={t > 103.5}>
      {[-1, 1].map((side) => (
        <g key={side} opacity={mix(1, 0.43, zoom)}>
          <g
            transform={`translate(${272 + side * 154} 326) rotate(${side * 5})`}
          >
            <rect
              x={-81}
              y={-116}
              width={162}
              height={235}
              rx={13}
              fill={side < 0 ? "#b4b3c1" : "#b8b9b1"}
              stroke={I}
              strokeWidth={3}
            />
            <Txt x={0} y={5} size={17} fill="white" bold>
              {side < 0 ? "日常 vlog" : "学习打卡"}
            </Txt>
            <circle cx={54} cy={68} r={6} fill="white" />
          </g>
          <g
            transform={`translate(${272 + side * 226} 509) rotate(${side * 9})`}
          >
            <rect
              x={-61}
              y={-87}
              width={122}
              height={174}
              rx={10}
              fill={side < 0 ? "#a4b3b8" : "#a5b4c1"}
              stroke={I}
              strokeWidth={3}
            />
            <Txt x={0} y={5} size={14} fill="white" bold>
              {side < 0 ? "随便拍拍" : "分享一下"}
            </Txt>
            <circle cx={41} cy={51} r={5} fill="white" />
          </g>
        </g>
      ))}
      <g transform={`translate(272 ${cy}) scale(${z})`}>
        <rect
          x={-159}
          y={-267}
          width={314}
          height={536}
          rx={35}
          fill="#3a274d"
        />
        <rect
          x={-153}
          y={-269}
          width={309}
          height={532}
          rx={32}
          fill="#08090d"
          stroke={I}
          strokeWidth={3}
        />
        <defs>
          <linearGradient id="phone-texture-base" x1="0" y1="0" x2=".75" y2="1">
            <stop stopColor="#abb3b8" />
            <stop offset=".45" stopColor="#e2e8f4" />
            <stop offset="1" stopColor="#617ac0" />
          </linearGradient>
          <clipPath id="phone-screen-v2">
            <rect x={-143} y={-257} width={287} height={510} rx={22} />
          </clipPath>
        </defs>
        <g clipPath="url(#phone-screen-v2)">
          <rect
            x={-143}
            y={-257}
            width={287}
            height={510}
            fill={win > 0.1 ? "url(#phone-texture-base)" : "#a8b3b6"}
          />
          {win > 0.1 && (
            <g opacity={win}>
              <RefImage
                src={`phone-${String(frame).padStart(2, "0")}.jpg`}
                x={(128 - 272) / z}
                y={(139 - cy) / z}
                w={244 / z}
                h={315 / z}
                feather
              />
            </g>
          )}
          {win < 0.2 && (
            <text
              x={0}
              y={-15}
              fill="white"
              fontFamily={font}
              fontSize={28}
              fontWeight={700}
              textAnchor="middle"
            >
              <tspan x={0}>{a < 0.6 ? "今天也是" : "三分钟学会"}</tspan>
              <tspan x={0} dy={38}>
                {a < 0.6 ? "普通的一天" : "做 PPT"}
              </tspan>
            </text>
          )}
          <rect x={-143} y={204} width={287} height={52} fill="#08080b" />
          <Txt x={-116} y={232} size={14} fill="white" bold>
            首页
          </Txt>
          <Txt x={-60} y={232} size={13} fill="#aaaaaa">
            朋友
          </Txt>
          <Txt x={64} y={232} size={13} fill="#aaaaaa">
            消息
          </Txt>
          <Txt x={119} y={232} size={13} fill="#aaaaaa">
            我
          </Txt>
          <rect x={-19} y={216} width={38} height={21} rx={5} fill="#6cfaff" />
          <rect x={-15} y={216} width={38} height={21} rx={5} fill="#ff4166" />
          <rect x={-17} y={216} width={37} height={21} rx={4} fill="white" />
          <Txt x={1} y={232} size={23} fill="#101014" bold>
            +
          </Txt>
          <Txt x={-127} y={127} anchor="start" size={13} fill="white">
            {win > 0.4 ? "@猫学长" : "@办公小技巧"}
          </Txt>
          <Txt x={-127} y={149} anchor="start" size={11} fill="white">
            {win > 0.4
              ? "片头动效来自 Motionface ✦ #remotion #"
              : "干货分享 #效率"}
          </Txt>
          {win > 0.4 && (
            <Txt x={-127} y={166} anchor="start" size={11} fill="white">
              动效
            </Txt>
          )}
          <Txt x={-127} y={186} anchor="start" size={10} fill="white">
            ♪ 原声 - {win > 0.4 ? "猫学长 - 原声 - 猫学长" : "办公小技巧"}
          </Txt>
          <g transform="translate(117 -99)">
            <circle r={18} fill="#aaaebb" stroke="white" strokeWidth={1.5} />
            {win > 0.3 && (
              <RefImage src="avatar-cat.png" x={-15} y={-15} w={30} h={30} />
            )}
            <circle cy={20} r={6} fill="#f33e65" />
            <Txt x={0} y={23} size={11} fill="white">
              +
            </Txt>
          </g>
          <g transform="translate(116 -59)">
            <path
              d="M0 14C-40 -10 -5 -26 0 -9C5 -26 40 -10 0 14Z"
              fill={zoom > 0.4 ? "#ff3561" : "white"}
            />
            <Txt x={0} y={28} size={10} fill="white" bold>
              {zoom > 0.5 ? "55.8w" : win > 0.4 ? "2.2w" : "38"}
            </Txt>
          </g>
          <g transform="translate(116 0)">
            <path
              d="M-15 -6Q-15 -19 0 -19Q16 -19 16 -6Q16 6 1 6L-7 13L-6 5Q-15 3 -15 -6Z"
              fill="white"
            />
            <circle cx={-6} cy={-6} r={1.5} fill="#a1a7b3" />
            <circle cy={-6} r={1.5} fill="#a1a7b3" />
            <circle cx={6} cy={-6} r={1.5} fill="#a1a7b3" />
            <Txt x={0} y={27} size={10} fill="white" bold>
              {zoom > 0.5 ? "2.7w" : win > 0.4 ? "860" : "2"}
            </Txt>
          </g>
          <Star x={116} y={56} r={16} fill={zoom > 0.3 ? C.gold : "white"} />
          <Txt x={116} y={82} size={10} fill="white" bold>
            {zoom > 0.5 ? "9.7w" : win > 0.4 ? "3200" : "0"}
          </Txt>
          <path
            d="M102 117Q104 101 121 100V91L137 105L121 118V110Q108 108 102 117Z"
            fill="white"
          />
          <Txt x={116} y={135} size={10} fill="white" bold>
            {zoom > 0.5 ? "3.1w" : win > 0.4 ? "900" : "0"}
          </Txt>
          <circle
            cx={116}
            cy={169}
            r={17}
            fill="#111316"
            stroke="#3a3e40"
            strokeWidth={3}
          />
          <Txt x={116} y={176} size={23} fill="white">
            ♪
          </Txt>
        </g>
        <rect x={-36} y={-257} width={81} height={15} rx={8} fill="#07080b" />
        <Txt x={-121} y={-242} size={11} fill="white" bold>
          9:41
        </Txt>
        <Txt x={105} y={-242} size={11} fill="white">
          ▰ ▴ ▱
        </Txt>
        <Txt x={-4} y={-215} size={14} fill="white" bold>
          直播 同城 关注 推荐
        </Txt>
        <path d="M52 -207H77" stroke="white" strokeWidth={2} />
        <circle
          cx={124}
          cy={-220}
          r={6}
          fill="none"
          stroke="white"
          strokeWidth={1.5}
        />
        <path d="M128 -216L133 -211" stroke="white" strokeWidth={1.5} />
      </g>
      {t > 103.6 &&
        Array.from({ length: 12 }, (_, n) => {
          const p = ((t - 103.6) * 0.56 + n * 0.11) % 1;
          return (
            <text
              key={n}
              x={414 + Math.sin(n * 3) * 35}
              y={362 - p * 215}
              fontSize={18 + (n % 3) * 9}
              fill={n % 3 ? C.coral : C.gold}
              stroke="#765577"
              strokeWidth={2}
              opacity={0.35 + 0.6 * (1 - p)}
            >
              ♥
            </text>
          );
        })}
      <Crown x={272} y={42} scale={enter(t - 103.7)} turn={-5} />
      <Sticker
        x={83}
        y={563}
        w={154}
        h={47}
        text="脱颖而出!"
        fill="#ff95c4"
        angle={-11}
        size={21}
        scale={enter(t - 103.85)}
      />
    </Stage>
  );
};
const Curation = ({ t, mode }: { t: number; mode: string }) => {
  const age =
    t -
    (mode === "ordinary"
      ? 96.27
      : mode === "quality"
        ? 98.8
        : mode === "feedback"
          ? 105.55
          : mode === "retire"
            ? 107.5
            : 110.33);
  const reward = mode === "reward" ? clamp(age / 3) : 0;
  return (
    <Stage
      bg={
        mode === "ordinary"
          ? "#e5e0ed"
          : mode === "reward"
            ? "#c3f5ba"
            : mode === "quality"
              ? "#fff0a4"
              : C.cream
      }
      t={t}
    >
      <g
        transform={`translate(272 ${["feedback", "retire", "reward"].includes(mode) ? 347 : 340}) rotate(${mode === "ordinary" ? Math.sin(t) * 0.25 : 0}) scale(${mode === "ordinary" ? enter(age) : ["feedback", "retire", "reward"].includes(mode) ? 1.057 : 1}) translate(-272 -340)`}
      >
        <ReferenceGallery
          t={t}
          ordinary={mode === "ordinary"}
          retire={mode === "retire" ? clamp((age - 0.4) / 1) : 0}
          reward={reward}
        />
      </g>
      {mode === "ordinary" && (
        <g>
          <g transform={`translate(457 578) scale(${enter(age, 1.05)})`}>
            <circle r={39} fill="#b9b5c5" stroke={I} strokeWidth={3} />
            <path
              d="M-22 -5q10 10 18 0M6 -5q10 10 18 0"
              fill="none"
              stroke={I}
              strokeWidth={2.5}
            />
            <ellipse cy={18} rx={9} ry={7} fill={I} />
          </g>
          <g
            transform={`translate(95 570) rotate(-13) scale(${enter(age, 1.3)})`}
          >
            <rect
              x={-69}
              y={-27}
              width={138}
              height={54}
              fill="#fafafa"
              stroke="#6f707b"
              strokeWidth={4}
            />
            <Txt x={0} y={14} size={32} fill="#6f707b" bold>
              平庸
            </Txt>
          </g>
        </g>
      )}
      {mode === "quality" && (
        <g>
          <Sticker
            x={408}
            y={73}
            w={211}
            h={55}
            text="✦ 只保留高质量 ✦"
            fill={C.gold}
            angle={7}
            size={20}
          />
          <Sticker
            x={88}
            y={579}
            w={125}
            text="使用它们✓"
            fill={C.green}
            angle={-9}
            scale={enter(age, 1.8)}
          />
        </g>
      )}
      {["feedback", "retire"].includes(mode) && (
        <g>
          <Thumb x={53} y={86} scale={enter(age, 0, 0.25)} />
          <Thumb x={487} y={118} down scale={enter(age, 0.09, 0.25)} />
          <Sticker
            x={mode === "feedback" ? 417 : 92}
            y={587}
            w={160}
            text={mode === "feedback" ? "真实人类反馈" : "无人问津…"}
            fill={mode === "feedback" ? C.white : "#d7d4df"}
            angle={mode === "feedback" ? 6 : -7}
          />
          {mode === "feedback" &&
            Array.from({ length: 7 }, (_, n) => (
              <Star
                key={n}
                x={227 + (n % 3) * 32}
                y={340 + Math.sin(n) * 34}
                r={8}
                fill={n % 2 ? C.gold : C.coral}
                turn={n * 27}
              />
            ))}
          {mode === "retire" && (
            <g
              transform={`translate(438 570) rotate(-12) scale(${enter(age, 1.2)})`}
            >
              <rect
                x={-69}
                y={-39}
                width={138}
                height={78}
                rx={5}
                fill="#fffef5"
                stroke={C.coral}
                strokeWidth={5}
              />
              <Txt x={0} y={15} size={38} fill={C.coral} bold>
                清退
              </Txt>
            </g>
          )}
        </g>
      )}
      {mode === "reward" && (
        <g>
          <Star x={37} y={164} r={18} />
          <Sticker
            x={91}
            y={558}
            w={113}
            h={49}
            text="高赞 👍"
            fill={C.green}
            angle={-8}
          />
          <Sticker
            x={416}
            y={555}
            w={197}
            h={60}
            text="Face 猛涨 ↑"
            fill={C.gold}
            angle={6}
            size={23}
          />
          <Sticker
            x={450}
            y={61}
            w={114}
            h={30}
            text={`F ${Math.round(100 + clamp(age / 3.8) * 8060).toLocaleString("en-US")}`}
            fill={C.white}
            size={13}
          />
          <Cursor x={306} y={410} click={(age * 0.8) % 1} />
          {Array.from({ length: 20 }, (_, n) => {
            const p = (age * 0.7 + n * 0.087) % 1;
            const x =
              mix(285, 455, p) + Math.sin(p * Math.PI) * Math.sin(n * 0.7) * 70;
            const y = mix(404, 75, p) - Math.sin(p * Math.PI) * 85;
            return (
              <Coin key={n} x={x} y={y} r={9 + (n % 3) * 3} angle={p * 360} />
            );
          })}
        </g>
      )}
    </Stage>
  );
};

const Creator = ({ t }: { t: number }) => {
  const a = t - 114.27;
  return (
    <Stage bg={C.violet} t={t} rays>
      <g transform={`translate(272 319) scale(${enter(a)})`}>
        <circle r={125} fill={C.gold} stroke={I} strokeWidth={3} />
        <circle cy={-6} r={122} fill="#a77ff0" stroke={I} strokeWidth={3} />
        <g transform="translate(-7 -12)">
          <path
            d="M-8 44L-12 -58L12 -94L32 -70L66 -68L91 -86L100 -25L95 56Z"
            fill="#efa1a5"
            stroke={I}
            strokeWidth={3}
          />
          <path d="M4 46L9 -7L35 -27L60 0L87 10L80 69L24 72Z" fill="#fff4e9" />
          <path d="M2 -32L18 -38L24 -12L12 -4Z" fill="#ad704e" />
          <path d="M74 -54L91 -61L95 -28L80 -23Z" fill="#a36348" />
          <rect x={29} y={-8} width={5} height={5} fill={I} />
          <rect x={68} y={-8} width={5} height={5} fill={I} />
          <path
            d="M48 5l5 4l5 -4M53 9v6M40 15q6 8 13 0q6 8 13 0"
            fill="none"
            stroke={I}
            strokeWidth={2}
          />
          <path
            d="M-111 63H102L88 80H-95Z"
            fill="#231732"
            stroke={I}
            strokeWidth={3}
          />
          <rect
            x={-111}
            y={-52}
            width={81}
            height={99}
            rx={10}
            fill="#101019"
            stroke={I}
            strokeWidth={3}
          />
          <path d="M-96 -42L-99 18" stroke="white" strokeWidth={3} />
          <path d="M-74 47V65H-109" fill="none" stroke={I} strokeWidth={8} />
        </g>
        <g transform={`translate(0 121) scale(${enter(a, 0.27)})`}>
          <path
            d="M-157 -13L-124 -2L-144 23L-95 15H93L145 25L130 1L157 -12Z"
            fill="#cf538d"
            stroke={I}
            strokeWidth={2}
          />
          <path
            d="M-126 -25Q0 -11 126 -25V27Q0 9 -126 27Z"
            fill="#f67cac"
            stroke={I}
            strokeWidth={3}
          />
          <text
            x={0}
            y={7}
            textAnchor="middle"
            fontSize={25}
            fontWeight={900}
            fontFamily={font}
            fill="white"
            stroke={I}
            strokeWidth={2}
            paintOrder="stroke"
          >
            社区发起人
          </text>
        </g>
      </g>
      <Crown x={352} y={203} scale={enter(a, 0.7)} turn={14} />
      <Sticker
        x={157}
        y={189}
        w={108}
        h={35}
        text="@猫学长"
        angle={-8}
        size={15}
        scale={enter(a, 0.9)}
      />
      <g transform="translate(-70 539) rotate(-4)">
        <rect width={720} height={105} fill={I} />
        {Array.from({ length: 43 }, (_, n) => (
          <g key={n}>
            <rect x={n * 17 + 2} y={5} width={10} height={7} fill={C.white} />
            <rect x={n * 17 + 2} y={93} width={10} height={7} fill={C.white} />
          </g>
        ))}
        {Array.from({ length: 9 }, (_, n) => {
          const x = ((n * 88 - a * 30 + 900) % 792) - 88;
          return (
            <g key={n} transform={`translate(${x} 19)`}>
              <rect
                width={80}
                height={66}
                rx={4}
                fill={[C.gold, C.blue, C.green, C.peach, C.violet][n % 5]}
              />
              <Txt x={40} y={41} size={24} bold>
                {["●", "</>", "▲", "♥", "★"][n % 5]}
              </Txt>
            </g>
          );
        })}
      </g>
      <Sticker
        x={445}
        y={619}
        w={115}
        h={32}
        text="所有视频"
        fill={C.gold}
        angle={7}
        size={15}
      />
    </Stage>
  );
};

const Upload = ({ t }: { t: number }) => {
  const a = t - 118.03;
  const p = clamp(a / 1.78);
  return (
    <Stage bg={C.blue} t={t}>
      <path
        d="M127 228Q79 225 99 183Q108 162 138 167Q130 120 179 113Q207 73 249 109Q297 80 329 115Q378 103 390 142Q448 135 457 183Q475 228 425 230Z"
        fill={C.white}
        stroke={I}
        strokeWidth={4}
      />
      <Logo x={176} y={179} size={42} />
      <Txt x={303} y={188} size={28} bold>
        Motionface
      </Txt>
      <g transform={`translate(274 ${358 + Math.sin(a * 4) * 5})`}>
        <path
          d="M-24 41V-15H-57L0 -73L56 -15H24V41Z"
          fill={C.gold}
          stroke={I}
          strokeWidth={3}
        />
      </g>
      {Array.from({ length: 9 }, (_, n) => {
        const q = clamp((a - n * 0.11) / 1.05);
        if (q === 1) return null;
        const sx = 58 + ((n * 71) % 425);
        const sy = 570 + (n % 3) * 18;
        const x = mix(sx, 273, q) + Math.sin(q * Math.PI) * (n % 2 ? 35 : -35);
        const y = mix(sy, 173, q);
        return (
          <g
            key={n}
            transform={`translate(${x} ${y}) rotate(${n * 31 + q * 160}) scale(${1 - q * 0.6})`}
          >
            <rect
              x={-23}
              y={-26}
              width={46}
              height={52}
              rx={3}
              fill={[C.pink, C.gold, C.green, C.blue, C.peach, C.violet][n % 6]}
              stroke={I}
              strokeWidth={2}
            />
            <Txt x={0} y={7} size={15} bold>
              {n % 2 ? "▶" : "</>"}
            </Txt>
          </g>
        );
      })}
      <rect
        x={73}
        y={584}
        width={398}
        height={31}
        rx={16}
        fill={C.white}
        stroke={I}
        strokeWidth={3}
      />
      <rect x={79} y={590} width={386 * p} height={19} rx={10} fill={C.green} />
      {Array.from({ length: 21 }, (_, n) => (
        <path
          key={n}
          d={`M${90 + n * 18} 591l-8 16`}
          stroke="white"
          strokeWidth={3}
          opacity={clamp((386 * p - n * 18) / 15) * 0.35}
        />
      ))}
      <Txt x={272} y={569} size={20}>
        {p === 1 ? "上传完成 100%" : `上传中 ${Math.round(p * 100)}%`}
      </Txt>
      {p === 1 && (
        <g transform={`translate(461 561) scale(${enter(a, 1.78, 0.2)})`}>
          <circle r={25} fill={C.green} stroke={I} strokeWidth={3} />
          <path d="M-12 0l9 10L15 -13" fill="none" stroke={I} strokeWidth={4} />
        </g>
      )}
    </Stage>
  );
};

const Remix = ({ t }: { t: number }) => {
  const a = t - 120.2;
  return (
    <Stage bg="#fbd1e3" t={t} rays>
      <Sticker x={272} y={100} w={148} text="你可以" size={21} />
      <Shadow y={548} w={245} />
      <foreignObject x={69} y={177} width={406} height={374}>
        <div
          style={{
            width: 406,
            height: 374,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            perspective: 900,
          }}
        >
          <div
            style={{
              position: "relative",
              width: 204,
              height: 204,
              transformStyle: "preserve-3d",
              transform: `rotateX(-15deg) rotateY(${a * 110 - 25}deg) rotateZ(-4deg)`,
            }}
          >
            {[0, 1, 2, 3, 4, 5].map((n) => (
              <div
                key={n}
                style={{
                  position: "absolute",
                  width: 204,
                  height: 204,
                  boxSizing: "border-box",
                  border: `5px solid ${I}`,
                  borderRadius: 16,
                  background: [
                    C.gold,
                    C.green,
                    "#f878b5",
                    C.blue,
                    "#a792ee",
                    C.peach,
                  ][n],
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backfaceVisibility: "hidden",
                  fontFamily: font,
                  fontSize: n === 0 ? 40 : 62,
                  fontWeight: 900,
                  color: I,
                  transform:
                    n < 4
                      ? `rotateY(${n * 90}deg) translateZ(102px)`
                      : `rotateX(${n === 4 ? 90 : -90}deg) translateZ(102px)`,
                }}
              >
                {["借鉴", "</>", "★", "▶", "▣", "AI"][n]}
              </div>
            ))}
          </div>
        </div>
      </foreignObject>
      <g transform="translate(121 587) rotate(-9)">
        <text
          textAnchor="middle"
          fontSize={40}
          fontWeight={900}
          fontFamily={font}
          fill={C.gold}
          stroke={I}
          strokeWidth={4}
          paintOrder="stroke"
        >
          借鉴
        </text>
      </g>
      <g transform="translate(406 589) rotate(8)">
        <text
          textAnchor="middle"
          fontSize={39}
          fontWeight={900}
          fontFamily={font}
          fill={C.blue}
          stroke={I}
          strokeWidth={4}
          paintOrder="stroke"
        >
          Remix
        </text>
      </g>
    </Stage>
  );
};

const Microphone = ({ t }: { t: number }) => {
  const a = t - 121.55;
  const turn = Math.sin(a * 5) * 3;
  return (
    <Stage bg={C.peach} t={t}>
      <g transform={`translate(267 371) rotate(${turn})`}>
        <path
          d="M-88 -42V24Q-88 100 0 100Q88 100 88 24V-42M0 101V190M-78 199Q0 178 78 199Z"
          fill="none"
          stroke={I}
          strokeWidth={5}
          strokeLinecap="round"
        />
        <rect
          x={-56}
          y={-137}
          width={112}
          height={204}
          rx={54}
          fill="#a6a2b7"
          stroke={I}
          strokeWidth={4}
        />
        <rect
          x={-53}
          y={10}
          width={106}
          height={21}
          fill={C.coral}
          stroke={I}
          strokeWidth={3}
        />
        {[-90, -66, -42, -18].map((y) => (
          <path
            key={y}
            d={`M-34 ${y}H35`}
            stroke={I}
            strokeWidth={3}
            strokeLinecap="round"
          />
        ))}
        <path
          d="M-39 -96Q-25 -123 0 -122"
          fill="none"
          stroke="white"
          strokeWidth={3}
        />
        {[-1, 1].map((s) => (
          <g key={s} transform={`scale(${s} 1)`}>
            {[0, 1, 2].map((n) => (
              <path
                key={n}
                d={`M${103 + n * 15} -89Q${128 + n * 17} -13 ${102 + n * 15} 62`}
                fill="none"
                stroke={I}
                strokeWidth={2}
                opacity={0.4 + 0.4 * Math.sin(a * 8 - n)}
              />
            ))}
          </g>
        ))}
      </g>
      <g transform={`translate(375 160) rotate(6) scale(${enter(a, 0.25)})`}>
        <path
          d="M-88 -45H88V35H-35L-56 62L-55 35H-88Z"
          fill={C.white}
          stroke={I}
          strokeWidth={3}
          strokeLinejoin="round"
        />
        {[-42, 0, 42].map((x, n) => (
          <circle
            key={x}
            cx={x}
            cy={-3}
            r={11}
            fill={[C.pink, C.gold, C.blue][n]}
            stroke={I}
            strokeWidth={2}
          />
        ))}
      </g>
    </Stage>
  );
};

const Bulb = ({ x, y, s = 1 }: { x: number; y: number; s?: number }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path
      d="M-12 20Q-11 7 -20 -3Q-31 -36 0 -40Q31 -36 20 -3Q11 7 12 20Z"
      fill={C.gold}
      stroke={I}
      strokeWidth={3}
    />
    <path d="M-12 19H12V33H-12Z" fill="#9f9bad" stroke={I} strokeWidth={2} />
    {[0, 1, 2, 3, 4].map((n) => (
      <path
        key={n}
        d="M0 -49V-63"
        stroke={I}
        strokeWidth={2}
        transform={`rotate(${(n - 2) * 37} 0 -10)`}
      />
    ))}
  </g>
);

const Robot = ({ t }: { t: number }) => {
  const a = t - 123.25;
  const p = ease(a / 1.4);
  return (
    <Stage bg={C.mint} t={t} rays>
      <g transform={`translate(226 ${359 + Math.sin(t * 3) * 3})`}>
        <rect
          x={-123}
          y={-56}
          width={37}
          height={73}
          rx={18}
          fill={C.gold}
          stroke={I}
          strokeWidth={3}
        />
        <rect
          x={92}
          y={-56}
          width={37}
          height={73}
          rx={18}
          fill={C.gold}
          stroke={I}
          strokeWidth={3}
        />
        <path d="M0 -121V-145" stroke={I} strokeWidth={5} />
        <circle cy={-154} r={13} fill={C.coral} stroke={I} strokeWidth={3} />
        <rect
          x={-105}
          y={-113}
          width={212}
          height={205}
          rx={39}
          fill="#50bddb"
          stroke={I}
          strokeWidth={4}
        />
        <path
          d="M-88 -73Q-92 -97 -66 -99"
          fill="none"
          stroke="white"
          strokeWidth={4}
        />
        <rect x={-76} y={-77} width={154} height={135} rx={28} fill={I} />
        <ellipse cx={-32} cy={-32} rx={13} ry={21} fill="#61eab1" />
        <ellipse cx={33} cy={-32} rx={13} ry={21} fill="#61eab1" />
        <path
          d="M-31 14Q0 43 35 13"
          fill="none"
          stroke="#61eab1"
          strokeWidth={7}
          strokeLinecap="round"
        />
        <g transform={`translate(0 -119) scale(${enter(a, 0.75)})`}>
          <path
            d="M-105 -18L18 -75L112 -45L-7 9Z"
            fill={I}
            stroke={I}
            strokeWidth={3}
          />
          <path
            d="M-57 5V31Q0 48 51 12V-16"
            fill="#3f3452"
            stroke={I}
            strokeWidth={3}
          />
          <path d="M95 -40V27" stroke={C.gold} strokeWidth={3} />
          <circle
            cx={95}
            cy={31}
            r={6}
            fill={C.gold}
            stroke={I}
            strokeWidth={2}
          />
        </g>
      </g>
      <rect
        x={444}
        y={146}
        width={47}
        height={425}
        rx={24}
        fill={C.white}
        stroke={I}
        strokeWidth={3}
      />
      <rect
        x={451}
        y={565 - 411 * p}
        width={33}
        height={411 * p}
        rx={17}
        fill={p > 0.4 ? C.green : C.gold}
      />
      {[0, 1, 2, 3].map((n) => (
        <path
          key={n}
          d={`M444 ${240 + n * 80}h13`}
          stroke={I}
          strokeWidth={2}
        />
      ))}
      <path
        d="M467 130V94M451 109L467 93L482 109"
        fill="none"
        stroke={I}
        strokeWidth={5}
      />
      <Txt x={468} y={608} size={24} bold>
        IQ
      </Txt>
      <Bulb x={65} y={162} s={enter(a, 1.1) * 0.7} />
      <Bulb x={351} y={133} s={enter(a, 1.3) * 0.7} />
      <Sticker
        x={106}
        y={607}
        w={164}
        text="越来越聪明"
        fill={C.gold}
        angle={-7}
        scale={enter(a, 1.1)}
        size={18}
      />
    </Stage>
  );
};

const Cost = ({ t }: { t: number }) => {
  const a = t - 125.2;
  const p = inOut(a / 2.1);
  return (
    <Stage bg={C.pink} t={t}>
      <g transform={`translate(274 143) rotate(${Math.sin(a * 4) * 3})`}>
        <path d="M0 -90V-45" stroke={I} strokeWidth={2} />
        <rect
          x={-177}
          y={-50}
          width={354}
          height={102}
          rx={5}
          fill={C.white}
          stroke={I}
          strokeWidth={3}
        />
        <circle cy={-33} r={5} fill="none" stroke={I} strokeWidth={2} />
        <text
          x={0}
          y={22}
          textAnchor="middle"
          fontFamily={font}
          fontSize={41}
          fontWeight={900}
          fill={p > 0.6 ? C.coral : C.gold}
          stroke={I}
          strokeWidth={2}
          paintOrder="stroke"
        >
          ¥{p === 0 ? "0.01" : Math.round(9999 * p).toLocaleString("en-US")}
        </text>
      </g>
      <Person x={80} y={280} color={C.pink} scale={enter(a, 0.6)} worried />
      <path d="M47 574H494" stroke={I} strokeWidth={3} />
      {[0, 1, 2, 3].map((n) => {
        const q = ease((a - 0.2 - n * 0.14) / 1.65);
        const h = 12 + (n + 1) * 45 * q;
        const count = Math.ceil(h / 10);
        return (
          <g key={n}>
            {Array.from({ length: count }, (_, k) => (
              <g key={k}>
                <ellipse
                  cx={100 + n * 110}
                  cy={565 - k * 9}
                  rx={30}
                  ry={9}
                  fill={C.gold}
                  stroke={I}
                  strokeWidth={2}
                />
                <path
                  d={`M${70 + n * 110} ${563 - k * 9}v5M${130 + n * 110} ${563 - k * 9}v5`}
                  stroke={I}
                />
              </g>
            ))}
            <Txt x={100 + n * 110} y={566 - (count - 1) * 9} size={9}>
              Token
            </Txt>
          </g>
        );
      })}
      <path
        d="M67 518Q213 464 320 389T467 291"
        fill="none"
        stroke={I}
        strokeWidth={10}
        strokeLinecap="round"
        strokeDasharray={540}
        strokeDashoffset={540 * (1 - p)}
      />
      <path
        d="M67 518Q213 464 320 389T467 291"
        fill="none"
        stroke={C.coral}
        strokeWidth={6}
        strokeLinecap="round"
        strokeDasharray={540}
        strokeDashoffset={540 * (1 - p)}
      />
      <Sticker
        x={433}
        y={277}
        w={140}
        text="越来越贵"
        fill={C.coral}
        ink="white"
        angle={5}
        scale={enter(a, 1.1)}
        size={18}
      />
    </Stage>
  );
};

const Question = ({ t }: { t: number }) => {
  const a = t - 127.8;
  return (
    <Stage bg={C.violet} t={t}>
      <Shadow y={516} w={175} />
      <g transform={`translate(277 ${359 + Math.sin(a * 2) * 9}) rotate(-7)`}>
        <text
          x={9}
          y={15}
          textAnchor="middle"
          fontFamily={font}
          fontSize={238}
          fontWeight={900}
          fill="#c39a2d"
          stroke={I}
          strokeWidth={5}
        >
          ?
        </text>
        <text
          x={0}
          y={7}
          textAnchor="middle"
          fontFamily={font}
          fontSize={238}
          fontWeight={900}
          fill={C.gold}
          stroke={I}
          strokeWidth={4}
        >
          ?
        </text>
      </g>
      <Person x={86} y={567} color="#9b83df" scale={1.2} />
      {[0, 1, 2].map((n) => (
        <circle
          key={n}
          cx={105 + n * 18}
          cy={519 - n * 31}
          r={7 + n * 4}
          fill={C.white}
          stroke={I}
          strokeWidth={2}
          opacity={ease((a - n * 0.2) / 0.25)}
        />
      ))}
    </Stage>
  );
};

const Prohibit = ({
  x,
  y,
  r = 95,
  s = 1,
}: {
  x: number;
  y: number;
  r?: number;
  s?: number;
}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <circle r={r} fill="none" stroke={I} strokeWidth={33} />
    <circle r={r} fill="none" stroke={C.coral} strokeWidth={27} />
    <path
      d={`M${-r * 0.73} ${-r * 0.73}L${r * 0.73} ${r * 0.73}`}
      stroke={I}
      strokeWidth={33}
    />
    <path
      d={`M${-r * 0.73} ${-r * 0.73}L${r * 0.73} ${r * 0.73}`}
      stroke={C.coral}
      strokeWidth={27}
    />
  </g>
);

const Consumable = ({ t }: { t: number }) => {
  const a = t - 129.67;
  const move = ease((a - 0.2) / 1.3);
  return (
    <Stage bg="#cef5fd" t={t}>
      <Sticker
        x={272}
        y={99}
        w={199}
        text="一次性消费品?"
        fill="#ffa760"
        ink="white"
        angle={-4}
        size={20}
      />
      <g
        transform={`translate(${mix(250, 333, move)} ${mix(320, 381, move)}) rotate(${mix(-14, 18, move)}) scale(${1 - move * 0.45})`}
      >
        <path
          d="M-91 -98H91L68 115H-61Z"
          fill={C.white}
          stroke={I}
          strokeWidth={4}
        />
        <path d="M-85 -58H86L77 22H-75Z" fill="#72cfe9" />
        <rect
          x={-100}
          y={-108}
          width={202}
          height={19}
          rx={6}
          fill="#a3a0b3"
          stroke={I}
          strokeWidth={4}
        />
        <Chip x={0} y={-15} scale={0.63} />
        <Txt x={0} y={75} size={30} bold>
          算力
        </Txt>
      </g>
      <g transform="translate(424 536)">
        <path
          d="M-58 -30H58L44 70H-41Z"
          fill="#8f8aa3"
          stroke={I}
          strokeWidth={3}
        />
        <rect
          x={-67}
          y={-46}
          width={134}
          height={20}
          rx={5}
          fill="#aaa5b7"
          stroke={I}
          strokeWidth={3}
        />
        <path
          d="M-28 -16v70M0 -16v70M28 -16v70"
          stroke="#6a637d"
          strokeWidth={2}
        />
      </g>
      <Prohibit x={266} y={335} r={111} s={enter(a, 1.6, 0.3)} />
    </Stage>
  );
};

const Luxury = ({ t }: { t: number }) => {
  const a = t - 132.47;
  return (
    <Stage bg={C.dark} t={t} rays dark>
      <g transform={`translate(272 404) scale(${enter(a)})`}>
        <rect
          x={-132}
          y={74}
          width={264}
          height={120}
          rx={9}
          fill="#851a65"
          stroke={I}
          strokeWidth={4}
        />
        <rect
          x={-148}
          y={62}
          width={296}
          height={31}
          rx={10}
          fill="#c13183"
          stroke={I}
          strokeWidth={4}
        />
        <path
          d="M-120 133H120M-120 168H120"
          stroke={C.gold}
          strokeWidth={2}
          strokeDasharray="3 7"
        />
        <path
          d="M-120 70V-48C-120 -209 120 -209 120 -48V70Z"
          fill="#bcbad6"
          fillOpacity={0.13}
          stroke="#fffbea"
          strokeWidth={3}
        />
        <path
          d="M-104 -63Q-108 -137 -41 -153"
          fill="none"
          stroke="white"
          strokeWidth={4}
        />
        <Chip x={0} y={-7} scale={1.38} />
        <circle cy={-172} r={9} fill={C.gold} stroke={I} strokeWidth={2} />
      </g>
      <Sticker
        x={280}
        y={131}
        w={269}
        h={61}
        text="¥99,999,999"
        fill={C.gold}
        angle={-7}
        size={31}
        scale={enter(a, 0.34)}
      />
      <path
        d="M453 514L477 490L502 514L476 553Z"
        fill={C.blue}
        stroke={I}
        strokeWidth={2}
      />
      <path
        d="M453 514H502M466 499L476 553L487 500"
        fill="none"
        stroke={I}
        strokeWidth={1.5}
      />
      <Sticker
        x={89}
        y={617}
        w={117}
        h={36}
        text="奢侈品?"
        angle={-8}
        size={18}
      />
      <Prohibit x={274} y={359} r={119} s={enter(a, 1.07, 0.3)} />
    </Stage>
  );
};

const Sharing = ({ t }: { t: number }) => {
  const a = t - 134.3;
  return (
    <Stage bg={C.yellow} t={t} rays>
      <Sticker x={272} y={104} w={371} h={76} text="词元共享" size={34} />
      <ellipse
        cx={272}
        cy={403}
        rx={226}
        ry={92}
        fill="none"
        stroke={I}
        strokeWidth={3}
        strokeDasharray="2 8"
      />
      {Array.from({ length: 10 }, (_, n) => {
        const ang = (n * Math.PI) / 5;
        const x = 272 + Math.cos(ang) * 213;
        const y = 404 + Math.sin(ang) * 91;
        return (
          <Person
            key={n}
            x={x}
            y={y}
            color={[C.pink, C.blue, C.green, C.peach, C.gold][n % 5]}
            scale={enter(a, 0.08 * n) * 0.87}
          />
        );
      })}
      <g
        transform={`translate(275 342) scale(${enter(a, 0.25)}) scale(${0.68 + 0.32 * Math.abs(Math.cos(a * 3))} 1)`}
      >
        <Coin x={0} y={0} r={75} smile />
      </g>
      {Array.from({ length: 9 }, (_, n) => {
        const ang = a * 1.5 + (n * Math.PI * 2) / 9;
        const x = 272 + Math.cos(ang) * 174;
        const y = 398 + Math.sin(ang) * 65;
        return <Coin key={n} x={x} y={y} r={11} angle={Math.sin(ang) * 15} />;
      })}
      <Logo x={159} y={591} size={32} />
      <Txt x={329} y={598} size={23} bold>
        Motionface · 新模式
      </Txt>
    </Stage>
  );
};

const Celebrate = ({ t }: { t: number }) => {
  const a = t - 137.67;
  const title = "socialism!";
  const fade = clamp((t - 139.85) / 0.65);
  return (
    <g>
      <Stage bg={C.coral} t={t} rays>
        <Star
          x={272}
          y={259 + Math.sin(a * 4) * 6}
          r={138}
          fill={C.gold}
          turn={mix(-16, 0, ease(a / 0.6))}
          smile
        />
        {Array.from({ length: 50 }, (_, n) => {
          const x = 13 + ((n * 97) % 520);
          const y = ((n * 137 + a * (24 + (n % 5) * 9)) % 730) - 20;
          return (
            <rect
              key={n}
              x={x}
              y={y}
              width={5 + (n % 3) * 3}
              height={12}
              rx={1}
              fill={[C.gold, C.blue, C.green, C.pink, C.white][n % 5]}
              stroke={I}
              strokeWidth={0.6}
              transform={`rotate(${n * 27 + a * 18} ${x} ${y})`}
            />
          );
        })}
        <Txt x={274} y={446} size={35} fill="white" bold>
          for
        </Txt>
        {title.split("").map((l, n) => {
          const p = ease((a - 0.2 - n * 0.026) / 0.8);
          const targetX = 77 + n * 41;
          const sx = 272 + Math.sin(n * 3) * 220;
          const sy = 730 + (n % 3) * 75;
          return (
            <text
              key={n}
              x={mix(sx, targetX, p)}
              y={mix(sy, 498, p)}
              transform={`rotate(${(1 - p) * (n % 2 ? 130 : -120)} ${mix(sx, targetX, p)} ${mix(sy, 498, p)})`}
              fontFamily={font}
              fontSize={43}
              fontWeight={900}
              fill={C.gold}
              stroke={I}
              strokeWidth={4}
              paintOrder="stroke"
            >
              {l}
            </text>
          );
        })}
        {[0, 1, 2, 3, 4].map((n) => (
          <g
            key={n}
            transform={`translate(${55 + n * 110} 596) scale(${enter(a, 0.7 + n * 0.07)})`}
          >
            <Person
              x={0}
              y={0}
              color={[C.gold, C.blue, C.green, C.pink, C.violet][n]}
              wave
            />
            <Coin x={35} y={-33} r={10} />
          </g>
        ))}
      </Stage>
      <rect width={544} height={720} fill="black" opacity={fade} />
    </g>
  );
};

type SceneDef = {
  id: string;
  start: number;
  origin?: [number, number];
  iris?: boolean;
  duration?: number;
};
const scenes: SceneDef[] = [
  { id: "flow", start: 72, iris: false },
  { id: "gallery", start: 75, iris: false, duration: 0.22 },
  { id: "detail", start: 78.47, iris: false, duration: 0.12 },
  { id: "unlock", start: 80.1, iris: false, duration: 0.15 },
  { id: "repository", start: 83.2, iris: false, duration: 0.15 },
  { id: "copy", start: 85.85, iris: false, duration: 0.15 },
  { id: "prompt", start: 87.47, iris: false, duration: 0.14 },
  { id: "result", start: 90.17, origin: [431, 516] },
  { id: "compare", start: 91.7, iris: false, duration: 0.2 },
  { id: "brand", start: 94.9, iris: false, duration: 0.2 },
  { id: "ordinary", start: 96.27, iris: false, duration: 0.1 },
  { id: "quality", start: 98.8, origin: [275, 358] },
  { id: "phone", start: 101.6, origin: [313, 450], duration: 0.25 },
  { id: "feedback", start: 105.55, origin: [272, 338] },
  { id: "retire", start: 107.5, iris: false, duration: 0.1 },
  { id: "reward", start: 110.33, origin: [305, 426] },
  { id: "founder", start: 114.27, origin: [302, 433], duration: 0.28 },
  { id: "upload", start: 118.03, origin: [276, 337] },
  { id: "remix", start: 120.2, origin: [272, 367] },
  { id: "microphone", start: 121.55, origin: [272, 328] },
  { id: "robot", start: 123.25, origin: [256, 370] },
  { id: "cost", start: 125.2, origin: [270, 368] },
  { id: "question", start: 127.8, origin: [271, 401] },
  { id: "consumable", start: 129.67, origin: [274, 365] },
  { id: "luxury", start: 132.47, origin: [276, 365] },
  { id: "sharing", start: 134.3, origin: [271, 374] },
  { id: "celebration", start: 137.67, origin: [271, 363] },
];

const renderScene = (id: string, t: number): React.ReactNode => {
  const calibratedComic = comicV3Scene(id, t);
  if (calibratedComic) return calibratedComic;
  const calibratedWeb = webUIV3Scene(id, t);
  if (calibratedWeb) return calibratedWeb;
  if (id === "flow") return <Flow t={t} />;
  if (["gallery", "detail", "unlock", "repository", "copy"].includes(id))
    return <Software t={t} phase={id} />;
  if (id === "prompt") return <Prompt t={t} />;
  if (id === "result" || id === "compare")
    return <Results t={t} compare={id === "compare"} />;
  if (id === "brand")
    return (
      <Stage bg="#f1f5ec" t={t}>
        <g transform="translate(272 328)">
          <rect x={-39} y={-91} width={78} height={78} rx={22} fill="#fefff9" />
          <path
            d="M-22 -41L-12 -74L0 -51L19 -67L27 -36"
            fill="none"
            stroke={I}
            strokeWidth={9}
            strokeLinecap="round"
          />
          <Txt x={0} y={33} size={35} bold>
            Motion Face
          </Txt>
          <Txt x={0} y={67} size={18}>
            一人复刻 · 万人共享
          </Txt>
        </g>
      </Stage>
    );
  if (["ordinary", "quality", "feedback", "retire", "reward"].includes(id))
    return <Curation t={t} mode={id} />;
  if (id === "phone") return <Phone t={t} />;
  if (id === "founder") return <Creator t={t} />;
  if (id === "upload") return <Upload t={t} />;
  if (id === "remix") return <Remix t={t} />;
  if (id === "microphone") return <Microphone t={t} />;
  if (id === "robot") return <Robot t={t} />;
  if (id === "cost") return <Cost t={t} />;
  if (id === "question") return <Question t={t} />;
  if (id === "consumable") return <Consumable t={t} />;
  if (id === "luxury") return <Luxury t={t} />;
  if (id === "sharing") return <Sharing t={t} />;
  return <Celebrate t={t} />;
};

export const SecondHalf: React.FC<{ t: number }> = ({ t }) => {
  if (t < 72 || t > 140.5) return null;
  let index = 0;
  scenes.forEach((s, n) => {
    if (t >= s.start) index = n;
  });
  const current = scenes[index];
  const previous = scenes[Math.max(0, index - 1)];
  const calibrated = current.start >= 96.27;
  const duration =
    calibrated && current.iris !== false ? 0.2 : (current.duration ?? 0.32);
  const age = t - current.start;
  const transitioning = index > 0 && age < duration;
  const p =
    calibrated && current.iris !== false
      ? inOut(age / duration)
      : ease(age / duration);
  const origin = current.origin ?? [272, 360];
  const radius = p * 880;
  return (
    <svg
      width={544}
      height={720}
      viewBox="0 0 544 720"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: "block", overflow: "hidden", fontFamily: font }}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {transitioning && current.iris !== false ? (
        <>
          <defs>
            <clipPath id="second-half-iris">
              <circle cx={origin[0]} cy={origin[1]} r={radius} />
            </clipPath>
          </defs>
          {renderScene(previous.id, t)}
          <g clipPath="url(#second-half-iris)">{renderScene(current.id, t)}</g>
          <circle
            cx={origin[0]}
            cy={origin[1]}
            r={radius}
            fill="none"
            stroke={I}
            strokeWidth={4}
          />
        </>
      ) : transitioning ? (
        <>
          {renderScene(previous.id, t)}
          <g opacity={p}>{renderScene(current.id, t)}</g>
        </>
      ) : (
        renderScene(current.id, t)
      )}
    </svg>
  );
};
