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


  

  const slideConfigs: SlideConfig[] = [
    { element: <IntroSlide key="intro" name={stats.recipient_name} />, duration: 8000 },
    { element: <TopItemsSlide key="top-items" itemCounts={stats.item_counts} />, duration: 8000 },
    { element: <TopRestaurantsSlide key="top-restaurants" restaurantCounts={stats.restaurant_counts} />, duration: 8000 },
    { element: <FavoriteRestaurant key="favorite-restaurant" uniqueCount={stats.unique_restaurants} restaurant={stats.top_restaurant.name} />, duration: 15000 },
    { element: <BusiestDaySlide key="busiest-day" date={stats.busiest_day.date} orderCount={stats.busiest_day.order_count} />, duration: 8000 },
    { element: <OrdersOfBusiestDaySlide key="busiest-orders" orders={stats.busiest_day_orders} />, duration: 10000},
    { element: <EarliestOrderSlide key="earliest-order" order={stats.earliest_order_by_time} />, duration: 7000 },
    { element: <LatestOrderSlide key="latest-order" order={stats.latest_order_by_time} />, duration: 7000 },
    { element: <MostExpensiveOrderSlide key="most-expensive" order={stats.most_expensive_order} />, duration: 7000 },
        // 👇 Insert your Gemini-powered Vibe slide here
    { element: <VibeSlide key="vibe" vibe={vibe} colors={colors} />, duration: 15000 },


    { element: <EndSlide key="end" />, duration: 7000 },
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
    setCurrent((c) => Math.min(c + 1, slideConfigs.length - 1));
    setProgress(0);
    startAutoplay();
  };
  const prevSlide = () => {
    setCurrent((c) => Math.max(c - 1, 0));
    setProgress(0);
    startAutoplay();
  };

  const startAutoplay = () => {
    clearInterval(timerRef.current!);
    if (!isPlaying || current >= slideConfigs.length - 1) {
      setProgress(0);
      return;
    }

    const duration = slideConfigs[current].duration;
    const startTs = Date.now();

    timerRef.current = window.setInterval(() => {
      const elapsed = Date.now() - startTs;
      const pct = Math.min(elapsed / duration, 1) * 100;
      setProgress(pct);

      if (elapsed >= duration) {
        setProgress(0);
        setCurrent((c) => c + 1);
      }
    }, 50);
  };

  useEffect(() => {
    if (current >= slideConfigs.length - 1) {
      clearInterval(timerRef.current!);
      setProgress(0);
    } else {
      startAutoplay();
    }
  }, [current, isPlaying]);

  useEffect(() => {
    async function fetchVibe() {
      try {
        const res = await fetch("http://localhost:5000/api/generate-vibe", { 
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
      />

      {/* Play/Pause */}
      <div className="absolute top-5 right-4 z-50">
        <button
          onClick={() => {
            setIsPlaying((p) => !p);
            setProgress(0);
          }}
          className="bg-white/10 hover:bg-white/20 text-white font-semibold px-3 py-1 rounded transition"
        >
          {isPlaying ? "⏸" : "▶"}
        </button>
      </div>
    </div>
  );
}
