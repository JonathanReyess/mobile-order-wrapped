import React, {
  useEffect,
  useRef,
  useState,
  useLayoutEffect,
  useCallback,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import { gsap } from "gsap";
import "../../styles/_intro.scss";

// --- Utility Functions ---
function formatToMonthDay(dateStr: string) {
  const [year, month, day] = dateStr.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  if (isNaN(date.getTime()))
    return { formatted: "Invalid date", monthName: "" };

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

interface BusiestDaySlideProps {
  date: string;
  orderCount: number;
  isPlaying: boolean;
}

const NUMBER_OF_PANELS = 14;

const BusiestDaySlide: React.FC<BusiestDaySlideProps> = ({
  date,
  orderCount,
  isPlaying,
}) => {
  const { formatted, monthName } = formatToMonthDay(date);
  const monthColorClass = getMonthColor(monthName);

  const line1 =
    orderCount === 1
      ? `Only ${orderCount} order in one day?`
      : `${orderCount} orders in one day!`;
  const line2 =
    orderCount === 1 ? `Is everything okay?` : `Was that all you?...`;

  const [step, setStep] = useState(0);
  const [idxLine1, setIdxLine1] = useState(0);
  const [idxLine2, setIdxLine2] = useState(0);
  const [line1Finished, setLine1Finished] = useState(false);
  const [localIsTyping, setLocalIsTyping] = useState(false);
  const [typingPhase, setTypingPhase] = useState<1 | 2>(1);
  const [line2Finished, setLine2Finished] = useState(false);

  const stepStartTime = useRef<number | null>(null);
  const elapsedTime = useRef<number>(0);
  const timerRef = useRef<number | null>(null);
  const typeIntervalRef = useRef<number | null>(null);

  const bgRef = useRef<HTMLDivElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);

  // Window size hook exactly from IntroSlide
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== "undefined" ? window.innerWidth : 0,
    height: typeof window !== "undefined" ? window.innerHeight : 0,
  });

  const stepDelays = [600, 2200, 2200];

  // --- Foreground Step & Typing Logic ---
  useEffect(() => {
    function startTimerForStep() {
      if (step >= stepDelays.length) return;
      stepStartTime.current = Date.now();
      const remainingTime = stepDelays[step] - elapsedTime.current;
      timerRef.current = window.setTimeout(() => {
        if (step < stepDelays.length - 1) setStep((prev) => prev + 1);
        else if (step === stepDelays.length - 1) setLocalIsTyping(true);
        elapsedTime.current = 0;
      }, remainingTime);
    }
    if (isPlaying) startTimerForStep();
    else if (stepStartTime.current !== null) {
      elapsedTime.current += Date.now() - stepStartTime.current;
      if (timerRef.current) clearTimeout(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isPlaying, step]);

  useEffect(() => {
    if (!isPlaying || !localIsTyping) return;
    if (!line1Finished) {
      typeIntervalRef.current = window.setInterval(() => {
        setIdxLine1((i) => {
          if (i >= line1.length) {
            if (typeIntervalRef.current) clearInterval(typeIntervalRef.current);
            setLine1Finished(true);
            return i;
          }
          return i + 1;
        });
      }, 50);
    } else {
      timerRef.current = window.setTimeout(() => {
        setTypingPhase(2);
        typeIntervalRef.current = window.setInterval(() => {
          setIdxLine2((i) => {
            if (i >= line2.length) {
              if (typeIntervalRef.current)
                clearInterval(typeIntervalRef.current);
              timerRef.current = window.setTimeout(
                () => setLine2Finished(true),
                2000,
              );
              return i;
            }
            return i + 1;
          });
        }, 50);
      }, 1000);
    }
    return () => {
      if (typeIntervalRef.current) clearInterval(typeIntervalRef.current);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isPlaying, localIsTyping, line1Finished]);

  // --- Vertical Pyramid Animation using IntroSlide Panels ---
  const setupAnimation = useCallback(() => {
    if (!bgRef.current) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    tlRef.current?.kill();

    const { width, height } = windowSize;
    const maxReach = height * 0.4;
    const elHeight = maxReach / NUMBER_OF_PANELS;

    const panels1 = bgRef.current.querySelectorAll<HTMLElement>(".panel1");
    const panels2 = bgRef.current.querySelectorAll<HTMLElement>(".panel2");

    // Exact gradient from IntroSlide
    const getBrandGradient = (stop: number | string = 100) =>
      `linear-gradient(105deg, rgba(173,216,230,1) 0%, rgba(100,149,237,1) 6%, rgba(0,100,255,1) 19%, rgba(0,51,153,1) 72%, rgba(0,0,0,1) ${stop}%)`;

    const tl = gsap.timeline({ repeat: 0, paused: true });
    tlRef.current = tl;

    // Set initial states for panel1 (Top Pyramid)
    gsap.set(panels1, {
      background: getBrandGradient(100),
      position: "absolute",
      left: "50%",
      xPercent: -50,
      opacity: 0,
      top: 0,
    });

    // Set initial states for panel2 (Bottom Pyramid)
    gsap.set(panels2, {
      background: getBrandGradient(100),
      position: "absolute",
      left: "50%",
      xPercent: -50,
      opacity: 0,
      bottom: 0,
    });

    // Top Panels Drop Down
    panels1.forEach((panel, i) => {
      // Step the width down to create the pyramid shape
      const pWidth = width - i * (width / 16);
      const delay = i * 0.1;

      tl.fromTo(
        panel,
        { y: -elHeight * 2, width: pWidth, height: elHeight, opacity: 0 },
        { y: i * elHeight, opacity: 1, duration: 1.2, ease: "power3.out" },
        delay,
      );
    });

    // Bottom Panels Rise Up
    panels2.forEach((panel, i) => {
      const pWidth = width - i * (width / 16);
      const delay = i * 0.1;

      tl.fromTo(
        panel,
        { y: elHeight * 2, width: pWidth, height: elHeight, opacity: 0 },
        { y: -i * elHeight, opacity: 1, duration: 1.2, ease: "power3.out" },
        delay,
      );
    });

    // Hold formation, then retract straight back
    tl.to(
      panels1,
      {
        y: -elHeight * 2,
        opacity: 0,
        duration: 0.8,
        ease: "power2.in",
        stagger: -0.05,
      },
      "+=7",
    );
    tl.to(
      panels2,
      {
        y: elHeight * 2,
        opacity: 0,
        duration: 0.8,
        ease: "power2.in",
        stagger: -0.05,
      },
      "<",
    );
  }, [windowSize]);

  useLayoutEffect(() => {
    setupAnimation();
    const handleResize = () =>
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      tlRef.current?.kill();
    };
  }, [setupAnimation]);

  useEffect(() => {
    if (!tlRef.current) return;
    isPlaying ? tlRef.current.play() : tlRef.current.pause();
  }, [isPlaying]);

  return (
    <div className="relative h-screen w-full overflow-hidden bg-black text-white font-sans">
      {/* Background Pyramids */}
      <div ref={bgRef} className="absolute inset-0 pointer-events-none z-0">
        {Array.from({ length: NUMBER_OF_PANELS }).map((_, i) => (
          <div key={`p1-${i}`} className="panel1" />
        ))}
        {Array.from({ length: NUMBER_OF_PANELS }).map((_, i) => (
          <div key={`p2-${i}`} className="panel2" />
        ))}
      </div>

      {/* Centered Text */}
      <div className="relative z-20 flex items-center justify-center h-full px-6">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="title"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -24 }}
              transition={{ duration: 0.4 }}
              className="text-center"
            >
              <h2 className="text-4xl md:text-5xl font-black uppercase italic text-white">
                My Busiest Day
              </h2>
            </motion.div>
          )}

          {step === 2 && !localIsTyping && (
            <motion.div
              key="date"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -24 }}
              transition={{ duration: 0.4 }}
              className="text-center"
            >
              <p className="text-5xl md:text-6xl font-black text-white">
                {formatted}
              </p>
            </motion.div>
          )}

          {localIsTyping && typingPhase === 1 && (
            <motion.div
              key="line1"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -24 }}
              transition={{ duration: 0.4 }}
              className="text-center"
            >
              <p className="text-3xl md:text-4xl font-bold text-white leading-snug">
                {line1.slice(0, idxLine1)}
              </p>
            </motion.div>
          )}

          {localIsTyping && typingPhase === 2 && !line2Finished && (
            <motion.div
              key="line2"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -24 }}
              transition={{ duration: 0.4 }}
              className="text-center"
            >
              <p className="text-3xl md:text-4xl font-bold text-white leading-snug">
                {line2.slice(0, idxLine2)}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default BusiestDaySlide;
