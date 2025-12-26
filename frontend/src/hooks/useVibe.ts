import { useState, useEffect } from "react";

export const useVibe = (stats: any) => {
  const [vibe, setVibe] = useState<string | null>(null);
  const [colors, setColors] = useState<Record<string, string>>({});
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    if (!stats) return;
    async function fetchVibe() {
      try {
        const res = await fetch(`${BACKEND_URL}/api/generate-vibe`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ stats }),
        });
        const data = await res.json();
        setVibe(data.vibe || "");
        setColors(data.colors || {});
      } catch (err) {
        console.error("Error fetching vibe:", err);
      }
    }
    fetchVibe();
  }, [stats]);

  return { vibe, colors };
};
