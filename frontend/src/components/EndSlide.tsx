import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

export default function EndSlide({ isPlaying }: { isPlaying: boolean }) {
  // Retaining original text content
  const lineFull = "Thanks for ordering, munching, and making memories this semester.\nCan’t wait to see what you’ll order next! 💖";

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

  // Typing effect with pause after "semester."
  useEffect(() => {
    if (!isPlaying || step < 2) return; // Wait until after title shows
  
    const normalSpeed = 50; // 50ms for first sentence
    const slowSpeed = 50;  // 100ms for second sentence
    const pauseAfterSemester = 800; // pause after "semester."
    
    let currentSpeed = normalSpeed;
    let intervalId: number | null = null;
  
    function startTyping(speed: number) {
      intervalId = window.setInterval(() => {
        setTypedText((prev) => {
          if (prev.length >= lineFull.length) {
            if (intervalId) clearInterval(intervalId);
            return prev;
          }
  
          const newText = lineFull.slice(0, prev.length + 1);
  
          // Check if just typed "semester."
          if (newText.endsWith("semester.")) {
            if (intervalId) clearInterval(intervalId);
  
            setTimeout(() => {
              startTyping(currentSpeed); // Resume typing after pause
            }, pauseAfterSemester);
  
            return newText;
          }
  
          // Check if just typed "\n" (newline between sentences)
          if (lineFull[prev.length] === "\n") {
            if (intervalId) clearInterval(intervalId);
  
            currentSpeed = slowSpeed; // slow down typing speed
            startTyping(currentSpeed); // Restart typing at slower speed
            return newText;
          }
  
          return newText;
        });
      }, speed);
    }
  
    startTyping(currentSpeed);
  
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isPlaying, step, lineFull]);
  

  return (
    // NEW: Background Gradient (Vibrant Pink/Yellow/Orange Celebration)
    <div className="h-screen w-full flex flex-col items-center justify-center bg-gradient-to-br from-fuchsia-800 via-pink-600 to-yellow-400 text-white px-4">
      
      {/* Title */}
      <motion.h2
        className="text-5xl md:text-7xl font-black italic text-center mb-4 tracking-tight" // Sharper, heavier font
        initial={{ opacity: 0, scale: 0.5 }}
        animate={step >= 1 ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.5 }} // Dynamic scale up
        transition={{ duration: 0.8, type: "spring", stiffness: 100 }}
      >
        That’s a Wrap! 🎉
      </motion.h2>

      {/* Typing paragraph */}
      <motion.p
        className="mt-6 text-xl md:text-3xl font-medium text-center max-w-lg min-h-[6rem] whitespace-pre-line text-yellow-50" // Light yellow/off-white text
        initial={{ opacity: 0 }}
        animate={step >= 1 ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 1 }}
      >
        {typedText}
      </motion.p>

    </div>
  );
}