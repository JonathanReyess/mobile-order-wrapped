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
}: {
  orders: Receipt[];
}) {
  // Split orders into columns of max 5 each
  const columns: Receipt[][] = [];
  for (let i = 0; i < orders.length; i += 5) {
    columns.push(orders.slice(i, i + 5));
  }

  // jagged torn‐edge on top and bottom
  const tornEdge = `polygon(
    0% 2%, 5% 0%, 10% 3%, 15% 0%, 20% 2%, 25% 0%, 30% 3%, 35% 0%, 40% 2%,
    45% 0%, 50% 3%, 55% 0%, 60% 2%, 65% 0%, 70% 3%, 75% 0%, 80% 2%, 85% 0%,
    90% 3%, 95% 0%, 100% 2%,
    100% 98%, 95% 100%, 90% 97%, 85% 100%, 80% 98%, 75% 100%, 70% 97%,
    65% 100%, 60% 98%, 55% 100%, 50% 97%, 45% 100%, 40% 98%, 35% 100%,
    30% 97%, 25% 100%, 20% 98%, 15% 100%, 10% 97%, 5% 100%, 0% 98%
  )`;

  return (
    <div className="h-screen w-full flex flex-col items-center justify-start bg-gradient-to-br from-sky-100 via-sky-600 to-sky-800 pt-12 pb-6 px-6 overflow-auto">

      <div
        className={`mt-5 flex gap-6 ${
          columns.length > 1 ? "justify-around" : "justify-center"
        }`}
      >
        {columns.map((col, colIdx) => (
          <div key={colIdx} className="flex flex-col justify-center items-center space-y-4">
            {col.map((receipt, idx) => (
              <motion.div
                key={`${colIdx}-${idx}`}
                className="w-64 h-28 max-w-xs mx-auto bg-white p-2 font-mono text-sm tracking-wide shadow-inner relative overflow-hidden"
                style={{
                  backgroundImage: "url('/crumple.png')",
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  clipPath: tornEdge,
                  boxShadow: "inset 0 0 10px rgba(0,0,0,0.2)",
                }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 * (colIdx * 5 + idx), duration: 0.4 }}
              >
                <p className="text-lg font-semibold text-gray-700 text-center">
                  {receipt.restaurant_name || "Unknown Restaurant"}
                </p>
                <p className="text-xs text-gray-600 text-center">
                  Ordered at:{" "}
                  {receipt.order_time
                    ? formatOrderTime(receipt.order_time)
                    : "--"}
                </p>
                <ul className="mt-1 list-disc list-inside text-gray-700">
                  {receipt.items?.map((item, i) => (
                    <li key={i} className="leading-snug">
                      {item.name}
                      {item.qty ? ` x${item.qty}` : ""}
                    </li>
                  ))}
                </ul>
                {typeof receipt.total === "number" && (
                  <p className="mt-1 text-sm font-bold text-gray-800 text-center">
                    Total: ${receipt.total.toFixed(2)}
                  </p>
                )}
              </motion.div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
