import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

function formatToMonthDay(dateStr: string) {
  const [year, month, day] = dateStr.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  if (isNaN(date.getTime())) return { formatted: "Invalid date", monthName: "" };

  const monthName = date.toLocaleDateString("en-US", { month: "long" });
  const formatted = date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
  });

  return { formatted, monthName };
}

function getMonthColor(month: string) {
  // Existing color logic is retained, providing unique color pops for the date.
  const colors: Record<string, string> = {
    January: "text-sky-300",
    February: "text-pink-300",
    March: "text-lime-300", // Adjusted for theme
    April: "text-yellow-300",
    May: "text-purple-300", 
    June: "text-gray-300", 
    July: "text-orange-300", 
    August: "text-amber-300", 
    September: "text-rose-300", 
    October: "text-indigo-300", 
    November: "text-amber-400", 
    December: "text-lime-400", // Adjusted for theme
  };
  return colors[month] || "text-gray-400"; // fallback
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
  const { formatted, monthName } = formatToMonthDay(date);
  const monthColorClass = getMonthColor(monthName);  
  
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
    // NEW: Background Gradient (Dark Earth & Black)
    <div className="h-screen w-full flex flex-col items-center justify-center bg-gradient-to-br from-black via-gray-900 to-stone-900 text-white px-4">
      
      {/* Title */}
      <motion.h2
        // Electric Lime Title Accent
        className="text-4xl md:text-5xl font-extrabold text-center text-lime-400 tracking-tight"
        initial={{ opacity: 0, y: 30 }}
        animate={step >= 1 ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
        transition={{ duration: 0.75 }}
      >
        My Busiest Day
      </motion.h2>

      {/* Date */}
      <motion.p
        className="mt-6 text-2xl md:text-4xl font-extrabold text-center tracking-wide text-gray-200"
        initial={{ opacity: 0 }}
        animate={step >= 2 ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 1 }}
      >
        {/* Uses existing color logic for highlight */}
        <span className={monthColorClass}>
          {formatted}
        </span>
      </motion.p>


      {/* Orders */}
      <motion.p
        // Secondary text color
        className="mt-4 text-lg md:text-2xl text-stone-300 font-medium text-center"
        initial={{ opacity: 0 }}
        animate={step >= 3 ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 1 }}
      >
        {/* Large count is highlighted with main accent color */}
        <span className="text-4xl font-extrabold text-lime-400">{orderCount}</span> orders
      </motion.p>

      {/* Typing line */}
      <motion.p
        // Tertiary text color (Gray)
        className="mt-4 text-lg md:text-2xl text-gray-400 italic text-center min-h-[2rem]"
        initial={{ opacity: 0 }}
        animate={localIsTyping ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.5 }}
      >
        {line3Full.slice(0, idx3)}
      </motion.p>
    </div>
  );
}