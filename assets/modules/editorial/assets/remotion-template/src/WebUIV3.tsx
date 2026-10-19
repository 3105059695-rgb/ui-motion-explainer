import React from "react";
import { staticFile } from "remotion";
import "@fontsource/tinos/700.css";

const clamp = (x: number) => Math.max(0, Math.min(1, x));
const smooth = (t: number, a: number, b: number) => {
  const p = clamp((t - a) / (b - a));
  return p * p * (3 - 2 * p);
};
const lerp = (a: number, b: number, p: number) => a + (b - a) * p;
const ink = "#202d27";
const Text: React.FC<{
  x: number;
  y: number;
  size?: number;
  weight?: number;
  fill?: string;
  children: React.ReactNode;
}> = ({ x, y, size = 12, weight = 400, fill = ink, children }) => (
  <text
    x={x}
    y={y}
    fontSize={size}
    fontWeight={weight}
    fill={fill}
    fontFamily="Noto Sans SC"
  >
    {children}
  </text>
);
const Cursor = ({
  x,
  y,
  click = 0,
}: {
  x: number;
  y: number;
  click?: number;
}) => (
  <g transform={`translate(${x} ${y})`}>
    <circle r={click * 19} fill="none" stroke="#458c75" opacity={1 - click} />
    <path
      d="M0 0L1 14L5 10L9 17L12 15L8 9L15 8Z"
      stroke="white"
      strokeWidth={1.3}
      fill="#101713"
    />
  </g>
);
const Github = ({
  x = 0,
  y = 0,
  s = 1,
}: {
  x?: number;
  y?: number;
  s?: number;
}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path
      d="M0-9C-12-9-13 8-3 10L-3 6C-8 7-8 3-10 2L-8 2C-6 5-5 4-3 4L-2 2C-10 2-9-5-6-6L-6-10L-2-8L3-8L7-10L7-6C11-2 9 2 3 2L4 5L4 10C15 7 13-9 0-9Z"
      fill="currentColor"
    />
  </g>
);
const Paths = () => (
  <defs>
    <filter id="ui-v3-shadow" x="-40%" y="-40%" width="180%" height="200%">
      <feDropShadow
        dx="0"
        dy="14"
        stdDeviation="12"
        floodColor="#23362a"
        floodOpacity=".24"
      />
    </filter>
    <filter id="ui-v3-bg-blur">
      <feGaussianBlur stdDeviation="4" />
    </filter>
  </defs>
);

