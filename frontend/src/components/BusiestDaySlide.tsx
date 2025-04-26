// BusiestDaySlide.tsx
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

// Format "2025-02-12" → "February 12"
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
}: {
  date: string;
  orderCount: number;
}) {
  const formattedDate = formatToMonthDay(date);

  // the line to type out
  const line3Full = `Let's see what you got...`;
  const [idx3, setIdx3] = useState(0);

  useEffect(() => {
    const startDelay = 5000;   // wait 4.5s
    const typeSpeed  = 50;     // 50ms per char

    let ivId: number;
    const toId = window.setTimeout(() => {
      let i = 0;
      ivId = window.setInterval(() => {
        i++;
        setIdx3(i);
        if (i >= line3Full.length) {
          window.clearInterval(ivId);
        }
      }, typeSpeed);
    }, startDelay);

    return () => {
      window.clearTimeout(toId);
      window.clearInterval(ivId);
    };
  }, [line3Full]);

  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-gradient-to-r from-duke-blue via-duke-royal to-duke-light text-white px-4">
      <motion.h2
        className="text-4xl md:text-5xl font-extrabold text-center"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
      >
        My Busiest Day
      </motion.h2>

      <motion.p
        className="mt-6 text-2xl md:text-4xl font-bold text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
      >
        {formattedDate}
      </motion.p>

      <motion.p
        className="mt-4 text-lg md:text-2xl text-blue-100 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 3.5 }}
      >
        {orderCount} orders
      </motion.p>

      {/* typing line */}
      <motion.p
        className="mt-4 text-lg md:text-2xl text-blue-100 text-center min-h-[2rem]"
        initial={{ opacity: 0 }}
        animate={{ opacity: idx3 > 0 ? 1 : 0 }}
        transition={{ duration: 0.5 }}
      >
        {line3Full.slice(0, idx3)}
      </motion.p>
    </div>
  );
}
