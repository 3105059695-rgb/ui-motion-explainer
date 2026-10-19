import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import "@fontsource/tinos/700-italic.css";

const unit = (x: number) => Math.min(1, Math.max(0, x));
const ease = (t: number, a: number, b: number) => {
  const p = unit((t - a) / (b - a));
  return p * p * (3 - 2 * p);
};
const serif = '"Noto Serif SC", serif';
const posters = [
  "poster-shortcuts.png",
  "poster-time.png",
  "poster-million.png",
];
const mix = (a: number, b: number, p: number) => a + (b - a) * p;

// Only thumbnail imagery is sampled media. Card geometry, typography,
// rack-focus, montage beats and foreground claim are independently authored.
export const DarkFeed: React.FC<{ t: number }> = ({ t }) => {
  const cuts = [0, 0.28, 0.55, 0.78, 1.02, 1.3, 1.62];
  const n = Math.max(0, cuts.filter((x) => t >= x).length - 1);
  const age = t - cuts[n];
  const impulse = (1 - ease(age, 0, 0.065)) * 20;
  const x = n === 0 ? 0 : 103;
  return (
    <AbsoluteFill style={{ background: "#030403", overflow: "hidden" }}>
      <div
        style={{
          position: "absolute",
          inset: -4,
          transform: `translateX(${impulse}px) scale(${1 + age * 0.025})`,
          transformOrigin: "45% 48%",
          filter: `blur(${impulse * 0.06}px)`,
        }}
      >
        <Img
          src={staticFile(`reference-assets/opening-v3/feed-${n}.jpg`)}
          style={{
            position: "absolute",
            left: 0,
            top: -4,
            width: 552,
            height: 310,
            objectFit: "fill",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: x + 23,
            top: 332,
            color: "#efefeb",
            fontFamily: "Noto Sans SC",
            fontSize: 34,
            whiteSpace: "nowrap",
            letterSpacing: -1.2,
            transform: "scaleX(.96)",
            transformOrigin: "left",
          }}
        >
          {n === 0
            ? "坐原子弹！"
            : n === 1
              ? "博主妈谢谢"
              : n === 2
                ? "如何用"
                : "我用"}
          <span
            style={{
              color: "#080805",
              background: "#fbe222",
              fontWeight: 700,
              padding: "0 1px",
            }}
          >
            GPT{n >= 5 ? "6" : "-6"}
          </span>
          {
            [
              "完整复刻了",
              "让我的",
              " Astra控制",
              " Astra做",
              " Astra做",
              "花10块钱",
              "做一个",
            ][n]
          }
        </div>
        <div
          style={{
            position: "absolute",
            left: x + 24,
            top: 402,
            width: 620,
            color: "#555957",
            fontSize: 29,
            filter: "blur(3px)",
          }}
        >
          · 动态视觉 创作过程分享 ·
        </div>
        <div
          style={{
            position: "absolute",
            left: x + 120,
            top: 471,
            color: "#818280",
            fontSize: 29,
            opacity: 0.65,
          }}
        >
          09-05
        </div>
        <div
          style={{
            position: "absolute",
            left: x,
            top: 528,
            width: 555,
            height: 315,
            borderRadius: "26px 26px 0 0",
            overflow: "hidden",
            filter: "blur(2.5px)",
          }}
        >
          {n === 0 || n === 3 ? (
            <Img
              src={staticFile(
                `reference-assets/opening-v3/feed-bottom-${n}.jpg`,
              )}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                objectPosition: "top",
              }}
            />
          ) : (
            <div
              style={{
                width: "100%",
                height: "100%",
                background: n === 6 ? "#e8e6d8" : "#dedfdf",
              }}
            >
              <div
                style={{
                  margin: 39,
                  fontSize: 30,
                  color: "#929587",
                  filter: "blur(4px)",
                }}
              >
                ⌕ 大家都在搜
              </div>
            </div>
          )}
        </div>
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(90deg,#0006,transparent 25%,transparent 68%,#0008)",
            backdropFilter: "blur(.15px)",
          }}
        />
      </div>
      <div
        style={{
          position: "absolute",
          left: 118,
          top: 419,
          width: 357,
          height: 64,
          display: "grid",
          placeItems: "center",
          fontFamily: serif,
          fontStyle: "italic",
          fontSize: 34,
          letterSpacing: -1.4,
          color: "#363632",
          background: "#e9e9e4",
        }}
      >
        GPT6 根本没那么强
      </div>
    </AbsoluteFill>
  );
};

