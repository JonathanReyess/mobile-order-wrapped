import { motion } from "framer-motion";

// Convert "2025-04-05 11:34 PM" → "April 5 at 11:34 PM"
function formatToMonthDayTime(dateStr: string) {
  // split on spaces so you get exactly [ "2025-04-05", "11:34", "PM" ]
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
}: {
  order?: {
    order_time?: string;
    total?: number;
    transaction_id?: string;
    filename?: string;
  };
}) {
  // If there's no valid most-expensive order, show a fallback
  if (!order || !order.order_time || typeof order.total !== "number") {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-gradient-to-br from-duke-slate to-duke-blue text-white px-4">
        <p className="text-2xl">⚠️ No “most expensive” order found.</p>
      </div>
    );
  }

  const formattedDateTime = formatToMonthDayTime(order.order_time);

  return (
  <div className="h-screen w-full flex flex-col items-center justify-center bg-gradient-to-br from-duke-slate to-duke-blue text-white px-4">
    <motion.h2
      className="text-4xl md:text-5xl font-extrabold text-center"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1 }}
    >
      My Most Expensive Order 💸
    </motion.h2>

    <motion.p
      className="mt-4 text-lg md:text-2xl text-center max-w-lg"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 2 }}
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
