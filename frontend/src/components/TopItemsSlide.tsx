import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Crown } from "lucide-react";

// FIX 1: Define FAST_TYPING_DURATION outside of the components 
// This constant is needed in the parent component's render function.
const FAST_TYPING_DURATION = 1500; 

// --- REVISED COMPONENT: Typing Text Effect ---
const TypingText = ({ 
  text, 
  typingDuration, 
  isVisible 
}: { 
  text: string; 
  typingDuration: number; 
  // FIX 2: Removed totalStepDuration from prop definition and type
  isVisible: boolean 
}) => {
  const [displayedText, setDisplayedText] = useState("");
  const currentStepRef = useRef(0);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isVisible) {
      // FIX 3 (TypeScript Error 2554): Added "" argument to setDisplayedText
      setDisplayedText(""); 
      currentStepRef.current = 0;
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      return;
    }

    // Start typing
    let startTime: number | null = null;
    const interval = typingDuration / text.length; 

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;

      // Calculate how many characters should be displayed based on elapsed time vs typingDuration
      const targetStep = Math.min(
        text.length,
        Math.floor(elapsed / interval)
      );

      if (targetStep > currentStepRef.current) {
        currentStepRef.current = targetStep;
        setDisplayedText(text.substring(0, targetStep));
      }

      // Continue animation only for the duration of the typing itself
      if (elapsed < typingDuration) {
        animationFrameRef.current = requestAnimationFrame(animate);
      } else {
        // Ensure the full text is displayed after the typing duration is over
        setDisplayedText(text);
      }
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [text, typingDuration, isVisible]); 

  return (
    <div className="text-center font-bold italic text-2xl text-yellow-400 drop-shadow-md py-4">
      {isVisible ? (
        <>
          {displayedText}
          {/* Flashing cursor effect: Only show cursor WHILE text is being typed */}
          {displayedText.length < text.length && (
            <motion.span
              animate={{ opacity: [1, 0] }}
              transition={{ duration: 0.5, repeat: Infinity }}
              className="ml-1"
            >
              |
            </motion.span>
          )}
        </>
      ) : (
        <div style={{ minHeight: '3rem' }}></div> 
      )}
    </div>
  );
};
// -----------------------------------------


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

  // New step definition:
  // 0: Initial/Header Text
  // 1: Ranks 2-5 (simultaneous appearance)
  // 2: Typing Text effect (Fast typing + long pause)
  // 3: Rank 1 appears
  const [step, setStep] = useState(0);

  // Animation Timing Logic
  const stepStartTime = useRef<number | null>(null);
  const elapsedTime = useRef<number>(0);
  const timerRef = useRef<number | null>(null);

  // Timing Delays for new steps:
  // stepDelays[0]: Header -> Ranks 2-5 start (1000ms)
  // stepDelays[1]: Ranks 2-5 finish -> Typing Text starts (4500ms pause, long enough for staggered ranks to finish)
  // stepDelays[2]: Typing Text Total Time (e.g., 4500ms for 1500ms typing + 3000ms pause)
  const stepDelays = [1000, 4500, 4500]; 

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

  // Determine visibility logic
  const showRunnersUp = step >= 1; 
  const showTypingText = step === 2;
  const showRank1 = step >= 3;

  return (
    // Background: Dark, warm, dramatic gradient
    <div className="relative h-screen w-full overflow-hidden bg-gradient-to-br from-[#311616] via-red-900 to-yellow-600 text-white select-none">

 
      {/* Main Content Container */}
      <div className="relative flex flex-col items-center justify-start h-full px-4 pt-10 pb-20 sm:pt-8">
        
        {/* Header Section */}
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

        {/* The G.O.A.T (Rank 1) Container */}
        <div className="w-full max-w-xs flex flex-col gap-3"> 
          {topItems[0] && (
            <motion.div
              // Use showRank1 for animation logic
              initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
              animate={showRank1 ? { opacity: 1, scale: 1, rotate: 0 } : { opacity: 0 }}
              transition={{ type: "spring", bounce: 0.4, duration: 1.0 }}
              className="relative w-full aspect-[2.5/1] bg-black/40 backdrop-blur-md border-2 border-yellow-500 rounded-2xl p-4 flex flex-col justify-between overflow-hidden shadow-[0_10px_30px_rgba(255,165,0,0.5)] mb-3"
            >
              <div className="flex justify-between items-start z-10">
                 <div className="bg-yellow-500 text-black font-black px-2 py-0.5 rounded text-xs uppercase tracking-bold shadow-md">
                    #1 MOST ORDERED
                 </div>
                 <Crown className="text-yellow-400 fill-yellow-400 animate-pulse" size={24} />
              </div>

              <div className="relative z-10">
                <div className="text-2xl md:text-3xl font-black leading-tight break-words line-clamp-2">
                  {topItems[0].item}
                </div>
                <div className="mt-0 text-orange-300 font-bold text-sm flex items-center gap-1.5">
                  <span>
                    {topItems[0].count}{' '}
                    {topItems[0].count === 1 ? 'order' : 'orders'}
                  </span>
                  <span className="w-1 h-1 bg-white rounded-full"></span>
                  <span className="text-white/80 font-normal text-xs uppercase">obsessed much?</span>
                </div>
              </div>
            </motion.div>
          )}

          {/* Runners Up (Rank 2-5) and Typing Text */}
          <div className="flex flex-col gap-4 w-full">
            {topItems.slice(1).map((item, idx) => {
               const actualRank = idx + 2; 
               const show = showRunnersUp; 

               return (
                <motion.div
                  key={item.item}
                  initial={{ opacity: 0, x: -50 }}
                  animate={show ? { opacity: 1, x: 0 } : { opacity: 0 }}
                  transition={{ 
                    type: "spring", 
                    stiffness: 300, 
                    delay: 1.0 * idx // 1.0s stagger between ranks 2-5
                  }}
                  className="flex items-center gap-3 bg-white/5 backdrop-blur-sm rounded-lg p-4 pr-4 border border-white/10 shadow-lg"
                >
                  <div className="flex-shrink-0 w-10 h-10 bg-red-700/60 rounded-full flex items-center justify-center font-black text-base font-mono border border-red-500/30">
                    {actualRank}
                  </div>
                  
                  <div className="flex-grow min-w-0">
                    <div className="font-bold text-md truncate leading-tight">
                      {item.item}
                    </div>
                  </div>

                  <div className="flex-shrink-0 text-center">
                    <div className="font-black text-base text-orange-400">{item.count}</div>
                    <div className="text-xs text-white/70">
                      {item.count === 1 ? 'order' : 'orders'}
                    </div>
                  </div>
                </motion.div>
               );
            })}
            
            {/* --- TYPING TEXT --- */}
            <TypingText 
              text="drumroll please 🥁..." 
              typingDuration={FAST_TYPING_DURATION} 
              // Removed totalStepDuration prop to fix TypeScript warning
              isVisible={showTypingText} 
            />
            {/* ------------------- */}

          </div>
        </div>

      </div>
    </div>
  );
}