"use client";

import { RotateCcw, Move } from "lucide-react";
import {
  HERO_SCALE_MIN,
  HERO_SCALE_MAX,
  HERO_SCALE_STEP,
  type HeroTransform,
} from "./use-hero-drag";

interface HeroImageControlsProps {
  transform:   HeroTransform;
  onChange:    (t: HeroTransform) => void;
  onReset:     () => void;
  disabled?:   boolean;
  maxOffsetX?: number;
  maxOffsetY?: number;
}

// ── Slider gradient helpers ───────────────────────────────────────────────────

/** Left-filled gradient for the zoom slider. */
function fillBg(value: number, min: number, max: number) {
  const pct = ((value - min) / (max - min)) * 100;
  return `linear-gradient(to right, var(--brand-default) 0%, var(--brand-default) ${pct}%, var(--border-default) ${pct}%, var(--border-default) 100%)`;
}

/** Centre-filled gradient for X/Y offset sliders. */
function centreFillBg(value: number, max: number) {
  const pct  = ((value + max) / (2 * max)) * 100;
  const from = Math.min(pct, 50);
  const to   = Math.max(pct, 50);
  return (
    `linear-gradient(to right, ` +
    `var(--border-default) 0%, var(--border-default) ${from}%, ` +
    `var(--brand-default) ${from}%, var(--brand-default) ${to}%, ` +
    `var(--border-default) ${to}%, var(--border-default) 100%)`
  );
}

// ── Component ─────────────────────────────────────────────────────────────────

export function HeroImageControls({
  transform,
  onChange,
  onReset,
  disabled,
  maxOffsetX = 200,
  maxOffsetY = 200,
}: HeroImageControlsProps) {
  const isAtDefault =
    Math.abs(transform.offsetX) < 1 &&
    Math.abs(transform.offsetY) < 1 &&
    Math.abs(transform.scale - 1.0) < 0.005;

  const scalePct = `${Math.round(transform.scale * 100)}%`;

  const rangeClass =
    "w-full h-1.5 cursor-pointer appearance-none rounded-full disabled:cursor-not-allowed";

  return (
    <div>
      {/* Section header */}
      <div className="flex items-center gap-2 mb-3">
        <Move size={11} className="text-[var(--fg-subtle)]" />
        <div className="text-[11px] font-semibold text-[var(--fg-subtle)] uppercase tracking-wide">
          Vị trí ảnh hero
        </div>
        <div className="flex-1 h-px bg-[var(--border-default)]" />
        {!isAtDefault && (
          <button
            type="button"
            onClick={onReset}
            disabled={disabled}
            title="Đặt lại vị trí và zoom"
            className="flex items-center gap-1 text-[11px] text-[var(--fg-muted)] hover:text-[var(--fg-default)] transition-colors disabled:pointer-events-none disabled:opacity-40"
          >
            <RotateCcw size={10} strokeWidth={2.2} />
            Đặt lại
          </button>
        )}
      </div>

      <div className="space-y-4">
        {/* Zoom */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-medium" style={{ color: "var(--fg-subtle)" }}>
              Zoom hình ảnh
            </span>
            <span className="text-xs tabular-nums" style={{ color: "var(--fg-muted)" }}>
              {scalePct}
            </span>
          </div>
          <input
            type="range"
            min={HERO_SCALE_MIN}
            max={HERO_SCALE_MAX}
            step={HERO_SCALE_STEP}
            value={transform.scale}
            disabled={disabled}
            onChange={(e) => onChange({ ...transform, scale: Number(e.target.value) })}
            className={rangeClass}
            style={{
              accentColor: "var(--brand-default)",
              background: fillBg(transform.scale, HERO_SCALE_MIN, HERO_SCALE_MAX),
            } as React.CSSProperties}
          />
          <div
            className="flex justify-between text-[10px]"
            style={{ color: "var(--fg-muted)" }}
          >
            <span>{Math.round(HERO_SCALE_MIN * 100)}%</span>
            <span>100%</span>
            <span>{Math.round(HERO_SCALE_MAX * 100)}%</span>
          </div>
        </div>

        {/* X offset */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-medium" style={{ color: "var(--fg-subtle)" }}>
              Ngang (X)
            </span>
            <span className="text-xs tabular-nums" style={{ color: "var(--fg-muted)" }}>
              {transform.offsetX >= 0 ? "+" : ""}{Math.round(transform.offsetX)}px
            </span>
          </div>
          <input
            type="range"
            min={-maxOffsetX}
            max={maxOffsetX}
            step={1}
            value={Math.max(-maxOffsetX, Math.min(maxOffsetX, Math.round(transform.offsetX)))}
            disabled={disabled}
            onChange={(e) => onChange({ ...transform, offsetX: Number(e.target.value) })}
            className={rangeClass}
            style={{
              accentColor: "var(--brand-default)",
              background: centreFillBg(transform.offsetX, maxOffsetX),
            } as React.CSSProperties}
          />
        </div>

        {/* Y offset */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-medium" style={{ color: "var(--fg-subtle)" }}>
              Dọc (Y)
            </span>
            <span className="text-xs tabular-nums" style={{ color: "var(--fg-muted)" }}>
              {transform.offsetY >= 0 ? "+" : ""}{Math.round(transform.offsetY)}px
            </span>
          </div>
          <input
            type="range"
            min={-maxOffsetY}
            max={maxOffsetY}
            step={1}
            value={Math.max(-maxOffsetY, Math.min(maxOffsetY, Math.round(transform.offsetY)))}
            disabled={disabled}
            onChange={(e) => onChange({ ...transform, offsetY: Number(e.target.value) })}
            className={rangeClass}
            style={{
              accentColor: "var(--brand-default)",
              background: centreFillBg(transform.offsetY, maxOffsetY),
            } as React.CSSProperties}
          />
        </div>

        <p className="text-[11px] leading-relaxed" style={{ color: "var(--fg-muted)" }}>
          Kéo trực tiếp trên ảnh · Đúp click để căn giữa
        </p>
      </div>
    </div>
  );
}
