import React from "react";
import {
  AbsoluteFill,
  Audio,
  Sequence,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import "@fontsource/noto-sans-sc/400.css";
import "@fontsource/noto-sans-sc/500.css";
import "@fontsource/noto-sans-sc/600.css";
import "@fontsource/noto-sans-sc/700.css";
import "@fontsource/noto-sans-sc/800.css";
import "@fontsource/noto-sans-sc/900.css";
import "@fontsource/noto-serif-sc/400.css";
import "@fontsource/noto-serif-sc/700.css";
import "@fontsource/tinos/400-italic.css";
import { Opening } from "./Opening";
import { FirstHalf } from "./FirstHalf";
import { SecondHalf } from "./SecondHalf";
import captions from "./captions.json";

type FilmProps = { useReferenceAudio?: boolean; useReferenceInsert?: boolean };

const Caption: React.FC<{ t: number }> = ({ t }) => {
  if (t < 6.733 || (t >= 10.53 && t < 12.1) || (t >= 20 && t < 65.4))
    return null;
  const cue = captions.find((c) => t >= c.start && t < c.end);
  if (!cue) return null;
  const dark = t < 20;
  let text = cue.text;
  if (t >= 9.267 && t < 10.53) text = "但是当我给一个新的脚本";
  if (t >= 90.14 && t < 91.7) text = "做出来的动效视频";
  if (t >= 91.7 && t < 93.68) text = "就能继承原视频的画面风格";
  if (t >= 93.68 && t < 94.84) text = "和动效质感";
  if (t >= 100.88 && t < 101.6) text = "使用它们";
  if (t >= 101.6 && t < 105.24)
    text = "你才能在高度竞争的数字内容生态中脱颖而出";
  text = text.replace(/\s*(Face|GitHub|URL)\s*/g, " $1 ").trim();
  const readingWidth = [...text].reduce(
    (sum, char) => sum + (char.charCodeAt(0) < 128 ? 0.53 : 1),
    0,
  );
  const emphasized = text.split(
    /(Face|GitHub|URL|代码工程|复制|画面风格|动效质感|自己的内容|脱颖而出|人类反馈|词元共享)/g,
  );
  return (
    <div
      style={{
        position: "absolute",
        bottom: 61,
        left: 18,
        right: 18,
        textAlign: "center",
        pointerEvents: "none",
        opacity: Math.max(0, Math.min(1, (140.5 - t) / 0.23)),
      }}
    >
      <span
        style={{
          display: "inline-block",
          padding: dark ? "5px 10px" : "9px 17px",
          maxWidth: 496,
          background: dark ? "rgba(0,0,0,.8)" : "#fffffc",
          color: dark ? "#fafbf1" : "#242c23",
          fontFamily: dark ? "Noto Serif SC" : "Noto Sans SC",
          fontSize: dark ? 23 : readingWidth > 21 ? 19 : 23,
          fontStyle: dark ? "italic" : "normal",
          borderRadius: dark ? 7 : 12,
          fontWeight: dark ? 500 : 800,
          boxShadow: dark ? "none" : "0 7px 13px #23342922",
          lineHeight: 1.4,
        }}
      >
        {dark
          ? text
          : emphasized.map((word, i) => (
              <span key={i} style={{ color: i % 2 ? "#396d58" : undefined }}>
                {word}
              </span>
            ))}
      </span>
    </div>
  );
};

export const FullReplica: React.FC<FilmProps> = ({
  useReferenceAudio = false,
  useReferenceInsert = false,
}) => {
  const { fps } = useVideoConfig();
  const t = useCurrentFrame() / fps;
  return (
    <AbsoluteFill style={{ background: "#f3f5ee" }}>
      <div
        style={{
          position: "absolute",
          width: 544,
          height: 720,
          scale: "1.5",
          transformOrigin: "0 0",
          fontFamily: "Noto Sans SC",
          overflow: "hidden",
        }}
      >
        <Opening t={t} useReferenceInsert={useReferenceInsert} />
        <FirstHalf t={t} />
        <SecondHalf t={t} />
        {!(useReferenceInsert && t >= 13.533333 && t < 20) ? (
          <Caption t={t} />
        ) : null}
      </div>
      {useReferenceAudio ? (
        <Audio src={staticFile("source-media/reference-audio.mp3")} />
      ) : null}
    </AbsoluteFill>
  );
};

const showcase = [
  {
    start: 0,
    source: 22.66,
    label: "文档 → 搜索参考 → 代码执行",
    length: 10.4,
  },
  {
    start: 10.4,
    source: 45.7,
    label: "Token 落入黑盒 → 数字增长",
    length: 7.6,
  },
  { start: 18, source: 55.54, label: "模型卡 → 费用图表", length: 6.76 },
  {
    start: 24.76,
    source: 85.84,
    label: "同一 URL → 输入框 → 新内容",
    length: 9,
  },
  { start: 33.76, source: 117, label: "上传状态 → Remix 方块", length: 4.8 },
  {
    start: 38.56,
    source: 129.42,
    label: "算力杯 → 奢侈品 → 共享隐喻",
    length: 10.58,
  },
];
export const MechanismShowcase: React.FC = () => {
  const t = useCurrentFrame() / useVideoConfig().fps;
  const beat = [...showcase].reverse().find((s) => t >= s.start) ?? showcase[0];
  const source = beat.source + t - beat.start;
  return (
    <AbsoluteFill style={{ background: "#f3f5ee" }}>
      <div
        style={{
          position: "absolute",
          width: 544,
          height: 720,
          scale: "1.5",
          transformOrigin: "0 0",
          fontFamily: "Noto Sans SC",
          overflow: "hidden",
        }}
      >
        <FirstHalf t={source} />
        <SecondHalf t={source} />
        <div
          style={{
            position: "absolute",
            left: 22,
            right: 22,
            bottom: 23,
            textAlign: "center",
          }}
        >
          <span
            style={{
              display: "inline-block",
              background: "#fffff5",
              border: "1px solid #283228",
              padding: "7px 12px",
              fontSize: 15,
              boxShadow: "3px 4px 0 #252f25",
            }}
          >
            {beat.label}
          </span>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// Same-time excerpts for visual calibration: posters/code, causal UI workflow,
// then the browser-to-phone handoff. Full source times are retained.
const refinementClips = [
  { start: 0, source: 56, length: 222 },
  { start: 222, source: 684, length: 248 },
  { start: 470, source: 2968, length: 189 },
];
export const RefinementPreview: React.FC<{ useReferenceAudio?: boolean }> = ({
  useReferenceAudio = false,
}) => {
  const frame = useCurrentFrame();
  const clip =
    [...refinementClips].reverse().find((c) => frame >= c.start) ??
    refinementClips[0];
  const t = (clip.source + frame - clip.start) / 30;
  return (
    <AbsoluteFill style={{ background: "#f3f5ee" }}>
      <div
        style={{
          position: "absolute",
          width: 544,
          height: 720,
          scale: "1.5",
          transformOrigin: "0 0",
          fontFamily: "Noto Sans SC",
          overflow: "hidden",
        }}
      >
        <Opening t={t} />
        <FirstHalf t={t} />
        <SecondHalf t={t} />
        <Caption t={t} />
      </div>
      {useReferenceAudio &&
        refinementClips.map((c) => (
          <Sequence
            key={c.start}
            from={c.start}
            durationInFrames={c.length}
            layout="none"
          >
            <Audio
              src={staticFile("source-media/reference-audio.mp3")}
              startFrom={c.source}
              endAt={c.source + c.length}
            />
          </Sequence>
        ))}
    </AbsoluteFill>
  );
};