export const ReferencePosters: React.FC<{ t: number }> = ({ t }) => {
  const inward = ease(t, 4.02, 4.18);
  const outward = ease(t, 4.67, 4.9);
  const close = inward * (1 - outward);
  const drift = ease(t, 4.18, 4.63);
  const z = 1 + close * 1.92;
  const cx = close * (-91 - drift * 70);
  const cy = close * (-1026 - drift * 15);
  const branch = ease(t, 4.83, 5.31);
  const line = ease(t, 3.77, 4.1);
  const titleFont = {
    fontFamily: serif,
    fontStyle: "italic",
    color: "#30312d",
  } as const;
  return (
    <AbsoluteFill
      style={{
        overflow: "hidden",
        color: "#30312d",
        background:
          "radial-gradient(ellipse at 48% 47%,#e4e4e1 0%,#d9d9d5 42%,#c6c4c2 86%,#bbb9b8 100%)",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          transform: `translate(${cx}px,${cy}px) scale(${z})`,
          transformOrigin: "0 0",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 129,
            top: 81,
            display: "flex",
            alignItems: "center",
            gap: 21,
            ...titleFont,
            opacity: ease(t, 1.93, 2.14) * (1 - ease(t, 3.23, 3.38)),
          }}
        >
          <span style={{ fontSize: 21, lineHeight: 1.12 }}>
            我试着
            <br />
            给了
          </span>
          <span
            style={{
              fontSize: 52,
              letterSpacing: -3.5,
              fontWeight: 700,
              opacity: ease(t, 2.14, 2.52),
              filter: `blur(${(1 - ease(t, 2.16, 2.53)) * 9}px)`,
            }}
          >
            三个视频
          </span>
        </div>
        <div
          style={{
            position: "absolute",
            left: 151,
            top: 75,
            display: "flex",
            alignItems: "center",
            gap: 19,
            ...titleFont,
            opacity: ease(t, 3.25, 3.48) * (1 - ease(t, 4.08, 4.17)),
          }}
        >
          <span style={{ fontSize: 20 }}>希望</span>
          <span
            style={{
              fontFamily: "Tinos",
              fontSize: 68,
              lineHeight: 1.05,
              filter: `blur(${(1 - ease(t, 3.5, 3.82)) * 9}px)`,
              opacity: ease(t, 3.44, 3.74),
            }}
          >
            Astra
          </span>
          <span
            style={{
              fontSize: 20,
              marginLeft: -7,
              opacity: ease(t, 3.89, 4.02),
            }}
          >
            能够
          </span>
        </div>
        <div
          style={{
            position: "absolute",
            left: 90,
            top: 78,
            display: "flex",
            alignItems: "center",
            gap: 0,
            ...titleFont,
            opacity: ease(t, 4.76, 4.96),
          }}
        >
          <span style={{ fontSize: 20, lineHeight: 1.2, textAlign: "center" }}>
            里面
            <br />
            <span style={{ opacity: ease(t, 4.91, 5.11) }}>与内容无关的</span>
          </span>
          <span
            style={{
              fontWeight: 700,
              fontSize: 48,
              letterSpacing: -2,
              transform: "scaleX(1.13)",
              transformOrigin: "left center",
              opacity: ease(t, 5.52, 5.83),
              filter: `blur(${(1 - ease(t, 5.52, 5.86)) * 9}px)`,
            }}
          >
            创作技巧
          </span>
        </div>
        <svg
          width="544"
          height="720"
          style={{ position: "absolute", inset: 0 }}
        >
          <path
            d="M22 470L264 147L522 436Z"
            fill="none"
            stroke="#71736e"
            strokeWidth=".75"
            opacity={ease(t, 1.93, 2.13) * (1 - ease(t, 3.18, 3.45))}
          />
          <path
            d={`M116 449C${mix(94, 72, branch)} ${mix(480, 504, branch)} ${mix(120, 220, branch)} ${mix(490, 497, branch)} ${mix(150, 227, branch)} ${mix(504, 556, branch)}`}
            fill="none"
            stroke="#70716b"
            strokeWidth=".8"
            pathLength="1"
            strokeDasharray="1"
            strokeDashoffset={1 - line}
          />
          <path
            d="M272 430L272 556"
            fill="none"
            stroke="#70716b"
            strokeWidth=".8"
            pathLength="1"
            strokeDasharray="1"
            strokeDashoffset={1 - ease(t, 4.82, 5.26)}
          />
          <path
            d="M429 411C473 489 322 476 318 556"
            fill="none"
            stroke="#70716b"
            strokeWidth=".8"
            pathLength="1"
            strokeDasharray="1"
            strokeDashoffset={1 - ease(t, 4.95, 5.38)}
          />
          <path
            d="M207 555H337V665H207Z"
            fill="none"
            stroke="#777973"
            strokeWidth=".9"
            pathLength="1"
            strokeDasharray="1"
            strokeDashoffset={1 - ease(t, 5.15, 5.58)}
          />
          {[
            { x: 116, y: 449 },
            { x: 272, y: 430 },
            { x: 429, y: 411 },
          ].map((p, i) => (
            <circle
              key={i}
              cx={p.x}
              cy={p.y}
              r="1.1"
              fill="#65655f"
              opacity={i === 0 ? line : branch}
            />
          ))}
        </svg>
        {posters.map((name, i) => {
          const enter = ease(t, 1.86 + i * 0.11, 2.17 + i * 0.13);
          return (
            <div
              key={name}
              style={{
                position: "absolute",
                left: 49 + i * 159,
                top: 231 - i * 23 + (1 - enter) * (i === 1 ? 43 : 31),
                opacity: enter * (i === 0 ? 1 : 1 - close),
                transform: `perspective(1200px) rotateY(${-3 + i * 2}deg) rotateZ(${[-2.8, -0.4, 2.8][i]}deg)`,
              }}
            >
              <div
                style={{
                  width: 126,
                  height: 224,
                  overflow: "hidden",
                  borderRadius: 3,
                  border: "1px solid #ffffffe6",
                  boxShadow:
                    "1px 3px 3px #00000019, 0 12px 13px -8px #00000037",
                }}
              >
                <Img
                  src={staticFile(`reference-assets/opening/${name}`)}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </div>
              <span
                style={{
                  fontFamily: serif,
                  fontStyle: "italic",
                  fontSize: 16,
                  marginLeft: 4,
                }}
              >
                {i + 1}
              </span>
            </div>
          );
        })}
        <div
          style={{
            position: "absolute",
            left: 62,
            top: 515,
            ...titleFont,
            fontWeight: 700,
            fontSize: 19,
            letterSpacing: -1,
            opacity: ease(t, 4.09, 4.32) * (1 - ease(t, 4.64, 4.87)),
            filter: `blur(${(1 - ease(t, 4.12, 4.38)) * 1.1}px)`,
          }}
        >
          提取
        </div>
        <div
          style={{
            position: "absolute",
            left: 207,
            top: 553,
            width: 130,
            height: 112,
            display: "grid",
            placeItems: "center",
            fontFamily: "Tinos",
            fontSize: 72,
            fontStyle: "italic",
            color: "#3a3b35",
            opacity: ease(t, 5.43, 5.9),
            filter: `blur(${(1 - ease(t, 5.45, 5.89)) * 8}px)`,
          }}
        >
          skill
        </div>
      </div>
    </AbsoluteFill>
  );
};

