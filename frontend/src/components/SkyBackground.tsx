import { useMemo } from "react";
import "../styles/_sky.scss";

const DURATION = 24;
const NUM_STARS = 40;

export function SkyBackground({
  startOffset,
  isPlaying,
}: {
  startOffset: number;
  isPlaying: boolean;
}) {
  const stars = useMemo(
    () =>
      Array.from({ length: NUM_STARS }, (_, i) => ({
        id: i,
        left: `${Math.floor(Math.random() * 100)}%`,
        top: `${Math.floor(Math.random() * 100)}%`,
      })),
    [],
  );

  const anim = (name: string): React.CSSProperties => ({
    animationName: name,
    animationDuration: `${DURATION}s`,
    animationTimingFunction: "linear",
    animationDelay: `-${startOffset}s`,
    animationIterationCount: "infinite",
    animationPlayState: isPlaying ? "running" : "paused",
  });

  const phase: React.CSSProperties = {
    position: "absolute",
    inset: 0,
  };

  return (
    <div
      style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}
    >
      {/* Dawn */}
      <div
        style={{
          ...phase,
          background:
            "linear-gradient(0deg, rgba(254,215,102,1) 0%, rgba(205,237,246,1) 100%)",
          ...anim("dawn"),
        }}
      />

      {/* Noon */}
      <div
        style={{
          ...phase,
          background:
            "linear-gradient(0deg, rgba(205,237,246,1) 0%, rgba(36,123,160,1) 100%)",
          ...anim("noon"),
        }}
      />

      {/* Dusk */}
      <div
        style={{
          ...phase,
          background:
            "linear-gradient(0deg, rgba(255,32,110,1) 0%, rgba(10,0,94,1) 100%)",
          ...anim("dusk"),
        }}
      />

      {/* Midnight (+ stars) */}
      <div
        style={{
          ...phase,
          background:
            "linear-gradient(0deg, rgba(2,0,20,1) 0%, rgba(10,0,94,1) 100%)",
          ...anim("midnight"),
        }}
      >
        {stars.map((s) => (
          <div
            key={s.id}
            style={{
              position: "absolute",
              left: s.left,
              top: s.top,
              width: 3,
              height: 3,
              borderRadius: "50%",
              backgroundColor: "#fff",
            }}
          />
        ))}
      </div>

      {/* Orbit — sun at top-left corner, moon at bottom-right */}
      <div
        style={{
          position: "relative",
          width: 500,
          height: 500,
          margin: "150px auto 0",
          ...anim("sunrise"),
        }}
      >
        {/* Sun */}
        <div
          style={{
            position: "absolute",
            top: -48,
            left: -48,
            width: 96,
            height: 96,
            borderRadius: "50%",
            background:
              "radial-gradient(circle at 38% 38%, #fffde0, #ffe44d 35%, #ffb300 65%, #ff7c00 100%)",
            boxShadow: [
              "0 0 0 4px rgba(255,220,50,0.25)",
              "0 0 18px 8px rgba(255,200,0,0.7)",
              "0 0 50px 20px rgba(255,150,0,0.45)",
              "0 0 100px 50px rgba(255,100,0,0.25)",
              "0 0 180px 80px rgba(255,80,0,0.1)",
            ].join(", "),
          }}
        />
        {/* Moon */}
        <div
          style={{
            position: "absolute",
            bottom: -44,
            right: -44,
            width: 88,
            height: 88,
            borderRadius: "50%",
            background:
              "radial-gradient(circle at 38% 35%, #f5f2ea, #d4cdb8 55%, #b8b0a0 100%)",
            boxShadow: [
              "inset -14px -4px 0 0 rgba(30,40,70,0.45)",
              "0 0 10px 4px rgba(180,200,255,0.55)",
              "0 0 30px 12px rgba(130,160,255,0.3)",
              "0 0 70px 28px rgba(80,110,220,0.15)",
            ].join(", "),
          }}
        />
      </div>
    </div>
  );
}
