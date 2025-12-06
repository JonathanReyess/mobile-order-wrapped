import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface UniqueOrdersSlideProps {
  totalUniqueItems: number;
  isPlaying: boolean;
}

const UniqueOrdersSlide: React.FC<UniqueOrdersSlideProps> = ({
  totalUniqueItems,
  isPlaying,
}) => {
  const prefix = "You ordered ";
  const numStr = totalUniqueItems.toString();
  const suffix = totalUniqueItems === 1
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

  // Typing Line 1
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

  // Typing Line 2
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

  // Animation Variants
  const fade = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit:    { opacity: 0 },
  };

  // Render first line with number highlighted
  const renderedLine1 = fullLine1
    .slice(0, idx1)
    .split("")
    .map((char, i) =>
      i >= numStart && i < numEnd ? (
        <span key={i} className="text-lime-400">{char}</span> // NEW: Neon Green Highlight
      ) : (
        <React.Fragment key={i}>{char}</React.Fragment>
      )
    );

  return (
    // NEW: Background Gradient (Deep Space Blue/Purple)
    <div className="relative h-full w-full flex flex-col items-center justify-center bg-gradient-to-tr from-gray-900 via-indigo-900 to-purple-900 p-4">
      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.p
            key="line1"
            variants={fade}
            initial="initial"
            animate="animate"
            exit="exit"
            className="text-5xl font-extrabold text-gray-200 text-center tracking-wide" // Adjusted text color
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
            className="mt-6 text-5xl font-extrabold text-indigo-300 text-center tracking-wide" // Adjusted text color
          >
            {line2Full.slice(0, idx2)}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UniqueOrdersSlide;