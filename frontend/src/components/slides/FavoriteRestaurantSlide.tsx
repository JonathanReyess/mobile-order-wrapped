import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";

interface FavoriteRestaurantProps {
  uniqueCount: number;
  restaurant: string;
  isPlaying: boolean;
}

const NEON_HIGHLIGHT = "text-[#E600FF]";
const PRIMARY_TEXT = "text-white";

// Number of Tiles: High
const STRIPE_COLS = 24;

const TopItemsTileBackground = () => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden flex">
    {Array.from({ length: STRIPE_COLS }).map((_, col) => {
      const progress = col / (STRIPE_COLS - 1);
      const topH = Math.max(3 + progress * 22, 0.5);
      const botH = Math.max(3 + (1 - progress) * 22, 0.5);

      const light = col % 2 === 0 ? 54 : 47;
      const hue = 207 + (col % 3) * 2;

      const topGrad = `linear-gradient(180deg, hsl(${hue},85%,${light + 10}%), hsl(${hue},85%,${light}%))`;
      const botGrad = `linear-gradient(0deg,   hsl(${hue},85%,${light + 10}%), hsl(${hue},85%,${light}%))`;

      const cutAmount = "2vw";
      const topPolygon = `polygon(0 0, 100% 0, 100% 100%, 0 calc(100% - ${cutAmount}))`;
      const botPolygon = `polygon(0 ${cutAmount}, 100% 0, 100% 100%, 0 100%)`;

      // Animation Settings
      const waveDuration = 2; // Speed of the up/down movement
      const waveDelay = col * 0.15; // Stagger effect

      return (
        <div
          key={col}
          className="flex-1 flex flex-col justify-between"
          style={{ margin: "0 1px" }}
        >
          {/* Top Tile */}
          <motion.div
            initial={{ height: 0, y: 0 }}
            animate={{
              height: `${topH}%`,
              y: [0, -15, 0], // Moves slightly up and back
              opacity: [0.7, 1, 0.7],
            }}
            transition={{
              height: { duration: 0.7, delay: col * 0.035, ease: "easeOut" },
              y: {
                duration: waveDuration,
                repeat: Infinity,
                delay: waveDelay,
                ease: "easeInOut",
              },
              opacity: {
                duration: waveDuration,
                repeat: Infinity,
                delay: waveDelay,
                ease: "easeInOut",
              },
            }}
            style={{
              background: topGrad,
              flexShrink: 0,
              borderRadius: "0 0 2px 2px",
              clipPath: topPolygon,
            }}
          />

          <div className="flex-1" />

          {/* Bottom Tile */}
          <motion.div
            initial={{ height: 0, y: 0 }}
            animate={{
              height: `${botH}%`,
              y: [0, 15, 0], // Moves slightly down and back
              opacity: [0.7, 1, 0.7],
            }}
            transition={{
              height: { duration: 0.7, delay: col * 0.035, ease: "easeOut" },
              y: {
                duration: waveDuration,
                repeat: Infinity,
                delay: waveDelay,
                ease: "easeInOut",
              },
              opacity: {
                duration: waveDuration,
                repeat: Infinity,
                delay: waveDelay,
                ease: "easeInOut",
              },
            }}
            style={{
              background: botGrad,
              flexShrink: 0,
              borderRadius: "2px 2px 0 0",
              clipPath: botPolygon,
            }}
          />
        </div>
      );
    })}
  </div>
);

