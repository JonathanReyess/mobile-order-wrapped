import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface IntroSlideProps {
  name?: string;
  isPlaying: boolean;
  onComplete?: () => void;
}

const IntroSlide = ({ name, isPlaying, onComplete }: IntroSlideProps) => {
  const [step, setStep] = useState(0);
  const stepStartTime = useRef<number | null>(null);
  const elapsedTime = useRef<number>(0);
  const timerRef = useRef<number | null>(null);
  const stepDelays = [2000, 5000];

  useEffect(() => {
    function startTimerForStep() {
      if (step >= stepDelays.length) {
        onComplete?.();
        return;
      }
      stepStartTime.current = Date.now();
      const remaining = stepDelays[step] - elapsedTime.current;
      timerRef.current = window.setTimeout(() => {
        setStep((s) => s + 1);
        elapsedTime.current = 0;
      }, remaining);
    }

    if (isPlaying) {
      startTimerForStep();
    } else if (stepStartTime.current !== null) {
      elapsedTime.current += Date.now() - stepStartTime.current;
      clearTimeout(timerRef.current!);
    }
    return () => clearTimeout(timerRef.current!);
  }, [isPlaying, step, onComplete]);

  return (
    <div className="
        h-screen w-full 
        flex flex-col items-center justify-center 
        bg-gradient-to-r from-duke-blue to-duke-royal 
        text-white 
        px-4
      ">
      <AnimatePresence mode="wait">
        {step === 0 && (
          <motion.h1
            key="greeting"
            className="
              w-full max-w-full
              px-2
              text-[clamp(2rem,8vw,4rem)]
              font-extrabold 
              text-center 
              leading-snug
              break-words
            "
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 1 }}
          >
            Hello{ name ? `, ${name}` : "" }{" "}
            <motion.span
              style={{ display: "inline-block" }}
              animate={{ rotate: [0, 20, -20, 20, -20, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 3 }}
            >
              👋
            </motion.span>
          </motion.h1>
        )}

        {step === 1 && (
          <motion.div
            key="wrapped"
            className="w-full max-w-full px-2 text-center"
            initial={{ opacity: 0, y: 50, scale: 1 }}
            animate={{ opacity: 1, y: 0, scale: 1.15 }}
            exit={{ opacity: 0, scale: 20 }}
            transition={{ duration: 0.94 }}
          >
<h1 className="
    w-full max-w-full
    text-[clamp(2rem,5vw,4rem)]
    font-extrabold 
    leading-none
    break-words
    mx-auto
  ">
  Your Mobile Order <br /> Wrapped is Here 🎉
</h1>
<p className="
    mt-4 
    w-full
    text-[clamp(0.75rem,2vw,1.5rem)]
    leading-tight
    break-words
    mx-auto
  ">
  Let’s take a look at what you’ve been craving all<br/>
  <span className="block">semester at Duke.</span>
</p>


          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default IntroSlide;
