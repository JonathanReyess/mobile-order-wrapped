import { motion } from "framer-motion";

// Convert "2025-04-09 8:33 AM" → "April 9 at 8:33 AM"
function formatToMonthDayTime(dateStr: string) {
  // First split into date and time parts (including AM/PM)
  const [datePart, timePart, meridiem] = dateStr.split(/\s+/);
  
  // Split the time into hours and minutes
  const [hourStr, minuteStr] = timePart.split(":");
  
  let hour = parseInt(hourStr, 10);
  const minute = parseInt(minuteStr, 10);

  // Convert to 24-hour format if needed
  if (meridiem === "PM" && hour !== 12) {
    hour += 12;
  } else if (meridiem === "AM" && hour === 12) {
    hour = 0;
  }

  // Parse the date components
  const [year, month, day] = datePart.split("-").map(Number);

  // Create Date object
  const dateObj = new Date(year, month - 1, day, hour, minute);

  // Format the date and time
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
}: {
  order: {
    order_time: string;
    pickup_time: string;
    restaurant_name: string;
    total: string;
    transaction_id: string;
    items: { name: string }[];
  };
}) {
  const itemNames = order.items.map((i) => i.name).join(", ");
  const formattedDateTime = formatToMonthDayTime(order.order_time);

  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-gradient-to-bl from-duke-light via-amber-500 to-duke-blue text-white px-4">
      <motion.h2
        className="text-4xl md:text-5xl font-extrabold text-center"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
      >
        My Earliest Order
      </motion.h2>
      <motion.p
        className="mt-4 text-lg md:text-2xl text-center max-w-lg"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
      >
        On <strong>{formattedDateTime}</strong>, you ordered <strong>{itemNames}</strong> from{" "}
        <strong>{order.restaurant_name}</strong>.
      </motion.p>
    </div>
  );
}
