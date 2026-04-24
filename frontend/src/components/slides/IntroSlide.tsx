import {
  useState,
  useEffect,
  useRef,
  useLayoutEffect,
  useCallback,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import { gsap } from "gsap";
import "../../styles/_intro.scss";

interface IntroSlideProps {
  name?: string;
  isPlaying: boolean;
  onComplete?: () => void;
}

const NUMBER_OF_PANELS = 12;
const ROTATION_COEF = 5;

const IntroSlide = ({ name, isPlaying, onComplete }: IntroSlideProps) => {
  const [step, setStep] = useState(0);
  const stepStartTime = useRef<number | null>(null);
  const elapsedTime = useRef<number>(0);
  const timerRef = useRef<number | null>(null);
  const stepDelays = [1500, 4500];

  const bgRef = useRef<HTMLDivElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== "undefined" ? window.innerWidth : 0,
    height: typeof window !== "undefined" ? window.innerHeight : 0,
  });

  // Text step timer
  useEffect(() => {
    function startTimerForStep() {
      if (step >= stepDelays.length) {
        onComplete?.();
        return;
      }
      stepStartTime.current = Date.now();
      const remaining = stepDelays[step] - elapsedTime.current;
      timerRef.current = window.setTimeout(() => {
        setStep((s) => s + 1);
        elapsedTime.current = 0;
      }, remaining);
    }

    if (isPlaying) {
      startTimerForStep();
    } else if (stepStartTime.current !== null) {
      elapsedTime.current += Date.now() - stepStartTime.current;
      clearTimeout(timerRef.current!);
    }
    return () => clearTimeout(timerRef.current!);
  }, [isPlaying, step, onComplete]);

  const setupAnimation = useCallback(() => {
    if (!bgRef.current) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    tlRef.current?.kill();

    const { width, height } = windowSize;
    const elHeight = height / NUMBER_OF_PANELS;
    const elWidth = width / NUMBER_OF_PANELS;

    const panels = bgRef.current.querySelectorAll<HTMLElement>(".panel1");
    const secondaryPanels =
      bgRef.current.querySelectorAll<HTMLElement>(".panel2");

    // Unified gradient function based on your specific requirements
    const getBrandGradient = (stop: number | string = 100) =>
      `linear-gradient(105deg, rgba(173,216,230,1) 0%, rgba(100,149,237,1) 6%, rgba(0,100,255,1) 19%, rgba(0,51,153,1) 72%, rgba(0,0,0,1) ${stop}%)`;

    // Initial setup for panel1s
    panels.forEach((panel, i) => {
      const wi = width - elWidth * (12 - i) + elWidth;
      const he = height - elHeight * (12 - i) + elHeight;
      gsap.set(panel, {
        x: -elWidth / 1.2 + ((12 - i) * elWidth) / 1.2,
        y: -elHeight / 6 + ((12 - i) * elHeight) / 6,
        width: wi,
        height: he,
        rotation: 12 * ROTATION_COEF - (i + 1) * ROTATION_COEF + 360,
        background: getBrandGradient(100),
        opacity: 1,
      });
    });

    const tl = gsap.timeline({ repeat: -1, paused: true });
    tlRef.current = tl;

    tl.addLabel("splitStart", 0);

    panels.forEach((panel, i) => {
      const wi = width - elWidth * (12 - i) + elWidth;
      const he = height - elHeight * (12 - i) + elHeight;

      // --- Panel2 animations (secondary panels) ---
      if (i === 0) {
        secondaryPanels.forEach((twoPanel, index) => {
          const wi2 = width - elWidth * index + elWidth;

          tl.fromTo(
            twoPanel,
            {
              y: elHeight * 5.5,
              x: elWidth * 5.5,
              width: 0,
              height: 0,
              rotation: -360,
              background: getBrandGradient(100),
            },
            {
              rotation: -90,
              y: (index * elHeight) / 4 - wi2,
              x: -elWidth / 2 + (index * elWidth) / 2,
              width: wi2,
              height: wi2,
              background: getBrandGradient(100),
              ease: "sine.inOut",
              duration: 1,
            },
            `splitStart+=${0.05 * index}`,
          );
          tl.to(
            twoPanel,
            {
              rotation: 12 * ROTATION_COEF - (12 - index) * ROTATION_COEF - 90,
              duration: 5,
              background: getBrandGradient(100),
              ease: "linear",
            },
            ">",
          );
          tl.to(
            twoPanel,
            {
              rotation: 300,
              y: (index * elHeight) / 2 - wi2,
              x: width * 1.1 - wi2 * 1.2,
              width: wi2,
              height: wi2,
              background: getBrandGradient(100),
              ease: "sine.inOut",
              duration: 1,
            },
            ">",
          );
          tl.to(
            twoPanel,
            {
              rotation: "+=15",
              duration: 5,
              background: getBrandGradient(100),
              ease: "linear",
            },
            ">",
          );
          tl.to(
            twoPanel,
            {
              rotation: "+=360",
              y: `-=${wi2 * 2}`,
              x: `+=${wi2 * 2}`,
              width: wi2,
              height: wi2,
              background: getBrandGradient(100),
              ease: "sine.inOut",
              duration: 1,
            },
            ">",
          );
        });
      }

      // --- Panel1 exit animations ---
      if (i === 0) {
        tl.fromTo(
          panel,
          {
            x: -elWidth / 1.2 + (12 * elWidth) / 1.2,
            y: -elHeight / 6 + (12 * elHeight) / 6,
            width: width - elWidth * 12 + elWidth,
            height: height - elHeight * 12 + elHeight,
            rotation: 12 * ROTATION_COEF - ROTATION_COEF + 360,
            background: getBrandGradient(100),
            opacity: 1,
          },
          {
            rotation: 720 + 90,
            y: height - (12 * elHeight) / 4,
            x: -elWidth / 2 + (12 * elWidth) / 2,
            width: 0,
            height: 0,
            opacity: 0,
            background: getBrandGradient(100),
            ease: "sine.inOut",
            duration: 1,
          },
          "splitStart",
        );
      } else {
        tl.fromTo(
          panel,
          {
            x: -elWidth / 1.2 + ((12 - i) * elWidth) / 1.2,
            y: -elHeight / 6 + ((12 - i) * elHeight) / 6,
            width: wi,
            height: he,
            rotation: 12 * ROTATION_COEF - (i + 1) * ROTATION_COEF + 360,
            background: getBrandGradient(100),
            opacity: 1,
          },
          {
            rotation: 720 + 90,
            y: height - ((12 - i) * elHeight) / 4,
            x: -elWidth / 2 + ((12 - i) * elWidth) / 2,
            width: wi,
            height: wi,
            background: getBrandGradient(100),
            ease: "sine.inOut",
            duration: 1,
          },
          `splitStart+=${0.05 * i}`,
        );
        tl.to(
          panel,
          {
            rotation:
              (12 * ROTATION_COEF - (i + 1) * ROTATION_COEF) / 1.2 + 810,
            duration: 5,
            background: getBrandGradient(100),
            ease: "linear",
          },
          ">",
        );
        tl.to(
          panel,
          {
            y: height - ((12 - i) * elHeight) / 2,
            x: 0 - elWidth * 1.2,
            rotation:
              (12 * ROTATION_COEF - (i + 1) * ROTATION_COEF) / 1.2 + 1180,
            ease: "sine.inOut",
            duration: 1,
            background: getBrandGradient(100),
          },
          ">",
        );
        tl.to(
          panel,
          {
            rotation:
              (12 * ROTATION_COEF - (i + 1) * ROTATION_COEF) / 1.2 + 1200,
            duration: 5,
            background: getBrandGradient(100),
            ease: "linear",
          },
          ">",
        );
        tl.to(
          panel,
          {
            y: `+=${elHeight * 4}`,
            x: `-=${elWidth * 4}`,
            rotation:
              (12 * ROTATION_COEF - (i + 1) * ROTATION_COEF) / 1.2 + 1500,
            ease: "sine.inOut",
            duration: 1,
            background: getBrandGradient(100),
          },
          ">",
        );
      }
    });

    const allPanels = [...Array.from(panels), ...Array.from(secondaryPanels)];
    tl.to(allPanels, { opacity: 0, duration: 1, ease: "power2.inOut" }, 6);
    tl.set(allPanels, { opacity: 1 }, 0);

    tl.play(0);
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
    if (isPlaying) tlRef.current.play();
    else tlRef.current.pause();
  }, [isPlaying]);

  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-black text-white px-4 font-sans relative overflow-hidden">
      <div
        ref={bgRef}
        className="absolute inset-0 overflow-hidden pointer-events-none"
      >
        {Array.from({ length: NUMBER_OF_PANELS }).map((_, i) => (
          <div key={`p1-${i}`} className="panel1" />
        ))}
        {Array.from({ length: NUMBER_OF_PANELS }).map((_, i) => (
          <div key={`p2-${i}`} className="panel2" />
        ))}
      </div>

      <div className="relative z-10 w-full">
        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.h1
              key="greeting"
              className="w-full max-w-full px-2 text-[clamp(2.5rem,10vw,4rem)] font-extrabold text-center leading-snug break-words text-white"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.8 }}
            >
              Hi{name ? ` ${name}` : ""}{" "}
              <motion.span
                style={{ display: "inline-block" }}
                animate={{ rotate: [0, 20, -20, 20, -20, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 3 }}
              >
                👋
              </motion.span>
            </motion.h1>
          )}

          {step === 1 && (
            <motion.div
              key="wrapped"
              className="w-full max-w-full px-2 text-center"
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1.05 }}
              exit={{ opacity: 0, scale: 20 }}
              transition={{ duration: 0.75 }}
            >
              <h1 className="w-full max-w-full text-[clamp(3rem,12vw,5rem)] font-black leading-[1.1] break-words mx-auto text-white">
                Your Mobile Order <br />
                <span className="text-[#FF3086] italic">Wrapped</span> is Here
                🎉
              </h1>
              <p className="mt-6 w-full text-[clamp(1rem,3vw,2rem)] leading-snug break-words mx-auto text-gray-200">
                Let's take a look at what you've been craving all <br />
                <span className="block">semester at Duke.</span>
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default IntroSlide;
