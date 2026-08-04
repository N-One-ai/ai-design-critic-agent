"use client";

import { AlignLeft, AlignCenter, AlignRight } from "lucide-react";
import type { BannerTaglineAlign } from "@/lib/types";

interface TaglineAlignmentSelectorProps {
  value:     BannerTaglineAlign;
  onChange:  (align: BannerTaglineAlign) => void;
  disabled?: boolean;
}

const OPTIONS: { value: BannerTaglineAlign; label: string; Icon: typeof AlignLeft }[] = [
  { value: "left",   label: "Trái", Icon: AlignLeft   },
  { value: "center", label: "Giữa", Icon: AlignCenter },
  { value: "right",  label: "Phải", Icon: AlignRight  },
];

export function TaglineAlignmentSelector({
  value,
  onChange,
  disabled,
}: TaglineAlignmentSelectorProps) {
  return (
    <div className="flex items-center gap-3">
      <span
        className="text-[11px] shrink-0"
        style={{ color: "var(--fg-muted)" }}
      >
        Canh lề
      </span>

      <div
        className="flex items-center gap-0.5 rounded-[var(--radius-md)] p-0.5"
        style={{ background: "var(--bg-surface-2)" }}
      >
        {OPTIONS.map(({ value: v, label, Icon }) => {
          const active = value === v;
          return (
            <button
              key={v}
              type="button"
              title={label}
              disabled={disabled}
              onClick={() => onChange(v)}
              className={[
                "flex items-center justify-center w-[26px] h-[26px] rounded-[calc(var(--radius-md)-2px)] transition-colors",
                "disabled:pointer-events-none disabled:opacity-40",
              ].join(" ")}
              style={{
                background: active ? "var(--brand-default)" : "transparent",
                color: active
                  ? "#fff"
                  : "var(--fg-subtle)",
              }}
            >
              <Icon size={12} strokeWidth={2.2} />
            </button>
          );
        })}
      </div>
    </div>
  );
}
