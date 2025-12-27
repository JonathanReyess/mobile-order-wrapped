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
  // Adjusted step delays for a slightly faster, snappier feel
  const stepDelays = [1500, 4500];

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
    // Replace the outer div in IntroSlide.tsx with this:
    <div
      className="
    h-screen w-full 
    flex flex-col items-center justify-center 
    /* Animated Gradient Background */
    bg-[length:400%_400%]
    animate-gradient-slow
    bg-gradient-to-br from-[#1E004B] via-[#4A003D] to-[#0A0724] 
    text-white 
    px-4
    font-sans
    relative
    overflow-hidden
  "
    >
      {/* Optional: Add a subtle grain texture overlay for that Wrapped feel */}
      <div className="absolute inset-0 opacity-[0.25] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
      <AnimatePresence mode="wait">
        {step === 0 && (
          <motion.h1
            key="greeting"
            className="
              w-full max-w-full
              px-2
              /* Larger, bolder text, and often slightly condensed */
              text-[clamp(2.5rem,10vw,4rem)]
              font-extrabold 
              text-center 
              leading-snug
              break-words
              /* Use a neon-like color for an eye-catching effect */
              text-white 
            "
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.8 }}
          >
            Hi {name ? ` ${name}` : ""}{" "}
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
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            /* Wrapped usually has a zoom-in/pop effect */
            animate={{ opacity: 1, y: 0, scale: 1.05 }}
            exit={{ opacity: 0, scale: 20 }}
            transition={{ duration: 0.75 }}
          >
            <h1
              className="
                w-full max-w-full
                /* Massive headline for maximum impact */
                text-[clamp(3rem,12vw,5rem)]
                font-black 
                leading-[1.1] /* Tight leading */
                break-words
                mx-auto
                /* Bold white text for contrast */
                text-white
              "
            >
              Your Mobile Order <br />{" "}
              <span
                className="
                /* Highlighted 'Wrapped' text with another neon color */
                text-[#FF3086] italic
                "
              >
                Wrapped
              </span>{" "}
              is Here 🎉
            </h1>
            <p
              className="
                mt-6 
                w-full
                /* Subdued but legible secondary text */
                text-[clamp(1rem,3vw,2rem)]
                leading-snug
                break-words
                mx-auto
                text-gray-200
              "
            >
              Let’s take a look at what you’ve been craving all
              <br />
              <span className="block">semester at Duke.</span>
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default IntroSlide;
