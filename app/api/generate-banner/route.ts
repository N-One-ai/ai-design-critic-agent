/**
 * POST /api/generate-banner
 *
 * Template-based Banner Generator — generates ONLY the hero image.
 * Logo, taglines, and background are rendered client-side by BannerCanvas.
 *
 * Architecture:
 *   Step 1  buildHeroPrompt() (pure template, no LLM) builds the hero prompt.
 *   Step 2  Composition prefix (banner-composition.ts) is prepended to the scene
 *           description — safe-area constraints enforced at the image-model layer.
 *           Subject category auto-detected; camera framing auto-selected.
 *   Step 3  generateImageCore (Higgsfield) generates the hero image at 1:1 (square).
 *           Composition is validated via Gemini vision after each attempt.
 *           Up to MAX_COMPOSITION_RETRIES attempts; each retry strengthens the
 *           safe-area instruction in the prompt.
 *
 * Request body:
 *   product            string   required — hero subject description
 *   campaignName       string   optional
 *   tagline1           string   optional — for AI context only, NOT rendered by AI
 *   tagline2           string   optional — for AI context only, NOT rendered by AI
 *   audience           string   optional
 *   heroStyle          string   optional — "Modern"|"Minimal"|"Bold"|"Festive"|"Corporate"
 *   heroPromptOverride string   optional — bypasses buildHeroPrompt when set
 *
 * Response:
 *   heroImageUrl       string   — Supabase public URL of the AI-generated hero image
 *   heroPrompt         string   — actual prompt used (for display in UI)
 *   generationTime     number   — wall-clock ms
 *   wasCompressed      boolean
 *   compositionAttempts number  — how many generation attempts were made
 */

import { NextRequest, NextResponse } from "next/server";
import { buildHeroPrompt } from "@/lib/ai/services/banner-prompt";
import { generateImageCore } from "@/lib/ai/services/image-generation-core";
import { GeminiProvider } from "@/lib/ai/provider/gemini";
import { aiProviderConfig } from "@/lib/config";
import {
  AIError,
  QuotaExceededError,
  ContentFilterError,
  InvalidRequestError,
  ProviderUnavailableError,
} from "@/lib/ai/errors";
import type { ImageStyle } from "@/lib/ai/types/image";
import {
  detectSubjectCategory,
  resolveCameraFraming,
  buildCompositionBlock,
  COMPOSITION_PREFIX,
  COMPOSITION_AVOID_INLINE,
  BANNER_CANVAS_SPECS,
  DEFAULT_CANVAS_KEY,
} from "@/lib/ai/services/banner-composition";

export const runtime     = "nodejs";
export const maxDuration = 180; // extended: up to 3 generation attempts + vision validation

// ── Composition validator ─────────────────────────────────────────────────────

const MAX_COMPOSITION_RETRIES = 3;

// Progressively stronger safe-area instruction appended on retry attempts.
// Attempt 0: base prompt (no suffix). Attempt 1+: reinforced suffix.
const RETRY_COMPOSITION_BOOST: readonly string[] = [
  "",
  " MANDATORY: Subject face/head MUST be at or below 40% from canvas top. Full body in lower 65%.",
  " HARD REQUIREMENT: Face visible starting at 50% canvas height. Entire body strictly in bottom 65%. No exception.",
];

let _geminiSingleton: GeminiProvider | null = null;
function getGemini(): GeminiProvider {
  if (!_geminiSingleton) _geminiSingleton = new GeminiProvider(aiProviderConfig.gemini);
  return _geminiSingleton;
}

/**
 * Fetch a remote image and convert to a data URL for Gemini vision.
 * Returns null on network or size errors (validator will accept the image).
 */
async function fetchImageAsDataUrl(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(12_000) });
    if (!res.ok) return null;
    const buffer = await res.arrayBuffer();
    if (buffer.byteLength > 6 * 1024 * 1024) return null; // skip if >6 MB
    const base64   = Buffer.from(buffer).toString("base64");
    const mimeType = (res.headers.get("content-type") ?? "image/jpeg").split(";")[0].trim();
    return `data:${mimeType};base64,${base64}`;
  } catch {
    return null;
  }
}