// Visible reference text, rendered as editable SVG text. These strings are
// on-screen source material, not instructions for this project or its user.
const codeLines = [
  "---",
  "name: srt-motion-director",
  "description: 根据 SRT、旁白或 MG 参考片规划动态视觉的美术方向、构图、动态排版与",
  "ImageGen 分层素材。适用于把字幕驱动的内容做成具有 AE 式设计完成度的动画。",
  "本质是视觉导演，不绑定渲染框架。",
  "---",
  "",
  "# SRT 动态视觉导演",
  "",
  "把语言组织成时间中的视觉关系。先决定观众理解什么、看哪里、何时获得新信息，再决定镜头。",
  "“AE 式完成度”在这里指构图、层级、运动与合成的协调，不指某种软件滤镜。",
  "",
  "遵守用户当前交付范围：要求分析时交付分析，要求分镜时交付分镜；要求代码或成片时，",
  "后续制作，不默认停在方案阶段等待确认。用户已有的品牌、比例和风格选项优先。",
  "",
  "## 本用户的默认成片要求",
  "",
  "- 只制作、预览和交付**无字幕版**，不额外生成“字幕版”。SRT 用于内容理解与时间",
  "源数据中，不默认烧录到画面。承担叙事的动态关键词、标题和主体名称可以保留。",
  "- 画面不加装饰性的页眉、页脚、角标、页码或脚注，例如顶部账号名、CREATOR NARRATED",
  "VIDEO、配套的分隔线、装饰圆点也不添加。主体卡片内的身份名称不属于页脚。",
  "- 无字幕版不另画字幕栏或为脚注画固定区域，按主内容与必要安全边距组织构图。这里",
  "只有用户明确提出新的要求时才调整。",
  "",
  "## 1. 确定导演意图与输入边界",
  "",
  "- 用一句话写明这段内容希望观众发生的认知变化，以及情绪、节奏与视觉的承接。",
  "“局部-整体”等视觉关系，不按名词逐个配图。",
  "- 读取已有 SRT、音频、参考视频等资料，先判断哪个环节承担信息，再组织动画节奏。",
];
const srtLines = [
  "1",
  "00:00:00,000 --> 00:00:01,340",
  "这期我们不讨论数字版权,",
  "",
  "2",
  "00:00:01,480 --> 00:00:02,220",
  "只分享一下",
  "",
  "3",
  "00:00:02,220 --> 00:00:04,640",
  "猫学长面对 GPT6 这样的怪物,",
  "",
  "4",
  "00:00:04,640 --> 00:00:05,886",
  "会怎么样做视频。",
  "",
];

