import {
  useState,
  useEffect,
  useRef,
  useLayoutEffect,
  useCallback,
} from "react";
import { motion } from "framer-motion";
import { Crown } from "lucide-react";
import { gsap } from "gsap";

// Define interfaces for type safety
interface RestaurantCount {
  name: string;
  count: number;
}

interface TopRestaurantsSlideProps {
  restaurantCounts: Record<string, number>;
  isPlaying: boolean;
}

// --- TUNNEL CONFIGURATION ---
const NUMBER_OF_LAYERS = 20;
// INCREASED: from 6 to 12. This makes the zoom effect twice as slow.
const TUNNEL_DURATION = 18;

export default function TopRestaurantsSlide({
  restaurantCounts,
  isPlaying,
}: TopRestaurantsSlideProps) {
  const topRestaurants: RestaurantCount[] = Object.entries(restaurantCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const [step, setStep] = useState(0);

  // --- Card Animation Timing Logic ---
  const stepStartTime = useRef<number | null>(null);
  const elapsedTime = useRef<number>(0);
  const timerRef = useRef<number | null>(null);

  // INCREASED: These delays (in milliseconds) control when the next card appears.
  // I increased them by 50% to give the viewer more time to read.
  const stepDelays = [1500, 3000, 1500, 1500, 1500, 1500];

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
    } else if (stepStartTime.current !== null) {
      elapsedTime.current += Date.now() - stepStartTime.current;
      if (timerRef.current) clearTimeout(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isPlaying, step]);

  // --- FLAWLESS GEOMETRIC TUNNEL GSAP LOGIC ---
  const bgRef = useRef<HTMLDivElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const rotateTlRef = useRef<gsap.core.Tween | null>(null);

  const setupAnimation = useCallback(() => {
    if (!bgRef.current) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    tlRef.current?.kill();
    rotateTlRef.current?.kill();

    const layers = bgRef.current.querySelectorAll(".tunnel-layer");

    // Reset initial state to center
    gsap.set(layers, {
      xPercent: -50,
      yPercent: -50,
      top: "50%",
      left: "50%",
      scale: 0.001,
      opacity: 0,
    });

    // Create a master timeline
    const masterTl = gsap.timeline({ paused: true });
    tlRef.current = masterTl;

    const staggerOffset = TUNNEL_DURATION / NUMBER_OF_LAYERS;

    // Attach an independent, infinitely repeating timeline to every single layer
    layers.forEach((layer, i) => {
      const layerTl = gsap.timeline({ repeat: -1 });

      // Phase 1: Fade in very slowly
      layerTl.to(layer, {
        scale: 0.05,
        opacity: 1,
        duration: TUNNEL_DURATION * 0.25,
        ease: "none",
      });

      // Phase 2: Zoom past the camera and fade out
      layerTl.to(layer, {
        scale: 12,
        opacity: 0,
        duration: TUNNEL_DURATION * 0.75,
        ease: "expo.in",
      });

      // Add it to the master timeline, offset by the mathematically perfect stagger amount
      masterTl.add(layerTl, i * staggerOffset);
    });

    // Fast-forward the master timeline to the exact moment the tunnel is fully populated
    masterTl.time(TUNNEL_DURATION);

    // Continuous rotation
    rotateTlRef.current = gsap.to(bgRef.current, {
      rotation: 360,
      // INCREASED: from 120 to 240. This makes the corkscrew rotation twice as slow.
      duration: 120,
      repeat: 0,
      ease: "none",
      paused: true,
    });
  }, []);

  useLayoutEffect(() => {
    setupAnimation();
    return () => {
      tlRef.current?.kill();
      rotateTlRef.current?.kill();
    };
  }, [setupAnimation]);

  useEffect(() => {
    if (!tlRef.current || !rotateTlRef.current) return;
    if (isPlaying) {
      tlRef.current.play();
      rotateTlRef.current.play();
    } else {
      tlRef.current.pause();
      rotateTlRef.current.pause();
    }
  }, [isPlaying]);

  const primaryColor = "text-cyan-400";
  const rankBackgroundColor = "bg-blue-700/60";
  const rankBorderColor = "border-blue-500/30";

  return (
    <div className="relative h-screen w-full overflow-hidden bg-black text-white select-none">
      {/* 1. INFINITE GEOMETRIC ZOOM TUNNEL BACKGROUND */}
      <div
        ref={bgRef}
        className="absolute inset-0 pointer-events-none z-0 origin-center scale-[1.5]"
      >
        {Array.from({ length: NUMBER_OF_LAYERS }).map((_, i) => (
          <div
            key={`tunnel-${i}`}
            className="tunnel-layer absolute w-[80vw] md:w-[60vw] aspect-square flex items-center justify-center p-[4vw] md:p-[3vw]"
            style={{
              background:
                "linear-gradient(105deg, rgba(173,216,230,1) 0%, rgba(100,149,237,1) 6%, rgba(0,100,255,1) 19%, rgba(0,51,153,1) 72%, rgba(0,0,0,1) 100%)",
            }}
          >
            {/* The negative space center of the tunnel layer */}
            <div className="w-full h-full bg-black shadow-[inset_0_0_80px_rgba(0,0,0,0.95)]" />
          </div>
        ))}
      </div>

      {/* 2. Subtle Grid Pattern Overlay */}
      <div className="absolute inset-0 z-0 opacity-20 bg-[radial-gradient(#8080ff33_1px,transparent_1px)] [background-size:20px_20px]" />

      {/* 3. Main Content Container */}
      <div className="relative z-10 flex flex-col items-center justify-start h-full px-4 pt-10 pb-20 sm:pt-8 w-full">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={step >= 0 ? { opacity: 1, y: 0 } : {}}
          className="text-center mb-6"
        >
          <h2 className="text-3xl md:text-4xl font-black italic tracking-tighter leading-none mt-1 drop-shadow-lg">
            TOP DINING SPOTS
          </h2>
        </motion.div>

        {/* The G.O.A.T (Rank 1) */}
        <div className="w-full max-w-xs flex flex-col gap-3">
          {topRestaurants[0] && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
              animate={
                step >= 1 ? { opacity: 1, scale: 1, rotate: 0 } : { opacity: 0 }
              }
              transition={{ type: "spring", bounce: 0.4, duration: 0.8 }}
              className={`relative w-full aspect-[2.5/1] bg-black/60 backdrop-blur-md border-2 border-cyan-500 rounded-2xl p-4 flex flex-col justify-between overflow-hidden shadow-[0_10px_30px_rgba(0,255,255,0.3)] mb-3`}
            >
              <div className="flex justify-between items-start z-10">
                <div className="bg-cyan-500 text-black font-black px-2 py-0.5 rounded text-xs uppercase tracking-bold shadow-md">
                  #1 MOST VISITED
                </div>
                <Crown
                  className="text-cyan-400 fill-cyan-400 animate-pulse"
                  size={24}
                />
              </div>

              <div className="relative z-10">
                <div className="text-xl md:text-xl font-black leading-tight break-words line-clamp-3">
                  {topRestaurants[0].name}
                </div>

                <div className="mt-0 text-cyan-300 font-bold text-sm flex items-center gap-1.5">
                  <span>
                    {topRestaurants[0].count}{" "}
                    {topRestaurants[0].count === 1 ? "visit" : "visits"}
                  </span>
                  <span className="w-1 h-1 bg-white rounded-full"></span>
                  <span className="text-white/80 font-normal text-xs uppercase">
                    DO YOU LIVE HERE?
                  </span>
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
                  transition={{
                    type: "spring",
                    stiffness: 200,
                    delay: 0.1 * idx,
                  }}
                  className="flex items-center gap-3 bg-blue-950/70 backdrop-blur-md rounded-lg p-4 pr-4 border border-cyan-800/80 shadow-lg"
                >
                  <div
                    className={`flex-shrink-0 w-10 h-10 ${rankBackgroundColor} rounded-full flex items-center justify-center font-black text-base font-mono ${rankBorderColor}`}
                  >
                    {actualRank}
                  </div>

                  <div className="flex-grow min-w-0">
                    <div className="font-bold text-md truncate leading-tight">
                      {restaurant.name}
                    </div>
                  </div>

                  <div className="flex-shrink-0 text-center">
                    <div className={`font-black text-base ${primaryColor}`}>
                      {restaurant.count}
                    </div>
                    <div className="text-xs text-white/70">
                      {restaurant.count === 1 ? "visit" : "visits"}
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
