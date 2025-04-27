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
  className="text-4xl md:text-5xl font-extrabold text-center flex items-center justify-center gap-3"
  initial={{ opacity: 0, y: 40 }}
  animate={step >= 1 ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
  transition={{ duration: 1 }}
>
  <span>My Earliest Order</span>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="currentColor"
    viewBox="0 0 457.32 457.32"
    className="w-10 h-10"
  >
    <g>
      <path d="M228.66,112.692c-63.945,0-115.968,52.022-115.968,115.967c0,63.945,52.023,115.968,115.968,115.968 
        s115.968-52.023,115.968-115.968C344.628,164.715,292.605,112.692,228.66,112.692z"/>
      <path d="M401.429,228.66l42.467-57.07c2.903-3.9,3.734-8.966,2.232-13.59c-1.503-4.624-5.153-8.233-9.794-9.683 
        l-67.901-21.209l0.811-71.132c0.056-4.862-2.249-9.449-6.182-12.307c-3.934-2.858-9.009-3.633-13.615-2.077l-67.399,22.753 
        L240.895,6.322C238.082,2.356,233.522,0,228.66,0c-4.862,0-9.422,2.356-12.235,6.322l-41.154,58.024l-67.4-22.753 
        c-4.607-1.555-9.682-0.781-13.615,2.077c-3.933,2.858-6.238,7.445-6.182,12.307l0.812,71.132l-67.901,21.209 
        c-4.641,1.45-8.291,5.059-9.793,9.683c-1.503,4.624-0.671,9.689,2.232,13.59l42.467,57.07l-42.467,57.07 
        c-2.903,3.9-3.734,8.966-2.232,13.59c1.502,4.624,5.153,8.233,9.793,9.683l67.901,21.208l-0.812,71.132 
        c-0.056,4.862,2.249,9.449,6.182,12.307c3.934,2.857,9.007,3.632,13.615,2.077l67.4-22.753l41.154,58.024 
        c2.813,3.966,7.373,6.322,12.235,6.322c4.862,0,9.422-2.356,12.235-6.322l41.154-58.024l67.399,22.753 
        c4.606,1.555,9.681,0.781,13.615-2.077c3.933-2.858,6.238-7.445,6.182-12.306l-0.811-71.133l67.901-21.208 
        c4.641-1.45,8.291-5.059,9.794-9.683c1.502-4.624,0.671-9.689-2.232-13.59L401.429,228.66z M228.66,374.627 
        c-80.487,0-145.968-65.481-145.968-145.968S148.173,82.692,228.66,82.692s145.968,65.48,145.968,145.967 
        S309.147,374.627,228.66,374.627z"/>
    </g>
  </svg>
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
