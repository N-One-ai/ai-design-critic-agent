"use client";

import { RotateCcw } from "lucide-react";

interface FontSizeSliderProps {
  label:        string;
  value:        number;
  defaultValue: number;
  min:          number;
  max:          number;
  step:         number;
  disabled?:    boolean;
  onChange:     (value: number) => void;
}

export function FontSizeSlider({
  label,
  value,
  defaultValue,
  min,
  max,
  step,
  disabled,
  onChange,
}: FontSizeSliderProps) {
  const isDirty = value !== defaultValue;

  return (
    <div className="flex flex-col gap-1.5">
      {/* Row: label + current size + reset */}
      <div className="flex items-center justify-between gap-2">
        <span
          className="text-xs font-medium"
          style={{ color: "var(--fg-subtle)" }}
        >
          {label}
        </span>

        <div className="flex items-center gap-1.5">
          <span
            className="text-xs tabular-nums"
            style={{ color: "var(--fg-muted)", minWidth: "2.5rem", textAlign: "right" }}
          >
            {value}px
          </span>

          {isDirty && (
            <button
              type="button"
              onClick={() => onChange(defaultValue)}
              disabled={disabled}
              title="Reset to brand default"
              className="flex items-center justify-center rounded transition-opacity hover:opacity-70 disabled:pointer-events-none disabled:opacity-40"
              style={{
                width: 20,
                height: 20,
                color: "var(--fg-muted)",
              }}
            >
              <RotateCcw size={11} strokeWidth={2.2} />
            </button>
          )}
        </div>
      </div>

      {/* Slider */}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
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
              var(--brand-default) ${((value - min) / (max - min)) * 100}%,
              var(--border-default) ${((value - min) / (max - min)) * 100}%,
              var(--border-default) 100%
            )`,
          } as React.CSSProperties
        }
      />

      {/* Min / max tick labels */}
      <div
        className="flex justify-between text-[10px]"
        style={{ color: "var(--fg-muted)" }}
      >
        <span>{min}px</span>
        <span>{max}px</span>
      </div>
    </div>
  );
}
