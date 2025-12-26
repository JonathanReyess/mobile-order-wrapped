import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { Calendar, ShoppingBag } from "lucide-react";

// --- Utility Functions ---

function formatToMonthDay(dateStr: string) {
  const [year, month, day] = dateStr.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  if (isNaN(date.getTime())) return { formatted: "Invalid date", monthName: "" };

  const monthName = date.toLocaleDateString("en-US", { month: "long" });
  const formatted = date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
  });

  return { formatted, monthName };
}

function getMonthColor(month: string) {
  const colors: Record<string, string> = {
    January: "text-sky-300",
    February: "text-pink-300",
    March: "text-[#34c230]",
    April: "text-yellow-300",
    May: "text-[#e1c4ff]",
    June: "text-[#E2DFD2]",
    July: "text-orange-300",
    August: "text-amber-400",
    September: "text-rose-300",
    October: "text-indigo-400",
    November: "text-amber-500",
    December: "text-[#248721]",
  };
  return colors[month] || "text-white";
}

// --- Component Interface ---
interface BusiestDaySlideProps {
  date: string;
  orderCount: number;
  isPlaying: boolean;
}

const BusiestDaySlide: React.FC<BusiestDaySlideProps> = ({
  date,
  orderCount,
  isPlaying,
}) => {
  const { formatted, monthName } = formatToMonthDay(date);
  const monthColorClass = getMonthColor(monthName);
  
// Define the content for line 1 based on orderCount
const line1 = 
  orderCount == 1 
    ? `Only ${orderCount} order in one day?` 
    : `${orderCount} orders in one day!`;

// Define the content for line 2 based on orderCount
const line2 = 
  orderCount == 1 
    ? `Is everything okay?` 
    : `Was that all you?...`;
    
  // --- Animation State ---
const [step, setStep] = useState(0); 
const [idxLine1, setIdxLine1] = useState(0); 
const [idxLine2, setIdxLine2] = useState(0); 
const [line1Finished, setLine1Finished] = useState(false); 
const [localIsTyping, setLocalIsTyping] = useState(false); 

  // --- Timing Logic ---
  const stepStartTime = useRef<number | null>(null);
  const elapsedTime = useRef<number>(0);
  const timerRef = useRef<number | null>(null);
  const typeIntervalRef = useRef<number | null>(null);

  const stepDelays = [200, 1500, 1500, 2000, 500];

  useEffect(() => {
    function startTimerForStep() {
      if (step >= stepDelays.length) return;
      stepStartTime.current = Date.now();

      const remainingTime = stepDelays[step] - elapsedTime.current;

      timerRef.current = window.setTimeout(() => {
        if (step < stepDelays.length - 1) { 
          setStep((prev) => prev + 1);
        } else if (step === stepDelays.length - 1) { 
          setLocalIsTyping(true);
        }
        elapsedTime.current = 0;
      }, remainingTime);
    }

    if (isPlaying) {
      startTimerForStep();
    } else {
      if (stepStartTime.current !== null) {
        elapsedTime.current += Date.now() - stepStartTime.current;
        if (timerRef.current) clearTimeout(timerRef.current);
      }
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isPlaying, step]);

// Typing Effect Logic
useEffect(() => {
  if (!isPlaying || !localIsTyping) return; 

  // Logic for typing Line 1
  if (!line1Finished) {
    typeIntervalRef.current = window.setInterval(() => {
      setIdxLine1((i) => {
        if (i >= line1.length) {
          if (typeIntervalRef.current) clearInterval(typeIntervalRef.current);
          setLine1Finished(true); // Line 1 is done
          setIdxLine2(0); 
          return i;
        }
        return i + 1;
      });
    }, 50);
  } 
  
  // Logic for typing Line 2 (starts only after Line 1 is finished)
  else {
    const delayBeforeLine2 = 1000; 
    
    // Use setTimeout to wait for the delayBeforeLine2 duration
    timerRef.current = window.setTimeout(() => {
      typeIntervalRef.current = window.setInterval(() => {
        setIdxLine2((i) => {
          if (i >= line2.length) {
            if (typeIntervalRef.current) clearInterval(typeIntervalRef.current);
            return i;
          }
          return i + 1;
        });
      }, 50); 
    }, delayBeforeLine2); // The waiting period
  }

  // Cleanup for both setInterval and setTimeout
  return () => {
    if (typeIntervalRef.current) clearInterval(typeIntervalRef.current);
    if (timerRef.current) clearTimeout(timerRef.current);
  };
}, [isPlaying, localIsTyping, line1, line2, line1Finished]);


  // --- Variants ---
  const scaleUp: Variants = {
    hidden: { scale: 0.8, opacity: 0, y: 20 },
    visible: { scale: 1, opacity: 1, y: 0, transition: { type: "spring", bounce: 0.4 } },
  };

  const slideIn: Variants = {
    hidden: { x: -50, opacity: 0 },
    visible: { x: 0, opacity: 1, transition: { type: "spring", stiffness: 200 } },
  };

  return (
    <div 
      className="relative h-screen w-full overflow-hidden bg-gradient-to-tr from-gray-900 via-indigo-900 to-fuchsia-600 text-white select-none font-sans"
    >
      
      {/* Floating Ambient Shapes */}

      <motion.div 
        animate={{ y: [0, 30, 0], opacity: [0.2, 0.5, 0.2] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -bottom-8 -left-8 w-56 h-56 bg-fuchsia-400 rounded-full blur-[80px] mix-blend-screen pointer-events-none opacity-40"
      />

      {/* --- Main Content --- */}
      <div className="relative flex flex-col items-center justify-center h-full px-4 py-8">
        
        {/* Step 1: Title */}
        <div className="h-20 flex items-center justify-center mb-6 w-full">
           <AnimatePresence>
             {step >= 1 && (
               <motion.div
                 variants={slideIn}
                 initial="hidden"
                 animate="visible"
                 className="text-center"
               >
                 {/* Badge */}
                 <div className="inline-flex items-center justify-center gap-1 bg-white/10 backdrop-blur-sm px-3 py-0.5 rounded-full border border-white/20 mb-2 shadow-lg">
                    <Calendar size={12} className="text-yellow-300" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-yellow-100">THE BIG BINGE</span>
                 </div>
                 {/* Title */}
                 <h2 className="text-3xl md:text-4xl font-bold tracking-tighter uppercase leading-none drop-shadow-xl">
                  {/* FIX: Move the italic class onto the span where the text resides */}
                  <span className="italic">My Busiest Day</span>
                 </h2>
               </motion.div>
             )}
           </AnimatePresence>
        </div>

        {/* Step 2: The Date Card */}
        <div className="flex-1 mt-5 w-full flex flex-col items-center justify-start gap-6">
          {step >= 2 && (
            <motion.div
              variants={scaleUp}
              initial="hidden"
              animate="visible"
              className="relative w-full aspect-square max-w-[200px] bg-white text-gray-900 rounded-2xl p-4 flex flex-col items-center justify-center shadow-[0_15px_40px_-10px_rgba(0,0,0,0.5)] rotate-2 border-3 border-gray-200"
            >
              <div className="absolute top-3 left-1/2 -translate-x-1/2 w-8 h-1.5 bg-gray-100 rounded-full" />
              
              {/* Month name */}
              <span className="text-lg font-bold uppercase tracking-widest text-gray-400 mb-1">
                {monthName}
              </span>
              {/* Day number */}
              <span className={`text-[5rem] leading-none font-black tracking-tighter ${monthColorClass.replace('text-', 'text-opacity-80 text-') || 'text-indigo-600'}`}>
                {formatted.split(' ')[1]}
              </span>
              {/* Decorative Sticker reduced in size */}
              <div className="absolute -bottom-3 -right-3 bg-fuchsia-500 text-white w-12 h-12 rounded-full flex items-center justify-center font-black text-lg rotate-12 shadow-md border-2 border-white">
                 !!
              </div>
            </motion.div>
          )}

          {/* Step 3: Stats */}
          {step >= 3 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="flex flex-col items-center gap-3 w-full"
            >
               {/* Order Count Stat */}
               <div className="flex items-center mt-5 gap-4 w-full max-w-[180px]"> 
                 <div className="flex-1 bg-black/20 backdrop-blur-sm rounded-xl p-3 border border-white/10 flex flex-col items-center justify-center">
                    <ShoppingBag size={25} className="text-yellow-300 mb-1" />
                    <span className="text-3xl font-black">{orderCount}</span>
                    <span className="text-[12px] uppercase font-bold opacity-60">Orders</span>
                 </div>
               </div>

<div className="h-16 mt-5"> 
  {localIsTyping && (
    <div className="text-center">
      {/* Line 1 Typing */}
      <p className="text-3xl mb-3 font-medium text-yellow-200">
        {line1.slice(0, idxLine1)}
      </p>
      
      {/* Line 2 Typing (Only appears after Line 1 is finished typing) */}
      {line1Finished && (
         <p className="text-3xl font-medium text-yellow-200">
           {line2.slice(0, idxLine2)}
         </p>
      )}
    </div>
  )}
</div>    </motion.div>
          )}
        </div>

      </div>

    </div>
  );
};

export default BusiestDaySlide;