/**
 * Validate whether the hero image respects the 35/65 safe-area contract.
 * Returns true  → composition is acceptable (accept the image).
 * Returns false → subject appears in the top 35%, retry recommended.
 * Always returns true on any error so validation never blocks generation.
 */
async function validateHeroComposition(imageUrl: string): Promise<boolean> {
  const dataUrl = await fetchImageAsDataUrl(imageUrl);
  if (!dataUrl) return true; // can't fetch — accept

  try {
    const result = await getGemini().generate({
      messages: [
        {
          role: "user",
          content: [
            { type: "image", imageDataUrl: dataUrl } as never,
            {
              type: "text",
              text:
                "Analyze this square advertising banner image.\n" +
                "The TOP 35% of the image will be covered by a logo and text overlay.\n" +
                "Determine: Are the subject's FACE, HEAD, EYES, HANDS, and main PRODUCT\n" +
                "completely within the BOTTOM 65% of the image height?\n" +
                "A face/head whose top is above the 40% mark from the top is a VIOLATION.\n" +
                "Respond ONLY with valid JSON (no markdown, no explanation):\n" +
                '{"ok":true} if the subject is fully in the lower area, {"ok":false} if not.',
            },
          ],
        },
      ],
      maxTokens: 30,
      temperature: 0,
    });

    const clean  = result.text.trim().replace(/```[a-z]*\n?|```/g, "").trim();
    const parsed = JSON.parse(clean) as { ok?: boolean };
    return parsed.ok !== false; // default true unless explicitly false
  } catch (err) {
    console.warn("[validateHeroComposition] Skipped:", (err as Error).message);
    return true;
  }
}

// ── VisualStyle → ImageStyle ──────────────────────────────────────────────────

const STYLE_MAP: Record<string, ImageStyle> = {
  Modern:    "realistic",
  Minimal:   "flat-design",
  Bold:      "cinematic",
  Festive:   "illustration",
  Corporate: "editorial",
};

function heroStyleToImageStyle(heroStyle: string | undefined): ImageStyle {
  return (heroStyle ? STYLE_MAP[heroStyle] : undefined) ?? "realistic";
}

