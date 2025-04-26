import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import React from "react";

interface VibeSlideProps {
  vibe: string | null;
  colors: Record<string, string>;
  isPlaying: boolean;
}

export default function VibeSlide({ vibe, colors, isPlaying }: VibeSlideProps) {
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
          timeoutRef.current = window.setTimeout(() => setStep(2), 1500); // After typing finishes, delay before vibe
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

  // Highlighted text
  function highlightText(text: string) {
    if (!text) return null;
  
    let result: React.ReactNode[] = [text];
    const sortedKeys = Object.keys(colors).sort((a, b) => b.length - a.length);
  
    for (const phrase of sortedKeys) {
      const color = colors[phrase];
  
      const newResult: React.ReactNode[] = [];
  
      result.forEach((part, idx) => {
        if (typeof part !== "string") {
          newResult.push(part);
          return;
        }
  
        const parts = part.split(new RegExp(`(${phrase})`, "gi"));
        parts.forEach((p, pidx) => {
          if (p.toLowerCase() === phrase.toLowerCase()) {
            newResult.push(
              <motion.span
                key={`${phrase}-${idx}-${pidx}`}
                style={{ color, fontWeight: "bold", display: "inline-block" }}
                initial={{ scale: 3 }}
                animate={{ scale: [3, 1], transition: { duration: 0.8 } }}
              >
                {p}
              </motion.span>
            );
          } else {
            newResult.push(p);
          }
        });
      });
  
      result = newResult;
    }
  
    return result;
  }
  

  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-gradient-to-br from-white via-gray-200 to-gray-300 p-6">
      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.h2
            key="line1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-3xl font-bold text-gray-800 mb-6 text-center"
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
            className="text-2xl font-bold text-gray-700 whitespace-pre-wrap text-center max-w-2xl leading-relaxed"
          >
            {highlightText(vibe.slice(0, idx2))}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