const EditorToolbar: React.FC<{ script: boolean }> = ({ script }) => (
  <>
    <rect x="-250" y="39" width="1300" height="22" fill="#080909" />
    <text x="13" y="53" fill="#b8bab5" fontSize="8" fontFamily="Noto Sans SC">
      ⌘ Code 文件 编辑 选择 查看 转到 运行 终端 窗口 帮助
    </text>
    <rect x="357" y="41" width="27" height="14" rx="3" fill="#7764b9" />
    <text x="365" y="51" fill="#dfd9ff" fontSize="9">
      ▣
    </text>
    <text x="395" y="51" fill="#d8d8d5" fontSize="8">
      ◎ ◉ M 300k/s ⌁ ⌕ ▧ ♥
    </text>
    <rect x="-250" y="61" width="1300" height="29" fill="#242525" />
    <text x="14" y="80" fill="#aaaea7" fontSize="12" fontFamily="Noto Sans SC">
      ‹ › {script ? "从零开始.srt" : "SKILL.md"} — srt-motion-director — ▦
      Modified: 9月11日, 00:20 ▰ Size: 9
    </text>
    <rect x="0" y="90" width="123" height="29" fill="#202120" />
    <path d="M0 90H123" stroke="#3a899b" />
    <text
      x="15"
      y="110"
      fill="#d9dddc"
      fontFamily="Consolas, Noto Sans SC"
      fontStyle="italic"
      fontSize="13"
    >
      ⬇ SKILL.md ×
    </text>
  </>
);

