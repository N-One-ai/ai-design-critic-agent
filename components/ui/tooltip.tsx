"use client";

import { useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";

export type TooltipPosition = "top" | "bottom" | "left" | "right";

export interface TooltipProps {
  content: ReactNode;
  position?: TooltipPosition;
  delay?: number;
  disabled?: boolean;
  className?: string;
  children: ReactNode;
}

const POSITION_CLASSES: Record<TooltipPosition, { container: string; tooltip: string; arrow: string }> = {
  top: {
    container: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    tooltip: "",
    arrow: "top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#1a2536]",
  },
  bottom: {
    container: "top-full left-1/2 -translate-x-1/2 mt-2",
    tooltip: "",
    arrow: "bottom-full left-1/2 -translate-x-1/2 border-4 border-transparent border-b-[#1a2536]",
  },
  left: {
    container: "right-full top-1/2 -translate-y-1/2 mr-2",
    tooltip: "",
    arrow: "left-full top-1/2 -translate-y-1/2 border-4 border-transparent border-l-[#1a2536]",
  },
  right: {
    container: "left-full top-1/2 -translate-y-1/2 ml-2",
    tooltip: "",
    arrow: "right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-[#1a2536]",
  },
};

export function Tooltip({
  content,
  position = "top",
  disabled = false,
  className,
  children,
}: TooltipProps) {
  const [visible, setVisible] = useState(false);
  const pos = POSITION_CLASSES[position];

  if (disabled) return <>{children}</>;

  return (
    <div
      className={cn("relative inline-flex", className)}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onFocus={() => setVisible(true)}
      onBlur={() => setVisible(false)}
    >
      {children}
      {visible && (
        <div
          role="tooltip"
          className={cn(
            "absolute z-50 pointer-events-none",
            pos.container
          )}
        >
          <div className="relative bg-[#1a2536] text-white text-[12px] font-medium px-2.5 py-1.5 rounded-[var(--radius-md)] whitespace-nowrap shadow-modal animate-in">
            {content}
            <span className={cn("absolute w-0 h-0", pos.arrow)} />
          </div>
        </div>
      )}
    </div>
  );
}
