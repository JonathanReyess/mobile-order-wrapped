import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

interface ReceiptItem {
  name: string;
  qty?: number;
}

interface Receipt {
  restaurant_name?: string;
  order_time?: string;
  pickup_time?: string;
  transaction_id?: string;
  items?: ReceiptItem[];
  total?: number;
}

// Convert "YYYY-MM-DD h:mm AM/PM" → localized "h:mm AM/PM"
function formatOrderTime(ts: string): string {
  const parts = ts.split(" ");
  if (parts.length < 3) return ts;
  const timePart = parts[1];
  const ampm = parts[2];
  const [hourStr, minuteStr] = timePart.split(":");
  let hour = parseInt(hourStr, 10);
  const minute = parseInt(minuteStr, 10);
  if (ampm === "PM" && hour < 12) hour += 12;
  if (ampm === "AM" && hour === 12) hour = 0;
  const d = new Date();
  d.setHours(hour, minute);
  return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

export default function OrdersOfBusiestDaySlide({
  orders,
  isPlaying,
}: {
  orders: Receipt[];
  isPlaying: boolean;
}) {
  // jagged torn-edge on top and bottom - RETAINED
  const tornEdge = `polygon(
    0% 2%, 5% 0%, 10% 3%, 15% 0%, 20% 2%, 25% 0%, 30% 3%, 35% 0%, 40% 2%,
    45% 0%, 50% 3%, 55% 0%, 60% 2%, 65% 0%, 70% 3%, 75% 0%, 80% 2%, 85% 0%,
    90% 3%, 95% 0%, 100% 2%,
    100% 98%, 95% 100%, 90% 97%, 85% 100%, 80% 98%, 75% 100%, 70% 97%,
    65% 100%, 60% 98%, 55% 100%, 50% 97%, 45% 100%, 40% 98%, 35% 100%,
    30% 97%, 25% 100%, 20% 98%, 15% 100%, 10% 97%, 5% 100%, 0% 98%
  )`;

  const [step, setStep] = useState(0);

  const stepStartTime = useRef<number | null>(null);
  const elapsedTime = useRef<number>(0);
  const timerRef = useRef<number | null>(null);

  const totalReceipts = orders.length;
  const stepDelays = Array(totalReceipts).fill(1000); // 1s between receipts

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
    // NEW: Background Gradient (Vibrant Dark Purple/Magenta)
    <div className="h-screen w-full flex flex-col items-center justify-start bg-gradient-to-br from-fuchsia-950 via-gray-900 to-purple-900 pt-16 pb-24 px-4 overflow-auto">
      {/* New Title matching dark theme */}
      <h2 className="text-5xl font-extrabold text-pink-400 mb-6 tracking-wide">
        Orders Logged
      </h2>
      <div className="flex flex-wrap justify-center gap-4 w-full max-w-6xl">
        {orders.map((receipt, idx) => (
          <motion.div
            key={idx}
            // RETAINED: Receipt Card Styling (White background, torn edge, mono font)
            className="w-[40vw] max-w-xs min-w-[200px] h-[18vh] bg-white p-2 font-mono text-sm tracking-wide relative overflow-hidden bg-[url('/crumple.png')] bg-cover bg-center"
            style={{
              clipPath: tornEdge, // RETAINED: Jagged edge
              boxShadow: "0 10px 15px rgba(0,0,0,0.5)", // Dark shadow for depth
            }}
            initial={{ opacity: 0, y: 10 }}
            animate={step > idx ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
            transition={{ duration: 0.5 }}
          >
            {/* RETAINED TEXT STYLES */}
            <p className="text-lg font-semibold text-gray-700 text-center break-words">
              {receipt.restaurant_name || "Unknown Restaurant"}
            </p>
            <p className="text-xs text-gray-600 text-center break-words">
              Ordered at: {receipt.order_time ? formatOrderTime(receipt.order_time) : "--"}
            </p>
            <ul className="mt-1 list-disc list-inside text-gray-700 break-words overflow-y-auto max-h-[6vh] pr-1">
              {receipt.items?.map((item, i) => (
                <li
                  key={i}
                  className="leading-snug break-words text-ellipsis overflow-hidden"
                >
                  {item.name}
                  {item.qty ? ` x${item.qty}` : ""}
                </li>
              ))}
            </ul>
            {typeof receipt.total === "number" && (
              <p className="mt-1 text-sm font-bold text-gray-800 text-center break-words border-t border-dashed border-gray-400 pt-1">
                Total: ${receipt.total.toFixed(2)}
              </p>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}