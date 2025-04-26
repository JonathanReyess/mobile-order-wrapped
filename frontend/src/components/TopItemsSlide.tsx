import { motion } from "framer-motion";

export default function TopItemsSlide({
  itemCounts,
}: {
  itemCounts: Array<{ count: number; item: string }>;
}) {
  const topItems = [...itemCounts]
    .sort((a, b) => b.count - a.count)
    .slice(0, 3);

  return (
    <div className="h-screen min-h-screen w-full flex flex-col items-center justify-center overflow-hidden bg-gradient-to-tr from-duke-royal to-duke-sky text-white px-4">
      <motion.h2
        className="text-4xl md:text-5xl font-extrabold text-center"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        My Top <span className="text-yellow-200">Cravings</span>
      </motion.h2>

      <div className="mt-8 flex flex-col items-center gap-6">
        {topItems.map((item, idx) => (
          <motion.div
            key={item.item}
            className="bg-white/10 rounded-xl px-8 py-4 shadow-lg flex flex-col items-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 2 + idx * 1 }}
          >
            <div className="text-2xl md:text-3xl font-bold">{item.item}</div>
            <div className="text-lg md:text-xl text-yellow-100 font-semibold">
              Ordered <span className="text-yellow-300">{item.count}</span> times
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
