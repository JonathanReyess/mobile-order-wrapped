import { useRef, useState, useEffect } from "react";
import { toPng, toBlob } from "html-to-image";
import download from "downloadjs";
// @ts-ignore
import confetti from "canvas-confetti";
import gsap from "gsap";

// --- Utilities ---
function formatToMonthDay(dateStr: string) {
  const [year, month, day] = dateStr.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  if (isNaN(date.getTime())) return "Invalid date";
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatToTimeOnly(dateStr: string) {
  if (!dateStr) return "N/A";
  const parts = dateStr.split(/\s+/);
  if (parts.length < 2) return dateStr;
  
  const [datePart, timePart, meridiem] = parts;
  const [hourStr, minuteStr] = timePart.split(":");
  const [year, month, day] = datePart.split("-").map(Number);
  
  let hour = parseInt(hourStr, 10);
  const minute = parseInt(minuteStr, 10);
  
  if (meridiem === "PM" && hour !== 12) hour += 12;
  else if (meridiem === "AM" && hour === 12) hour = 0;
  
  const dateObj = new Date(year, month - 1, day, hour, minute);
  // Keep icon sizes small for the smaller card
  return dateObj.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

// --- Icons (size reduced from 16 to 14 for proportionality) ---
const ShareIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" x2="12" y1="2" y2="15"/></svg>
);
const DownloadIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
);
const EyeOffIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" x2="22" y1="2" y2="22"/></svg>
);
const EyeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
);
const TrophyIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>
);
const CalendarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
);
const ClockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
);
const DollarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" x2="12" y1="2" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
);

// --- Theme Configurations (No change to colors/styles) ---
const THEMES = [
  {
    id: "deepocean",
    label: "Deep Ocean",
    pageBg: "bg-[#001f3f]",
    cardBg: "bg-[#003366]",
    textColor: "text-blue-50",
    subTextColor: "text-blue-200/60",
    accentColor: "text-[#40e0d0]",
    borderColor: "border-[#004d99]",
    dividerColor: "bg-[#004d99]",
    barColor: "bg-[#1e90ff]",
    shadow: "shadow-[0_20px_60px_-15px_rgba(30,144,255,0.2)]",
    buttonBg: "bg-[#005a9c] text-white hover:bg-[#007acc]"
  },
  {
    id: "noir",
    label: "Noir",
    pageBg: "bg-[#0a0a0a]",
    cardBg: "bg-[#111111]",
    textColor: "text-zinc-100",
    subTextColor: "text-zinc-500",
    accentColor: "text-white",
    borderColor: "border-zinc-800",
    dividerColor: "bg-zinc-800",
    barColor: "bg-zinc-100",
    shadow: "shadow-[0_20px_60px_-15px_rgba(255,255,255,0.05)]",
    buttonBg: "bg-zinc-100 text-black hover:bg-zinc-200"
  },
  {
    id: "midnight",
    label: "Midnight",
    pageBg: "bg-slate-950",
    cardBg: "bg-[#0f172a]",
    textColor: "text-slate-100",
    subTextColor: "text-slate-400",
    accentColor: "text-indigo-400",
    borderColor: "border-slate-800",
    dividerColor: "bg-slate-800",
    barColor: "bg-indigo-500",
    shadow: "shadow-[0_20px_60px_-15px_rgba(99,102,241,0.15)]",
    buttonBg: "bg-indigo-500 text-white hover:bg-indigo-400"
  },
  {
    id: "matcha",
    label: "Matcha Latte",
    pageBg: "bg-[#c0cfb2]",
    cardBg: "bg-[#ffffff]",
    textColor: "text-gray-900",
    subTextColor: "text-gray-500",
    accentColor: "text-[#587e6c]",
    borderColor: "border-[#e0ddd4]",
    dividerColor: "bg-[#e0ddd4]",
    barColor: "bg-[#7aa08a]",
    shadow: "shadow-[0_10px_30px_-5px_rgba(122,160,138,0.2)]",
    buttonBg: "bg-[#7aa08a] text-white hover:bg-[#587e6c]"
  },
  {
    id: "hojicha",
    label: "Hojicha Roast",
    pageBg: "bg-[#e7d6c5]",
    cardBg: "bg-[#ffffff]",
    textColor: "text-stone-800",
    subTextColor: "text-stone-500",
    accentColor: "text-[#a0522d]",
    borderColor: "border-[#f1ece6]",
    dividerColor: "bg-[#f1ece6]",
    barColor: "bg-[#8b4513]",
    shadow: "shadow-[0_10px_30px_-5px_rgba(139,69,19,0.1)]",
    buttonBg: "bg-[#8b4513] text-white hover:bg-[#a0522d]"
  },
];

