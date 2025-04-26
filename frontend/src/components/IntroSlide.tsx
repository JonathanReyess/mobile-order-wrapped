import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

interface IntroSlideProps {
  name?: string;
}

const IntroSlide = ({ name }: IntroSlideProps) => {
  const [showGreeting, setShowGreeting] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowGreeting(false);
    }, 2000); // Display greeting for 2 seconds before transitioning

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-gradient-to-r from-duke-blue to-duke-royal text-white px-4">
      <AnimatePresence mode="wait">
        {showGreeting ? (
          <motion.h1
            key="greeting"
            className="text-5xl md:text-6xl font-extrabold text-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 1 }}
          >
            Hello,{name ? ` ${name}` : ""} 👋
          </motion.h1>
        ) : (
          <motion.div
            key="wrapped"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2 }}
            className="text-center"
          >
            <h1 className="text-5xl md:text-6xl font-extrabold leading-tight">
              Your Mobile Order <br /> Wrapped is Here 🎉
            </h1>
            <p className="mt-6 text-lg md:text-2xl max-w-xl mx-auto">
              Let’s take a look at what you’ve been craving all semester at Duke.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default IntroSlide;
