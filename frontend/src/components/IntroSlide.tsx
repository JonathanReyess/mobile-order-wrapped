import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface IntroSlideProps {
  name?: string;
  isPlaying: boolean;
}

const IntroSlide = ({ name, isPlaying }: IntroSlideProps) => {
  const [step, setStep] = useState(0);

  // Pause control
  const stepStartTime = useRef<number | null>(null);
  const elapsedTime = useRef<number>(0);
  const timerRef = useRef<number | null>(null);

  const stepDelays = [2000]; // 2 seconds for greeting before switch

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
    <div className="h-screen w-full flex flex-col items-center justify-center bg-gradient-to-r from-duke-blue to-duke-royal text-white px-4">
      <AnimatePresence mode="wait">
        {step === 0 ? (
          <motion.h1
            key="greeting"
            className="text-5xl md:text-6xl font-extrabold text-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 1 }}
          >
            Hello,{name ? ` ${name}` : ""} 👋
          </motion.h1>
        ) : (
          <motion.div
            key="wrapped"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2 }}
            className="text-center"
          >
            <h1 className="text-5xl md:text-6xl font-extrabold leading-tight">
              Your Mobile Order <br /> Wrapped is Here 🎉
            </h1>
            <p className="mt-6 text-lg md:text-2xl max-w-xl mx-auto">
              Let’s take a look at what you’ve been craving all semester at Duke.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default IntroSlide;
