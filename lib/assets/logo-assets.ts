/**
 * Logo Asset Registry — single source of truth for all official Zalopay logo variants.
 *
 * To add a new variant (e.g. "monochrome", "seasonal"):
 *   1. Drop the PNG into /public/
 *   2. Add an entry to LOGO_ASSET_REGISTRY below.
 *   The UI and renderer pick it up automatically — no other code changes needed.
 *
 * Files are resolved by public path so Next.js serves them via the static asset pipeline.
 * Never hardcode logo URLs in component or canvas code; always call resolveLogoPath().
 */

import type { LogoVariant } from "@/lib/types";

export interface LogoAssetDef {
  readonly variant:     LogoVariant;
  readonly label:       string;       // Display label in the panel selector
  readonly path:        string;       // Public asset path (relative to /public)
  readonly description: string;       // Accessible description
}

/**
 * Ordered registry — UI renders options in this order.
 * "white" must remain present as the guaranteed safe fallback.
 */
export const LOGO_ASSET_REGISTRY: readonly LogoAssetDef[] = [
  {
    variant:     "primary",
    label:       "Logo màu gốc",
    path:        "/zalopay-logo-primary.png",
    description: "Logo Zalopay chính thức đầy đủ màu sắc thương hiệu",
  },
  {
    variant:     "white",
    label:       "Logo trắng",
    path:        "/zalopay-logo-white.png",
    description: "Logo Zalopay phiên bản trắng, dùng trên nền tối hoặc màu",
  },
];

export const LOGO_VARIANT_DEFAULT: LogoVariant = "primary";

/**
 * Resolve the public asset path for a given variant.
 * Falls back to the white variant if the requested one is not registered.
 */
export function resolveLogoPath(variant: LogoVariant): string {
  const found    = LOGO_ASSET_REGISTRY.find((a) => a.variant === variant);
  const fallback = LOGO_ASSET_REGISTRY.find((a) => a.variant === "white")!;
  return (found ?? fallback).path;
}
