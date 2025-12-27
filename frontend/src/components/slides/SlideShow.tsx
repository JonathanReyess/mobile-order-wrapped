// src/components/slides/SlideShow.tsx
import { useEffect, useRef, useState, ReactNode } from "react";
import { useDrag } from "@use-gesture/react";
import { motion, AnimatePresence } from "framer-motion";

// Components
import IntroSlide from "./IntroSlide";
import TopItemsSlide from "./TopItemsSlide";
import UniqueOrderSlide from "./UniqueOrderSlide";
import TopRestaurantsSlide from "./TopRestaurantsSlide";
import FavoriteRestaurant from "./FavoriteRestaurantSlide";
import BusiestDaySlide from "./BusiestDaySlide";
import EarliestOrderSlide from "./EarliestOrderSlide";
import LatestOrderSlide from "./LatestOrderSlide";
import MostExpensiveOrderSlide from "./MostExpensiveOrderSlide";
import EndSlide from "./EndSlide";
import SummaryCard from "../ui/SummaryCard";
import SlideNavigator from "../layout/SlideNavigator";
import OrdersOfBusiestDaySlide from "./OrdersOfBusiestDaySlide";
import VibeSlide from "./VibeSlide";

// Hooks
import { useVibe } from "../../hooks/useVibe";

interface SlideConfig {
  element: ReactNode;
  duration: number;
}

export default function SlideShow({ stats }: { stats: any }) {
  const [current, setCurrent] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [elapsedTime, setElapsedTime] = useState(0);
  const timerRef = useRef<number | null>(null);

  // AI Vibe logic extracted to hook
  const { vibe, colors } = useVibe(stats);

  const slideConfigs: SlideConfig[] = [
    {
      element: (
        <IntroSlide
          key="intro"
          name={stats.recipient_name}
          isPlaying={isPlaying}
        />
      ),
      duration: 8000,
    },
    {
      element: (
        <UniqueOrderSlide
          totalUniqueItems={stats.total_unique_items}
          isPlaying={isPlaying}
        />
      ),
      duration: 7750,
    },
    {
      element: (
        <TopItemsSlide
          key="top-items"
          itemCounts={stats.item_counts}
          isPlaying={isPlaying}
        />
      ),
      duration: 12500,
    },
    {
      element: (
        <FavoriteRestaurant
          key="favorite-restaurant"
          uniqueCount={stats.unique_restaurants}
          restaurant={stats.top_restaurant.name}
          isPlaying={isPlaying}
        />
      ),
      duration: 14000,
    },
    {
      element: (
        <TopRestaurantsSlide
          key="top-restaurants"
          restaurantCounts={stats.restaurant_counts}
          isPlaying={isPlaying}
        />
      ),
      duration: 10000,
    },
    {
      element: (
        <BusiestDaySlide
          key="busiest-day"
          date={stats.busiest_day.date}
          orderCount={stats.busiest_day.order_count}
          isPlaying={isPlaying}
        />
      ),
      duration: 10000,
    },
    {
      element: (
        <OrdersOfBusiestDaySlide
          key="busiest-orders"
          orders={stats.busiest_day_orders.slice(0, 12)}
          isPlaying={isPlaying}
        />
      ),
      duration: Math.max(
        6000,
        Math.min(stats.busiest_day_orders.length, 12) * 1600
      ),
    },
    {
      element: (
        <EarliestOrderSlide
          key="earliest-order"
          order={stats.earliest_order_by_time}
          isPlaying={isPlaying}
        />
      ),
      duration: 7000,
    },
    {
      element: (
        <LatestOrderSlide
          key="latest-order"
          order={stats.latest_order_by_time}
          isPlaying={isPlaying}
        />
      ),
      duration: 7000,
    },
    {
      element: (
        <MostExpensiveOrderSlide
          key="most-expensive"
          order={stats.most_expensive_order}
          isPlaying={isPlaying}
        />
      ),
      duration: Math.max(
        16000,
        14000 + stats.most_expensive_order.items.length * 1250
      ),
    },
    {
      element: (
        <VibeSlide
          key="vibe"
          vibe={vibe}
          colors={colors}
          isPlaying={isPlaying}
        />
      ),
      duration: 15000,
    },
    {
      element: <EndSlide key="end" isPlaying={isPlaying} />,
      duration: 10000,
    },
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
    clearInterval(timerRef.current!);
    setElapsedTime(0);
    setProgress(0);
    setCurrent((c) => Math.min(c + 1, slideConfigs.length - 1));
    setIsPlaying(true);
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
    if (!isPlaying || current >= slideConfigs.length - 1) return;

    const duration = slideConfigs[current].duration;
    const startTs = Date.now() - elapsedTime;

    timerRef.current = window.setInterval(() => {
      const currentElapsed = Date.now() - startTs;
      setElapsedTime(currentElapsed);
      const pct = Math.min(currentElapsed / duration, 1) * 100;
      setProgress(pct);

      if (currentElapsed >= duration) {
        clearInterval(timerRef.current!);
        setElapsedTime(0);
        setProgress(0);
        setCurrent((c) => c + 1);
      }
    }, 50);
  };

  useEffect(() => {
    setElapsedTime(0);
    setProgress(0);
    if (isPlaying) startAutoplay();
  }, [current]);

  useEffect(() => {
    if (isPlaying) startAutoplay();
    else clearInterval(timerRef.current!);
  }, [isPlaying]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") nextSlide();
      if (e.key === "ArrowLeft") prevSlide();
      if (e.code === "Space") {
        e.preventDefault();
        setIsPlaying((p) => !p);
      }
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
    <div className="relative h-screen w-full overflow-hidden bg-black">
      {/* Continuous Progress Bar */}
      <div className="absolute top-0 left-0 w-full h-2 bg-white/10 z-50">
        <div
          className="h-full bg-white transition-all ease-linear"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Paused Overlay */}
      <AnimatePresence>
        {!isPlaying && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            // Changed items-center to items-end and added pb-32 to move it up from the very bottom
            className="absolute inset-0 bg-black/20 pointer-events-none flex items-end justify-center pb-32 z-40"
          ></motion.div>
        )}
      </AnimatePresence>

      {/* Slides Content */}
      <div {...bind()} className="h-full w-full touch-pan-x">
        {slideConfigs[current].element}
      </div>

      {/* Navigation UI */}
      <SlideNavigator
        current={current}
        total={slideConfigs.length}
        onNext={nextSlide}
        onPrev={prevSlide}
        setIsPlaying={setIsPlaying}
      />

      {/* Play/Pause Toggle */}
      <div className="absolute top-7 right-5 z-50">
        <button
          onClick={() => setIsPlaying((p) => !p)}
          className="w-10 h-10 flex items-center justify-center bg-white/20 hover:bg-white/30 text-white rounded-full backdrop-blur-md transition"
        >
          {isPlaying ? (
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="w-6 h-6"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path d="M10 9v6m4-6v6" strokeLinecap="round" />
            </svg>
          ) : (
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="w-6 h-6 ml-0.5"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path
                d="M14.752 11.168l-5.197-3.028A1 1 0 008 9.028v5.944a1 1 0 001.555.832l5.197-3.028a1 1 0 000-1.664z"
                strokeLinecap="round"
              />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}