const FavoriteRestaurant: React.FC<FavoriteRestaurantProps> = ({
  uniqueCount,
  restaurant,
  isPlaying,
}) => {
  const prefix = "You visited ";
  const numStr = uniqueCount.toString();
  const suffix =
    uniqueCount < 2 ? " unique restaurant." : " unique restaurants.";

  const fullLine1 = prefix + numStr + suffix;
  const numStart = prefix.length;
  const numEnd = numStart + numStr.length;

  const line2Full =
    uniqueCount < 2
      ? "and that one holds a special place in your heart..."
      : "but only one holds a special place in your heart...";

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [idx1, setIdx1] = useState(0);
  const [idx2, setIdx2] = useState(0);
  const [showCrown, setShowCrown] = useState(false);

  // Pause-aware typing intervals
  const typingIntervalRef = useRef<number | null>(null);
  const timeoutRef = useRef<number | null>(null);

  // Typing line 1
  useEffect(() => {
    if (step !== 1 || !isPlaying) return;

    typingIntervalRef.current = window.setInterval(() => {
      setIdx1((prev) => {
        if (prev < fullLine1.length) {
          return prev + 1;
        } else {
          clearInterval(typingIntervalRef.current!);
          timeoutRef.current = window.setTimeout(() => setStep(2), 1750);
          return prev;
        }
      });
    }, 45);

    return () => {
      clearInterval(typingIntervalRef.current!);
      clearTimeout(timeoutRef.current!);
    };
  }, [step, isPlaying, fullLine1.length]);

  // Typing line 2
  useEffect(() => {
    if (step !== 2 || !isPlaying) return;

    typingIntervalRef.current = window.setInterval(() => {
      setIdx2((prev) => {
        if (prev < line2Full.length) {
          return prev + 1;
        } else {
          clearInterval(typingIntervalRef.current!);
          timeoutRef.current = window.setTimeout(() => setStep(3), 3000);
          return prev;
        }
      });
    }, 40);

    return () => {
      clearInterval(typingIntervalRef.current!);
      clearTimeout(timeoutRef.current!);
    };
  }, [step, isPlaying, line2Full.length]);

  // Show crown after reaching step 3
  useEffect(() => {
    if (step === 3) {
      timeoutRef.current = window.setTimeout(() => setShowCrown(true), 500);
    }
    return () => clearTimeout(timeoutRef.current!);
  }, [step]);

  // Motion variants
  const fadeAndScale = {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1, transition: { duration: 0.5 } },
    exit: { opacity: 0, scale: 1.05, transition: { duration: 0.4 } },
  };

  const popReveal: Variants = {
    initial: { scale: 0.1, opacity: 0, rotate: -5 },
    animate: {
      scale: 1,
      opacity: 1,
      rotate: 0,
      transition: { type: "spring", stiffness: 100, damping: 10 },
    },
    exit: { opacity: 0 },
  };

  const dropCrown: Variants = {
    initial: { y: -100, opacity: 0, rotate: 15 },
    animate: {
      y: -20,
      opacity: 1,
      rotate: 0,
      transition: { type: "spring", stiffness: 200, damping: 10 },
    },
    exit: { opacity: 0 },
  };

  const renderedLine1 = fullLine1
    .slice(0, idx1)
    .split("")
    .map((char, i) =>
      i >= numStart && i < numEnd ? (
        <span key={i} className={NEON_HIGHLIGHT + " font-black"}>
          {char}
        </span>
      ) : (
        <React.Fragment key={i}>{char}</React.Fragment>
      ),
    );

  return (
    <div className="relative h-screen w-full overflow-hidden bg-black text-white select-none flex flex-col items-center justify-center p-4 font-sans">
      <TopItemsTileBackground />

      <div className="relative z-10 w-full flex flex-col items-center justify-center">
        <AnimatePresence mode="wait">
          {/* Step 1: Unique Restaurant Count */}
          {step === 1 && (
            <motion.p
              key="line1"
              variants={fadeAndScale}
              initial="initial"
              animate="animate"
              exit="exit"
              className={`
                text-[clamp(1.75rem,5.5vw,3rem)] 
                font-bold 
                ${PRIMARY_TEXT} 
                text-center 
                leading-snug 
                max-w-2xl
              `}
            >
              {renderedLine1}
            </motion.p>
          )}

          {/* Step 2: The Setup Line */}
          {step === 2 && (
            <motion.p
              key="line2"
              variants={fadeAndScale}
              initial="initial"
              animate="animate"
              exit="exit"
              className={`
                text-[clamp(1.75rem,5.5vw,3rem)] 
                font-bold 
                ${PRIMARY_TEXT} 
                text-center
                leading-snug 
                max-w-2xl
              `}
            >
              {line2Full.slice(0, idx2)}
            </motion.p>
          )}

          {/* Step 3: The Big Reveal */}
          {step === 3 && (
            <motion.div
              key="final"
              className="relative flex flex-col items-center"
            >
              {/* Crown Animation */}
              {showCrown && (
                <motion.span
                  key="crown"
                  variants={dropCrown}
                  initial="initial"
                  animate="animate"
                  className="text-[4rem] md:text-[6rem] absolute -top-15 md:-top-24"
                >
                  👑
                </motion.span>
              )}

              {/* Restaurant Name Reveal */}
              <motion.h1
                key="restaurant-name"
                variants={popReveal}
                initial="initial"
                animate="animate"
                exit="exit"
                className={`
                  text-[clamp(2.5rem,12vw,6rem)] 
                  font-black 
                  text-center
                  leading-tight
                `}
              >
                {restaurant}
              </motion.h1>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default FavoriteRestaurant;
