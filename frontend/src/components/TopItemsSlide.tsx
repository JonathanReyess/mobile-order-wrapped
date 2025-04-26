import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

export default function TopItemsSlide({
  itemCounts,
  isPlaying,
}: {
  itemCounts: Array<{ count: number; item: string }>;
  isPlaying: boolean;
}) {
  const topItems = [...itemCounts]
    .sort((a, b) => b.count - a.count)
    .slice(0, 3);

  const [step, setStep] = useState(0);

  // Pause control
  const stepStartTime = useRef<number | null>(null);
  const elapsedTime = useRef<number>(0);
  const timerRef = useRef<number | null>(null);

  // 1s before title, then 1s between each item
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
    <div className="h-screen min-h-screen w-full flex flex-col items-center justify-center overflow-hidden bg-gradient-to-tr from-duke-royal to-duke-sky text-white px-4">
      
      {/* Title */}
      <motion.h2
        className="text-4xl md:text-5xl font-extrabold text-center"
        initial={{ opacity: 0, y: 40 }}
        animate={step >= 1 ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
        transition={{ duration: 0.8 }}
      >
        My Top <span className="text-yellow-200">Cravings</span>
      </motion.h2>

      <div className="mt-8 flex flex-col items-center gap-6">
        {topItems.map((item, idx) => (
          <motion.div
            key={item.item}
            className="bg-white/10 rounded-xl px-8 py-4 shadow-lg flex flex-col items-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={step >= idx + 2 ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.5 }}
          >
            <div className="text-2xl md:text-3xl font-bold">{item.item}</div>
            <div className="text-lg md:text-xl text-yellow-100 font-semibold">
              Ordered <span className="text-yellow-300">{item.count}</span> times
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
