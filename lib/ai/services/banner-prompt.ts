/**
 * BannerPromptService — converts a banner brief into a hero-only visual scene
 * description optimised for Higgsfield.
 *
 * The generated prompt DESCRIBES ONLY the hero image subject (person, product,
 * scene, lighting). It explicitly excludes any text, logos, typography, or
 * layout elements — those are rendered deterministically by the frontend canvas.
 *
 * Provider requirement: "text-generation" (satisfied by GeminiProvider).
 */

import type { GenerateRequest, GenerateResponse } from "../types";
import { AIService } from "./base";
import { ParseError } from "../errors";
import { extractJson } from "@/lib/llm-client";
import {
  detectSubjectCategory,
  resolveCameraFraming,
  buildCompositionBlock,
  COMPOSITION_NEGATIVE,
  COMPOSITION_PREFIX,
  BANNER_CANVAS_SPECS,
  DEFAULT_CANVAS_KEY,
} from "./banner-composition";

// ── Input / Output types ──────────────────────────────────────────────────────

export interface BannerHeroInput {
  campaignName:        string;
  tagline1:            string;
  tagline2:            string;
  product:             string;
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

// ── Service ───────────────────────────────────────────────────────────────────

export class BannerPromptService extends AIService<BannerHeroInput, BannerPromptOutput> {
  readonly serviceName        = "BannerPromptService";
  readonly requiredCapability = "text-generation" as const;

  protected buildRequest(input: BannerHeroInput): GenerateRequest {
    const text = buildHeroPromptInstructions(input);

    return {
      messages:    [{ role: "user", content: text }],
      maxTokens:   1024,
      temperature: 0.65,
    };
  }

  protected parseResponse(
    response: GenerateResponse,
    input: BannerHeroInput,
  ): BannerPromptOutput {
    // Caller-supplied override bypasses the LLM — return it directly.
    if (input.heroPromptOverride?.trim()) {
      return {
        optimizedPrompt: input.heroPromptOverride.trim(),
        negativePrompt:  COMPOSITION_NEGATIVE,
      };
    }

    let parsed: unknown = null;
    try {
      parsed = extractJson(response.text);
    } catch {
      /* JSON parsing failed; raw text fallback below */
    }

    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      const obj = parsed as Record<string, unknown>;
      if (typeof obj.optimizedPrompt === "string" && obj.optimizedPrompt.trim()) {
        return {
          optimizedPrompt: obj.optimizedPrompt.trim(),
          negativePrompt:
            typeof obj.negativePrompt === "string"
              ? obj.negativePrompt.trim()
              : COMPOSITION_NEGATIVE,
        };
      }
    }

    // Fallback: raw text when JSON parse fails.
    const fallback = response.text.trim();
    if (!fallback) throw new ParseError("Empty prompt response from provider", "gemini");
    return { optimizedPrompt: fallback, negativePrompt: COMPOSITION_NEGATIVE };
  }
}

// ── Style → visual direction ──────────────────────────────────────────────────

const STYLE_DIRECTIONS: Record<string, string> = {
  Modern:
    "clean modern commercial lifestyle photography, soft natural light, " +
    "contemporary Vietnamese café or urban setting, warm bokeh background, " +
    "magazine editorial quality",
  Festive:
    "vibrant Vietnamese festive atmosphere, warm golden light, " +
    "celebratory mood with subtle traditional Vietnamese decorative elements, " +
    "joyful and aspirational composition",
  Minimal:
    "ultra-clean minimalist studio product photography, pure soft-gradient background " +
    "matching ZaloPay green palette, precise geometric composition, " +
    "Scandinavian-influenced aesthetics, deliberate negative space",
  Bold:
    "dramatic high-contrast commercial photography, dynamic diagonal composition, " +
    "powerful directional lighting, vibrant energy matching ZaloPay brand palette, " +
    "cinematic impact",
  Corporate:
    "professional Vietnamese business environment, polished editorial quality, " +
    "trustworthy and aspirational, modern office or business lifestyle setting, " +
    "neutral sophisticated palette with ZaloPay brand accent colours",
};

