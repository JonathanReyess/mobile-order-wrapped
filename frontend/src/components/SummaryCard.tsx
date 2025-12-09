import { useRef, useState, useEffect } from "react";
import { toPng, toBlob } from "html-to-image";
import download from "downloadjs";
// @ts-ignore
import confetti from "canvas-confetti";
import gsap from "gsap";

// --- Utilities ---
function formatToMonthDay(dateStr: string): { month: string; day: string; } | string {
  const [year, month, day] = dateStr.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  if (isNaN(date.getTime())) return "Invalid date";
  const monthName = date.toLocaleDateString("en-US", { month: "short" });
  const dayNum = date.toLocaleDateString("en-US", { day: "numeric" });
  return { month: monthName, day: dayNum };
}

// --- Icons (size reduced from 16 to 14 for proportionality) ---
const ShareIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" x2="12" y1="2" y2="15"/></svg>
);
const DownloadIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
);
const TrophyIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>
);
const DollarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" x2="12" y1="2" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
);
const UserIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
);
const IncognitoIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4.6138 8.54479L4.1875 10.25H2C1.58579 10.25 1.25 10.5858 1.25 11C1.25 11.4142 1.58579 11.75 2 11.75H22C22.4142 11.75 22.75 11.4142 22.75 11C22.75 10.5858 22.4142 10.25 22 10.25H19.8125L19.3862 8.54479C18.8405 6.36211 18.5677 5.27077 17.7539 4.63538C16.9401 4 15.8152 4 13.5653 4H10.4347C8.1848 4 7.05988 4 6.24609 4.63538C5.43231 5.27077 5.15947 6.36211 4.6138 8.54479ZM6.5 21C8.12316 21 9.48826 19.8951 9.88417 18.3963L10.9938 17.8415C11.6272 17.5248 12.3728 17.5248 13.0062 17.8415L14.1158 18.3963C14.5117 19.8951 15.8768 21 17.5 21C19.433 21 21 19.433 21 17.5C21 15.567 19.433 14 17.5 14C15.8399 14 14.4498 15.1558 14.0903 16.7065L13.6771 16.4999C12.6213 15.972 11.3787 15.972 10.3229 16.4999L9.90967 16.7065C9.55023 15.1558 8.16009 14 6.5 14C4.567 14 3 15.567 3 17.5C3 19.433 4.567 21 6.5 21Z" fill="currentColor"></path>
  </svg>
);



// --- Theme Configurations (Updated Matcha & Hojicha) ---
const THEMES = [
  {
    id: "deepocean",
    label: "Deep Ocean",
    pageBg: "bg-[#001f3f]",
    cardBg: "bg-[#003366]",
    textColor: "text-blue-50",
    subTextColor: "text-blue-200/60",
    accentColor: "text-[#40e0d0]",
    borderColor: "border-[#FFFFFF]",
    dividerColor: "bg-[#004d99]", 
    barColor: "bg-[#1e90ff]", 
    buttonBg: "bg-[#005a9c] text-white hover:bg-[#007acc]",
    sticker1: "bg-[#004d99]/80 border-white/10 text-white", 
    sticker2: "bg-[#004d99]/80 border-white/10 text-white", 
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
    buttonBg: "bg-zinc-100 text-black hover:bg-zinc-200",
    sticker1: "bg-zinc-800 border-zinc-700 text-white", 
    sticker2: "bg-zinc-800 border-zinc-700 text-white", 
  },
  {
    id: "midnight",
    label: "Midnight",
    pageBg: "bg-slate-900", 
    cardBg: "bg-[#55508d]", 
    textColor: "text-indigo-50", 
    subTextColor: "text-indigo-300", 
    accentColor: "text-indigo-400", 
    borderColor: "border-slate-700", 
    dividerColor: "bg-indigo-700", 
    barColor: "bg-indigo-500", 
    buttonBg: "bg-indigo-500 text-white hover:bg-indigo-400",
    sticker1: "bg-[#55508d]/80 border-indigo-400/20 text-white", 
    sticker2: "bg-[#55508d]/80 border-indigo-400/20 text-white", 
  },
  {
    id: "matcha",
    label: "Matcha Latte",
    pageBg: "bg-[#c0cfb2]",
    cardBg: "bg-[#44624a]",
    textColor: "text-white",
    subTextColor: "text-[#b3c6a9]",
    accentColor: "text-[#b3c6a9]",
    borderColor: "border-[#44624a]",
    dividerColor: "bg-[#587e6c]", 
    barColor: "bg-[#7aa08a]", 
    buttonBg: "bg-[#7aa08a] text-white hover:bg-[#587e6c]",
    sticker1: "bg-[#587e6c]/80 border-white/10 text-white", 
    sticker2: "bg-[#587e6c]/80 border-white/10 text-white",
  },
  {
    id: "hojicha",
    label: "Hojicha Roast",
    pageBg: "bg-[#dac1a7]",
    cardBg: "bg-[#8b4513]",
    textColor: "text-[#f1ece6]",
    subTextColor: "text-[#d2b48c]",
    accentColor: "text-[#d2b48c]",
    borderColor: "border-[#d2b48c]",
    dividerColor: "bg-[#a0522d]", 
    barColor: "bg-[#a0522d]", 
    buttonBg: "bg-[#a0522d] text-white hover:bg-[#8b4513]",
    sticker1: "bg-[#a0522d]/80 border-[#f1ece6]/30 text-white",
    sticker2: "bg-[#a0522d]/80 border-[#f1ece6]/30 text-white",
  },
];

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

