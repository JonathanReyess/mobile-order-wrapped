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
    items?: { name: string }[];
  };
  isPlaying: boolean;
}) {
  if (!order || !order.order_time || typeof order.total !== "number") {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-gradient-to-br from-duke-slate to-duke-blue text-white px-4">
        <p className="text-2xl">⚠️ No “most expensive” order found.</p>
      </div>
    );
  }

  const formattedDateTime = formatToMonthDayTime(order.order_time);

  const firstPart = `You spent $${order.total.toFixed(2)} on ${formattedDateTime}. `;
  const secondPart = order.total > 15
    ? "Now that’s what we call a splurge!"
    : "You're a savvy spender — we respect the frugality!";
  

  const whatDidYouOrderTitle = "What did you order?";
  const orderedItems = order.items?.map((item) => item.name) || [];

  const [step, setStep] = useState<number>(1);
  const [idx1, setIdx1] = useState(0);
  const [idx2, setIdx2] = useState(0);
  const [idx3, setIdx3] = useState(0);
  const [idx4, setIdx4] = useState(0);


  const typingIntervalRef = useRef<number | null>(null);
  const timeoutRef = useRef<number | null>(null);

// After Title Shows → Wait before Typing Main Paragraph
useEffect(() => {
  if (step !== 1 || !isPlaying) return;

  // Wait for 1 second before starting paragraph typing
  timeoutRef.current = window.setTimeout(() => {
    setStep(2);
  }, 1250);

  return () => {
    clearTimeout(timeoutRef.current!);
  };
}, [step, isPlaying]);

// Typing firstPart
useEffect(() => {
  if (step !== 2 || !isPlaying) return;

  typingIntervalRef.current = window.setInterval(() => {
    setIdx1((prev) => {
      if (prev < firstPart.length) {
        return prev + 1;
      } else {
        clearInterval(typingIntervalRef.current!);

        // After finishing firstPart → small pause → start secondPart
        timeoutRef.current = window.setTimeout(() => {
          setStep(2.5); // Move to second part typing
        }, 800); // 500ms pause
        return prev;
      }
    });
  }, 50);

  return () => {
    clearInterval(typingIntervalRef.current!);
    clearTimeout(timeoutRef.current!);
  };
}, [step, isPlaying, firstPart.length]);

// Typing secondPart
useEffect(() => {
  if (step !== 2.5 || !isPlaying) return;

  typingIntervalRef.current = window.setInterval(() => {
    setIdx2((prev) => {
      if (prev < secondPart.length) {
        return prev + 1;
      } else {
        clearInterval(typingIntervalRef.current!);
        timeoutRef.current = window.setTimeout(() => {
          setStep(3); // move on to "What did you order?" title
        }, 2500);
        return prev;
      }
    });
  }, 50);

  return () => {
    clearInterval(typingIntervalRef.current!);
    clearTimeout(timeoutRef.current!);
  };
}, [step, isPlaying, secondPart.length]);

// Typing "What did you order?" title
useEffect(() => {
  if (step !== 3 || !isPlaying) return;

  typingIntervalRef.current = window.setInterval(() => {
    setIdx4((prev) => {
      if (prev < whatDidYouOrderTitle.length) {
        return prev + 1;
      } else {
        clearInterval(typingIntervalRef.current!);
        timeoutRef.current = window.setTimeout(() => setStep(4), 1000);
        return prev;
      }
    });
  }, 60);

  return () => {
    clearInterval(typingIntervalRef.current!);
    clearTimeout(timeoutRef.current!);
  };
}, [step, isPlaying, whatDidYouOrderTitle.length]);


// Typing Ordered Items
useEffect(() => {
  if (step !== 4 || !isPlaying) return;

  typingIntervalRef.current = window.setInterval(() => {
    setIdx3((prev) => {
      if (prev < orderedItems.length) {
        return prev + 1;
      } else {
        clearInterval(typingIntervalRef.current!);
        timeoutRef.current = window.setTimeout(() => setStep(5), 1000);
        return prev;
      }
    });
  }, 1250);

  return () => {
    clearInterval(typingIntervalRef.current!);
    clearTimeout(timeoutRef.current!);
  };
}, [step, isPlaying, orderedItems.length]);

  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-gradient-to-br from-duke-slate to-duke-blue text-white px-4">
      
      {/* Title */}
{/* Title */}
<motion.h2
  initial={{ opacity: 0, y: 40 }}
  animate={step >= 1 ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
  transition={{ duration: 1 }}
  className="text-4xl md:text-5xl font-extrabold text-center mb-4"
>
  My Most Expensive Order 💸
</motion.h2>

{/* Typing Main Paragraph */}
{step >= 2 && (
  <motion.p
    className="text-lg md:text-2xl text-center max-w-xl"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 1 }}
  >
    {firstPart.slice(0, idx1)}
    {step >= 2.5 && secondPart.slice(0, idx2)}
  </motion.p>
)}


{/* Typing "What did you order?" */}
{step >= 3 && (
  <motion.p
    className="mt-4 text-2xl md:text-4xl font-bold text-center"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 1 }}
  >
    {whatDidYouOrderTitle.slice(0, idx4)}
  </motion.p>
)}


{/* Typing Ordered Items */}
{step >= 4 && (
  <motion.ul
    className="mt-2 list-disc list-inside text-lg md:text-xl text-center max-w-md"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 1 }}
  >
    {orderedItems.slice(0, idx3).map((item, index) => (
      <li key={index}>{item}</li>
    ))}
  </motion.ul>
)}

    </div>
  );
}