const cards = [
  { file: "black", x: 25, y: 285, w: 107, h: 91 },
  { file: "green", x: 140, y: 285, w: 107, h: 91 },
  { file: "blue", x: 255, y: 285, w: 107, h: 220 },
  { file: "news", x: 25, y: 384, w: 107, h: 90 },
  { file: "chat", x: 140, y: 384, w: 107, h: 90 },
  { file: "folder", x: 25, y: 482, w: 107, h: 220 },
  { file: "graph", x: 140, y: 482, w: 107, h: 220 },
  { file: "green-ui", x: 255, y: 514, w: 107, h: 185 },
];
const Page = ({ t }: { t: number }) => {
  const p = smooth(t, 76.18, 77.28);
  const z = lerp(1, 1.225, p);
  const top = lerp(50, -249, p);
  return (
    <g transform={`translate(22 ${top}) scale(${z})`}>
      <rect
        width={500}
        height={568 + p * 330}
        rx={8}
        fill="#f9fafb"
        filter="url(#ui-v3-shadow)"
      />
      <defs>
        <clipPath id="web-v3-page-clip">
          <rect width={500} height={568 + p * 330} rx={8} />
        </clipPath>
      </defs>
      <g clipPath="url(#web-v3-page-clip)">
        <rect width={500} height={30} fill="white" />
        <Text x={25} y={19} size={8} weight={700}>
          ϟ Motion Face
        </Text>
        <Text x={107} y={19} size={5}>
          探索广场 最新动态 创作者
        </Text>
        <Text x={409} y={19} size={6}>
          36 Face ▣ 账户⌄
        </Text>
        <path d="M106 29h24" stroke={ink} />
        <Text x={25} y={57} size={4} fill="#758a80">
          ●—————— SINCE VIBE CODING
        </Text>
        <Text x={25} y={80} size={17} weight={700}>
          一人复刻，
        </Text>
        <Text x={25} y={104} size={17} weight={700} fill="#718b7a">
          万人共享
        </Text>
        <Text x={25} y={120} size={5.4} fill="#67766f">
          一个人用 AI 复刻好的动效代码，所有人都能用 remix 做自己的内容。
        </Text>
        <rect x={25} y={132} width={132} height={27} rx={4} fill="white" />
        <Text x={33} y={143} size={4.5} fill="#7b837e">
          Vibe Film Editors 找参考 → AI代码复刻 → remix 内容
        </Text>
        <Text x={33} y={153} size={4.5}>
          Motion Face 找参考 → remix 内容
        </Text>
        <Text x={25} y={180} size={6}>
          tokens 消耗减少{" "}
          <tspan fontSize={12} fill="#428566" fontWeight={700}>
            95%
          </tspan>
        </Text>
        <rect x={25} y={190} width={66} height={16} rx={3} fill="#244c3c" />
        <Text x={32} y={201} size={5.5} weight={600} fill="white">
          探索优质动效代码 ↗
        </Text>
        {[0, 1, 2].map((n) => (
          <g key={n} transform={`translate(${337 + n * 35} 68)`}>
            <rect
              width={32}
              height={41}
              rx={3}
              fill="#f4f5f0"
              stroke="#e1e7dc"
            />
            <Text x={8} y={13} size={11}>
              &lt;/&gt;
            </Text>
            {[20, 25, 30].map((y) => (
              <path
                key={y}
                d={`M5 ${y}h22`}
                stroke={y === 25 ? "#d9d48c" : "#c8d5c7"}
                strokeWidth={2}
              />
            ))}
          </g>
        ))}
        <Text x={365} y={133} size={8}>
          ◉ Codex
          <tspan fontFamily="Tinos" fontStyle="italic" fontSize={15}>
            Remix
          </tspan>
        </Text>
        {["black", "graph", "folder"].map((f, n) => (
          <image
            key={f}
            href={staticFile(`reference-assets/ui-v3/card-${f}.png`)}
            x={337 + n * 39}
            y={148}
            width={33}
            height={43}
            preserveAspectRatio="xMidYMid slice"
          />
        ))}
        <path d="M25 224H475" stroke="#eef0ed" />
        <Text x={25} y={240} size={4.5} fill="#596c61">
          THE PLAZA
        </Text>
        <Text x={25} y={252} size={9} weight={700}>
          探索动效广场{" "}
          <tspan fontSize={5} fill="#6c7e71">
            29
          </tspan>
        </Text>
        <rect x={25} y={263} width={20} height={11} rx={4} fill="#e8efeb" />
        <Text x={30} y={271} size={5}>
          全部
        </Text>
        <Text x={52} y={271} size={5} fill="#9aa69f">
          最近30秒
        </Text>
        {cards.map((c) => (
          <image
            key={c.file}
            href={staticFile(`reference-assets/ui-v3/card-${c.file}.png`)}
            x={c.x}
            y={c.y}
            width={c.w}
            height={c.h}
            preserveAspectRatio="none"
          />
        ))}
        {[0, 1, 2].map((n) => (
          <g key={n} transform={`translate(370 ${285 + n * 100})`}>
            <rect
              width={105}
              height={91}
              rx={6}
              fill={n === 0 ? "#f4edeb" : n === 1 ? "#071a67" : "#f0f1ee"}
              stroke="#d9ddd9"
            />
            <Text
              x={29}
              y={43}
              size={n === 2 ? 21 : 7}
              fill={n === 1 ? "white" : ink}
            >
              {["cloud motion", "by sandydesignstudio", "STOP"][n]}
            </Text>
            <rect y={62} width={105} height={29} fill="#fff" />
            <Text x={5} y={73} size={5}>
              创作者 · 动效作品
            </Text>
            <Text x={5} y={84} size={4} fill="#98a39c">
              ◉ guangjun5952 ♧ 0 ♡ 0
            </Text>
          </g>
        ))}
      </g>
    </g>
  );
};
const Article = ({ w = 336, h = 317 }: { w?: number; h?: number }) => (
  <g>
    <rect width={w} height={h} fill="#111b17" />
    <rect y={h * 0.165} width={w} height={h * 0.595} fill="#fafaf7" />
    <path
      d={`M${w * 0.13} ${h * 0.305}H${w * 0.86}`}
      stroke="#39493d"
      strokeWidth={0.6}
    />
    <text x={w * 0.13} y={h * 0.333} fontSize={3.6} fill={ink}>
      NEWS / TECHNOLOGY
    </text>
    <text
      x={w * 0.13}
      y={h * 0.395}
      fontFamily="Tinos"
      fontWeight={700}
      fontSize={15.6}
      fill="#0b130d"
    >
      <tspan x={w * 0.13}>NYC’s official chatbot hallucinates,</tspan>
      <tspan x={w * 0.13} dy={18}>
        tells businesses to break the law.
      </tspan>
    </text>
    <Text x={10} y={h - 9} size={4.3} fill="#859087">
      原视频 1:29 · 9.6 MB · 1920 × 1080
    </Text>
  </g>
);
const Detail = ({ t }: { t: number }) => {
  const loading = t >= 81.08 && t < 81.65;
  const unlocked = t >= 81.65;
  return (
    <g>
      <rect width={186} height={unlocked ? 373 : 317} fill="white" />
      <rect x={14} y={14} width={30} height={12} rx={4} fill="#f0f5f0" />
      <Text x={19} y={22} size={5} fill="#6b7c71">
        ◈ 公开
      </Text>
      <Text x={13} y={46} size={11.2} weight={700}>
        Giga · 幻觉检测与纠正
      </Text>
      <circle cx={19} cy={63} r={6} fill="#edf2ef" />
      <Text x={17} y={65} size={5} weight={700}>
        G
      </Text>
      <Text x={27} y={65} size={5.3}>
        guangjun5952 <tspan fill="#888">2026/09/24 19:12 上传</tspan>
      </Text>
      <Text x={13} y={87} size={6.2} fill="#7a827c">
        新闻标题逐词浮现，橙色高亮扫过关键词，
      </Text>
      <Text x={13} y={97} size={6.2} fill="#7a827c">
        删除线纠正 AI 幻觉内容。
      </Text>
      <path d="M13 111H174M13 149H174" stroke="#edf0eb" />
      <rect
        x={13}
        y={119}
        width={26}
        height={19}
        rx={4}
        fill="white"
        stroke="#eef0ec"
      />
      <Text x={17} y={131} size={6} fill="#737e77">
        ♧ 12
      </Text>
      <rect
        x={44}
        y={119}
        width={25}
        height={19}
        rx={4}
        fill="white"
        stroke="#eef0ec"
      />
      <Text x={49} y={131} size={6} fill="#737e77">
        ♧ 0
      </Text>
      <Text x={149} y={131} size={6} fill="#737e77">
        ⇧ 分享
      </Text>
      <rect
        x={13}
        y={162}
        width={161}
        height={unlocked ? 44 : 56}
        rx={7}
        fill="#f7f9f5"
        stroke="#e1e4de"
        strokeWidth={0.6}
      />
      <Text x={20} y={177} size={5.5} fill="#526950">
        {unlocked
          ? "本视频全部 GitHub URL 已解锁 · 有效期至"
          : "本视频共有 2 个 GitHub 仓库 · 10 Face 解锁全部 URL"}
      </Text>
      <Text x={20} y={186} size={5.5} fill="#526950">
        {unlocked ? "2026/09/29 21:05:18" : "24 小时有效"}
      </Text>
      {unlocked ? (
        <g>
          {[0, 1].map((n) => (
            <g key={n}>
              <Text
                x={13}
                y={228 + n * 45}
                size={6.3}
                weight={600}
                fill="#2d5144"
              >
                {n
                  ? "sxhzju/giga-headline-motion ↗"
                  : "sxhzju/giga-hallucination-remotion ↗"}
              </Text>
              <Text x={13} y={244 + n * 45} size={5.6} fill="#818e86">
                其他用户的复刻
              </Text>
              <rect
                x={154}
                y={223 + n * 45}
                width={21}
                height={17}
                rx={4}
                fill="#fafbf9"
                stroke="#e2e4e0"
              />
              <Text x={159} y={234 + n * 45} size={5.2} fill="#50694f">
                复制
              </Text>
              <path d={`M13 ${253 + n * 45}H174`} stroke="#eef0ed" />
            </g>
          ))}
          <Text x={13} y={319} size={7} weight={600}>
            &lt;/&gt; Remotion 复刻
          </Text>
          <rect
            x={138}
            y={308}
            width={37}
            height={18}
            rx={5}
            fill="#eef3e9"
            stroke="#e1e8dd"
          />
          <Text x={144} y={319} size={5.5}>
            绑定仓库 +
          </Text>
          <Text x={13} y={341} size={6} fill="#7e8b83">
            分享你的 Remotion 版本。
          </Text>
          <Text x={13} y={362} size={5} fill="#98a29a">
            每人限绑一个 GitHub 仓库 · 仅可移除自己的绑定
          </Text>
        </g>
      ) : (
        <g>
          <rect
            x={20}
            y={194}
            width={loading ? 42 : 85}
            height={17}
            rx={4}
            fill={loading ? "#9ba7a0" : "#294f41"}
          />
          <Text x={24} y={205} size={5.1} weight={500} fill="white">
            {loading ? "正在解锁…" : "10 Face · 解锁此视频全部仓库"}
          </Text>
          <Text x={13} y={239} size={6.5} weight={600}>
            &lt;/&gt; Remotion 复刻
          </Text>
          <rect x={138} y={230} width={37} height={17} rx={4} fill="#eef2e8" />
          <Text x={144} y={241} size={5}>
            绑定仓库 +
          </Text>
          <Text x={13} y={260} size={5.6} fill="#839086">
            分享你的 Remotion 版本。
          </Text>
          <Text x={13} y={277} size={4.6} fill="#89978d">
            每人限绑一个 GitHub 仓库 · 仅可移除自己的绑定
          </Text>
        </g>
      )}
    </g>
  );
};
const CopyPanel = ({ t }: { t: number }) => (
  <g>
    <rect x={1} y={-240} width={455} height={793} rx={21} fill="white" />
    <Text x={31} y={13} size={13} fill="#7c847d">
      内容。
    </Text>
    <path d="M31 42H427M31 127H427M31 333H427M31 416H427" stroke="#eceeea" />
    {[0, 1].map((n) => (
      <g key={n}>
        <rect
          x={32 + n * 77}
          y={65}
          width={66}
          height={36}
          rx={8}
          fill="white"
          stroke="#e6e8e4"
        />
        <Text x={46 + n * 77} y={88} size={14} fill="#7d8780">
          {n ? "♧ 0" : "♧ 12"}
        </Text>
      </g>
    ))}
    <Text x={370} y={87} size={13} fill="#78827a">
      ⇧ 分享
    </Text>
    <rect
      x={31}
      y={152}
      width={395}
      height={83}
      rx={14}
      fill="#f7f9f5"
      stroke="#dfe3db"
    />
    <Text x={50} y={185} size={13} fill="#526b51">
      本视频全部 GitHub URL 已解锁 · 有效期至 2026/9/29
    </Text>
    <Text x={50} y={209} size={13} fill="#526b51">
      21:05:18
    </Text>
    {[0, 1].map((n) => (
      <g key={n}>
        <Text x={31} y={284 + n * 82} size={14} weight={600} fill="#345749">
          {n
            ? "sxhzju/giga-headline-motion ↗"
            : "sxhzju/giga-hallucination-remotion ↗"}
        </Text>
        <Text x={31} y={313 + n * 82} size={12} fill="#959e97">
          其他用户的复刻
        </Text>
        <rect
          x={379}
          y={277 + n * 82}
          width={45}
          height={31}
          rx={9}
          fill="#fafbf9"
          stroke="#dfe3db"
        />
        <Text x={390} y={297 + n * 82} size={12} fill="#597152">
          复制
        </Text>
      </g>
    ))}
    <Text x={31} y={462} size={16} weight={600}>
      &lt;/&gt; Remotion 复刻
    </Text>
    <rect
      x={337}
      y={437}
      width={88}
      height={36}
      rx={10}
      fill="#eef3e9"
      stroke="#dfe7d9"
    />
    <Text x={352} y={460} size={12} fill="#5b7254">
      绑定仓库 +
    </Text>
    <Text x={31} y={503} size={13} fill="#8a978b">
      分享你的 Remotion 版本。
    </Text>
    <Text x={31} y={542} size={10.5} fill="#939e91">
      每人限绑一个 GitHub 仓库 · 仅可移除自己的绑定
    </Text>
    <Cursor x={410} y={308} click={t > 86.7 ? clamp((t - 86.7) * 4) : 0} />
  </g>
);