export const CurvedCode: React.FC<{ t: number }> = ({ t }) => {
  const folder = t >= 9.18;
  const script = t >= 9.96;
  const terminal = ease(t, 10.43, 10.86);
  const zoom = folder ? 1 : 1 + ease(t, 7.1, 7.82) * 0.78;
  const pan = folder ? (script ? -12 : 0) : -8 + ease(t, 7.1, 8.2) * -90;
  const rise = folder ? -12 : -12 - ease(t, 7.1, 7.82) * 18;
  const selection = ease(t, 7.44, 7.68) * (1 - ease(t, 9.04, 9.18));
  const sidebarWidth = script
    ? 128
    : folder
      ? mix(162, 302, ease(t, 9.18, 9.65))
      : 0;
  const codeOffset = folder ? sidebarWidth + 5 : 0;
  const blur = terminal * 5.2;
  const dragX = mix(322, 172, ease(t, 9.22, 9.65));
  const dragY = mix(358, 381, ease(t, 9.22, 9.65));
  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      <svg
        width="544"
        height="720"
        style={{
          filter: `blur(${blur}px) brightness(${1 - terminal * 0.38 - (folder ? 0 : ease(t, 7.1, 7.82) * 0.27)})`,
        }}
      >
        <defs>
          <filter
            id="editor-lens-v3"
            x="0"
            y="0"
            width="544"
            height="720"
            filterUnits="userSpaceOnUse"
            colorInterpolationFilters="sRGB"
          >
            <feImage
              href={staticFile("reference-assets/opening-v3/lens-map.png")}
              x="0"
              y="0"
              width="544"
              height="720"
              result="lens"
            />
            <feGaussianBlur in="lens" stdDeviation="1.4" result="smooth-lens" />
            <feDisplacementMap
              in="SourceGraphic"
              in2="smooth-lens"
              scale="256"
              xChannelSelector="R"
              yChannelSelector="G"
            />
            <feGaussianBlur stdDeviation=".35" />
          </filter>
          <radialGradient id="editor-light-v3">
            <stop offset="0" stopColor="#000" stopOpacity="0" />
            <stop offset=".7" stopColor="#000" stopOpacity=".06" />
            <stop offset="1" stopColor="#000" stopOpacity=".22" />
          </radialGradient>
          <pattern
            id="editor-scan-v3"
            width="2"
            height="2"
            patternUnits="userSpaceOnUse"
          >
            <rect width="2" height=".5" fill="#000" opacity=".055" />
          </pattern>
          <clipPath id="editor-clip-v3">
            <rect x="-200" y="38" width="1200" height="691" rx="4" />
          </clipPath>
        </defs>
        <g filter="url(#editor-lens-v3)">
          <g
            transform={`translate(${pan} ${rise}) translate(272 307) scale(${zoom}) translate(-272 -307)`}
            clipPath="url(#editor-clip-v3)"
          >
            <rect x="-240" y="37" width="1400" height="700" fill="#1e1e1e" />
            <EditorToolbar script={script} />
            {folder && (
              <g>
                <rect
                  x="-80"
                  y="92"
                  width={sidebarWidth + 80}
                  height="620"
                  fill="#303134"
                />
                <rect x="-25" y="92" width="70" height="620" fill="#202123" />
                <rect
                  x="46"
                  y="92"
                  width={sidebarWidth - 46}
                  height="34"
                  fill="#242526"
                />
                <text
                  x="69"
                  y="114"
                  fill="#c1c2bf"
                  fontSize="10"
                  fontFamily="Noto Sans SC"
                >
                  SRT-MOTIO... ♧ ⊕ ⟳ □ ···
                </text>
                {[
                  "› agents",
                  "› references",
                  "◉ 1.mp4",
                  "◉ 2.mp4",
                  "◉ 3.mp4",
                  "⬇ SKILL.md",
                ].map((text, i) => (
                  <text
                    key={text}
                    x="67"
                    y={144 + i * 22}
                    fill={i >= 2 && i <= 4 ? "#c06a87" : "#c2c3c1"}
                    fontSize="12.5"
                    fontFamily="Noto Sans SC"
                  >
                    {text}
                  </text>
                ))}
                {["▱", "⌕", "♧", "▷", "▧"].map((x, i) => (
                  <text
                    key={i}
                    x="12"
                    y={132 + i * 50}
                    fontSize="25"
                    fill="#aaada9"
                  >
                    {x}
                  </text>
                ))}
                <text x="12" y="652" fill="#999c98" fontSize="24">
                  ◎
                </text>
                <text x="12" y="692" fill="#999c98" fontSize="24">
                  ⚙
                </text>
              </g>
            )}
            <g transform={`translate(${codeOffset} 0)`}>
              {folder && (
                <>
                  <rect x="0" y="92" width="520" height="32" fill="#1e1e1e" />
                  <path d="M0 92H128" stroke="#4393a8" />
                  <text
                    x="14"
                    y="113"
                    fill="#d5d8d3"
                    fontSize="13"
                    fontFamily="Consolas, Noto Sans SC"
                    fontStyle="italic"
                  >
                    ⬇ SKILL.md ×
                  </text>
                </>
              )}
              {script && (
                <>
                  <rect x="128" y="92" width="410" height="33" fill="#1e1e1e" />
                  <text
                    x="146"
                    y="114"
                    fill="#d9d9d5"
                    fontSize="14"
                    fontFamily="Noto Sans SC"
                  >
                    ☰ 字幕_片段从零开始.srt ×
                  </text>
                </>
              )}
              <text
                x="16"
                y="136"
                fill="#b3b5b1"
                fontSize="11.5"
                fontFamily="Consolas, Noto Sans SC"
              >
                {script
                  ? "☰ 字幕_片段从零开始.srt"
                  : "⬇ SKILL.md › ab: # SRT 动态视觉导演"}
              </text>
              {!script && (
                <g>
                  <rect
                    x="52"
                    y="297"
                    width="1100"
                    height="18"
                    fill="#315f84"
                    opacity={selection}
                  />
                  <rect
                    x="52"
                    y="315"
                    width={mix(105, 660, ease(t, 7.5, 8.02))}
                    height="18"
                    fill="#315f84"
                    opacity={selection}
                  />
                  {codeLines.map((text, i) => (
                    <g key={i}>
                      <text
                        x="26"
                        y={156 + i * 18.2}
                        fill="#969996"
                        fontFamily="Consolas,monospace"
                        fontSize="11.8"
                      >
                        {
                          [
                            1, 2, 3, 3, 3, 4, 5, 6, 7, 8, 8, 9, 10, 10, 11, 12,
                            13, 14, 14, 15, 15, 16, 16, 17, 18, 19, 20, 20, 21,
                          ][i]
                        }
                      </text>
                      <text
                        x="52"
                        y={156 + i * 18.2}
                        fill={
                          i === 2 || i === 3 || i === 4
                            ? "#b39682"
                            : text.startsWith("#")
                              ? "#6b9eb7"
                              : "#c6c6c3"
                        }
                        fontFamily="Consolas, Noto Sans SC, monospace"
                        fontSize="13"
                        fontWeight="400"
                      >
                        {text}
                      </text>
                    </g>
                  ))}
                </g>
              )}
              {script &&
                srtLines.map((text, i) => (
                  <g key={i}>
                    <text
                      x="26"
                      y={161 + i * 25}
                      fill="#7c807b"
                      fontFamily="Consolas"
                      fontSize="14"
                    >
                      {i + 1}
                    </text>
                    <text
                      x="67"
                      y={161 + i * 25}
                      fill="#d2d4cd"
                      fontFamily="Consolas, Noto Sans SC"
                      fontSize="15.8"
                    >
                      {text}
                    </text>
                  </g>
                ))}
            </g>
            {folder && !script && (
              <g transform={`translate(${dragX} ${dragY})`}>
                <path
                  d="M-18 -27H9L23 -11V25H-18Z"
                  fill="#e6e9e5"
                  stroke="#afb4b4"
                  strokeWidth=".5"
                />
                <path d="M9 -27V-11H23" fill="#ccd3d5" />
                <text
                  x="-10"
                  y="12"
                  fontSize="29"
                  fontFamily="Noto Sans SC"
                  fontWeight="700"
                  fill="#66a1b0"
                >
                  C
                </text>
                <rect x="-32" y="27" width="68" height="24" fill="#276da6" />
                <text x="-30" y="36" fill="#d9e3ee" fontSize="8">
                  字幕_片段从零开
                </text>
                <text x="-8" y="47" fill="#d9e3ee" fontSize="8">
                  始.srt
                </text>
                <circle cx="18" cy="31" r="12" fill="#50ce0d" />
                <path d="M12 31H24M18 25V37" stroke="white" strokeWidth="2" />
                <path
                  d="M10 8L10 22L14 18L18 26L21 24L17 17L24 17Z"
                  fill="white"
                  stroke="#243a41"
                />
              </g>
            )}
            {!folder && (
              <g
                transform={`translate(${mix(68, 340, selection)} ${selection > 0 ? 325 : 276})`}
                opacity={t < 9.1 ? 1 : 0}
              >
                <path
                  d="M-3 -8H3M0 -8V8M-3 8H3"
                  fill="none"
                  stroke="#0b0b0b"
                  strokeWidth="3.5"
                />
                <path
                  d="M-3 -8H3M0 -8V8M-3 8H3"
                  fill="none"
                  stroke="#e8e8db"
                  strokeWidth="1.2"
                />
              </g>
            )}
            <rect x="-250" y="700" width="1400" height="22" fill="#30332f" />
            <text
              x="260"
              y="713"
              fontSize="10"
              fill="#bbbfba"
              fontFamily="Noto Sans SC"
            >
              已为屏幕阅读器优化 行1，列1 空格:2 UTF-8 LF Markdown
            </text>
          </g>
        </g>
        <rect width="544" height="720" fill="url(#editor-light-v3)" />
        <rect width="544" height="720" fill="url(#editor-scan-v3)" />
      </svg>
      {terminal > 0 && (
        <div
          style={{
            position: "absolute",
            left: 38,
            top: 294 + (1 - terminal) * 26,
            width: 468,
            height: 132,
            background: "#f1f0ec",
            borderRadius: 11,
            boxShadow: "0 22px 40px #0008",
            opacity: terminal,
            transform: `scale(${0.97 + 0.03 * terminal})`,
          }}
        >
          <div
            style={{
              height: 30,
              borderBottom: "1px solid #dfdfda",
              textAlign: "center",
              fontSize: 10,
              color: "#777974",
              fontFamily: "Consolas",
              paddingTop: 8,
            }}
          >
            Terminal
          </div>
          <div
            style={{
              position: "absolute",
              left: 12,
              top: 11,
              display: "flex",
              gap: 4,
            }}
          >
            {["#f67543", "#edc934", "#38bc46"].map((c) => (
              <span
                key={c}
                style={{
                  width: 8,
                  height: 8,
                  background: c,
                  borderRadius: "50%",
                }}
              />
            ))}
          </div>
          <div
            style={{
              padding: "28px 22px",
              fontFamily: serif,
              fontSize: 29,
              fontStyle: "italic",
              fontWeight: 700,
              color: "#30312a",
              letterSpacing: -1.2,
            }}
          >
            <span style={{ color: "#a6a180", paddingRight: 12 }}>›</span>
            {"根据srt做mg动画".slice(
              0,
              Math.round(unit((t - 10.68) / 0.7) * 10),
            )}
            <span
              style={{
                fontFamily: "Consolas",
                fontWeight: 400,
                opacity: Math.floor(t * 2.5) % 2 === 0 ? 1 : 0.7,
              }}
            >
              │
            </span>
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
};
