import React from "react";
import {
  AbsoluteFill,
  Img,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import content from "../public/user-content.json";

const region = (
  content as typeof content & {
    focus?: { x: number; y: number; width: number; height: number };
  }
).focus ?? { x: 0.66, y: 0.55, width: 0.29, height: 0.24 };

const ease = (t: number, a: number, b: number) =>
  1 - Math.pow(1 - Math.max(0, Math.min(1, (t - a) / (b - a))), 3);
export const DemoScreen: React.FC = () => (
  <div
    style={{
      height: "100%",
      background: "#fcfcf8",
      borderRadius: 14,
      overflow: "hidden",
      color: "#292d28",
      fontFamily: "Noto Sans SC",
    }}
  >
    <div
      style={{
        height: 28,
        borderBottom: "1px solid #c9d1c6",
        padding: "6px 12px",
        fontSize: 10,
        background: "#f0f3ec",
      }}
    >
      ● ● ● <span style={{ marginLeft: 35 }}>灵感画廊 · 界面示意</span>
    </div>
    <div style={{ padding: 18 }}>
      <div style={{ fontSize: 23, fontWeight: 700, margin: "7px 0 15px" }}>
        让想法动起来
      </div>
      <div style={{ fontSize: 10, color: "#6f796e", marginBottom: 15 }}>
        收藏参考 / 可编辑工程 / 内容创作
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3,1fr)",
          gap: 9,
        }}
      >
        {Array.from({ length: 9 }, (_, i) => (
          <div
            key={i}
            style={{
              height: 96,
              background: [
                "#ede9da",
                "#d4e6db",
                "#e0d7ed",
                "#ffdfb8",
                "#d9e7f1",
              ][i % 5],
              borderRadius: 6,
              position: "relative",
              border: "1px solid #b1bba7",
            }}
          >
            <div
              style={{
                fontSize: 26,
                textAlign: "center",
                marginTop: 12,
                rotate: `${i * 9 - 30}deg`,
              }}
            >
              {["↗", "✦", "◉", "▧", "⌘"][i % 5]}
            </div>
            <div
              style={{
                background: "#f9faf1",
                padding: "6px",
                fontSize: 9,
                position: "absolute",
                bottom: 0,
                width: "100%",
              }}
            >
              动效参考 {i + 1}
            </div>
          </div>
        ))}
      </div>
      <div
        style={{
          marginTop: 18,
          borderRadius: 8,
          background: "#e0efe2",
          border: "1px solid #a3b69f",
          padding: 10,
          fontSize: 11,
        }}
      >
        选中一个参考，再换成自己的内容 →
      </div>
    </div>
  </div>
);

