"use client";

import type { LogoVariant } from "@/lib/types";
import { LOGO_ASSET_REGISTRY } from "@/lib/assets/logo-assets";

interface LogoVariantSelectorProps {
  value:     LogoVariant;
  onChange:  (variant: LogoVariant) => void;
  disabled?: boolean;
}

/**
 * Segmented control for selecting the active Zalopay logo variant.
 *
 * Options are driven entirely by LOGO_ASSET_REGISTRY — adding a new official
 * variant to the registry automatically adds a new button here.
 */
export function LogoVariantSelector({ value, onChange, disabled }: LogoVariantSelectorProps) {
  return (
    <div className="space-y-2">
      {/* Section header */}
      <div className="flex items-center gap-2">
        <span
          className="text-[11px] font-semibold uppercase tracking-wide"
          style={{ color: "var(--fg-subtle)" }}
        >
          Logo Zalopay
        </span>
        <div className="flex-1 h-px" style={{ background: "var(--border-default)" }} />
      </div>

      {/* Segmented selector */}
      <div
        className="flex gap-0.5 p-0.5 rounded-[var(--radius-md)]"
        style={{ border: "1px solid var(--border-default)" }}
      >
        {LOGO_ASSET_REGISTRY.map((asset) => {
          const isActive = value === asset.variant;
          return (
            <button
              key={asset.variant}
              type="button"
              onClick={() => onChange(asset.variant)}
              disabled={disabled}
              aria-pressed={isActive}
              title={asset.description}
              className="flex-1 text-[12px] font-medium px-3 py-[7px] rounded transition-colors duration-150 disabled:pointer-events-none disabled:opacity-40"
              style={
                isActive
                  ? { background: "#0033C9", color: "#ffffff" }
                  : { color: "var(--fg-subtle)" }
              }
              onMouseEnter={(e) => {
                if (!isActive && !disabled) {
                  (e.currentTarget as HTMLButtonElement).style.color = "var(--fg-default)";
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  (e.currentTarget as HTMLButtonElement).style.color = "var(--fg-subtle)";
                }
              }}
            >
              {asset.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
