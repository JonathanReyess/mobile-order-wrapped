import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

export default function EndSlide({ isPlaying }: { isPlaying: boolean }) {
  const lineFull = "Thanks for ordering, munching, and making memories this semester.\nCan’t wait to see what you’ll order next! 💙";

  const [step, setStep] = useState(0); // Step control
  const [typedText, setTypedText] = useState("");

  // For pausing control
  const stepStartTime = useRef<number | null>(null);
  const elapsedTime = useRef<number>(0);
  const timerRef = useRef<number | null>(null);

  const stepDelays = [250, 1100]; // 1s before title appears

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

  // Typing effect
  useEffect(() => {
    if (!isPlaying || step < 2) return; // Wait until after title shows

    const typeSpeed = 50; // 50ms per character
    const intervalId = window.setInterval(() => {
      setTypedText((prev) => {
        if (prev.length >= lineFull.length) {
          clearInterval(intervalId);
          return prev;
        }
        return lineFull.slice(0, prev.length + 1);
      });
    }, typeSpeed);

    return () => clearInterval(intervalId);
  }, [isPlaying, step, lineFull]);

  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-gradient-to-tl from-duke-blue via-duke-royal to-duke-light text-white px-4">
      
      {/* Title */}
      <motion.h2
        className="text-4xl md:text-6xl font-extrabold text-center"
        initial={{ opacity: 0, y: 40 }}
        animate={step >= 1 ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
        transition={{ duration: 1 }}
      >
        That’s a Wrap! 🎬
      </motion.h2>

      {/* Typing paragraph */}
      <motion.p
  className="mt-4 text-lg md:text-2xl text-center max-w-lg min-h-[6rem] whitespace-pre-line"
  initial={{ opacity: 0 }}
  animate={step >= 1 ? { opacity: 1 } : { opacity: 0 }}
  transition={{ duration: 1 }}
>
  {typedText}
</motion.p>


    </div>
  );
}
