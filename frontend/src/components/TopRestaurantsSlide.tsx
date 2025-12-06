import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

export default function TopRestaurantsSlide({
  restaurantCounts,
  isPlaying,
}: {
  restaurantCounts: Record<string, number>;
  isPlaying: boolean;
}) {
  const top = Object.entries(restaurantCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const [step, setStep] = useState(0);

  // Pause/resume control
  const stepStartTime = useRef<number | null>(null);
  const elapsedTime = useRef<number>(0);
  const timerRef = useRef<number | null>(null);

  const stepDelays = [250, 1500, 1100, 1100, 1100, 1100];

  useEffect(() => {
    function startTimerForStep() {
      if (step >= stepDelays.length) return;
      stepStartTime.current = Date.now();

      const remainingTime = stepDelays[step] - elapsedTime.current;

      timerRef.current = window.setTimeout(() => {
        setStep((prev) => prev + 1);
        elapsedTime.current = 0;
      }, remainingTime);
    }

    if (isPlaying) {
      startTimerForStep();
    } else {
      if (stepStartTime.current !== null) {
        elapsedTime.current += Date.now() - stepStartTime.current;
        clearTimeout(timerRef.current!);
      }
    }

    return () => {
      clearTimeout(timerRef.current!);
    };
  }, [isPlaying, step]);

  return (
    // Main Container: Added pb-24 to reserve space for external controls
    <div className="h-screen w-full flex flex-col items-center justify-between bg-gradient-to-tl from-cyan-950 via-gray-900 to-blue-900 text-gray-100 px-4 pb-24">
      
      {/* Title */}
      <motion.h2
        className="pt-16 md:pt-8 text-3xl md:text-5xl font-extrabold text-center tracking-tight"
        initial={{ opacity: 0, y: 40 }}
        animate={step >= 1 ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
        transition={{ duration: 0.8 }}
      >
        My Top <span className="text-cyan-400">Dining Spots</span>
      </motion.h2>


      {/* Restaurants Container */}
      {/* FIX 1: Removed flex-grow and overflow-y-auto. 
          FIX 2: Reduced vertical spacing from gap-6 to gap-4. */}
      <div className="mt-4 flex flex-col items-center gap-4 w-full max-w-sm p-4">
        {top.map(([name, count], idx) => (
          <motion.div
            key={name}
            // FIX 3: Reduced vertical padding from py-4 to py-3 to make cards thinner
            className="bg-cyan-900/40 backdrop-blur-sm border border-cyan-800 rounded-xl px-6 py-3 shadow-2xl w-full max-w-xs flex-shrink-0"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={step >= idx + 2 ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.5 }}
          >
            {/* Restaurant Name Styling */}
            <div className="text-xl md:text-2xl font-extrabold text-gray-50 text-center tracking-wide">{name}</div>
            
            {/* Count/Visit Styling */}
            <div className="text-base md:text-lg text-gray-400 text-center mt-1">
              <span className="text-cyan-400 font-bold">{count}</span> visit{count > 1 ? "s" : ""}
            </div>

          </motion.div>
        ))}
      </div>
    </div>
  );
}