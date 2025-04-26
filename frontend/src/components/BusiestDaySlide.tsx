import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

function formatToMonthDay(dateStr: string) {
  const [year, month, day] = dateStr.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  if (isNaN(date.getTime())) return "Invalid date";
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
  });
}

export default function BusiestDaySlide({
  date,
  orderCount,
  isPlaying,
}: {
  date: string;
  orderCount: number;
  isPlaying: boolean;
}) {
  const formattedDate = formatToMonthDay(date);
  const line3Full = `Let's see what you got...`;

  // Step control
  const [step, setStep] = useState(0);
  const [idx3, setIdx3] = useState(0);
  const [localIsTyping, setLocalIsTyping] = useState(false);

  // For smarter pausing
  const stepStartTime = useRef<number | null>(null);
  const elapsedTime = useRef<number>(0);
  const timerRef = useRef<number | null>(null);

  const stepDelays = [250, 1500, 1100, 1500];

  useEffect(() => {
    function startTimerForStep() {
      if (step >= stepDelays.length) return; // No more steps
      stepStartTime.current = Date.now();

      const remainingTime = stepDelays[step] - elapsedTime.current;

      timerRef.current = window.setTimeout(() => {
        if (step < 3) {
          setStep((prev) => prev + 1);
        } else if (step === 3) {
          setLocalIsTyping(true);
        }
        elapsedTime.current = 0; // Reset elapsed once step completes
      }, remainingTime);
    }

    if (isPlaying) {
      startTimerForStep();
    } else {
      // If pausing: calculate how much time has passed and clear the timer
      if (stepStartTime.current !== null) {
        elapsedTime.current += Date.now() - stepStartTime.current;
        clearTimeout(timerRef.current!);
      }
    }

    return () => {
      clearTimeout(timerRef.current!);
    };
  }, [isPlaying, step]);

  // Typing effect (separate, smarter handling too)
  useEffect(() => {
    if (!isPlaying || !localIsTyping) return;

    const typeSpeed = 50;
    const intervalId = window.setInterval(() => {
      setIdx3((i) => {
        if (i >= line3Full.length) {
          clearInterval(intervalId);
          return i;
        }
        return i + 1;
      });
    }, typeSpeed);

    return () => clearInterval(intervalId);
  }, [isPlaying, localIsTyping, line3Full]);

  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-gradient-to-r from-duke-blue via-duke-royal to-duke-light text-white px-4">
      
      {/* Title */}
      <motion.h2
        className="text-4xl md:text-5xl font-extrabold text-center"
        initial={{ opacity: 0, y: 30 }}
        animate={step >= 1 ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
        transition={{ duration: 0.75 }}
      >
        My Busiest Day
      </motion.h2>

      {/* Date */}
      <motion.p
        className="mt-6 text-2xl md:text-4xl font-bold text-center"
        initial={{ opacity: 0 }}
        animate={step >= 2 ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 1 }}
      >
        {formattedDate}
      </motion.p>

      {/* Orders */}
      <motion.p
        className="mt-4 text-lg md:text-2xl text-blue-100 text-center"
        initial={{ opacity: 0 }}
        animate={step >= 3 ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 1 }}
      >
        {orderCount} orders
      </motion.p>

      {/* Typing line */}
      <motion.p
        className="mt-4 text-lg md:text-2xl text-blue-100 text-center min-h-[2rem]"
        initial={{ opacity: 0 }}
        animate={localIsTyping ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.5 }}
      >
        {line3Full.slice(0, idx3)}
      </motion.p>
    </div>
  );
}
