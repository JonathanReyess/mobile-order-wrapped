import { motion } from "framer-motion";

export default function TopRestaurantsSlide({
  restaurantCounts,
}: {
  restaurantCounts: Record<string, number>;
}) {
  const top = Object.entries(restaurantCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(1, 4);

  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-gradient-to-br from-duke-slate via-teal-400 to-duke-royal text-white px-4">
      <motion.h2
        className="text-4xl md:text-5xl font-extrabold text-center"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        My Top Dining Spots 🍽️
      </motion.h2>

      <div className="mt-8 flex flex-col items-center gap-6 w-full max-w-md">
        {top.map(([name, count], idx) => (
          <motion.div
            key={name}
            className="bg-white/10 rounded-xl px-8 py-4 shadow-lg w-full"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 2 + idx * 1 }}
          >
            <div className="text-2xl md:text-3xl font-bold text-center">{name}</div>
            <div className="text-lg text-blue-100 text-center">
              {count} visit{count > 1 ? "s" : ""}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
