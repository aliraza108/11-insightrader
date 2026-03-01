import { useEffect, useState } from "react";
import { API_BASE } from "../utils/api.js";

export const ApiStatus = () => {
  const [online, setOnline] = useState(true);

  useEffect(() => {
    let active = true;
    const check = async () => {
      try {
        const res = await fetch(`${API_BASE}/`);
        if (!active) return;
        setOnline(res.ok);
      } catch (err) {
        if (!active) return;
        setOnline(false);
      }
    };

    check();
    const interval = setInterval(check, 30000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="radar-card flex items-center gap-3 px-3 py-2">
      <span
        className={`h-2.5 w-2.5 rounded-full ${online ? "bg-emerald-400" : "bg-red-500"}`}
      />
      <div className="text-xs">
        <p className="text-white">API Status</p>
        <p className="text-radar-muted">
          {online ? "Online" : "API Unreachable"}
        </p>
      </div>
    </div>
  );
};
