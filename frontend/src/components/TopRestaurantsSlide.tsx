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
    .slice(0, 4);

  const [step, setStep] = useState(0);

  // Pause/resume control
  const stepStartTime = useRef<number | null>(null);
  const elapsedTime = useRef<number>(0);
  const timerRef = useRef<number | null>(null);

  const stepDelays = [250, 1500, 1100, 1100];

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
    <div className="h-screen w-full flex flex-col items-center justify-center bg-gradient-to-br from-duke-slate via-teal-400 to-duke-royal text-white px-4">
      
      {/* Title */}
      <motion.h2
        className="text-4xl md:text-5xl font-extrabold text-center"
        initial={{ opacity: 0, y: 40 }}
        animate={step >= 1 ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
        transition={{ duration: 0.8 }}
      >
        My Top Dining Spots
      </motion.h2>

      {/* Restaurants */}
      <div className="mt-8 flex flex-col items-center gap-6 w-full max-w-sm">
  {top.map(([name, count], idx) => (
    <motion.div
      key={name}
      className="bg-white/10 rounded-xl px-6 py-4 shadow-lg w-full max-w-xs"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={step >= idx + 2 ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.5 }}
    >
      <div className="text-2xl md:text-3xl font-bold text-center">{name}</div>
      <div className="text-lg text-blue-100 text-center">
        {count} visit{count > 1 ? "s" : ""}
      </div>
    </motion.div>
  ))}
</div>


    </div>
  );
}