export default function SummaryCard({ stats, semester = "Fall 2025", name = "Alex Chen" }: SummaryCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const tiltRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeTheme, setActiveTheme] = useState(THEMES[0]); 
  const [anonymize, setAnonymize] = useState(false);

  const { 
    cardBg, 
    textColor, 
    subTextColor, 
    sticker1, 
    sticker2 
  } = activeTheme;

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
// --- Updated Configuration ---
const imgConfig = {
  quality: 1,
  pixelRatio: 2, // Hardcoded for consistency across devices
  cacheBust: true,
  // CRITICAL FIX FOR SAFARI: Exclude the SVG noise filter from the snapshot.
  // Safari struggles to serialize <feTurbulence> inside a canvas.
  filter: (node: HTMLElement) => {
    const exclusionClasses = ['noise-overlay', 'exclude-from-export'];
    if (node.classList) {
       for (const cls of exclusionClasses) {
           if (node.classList.contains(cls)) return false;
       }
    }
    // Also exclude the specific SVG defs if identified by ID
    if (node.id === 'noiseFilter') return false;
    return true;
  },
};
// 1. Define your font URL exactly as it appears in index.html
const GOOGLE_FONT_URL = "https://fonts.googleapis.com/css2?family=Inter:wght@100..900&family=JetBrains+Mono:ital,wght@0,100..800;1,100..800&family=Space+Grotesk:wght@300..700&display=swap";

// ... inside your component ...

const handleDownload = async () => {
  if (!cardRef.current) return;

  // 1. Force clear 3D transforms (GSAP)
  if (tiltRef.current) gsap.set(tiltRef.current, { clearProps: "all" });

  try {
    // 2. FETCH FONTS MANUALLY
    // We fetch the CSS text from Google so we can embed it directly.
    // This bypasses the <link> tag security restriction in Safari.
    let fontCss = "";
    try {
      const resp = await fetch(GOOGLE_FONT_URL);
      fontCss = await resp.text();
    } catch (fontError) {
      console.warn("Could not fetch fonts for export", fontError);
    }

    // 3. Wait for document fonts to be ready (Layout check)
    await document.fonts.ready;
    await new Promise((resolve) => setTimeout(resolve, 100));

    // 4. Get dynamic dimensions
    const width = cardRef.current.offsetWidth;
    const height = cardRef.current.offsetHeight;

    const dataUrl = await toPng(cardRef.current, {
      ...imgConfig,
      width: width,
      height: height,
      // 5. INJECT THE FETCHED CSS HERE
      fontEmbedCSS: fontCss, 
      style: {
        transform: 'scale(1)',
        margin: '0',
        transformOrigin: 'top left',
        fontFamily: 'Inter, sans-serif', // Enforce fallback on the wrapper
      },
    });

    download(dataUrl, `mobile-order-wrapped-${semester.replace(" ", "-")}.png`);

    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: activeTheme.id === 'deepocean' 
        ? ['#40e0d0', '#003366', '#ffffff'] 
        : (activeTheme.id === 'noir' ? ['#0a0a0a', '#ffffff'] : ['#ffffff', '#fbbf24', '#f472b6'])
    });

  } catch (e) {
    console.error("Download failed", e);
    alert("Oops! Could not generate image. Please try taking a screenshot instead.");
  }
};

