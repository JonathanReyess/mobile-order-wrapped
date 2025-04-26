import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface FavoriteRestaurantProps {
  uniqueCount: number;
  restaurant: string;
  isPlaying: boolean;
}

const FavoriteRestaurant: React.FC<FavoriteRestaurantProps> = ({
  uniqueCount,
  restaurant,
  isPlaying,
}) => {
  const prefix = "You visited ";
  const numStr = uniqueCount.toString();
  const suffix = " unique restaurants this semester.";
  const fullLine1 = prefix + numStr + suffix;
  const numStart = prefix.length;
  const numEnd = numStart + numStr.length;

  const line2Full = "but only one holds a special place in your heart...";

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

  // Typing line 2
  useEffect(() => {
    if (step !== 2 || !isPlaying) return;

    typingIntervalRef.current = window.setInterval(() => {
      setIdx2((prev) => {
        if (prev < line2Full.length) {
          return prev + 1;
        } else {
          clearInterval(typingIntervalRef.current!);
          timeoutRef.current = window.setTimeout(() => setStep(3), 2750);
          return prev;
        }
      });
    }, 50);

    return () => {
      clearInterval(typingIntervalRef.current!);
      clearTimeout(timeoutRef.current!);
    };
  }, [step, isPlaying, line2Full.length]);

  // Show crown after reaching step 3
  useEffect(() => {
    if (step === 3 && isPlaying) {
      timeoutRef.current = window.setTimeout(() => setShowCrown(true), 1500);
    }
    return () => clearTimeout(timeoutRef.current!);
  }, [step, isPlaying]);

  // Motion variants
  const fade = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit:    { opacity: 0 },
  };
  const pop = {
    initial: { scale: 0.5, opacity: 0 },
    animate: { scale: 1,   opacity: 1, transition: { type: "spring", stiffness: 300 } },
    exit:    { opacity: 0 },
  };
  const drop = {
    initial: { y: -50, opacity: 0 },
    animate: { y: 0,   opacity: 1, transition: { type: "spring", stiffness: 300, damping: 12 } },
    exit:    { opacity: 0 },
  };

  // Render the first line with number highlighted
  const renderedLine1 = fullLine1
    .slice(0, idx1)
    .split("")
    .map((char, i) =>
      i >= numStart && i < numEnd ? (
        <span key={i} className="text-blue-600">{char}</span>
      ) : (
        <React.Fragment key={i}>{char}</React.Fragment>
      )
    );

  return (
    <div className="relative h-full w-full flex flex-col items-center justify-center bg-gradient-to-br from-white via-indigo-100 to-indigo-300 p-4">
      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.p
            key="line1"
            variants={fade}
            initial="initial"
            animate="animate"
            exit="exit"
            className="text-3xl font-bold text-gray-800 text-center"
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
            className="mt-4 text-3xl font-bold text-gray-800 text-center"
          >
            {line2Full.slice(0, idx2)}
          </motion.p>
        )}

        {step === 3 && (
          <motion.div
            key="final"
            variants={fade}
            initial="initial"
            animate="animate"
            exit="exit"
            className="relative flex flex-col items-center"
          >
            {showCrown && (
              <motion.span
                key="crown"
                variants={drop}
                initial="initial"
                animate="animate"
                className="text-4xl absolute -top-12"
              >
                👑
              </motion.span>
            )}
            <motion.h1
              variants={pop}
              initial="initial"
              animate="animate"
              exit="exit"
              className="text-6xl font-extrabold text-indigo-800 text-center"
            >
              {restaurant}
            </motion.h1>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FavoriteRestaurant;