export const ScreenshotStage: React.FC = () => {
  const t = useCurrentFrame() / useVideoConfig().fps;
  const entry = ease(t, 0, 0.8),
    focus = ease(t, 2.4, 3.3),
    returnFocus = ease(t, 6.5, 7.3),
    iris = ease(t, 8.9, 9.5);
  const zoom = 1 + focus * 0.17 - returnFocus * 0.17;
  return (
    <AbsoluteFill
      style={{
        background: "#f4f6ef",
        fontFamily: "Noto Sans SC",
        color: "#282b25",
      }}
    >
      <div
        style={{
          position: "absolute",
          width: 544,
          height: 720,
          scale: "1.5",
          transformOrigin: "0 0",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(ellipse at 50% 45%,#fff 0%,#f1f3ea 80%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 25,
            right: 25,
            top: 82,
            fontSize: content.title.length > 18 ? 24 : 29,
            lineHeight: 1.4,
            fontWeight: 700,
            textAlign: "center",
          }}
        >
          {content.title}
        </div>
        <div
          style={{
            position: "absolute",
            left: 44,
            top: 181 + (1 - entry) * 90,
            width: 456,
            height: 425,
            boxShadow: "0 18px 28px #31342a25, 0 2px 4px #31342a20",
            border: "1px solid #d8ddce",
            borderRadius: 15,
            overflow: "hidden",
            opacity: entry,
            transform: `perspective(900px) rotateX(${(1 - entry) * 14}deg) rotateY(${-3 + returnFocus * 3}deg) scale(${zoom})`,
            transformOrigin: `${(region.x + region.width / 2) * 100}% ${(region.y + region.height / 2) * 100}%`,
            background: "#fff",
          }}
        >
          {content.screenshot ? (
            <Img
              src={staticFile(content.screenshot)}
              style={{ width: "100%", height: "100%", objectFit: "contain" }}
            />
          ) : (
            <DemoScreen />
          )}
          <div
            style={{
              position: "absolute",
              left: `${region.x * 100}%`,
              top: `${region.y * 100}%`,
              width: `${region.width * 100}%`,
              height: `${region.height * 100}%`,
              border: "2px solid #b85638",
              borderRadius: 7,
              opacity: focus * (1 - returnFocus),
              boxShadow: "0 0 0 1000px #0001",
            }}
          />
        </div>
        <div
          style={{
            position: "absolute",
            left:
              440 + (44 + (region.x + region.width * 0.72) * 456 - 440) * focus,
            top:
              620 +
              (181 + (region.y + region.height * 0.65) * 425 - 620) * focus,
            fontSize: 29,
            filter: "drop-shadow(1px 2px 1px #fff)",
            opacity: entry * (1 - returnFocus),
            transform: `scale(${1 - 0.15 * Math.sin(Math.PI * ease(t, 3.2, 3.45))})`,
          }}
        >
          ➤
        </div>
        <div
          style={{
            position: "absolute",
            left: 130,
            right: 130,
            top: 621,
            padding: "8px 12px",
            borderRadius: 22,
            background: "#fff",
            boxShadow: "0 3px 5px #0001",
            fontSize: 13,
            textAlign: "center",
            opacity: focus,
          }}
        >
          {t < 6.8 ? "聚焦关键信息" : "换成自己的内容"}
        </div>
        {iris > 0 ? (
          <div
            style={{
              position: "absolute",
              inset: 0,
              clipPath: `circle(${iris * 950}px at 360px 450px)`,
              background: "#cff0de",
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: -500,
                background:
                  "repeating-conic-gradient(from 0deg at 50% 50%,#c2e5d3 0deg 15deg,#d8f1e2 15deg 30deg)",
                rotate: `${(t - 9) * 2}deg`,
              }}
            />
            <svg
              width="544"
              height="720"
              style={{
                position: "absolute",
                transform: `translateY(${Math.sin((t - 9) * 3) * 7}px) rotate(${Math.sin((t - 9) * 2) * 3}deg)`,
              }}
            >
              <path
                d="M275 240L303 323L391 324L321 376L347 460L275 411L203 460L229 376L158 324L247 323Z"
                fill="#ffdb63"
                stroke="#252d29"
                strokeWidth="4"
              />
              <path
                d="M250 353l16 19 35-40"
                fill="none"
                stroke="#252d29"
                strokeWidth="7"
                strokeLinecap="round"
              />
            </svg>
            <div
              style={{
                position: "absolute",
                left: 66,
                right: 66,
                top: 478,
                fontSize: 31,
                fontWeight: 800,
                textAlign: "center",
              }}
            >
              你的内容，同样出彩
            </div>
            <div
              style={{
                position: "absolute",
                left: 132,
                top: 547,
                background: "#fff",
                border: "2px solid #292e26",
                boxShadow: "4px 5px 0 #292e26",
                borderRadius: 9,
                padding: "8px 18px",
                fontSize: 14,
              }}
            >
              截图 → 聚焦 → 强调 → 结果
            </div>
          </div>
        ) : null}
        {iris > 0 && iris < 1 ? (
          <svg
            width="544"
            height="720"
            style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
          >
            <circle
              cx="360"
              cy="450"
              r={iris * 950}
              fill="none"
              stroke="#252d29"
              strokeWidth="4"
            />
          </svg>
        ) : null}
      </div>
    </AbsoluteFill>
  );
};
