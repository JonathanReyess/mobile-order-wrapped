import { motion, AnimatePresence } from "framer-motion";

export interface AppNotification {
  id: number;
  message: React.ReactNode;
  timeLeft: number;
}

interface NotificationManagerProps {
  notifications: AppNotification[];
  onDismiss: (id: number) => void;
}

export const NotificationManager = ({
  notifications,
  onDismiss,
}: NotificationManagerProps) => {
  return (
    <div className="fixed top-4 right-4 space-y-2 z-50">
      <AnimatePresence>
        {notifications.map((n) => (
          <motion.div
            key={n.id}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="relative bg-white text-[#032e56] px-4 py-3 rounded-xl shadow-lg w-72 text-sm overflow-hidden group"
          >
            {/* Message */}
            <div className="pr-8">{n.message}</div>

            <div className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center text-blue-600 group">
              {/* Circle countdown timer */}
              <svg viewBox="0 0 36 36" className="w-full h-full">
                <path
                  className="text-gray-300"
                  stroke="currentColor"
                  strokeWidth="2"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-blue-600 group-hover:opacity-0 transition-opacity duration-200"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeDasharray="100"
                  strokeDashoffset={`${100 - (n.timeLeft / 10) * 100}`}
                  fill="none"
                  style={{ transition: "stroke-dashoffset 1s linear" }}
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <text
                  x="18"
                  y="22"
                  textAnchor="middle"
                  fontSize="12"
                  fill="#032e56"
                  fontWeight="bold"
                  className="group-hover:opacity-0 transition-opacity duration-200"
                >
                  {n.timeLeft}
                </text>
              </svg>

              {/* Dismiss button */}
              <button
                onClick={() => onDismiss(n.id)}
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:scale-110 cursor-pointer"
                aria-label="Dismiss notification"
              >
                <svg
                  fill="#032e56"
                  height="8px"
                  width="8px"
                  viewBox="0 0 460.775 460.775"
                  className="translate-x-[8px]"
                >
                  <path d="M285.08,230.397L456.218,59.27c6.076-6.077,6.076-15.911,0-21.986L423.511,4.565c-2.913-2.911-6.866-4.55-10.992-4.55 c-4.127,0-8.08,1.639-10.993,4.55l-171.138,171.14L59.25,4.565c-2.913-2.911-6.866-4.55-10.993-4.55 c-4.126,0-8.08,1.639-10.992,4.55L4.558,37.284c-6.077,6.075-6.077,15.909,0,21.986l171.138,171.128L4.575,401.505 c-6.074,6.077-6.074,15.911,0,21.986l32.709,32.719c2.911,2.911,6.865,4.55,10.992,4.55c4.127,0,8.08-1.639,10.994-4.55 l171.117-171.12l171.118,171.12c2.913,2.911,6.866,4.55,10.993,4.55c4.128,0,8.081-1.639,10.992-4.55l32.709-32.719 c6.074-6.075,6.074-15.909,0-21.986L285.08,230.397z" />
                </svg>
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
