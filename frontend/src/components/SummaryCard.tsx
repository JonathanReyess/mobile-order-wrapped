import { useRef, useState, useEffect } from "react";
import { toPng, toBlob } from "html-to-image";
import download from "downloadjs";
// @ts-ignore
import confetti from "canvas-confetti";
import gsap from "gsap"; // <-- Add this line


function formatToMonthDay(dateStr: string) {
  const [year, month, day] = dateStr.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  if (isNaN(date.getTime())) return "Invalid date";

  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
  });
}

function formatToTimeOnly(dateStr: string) {
  const [datePart, timePart, meridiem] = dateStr.split(/\s+/);
  const [hourStr, minuteStr] = timePart.split(":");
  let hour = parseInt(hourStr, 10);
  const minute = parseInt(minuteStr, 10);

  if (meridiem === "PM" && hour !== 12) hour += 12;
  else if (meridiem === "AM" && hour === 12) hour = 0;

  const [year, month, day] = datePart.split("-").map(Number);
  const dateObj = new Date(year, month - 1, day, hour, minute);

  return dateObj.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

type Stats = {
  item_counts: { item: string; count: number }[];
  restaurant_counts: Record<string, number>;
  busiest_day: { date: string; order_count: number };
  busiest_day_orders: any[];
  most_expensive_order: { total: number; order_time: string; transaction_id: string };
  earliest_order: { order_time: string; total: number; transaction_id: string; items: { name: string }[] };
  latest_order: { order_time: string; total: number; transaction_id: string; items: { name: string }[] };
  earliest_order_by_time: { order_time: string; pickup_time: string; restaurant_name: string; total: string; transaction_id: string; items: { name: string }[] };
  latest_order_by_time: { order_time: string; pickup_time: string; restaurant_name: string; total: string; transaction_id: string; items: { name: string }[] };
  total_items_ordered: number;
  recipient_name?: string;
  unique_restaurants?: number;
  top_restaurant?: { name: string };
};

export default function SummaryCard({
  stats,
  semester = "Spring 2025",
  name,
}: {
  stats: Stats;
  semester?: string;
  name?: string;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [background, setBackground] = useState("bg-gradient-to-br from-[#001A57] to-[#01478c]");
  
  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;
  
    const handleMouseMove = (e: MouseEvent) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
  
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
  
      const rotateY = (x - centerX) / centerX * 15; // 10 is the maximum rotation angle (left/right)
      const rotateX = -(y - centerY) / centerY * 10; // 10 is the maximum rotation angle (up/down)
      
      gsap.to(card, {
        rotateX: rotateX,
        rotateY: rotateY,
        scale: 1.00,
        transformPerspective: 800,
        transformOrigin: "center",
        ease: "power2.out",
        duration: 0.4,
      });
    };
  
    const resetMouseMove = () => {
      gsap.to(card, {
        rotateX: 0,
        rotateY: 0,
        scale: 1,
        ease: "power2.out",
        duration: 0.6,
      });
    };
  
    card.addEventListener("mousemove", handleMouseMove);
    card.addEventListener("mouseleave", resetMouseMove);
  
    return () => {
      card.removeEventListener("mousemove", handleMouseMove);
      card.removeEventListener("mouseleave", resetMouseMove);
    };
  }, []);
  
  const handleDownload = async () => {
    if (!cardRef.current) return;
    const dataUrl = await toPng(cardRef.current);
    download(dataUrl, `mobile-order-wrapped-${semester.replace(" ", "-")}.png`);
    confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
  };

  const handleShare = async () => {
    if (!cardRef.current) return;
  
    try {
      const blob = await toBlob(cardRef.current);
      if (!blob) throw new Error("Could not generate image blob");
  
      const file = new File(
        [blob],
        `my-wrapped${semester.replace(" ", "-")}.png`,
        { type: "image/png" }
      );
  
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: `Mobile Order Wrapped for ${name || "User"} (${semester})`,
          text: `Check out my Mobile Order Wrapped! mobileorderwrapped.com`,
        });
      } else {
        // fallback
        const dataUrl = await toPng(cardRef.current);
        download(dataUrl, `mobile-order-wrapped-${semester.replace(" ", "-")}.png`);
        alert(
          "Sharing isn’t supported on this browser. The PNG has been downloaded instead."
        );
      }
    } catch (err: any) {
      if (err.name === "AbortError" || err.name === "NotAllowedError") {
        console.log("Share cancelled by user.");
      } else {
        console.error("Error sharing:", err);
        alert("Oops! Something went wrong while sharing.");
      }
    }
  };
  
  

  const topItems = [...stats.item_counts]
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const [topRestaurantName, topRestaurantCount] = Object.entries(stats.restaurant_counts)
    .sort((a, b) => b[1] - a[1])[0];

  const formattedBusiestDay = formatToMonthDay(stats.busiest_day.date);

  return (
<div className="min-h-[96vh] md:min-h-[116vh] flex flex-col items-center justify-center pt-10 pb-20 md:pt-21 space-y-5">

      <div
        ref={cardRef}
        className={`
          ${background}
          relative
          overflow-hidden
          rounded-3xl
          shadow-2xl
          w-[80vw] max-w-[350px]
          h-auto max-h-[90vh]
          p-4 md:p-6
          pt-4 pb-6 md:pt-1 pb-6
          space-y-2 md:space-y-6
          flex flex-col
          text-white
          transform scale-90 md:scale-95
        `}
      >
        {/* Big soft blob background */}
        <div className="absolute -top-24 -left-16 w-[200%] h-[200%] rounded-full bg-white/10 transform rotate-45" />

        {/* Header */}
        <div className="relative z-10">
          <h1 className="text-2xl md:text-2xl font-bold text-left">
            Mobile Order Wrapped
            {name && (
              <span className="block text-base md:text-lg font-normal mt-1">{name}</span>
            )}
          </h1>
          <p className="uppercase text-[10px] md:text-sm opacity-75 mt-1">{semester}</p>
        </div>

        {/* Stats */}
        <div className="relative z-10 space-y-4">
          {/* Top Items + Total Items */}
          <div className="flex justify-between items-start">
            <div>
              <p className="uppercase text-[10px] md:text-xs opacity-75">Top Items</p>
              {topItems.map((it, i) => (
                <p key={i} className="text-base md:text-lg font-semibold">
                  {i + 1}. {it.item} <span className="opacity-75">({it.count}×)</span>
                </p>
              ))}
            </div>
            <div className="text-center">
              <p className="uppercase text-[10px] md:text-xs opacity-75">Total Items</p>
              <p className="text-base md:text-lg font-semibold">{stats.total_items_ordered}</p>
            </div>
          </div>

          {/* Top Spot + Busiest Day */}
          <div className="flex justify-between">
            <div>
              <p className="uppercase text-[10px] md:text-xs opacity-75">Top Spot</p>
              <p className="text-base md:text-lg font-semibold">{topRestaurantName}</p>
              <p className="text-xs md:text-sm opacity-75">{topRestaurantCount} visits</p>
            </div>
            <div>
              <p className="uppercase text-[10px] md:text-xs opacity-75">Busiest Day</p>
              <p className="text-base md:text-lg font-semibold">{formattedBusiestDay}</p>
              <p className="text-xs md:text-sm opacity-75">{stats.busiest_day.order_count} orders</p>
            </div>
          </div>

          {/* Most Spent / Earliest / Latest */}
          <div className="flex flex-wrap justify-center items-center gap-7 w-full">
            {[
              { label: "Most Spent", value: `$${stats.most_expensive_order.total.toFixed(2)}` },
              { label: "Earliest", value: formatToTimeOnly(stats.earliest_order_by_time.order_time) },
              { label: "Latest", value: formatToTimeOnly(stats.latest_order_by_time.order_time) },
            ].map((item, index) => (
              <div key={index} className="flex flex-col text-center min-w-[60px]">
                <p className="uppercase text-[10px] md:text-xs opacity-75">{item.label}</p>
                <p className="text-base md:text-lg font-semibold">{item.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <p className="relative z-10 text-[10px] md:text-[13px] text-lime-300 opacity-80 uppercase">
          mobileorderwrapped.com
        </p>
      </div>
      <div className="flex flex-wrap justify-center gap-4 mb-6">
  {[
    { bg: "bg-gradient-to-br from-[#001A57] to-[#01478c]" },
    { bg: "bg-gradient-to-br from-indigo-900 to-[#acaecc]" },
    { bg: "bg-gradient-to-br from-[#4f6b60] to-[#95b189]"},
    { bg: "bg-gradient-to-br from-pink-600 to-rose-400" },
  ].map((color, index) => (
<button
  key={index}
  onClick={() => setBackground(color.bg)}
  className="w-8 h-8 md:w-8 md:h-8 flex items-center justify-center rounded-full bg-white shadow-md hover:opacity-80 transition"
>
  <div className={`w-5 h-5 md:w-5 md:h-5 rounded-full ${color.bg}`} />
</button>
  ))}
</div>





      {/* Download & Share buttons */}
      <div className="flex flex-wrap justify-center gap-3 md:gap-5">

        <button
          onClick={handleDownload}
          className="bg-white hover:bg-gray-100 text-gray-900 px-5 py-2.5 md:px-6 md:py-3
 rounded-full shadow-lg font-semibold transition"
        >
          Download
        </button>
        <button
          onClick={handleShare}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 md:px-6 md:py-3
 rounded-full shadow-lg font-semibold transition"
        >
          Share
        </button>
      </div>
    </div>
  );
}
