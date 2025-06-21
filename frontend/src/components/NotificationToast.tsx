import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface NotificationToastProps {
  id: number;
  message: string;
  subtitle?: string;
  onClose: (id: number) => void;
  duration?: number; // in ms
}

export const NotificationToast = ({
  id,
  message,
  subtitle,
  onClose,
  duration = 5000,
}: NotificationToastProps) => {
  const [remaining, setRemaining] = useState(duration);
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const newRemaining = duration - elapsed;
      if (newRemaining <= 0) {
        clearInterval(interval);
        onClose(id);
      } else {
        setRemaining(newRemaining);
        setProgress((newRemaining / duration) * 100);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [duration, id, onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.95 }}
      transition={{ duration: 0.3 }}
      className="relative w-80 bg-white shadow-lg rounded-md border-l-4 border-blue-500 p-4 overflow-hidden"
    >
      <button
        onClick={() => onClose(id)}
        className="absolute top-2 right-2 text-gray-400 hover:text-black transition text-lg"
        aria-label="Close"
      >
        ✕
      </button>
      <div className="text-sm font-medium text-gray-900">{message}</div>
      {subtitle && <div className="text-xs text-gray-500 mt-1">{subtitle}</div>}

      <div className="absolute bottom-0 left-0 h-1 bg-blue-500" style={{ width: `${progress}%` }} />
    </motion.div>
  );
};
