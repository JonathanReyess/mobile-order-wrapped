import { useEffect, useLayoutEffect, useRef, useState, useCallback } from "react";
import { motion } from "framer-motion";
import Lottie from "lottie-react";
import { gsap } from "gsap";
import "../../styles/_intro.scss";

// Convert "2025-04-05 11:34 PM" → "April 5 at 11:34 PM"
function formatToMonthDayTime(dateStr: string) {
  const [datePart, timePart, meridiem] = dateStr.split(" ");
  const [year, month, day] = datePart.split("-").map(Number);
  const [hourStr, minuteStr] = timePart.split(":");
  let hour = Number(hourStr);
  const minute = Number(minuteStr);

  if (meridiem === "PM" && hour !== 12) hour += 12;
  if (meridiem === "AM" && hour === 12) hour = 0;

  const dateObj = new Date(year, month - 1, day, hour, minute);

  const monthDay = dateObj.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
  });
  const time = dateObj.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });

  return `${monthDay} at ${time}`;
}

export default function MostExpensiveOrderSlide({
  order,
  isPlaying,
}: {
  order?: {
    order_time?: string;
    total?: number;
    transaction_id?: string;
    filename?: string;
    items?: { name: string }[];
  };
  isPlaying: boolean;
}) {
  if (!order || !order.order_time || typeof order.total !== "number") {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-black text-white px-4">
        <p className="text-2xl">⚠️ No “most expensive” order found.</p>
      </div>
    );
  }

  const formattedDateTime = formatToMonthDayTime(order.order_time);
  const firstPart = `You spent $${order.total.toFixed(2)} on ${formattedDateTime}. `;
  const secondPart =
    order.total > 15
      ? "Now that’s what we call a splurge!"
      : "You're a savvy spender — we respect the frugality!";
  const whatDidYouOrderTitle = "What did you order?";
  const orderedItems = order.items?.map((item) => item.name) || [];

  // Load Lottie animation from public folder
  const [moneyAnimation, setMoneyAnimation] = useState<object | null>(null);
  useEffect(() => {
    fetch("/3D Money Icon.json")
      .then((r) => r.json())
      .then(setMoneyAnimation);
  }, []);

  // Step control
  const [step, setStep] = useState(0);
  const [idx1, setIdx1] = useState(0);
  const [idx2, setIdx2] = useState(0);
  const [idx3, setIdx3] = useState(0);
  const [idx4, setIdx4] = useState(0);

  const stepStartTime = useRef<number | null>(null);
  const elapsedTime = useRef<number>(0);
  const timerRef = useRef<number | null>(null);
  const itemStartTime = useRef<number | null>(null);
  const itemElapsedTime = useRef<number>(0);
  const itemTimerRef = useRef<number | null>(null);

  // Zig-zag panel animation
  const NUM_PANELS = 10;
  const bgRef = useRef<HTMLDivElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== "undefined" ? window.innerWidth : 0,
    height: typeof window !== "undefined" ? window.innerHeight : 0,
  });

  const setupZigZag = useCallback(() => {
    if (!bgRef.current) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    tlRef.current?.kill();

    const { width, height } = windowSize;
    const stripH = height / NUM_PANELS;
    const gradient =
      "linear-gradient(105deg, rgba(173,216,230,1) 0%, rgba(100,149,237,1) 6%, rgba(0,100,255,1) 19%, rgba(0,51,153,1) 72%, rgba(0,0,0,1) 100%)";
    const panels = bgRef.current.querySelectorAll<HTMLElement>(".zz-panel");

    panels.forEach((panel, i) => {
      const fromLeft = i % 2 === 0;
      gsap.set(panel, {
        position: "absolute",
        top: i * stripH,
        left: 0,
        width,
        height: stripH,
        x: fromLeft ? -width : width,
        opacity: 0,
        background: gradient,
      });
    });

    const tl = gsap.timeline({ repeat: -1, paused: true });
    tlRef.current = tl;

    // Slide in from alternating sides
    panels.forEach((panel, i) => {
      const fromLeft = i % 2 === 0;
      tl.fromTo(
        panel,
        { x: fromLeft ? -width : width, opacity: 0 },
        { x: 0, opacity: 0.85, duration: 0.7, ease: "power3.out" },
        i * 0.07,
      );
    });

    // Hold, then slide back out the same side
    tl.to(
      panels,
      {
        x: (_i, el) => {
          const i = Array.from(panels).indexOf(el as HTMLElement);
          const fromLeft = i % 2 === 0;
          return fromLeft ? -width : width;
        },
        opacity: 0,
        duration: 0.6,
        ease: "power2.in",
        stagger: 0.06,
      },
      "+=4",
    );
  }, [windowSize]);

  useLayoutEffect(() => {
    setupZigZag();
    const handleResize = () =>
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      tlRef.current?.kill();
    };
  }, [setupZigZag]);

  useEffect(() => {
    if (!tlRef.current) return;
    isPlaying ? tlRef.current.play() : tlRef.current.pause();
  }, [isPlaying]);

  // Step Delays (manual calculations: base delay + typing time + pauses)
  const stepDelays = [
    1250, // After title
    firstPart.length * 50 + 800, // Typing first line + pause
    secondPart.length * 50 + 2500, // Typing second line + pause
    whatDidYouOrderTitle.length * 60 + 1000, // Typing title + pause
    orderedItems.length * 1250 + 1000, // Typing items slowly + pause
  ];

  useEffect(() => {
    function startTimerForStep() {
      if (step >= stepDelays.length) return; // No more steps
      stepStartTime.current = Date.now();

      const remainingTime = stepDelays[step] - elapsedTime.current;

      timerRef.current = window.setTimeout(() => {
        setStep((prev) => prev + 1);
        elapsedTime.current = 0; // Reset elapsed once step completes
      }, remainingTime);
    }

    if (isPlaying) {
      startTimerForStep();
    } else {
      if (stepStartTime.current !== null) {
        elapsedTime.current += Date.now() - stepStartTime.current;
        clearTimeout(timerRef.current!);
      }
    }

    return () => {
      clearTimeout(timerRef.current!);
    };
  }, [isPlaying, step]);

  // Typing Effects
  useEffect(() => {
    if (step !== 1 || !isPlaying) return;
    const interval = window.setInterval(() => {
      setIdx1((prev) => {
        if (prev < firstPart.length) return prev + 1;
        clearInterval(interval);
        return prev;
      });
    }, 50);
    return () => clearInterval(interval);
  }, [step, isPlaying, firstPart.length]);

  useEffect(() => {
    if (step !== 2 || !isPlaying) return;
    const interval = window.setInterval(() => {
      setIdx2((prev) => {
        if (prev < secondPart.length) return prev + 1;
        clearInterval(interval);
        return prev;
      });
    }, 50);
    return () => clearInterval(interval);
  }, [step, isPlaying, secondPart.length]);

  useEffect(() => {
    if (step !== 3 || !isPlaying) return;
    const interval = window.setInterval(() => {
      setIdx4((prev) => {
        if (prev < whatDidYouOrderTitle.length) return prev + 1;
        clearInterval(interval);
        return prev;
      });
    }, 60);
    return () => clearInterval(interval);
  }, [step, isPlaying, whatDidYouOrderTitle.length]);

  useEffect(() => {
    if (step !== 4) return;

    function startItemTimer() {
      if (idx3 >= orderedItems.length) return; // Done
      itemStartTime.current = Date.now();

      const remainingTime = 1250 - itemElapsedTime.current;

      itemTimerRef.current = window.setTimeout(() => {
        setIdx3((prev) => prev + 1);
        itemElapsedTime.current = 0;
      }, remainingTime);
    }

    if (isPlaying) {
      startItemTimer();
    } else {
      if (itemStartTime.current !== null) {
        itemElapsedTime.current += Date.now() - itemStartTime.current;
        clearTimeout(itemTimerRef.current!);
      }
    }

    return () => clearTimeout(itemTimerRef.current!);
  }, [isPlaying, idx3, step, orderedItems.length]);

  return (
    <div className="relative h-screen w-full flex flex-col items-center justify-center bg-black text-white px-4 overflow-hidden">
      {/* Zig-zag panel background */}
      <div ref={bgRef} className="absolute inset-0 pointer-events-none z-0">
        {Array.from({ length: NUM_PANELS }).map((_, i) => (
          <div key={i} className="zz-panel" />
        ))}
      </div>

      {/* Lottie money icon */}
      <motion.div
        className="relative z-10 w-36 h-36"
        initial={{ opacity: 0, scale: 0.6 }}
        animate={
          step >= 0 ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.6 }
        }
        transition={{ duration: 0.6, type: "spring", bounce: 0.4 }}
      >
        {moneyAnimation && <Lottie animationData={moneyAnimation} loop />}
      </motion.div>

      {/* Title */}
      <motion.h2
        className="relative z-10 text-3xl md:text-5xl uppercase font-arc leading-none drop-shadow-xl mb-5"
        initial={{ opacity: 0, y: 40 }}
        animate={step >= 0 ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
        transition={{ duration: 1 }}
      >
        Most Expensive Order
      </motion.h2>

      {/* Typing Main Paragraph */}
      {step >= 1 && (
        <motion.p
          className="relative z-10 text-lg md:text-2xl text-center max-w-xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          {firstPart.slice(0, idx1)}
          {step >= 2 && secondPart.slice(0, idx2)}
        </motion.p>
      )}

      {/* Typing "What did you order?" */}
      {step >= 3 && (
        <motion.p
          className="relative z-10 mt-4 text-2xl md:text-3xl font-arc italic text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          {whatDidYouOrderTitle.slice(0, idx4)}
        </motion.p>
      )}

      {/* Typing Ordered Items */}
      {step >= 4 && (
        <motion.ul
          className="relative z-10 mt-2 list-disc list-inside text-lg md:text-xl text-center max-w-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          {orderedItems.slice(0, idx3).map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </motion.ul>
      )}
    </div>
  );
}
