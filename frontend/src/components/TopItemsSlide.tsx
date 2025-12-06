import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Crown, Utensils } from "lucide-react";

// Define interfaces for type safety
interface ItemCount {
  count: number;
  item: string;
}

interface TopItemsSlideProps {
  itemCounts: ItemCount[];
  isPlaying: boolean;
}

export default function TopItemsSlide({
  itemCounts,
  isPlaying,
}: TopItemsSlideProps) {
  const topItems = [...itemCounts]
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const [step, setStep] = useState(0);

  // Animation Timing Logic
  const stepStartTime = useRef<number | null>(null);
  const elapsedTime = useRef<number>(0);
  const timerRef = useRef<number | null>(null);

  // Timing: 0: Intro text, 1: #1 Item, 2-5: The rest of the list
  // Slightly reduced delays
  const stepDelays = [650, 2100, 850, 850, 850, 850];

  useEffect(() => {
    function startTimerForStep() {
      if (step >= stepDelays.length) return;
      stepStartTime.current = Date.now();

      const remainingTime = stepDelays[step] - elapsedTime.current;

      timerRef.current = window.setTimeout(() => {
        setStep((prev) => prev + 1);
        elapsedTime.current = 0;
      }, remainingTime);
    }

    if (isPlaying) {
      startTimerForStep();
    } else {
      // Logic for PAUSE: Calculate elapsed time and clear the running timer
      if (stepStartTime.current !== null) {
        elapsedTime.current += Date.now() - stepStartTime.current;
        if (timerRef.current) clearTimeout(timerRef.current);
      }
    }

    // Cleanup: Clear the timer when the component unmounts or dependencies change
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isPlaying, step]);

  return (
    // Background: Dark, warm, dramatic gradient
    <div className="relative h-screen w-full overflow-hidden bg-gradient-to-br from-gray-950 via-red-900 to-yellow-950 text-white select-none">

      {/* Subtle Background Pattern - NO CHANGE */}
      <div className="absolute inset-0 z-0 opacity-20 bg-[radial-gradient(#ffffff33_1px,transparent_1px)] [background-size:20px_20px]"></div>

      {/* Main Content Container - SLIGHTLY REDUCED PADDING/MARGIN */}
      <div className="relative flex flex-col items-center justify-start h-full px-4 pt-10 pb-20 sm:pt-8">
        
        {/* Header Section - SLIGHTLY REDUCED FONT SIZES */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={step >= 0 ? { opacity: 1, y: 0 } : {}}
          className="text-center mb-6"
        >
          <h3 className="text-lg font-bold uppercase tracking-widest text-orange-400 drop-shadow-sm">
            The Heavy Hitters
          </h3>
          <h2 className="text-3xl md:text-4xl font-black italic tracking-tighter leading-none mt-1 drop-shadow-lg">
            TOP CRAVINGS
          </h2>
        </motion.div>

        {/* The G.O.A.T (Rank 1) - SLIGHTLY REDUCED MAX WIDTH, PADDING, AND FONT SIZES */}
        <div className="w-full max-w-xs flex flex-col gap-3"> 
          {topItems[0] && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
              animate={step >= 1 ? { opacity: 1, scale: 1, rotate: 0 } : { opacity: 0 }}
              transition={{ type: "spring", bounce: 0.4, duration: 0.8 }}
              className="relative w-full aspect-[2.5/1] bg-black/40 backdrop-blur-md border-2 border-yellow-500 rounded-2xl p-4 flex flex-col justify-between overflow-hidden shadow-[0_10px_30px_rgba(255,165,0,0.5)] mb-3"
            >
              {/* Corner Icon - SLIGHTLY REDUCED SIZE/OPACITY */}
              <div className="absolute top-0 right-0 p-2 opacity-5 text-yellow-500">
                <Utensils size={70} />
              </div>
              
              <div className="flex justify-between items-start z-10">
                 <div className="bg-yellow-500 text-black font-black px-2 py-0.5 rounded text-xs uppercase tracking-bold shadow-md">
                    #1 MOST ORDERED
                 </div>
                 {/* Icon - SLIGHTLY REDUCED SIZE */}
                 <Crown className="text-yellow-400 fill-yellow-400 animate-pulse" size={24} />
              </div>

              <div className="relative z-10">
                {/* Text - SLIGHTLY REDUCED FONT SIZE */}
                <div className="text-2xl md:text-3xl font-black leading-tight break-words line-clamp-2">
                  {topItems[0].item}
                </div>
                {/* Details - SLIGHTLY REDUCED FONT SIZE */}
{/* Details - SLIGHTLY REDUCED FONT SIZE */}
<div className="mt-0 text-orange-300 font-bold text-sm flex items-center gap-1.5">
                  <span>
                    {topItems[0].count}{' '}
                    {/* Conditional check: if count is 1, use 'order', otherwise use 'orders' */}
                    {topItems[0].count === 1 ? 'order' : 'orders'}
                  </span>
                  <span className="w-1 h-1 bg-white rounded-full"></span>
                  <span className="text-white/80 font-normal text-xs uppercase">obsessed much?</span>
                </div>
              </div>
            </motion.div>
          )}

          {/* Runners Up (Rank 2-5) - SLIGHTLY REDUCED GAP, PADDING, SIZE, AND FONT */}
          <div className="flex flex-col gap-4 w-full">
            {topItems.slice(1).map((item, idx) => {
               const actualRank = idx + 2; 
               const show = step >= actualRank; 

               return (
                <motion.div
                  key={item.item}
                  initial={{ opacity: 0, x: -50 }}
                  animate={show ? { opacity: 1, x: 0 } : { opacity: 0 }}
                  transition={{ type: "spring", stiffness: 200, delay: 0.1 * idx }}
                  className="flex items-center gap-3 bg-white/5 backdrop-blur-sm rounded-lg p-4 pr-4 border border-white/10 shadow-lg"
                >
                  {/* Rank Circle - SLIGHTLY REDUCED SIZE/FONT */}
                  <div className="flex-shrink-0 w-10 h-10 bg-red-700/60 rounded-full flex items-center justify-center font-black text-base font-mono border border-red-500/30">
                    {actualRank}
                  </div>
                  
                  {/* Item Name - SLIGHTLY REDUCED FONT */}
                  <div className="flex-grow min-w-0">
                    <div className="font-bold text-md truncate leading-tight">
                      {item.item}
                    </div>
                  </div>

                  {/* Count - SLIGHTLY REDUCED FONT */}
                  <div className="flex-shrink-0 text-center">
                    <div className="font-black text-base text-orange-400">{item.count}</div>
                    <div className="text-xs text-white/70">
                      {/* Conditional check */}
                      {item.count === 1 ? 'order' : 'orders'}
                    </div>
                  </div>
                </motion.div>
               );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}