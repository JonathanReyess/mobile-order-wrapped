import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Crown } from "lucide-react";

const FAST_TYPING_DURATION = 1500;

// --- REVISED COMPONENT: Typing Text Effect ---
const TypingText = ({
  text,
  typingDuration,
  isVisible,
}: {
  text: string;
  typingDuration: number;
  isVisible: boolean;
}) => {
  const [displayedText, setDisplayedText] = useState("");
  const currentStepRef = useRef(0);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isVisible) {
      setDisplayedText("");
      currentStepRef.current = 0;
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      return;
    }

    let startTime: number | null = null;
    const interval = typingDuration / text.length;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const targetStep = Math.min(text.length, Math.floor(elapsed / interval));

      if (targetStep > currentStepRef.current) {
        currentStepRef.current = targetStep;
        setDisplayedText(text.substring(0, targetStep));
      }

      if (elapsed < typingDuration) {
        animationFrameRef.current = requestAnimationFrame(animate);
      } else {
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
    <div className="text-center font-bold italic text-3xl text-white drop-shadow-md py-4">
      {isVisible ? (
        <>
          {displayedText}
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
        <div style={{ minHeight: "3rem" }}></div>
      )}
    </div>
  );
};
// -----------------------------------------

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
  const stepStartTime = useRef<number | null>(null);
  const elapsedTime = useRef<number>(0);
  const timerRef = useRef<number | null>(null);

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
      if (stepStartTime.current !== null) {
        elapsedTime.current += Date.now() - stepStartTime.current;
        if (timerRef.current) clearTimeout(timerRef.current);
      }
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isPlaying, step]);

  const showRunnersUp = step >= 1;
  const showTypingText = step === 2;
  const showRank1 = step >= 3;

  const runnerUpGradients = [
    "linear-gradient(175deg, #f8fafc 0%, #e2e8f0 100%)",
    "linear-gradient(175deg, #f8fafc 0%, #e2e8f0 100%)",
    "linear-gradient(175deg, #f8fafc 0%, #e2e8f0 100%)",
    "linear-gradient(175deg, #f8fafc 0%, #e2e8f0 100%)",
  ];
  const runnerUpAccents = ["#003087", "#003087", "#003087", "#003087"];

  return (
    <div className="relative h-screen w-full overflow-hidden text-white select-none">
      <motion.div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/lines.png')" }}
        initial={{ clipPath: "inset(0 0 100% 0)" }}
        animate={{ clipPath: "inset(0 0 0% 0)" }}
        transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
      />

      <div className="relative z-10 flex flex-col items-center justify-start h-full px-4 pt-10 pb-20 sm:pt-12 bg-black/40">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={step >= 0 ? { opacity: 1, y: 0 } : {}}
          className="text-center mb-8"
        >
          <h2 className="text-4xl md:text-5xl font-black italic tracking-tighter leading-none drop-shadow-lg">
            TOP CRAVINGS
          </h2>
        </motion.div>

        {/* Increased max-width from max-w-xs to max-w-md for larger runners-up banners */}
        <div className="w-full max-w-md flex flex-col items-center gap-6">
          {/* Runners-Up Banners */}
          <div className="flex flex-row gap-4 w-full px-2">
            {topItems.slice(1).map((item, idx) => {
              const actualRank = idx + 2;
              return (
                <motion.div
                  key={item.item}
                  initial={{ opacity: 0, y: -50, rotateX: 45 }}
                  animate={
                    showRunnersUp
                      ? { opacity: 1, y: 0, rotateX: 0 }
                      : { opacity: 0, y: -50, rotateX: 45 }
                  }
                  transition={{
                    type: "spring",
                    stiffness: 150,
                    damping: 14,
                    delay: 0.2 * idx,
                  }}
                  style={{ transformOrigin: "top center" }}
                  className="flex-1 flex flex-col items-center"
                >
                  {/* Suspension Hardware */}
                  <div className="relative flex flex-col items-center w-full">
                    {/* Larger Nail */}
                    <div className="w-2 h-2 rounded-full bg-slate-300 shadow-[0_1px_2px_rgba(0,0,0,0.5)] z-20 absolute -top-1" />
                    {/* Strings */}
                    <svg
                      className="w-full h-5 absolute top-0"
                      preserveAspectRatio="none"
                    >
                      <line
                        x1="50%"
                        y1="0"
                        x2="15%"
                        y2="100%"
                        stroke="rgba(255,255,255,0.4)"
                        strokeWidth="1.5"
                      />
                      <line
                        x1="50%"
                        y1="0"
                        x2="85%"
                        y2="100%"
                        stroke="rgba(255,255,255,0.4)"
                        strokeWidth="1.5"
                      />
                    </svg>
                    {/* Horizontal Hanging Rod */}
                    <div className="w-[110%] h-2 rounded-full bg-gradient-to-b from-slate-200 to-slate-500 shadow-md z-10 mt-4" />
                  </div>

                  {/* Banner Body with Drop Shadow wrapper */}
                  <div
                    className="w-full -mt-0.5"
                    style={{
                      filter: "drop-shadow(0px 8px 6px rgba(0,0,0,0.4))",
                    }}
                  >
                    <div
                      className="w-full relative"
                      style={{
                        clipPath:
                          "polygon(0 0, 100% 0, 100% 87%, 50% 100%, 0 87%)",
                        background: runnerUpGradients[idx],
                        paddingBottom: "22px",
                      }}
                    >
                      {/* Fabric Lighting Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-r from-black/5 via-white/50 to-black/5 pointer-events-none" />

                      {/* Stitched Top Border */}
                      <div
                        className="w-full h-2 border-b-2 border-dashed"
                        style={{
                          background: runnerUpAccents[idx],
                          borderColor: "rgba(255,255,255,0.4)",
                        }}
                      />

                      {/* Scaled up text and spacing */}
                      <div className="relative flex flex-col items-center text-center px-1.5 pt-3 pb-2 gap-1 z-10">
                        <div
                          className="font-black text-sm leading-none shadow-sm"
                          style={{ color: runnerUpAccents[idx] }}
                        >
                          #{actualRank}
                        </div>
                        <div
                          className="w-6 h-px"
                          style={{ background: runnerUpAccents[idx] + "50" }}
                        />
                        <div className="text-[#0a1628] font-black text-xs leading-tight break-words text-center line-clamp-4 px-0.5">
                          {item.item}
                        </div>
                        <div className="text-[#003087]/80 text-[10px] font-bold mt-1">
                          {item.count}×
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          <TypingText
            text="drumroll please 🥁..."
            typingDuration={FAST_TYPING_DURATION}
            isVisible={showTypingText}
          />

          {/* G.O.A.T — Rank 1 Championship Banner */}
          {topItems[0] && (
            <motion.div
              initial={{ opacity: 0, y: -80, rotateX: 30 }}
              animate={
                showRank1
                  ? { opacity: 1, y: 0, rotateX: 0 }
                  : { opacity: 0, y: -80, rotateX: 30 }
              }
              transition={{ type: "spring", stiffness: 120, damping: 12 }}
              style={{ width: "240px", transformOrigin: "top center" }} // Increased from 180px to 240px
              className="flex flex-col items-center"
            >
              {/* Grand Hardware */}
              <div className="relative flex flex-col items-center w-full">
                {/* Big Nail */}
                <div className="w-3 h-3 rounded-full bg-slate-300 shadow-[0_2px_4px_rgba(0,0,0,0.6)] z-20 absolute -top-1" />
                {/* Thick Strings */}
                <svg
                  className="w-full h-8 absolute top-0"
                  preserveAspectRatio="none"
                >
                  <line
                    x1="50%"
                    y1="0"
                    x2="10%"
                    y2="100%"
                    stroke="rgba(255,255,255,0.7)"
                    strokeWidth="2"
                  />
                  <line
                    x1="50%"
                    y1="0"
                    x2="90%"
                    y2="100%"
                    stroke="rgba(255,255,255,0.7)"
                    strokeWidth="2"
                  />
                </svg>
                {/* Heavy Rod */}
                <div className="w-[108%] h-3.5 rounded-full bg-gradient-to-b from-gray-200 via-gray-400 to-gray-600 shadow-lg z-10 mt-6" />
              </div>

              {/* #1 Banner Body with Drop Shadow */}
              <div
                className="w-full -mt-0.5"
                style={{ filter: "drop-shadow(0px 12px 10px rgba(0,0,0,0.5))" }}
              >
                <div
                  className="w-full relative"
                  style={{
                    clipPath: "polygon(0 0, 100% 0, 100% 88%, 50% 100%, 0 88%)",
                    background:
                      "linear-gradient(170deg, #f8fafc 0%, #d6e4ff 100%)",
                    paddingBottom: "32px",
                  }}
                >
                  {/* Fabric Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-r from-black/10 via-white/60 to-black/10 pointer-events-none" />

                  {/* Heavy Stitched Top Border */}
                  <div className="w-full h-3 bg-[#003087] border-b-[3px] border-dashed border-white/30" />

                  {/* Scaled up text and spacing */}
                  <div className="relative flex flex-col items-center text-center px-5 pt-5 pb-2 gap-2 z-10">
                    <Crown
                      className="text-[#003087] fill-[#003087]/20 drop-shadow-sm"
                      size={36}
                    />
                    <div className="text-[#003087] text-xs font-black uppercase tracking-[0.2em] mt-1">
                      #1 Most Ordered
                    </div>
                    <div className="w-16 h-px bg-[#003087]/30 my-1 shadow-sm" />
                    <div className="text-[#0a1628] font-black text-xl leading-tight break-words text-center line-clamp-3 drop-shadow-sm">
                      {topItems[0].item}
                    </div>
                    <div className="text-[#003087]/80 font-bold text-sm mt-2">
                      {topItems[0].count}
                      {topItems[0].count === 1 ? " order" : " orders"}
                    </div>
                    <div className="text-[#003087]/50 font-bold text-[10px] uppercase tracking-wider mb-1">
                      obsessed much?
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