// Type definition matching the reference
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

interface SummaryCardProps {
  stats: Stats;
  semester?: string;
  name?: string;
}

// Mock data for demo
const mockStats: Stats = {
  total_items_ordered: 247,
  item_counts: [
    { item: "Iced Latte", count: 45 },
    { item: "Avocado Toast", count: 38 },
    { item: "Caesar Salad", count: 32 },
    { item: "Breakfast Burrito", count: 28 },
    { item: "Cold Brew", count: 24 }
  ],
  restaurant_counts: {
    "Campus Café": 89,
    "The Bistro": 67,
    "Quick Bites": 45,
    "Green Bowl": 32,
    "Daily Grind": 14
  },
  most_expensive_order: {
    total: 47.85,
    order_time: "2024-11-15 12:30 PM",
    transaction_id: "TXN001"
  },
  busiest_day: {
    date: "2024-11-12",
    order_count: 8
  },
  busiest_day_orders: [],
  earliest_order: {
    order_time: "2024-09-01 08:15 AM",
    total: 12.50,
    transaction_id: "TXN002",
    items: [{ name: "Coffee" }]
  },
  latest_order: {
    order_time: "2024-11-30 09:30 PM",
    total: 18.75,
    transaction_id: "TXN003",
    items: [{ name: "Pizza" }]
  },
  earliest_order_by_time: {
    order_time: "2024-10-05 06:45 AM",
    pickup_time: "07:00 AM",
    restaurant_name: "Early Bird Cafe",
    total: "8.50",
    transaction_id: "TXN004",
    items: [{ name: "Bagel" }]
  },
  latest_order_by_time: {
    order_time: "2024-11-30 11:47 PM",
    pickup_time: "12:00 AM",
    restaurant_name: "Late Night Diner",
    total: "22.00",
    transaction_id: "TXN005",
    items: [{ name: "Burger" }]
  }
};