const handleShare = async () => {
  if (!cardRef.current) return;
  if (tiltRef.current) gsap.set(tiltRef.current, { clearProps: "transform" });
  
  try {
    // Fetch fonts for Share action too
    let fontCss = "";
    try {
      const resp = await fetch(GOOGLE_FONT_URL);
      fontCss = await resp.text();
    } catch (e) { console.warn("Font fetch failed for share"); }

    const blob = await toBlob(cardRef.current, {
        ...imgConfig,
        fontEmbedCSS: fontCss, // Inject here as well
    }); 
    
    if (!blob) throw new Error("Could not generate image blob");
    
    const file = new File([blob], `mobile-order-wrapped-${semester.replace(" ", "-")}.png`, { type: "image/png" });
    
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({ 
        files: [file], 
        title: `My Mobile Order Wrapped`, 
        text: `${topRestaurantName} is why I'm out of food points! Find out why you're out on https://mobileorderwrapped.com`
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

  // Data Processing
  const topItems = [...stats.item_counts].sort((a, b) => b.count - a.count).slice(0, 5);
  const [topRestaurantName, topRestaurantCount] = Object.entries(stats.restaurant_counts).sort((a, b) => b[1] - a[1])[0] || ["Unknown", 0];
  
  const formattedBusiestDayResult = formatToMonthDay(stats.busiest_day.date);
  const formattedBusiestDay = typeof formattedBusiestDayResult === 'string' 
    ? { month: 'N/A', day: 'N/A' } 
    : formattedBusiestDayResult;

  return (
    <div className={`min-h-screen w-full flex flex-col items-center justify-center p-3 md:p-6 transition-colors duration-500 ${activeTheme.pageBg} font-sans`}>
  {/* Controls */}
<div className="fixed top-4 left-0 right-0 z-50 flex justify-center pointer-events-none">
  <div className="bg-black/20 backdrop-blur-xl border border-white/10 p-2.5 rounded-full flex gap-2 shadow-lg pointer-events-auto">
    {THEMES.map((t) => (
      <button
        key={t.id}
        onClick={() => setActiveTheme(t)}
        className={`w-5 h-5 rounded-full border border-white/10 transition-transform hover:scale-110 ${t.id === activeTheme.id ? 'ring-2 ring-white scale-110' : 'opacity-70'}`}
        style={{ 
          background: 
            t.id === 'noir' ? '#777777' : 
            t.id === 'midnight' ? '#55508d' : 
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
      className="text-white/70 hover:text-white transition-colors flex items-center gap-1.5 px-2" // Added flex, items-center, gap-1.5, and px-2
    >
      {/* Icon and Text Container */}
      <div className="flex items-center"> 
        {anonymize ? <IncognitoIcon /> : <UserIcon />}
        <span className="text-sm font-medium ml-2">Anonymize</span> {/* Added text */}
      </div>
    </button>
  </div>
</div>

      {/* Main Card Container - Slightly widened to account for margin wrapper */}
      <div className="relative z-10 w-full max-w-[360px]" ref={containerRef}>
        <div ref={tiltRef} className="will-change-transform">
          
          {/* === EXPORT WRAPPER === */}
          {/* This wrapper is what gets captured. It provides the "Margins" via padding. */}
          <div 
            ref={cardRef} 
            className={`p-2 ${activeTheme.cardBg} rounded-[40px] transition-colors duration-500`}
          >
            {/* === INNER CARD CONTENT === */}
            <div
              className={`
                relative w-full aspect-[4/6] rounded-[30px] overflow-hidden 
                flex flex-col 
                transition-all duration-500
                ${cardBg} ${textColor}
              `}
            >
              {/* Grain Texture Overlay */}
              <div className="absolute inset-0 z-0 pointer-events-none rounded-[30px] overflow-hidden">
              <svg
                className="w-full h-full opacity-20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <filter id="noiseFilter">
                  <feTurbulence
                    type="fractalNoise"
                    baseFrequency="0.7"
                    numOctaves="3"
                    stitchTiles="stitch"
                  />
                </filter>
                <rect width="100%" height="100%" filter="url(#noiseFilter)" />
              </svg>
            </div>
              {/* Content Container */}
              <div className="flex-1 flex flex-col p-5 relative z-10">
                            
                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex flex-col">
                    {/* MODIFIED: text-[9px] changed to text-[8px] to prevent line break */}
                    <div className={`text-[8px] font-bold tracking-widest uppercase mb-1 opacity-80 ${subTextColor} whitespace-nowrap`}>
  Mobile Order Wrapped
</div>
                    <div className={`text-sm font-black tracking-tight ${anonymize ? 'blur-sm select-none' : ''}`}>
                      {anonymize ? "HIDDEN NAME" : (name || "USER")}
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-white text-[12px] font-bold uppercase tracking-wider transform whitespace-nowrap`}>
                    {semester}
                  </div>
                </div>

                {/* Hero Stat */}
                <div className="relative mb-2 py-1"> 
                  <div className="flex flex-col leading-[0.8]">
                    <span className="text-[72px] font-display tracking-tighter">
                      {stats.total_items_ordered}
                    </span>
                    <span className="text-xl font-bold uppercase tracking-tight ml-1 opacity-90">Items Ordered</span>
                  </div>
                
                </div>

                {/* Top Items */}
                <div className="flex-1 flex flex-col justify-center"> 
                  <div className="space-y-2">
                    {topItems.map((item, i) => (
                      <div key={i} className="flex items-center gap-2 group">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-s ${'bg-white/20 text-white'}`}>
                          {i + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-bold leading-tight truncate">{item.item}</div>
                          <div className={`text-[10px] font-medium uppercase tracking-wide opacity-70 ${subTextColor}`}>{item.count} orders</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Stickers / Floating Stats */}
                <div className="relative h-28 mt-auto"> 
                  {/* Sticker 1: Top Restaurant */}
                  <div 
                      className={`
                          relative 
                          absolute top-3 left-4 p-2 pr-4 rounded-r-xl rounded-bl-xl ${sticker1} border transform -rotate-3 max-w-[55%]
                      `}
                  >
                      <div className="absolute top-[-8px] right-[-5px] rotate-6 text-yellow-300 ">
                          <TrophyIcon />
                      </div>
                      <div className="text-[7px] uppercase font-bold tracking-wider opacity-70">Top Spot</div>
                      <div className="text-xs font-bold leading-tight truncate">{topRestaurantName}</div>
                      <div className="text-[10px] opacity-80">{topRestaurantCount} visits</div>
                  </div>

                  {/* Sticker 2: Spend */}
                  <div 
                      className={`
                          relative 
                          w-max
                          absolute bottom-16 right-[-215px]
                          p-2 pl-2 
                          rounded-r-xl rounded-tl-xl 
                          ${sticker2} border transform rotate-3 text-right
                      `}
                  >
                      <div className="absolute top-[-7px] left-[-6px] transform -rotate-6 text-yellow-300">
                          <DollarIcon />
                      </div>
                      <div className="text-[7px] uppercase font-bold tracking-wider opacity-70">Top Spend</div>
                      <div className="text-lg text-center font-black">${stats.most_expensive_order.total.toFixed(0)}</div>
                      <div className="text-[8px] opacity-70 whitespace-nowrap">Single Order</div>
                  </div>
                        
                  {/* Sticker 3: Busiest Day Badge */}
                  <div 
                    className={`absolute -top-72 right-2 w-20 h-20 rounded-full text-white flex flex-col items-center justify-center text-center p-1 transform -rotate-12 border-4 border-white/20 z-10`}>
                    <div className="text-[7px] uppercase font-black leading-tight whitespace-nowrap">Busiest Day</div>
                    <div className="text-s font-black leading-none mt-0.5">{formattedBusiestDay.month}</div>
                    <div className="text-base font-black leading-none">{formattedBusiestDay.day}</div>
                  </div>
                </div>

                {/* Footer */}
                <div className="-mt-5 flex justify-between items-center opacity-100">
                  <div className="text-[9px] font-mono tracking-widest uppercase mx-auto">
                    mobileorderwrapped.com
                  </div>
                </div>
              </div>
            </div>
            {/* === END INNER CARD === */}
          </div> 
          {/* === END EXPORT WRAPPER === */}

        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex gap-2 justify-center w-full">
           <button 
             onClick={handleShare}
             className={`flex-1 flex items-center justify-center gap-1.5 ${activeTheme.buttonBg} font-medium text-sm py-2 px-4 rounded-full transition-all active:scale-95 shadow-md`}
           >
             <ShareIcon />
             Share
           </button>
           <button 
             onClick={handleDownload}
             className={`flex-1 flex items-center justify-center gap-1.5 bg-transparent border  ${activeTheme.textColor} hover:bg-white/5 font-medium text-sm py-2 px-4 rounded-full transition-all active:scale-95`}
           >
             <DownloadIcon />
             Save
           </button>
        </div>
      </div>
    </div>
  );
}