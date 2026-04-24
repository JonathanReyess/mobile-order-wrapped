import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface UniqueOrdersSlideProps {
  totalUniqueItems: number;
  isPlaying: boolean;
}

// 20 cols × 12 rows — smaller tiles, denser frame matching Cover-2's staircase oval
const COLS = 20;
const ROWS = 12;
const TILE_GRID: number[][] = [
  [1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1],
  [1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1],
  [1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1],
  [1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1],
  [1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1],
  [1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1],
  [1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1],
];

// Mirrored: cyan at both edges, purple at center
// t = 0 (edge) → 1 (center)
function lerpTileColor(t: number, r: number) {
  const bow = Math.sin(r * Math.PI) * 4;
  return {
    hue: 185 + t * 85, // cyan (185°) → purple (270°)
    sat: 100 - t * 12, // 100% → 88%
    light: 50 - t * 16 + bow, // 50% → 34%
  };
}

function tileStyle(row: number, col: number): React.CSSProperties {
  // Mirror t so both left and right edges = 0, center column = 1
  const t = 1 - Math.abs(col / (COLS - 1) - 0.5) * 2;
  const r = row / (ROWS - 1);
  const { hue, sat, light } = lerpTileColor(t, r);
  return {
    background: `linear-gradient(135deg, hsl(${hue + 12}, ${sat}%, ${Math.max(light - 12, 2)}%), hsl(${hue}, ${sat}%, ${light}%))`,
    borderRadius: "2px",
  };
}

const TileBackground: React.FC = () => (
  <div className="absolute inset-0 pointer-events-none">
    {TILE_GRID.map((rowArr, row) => (
      <div
        key={row}
        className="absolute flex w-full"
        style={{
          top: `${(row / ROWS) * 100}%`,
          height: `${(1 / ROWS) * 100}%`,
          padding: "1.5px 0",
        }}
      >
        {rowArr.map((val, col) => (
          <div key={col} className="flex-1" style={{ padding: "0 1.5px" }}>
            {val === 1 && (
              <motion.div
                className="h-full w-full"
                style={tileStyle(row, col)}
                initial={{ opacity: 0, scale: 0.75 }}
                animate={{
                  opacity: [0.6, 1, 0.6],
                  scale: 1,
                  boxShadow: [
                    "0 0 4px rgba(0, 180, 255, 0.1)",
                    "0 0 16px rgba(0, 229, 255, 0.55)",
                    "0 0 4px rgba(0, 180, 255, 0.1)",
                  ],
                }}
                transition={{
                  opacity: {
                    duration: 2.8,
                    repeat: Infinity,
                    delay: (row + col) * 0.12,
                    ease: "easeInOut",
                  },
                  boxShadow: {
                    duration: 2.8,
                    repeat: Infinity,
                    delay: (row + col) * 0.12,
                    ease: "easeInOut",
                  },
                  scale: {
                    duration: 0.45,
                    delay: (row + col) * 0.04,
                    ease: [0.34, 1.56, 0.64, 1],
                  },
                }}
              />
            )}
          </div>
        ))}
      </div>
    ))}
  </div>
);

const UniqueOrdersSlide: React.FC<UniqueOrdersSlideProps> = ({
  totalUniqueItems,
  isPlaying,
}) => {
  const prefix = "You ordered ";
  const numStr = totalUniqueItems.toString();
  const suffix =
    totalUniqueItems === 1
      ? " unique meal this semester."
      : " different meals this semester.";

  const fullLine1 = prefix + numStr + suffix;
  const numStart = prefix.length;
  const numEnd = numStart + numStr.length;

  const line2Full = "These had you crawling back...";

  const [step, setStep] = useState<1 | 2>(1);
  const [idx1, setIdx1] = useState(0);
  const [idx2, setIdx2] = useState(0);

  const typingIntervalRef = useRef<number | null>(null);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    if (step !== 1 || !isPlaying) return;

    typingIntervalRef.current = window.setInterval(() => {
      setIdx1((prev) => {
        if (prev < fullLine1.length) {
          return prev + 1;
        } else {
          clearInterval(typingIntervalRef.current!);
          timeoutRef.current = window.setTimeout(() => setStep(2), 2000);
          return prev;
        }
      });
    }, 50);

    return () => {
      clearInterval(typingIntervalRef.current!);
      clearTimeout(timeoutRef.current!);
    };
  }, [step, isPlaying, fullLine1.length]);

  useEffect(() => {
    if (step !== 2 || !isPlaying) return;

    typingIntervalRef.current = window.setInterval(() => {
      setIdx2((prev) => {
        if (prev < line2Full.length) {
          return prev + 1;
        } else {
          clearInterval(typingIntervalRef.current!);
          return prev;
        }
      });
    }, 50);

    return () => {
      clearInterval(typingIntervalRef.current!);
      clearTimeout(timeoutRef.current!);
    };
  }, [step, isPlaying, line2Full.length]);

  const fade = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  };

  const renderedLine1 = fullLine1
    .slice(0, idx1)
    .split("")
    .map((char, i) =>
      i >= numStart && i < numEnd ? (
        <span key={i} className="text-cyan-300">
          {char}
        </span>
      ) : (
        <React.Fragment key={i}>{char}</React.Fragment>
      ),
    );

  return (
    <div className="relative h-full w-full flex flex-col items-center justify-center bg-black p-4">
      <TileBackground />
      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.p
            key="line1"
            variants={fade}
            initial="initial"
            animate="animate"
            exit="exit"
            className="relative z-10 text-4xl font-extrabold text-gray-100 text-center tracking-wide"
          >
            {renderedLine1}
          </motion.p>
        )}

        {step === 2 && (
          <motion.p
            key="line2"
            variants={fade}
            initial="initial"
            animate="animate"
            exit="exit"
            className="relative z-10 mt-6 text-4xl font-extrabold text-white text-center tracking-wide"
          >
            {line2Full.slice(0, idx2)}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UniqueOrdersSlide;
