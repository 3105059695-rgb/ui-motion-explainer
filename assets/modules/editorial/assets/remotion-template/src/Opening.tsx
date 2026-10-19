import React from "react";
import { AbsoluteFill, OffthreadVideo, Sequence, staticFile } from "remotion";
import { ReferencePosters, CurvedCode, DarkFeed } from "./OpeningV2";
const shadow = "0 14px 18px #0002, 0 2px 4px #0001";
const serif = '"Noto Serif SC", serif';

const IsometricDemo: React.FC<{ t: number }> = ({ t }) => (
  <AbsoluteFill style={{ background: "#cfd8da", perspective: 900 }}>
    <div
      style={{
        position: "absolute",
        left: 30,
        top: 215,
        width: 500,
        height: 350,
        background: "#fff",
        transform: `rotateX(55deg) rotateZ(${-28 + Math.sin(t) * 7}deg)`,
        boxShadow: "0 30px 0 #a2adb1, 0 55px 35px #0004",
        backgroundImage:
          "linear-gradient(#a4a4a4 1px,transparent 1px),linear-gradient(90deg,#a4a4a4 1px,transparent 1px)",
        backgroundSize: "70px 70px",
      }}
    >
      {[0, 1, 2, 3].map((i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            width: 90,
            height: 80,
            left: 75 + i * 83,
            top: 110 + Math.sin(t * 2 + i) * 23,
            background: ["#0c262c", "#becabd", "#c3a17b", "#f4d373"][i],
            transform: `translateZ(${20 + i * 13}px) rotateY(${Math.sin(t + i) * 20}deg)`,
            boxShadow: "8px 16px 0 #705335, 15px 27px 18px #0003",
            border: "4px solid #493b2c",
            borderRadius: 6,
            display: "grid",
            placeItems: "center",
            fontSize: 30,
            color: "white",
          }}
        >
          ✦
        </div>
      ))}
    </div>
    <div
      style={{
        position: "absolute",
        top: 95,
        left: 28,
        fontFamily: serif,
        fontSize: 33,
      }}
    >
      2D → 3D
      <br />
      Motion Graphics
    </div>
  </AbsoluteFill>
);

export const Opening: React.FC<{ t: number; useReferenceInsert?: boolean }> = ({
  t,
  useReferenceInsert = false,
}) => {
  if (t >= 20) return null;
  if (t < 1.867) return <DarkFeed t={t} />;
  if (t >= 1.867 && t < 6.733) return <ReferencePosters t={t} />;
  if (t >= 6.733 && t < 12.1) return <CurvedCode t={t} />;
  if (t < 13.533)
    return (
      <AbsoluteFill style={{ background: "#172321" }}>
        <div
          style={{
            position: "absolute",
            left: 88,
            top: 90,
            width: 368,
            height: 483,
            background: "#dce1ce",
            borderRadius: 9,
            boxShadow: shadow,
          }}
        >
          <div
            style={{
              position: "absolute",
              left: 49,
              top: 163,
              width: 270,
              height: 160,
              background: "#080f0d",
              borderRadius: "40% 47% 36% 51%",
              transform: `rotate(${t * 2}deg)`,
              display: "grid",
              placeItems: "center",
              fontFamily: serif,
              color: "#b6c4b4",
              fontSize: 34,
            }}
          >
            Another
            <br />
            AI Slop
          </div>
          <div
            style={{
              position: "absolute",
              bottom: 30,
              left: 30,
              fontSize: 17,
              color: "#768276",
            }}
          >
            生成结果 · 反例
          </div>
        </div>
      </AbsoluteFill>
    );
  if (useReferenceInsert)
    return (
      <Sequence from={406} durationInFrames={194}>
        <OffthreadVideo
          src={staticFile("source-media/reference-insert.mp4")}
          muted
          style={{ width: 544, height: 720, objectFit: "cover" }}
        />
      </Sequence>
    );
  return <IsometricDemo t={t} />;
};
