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

// ── Input / Output types ──────────────────────────────────────────────────────

export interface BannerHeroInput {
  campaignName:       string;
  tagline1:           string;
  tagline2:           string;
  product:            string;
  audience?:          string;
  heroStyle?:         string;
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
    // If caller supplied an override, skip the LLM entirely — still a valid
    // GenerateRequest but we'll shortcut in parseResponse.
    const text = buildHeroPromptInstructions(input);

    return {
      messages:    [{ role: "user", content: text }],
      maxTokens:   1024,  // 512 was too low — truncated JSON mid-string
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
        negativePrompt:  DEFAULT_NEGATIVE,
      };
    }

    // extractJson throws on malformed JSON — catch and fall through to raw-text fallback.
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
            typeof obj.negativePrompt === "string" ? obj.negativePrompt.trim() : DEFAULT_NEGATIVE,
        };
      }
    }

    // Fallback: Gemini returned text but not valid JSON — use the raw text as the prompt.
    // This handles truncated JSON (low maxTokens) and unexpected model formatting.
    const fallback = response.text.trim();
    if (!fallback) throw new ParseError("Empty prompt response from provider", "gemini");
    return { optimizedPrompt: fallback, negativePrompt: DEFAULT_NEGATIVE };
  }
}

// ── Constants ─────────────────────────────────────────────────────────────────

const DEFAULT_NEGATIVE =
  "text in image, logo in image, watermark, typography, words, letters, numbers, " +
  "UI overlay, HUD, banner layout, brand guidelines overlay, distorted, deformed hands, " +
  "duplicate subjects, oversaturated, grainy, amateurish, stock photo look, " +
  "subject in top half of frame, face near top edge, product near top edge, " +
  "centered subject with no negative space, cluttered top area";

// Style → visual direction mapping
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
    "neutral sophisticated palette with ZaloPay brand accent colors",
};

// ── Prompt builder ────────────────────────────────────────────────────────────

function buildHeroPromptInstructions(input: BannerHeroInput): string {
  const styleDirection =
    (input.heroStyle && STYLE_DIRECTIONS[input.heroStyle]) ??
    STYLE_DIRECTIONS["Modern"];

  const lines: string[] = [
    "You are a senior visual art director specialising in Vietnamese fintech advertising.",
    "",
    "Your task: write ONE concise visual scene description for an AI image generator.",
    "This image will be the HERO of a ZaloPay advertising banner.",
    "",
    "CRITICAL CONSTRAINTS — the following must NEVER appear in the prompt:",
    "  - No text, words, letters, numbers, or typography of any kind",
    "  - No logos, brand marks, watermarks, or symbols",
    "  - No UI overlays, labels, banner layout, or graphic design elements",
    "  - No quality descriptors (8K, photorealistic, HDR)",
    "  - No aspect ratio or canvas size — the pipeline handles those",
    "",
    "Why: text, logos, and taglines are rendered deterministically by the frontend.",
    "The AI must generate ONLY the visual scene — a human subject, product, environment, light.",
    "",
    "HERO BRIEF:",
    `  Product / Subject : ${input.product}`,
  ];

  if (input.campaignName?.trim()) lines.push(`  Campaign          : ${input.campaignName}`);
  if (input.audience?.trim())     lines.push(`  Target audience   : ${input.audience}`);
  if (input.tagline1?.trim())     lines.push(`  Tagline 1 context : ${input.tagline1} (DON'T render — visual context only)`);
  if (input.tagline2?.trim())     lines.push(`  Tagline 2 context : ${input.tagline2} (DON'T render — visual context only)`);

  lines.push(
    "",
    "VISUAL DIRECTION:",
    `  Style: ${styleDirection}`,
    "",
    "ZALOPAY BRAND ESSENCE (inject naturally — not as props or labels):",
    "  - Brand colours: #0033C9 (deep blue), #00CF6A (vibrant green)",
    "  - Young Vietnamese urban professionals, age 20–35, modern city lifestyle",
    "  - Modern smartphone prominently visible if it fits the scene (ZaloPay app on screen)",
    "  - Premium commercial advertising photography, magazine cover quality",
    "  - Vietnamese street scenes, modern cafés, homes, or lifestyle settings",
    "",
    "COMPOSITION — CRITICAL for full-canvas key visual layout:",
    "  - This image fills the ENTIRE 1200×1200 square banner as a full-bleed background.",
    "  - The TOP 40–45% of the frame is covered by a brand green gradient overlay",
    "    (logo + taglines rendered on top). Place ONLY negative space, open sky,",
    "    soft backgrounds, or shallow depth-of-field blur in the top 40%.",
    "  - NEVER place faces, product details, hands, or focal subjects in the top 40%.",
    "  - Place the PRIMARY SUBJECT (person, product, scene focus) in the lower 55–65%.",
    "  - Centre the subject horizontally — the image is cropped from a 16:9 frame to",
    "    a 1:1 square by taking the centre portion; off-centre subjects will be clipped.",
    "  - Use generous depth-of-field: a soft, slightly blurred background in the upper",
    "    portion creates a natural transition into the green overlay.",
    "  - Background colour in the upper portion should complement ZaloPay green",
    "    (#00CF6A → #009A50) — avoid pure white or very bright colours at the top",
    "    as this will require stronger overlay and reduce the hero reveal effect.",
    "",
    "OUTPUT: Return ONLY a valid JSON object — no markdown fences, no commentary:",
    `{"optimizedPrompt": "…pure visual scene description, max 150 words…", "negativePrompt": "${DEFAULT_NEGATIVE}"}`,
  );

  return lines.join("\n");
}
