import { useEffect, useRef } from "react";

interface RingConfig {
  r: number;
  trackWidth: number;
  arcWidth: number;
  dashArray: string;
  color: string;
  duration: string;
  direction: "normal" | "reverse";
}

interface ArcStackProps {
  size?: number;
}

const rings: RingConfig[] = [
  {
    r: 76,
    trackWidth: 18,
    arcWidth: 14,
    dashArray: "110 368",
    color: "#00e5ff",
    duration: "0.9s",
    direction: "normal",
  },
  {
    r: 52,
    trackWidth: 16,
    arcWidth: 12,
    dashArray: "75 252",
    color: "#534AB7",
    duration: "0.55s",
    direction: "reverse",
  },
  {
    r: 31,
    trackWidth: 14,
    arcWidth: 10,
    dashArray: "45 150",
    color: "#1D9E75",
    duration: "0.3s",
    direction: "normal",
  },
];

export default function ArcStack({ size = 180 }: ArcStackProps) {


  const cx = size / 2;
  const cy = size / 2;
  const scale = size / 180;

  return (
    <div
      style={{
        background: "#050a14",
        borderRadius: 16,
        padding: 60,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <style>{`
        @keyframes arc-spin-fwd { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes arc-spin-rev { from { transform: rotate(0deg); } to { transform: rotate(-360deg); } }
      `}</style>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        xmlns="http://www.w3.org/2000/svg"
      >
        {rings.map((ring, i) => {
          const scaledR = ring.r * scale;
          const scaledTrack = ring.trackWidth * scale;
          const scaledArc = ring.arcWidth * scale;
          const animName =
            ring.direction === "reverse" ? "arc-spin-rev" : "arc-spin-fwd";

          return (
            <g key={i}>
              <circle
                cx={cx}
                cy={cy}
                r={scaledR}
                fill="none"
                stroke="#0a1830"
                strokeWidth={scaledTrack}
              />
              <circle
                cx={cx}
                cy={cy}
                r={scaledR}
                fill="none"
                stroke={ring.color}
                strokeWidth={scaledArc}
                strokeDasharray={ring.dashArray}
                strokeLinecap="round"
                style={{
                  transformOrigin: `${cx}px ${cy}px`,
                  animation: `${animName} ${ring.duration} linear infinite`,
                }}
              />
            </g>
          );
        })}

        <circle
          cx={cx}
          cy={cy}
          r={12 * scale}
          fill="#050a14"
          stroke="#00e5ff"
          strokeWidth={2 * scale}
        />
        <circle cx={cx} cy={cy} r={5 * scale} fill="#00e5ff" />
      </svg>
    </div>
  );
}