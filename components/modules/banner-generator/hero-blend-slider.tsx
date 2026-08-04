"use client";

import { Blend, RotateCcw } from "lucide-react";
import {
  BANNER_HERO_BLEND_DEFAULT,
  BANNER_HERO_BLEND_MIN,
  BANNER_HERO_BLEND_MAX,
} from "./banner-canvas";

interface HeroBlendSliderProps {
  value:     number;
  onChange:  (value: number) => void;
  disabled?: boolean;
}

export function HeroBlendSlider({ value, onChange, disabled }: HeroBlendSliderProps) {
  const isDirty = value !== BANNER_HERO_BLEND_DEFAULT;
  const pct = ((value - BANNER_HERO_BLEND_MIN) / (BANNER_HERO_BLEND_MAX - BANNER_HERO_BLEND_MIN)) * 100;

  // Descriptive label changes as the user moves the slider
  function blendLabel(v: number) {
    if (v === 0)   return "Nổi bật ảnh";
    if (v < 20)    return "Ảnh rõ nét";
    if (v < 40)    return "Nhẹ nhàng";
    if (v < 60)    return "Cân bằng";
    if (v < 80)    return "Thương hiệu";
    if (v < 100)   return "Đậm màu";
    return "Thuần thương hiệu";
  }

  return (
    <div className="flex flex-col gap-1.5">
      {/* Label row */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <Blend size={11} className="text-[var(--fg-subtle)]" />
          <span className="text-xs font-medium" style={{ color: "var(--fg-subtle)" }}>
            Độ hoà nền
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <span
            className="text-xs tabular-nums"
            style={{ color: "var(--fg-muted)", minWidth: "2rem", textAlign: "right" }}
          >
            {value}%
          </span>
          {isDirty && (
            <button
              type="button"
              onClick={() => onChange(BANNER_HERO_BLEND_DEFAULT)}
              disabled={disabled}
              title={`Reset về mặc định (${BANNER_HERO_BLEND_DEFAULT}%)`}
              className="flex items-center justify-center rounded transition-opacity hover:opacity-70 disabled:pointer-events-none disabled:opacity-40"
              style={{ width: 20, height: 20, color: "var(--fg-muted)" }}
            >
              <RotateCcw size={11} strokeWidth={2.2} />
            </button>
          )}
        </div>
      </div>

      {/* Slider */}
      <input
        type="range"
        min={BANNER_HERO_BLEND_MIN}
        max={BANNER_HERO_BLEND_MAX}
        step={1}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-1.5 cursor-pointer appearance-none rounded-full disabled:cursor-not-allowed"
        style={
          {
            accentColor: "var(--brand-default)",
            background: `linear-gradient(
              to right,
              var(--brand-default) 0%,
              var(--brand-default) ${pct}%,
              var(--border-default) ${pct}%,
              var(--border-default) 100%
            )`,
          } as React.CSSProperties
        }
      />

      {/* Tick labels */}
      <div
        className="flex justify-between text-[10px]"
        style={{ color: "var(--fg-muted)" }}
      >
        <span>Nổi bật ảnh</span>
        <span>{blendLabel(value)}</span>
        <span>Thương hiệu</span>
      </div>
    </div>
  );
}
