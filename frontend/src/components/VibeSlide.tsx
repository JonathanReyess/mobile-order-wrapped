import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import React from "react";

interface VibeSlideProps {
  vibe: string | null;
  colors: Record<string, string>;
}

export default function VibeSlide({ vibe, colors }: VibeSlideProps) {
  const line1 = "I'm not one to judge, but...";

  const [idx1, setIdx1] = useState(0);
  const [idx2, setIdx2] = useState(0);
  const [step, setStep] = useState<1 | 2>(1);

  // Typing effect for intro line
  useEffect(() => {
    if (step !== 1) return;
    const iv = setInterval(() => {
      setIdx1((prev) => {
        if (prev < line1.length) return prev + 1;
        clearInterval(iv);
        setTimeout(() => setStep(2), 1500);
        return prev;
      });
    }, 50);
    return () => clearInterval(iv);
  }, [step]);

  // Typing effect for vibe text
  useEffect(() => {
    if (step !== 2 || !vibe) return;
    const iv = setInterval(() => {
      setIdx2((prev) => {
        if (prev < vibe.length) return prev + 1;
        clearInterval(iv);
        return prev;
      });
    }, 40);
    return () => clearInterval(iv);
  }, [step, vibe]);

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
              <span key={`${phrase}-${idx}-${pidx}`} style={{ color, fontWeight: "bold" }}>
                {p}
              </span>
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
