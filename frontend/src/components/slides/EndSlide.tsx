import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useCallback,
} from "react";
import { motion } from "framer-motion";
import { gsap } from "gsap";
import "../../styles/_intro.scss";

const NUMBER_OF_PANELS = 12;
const ROTATION_COEF = 5;

export default function EndSlide({ isPlaying }: { isPlaying: boolean }) {
  const lineFull =
    "Thanks for ordering, munching, and making memories this semester.";

  const [step, setStep] = useState(0);
  const [typedText, setTypedText] = useState("");

  const stepStartTime = useRef<number | null>(null);
  const elapsedTime = useRef<number>(0);
  const timerRef = useRef<number | null>(null);
  const stepDelays = [250, 1100];

  // Background animation
  const bgRef = useRef<HTMLDivElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== "undefined" ? window.innerWidth : 0,
    height: typeof window !== "undefined" ? window.innerHeight : 0,
  });

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

    const tl = gsap.timeline({ repeat: -1, paused: true });
    tlRef.current = tl;

    panels.forEach((panel, i) => {
      const stopPosition = 100 - i * 1;
      const wi = width - elWidth * (12 - i) + elWidth;
      const he = height - elHeight * (12 - i) + elHeight;

      const backgroundGradient = (stop: number | string) =>
        `linear-gradient(105deg, rgba(173, 216, 230, 1) 0%, rgba(100, 149, 237, 1) 6%, rgba(0, 100, 255, 1) 19%, rgba(0, 51, 153, 1) 72%, rgba(0, 0, 0, 1) ${stop}%)`;

      const backgroundGradient2 = (stop: number | string) =>
        `linear-gradient(90deg, rgba(200, 220, 255, 1) 0%, rgba(100, 149, 237, 1) 6%, rgba(0, 100, 255, 1) 19%, rgba(0, 51, 153, 1) 72%, rgba(0, 0, 0, 1) ${stop}%)`;

      tl.fromTo(
        panel,
        {
          y: elHeight * 5.5,
          x: elWidth * 5.5,
          width: 0,
          height: 0,
          rotation: -360,
          background: backgroundGradient(stopPosition),
        },
        {
          width: wi,
          height: he,
          y: -elHeight / 1.33 + ((12 - i) * elHeight) / 1.33,
          x: 0,
          duration: 1 + 0.1 * (12 - i),
          ease: "sine.inOut",
          rotation: 0,
          background: backgroundGradient(stopPosition),
        },
        0,
      );

      tl.to(
        panel,
        {
          rotation: 12 * ROTATION_COEF - (i + 1) * ROTATION_COEF,
          duration: 3,
          background: backgroundGradient2(stopPosition),
          ease: "linear",
        },
        ">",
      );

      tl.to(
        panel,
        {
          rotation: 360,
          y: -elHeight / 6 + ((12 - i) * elHeight) / 6,
          x: -elWidth / 1.2 + ((12 - i) * elWidth) / 1.2,
          background: backgroundGradient2("100%"),
          ease: "sine.inOut",
          duration: 1,
        },
        ">",
      );

      tl.to(
        panel,
        {
          rotation: 12 * ROTATION_COEF - (i + 1) * ROTATION_COEF + 360,
          duration: 4,
          background: backgroundGradient2("100%"),
          ease: "linear",
        },
        ">",
      );

      if (i === 0) {
        tl.addLabel("splitStart", "-=0.8");
      }

      secondaryPanels.forEach((twoPanel, index) => {
        if (i !== 0) return;

        const wi2 = width - elWidth * index + elWidth;
        const backgroundGradient3 = `linear-gradient(90deg, rgba(200, 220, 255, 1) 0%, rgba(100, 149, 237, 1) 6%, rgba(0, 100, 255, 1) 19%, rgba(0, 51, 153, 1) 72%, rgba(0, 0, 0, 1) 100%)`;

        tl.fromTo(
          twoPanel,
          {
            y: elHeight * 5.5,
            x: elWidth * 5.5,
            width: 0,
            height: 0,
            rotation: -360,
            background: backgroundGradient("100%"),
          },
          {
            rotation: -90,
            y: (index * elHeight) / 4 - wi2,
            x: -elWidth / 2 + (index * elWidth) / 2,
            width: wi2,
            height: wi2,
            background: backgroundGradient3,
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
            background: backgroundGradient3,
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
            background: backgroundGradient3,
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
            background: backgroundGradient3,
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
            background: backgroundGradient3,
            ease: "sine.inOut",
            duration: 1,
          },
          ">",
        );
      });

      if (i === 0) {
        tl.to(
          panel,
          {
            rotation: 720 + 90,
            y: height - ((12 - i) * elHeight) / 6,
            x: -elWidth / 2 + ((12 - i) * elWidth) / 2,
            width: 0,
            height: 0,
            opacity: 0,
            background: backgroundGradient2("100%"),
            ease: "sine.inOut",
            duration: 1,
          },
          `splitStart+=${0.05 * i}`,
        );
      } else {
        tl.to(
          panel,
          {
            rotation: 720 + 90,
            y: height - ((12 - i) * elHeight) / 4,
            x: -elWidth / 2 + ((12 - i) * elWidth) / 2,
            width: wi,
            height: wi,
            background: backgroundGradient2("100%"),
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
            background: backgroundGradient2("100%"),
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
            background: backgroundGradient2("100%"),
          },
          ">",
        );

        tl.to(
          panel,
          {
            rotation:
              (12 * ROTATION_COEF - (i + 1) * ROTATION_COEF) / 1.2 + 1200,
            duration: 5,
            background: backgroundGradient2("100%"),
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
            background: backgroundGradient2("100%"),
          },
          ">",
        );
      }
    });

    // Changed from tl.play(0) to jump right to the secondary animation phase
    tl.play("splitStart");
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

  // Step timer
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
        clearTimeout(timerRef.current!);
      }
    }

    return () => clearTimeout(timerRef.current!);
  }, [isPlaying, step]);

  // Typing effect
  useEffect(() => {
    if (!isPlaying || step < 2) return;

    const normalSpeed = 50;
    const pauseAfterSemester = 800;
    let currentSpeed = normalSpeed;
    let intervalId: number | null = null;

    function startTyping(speed: number) {
      intervalId = window.setInterval(() => {
        setTypedText((prev) => {
          if (prev.length >= lineFull.length) {
            if (intervalId) clearInterval(intervalId);
            return prev;
          }
          const newText = lineFull.slice(0, prev.length + 1);
          if (newText.endsWith("semester.")) {
            if (intervalId) clearInterval(intervalId);
            setTimeout(() => startTyping(currentSpeed), pauseAfterSemester);
            return newText;
          }
          if (lineFull[prev.length] === "\n") {
            if (intervalId) clearInterval(intervalId);
            startTyping(currentSpeed);
            return newText;
          }
          return newText;
        });
      }, speed);
    }

    startTyping(currentSpeed);
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isPlaying, step, lineFull]);

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

      <div className="relative z-10 flex flex-col items-center">
        <motion.h2
          className="text-5xl md:text-7xl font-black text-center mb-0 tracking-tight"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={
            step >= 1 ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.5 }
          }
          transition={{ duration: 0.8, type: "spring", stiffness: 100 }}
        >
          That's a Wrap!
        </motion.h2>

        <motion.p
          className="mt-6 text-xl md:text-3xl font-medium text-center max-w-lg min-h-[6rem] whitespace-pre-line text-white"
          initial={{ opacity: 0 }}
          animate={step >= 1 ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 1 }}
        >
          {typedText}
        </motion.p>
      </div>
    </div>
  );
}
