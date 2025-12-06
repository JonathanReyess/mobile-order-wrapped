import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface FavoriteRestaurantProps {
  uniqueCount: number;
  restaurant: string;
  isPlaying: boolean;
}

// Reusing the theme constants
const NEON_HIGHLIGHT = "text-[#E600FF]"; // Hot Pink / Magenta
const PRIMARY_TEXT = "text-white";
const BACKGROUND_GRADIENT = "bg-gradient-to-br from-[#0D003B] via-[#000428] to-[#0091FF]"; // Dark Blue to Electric Blue

const FavoriteRestaurant: React.FC<FavoriteRestaurantProps> = ({
  uniqueCount,
  restaurant,
  isPlaying,
}) => {
  const prefix = "You visited ";
  const numStr = uniqueCount.toString();
  const suffix = uniqueCount < 2 
    ? " unique restaurant." 
    : " unique restaurants.";
  
  const fullLine1 = prefix + numStr + suffix;
  const numStart = prefix.length;
  const numEnd = numStart + numStr.length;

  const line2Full = uniqueCount < 2 
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
          timeoutRef.current = window.setTimeout(() => setStep(2), 1750); // Slightly faster transition
          return prev;
        }
      });
    }, 45); // Slightly faster typing

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
          timeoutRef.current = window.setTimeout(() => setStep(3), 2000); // Wait less before the reveal
          return prev;
        }
      });
    }, 40); // Slightly faster typing

    return () => {
      clearInterval(typingIntervalRef.current!);
      clearTimeout(timeoutRef.current!);
    };
  }, [step, isPlaying, line2Full.length]);

  // Show crown after reaching step 3
  useEffect(() => {
    if (step === 3) {
      timeoutRef.current = window.setTimeout(() => setShowCrown(true), 500); // Crown appears quickly after text
    }
    return () => clearTimeout(timeoutRef.current!);
  }, [step]); 

  // Motion variants
  const fadeAndScale = {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1, transition: { duration: 0.5 } },
    exit:    { opacity: 0, scale: 1.05, transition: { duration: 0.4 } },
  };
  
  // Adjusted pop for maximum visual impact (massive text with spring)
  const popReveal = {
    initial: { scale: 0.1, opacity: 0, rotate: -5 },
    animate: { scale: 1, opacity: 1, rotate: 0, transition: { type: "spring", stiffness: 100, damping: 10 } },
    exit:    { opacity: 0 },
  };
  
  // Crown drop is faster and snappier
  const dropCrown = {
    initial: { y: -100, opacity: 0, rotate: 15 },
    animate: { y: -20, opacity: 1, rotate: 0, transition: { type: "spring", stiffness: 200, damping: 10 } },
    exit:    { opacity: 0 },
  };


  // Render the first line with number highlighted
  const renderedLine1 = fullLine1
    .slice(0, idx1)
    .split("")
    .map((char, i) =>
      i >= numStart && i < numEnd ? (
        <span key={i} className={NEON_HIGHLIGHT + " font-black"}>{char}</span> // Apply Hot Pink highlight
      ) : (
        <React.Fragment key={i}>{char}</React.Fragment>
      )
    );

  return (
    <div className={`relative h-screen w-full flex flex-col items-center justify-center ${BACKGROUND_GRADIENT} ${PRIMARY_TEXT} p-4 font-sans`}>
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
  );
};

export default FavoriteRestaurant;