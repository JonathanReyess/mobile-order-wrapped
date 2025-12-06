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
      // NEW: Green Gradient for "no data" fallback
      <div className="h-screen w-full flex items-center justify-center bg-gradient-to-br from-black to-green-950 via-gray-950 text-white px-4">
        <p className="text-2xl text-gray-400">⚠️ No “most expensive” order found.</p>
      </div>
    );
  }

  const formattedDateTime = formatToMonthDayTime(order.order_time);
  // Highlight the dynamic data points (Total, Date/Time) with spans
  // NEW: Green-400 for total display
  const totalDisplay = `<span class="text-green-400 font-extrabold">$${order.total.toFixed(2)}</span>`;
  const dateDisplay = `<span class="text-gray-300 font-bold">${formattedDateTime}</span>`;

  // Use backticks and template literals to safely inject the formatted spans
  const firstPart = `You spent ${totalDisplay} on ${dateDisplay}. `;
  
  const secondPart = order.total > 15
    ? "Now that’s what we call a splurge!"
    : "You're a savvy spender — we respect the frugality!";
  
  const whatDidYouOrderTitle = "What did you order?";
  const orderedItems = order.items?.map((item) => item.name) || [];

  // Step control
  const [step, setStep] = useState(0);
  const [idx1, setIdx1] = useState(0);
  const [idx2, setIdx2] = useState(0);
  const [idx3, setIdx3] = useState(0);
  const [idx4, setIdx4] = useState(0);

  const stepStartTime = useRef<number | null>(null);
  const elapsedTime = useRef<number>(0);
  const timerRef = useRef<number | null>(null);
  const itemStartTime = useRef<number | null>(null);
  const itemElapsedTime = useRef<number>(0);
  const itemTimerRef = useRef<number | null>(null);


  // Step Delays (manual calculations: base delay + typing time + pauses)
  const stepDelays = [
    1250, // After title
    firstPart.length * 50 + 800, // Typing first line + pause
    secondPart.length * 50 + 2500, // Typing second line + pause
    whatDidYouOrderTitle.length * 60 + 1000, // Typing title + pause
    orderedItems.length * 1250 + 1000, // Typing items slowly + pause
  ];

  useEffect(() => {
    function startTimerForStep() {
      if (step >= stepDelays.length) return; // No more steps
      stepStartTime.current = Date.now();

      const remainingTime = stepDelays[step] - elapsedTime.current;

      timerRef.current = window.setTimeout(() => {
        setStep((prev) => prev + 1);
        elapsedTime.current = 0; // Reset elapsed once step completes
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

  // Typing Effects
  useEffect(() => {
    if (step !== 1 || !isPlaying) return;
    const interval = window.setInterval(() => {
      setIdx1((prev) => {
        if (prev < firstPart.length) return prev + 1;
        clearInterval(interval);
        return prev;
      });
    }, 50);
    return () => clearInterval(interval);
  }, [step, isPlaying, firstPart.length]);

  useEffect(() => {
    if (step !== 2 || !isPlaying) return;
    const interval = window.setInterval(() => {
      setIdx2((prev) => {
        if (prev < secondPart.length) return prev + 1;
        clearInterval(interval);
        return prev;
      });
    }, 50);
    return () => clearInterval(interval);
  }, [step, isPlaying, secondPart.length]);

  useEffect(() => {
    if (step !== 3 || !isPlaying) return;
    const interval = window.setInterval(() => {
      setIdx4((prev) => {
        if (prev < whatDidYouOrderTitle.length) return prev + 1;
        clearInterval(interval);
        return prev;
      });
    }, 60);
    return () => clearInterval(interval);
  }, [step, isPlaying, whatDidYouOrderTitle.length]);

  useEffect(() => {
    if (step !== 4) return;
  
    function startItemTimer() {
      if (idx3 >= orderedItems.length) return; // Done
      itemStartTime.current = Date.now();
  
      const remainingTime = 1250 - itemElapsedTime.current;
  
      itemTimerRef.current = window.setTimeout(() => {
        setIdx3((prev) => prev + 1);
        itemElapsedTime.current = 0;
      }, remainingTime);
    }
  
    if (isPlaying) {
      startItemTimer();
    } else {
      if (itemStartTime.current !== null) {
        itemElapsedTime.current += Date.now() - itemStartTime.current;
        clearTimeout(itemTimerRef.current!);
      }
    }
  
    return () => clearTimeout(itemTimerRef.current!);
  }, [isPlaying, idx3, step, orderedItems.length]);
  
  // Helper function to render text with HTML/Tailwind classes
  const renderTextWithHtml = (text: string, length: number) => {
    // Only return the part of the text that has been "typed"
    const slicedText = text.slice(0, length);
    // Use dangerouslySetInnerHTML to render the HTML structure for color spans
    return <span dangerouslySetInnerHTML={{ __html: slicedText }} />;
  };
  

  return (
    // NEW: Background Gradient (Deep Green/Emerald)
    <div className="h-screen w-full flex flex-col items-center justify-center bg-gradient-to-br from-gray-950 via-green-950 to-black text-gray-100 px-4">

      {/* Title */}
      <motion.h2
        // NEW: Green-500 Title
        className="text-4xl md:text-5xl font-extrabold text-center mb-6 text-white tracking-wide" 
        initial={{ opacity: 0, y: 40 }}
        animate={step >= 0 ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
        transition={{ duration: 1 }}
      >
        My Most Expensive Order 💸
      </motion.h2>

      {/* Typing Main Paragraph */}
      {step >= 1 && (
        <motion.p
          className="text-xl md:text-3xl text-center max-w-xl text-gray-200 leading-snug"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          {/* Render first part with embedded spans for total and date */}
          {renderTextWithHtml(firstPart, idx1)}
          {/* Render second part (plain text) */}
          {step >= 2 && secondPart.slice(0, idx2)}
        </motion.p>
      )}

      {/* Typing "What did you order?" */}
      {step >= 3 && (
        <motion.p
          className="mt-8 text-3xl md:text-5xl font-extrabold text-center text-gray-300 tracking-wider" // Silver/Gray Accent Title
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
          className="mt-4 list-disc list-inside text-xl md:text-2xl text-center max-w-md text-gray-400"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          {orderedItems.slice(0, idx3).map((item, index) => (
            <motion.li 
              key={index} 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              // NEW: Green-300 for item list highlight
              className="text-green-300 font-medium" 
            >
              {item}
            </motion.li>
          ))}
        </motion.ul>
      )}

    </div>
  );
}