const Url = ({ t, chat = false }: { t: number; chat?: boolean }) => {
  const p = smooth(t, 87.32, 87.7);
  return (
    <g transform={`translate(78 ${lerp(281, 257, p)}) rotate(${-1.5 * p})`}>
      <rect
        x={chat ? 4 : 0}
        y={chat ? 5 : 3}
        width={324}
        height={40}
        rx={20}
        fill={chat ? ink : "#8a9b8e"}
        opacity={chat ? 1 : 0.25}
      />
      <rect
        width={324}
        height={40}
        rx={20}
        fill={chat ? "#b6e9dc" : "#fff"}
        stroke={chat ? ink : "none"}
        strokeWidth={2.5}
      />
      <Github x={20} y={20} s={0.55} />
      <Text x={34} y={26} size={15} weight={600} fill="#294d42">
        sxhzju/giga-hallucination-remotion
      </Text>
    </g>
  );
};
const Repo = ({ t }: { t: number }) => {
  const p = smooth(t, 83.2, 83.55);
  return (
    <g transform={`translate(35 ${lerp(145, 55, p)})`} opacity={p}>
      <rect
        width={474}
        height={500}
        rx={12}
        fill="white"
        filter="url(#ui-v3-shadow)"
      />
      <path d="M0 32H474" stroke="#e9ebed" />
      <Github x={22} y={16} s={0.64} />
      <Text x={16} y={60} size={13} fill="#17649a">
        ▣ sxhzju / <tspan fontWeight={700}>giga-hallucination-remotion</tspan>
      </Text>
      <rect
        x={289}
        y={49}
        width={31}
        height={13}
        rx={7}
        fill="white"
        stroke="#e2e6e8"
      />
      <Text x={294} y={59} size={7} fill="#737b7a">
        Public
      </Text>
      <Text x={16} y={83} size={8}>
        ⌘ Code Issues Pull requests Actions
      </Text>
      <path d="M15 93H459M15 94H55" stroke="#dec8c2" />
      <rect
        x={16}
        y={105}
        width={44}
        height={19}
        rx={3}
        fill="#f8faf8"
        stroke="#e5e8e4"
      />
      <Text x={24} y={118} size={8}>
        ⑂ main
      </Text>
      <Text x={67} y={118} size={8}>
        1 branch · 0 tags
      </Text>
      <rect x={404} y={105} width={54} height={19} rx={4} fill="#237d42" />
      <Text x={410} y={118} size={8} fill="white">
        &lt;&gt; Code⌄
      </Text>
      <rect
        x={16}
        y={134}
        width={442}
        height={27}
        fill="#f7f8fa"
        stroke="#e5e8ed"
      />
      <Text x={24} y={151} size={7}>
        ◉ sxhzju Remotion 复刻 · Giga · 幻觉检测与纠正
      </Text>
      <Text x={413} y={151} size={7}>
        3 commits
      </Text>
      {[
        "public",
        "src",
        "src/GigaHeadline.tsx",
        "src/Root.tsx",
        "package.json",
        "remotion.config.ts",
        "README.md",
      ].map((f, n) => (
        <g key={f}>
          <path d={`M16 ${162 + n * 25}H458`} stroke="#eff0f0" />
          <Text x={25} y={178 + n * 25} size={8} fill={n < 2 ? "#45a5db" : ink}>
            ▱
          </Text>
          <Text x={41} y={178 + n * 25} size={8}>
            {f}
          </Text>
          <text
            x={449}
            y={178 + n * 25}
            fontSize={7}
            textAnchor="end"
            fill="#6c7770"
          >
            {
              [
                "fonts & reference frames",
                "headline, highlight & strike motion",
                "word rise + highlight sweep",
                "register composition 1920×1080",
                "remotion 4.0",
                "render settings",
                "how to remix",
              ][n]
            }
          </text>
        </g>
      ))}
      <rect
        x={16}
        y={343}
        width={442}
        height={72}
        rx={5}
        fill="white"
        stroke="#e4e8e5"
      />
      <Text x={27} y={365} size={12} weight={700}>
        Giga · 幻觉检测与纠正
      </Text>
      <Text x={27} y={384} size={8} fill="#7c827d">
        用 Remotion 复刻的新闻标题动效。修改 src/content.ts 即可换成你的内容。
      </Text>
      <rect x={27} y={393} width={132} height={14} fill="#f4f5f4" />
      <Text x={32} y={403} size={7}>
        npm i &amp;&amp; npx remotion studio
      </Text>
      {t > 84.03 && (
        <g
          transform={`translate(${lerp(490, 164, smooth(t, 84.03, 84.4))} 278) rotate(-3)`}
        >
          <rect
            width={300}
            height={194}
            rx={9}
            fill="#172026"
            filter="url(#ui-v3-shadow)"
          />
          <Text x={14} y={20} size={8} fill="#a6b5af">
            src / GigaHeadline.tsx
          </Text>
          {[
            "import {AbsoluteFill, useCurrentFrame} from 'remotion';",
            "export const GigaHeadline = () => {",
            "  const frame = useCurrentFrame();",
            "  const words = headline.split(' ');",
            "  return <AbsoluteFill style={{background:'#fafaf7'}}>",
            "    {words.map((word, index) => (",
            "      <span style={{opacity: progress(frame, index)}}>",
            "        {word}",
            "      </span>",
            "    ))}",
            "  </AbsoluteFill>;",
            "};",
          ].map((s, i) => (
            <Text
              key={i}
              x={12}
              y={39 + i * 12}
              size={6.8}
              fill={
                i % 3 === 0 ? "#9fbb8c" : i % 3 === 1 ? "#c8a6d5" : "#abc4ce"
              }
            >
              {s}
            </Text>
          ))}
        </g>
      )}
    </g>
  );
};

