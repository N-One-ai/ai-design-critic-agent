/**
 * Hero Image Prompt Builder — pure template assembler.
 *
 * Design principle:
 *   The user's prompt is the HIGHEST priority. We never replace, rewrite,
 *   or override the subject, action, product, location, or any element the
 *   user explicitly requested.
 *
 *   We ONLY append:
 *     1. User prompt (verbatim)
 *     2. Advertising quality tag
 *     3. Lighting (only when absent from user prompt)
 *     4. Camera framing hint (1 short sentence)
 *     5. Style quality descriptor (mood / rendering, NO subject matter)
 *     6. Copy-space constraint
 *     7. No-text / no-logo constraint
 *
 * No LLM call is needed or made here.
 * Gemini / AI is completely removed from this step.
 */

import {
  detectSubjectCategory,
  resolveCameraFraming,
  COMPOSITION_NEGATIVE,
} from "./banner-composition";
import type { CameraFraming } from "./banner-composition";

// ── Input / output ────────────────────────────────────────────────────────────

export interface BannerHeroInput {
  product:             string;
  campaignName?:       string;
  tagline1?:           string;
  tagline2?:           string;
  audience?:           string;
  heroStyle?:          string;
  heroPromptOverride?: string;
}

export interface BannerPromptOutput {
  optimizedPrompt: string;
  negativePrompt?: string;
}

// Legacy alias — kept so any remaining callers still compile
export type BannerPromptInput = BannerHeroInput;

// ── Style quality table ───────────────────────────────────────────────────────
//
// These are RENDERING / MOOD descriptors only.
// They MUST NOT inject subject matter (people, objects, locations, background).

const STYLE_QUALITY: Readonly<Record<string, string>> = {
  Modern:    "Clean modern aesthetic. Warm natural bokeh. Magazine editorial quality.",
  Festive:   "Warm golden tones. Celebratory mood. Vibrant and joyful color grading.",
  Minimal:   "Ultra-clean minimalist composition. Deliberate negative space. Pure tones.",
  Bold:      "High-contrast dramatic lighting. Cinematic impact. Dynamic composition.",
  Corporate: "Polished professional aesthetic. Trustworthy and aspirational. Neutral palette.",
};

// ── Camera framing one-liners ─────────────────────────────────────────────────
//
// Short framing hint appended to help the image model compose correctly.
// Never describes what's IN the scene.

const FRAMING_HINTS: Readonly<Record<CameraFraming, string>> = {
  "medium-shot":            "Medium shot, subject waist-up.",
  "medium-full-shot":       "Medium full shot, full body visible from head to feet.",
  "close-up":               "Close-up shot, fine detail.",
  "three-quarter-shot":     "Three-quarter shot, head to below knees.",
  "hero-product-shot":      "Hero product shot, angled perspective, full product visible.",
  "wide-establishing-shot": "Wide establishing shot, environment fills the frame.",
};

// ── Lighting keyword detection ────────────────────────────────────────────────

function hasLightingKeyword(text: string): boolean {
  return /\b(light|lighting|studio|backlit|backlight|golden hour|shadow|silhouette|lamp|flash|strobe|sun|dawn|dusk|daylight|ánh sáng|đèn|sáng|sáng tối|chiếu sáng)\b/i.test(text);
}

// ── Core pure builder ─────────────────────────────────────────────────────────

/**
 * Assembles the hero image prompt without calling any LLM.
 *
 * Priority order (highest → lowest):
 *   1. User's prompt (verbatim — never modified)
 *   2. Commercial advertising tag
 *   3. Lighting (injected only when missing from user input)
 *   4. Camera framing hint
 *   5. Style quality (mood/rendering, no subject matter)
 *   6. Copy-space instruction
 *   7. No-text constraint
 */
export function buildHeroPrompt(input: BannerHeroInput): BannerPromptOutput {
  // If the user provided a full override, send it with minimal additions only
  const userInput = input.heroPromptOverride?.trim()
    ? input.heroPromptOverride.trim()
    : (input.product?.trim() ?? "");

  if (!userInput) {
    return { optimizedPrompt: "", negativePrompt: COMPOSITION_NEGATIVE };
  }

  const category = detectSubjectCategory(userInput);
  const framing  = resolveCameraFraming(category);
  const quality  = STYLE_QUALITY[input.heroStyle ?? "Modern"] ?? STYLE_QUALITY["Modern"];
  const framingHint = FRAMING_HINTS[framing];

  const parts: string[] = [];

  // ── 1. User prompt — verbatim, no modification ────────────────────────────
  parts.push(userInput);

  // ── 2. Advertising quality context ───────────────────────────────────────
  parts.push("Commercial advertising photography. Premium campaign visual.");

  // ── 3. Lighting — add only if user did not specify ────────────────────────
  if (!hasLightingKeyword(userInput)) {
    parts.push("Professional studio lighting, soft shadows.");
  }

  // ── 4. Camera framing ────────────────────────────────────────────────────
  parts.push(framingHint);

  // ── 5. Style / rendering quality (NO subject/location injection) ──────────
  parts.push(quality);

  // ── 6. Copy-space rule ────────────────────────────────────────────────────
  parts.push(
    "Subject positioned in the lower portion of the frame. " +
    "Leave generous natural space at the top for typography overlay."
  );

  // ── 7. No-text / no-logo ──────────────────────────────────────────────────
  parts.push("No text. No watermark. No logo. No typography in the image.");

  return {
    optimizedPrompt: parts.join(" "),
    negativePrompt:  COMPOSITION_NEGATIVE,
  };
}

// ── Deprecated service shim (kept for build compatibility) ────────────────────
//
// Any code still calling `new BannerPromptService(provider).execute(input)` will
// compile and work — but NO LLM call is made. The pure builder runs synchronously.

import { AIService } from "./base";
import type { GenerateRequest, GenerateResponse } from "../types";

export class BannerPromptService extends AIService<BannerHeroInput, BannerPromptOutput> {
  readonly serviceName        = "BannerPromptService";
  readonly requiredCapability = "text-generation" as const;

  protected buildRequest(_input: BannerHeroInput): GenerateRequest {
    // Returning a no-op minimal request — this will never actually be used
    // because parseResponse short-circuits on the first call.
    return {
      messages:  [{ role: "user", content: "noop" }],
      maxTokens: 1,
    };
  }

  protected parseResponse(
    _response: GenerateResponse,
    input: BannerHeroInput,
  ): BannerPromptOutput {
    // Always use the pure builder — ignore LLM response.
    return buildHeroPrompt(input);
  }
}
