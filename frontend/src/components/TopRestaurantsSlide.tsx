import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Crown, Utensils } from "lucide-react";

// Define interfaces for type safety
interface RestaurantCount {
  name: string;
  count: number;
}

interface TopRestaurantsSlideProps {
  restaurantCounts: Record<string, number>;
  isPlaying: boolean;
}

export default function TopRestaurantsSlide({
  restaurantCounts,
  isPlaying,
}: TopRestaurantsSlideProps) {
  // Convert object to array of { name, count } and sort for top 5
  const topRestaurants: RestaurantCount[] = Object.entries(restaurantCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const [step, setStep] = useState(0);

  // Animation Timing Logic - Adopted from the inspirational slide
  const stepStartTime = useRef<number | null>(null);
  const elapsedTime = useRef<number>(0);
  const timerRef = useRef<number | null>(null);

  // Timing: 0: Intro text, 1: #1 Restaurant, 2-5: The rest of the list
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

  // --- Theming Variables (Reverting colors back to blue/cyan) ---
  const primaryColor = "text-cyan-400"; // For main highlights
  const accentColor = "text-cyan-500";  // For borders/icons
  const rankBackgroundColor = "bg-blue-700/60"; // For rank circles
  const rankBorderColor = "border-blue-500/30";
  const mainGradient = "bg-gradient-to-tl from-cyan-950 via-gray-900 to-blue-900";

  return (
    // Background: Original Blue/Cyan gradient
    <div className={`relative h-screen w-full overflow-hidden ${mainGradient} text-white select-none`}>

      {/* Subtle Background Pattern - Using a blue-tinted pattern */}
      <div className="absolute inset-0 z-0 opacity-20 bg-[radial-gradient(#8080ff33_1px,transparent_1px)] [background-size:20px_20px]"></div>

      {/* Main Content Container */}
      <div className="relative flex flex-col items-center justify-start h-full px-4 pt-10 pb-20 sm:pt-8">
        
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={step >= 0 ? { opacity: 1, y: 0 } : {}}
          className="text-center mb-6"
        >
          <h3 className="text-lg font-bold uppercase tracking-widest text-cyan-400 drop-shadow-sm">
            My Culinary Journey
          </h3>
          <h2 className="text-3xl md:text-4xl font-black italic tracking-tighter leading-none mt-1 drop-shadow-lg">
            TOP DINING SPOTS
          </h2>
        </motion.div>

{/* The G.O.A.T (Rank 1) */}
<div className="w-full max-w-xs flex flex-col gap-3"> 
          {topRestaurants[0] && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
              animate={step >= 1 ? { opacity: 1, scale: 1, rotate: 0 } : { opacity: 0 }}
              transition={{ type: "spring", bounce: 0.4, duration: 0.8 }}
              // Changed border/shadow to use accentColor (cyan)
              className={`relative w-full aspect-[2.5/1] bg-black/40 backdrop-blur-md border-2 border-cyan-500 rounded-2xl p-4 flex flex-col justify-between overflow-hidden shadow-[0_10px_30px_rgba(0,255,255,0.5)] mb-3`}
            >
              {/* Corner Icon */}
              <div className="absolute top-0 right-0 p-2 opacity-5 text-cyan-500">
                <Utensils size={70} />
              </div>
              
              <div className="flex justify-between items-start z-10">
                 {/* Changed background color to use accentColor (cyan) */}
                 <div className="bg-cyan-500 text-black font-black px-2 py-0.5 rounded text-xs uppercase tracking-bold shadow-md">
                    #1 MOST VISITED
                 </div>
                 {/* Icon color changed to cyan */}
                 <Crown className="text-cyan-400 fill-cyan-400 animate-pulse" size={24} />
              </div>

              <div className="relative z-10">
                {/* *** ADJUSTMENT FOR FIT: ***
                  1. Reduced font size: text-2xl md:text-3xl -> text-xl md:text-2xl 
                  2. Increased line clamp: line-clamp-2 -> line-clamp-3 
                */}
                <div className="text-xl md:text-xl font-black leading-tight break-words line-clamp-3">
                  {topRestaurants[0].name}
                </div>
                
                {/* Details line */}
                <div className="mt-0 text-cyan-300 font-bold text-sm flex items-center gap-1.5">
    {/* CHANGE HERE: Removed stacking and added pluralization check inline */}
    <span>
      {topRestaurants[0].count}{' '}
      {/* Conditional check: if count is 1, use 'visit', otherwise use 'visits' */}
      {topRestaurants[0].count === 1 ? 'visit' : 'visits'}
    </span>

    <span className="w-1 h-1 bg-white rounded-full"></span>
    <span className="text-white/80 font-normal text-xs uppercase">DO YOU LIVE HERE?</span>
  </div>
</div>
            </motion.div>
          )}

          {/* Runners Up (Rank 2-5) */}
          <div className="flex flex-col gap-4 w-full">
            {topRestaurants.slice(1).map((restaurant, idx) => {
               const actualRank = idx + 2; 
               const show = step >= actualRank; 

               return (
                <motion.div
                  key={restaurant.name}
                  initial={{ opacity: 0, x: -50 }}
                  animate={show ? { opacity: 1, x: 0 } : { opacity: 0 }}
                  transition={{ type: "spring", stiffness: 200, delay: 0.1 * idx }}
                  // Main card style from original was cyan-900/40, kept the blur/border structure
                  className="flex items-center gap-3 bg-cyan-900/40 backdrop-blur-sm rounded-lg p-4 pr-4 border border-cyan-800/80 shadow-lg"
                >
                  {/* Rank Circle - Used blue colors */}
                  <div className={`flex-shrink-0 w-10 h-10 ${rankBackgroundColor} rounded-full flex items-center justify-center font-black text-base font-mono ${rankBorderColor}`}>
                    {actualRank}
                  </div>
                  
                  {/* Item Name */}
                  <div className="flex-grow min-w-0">
                    <div className="font-bold text-md truncate leading-tight">
                      {restaurant.name}
                    </div>
                  </div>

                  {/* Count - Used primaryColor (cyan-400) */}
                  <div className="flex-shrink-0 text-center"> 
                    <div className={`font-black text-base ${primaryColor}`}>{restaurant.count}</div>
                    <div className="text-xs text-white/70">
                      {/* Pluralization Check: added conditional logic */}
                      {restaurant.count === 1 ? 'visit' : 'visits'}
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