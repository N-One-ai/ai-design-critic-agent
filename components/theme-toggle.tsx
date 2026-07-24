"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Sun, Moon, Monitor } from "lucide-react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return <div className="w-[120px] h-9" />;

  const options = [
    { value: "light", icon: Sun, label: "Sáng" },
    { value: "dark", icon: Moon, label: "Tối" },
    { value: "system", icon: Monitor, label: "Hệ thống" },
  ] as const;

  return (
    <div className="flex items-center gap-1 rounded-xl border border-white/20 bg-white/10 p-1 backdrop-blur-sm">
      {options.map(({ value, icon: Icon, label }) => (
        <button
          key={value}
          onClick={() => setTheme(value)}
          title={label}
          className={`flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-medium transition-colors
            ${
              theme === value
                ? "bg-white/20 text-white"
                : "text-white/70 hover:text-white hover:bg-white/10"
            }`}
        >
          <Icon size={14} strokeWidth={2} />
          <span className="hidden sm:inline">{label}</span>
        </button>
      ))}
    </div>
  );
}
