import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

// Convert "2025-04-05 11:34 PM" → "April 5 at 11:34 PM"
function formatToMonthDayTime(dateStr: string) {
  const [datePart, timePart, meridiem] = dateStr.split(" ");
  const [year, month, day] = datePart.split("-").map(Number);
  const [hourStr, minuteStr] = timePart.split(":");
  let hour = Number(hourStr);
  const minute = Number(minuteStr);

  if (meridiem === "PM" && hour !== 12) hour += 12;
  if (meridiem === "AM" && hour === 12) hour = 0;

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

export default function MostExpensiveOrderSlide({
  order,
  isPlaying,
}: {
  order?: {
    order_time?: string;
    total?: number;
    transaction_id?: string;
    filename?: string;
  };
  isPlaying: boolean;
}) {
  // If no valid most-expensive order, fallback
  if (!order || !order.order_time || typeof order.total !== "number") {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-gradient-to-br from-duke-slate to-duke-blue text-white px-4">
        <p className="text-2xl">⚠️ No “most expensive” order found.</p>
      </div>
    );
  }

  const formattedDateTime = formatToMonthDayTime(order.order_time);

  // Step control
  const [step, setStep] = useState(0);

  // For smarter pausing
  const stepStartTime = useRef<number | null>(null);
  const elapsedTime = useRef<number>(0);
  const timerRef = useRef<number | null>(null);

  const stepDelays = [250, 1750];  // 1s for title, 2s for paragraph

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
    <div className="h-screen w-full flex flex-col items-center justify-center bg-gradient-to-br from-duke-slate to-duke-blue text-white px-4">
      
      {/* Title */}
      <motion.h2
        className="text-4xl md:text-5xl font-extrabold text-center"
        initial={{ opacity: 0, y: 40 }}
        animate={step >= 1 ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
        transition={{ duration: 1 }}
      >
        My Most Expensive Order 💸
      </motion.h2>

      {/* Paragraph */}
      <motion.p
        className="mt-4 text-lg md:text-2xl text-center max-w-lg"
        initial={{ opacity: 0 }}
        animate={step >= 2 ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 1 }}
      >
        You spent <strong>${order.total.toFixed(2)}</strong> on{" "}
        <strong>{formattedDateTime}</strong>.{" "}
        {order.total > 15
          ? "Now that’s what we call a splurge!"
          : "You're a savvy spender — we respect the frugality!"}
      </motion.p>

    </div>
  );
}
