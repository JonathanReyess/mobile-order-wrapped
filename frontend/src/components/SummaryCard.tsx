import { useRef, useState, useEffect } from "react";
import { toPng, toBlob } from "html-to-image";
import download from "downloadjs";
// @ts-ignore
import confetti from "canvas-confetti";
import gsap from "gsap";

function formatToMonthDay(dateStr: string) {
  const [year, month, day] = dateStr.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  if (isNaN(date.getTime())) return "Invalid date";
  return date.toLocaleDateString("en-US", { month: "long", day: "numeric" });
}

function formatToTimeOnly(dateStr: string) {
  const [datePart, timePart, meridiem] = dateStr.split(/\s+/);
  const [hourStr, minuteStr] = timePart.split(":"),
    [year, month, day] = datePart.split("-").map(Number);
  let hour = parseInt(hourStr, 10);
  const minute = parseInt(minuteStr, 10);
  if (meridiem === "PM" && hour !== 12) hour += 12;
  else if (meridiem === "AM" && hour === 12) hour = 0;
  const dateObj = new Date(year, month - 1, day, hour, minute);
  return dateObj.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
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

export default function SummaryCard({ stats, semester = "Spring 2025", name }: { stats: Stats; semester?: string; name?: string }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [background, setBackground] = useState("bg-gradient-to-br from-[#001A57] to-[#01478c]");
  const [anonymize, setAnonymize] = useState(false);

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;
    const handleMouseMove = (e: MouseEvent) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      gsap.to(card, {
        rotateX: -((y - centerY) / centerY) * 10,
        rotateY: ((x - centerX) / centerX) * 15,
        scale: 1.0,
        transformPerspective: 1000,
        transformOrigin: "center",
        ease: "power2.out",
        duration: 0.4
      });
    };
    const resetMouseMove = () => {
      gsap.to(card, { rotateX: 0, rotateY: 0, scale: 1, ease: "power2.out", duration: 0.6 });
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
      const file = new File([blob], `my-wrapped${semester.replace(" ", "-")}.png`, { type: "image/png" });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: `Mobile Order Wrapped for ${name || "User"} (${semester})`, text: `Check out my Mobile Order Wrapped! mobileorderwrapped.com` });
      } else {
        const dataUrl = await toPng(cardRef.current);
        download(dataUrl, `mobile-order-wrapped-${semester.replace(" ", "-")}.png`);
        alert("Sharing isn’t supported on this browser. The PNG has been downloaded instead.");
      }
    } catch (err: any) {
      if (err.name !== "AbortError" && err.name !== "NotAllowedError") {
        console.error("Error sharing:", err);
        alert("Oops! Something went wrong while sharing.");
      }
    }
  };

  const topItems = [...stats.item_counts].sort((a, b) => b.count - a.count).slice(0, 5);
  const longestItemLength = Math.max(...topItems.map(it => it.item.length));
  const isLong = longestItemLength > 20;
  const topItemFontSize = isLong ? "0.9rem" : "clamp(0.75rem,2.5vw,1rem)";
  
  const [topRestaurantName, topRestaurantCount] = Object.entries(stats.restaurant_counts).sort((a, b) => b[1] - a[1])[0];
  const formattedBusiestDay = formatToMonthDay(stats.busiest_day.date);

  return (
    <div className="min-h-[96vh] md:min-h-[116vh] flex flex-col items-center justify-center pt-10 pb-20 md:pt-21 space-y-5">
      <div ref={cardRef} className={`${background} relative overflow-hidden rounded-3xl shadow-2xl w-[80vw] max-w-[350px] h-auto max-h-[90vh] p-4 md:p-6 space-y-2 flex flex-col text-white transform scale-90 md:scale-95`}>
        <div className="absolute -top-24 -left-16 w-[200%] h-[200%] rounded-full bg-white/10 transform rotate-45" />
        <div className="relative z-10">
          <h1 className="text-2xl md:text-2xl font-bold text-left">
            Mobile Order Wrapped
            {name && !anonymize && (
  <span className="block text-base md:text-lg font-normal mt-1 truncate">{name}</span>
)}
            </h1>
          <p className="uppercase text-[10px] md:text-sm opacity-75 mt-1">{semester}</p>
        </div>
        <div className="relative z-10 space-y-4">
        <div className="flex justify-between items-start">
  <div>
    <p className="uppercase text-[10px] md:text-xs opacity-75">Top Items</p>
    {topItems.map((it, i) => (
      <p
        key={i}
        className="font-semibold max-w-[14rem] leading-tight whitespace-nowrap overflow-hidden text-ellipsis"
        style={{ fontSize: topItemFontSize }}
        title={`${i + 1}. ${it.item} (${it.count}×)`}
      >
        {i + 1}. {it.item} <span className="opacity-75">({it.count}×)</span>
      </p>
    ))}
  </div>
  <div className="text-center">
    <p className="uppercase text-[10px] md:text-xs opacity-75">Total Items</p>
    <p className="text-base md:text-lg font-semibold">{stats.total_items_ordered}</p>
  </div>
</div>

          <div className="flex justify-between">
            <div>
              <p className="uppercase text-[10px] md:text-xs opacity-75">Top Spot</p>
              <p className="text-[clamp(0.75rem,2.5vw,1rem)] font-semibold truncate max-w-[14rem]" title={topRestaurantName}>{topRestaurantName}</p>
              <p className="text-xs md:text-sm opacity-75">{topRestaurantCount} visits</p>
            </div>
            <div>
              <p className="uppercase text-[10px] md:text-xs opacity-75">Busiest Day</p>
              <p className="text-base md:text-lg font-semibold">{formattedBusiestDay}</p>
              <p className="text-xs md:text-sm opacity-75">{stats.busiest_day.order_count} orders</p>
            </div>
          </div>
          <div className="flex flex-wrap justify-center items-center gap-7 w-full">
            {[{ label: "Most Spent", value: `$${stats.most_expensive_order.total.toFixed(2)}` }, { label: "Earliest", value: formatToTimeOnly(stats.earliest_order_by_time.order_time) }, { label: "Latest", value: formatToTimeOnly(stats.latest_order_by_time.order_time) }].map((item, index) => (
              <div key={index} className="flex flex-col text-center min-w-[60px]">
                <p className="uppercase text-[10px] md:text-xs opacity-75">{item.label}</p>
                <p className="text-base md:text-lg font-semibold">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
        <p className="relative z-10 text-[10px] md:text-[13px] text-lime-300 opacity-80 uppercase">mobileorderwrapped.com</p>
      </div>
      <div className="flex flex-wrap justify-center gap-4 mb-6">
        {["bg-gradient-to-br from-[#001A57] to-[#01478c]", "bg-gradient-to-br from-indigo-900 to-[#acaecc]", "bg-gradient-to-br from-[#4f6b60] to-[#95b189]", "bg-gradient-to-br from-pink-600 to-rose-400"].map((bg, index) => (
          <button key={index} onClick={() => setBackground(bg)} className="w-8 h-8 flex items-center justify-center rounded-full bg-white shadow-md hover:opacity-80 transition">
            <div className={`w-5 h-5 rounded-full ${bg}`} />
          </button>
        ))}
      </div>
      <div className="flex items-center gap-3 mb-4">
      <span className="text-[#1C274C] text-sm md:text-base font-bold flex items-center gap-2">
      <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-5 h-5"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M4.6138 8.54479L4.1875 10.25H2C1.58579 10.25 1.25 10.5858 1.25 11C1.25 11.4142 1.58579 11.75 2 11.75H22C22.4142 11.75 22.75 11.4142 22.75 11C22.75 10.5858 22.4142 10.25 22 10.25H19.8125L19.3862 8.54479C18.8405 6.36211 18.5677 5.27077 17.7539 4.63538C16.9401 4 15.8152 4 13.5653 4H10.4347C8.1848 4 7.05988 4 6.24609 4.63538C5.43231 5.27077 5.15947 6.36211 4.6138 8.54479ZM6.5 21C8.12316 21 9.48826 19.8951 9.88417 18.3963L10.9938 17.8415C11.6272 17.5248 12.3728 17.5248 13.0062 17.8415L14.1158 18.3963C14.5117 19.8951 15.8768 21 17.5 21C19.433 21 21 19.433 21 17.5C21 15.567 19.433 14 17.5 14C15.8399 14 14.4498 15.1558 14.0903 16.7065L13.6771 16.4999C12.6213 15.972 11.3787 15.972 10.3229 16.4999L9.90967 16.7065C9.55023 15.1558 8.16009 14 6.5 14C4.567 14 3 15.567 3 17.5C3 19.433 4.567 21 6.5 21Z"
        fill="#1C274C"
      />
    </svg>
    Anonymize
  </span>
  <button
    onClick={() => setAnonymize(prev => !prev)}
    className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors duration-300 ${
      anonymize ? "bg-blue-600" : "bg-gray-300"
    }`}
  >
    <div
      className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${
        anonymize ? "translate-x-6" : "translate-x-0"
      }`}
    />
  </button>
</div>

      <div className="flex flex-wrap justify-center gap-3 md:gap-5">
        <button onClick={handleDownload} className="bg-white hover:bg-gray-100 text-gray-900 px-5 py-2.5 md:px-6 md:py-3 rounded-full shadow-lg font-semibold transition">Download</button>
        <button onClick={handleShare} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 md:px-6 md:py-3 rounded-full shadow-lg font-semibold transition">Share</button>
      </div>
    </div>
  );
}