const Software = ({ t, phase }: { t: number; phase: string }) => {
  const dark = phase !== "gallery";
  const p = smooth(t, 80.1, 80.55);
  const z = lerp(1, 1.65, p);
  return (
    <g>
      <Paths />
      <rect width={544} height={720} fill="#edf0e8" />
      <g filter={dark ? "url(#ui-v3-bg-blur)" : undefined}>
        <Page t={dark ? 77.5 : t} />
      </g>
      {phase === "gallery" ? (
        <Cursor
          x={lerp(480, 110, smooth(t, 77.4, 78.37))}
          y={lerp(531, 274, smooth(t, 77.4, 78.37))}
          click={clamp((t - 78.33) * 10)}
        />
      ) : (
        <>
          <rect width={544} height={720} fill="#0b1917" opacity={0.78} />
          {phase === "copy" ? (
            <CopyPanel t={t} />
          ) : (
            <g
              transform={`translate(${lerp(7, -410, p)} ${lerp(154, 117, p)}) scale(${z})`}
            >
              <rect
                width={522}
                height={t >= 81.65 ? 400 : 343}
                rx={9}
                fill="white"
              />
              <Text x={12} y={17} size={5.6}>
                ▣ 视频详情
              </Text>
              <Text x={502} y={17} size={10} fill="#999">
                ×
              </Text>
              <g transform="translate(0 27)">
                <Article />
              </g>
              <g transform="translate(336 27)">
                <Detail t={t} />
              </g>
            </g>
          )}
          {phase === "unlock" && (
            <Cursor
              x={lerp(442, 280, smooth(t, 80.45, 81))}
              y={lerp(439, 490, smooth(t, 80.45, 81))}
              click={clamp((t - 81.02) / 0.4)}
            />
          )}
          {t > 81.15 && t < 82.15 && (
            <g>
              <rect
                x={134}
                y={315}
                width={335}
                height={43}
                rx={12}
                fill="#fff"
                filter="url(#ui-v3-shadow)"
              />
              <Text x={147} y={341} size={12} fill="#81968a">
                {t < 81.65 ? "◯" : "✓"}
              </Text>
              <Text x={170} y={341} size={10}>
                {t < 81.65 ? "正在解锁 GitHub 链接…" : "GitHub 仓库已解锁"}
              </Text>
              <Text x={445} y={341} size={12} fill="#999">
                ×
              </Text>
            </g>
          )}
          {phase === "repository" && <Repo t={t} />}
          {phase === "copy" && t > 86.92 && (
            <g opacity={smooth(t, 86.92, 87.05)}>
              <rect
                x={-9}
                y={143}
                width={496}
                height={68}
                rx={16}
                fill="#fff"
                opacity={0.97}
                filter="url(#ui-v3-shadow)"
              />
              <Text x={23} y={183} size={14}>
                ✓ GitHub 地址已复制
              </Text>
              <Text x={447} y={183} size={20} fill="#929a94">
                ×
              </Text>
              <Url t={t} />
            </g>
          )}
        </>
      )}
    </g>
  );
};
const Prompt = ({ t }: { t: number }) => {
  const reveal = smooth(t, 87.47, 87.68);
  const typed =
    "把标题和正文换成 Motion Face 的内容：一人复刻，万人共享。".slice(
      0,
      Math.floor(clamp((t - 88.36) / 1.82) * 43),
    );
  return (
    <g>
      <rect width={544} height={720} fill="#e9f5ee" />
      <g opacity={smooth(t, 87.78, 88.1)}>
        {[
          [93, 75],
          [488, 104],
          [56, 111],
          [262, 185],
          [207, 609],
          [442, 585],
        ].map(([x, y], i) => (
          <g key={i} transform={`translate(${x} ${y}) rotate(${i * 31})`}>
            <path
              d={
                i % 2
                  ? "M-5 0H5M0-5V5"
                  : "M-9-9Q0-3 9-9Q3 0 9 9Q0 3-9 9Q-3 0-9-9Z"
              }
              stroke={i % 2 ? "#edc959" : ink}
              strokeWidth={2.5}
              fill={i % 2 ? "none" : "#cec6e9"}
            />
          </g>
        ))}
      </g>
      <g transform={`translate(272 278) scale(${reveal}) translate(-272 -278)`}>
        <rect
          x={41}
          y={191}
          width={463}
          height={318}
          rx={23}
          fill="#fff"
          stroke={ink}
          strokeWidth={3}
        />
        <path d="M42 239H503" stroke={ink} strokeWidth={2.7} />
        {[69, 91, 113].map((x, i) => (
          <circle
            key={x}
            cx={x}
            cy={214}
            r={5.7}
            fill={["#efd37e", "#f5d594", "#acddce"][i]}
            stroke={ink}
            strokeWidth={2.5}
          />
        ))}
        <Text x={213} y={222} size={19} weight={700}>
          ✿ 和 AI 说
        </Text>
        <path d="M132 509h5M268 509h5" stroke="white" strokeWidth={5} />
      </g>
      <Url t={t} chat />
      {t >= 88.04 && (
        <g opacity={smooth(t, 88.04, 88.24)}>
          <rect x={65} y={320} width={308} height={56} rx={11} fill={ink} />
          <rect
            x={62}
            y={316}
            width={307}
            height={56}
            rx={10}
            fill="#ffe8a0"
            stroke={ink}
            strokeWidth={2.4}
          />
          <image
            href={staticFile("reference-assets/ui-v3/card-news.png")}
            x={70}
            y={325}
            width={73}
            height={39}
            preserveAspectRatio="xMidYMin slice"
          />
          <rect
            x={70}
            y={325}
            width={73}
            height={39}
            rx={4}
            fill="none"
            stroke={ink}
            strokeWidth={1.6}
          />
          <Text x={155} y={351} size={15} weight={600}>
            参考：Giga · 幻觉检测与纠正
          </Text>
        </g>
      )}
      <foreignObject x={64} y={392} width={416} height={76}>
        <div
          style={{
            fontFamily: "Noto Sans SC",
            fontSize: 22,
            fontWeight: 700,
            lineHeight: 1.38,
            color: ink,
          }}
        >
          {typed}
          {t < 89.67 ? "│" : ""}
        </div>
      </foreignObject>
      {t > 88.35 && (
        <g
          transform={`translate(455 468) scale(${1 + Math.sin(clamp((t - 89.83) / 0.25) * Math.PI) * 0.13})`}
        >
          <circle r={24} fill="#a9d9cb" stroke={ink} strokeWidth={3} />
          <path
            d="M0 12V-12M-10-1L0-12L10-1"
            stroke={ink}
            strokeWidth={4}
            fill="none"
          />
        </g>
      )}
    </g>
  );
};