export default function SummaryCard({ stats = mockStats, semester = "Fall 2025", name = "Alex Chen" }: SummaryCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const tiltRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeTheme, setActiveTheme] = useState(THEMES[0]); 
  const [anonymize, setAnonymize] = useState(false);

  // 3D Tilt Effect
  useEffect(() => {
    const card = tiltRef.current;
    const container = containerRef.current;
    if (!card || !container) return;

    const handleMouseMove = (e: MouseEvent) => {
      if(window.innerWidth < 768) return; 
      
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      const rotateX = -((y - centerY) / centerY) * 5; 
      const rotateY = ((x - centerX) / centerX) * 5;

      gsap.to(card, {
        rotateX: rotateX,
        rotateY: rotateY,
        transformPerspective: 1000,
        transformOrigin: "center",
        ease: "power2.out",
        duration: 0.4,
      });
    };

    const resetMouseMove = () => {
      gsap.to(card, { 
        rotateX: 0, 
        rotateY: 0, 
        ease: "power2.out", 
        duration: 0.6 
      });
    };

    container.addEventListener("mousemove", handleMouseMove);
    container.addEventListener("mouseleave", resetMouseMove);
    return () => {
      container.removeEventListener("mousemove", handleMouseMove);
      container.removeEventListener("mouseleave", resetMouseMove);
    };
  }, []);

  const handleDownload = async () => {
    if (!cardRef.current) return;
    
    if (tiltRef.current) gsap.set(tiltRef.current, { clearProps: "transform" });

    try {
      // Adjusted pixelRatio for high-quality export of the smaller card
      const dataUrl = await toPng(cardRef.current, { pixelRatio: 4, cacheBust: true });
      download(dataUrl, `mobile-order-wrapped-${semester.replace(" ", "-")}.png`);
      confetti({ 
        particleCount: 150, 
        spread: 70, 
        origin: { y: 0.6 }, 
        colors: activeTheme.id === 'deepforest' ? ['#D4AF37', '#141b14', '#ffffff'] : (activeTheme.id === 'porcelain' ? ['#000', '#555'] : ['#ffffff', '#fbbf24', '#f472b6']) 
      });
    } catch (e) {
      console.error("Download failed", e);
    }
  };

  const handleShare = async () => {
    if (!cardRef.current) return;
    if (tiltRef.current) gsap.set(tiltRef.current, { clearProps: "transform" });
    
    try {
      const blob = await toBlob(cardRef.current, { pixelRatio: 4 });
      if (!blob) throw new Error("Could not generate image blob");
      
      const file = new File([blob], `my-wrapped-${semester.replace(" ", "-")}.png`, { type: "image/png" });
      
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ 
          files: [file], 
          title: `My Mobile Order Wrapped`, 
          text: `I ordered ${stats.total_items_ordered} items this semester! #MobileOrderWrapped` 
        });
      } else {
        handleDownload();
      }
    } catch (err: any) {
      if (err.name !== "AbortError" && err.name !== "NotAllowedError") {
        handleDownload();
      }
    }
  };

  // Data
  const topItems = [...stats.item_counts].sort((a, b) => b.count - a.count).slice(0, 5);
  const [topRestaurantName] = Object.entries(stats.restaurant_counts).sort((a, b) => b[1] - a[1])[0] || ["Unknown", 0];
  const formattedBusiestDay = formatToMonthDay(stats.busiest_day.date);
  const maxItemCount = topItems[0]?.count || 1;

  return (
    <div className={`min-h-screen w-full flex flex-col items-center justify-center p-3 md:p-6 transition-colors duration-500 ${activeTheme.pageBg} font-sans`}>
      
      {/* Controls - Adjusted padding and size */}
      <div className="fixed top-3 left-0 right-0 z-50 flex justify-center pointer-events-none">
        <div className="bg-black/20 backdrop-blur-xl border border-white/10 p-1.5 rounded-full flex gap-2 shadow-lg pointer-events-auto">
          {THEMES.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTheme(t)}
              className={`w-5 h-5 rounded-full border border-white/10 transition-transform hover:scale-110 ${t.id === activeTheme.id ? 'ring-2 ring-white scale-110' : 'opacity-70'}`}
              style={{ 
                background: 
                  t.id === 'noir' ? '#FFFFFF' : 
                  t.id === 'midnight' ? '#1e293b' : 
                  t.id === 'deepocean' ? '#003366' : 
                  t.id === 'matcha' ? '#B3C6A9' :    
                  t.id === 'hojicha' ? '#8b4513' :   
                  'gray' 
              }}
            />
          ))}
          <div className="w-px bg-white/10 mx-0.5" />
          <button 
            onClick={() => setAnonymize(!anonymize)}
            className="text-white/70 hover:text-white transition-colors"
          >
            {/* Icons are inherently smaller here */}
            {anonymize ? <EyeOffIcon /> : <EyeIcon />} 
          </button>
        </div>
      </div>

      {/* Main Card Container - Reduced max-width */}
      <div className="relative z-10 w-full max-w-[320px]" ref={containerRef}>
        <div ref={tiltRef} className="will-change-transform">
          
          {/* Main Card - Rounded corners slightly reduced for size */}
          <div
            ref={cardRef}
            className={`
              relative w-full aspect-[4/6] rounded-[20px] overflow-hidden 
              flex flex-col
              transition-all duration-500
              ${activeTheme.cardBg}
              ${activeTheme.textColor}
              ${activeTheme.shadow}
            `}
          >
            {/* Border Layer - Thickness reduced */}
            <div className={`absolute inset-0 border-[4px] ${activeTheme.borderColor} rounded-[20px] pointer-events-none z-20 opacity-50`} />

            {/* Content Padding - Reduced padding */}
            <div className="flex-1 flex flex-col p-4 relative z-10">
              
              {/* Header - Adjusted font sizes and spacing */}
              <div className="flex justify-between items-start mb-4">
                <div className="flex flex-col">
                  <span className={`text-[8px] font-mono tracking-widest uppercase mb-0.5 ${activeTheme.subTextColor}`}>Mobile Order Wrapped</span>
                  <h1 className={`text-lg font-bold tracking-tight ${anonymize ? 'blur-sm select-none' : ''}`}>
                    {anonymize ? "HIDDEN NAME" : (name || "USER")}
                  </h1>
                </div>
                
                <div className={`px-2 py-0.5 rounded-full border ${activeTheme.borderColor} ${activeTheme.subTextColor} text-[8px] font-mono font-bold uppercase`}>
                  {semester}
                </div>
              </div>

              {/* Big Stat - Reduced font sizes and spacing */}
              <div className="mb-4">
                 <div className="flex items-baseline gap-1">
                   <span className="text-4xl font-bold tracking-tighter leading-none">
                     {stats.total_items_ordered}
                   </span>
                   <span className={`${activeTheme.accentColor} font-serif italic text-base`}>items</span>
                 </div>
                 <p className={`text-[10px] mt-1 ${activeTheme.subTextColor}`}>Total orders placed this semester.</p>
              </div>

              {/* Divider - Reduced margin */}
              <div className={`h-px w-full ${activeTheme.dividerColor} mb-3`} />

              {/* Top Items List - Reduced font sizes and spacing */}
              <div className="flex-1 mb-3">
                <h3 className={`text-[9px] font-mono uppercase tracking-widest mb-2 ${activeTheme.subTextColor}`}>Top Cravings</h3>
                <div className="flex flex-col gap-2">
                  {topItems.map((item, i) => (
                    <div key={i} className="flex items-center gap-2 group">
                      <span className={`font-mono text-[10px] w-3 opacity-40`}>0{i + 1}</span>
                      <div className="flex-1">
                        <div className="flex justify-between items-baseline mb-0.5">
                          <span className="text-xs font-semibold truncate pr-2 max-w-[140px]">{item.item}</span> {/* Max width reduced */}
                          <span className={`text-[9px] ${activeTheme.subTextColor}`}>{item.count}</span>
                        </div>
                        {/* Custom Progress Bar */}
                        <div className={`h-1 w-full ${activeTheme.dividerColor} rounded-full overflow-hidden`}>
                           <div 
                             className={`h-full ${activeTheme.barColor} transition-all duration-1000 ease-out`} 
                             style={{ width: `${(item.count / maxItemCount) * 100}%` }}
                           />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Grid Stats - Reduced padding, spacing, and font sizes */}
              <div className="grid grid-cols-2 gap-2 mb-4">
                 {/* Top Spot */}
                 <div className={`p-2 rounded-lg ${activeTheme.dividerColor} flex flex-col justify-between min-h-[60px]`}>
                    <div className={`${activeTheme.subTextColor} mb-0.5`}><TrophyIcon /></div>
                    <div>
                      <div className="text-[8px] opacity-60 uppercase tracking-wider">Top Spot</div>
                      <div className="text-[10px] font-bold truncate leading-tight">{topRestaurantName}</div>
                    </div>
                 </div>
                 
                 {/* Spend */}
                 <div className={`p-2 rounded-lg ${activeTheme.dividerColor} flex flex-col justify-between min-h-[60px]`}>
                    <div className={`${activeTheme.subTextColor} mb-0.5`}><DollarIcon /></div>
                    <div>
                      <div className="text-[8px] opacity-60 uppercase tracking-wider">Top Spend</div>
                      <div className="text-[10px] font-bold">${stats.most_expensive_order.total.toFixed(2)}</div>
                    </div>
                 </div>

                 {/* Day */}
                 <div className={`p-2 rounded-lg ${activeTheme.dividerColor} flex flex-col justify-between min-h-[60px]`}>
                    <div className={`${activeTheme.subTextColor} mb-0.5`}><CalendarIcon /></div>
                    <div>
                      <div className="text-[8px] opacity-60 uppercase tracking-wider">Busy Day</div>
                      <div className="text-[10px] font-bold">{formattedBusiestDay}</div>
                    </div>
                 </div>

                 {/* Time */}
                 <div className={`p-2 rounded-lg ${activeTheme.dividerColor} flex flex-col justify-between min-h-[60px]`}>
                    <div className={`${activeTheme.subTextColor} mb-0.5`}><ClockIcon /></div>
                    <div>
                      <div className="text-[8px] opacity-60 uppercase tracking-wider">Latest</div>
                      <div className="text-[10px] font-bold">{formatToTimeOnly(stats.latest_order_by_time.order_time).toLowerCase()}</div>
                    </div>
                 </div>
              </div>

              {/* Footer text - Reduced font size */}
              <div className="text-center">
                <span className="text-[8px] font-bold block">mobileorderwrapped.com</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons below card - Reduced padding/size */}
        <div className="mt-4 flex gap-2 justify-center w-full">
           <button 
             onClick={handleShare}
             className={`flex-1 flex items-center justify-center gap-1.5 ${activeTheme.buttonBg} font-medium text-sm py-2 px-4 rounded-full transition-all active:scale-95 shadow-md`}
           >
             <ShareIcon />
             Share
           </button>
           <button 
             onClick={handleDownload}
             className={`flex-1 flex items-center justify-center gap-1.5 bg-transparent border ${activeTheme.borderColor} ${activeTheme.textColor} hover:bg-white/5 font-medium text-sm py-2 px-4 rounded-full transition-all active:scale-95`}
           >
             <DownloadIcon />
             Save
           </button>
        </div>
      </div>
    </div>
  );
}