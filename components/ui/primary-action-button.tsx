"use client";

/**
 * PrimaryActionButton — the single Global Primary CTA for all AI modules.
 *
 * Design spec:
 *   Gradient  : 90deg  #3B82F6 → #2563EB → #10B981
 *   Radius    : 16px   Height: 56px   Min-width: 240px
 *   Shadow    : 0 8px 24px rgba(37,99,235,0.30)
 *   Hover     : scale(1.02) + overlay brightens gradient  (250ms ease)
 *   Pressed   : scale(0.98)
 *   Disabled  : #334155, opacity 60%, cursor not-allowed
 *   Loading   : Loader2 spinner, loadingText, non-interactive
 *   Success   : CheckCircle2 + "✓ Hoàn thành", green gradient, 1.5s then idle
 *   Error     : CircleAlert, red gradient, stays clickable (retry)
 *   Icon      : Sparkles 18px — never change the idle icon
 *   Typography: Aeonik Pro 600 17px white (Inter fallback)
 *
 * Usage:
 *   <PrimaryActionButton
 *     label="Tạo banner ngay"
 *     loadingText="Đang tạo banner..."
 *     ctaState={status === "loading" ? "loading" : status === "done" ? "success" : "idle"}
 *     disabled={!canGenerate}
 *     onClick={handleGenerate}
 *   />
 */

import { useEffect, useRef, useState } from "react";
import { Sparkles, Loader2, CheckCircle2, CircleAlert } from "lucide-react";
import { cn } from "@/lib/cn";

// ── Types ─────────────────────────────────────────────────────────────────────

export type CTAState = "idle" | "loading" | "success" | "error";

export interface PrimaryActionButtonProps {
  label: string;
  loadingText?: string;
  /** Controls the visual state of the button. Defaults to "idle". */
  ctaState?: CTAState;
  /**
   * Additional disabled condition on top of ctaState==="loading".
   * Does NOT override the clickability of error state (retry is always available).
   */
  disabled?: boolean;
  onClick?: () => void;
  /**
   * Called 1.5 s after ctaState transitions to "success", once the
   * success animation completes. Use to reset parent status if needed.
   */
  onSuccessComplete?: () => void;
  className?: string;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function PrimaryActionButton({
  label,
  loadingText = "Đang xử lý...",
  ctaState = "idle",
  disabled = false,
  onClick,
  onSuccessComplete,
  className,
}: PrimaryActionButtonProps) {
  // Internal display state — decouples the 1.5s success animation from the
  // parent's `ctaState` prop so the button returns to idle on its own.
  const [displayedState, setDisplayedState] = useState<CTAState>("idle");
  const prevStateRef = useRef<CTAState>("idle");

  useEffect(() => {
    const prev = prevStateRef.current;
    prevStateRef.current = ctaState;

    if (ctaState === "success" && prev !== "success") {
      // Entering success: show the animation, then auto-reset after 1.5s.
      setDisplayedState("success");
      const timer = setTimeout(() => {
        setDisplayedState("idle");
        onSuccessComplete?.();
      }, 1500);
      return () => clearTimeout(timer);
    }

    // For all other transitions (idle ↔ loading ↔ error), sync immediately.
    // Guard: don't override while still in the success animation window.
    if (ctaState !== "success") {
      setDisplayedState(ctaState);
    }
  }, [ctaState, onSuccessComplete]);

  const isLoading  = displayedState === "loading";
  const isSuccess  = displayedState === "success";
  const isError    = displayedState === "error";
  // Button is non-interactive while loading; error state stays clickable (retry).
  const isDisabled = disabled || isLoading;

  return (
    <button
      type="button"
      disabled={isDisabled}
      onClick={onClick}
      aria-busy={isLoading}
      className={cn(
        // Core layout
        "btn-cta",
        "w-full min-w-[240px]",
        "inline-flex items-center justify-center",
        // State modifier classes (handled in globals.css)
        isSuccess && "cta-state-success",
        isError   && "cta-state-error",
        // Focus ring
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--cta-via)] focus-visible:ring-offset-2",
        className,
      )}
      style={{
        height:      "var(--cta-height)",
        borderRadius: "var(--cta-radius)",
        // Typography: Aeonik Pro with system-font fallback
        fontFamily:  "var(--cta-font)",
        fontWeight:  600,
        fontSize:    "14px",
        color:       "white",
        letterSpacing: 0,
        gap:         "8px",
      }}
    >
      {/* Hover gradient overlay — brightens and "shifts" the gradient */}
      <span className="cta-hover-layer" aria-hidden="true" />

      {/* Icon — everything is relative z-10 to sit above the overlay */}
      <span className="relative z-10 shrink-0 flex items-center">
        {isLoading  && <Loader2     size={18} className="animate-spin" />}
        {isSuccess  && <CheckCircle2 size={18} />}
        {isError    && <CircleAlert  size={18} />}
        {!isLoading && !isSuccess && !isError && <Sparkles size={18} />}
      </span>

      {/* Label */}
      <span className="relative z-10 truncate">
        {isLoading ? loadingText
          : isSuccess ? "✓ Hoàn thành"
          : label}
      </span>
    </button>
  );
}