// ── Route ─────────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  let body: {
    product?:            string;
    campaignName?:       string;
    tagline1?:           string;
    tagline2?:           string;
    audience?:           string;
    heroStyle?:          string;
    heroPromptOverride?: string;
  };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const {
    product,
    campaignName,
    tagline1,
    tagline2,
    audience,
    heroStyle,
    heroPromptOverride,
  } = body;

  if (!product?.trim() && !heroPromptOverride?.trim()) {
    return NextResponse.json(
      { error: "Vui lòng nhập mô tả sản phẩm hoặc chủ thể hero." },
      { status: 400 },
    );
  }

  const imageStyle = heroStyleToImageStyle(heroStyle);

  // ── Step 1: Build hero prompt — pure template, no LLM ────────────────────
  //
  // The user's subject is always preserved verbatim. We only append quality,
  // lighting (when absent), framing, and composition constraints.
  // No AI rewrite occurs here — subject injection risk is eliminated.
  const { optimizedPrompt, negativePrompt: builtNegative } = buildHeroPrompt({
    product:            product            ?? "",
    campaignName:       campaignName       ?? "",
    tagline1:           tagline1           ?? "",
    tagline2:           tagline2           ?? "",
    audience,
    heroStyle,
    heroPromptOverride,
  });
  const heroPrompt = optimizedPrompt;

  // ── Step 2: Assemble final composition-enforced prompt ───────────────────
  //
  // Structure (highest → lowest image model weight):
  //   [1] heroPrompt     — user's subject verbatim + quality enhancers (from Step 1)
  //   [2] compositionBlock — framing / position rules (no subject injection)
  //   [3] AVOID clause   — negative constraints inline
  //
  // User subject leads the prompt so the image model treats it as highest priority.
  // aspectRatio "1:1" — hero is generated at square (matching the 1200×1200 canvas).
  const subject    = product ?? heroPromptOverride ?? "";
  const category   = detectSubjectCategory(subject);
  const framing    = resolveCameraFraming(category);
  const canvasSpec = BANNER_CANVAS_SPECS[DEFAULT_CANVAS_KEY];

  const compositionBlock = buildCompositionBlock({ category, framing, canvasSpec });

  const finalHeroPrompt = [
    heroPrompt,
    "",
    compositionBlock,
    "",
    `AVOID: ${COMPOSITION_AVOID_INLINE}`,
  ].join("\n");

  // ── Step 3: Generate with smart retry (composition-validated, max 3 attempts) ─
  //
  // After each generation the image is analyzed with Gemini vision.
  // If the subject appears in the top 35% (Brand Zone), the prompt is
  // strengthened with an explicit safe-area instruction and regenerated.
  // The last attempt is always accepted regardless of composition score.
  let generated: Awaited<ReturnType<typeof generateImageCore>>;
  let compositionAttempts = 0;

  try {
    for (let attempt = 0; attempt < MAX_COMPOSITION_RETRIES; attempt++) {
      compositionAttempts = attempt + 1;
      const boost        = RETRY_COMPOSITION_BOOST[attempt] ?? "";
      const promptForRun = attempt === 0 ? finalHeroPrompt : finalHeroPrompt + boost;

      // eslint-disable-next-line no-await-in-loop
      generated = await generateImageCore({
        prompt:      promptForRun,
        style:       imageStyle,
        aspectRatio: "1:1",
        quality:     "hd",
      });

      // Always accept the last attempt
      if (attempt >= MAX_COMPOSITION_RETRIES - 1) {
        console.info(`[generate-banner] Accepted on final attempt ${compositionAttempts}`);
        break;
      }

      // Validate composition via Gemini vision
      // eslint-disable-next-line no-await-in-loop
      const compositionOk = await validateHeroComposition(generated!.imageUrl);
      if (compositionOk) {
        console.info(`[generate-banner] Composition OK on attempt ${compositionAttempts}`);
        break;
      }
      console.warn(
        `[generate-banner] Composition failed attempt ${compositionAttempts}/${MAX_COMPOSITION_RETRIES}, retrying…`,
      );
    }
  } catch (e) {
    const msg = (e as Error).message ?? "Lỗi không xác định.";
    console.error("[POST /api/generate-banner] Step 3 — Higgsfield generation failed:", msg);

    if (e instanceof QuotaExceededError) {
      return NextResponse.json(
        { error: `Higgsfield quota exhausted. ${msg}` },
        { status: 429 },
      );
    }
    if (e instanceof ContentFilterError) {
      return NextResponse.json(
        { error: `Nội dung bị từ chối bởi content filter. Hãy thử prompt khác. Detail: ${msg}` },
        { status: 422 },
      );
    }
    if (e instanceof InvalidRequestError) {
      return NextResponse.json(
        { error: `Yêu cầu không hợp lệ cho Higgsfield: ${msg}` },
        { status: 400 },
      );
    }
    if (e instanceof ProviderUnavailableError) {
      return NextResponse.json({ error: msg }, { status: 503 });
    }
    if (e instanceof AIError) {
      return NextResponse.json({ error: msg }, { status: 500 });
    }

    return NextResponse.json({ error: msg }, { status: 500 });
  }

  return NextResponse.json({
    heroImageUrl:        generated!.imageUrl,
    heroPrompt,
    generationTime:      generated!.generationTime,
    wasCompressed:       generated!.wasCompressed,
    compositionAttempts,
    // Legacy fields
    imageDataUrl:        generated!.imageUrl,
    prompt:              heroPrompt,
  });
}
