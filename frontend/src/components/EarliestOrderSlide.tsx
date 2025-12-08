import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

// Convert "2025-04-09 8:33 AM" → "April 9 at 8:33 AM"
function formatToMonthDayTime(dateStr: string) {
  const [datePart, timePart, meridiem] = dateStr.split(/\s+/);
  const [hourStr, minuteStr] = timePart.split(":");
  
  let hour = parseInt(hourStr, 10);
  const minute = parseInt(minuteStr, 10);

  if (meridiem === "PM" && hour !== 12) {
    hour += 12;
  } else if (meridiem === "AM" && hour === 12) {
    hour = 0;
  }

  const [year, month, day] = datePart.split("-").map(Number);
  const dateObj = new Date(year, month - 1, day, hour, minute);

  const monthDay = dateObj.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
  });

  const time = dateObj.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });

  return `${monthDay} at ${time}`;
}

export default function EarliestOrderSlide({
  order,
  isPlaying,
}: {
  order: {
    order_time: string;
    pickup_time: string;
    restaurant_name: string;
    total: string;
    transaction_id: string;
    items: { name: string }[];
  };
  isPlaying: boolean;
}) {
  const itemNames = order.items.map((i) => i.name).join(", ");
  const formattedDateTime = formatToMonthDayTime(order.order_time);

  // Step control
  const [step, setStep] = useState(0);

  // For smarter pausing
  const stepStartTime = useRef<number | null>(null);
  const elapsedTime = useRef<number>(0);
  const timerRef = useRef<number | null>(null);

  // Define delays for each stage
  const stepDelays = [250, 1750]; // 1s for title, 2s for paragraph

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
    <div className="h-screen w-full flex flex-col items-center justify-center bg-gradient-to-bl from-duke-light via-amber-500 to-duke-blue text-white px-4">
      
      {/* Title */}
      <motion.h2
  className="text-3xl md:text-5xl font-arc uppercase leading-none drop-shadow-xl"
  initial={{ opacity: 0, y: 40 }}
  animate={step >= 1 ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
  transition={{ duration: 1 }}
>
  Earliest Order ☀️ 
</motion.h2>




      {/* Paragraph */}
      <motion.p
        className="mt-4 text-lg md:text-2xl text-center max-w-lg"
        initial={{ opacity: 0 }}
        animate={step >= 2 ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 1 }}
      >
        On <strong>{formattedDateTime}</strong>, you ordered <strong>{itemNames}</strong> from{" "}
        <strong>{order.restaurant_name}</strong>.
      </motion.p>
    </div>
  );
}