const Paper = ({
  x,
  y,
  w = 460,
  h = 246,
  original = false,
  t,
  rotation = 0,
}: {
  x: number;
  y: number;
  w?: number;
  h?: number;
  original?: boolean;
  t: number;
  rotation?: number;
}) => {
  const mark = smooth(t, 92.77, 93.12);
  return (
    <g transform={`translate(${x} ${y}) rotate(${rotation})`}>
      <rect
        width={w}
        height={h}
        rx={12}
        fill="#fdfdf9"
        filter="url(#ui-v3-shadow)"
      />
      <path
        d={`M${w * 0.13} 58H${w * 0.87}`}
        stroke="#586257"
        strokeWidth={0.7}
      />
      <Text x={w * 0.13} y={69} size={4.7} weight={600}>
        NEWS / {original ? "TECHNOLOGY" : "MOTION FACE"}
      </Text>
      {t > 92.7 && (
        <rect
          x={original ? 97 : 79}
          y={original ? 105 : 105}
          width={(original ? 116 : 59) * mark}
          height={16}
          fill="#eeb765"
        />
      )}
      <text
        x={w * 0.13}
        y={92}
        fontFamily={original ? "Tinos" : "Noto Serif SC"}
        fontWeight={700}
        fontSize={original ? 21 : 18.5}
        fill="#101b13"
      >
        <tspan
          x={w * 0.13}
          opacity={original || t >= 91.7 ? 1 : smooth(t, 90.42, 90.72)}
        >
          {original
            ? "NYC’s official chatbot hallucinates,"
            : "一人用 AI 复刻好的动效代码，"}
        </tspan>
        <tspan
          x={w * 0.13}
          dy={23}
          opacity={original || t >= 91.7 ? 1 : smooth(t, 90.73, 91.02)}
        >
          {original
            ? "tells businesses to break the law."
            : "让所有人都不必 从零复刻。"}
        </tspan>
      </text>
      <g opacity={original || t >= 91.7 ? 1 : smooth(t, 91.08, 91.34)}>
        <Text x={w * 0.13} y={156} size={5.3} fill="#788375">
          {original
            ? "As companies deploy AI systems, inaccurate responses can have real consequences. The incident raises questions"
            : "Motion Face 是重新理解 Remotion 代码和动效的一个全新起点。"}
        </Text>
        <Text x={w * 0.13} y={165} size={5.3} fill="#788375">
          {original
            ? "about the reliability of automated customer support."
            : "找到参考，复制仓库 URL，再让 AI 换成你自己的内容。"}
        </Text>
      </g>
      <rect
        x={w - 117}
        y={h - 34}
        width={106}
        height={24}
        rx={5}
        fill={original ? "#26372c" : "#a2dacf"}
      />
      <Text
        x={w - 109}
        y={h - 18}
        size={12}
        weight={600}
        fill={original ? "white" : ink}
      >
        {original ? "原视频 · Giga" : "Remix · 你的内容"}
      </Text>
    </g>
  );
};
const Results = ({ t, compare }: { t: number; compare: boolean }) => {
  const p = smooth(t, 91.7, 92.1);
  const yTop = lerp(176, 66, p),
    yBottom = lerp(176, 331, p);
  return (
    <g>
      <Paths />
      <rect width={544} height={720} fill="#eef1e9" />
      {compare ? (
        <>
          <Paper
            x={63}
            y={yTop}
            w={430}
            h={238}
            original
            t={t}
            rotation={-1.8}
          />
          <Paper x={50} y={yBottom} w={436} h={244} t={t} rotation={-0.8} />
          <path
            d="M101 161Q43 250 77 394Q84 429 103 446"
            stroke={ink}
            strokeWidth={2}
            fill="none"
            strokeDasharray="2 5"
            opacity={smooth(t, 92.35, 92.65)}
          />
          {t > 92.65 && (
            <g transform="translate(42 299) rotate(-5)">
              <rect x={4} y={5} width={143} height={48} rx={10} fill={ink} />
              <rect
                width={143}
                height={48}
                rx={9}
                fill="#ffe486"
                stroke={ink}
                strokeWidth={2.5}
              />
              <Text x={14} y={32} size={22} weight={700}>
                ✓ 画面风格
              </Text>
            </g>
          )}
          {t > 93.68 && (
            <g>
              <path
                d="M466 164Q527 270 473 443"
                stroke={ink}
                strokeWidth={2}
                fill="none"
                strokeDasharray="2 5"
              />
              <g transform="translate(371 305) rotate(5)">
                <rect x={4} y={5} width={132} height={42} rx={9} fill={ink} />
                <rect
                  width={132}
                  height={42}
                  rx={8}
                  fill="#b5e8d7"
                  stroke={ink}
                  strokeWidth={2.5}
                />
                <Text x={10} y={28} size={18} weight={700}>
                  ✓ 动效质感
                </Text>
              </g>
            </g>
          )}
        </>
      ) : (
        <g
          opacity={smooth(t, 90.17, 90.4)}
          transform={`translate(272 310) scale(${lerp(0.88, 1, smooth(t, 90.17, 90.45)) + 0.06 * Math.sin(clamp((t - 90.17) / 0.76) * Math.PI)}) translate(-272 -310)`}
        >
          <Paper x={31} y={176} w={482} h={269} t={t} />
        </g>
      )}
    </g>
  );
};

export const webUIV3Scene = (id: string, t: number): React.ReactNode | null => {
  if (["gallery", "detail", "unlock", "repository", "copy"].includes(id))
    return <Software t={t} phase={id} />;
  if (id === "prompt") return <Prompt t={t} />;
  if (id === "result" || id === "compare")
    return <Results t={t} compare={id === "compare"} />;
  return null;
};
