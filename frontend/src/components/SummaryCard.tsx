import { useRef } from "react";
import { toPng, toBlob } from "html-to-image";
import download from "downloadjs";
// @ts-ignore
import confetti from "canvas-confetti";


// Format "2025-02-12" → "February 12"
function formatToMonthDay(dateStr: string) {
  const [year, month, day] = dateStr.split("-").map(Number);
  const date = new Date(year, month - 1, day);

  if (isNaN(date.getTime())) {
    return "Invalid date";
  }

  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
  });
}


type Stats = {
  item_counts: { item: string; count: number }[];
  restaurant_counts: Record<string, number>;
  busiest_day: { date: string; order_count: number };
  most_expensive_order: { total: number; order_time: string; transaction_id: string };
  earliest_order: { order_time: string; total: number; transaction_id: string; items: { name: string }[] };  // 🆕
  latest_order: { order_time: string; total: number; transaction_id: string; items: { name: string }[] };    // 🆕
};


// Duke Blue Gradient
const GRADIENT = "bg-gradient-to-br from-[#001A57] to-[#003366]";

export default function SummaryCard({
  stats,
  semester = "Spring 2025",
  name, // Add name prop here
}: {
  stats: Stats;
  semester?: string;
  name?: string; // Add name prop type
}) {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleDownload = async () => {
    if (!cardRef.current) return;
    const dataUrl = await toPng(cardRef.current);
    download(dataUrl, `mobile-order-summary-${semester.replace(" ", "-")}.png`);
    confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
  };

  const handleShare = async () => {
    if (!cardRef.current) return;
  
    try {
      // generate a Blob directly
      const blob = await toBlob(cardRef.current);
      if (!blob) throw new Error("Could not generate image blob");
  
      const file = new File(
        [blob],
        `wrapped-summary-${semester.replace(" ", "-")}.png`,
        { type: "image/png" }
      );
  
      // the link you want to share
      const shareUrl = "https://mobileorderwrapped.com/";
  
      if (
        navigator.canShare &&
        navigator.canShare({ files: [file], url: shareUrl })
      ) {
        await navigator.share({
          files: [file],
          title: `Mobile Order Wrapped for ${name || "User"} (${semester})`,
          text: `Check out my Mobile Order Wrapped!`,
          url: shareUrl,
        });
      } else {
        // fallback: include URL in text so that at least the receiver can click it
        alert(
          "Sharing isn’t supported on this browser. You can download the image and manually share it along with this link:\n" +
            shareUrl
        );
      }
    } catch (err) {
      console.error("Error sharing:", err);
      alert("Oops! Something went wrong while sharing.");
    }
  };
  
  

  const topItems = [...stats.item_counts]
    .sort((a, b) => b.count - a.count)
    .slice(0, 3);

  const [topRestaurantName, topRestaurantCount] = Object.entries(stats.restaurant_counts)
    .sort((a, b) => b[1] - a[1])[0];

  const formattedBusiestDay = formatToMonthDay(stats.busiest_day.date);

  return (
    <div className="flex flex-col items-center space-y-6 py-8">
<div
  ref={cardRef}
  className={`
    ${GRADIENT}
    relative
    overflow-hidden
    rounded-3xl
    shadow-2xl
    w-[80vw] max-w-[350px]
    aspect-[4/5]
    p-4 md:p-6
    flex flex-col justify-between
    text-white
  `}
>

        {/* Big, soft blob behind everything */}
        <div
          className="
            absolute
            -top-16 -left-16
            w-[200%] h-[200%]
            rounded-full
            bg-white/10
            transform rotate-45
          "
        />

        {/* Header */}
        <div className="relative z-10">
          <h1 className="text-2xl font-bold text-left">
            Mobile Order Wrapped
            {name && (
              <span className="block text-lg font-normal mt-1">
                {name}
              </span>
            )}
          </h1>

          <p className="uppercase text-xs opacity-75 mt-1">{semester}</p>
        </div>

        {/* Stats sections */}
        <div className="relative z-10 space-y-4">
          <div>
            <p className="uppercase text-xs opacity-75">Top Items</p>
            {topItems.map((it, i) => (
              <p key={i} className="text-lg font-semibold">
                {i + 1}. {it.item} <span className="opacity-75">({it.count}×)</span>
              </p>
            ))}
          </div>

          <div className="flex justify-between">
            <div>
              <p className="uppercase text-xs opacity-75">Top Spot</p>
              <p className="text-lg font-semibold">{topRestaurantName}</p>
              <p className="text-sm opacity-75">{topRestaurantCount} visits</p>
            </div>
            <div>
              <p className="uppercase text-xs opacity-75">Busiest Day</p>
              <p className="text-lg font-semibold">{formattedBusiestDay}</p>
              <p className="text-sm opacity-75">{stats.busiest_day.order_count} orders</p>
            </div>
          </div>

          <div>
            <p className="uppercase text-xs opacity-75">Most Spent</p>
            <p className="text-lg font-semibold">
              ${stats.most_expensive_order.total.toFixed(2)}
            </p>
          </div>
          
        </div>

        {/* Footer link */}
        <p className="relative z-10 text-[11px] text-lime-300 opacity-80 uppercase">
          mobileorderwrapped.com
        </p>
      </div>

      {/* Button container */}
      <div className="flex space-x-4">
        {/* Download button */}
        <button
          onClick={handleDownload}
          className="
            bg-white
            hover:bg-gray-100
            text-gray-900
            px-6 py-3
            rounded-full
            shadow-lg
            font-semibold
            transition
          "
        >
          Download
        </button>

        {/* Share button */}
        <button
          onClick={handleShare}
          className="
            bg-blue-600
            hover:bg-blue-700
            text-white
            px-6 py-3
            rounded-full
            shadow-lg
            font-semibold
            transition
          "
        >
          Share
        </button>
      </div>
    </div>
  );
}