// ── Prompt builder ────────────────────────────────────────────────────────────

function buildHeroPromptInstructions(input: BannerHeroInput): string {
  const styleDirection =
    (input.heroStyle && STYLE_DIRECTIONS[input.heroStyle]) ??
    STYLE_DIRECTIONS["Modern"];

  // Auto-detect subject and resolve optimal camera framing
  const category   = detectSubjectCategory(input.product);
  const framing    = resolveCameraFraming(category);
  const canvasSpec = BANNER_CANVAS_SPECS[DEFAULT_CANVAS_KEY];
  const compositionBlock = buildCompositionBlock({ category, framing, canvasSpec });

  const lines: string[] = [
    "You are a senior visual art director specialising in Vietnamese fintech advertising.",
    "",
    "Your task: write ONE concise visual scene description for an AI image generator.",
    "This image will be the HERO of a ZaloPay advertising banner — a 1:1 square canvas.",
    "",
    "CRITICAL CONSTRAINTS — NEVER appear in the prompt:",
    "  - No text, words, letters, numbers, or typography of any kind",
    "  - No logos, brand marks, watermarks, or symbols",
    "  - No UI overlays, labels, banner layout, or graphic design elements",
    "  - No quality descriptors (8K, photorealistic, HDR) — the pipeline handles those",
    "  - No aspect ratio or canvas size instructions — already handled below",
    "",
    "Why: text, logos, and taglines are rendered deterministically by the frontend canvas.",
    "The AI must generate ONLY the visual scene — a human subject, product, environment, light.",
    "",
    "═══ COMPOSITION — MANDATORY FRAMING SYSTEM ════════════════════════════════",
    COMPOSITION_PREFIX,
    "",
    compositionBlock,
    "════════════════════════════════════════════════════════════════════════════",
    "",
    "CAMERA FRAMING RATIONALE:",
    `  Detected subject type: ${category}`,
    `  Auto-selected framing: ${framing}`,
    "  The generated scene MUST respect this framing choice.",
    "  Never crop heads. Never crop product edges. Never crop full-body subjects at the knees.",
    "",
    "HERO BRIEF:",
    `  Product / Subject : ${input.product}`,
  ];

  if (input.campaignName?.trim()) lines.push(`  Campaign          : ${input.campaignName}`);
  if (input.audience?.trim())     lines.push(`  Target audience   : ${input.audience}`);
  if (input.tagline1?.trim())     lines.push(`  Tagline 1 context : ${input.tagline1} (context only — do NOT render)`);
  if (input.tagline2?.trim())     lines.push(`  Tagline 2 context : ${input.tagline2} (context only — do NOT render)`);

  lines.push(
    "",
    "VISUAL DIRECTION:",
    `  Style: ${styleDirection}`,
    "",
    "ZALOPAY BRAND ESSENCE (inject naturally — not as visible props or labels):",
    "  - Brand colours: #0033C9 (deep blue), #00CF6A (vibrant green)",
    "  - Young Vietnamese urban professionals, age 20–35, modern city lifestyle",
    "  - Modern smartphone naturally visible if it fits the scene",
    "  - Premium commercial advertising photography, magazine cover quality",
    "  - Vietnamese street scenes, modern cafés, homes, or lifestyle settings",
    "",
    "DEPTH-OF-FIELD GUIDANCE:",
    "  - Use natural shallow depth-of-field; subject is sharp, background softly blurs.",
    "  - The background fills the full frame — continuing above and around the subject.",
    "  - Scene colours should complement ZaloPay green (#00CF6A); avoid pure white or",
    "    harsh overexposed backgrounds that clash with the brand gradient overlay.",
    "",
    "OUTPUT: Return ONLY a valid JSON object — no markdown fences, no commentary:",
    `{"optimizedPrompt": "…pure visual scene description, max 150 words…", "negativePrompt": "…"}`,
  );

  return lines.join("\n");
}
