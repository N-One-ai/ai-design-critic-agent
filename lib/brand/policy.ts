/**
 * lib/brand/policy.ts — Brand asset policy engine.
 *
 * Detects brand references in prompts, selects the correct official logo,
 * and infers background type (light/dark) from prompt context.
 *
 * Priority rules (from highest to lowest) per brand:
 *
 *   Zalopay — light background:
 *     1. logo-current-primary.png
 *     2. logo-current.png
 *     3. logo-primary.png
 *
 *   Zalopay — dark background:
 *     1. logo-white-current.png
 *     2. logo-current.png
 *     3. logo-primary.png
 *
 * Forbidden files (must NEVER be selected or referenced):
 *   logo-old-v1.png, logo-old-v2.png, logo-old-zalopay.png
 *
 * Brand assets are stored under: assets/logos/{brand}/
 * This layout supports future brand additions — just add a new subdirectory.
 */

import path from "path";
import fs from "fs";

// ── Types ─────────────────────────────────────────────────────────────────────

export type BackgroundType = "light" | "dark";

export interface BrandContext {
  detected: true;
  brand: string;
  backgroundType: BackgroundType;
  /** Absolute filesystem path to the selected logo PNG. */
  logoPath: string;
  /** Basename of the selected logo file (for logging). */
  logoFilename: string;
}

export interface NoBrandContext {
  detected: false;
}

export type BrandContextResult = BrandContext | NoBrandContext;

// ── Brand keyword registry ────────────────────────────────────────────────────
// Each brand maps to a list of prompt substrings (lowercased) that signal
// brand-specific generation. Extend this map to add future brands.

const BRAND_KEYWORDS: Readonly<Record<string, string[]>> = {
  zalopay: [
    "zalopay",
    "zalo pay",
    "ví zalopay",
    "thanh toán zalopay",
    "zalopay app",
    "zalopay banner",
    "zalopay brand",
    "zalopay logo",
    "zalopay marketing",
    "zalopay campaign",
  ],
};

// ── Background tone keywords ──────────────────────────────────────────────────

const DARK_KEYWORDS = [
  "dark", "night", "black", "midnight", "deep blue", "moody", "dramatic",
  "cinematic", "neon", "stormy", "storm", "evening", "dusk", "shadow",
  "dark background", "dark theme", "dark mode", "deep", "galaxy",
  "low-light", "noir", "gothic",
];

const LIGHT_KEYWORDS = [
  "white", "light", "bright", "clean", "minimal", "pastel", "daytime",
  "morning", "sunrise", "airy", "open", "light background", "white background",
  "bright background", "off-white", "cream", "pale",
];

// ── Logo priority lists ───────────────────────────────────────────────────────
// Order is priority: first existing file wins.
// FORBIDDEN files are never included in these lists.

const LOGO_PRIORITY: Readonly<Record<string, Record<BackgroundType, string[]>>> = {
  zalopay: {
    light: [
      "logo-current-primary.png",
      "logo-current.png",
      "logo-primary.png",
    ],
    dark: [
      "logo-white-current.png",
      "logo-current.png",
      "logo-primary.png",
    ],
  },
};

// ── Core functions ────────────────────────────────────────────────────────────

/** Returns the brand key if the prompt contains any brand keyword; null otherwise. */
export function detectBrand(prompt: string): string | null {
  const lower = prompt.toLowerCase();
  for (const [brand, keywords] of Object.entries(BRAND_KEYWORDS)) {
    if (keywords.some((kw) => lower.includes(kw))) {
      return brand;
    }
  }
  return null;
}

/**
 * Infers whether the prompt describes a light or dark background.
 * Counts matching keywords in each direction; ties default to "light"
 * (primary logo is the safe choice when tone is ambiguous).
 */
export function inferBackgroundType(prompt: string): BackgroundType {
  const lower = prompt.toLowerCase();
  const darkScore  = DARK_KEYWORDS.filter((kw) => lower.includes(kw)).length;
  const lightScore = LIGHT_KEYWORDS.filter((kw) => lower.includes(kw)).length;
  return darkScore > lightScore ? "dark" : "light";
}

/**
 * Resolves the absolute path to the correct logo file for the given brand and
 * background type, following the priority list and skipping missing files.
 * Returns null if no file from the priority list exists on disk.
 */
export function resolveLogoPath(
  brand: string,
  backgroundType: BackgroundType,
): { logoPath: string; logoFilename: string } | null {
  const priorities = LOGO_PRIORITY[brand]?.[backgroundType];
  if (!priorities) return null;

  const brandDir = path.join(process.cwd(), "assets", "logos", brand);

  for (const filename of priorities) {
    const fullPath = path.join(brandDir, filename);
    if (fs.existsSync(fullPath)) {
      return { logoPath: fullPath, logoFilename: filename };
    }
  }

  return null;
}

/**
 * Main entry point. Inspect a prompt, detect brand presence, infer background
 * tone, and resolve the correct logo path.
 *
 * Returns `{ detected: false }` when:
 *   - No brand keyword is found in the prompt, OR
 *   - The brand is detected but no approved logo file exists on disk.
 */
export function resolveBrandContext(prompt: string): BrandContextResult {
  const brand = detectBrand(prompt);
  if (!brand) return { detected: false };

  const backgroundType = inferBackgroundType(prompt);
  const logo = resolveLogoPath(brand, backgroundType);

  if (!logo) {
    return { detected: false };
  }

  return {
    detected: true,
    brand,
    backgroundType,
    ...logo,
  };
}
