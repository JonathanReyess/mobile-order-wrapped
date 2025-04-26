// SlideShow.tsx
import { useEffect, useRef, useState, ReactNode } from "react";
import { useDrag } from "@use-gesture/react";
import IntroSlide from "./IntroSlide";
import TopItemsSlide from "./TopItemsSlide";
import TopRestaurantsSlide from "./TopRestaurantsSlide";
import FavoriteRestaurant from "./FavoriteRestaurant";
import BusiestDaySlide from "./BusiestDaySlide";
import EarliestOrderSlide from "./EarliestOrderSlide";
import LatestOrderSlide from "./LatestOrderSlide";
import MostExpensiveOrderSlide from "./MostExpensiveOrderSlide";
import EndSlide from "./EndSlide";
import SummaryCard from "./SummaryCard";
import SlideNavigator from "./SlideNavigator";
import OrdersOfBusiestDaySlide from "./OrdersOfBusiestDaySlide";
import VibeSlide from "./VibeSlide";

interface SlideConfig {
  element: ReactNode;
  duration: number; // milliseconds
}

export default function SlideShow({ stats }: { stats: any }) {
  const [current, setCurrent] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const timerRef = useRef<number | null>(null);
  const [vibe, setVibe] = useState<string | null>(null);
  const [colors, setColors] = useState<Record<string, string>>({});
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
  const [elapsedTime, setElapsedTime] = useState(0);

  const slideConfigs: SlideConfig[] = [
    { element: <IntroSlide key="intro" name={stats.recipient_name} isPlaying={isPlaying} />, duration: 8000 },
    { element: <TopItemsSlide key="top-items" itemCounts={stats.item_counts} isPlaying={isPlaying} />, duration: 8000 },
    { element: <TopRestaurantsSlide key="top-restaurants" restaurantCounts={stats.restaurant_counts} isPlaying={isPlaying} />, duration: 8000 },
    { element: <FavoriteRestaurant key="favorite-restaurant" uniqueCount={stats.unique_restaurants} restaurant={stats.top_restaurant.name} isPlaying={isPlaying} />, duration: 15000 },
    { 
      element: <BusiestDaySlide 
        key="busiest-day" 
        date={stats.busiest_day.date} 
        orderCount={stats.busiest_day.order_count} 
        isPlaying={isPlaying} 
      />, 
      duration: 8000 
    },
    { element: <OrdersOfBusiestDaySlide key="busiest-orders" orders={stats.busiest_day_orders} isPlaying={isPlaying} />, duration: 10000 },
    { element: <EarliestOrderSlide key="earliest-order" order={stats.earliest_order_by_time} isPlaying={isPlaying} />, duration: 7000 },
    { element: <LatestOrderSlide key="latest-order" order={stats.latest_order_by_time} isPlaying={isPlaying} />, duration: 7000 },
    { element: <MostExpensiveOrderSlide key="most-expensive" order={stats.most_expensive_order} isPlaying={isPlaying} />, duration: 7000 },
    { element: <VibeSlide key="vibe" vibe={vibe} colors={colors} isPlaying={isPlaying} />, duration: 15000 },
    { element: <EndSlide key="end" isPlaying={isPlaying} />, duration: 10000 },
    {
      element: (
        <div
          key="summary-card"
          className="h-screen w-full flex items-center justify-center bg-gradient-to-br from-white via-indigo-100 to-indigo-300"
        >
          <SummaryCard stats={stats} name={stats.recipient_name} />
        </div>
      ),
      duration: 10000,
    },
  ];

  const nextSlide = () => {
    clearInterval(timerRef.current!); // stop current timer
    setElapsedTime(0);                // reset elapsed time
    setProgress(0);                   // reset progress
    setCurrent((c) => Math.min(c + 1, slideConfigs.length - 1));
    setIsPlaying(true);               // make sure autoplay is ON
  };
  
  const prevSlide = () => {
    clearInterval(timerRef.current!);
    setElapsedTime(0);
    setProgress(0);
    setCurrent((c) => Math.max(c - 1, 0));
    setIsPlaying(true);
  };
  

  const startAutoplay = () => {
    clearInterval(timerRef.current!);

    if (!isPlaying || current >= slideConfigs.length - 1) {
      return;
    }

    const duration = slideConfigs[current].duration;
    const startTs = Date.now() - elapsedTime;

    timerRef.current = window.setInterval(() => {
      const currentElapsed = Date.now() - startTs;
      setElapsedTime(currentElapsed);

      const pct = Math.min(currentElapsed / duration, 1) * 100;
      setProgress(pct);

      if (currentElapsed >= duration) {
        clearInterval(timerRef.current!); // clear before advancing
        setElapsedTime(0);
        setProgress(0);
        setCurrent((c) => c + 1);
      }
    }, 50);
  };

  // When slide changes, reset progress
  useEffect(() => {
    setElapsedTime(0);
    setProgress(0);

    if (isPlaying) {
      startAutoplay();
    }
  }, [current]);

  // When playing/paused toggles
  useEffect(() => {
    if (isPlaying) {
      startAutoplay();
    } else {
      clearInterval(timerRef.current!);
    }
  }, [isPlaying]);

  useEffect(() => {
    async function fetchVibe() {
      try {
        const res = await fetch(`${BACKEND_URL}/api/generate-vibe`, { 
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ stats }),
        });
        const data = await res.json();
        setVibe(data.vibe || "");
        setColors(data.colors || {});
      } catch (err) {
        console.error("Error fetching vibe:", err);
      }
    }
    fetchVibe();
  }, [stats]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") nextSlide();
      if (e.key === "ArrowLeft") prevSlide();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      clearInterval(timerRef.current!);
    };
  }, []);

  const bind = useDrag(
    ({ movement: [mx], velocity: [vx], direction: [dx], last }) => {
      if (last && Math.abs(mx) > 50 && vx > 0.2) {
        dx < 0 ? nextSlide() : prevSlide();
      }
    },
    { axis: "x", filterTaps: true, threshold: 10 }
  );

  return (
    <div className="relative h-screen w-full overflow-hidden">
      {/* Progress Bar */}
      <div className="absolute top-0 left-0 w-full h-2 bg-white/10 z-50">
        <div
          className="h-full bg-white transition-all ease-linear"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Slides */}
      <div {...bind()} className="h-full w-full touch-pan-x">
        {slideConfigs[current].element}
      </div>

      <SlideNavigator
  current={current}
  total={slideConfigs.length}
  onNext={nextSlide}
  onPrev={prevSlide}
  setIsPlaying={setIsPlaying} // 👈 Add this
/>


      {/* Play/Pause */}
      <div className="absolute top-5 right-4 z-50">
        <button
          onClick={() => {
            setIsPlaying((p) => !p);
          }}
          className="bg-white/10 hover:bg-white/20 text-white font-semibold px-3 py-1 rounded transition"
        >
          {isPlaying ? "⏸" : "▶"}
        </button>
      </div>
    </div>
  );
}
