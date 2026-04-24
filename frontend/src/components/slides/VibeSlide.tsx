import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface VibeSlideProps {
  vibe: string | null;
  isPlaying: boolean;
}

export default function VibeSlide({ vibe, isPlaying }: VibeSlideProps) {
  const line1 = "I'm not one to judge, but...";

  const [step, setStep] = useState<1 | 2>(1);
  const [idx1, setIdx1] = useState(0);
  const [idx2, setIdx2] = useState(0);

  const typingIntervalRef = useRef<number | null>(null);
  const timeoutRef = useRef<number | null>(null);

  // Typing effect for line1
  useEffect(() => {
    if (step !== 1 || !isPlaying) return;

    typingIntervalRef.current = window.setInterval(() => {
      setIdx1((prev) => {
        if (prev < line1.length) {
          return prev + 1;
        } else {
          clearInterval(typingIntervalRef.current!);
          timeoutRef.current = window.setTimeout(() => setStep(2), 1500);
          return prev;
        }
      });
    }, 50);

    return () => {
      clearInterval(typingIntervalRef.current!);
      clearTimeout(timeoutRef.current!);
    };
  }, [step, isPlaying, line1.length]);

  // Typing effect for vibe text
  useEffect(() => {
    if (step !== 2 || !vibe || !isPlaying) return;

    typingIntervalRef.current = window.setInterval(() => {
      setIdx2((prev) => {
        if (prev < vibe.length) {
          return prev + 1;
        } else {
          clearInterval(typingIntervalRef.current!);
          return prev;
        }
      });
    }, 40);

    return () => clearInterval(typingIntervalRef.current!);
  }, [step, isPlaying, vibe]);

  return (
    <div
      className="h-screen w-full flex flex-col items-center justify-center p-6"
      style={{
        background: `linear-gradient(135deg, 
          rgba(173, 216, 230, 1) 0%, 
          rgba(100, 149, 237, 1) 6%, 
          rgba(0, 100, 255, 1) 19%, 
          rgba(0, 51, 153, 1) 72%, 
          rgba(0, 0, 0, 1) 100%
        )`,
      }}
    >
      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.h2
            key="line1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-4xl font-bold italic text-white mb-8 text-center tracking-wider drop-shadow-md"
          >
            {line1.slice(0, idx1)}
          </motion.h2>
        )}
        {step === 2 && vibe && (
          <motion.p
            key="line2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-4xl md:text-5xl font-extrabold text-white whitespace-pre-wrap text-center max-w-3xl leading-snug drop-shadow-xl"
          >
            {vibe.slice(0, idx2)}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
