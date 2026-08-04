/**
 * Blend overlay colour presets for the Banner Generator.
 *
 * Future-ready: this module will grow to support gradient presets,
 * two-colour blending, radial/linear gradients, brand themes, and seasonal
 * campaign palettes — all without changing the UI architecture.
 *
 * The UI consumes only the exported arrays/constants; adding a new preset
 * only requires an entry in BLEND_PRESET_LIST.
 */

// ── Types ─────────────────────────────────────────────────────────────────────

export interface BlendPreset {
  readonly id:         string;
  readonly labelVi:    string;    // Vietnamese display label
  readonly hex:        string;    // CSS hex, always #RRGGBB uppercase
  readonly isDefault?: boolean;   // True → used as reset target
}

/**
 * Future: gradient presets will extend this union.
 *
 *   type BlendMode =
 *     | { type: "solid";    color: string }
 *     | { type: "linear";   from: string; to: string; angle: number }
 *     | { type: "radial";   inner: string; outer: string }
 */
export type BlendMode = { type: "solid"; color: string };

// ── Brand colour presets ──────────────────────────────────────────────────────

export const BLEND_PRESET_LIST: readonly BlendPreset[] = [
  {
    id:        "zalopay-green",
    labelVi:   "Xanh ZaloPay",
    hex:       "#00CF6A",
    isDefault: true,
  },
  {
    id:      "zalopay-blue",
    labelVi: "Xanh dương",
    hex:     "#0033C9",
  },
  {
    id:      "white",
    labelVi: "Trắng",
    hex:     "#FFFFFF",
  },
  {
    id:      "black",
    labelVi: "Đen",
    hex:     "#000000",
  },
  {
    id:      "light-gray",
    labelVi: "Xám nhạt",
    hex:     "#F5F5F5",
  },
];

// ── Reset targets (as per design spec) ───────────────────────────────────────

export const BLEND_COLOR_DEFAULT: string =
  BLEND_PRESET_LIST.find((p) => p.isDefault)?.hex ?? "#00CF6A";

/** Opacity reset value (0–100). Spec: 60. */
export const BLEND_OPACITY_RESET = 60;

// ── Utilities ─────────────────────────────────────────────────────────────────

/** Returns the preset whose hex matches (case-insensitive), or undefined for custom. */
export function findPresetByHex(hex: string): BlendPreset | undefined {
  return BLEND_PRESET_LIST.find(
    (p) => p.hex.toUpperCase() === hex.toUpperCase(),
  );
}
