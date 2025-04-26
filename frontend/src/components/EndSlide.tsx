import { motion } from "framer-motion";

export default function EndSlide() {
  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-gradient-to-tl from-duke-blue via-duke-royal to-duke-light text-white px-4">
      <motion.h2
        className="text-4xl md:text-6xl font-extrabold text-center"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
      >
        That’s a Wrap! 🎬
      </motion.h2>
      <motion.p
        className="mt-4 text-lg md:text-2xl text-center max-w-lg"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        Thanks for ordering, munching, and making memories this semester.
        <br />
        Can’t wait to see what you’ll order next! 💙
      </motion.p>

      <motion.div
        className="mt-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
      </motion.div>
    </div>
  );
}
