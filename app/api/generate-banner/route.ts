/**
 * POST /api/generate-banner
 *
 * Template-based Banner Generator — generates ONLY the hero image.
 * Logo, taglines, and background are rendered client-side by BannerCanvas.
 *
 * Architecture:
 *   Step 1  BannerPromptService (Gemini) converts the brief into a composition-aware
 *           visual scene description (no text, no logos; safe-area constraints injected
 *           by banner-composition.ts into the LLM prompt).
 *   Step 2  Composition prefix (banner-composition.ts) is prepended to the scene
 *           description — same safe-area rules enforced a second time at the image
 *           model layer. Subject category auto-detected; camera framing auto-selected.
 *   Step 3  generateImageCore (Higgsfield) generates the hero image at 1:1 (square)
 *           so the AI composition maps directly onto the 1200×1200 canvas.
 *
 * Request body:
 *   product            string   required — hero subject description
 *   campaignName       string   optional
 *   tagline1           string   optional — for AI context only, NOT rendered by AI
 *   tagline2           string   optional — for AI context only, NOT rendered by AI
 *   audience           string   optional
 *   heroStyle          string   optional — "Modern"|"Minimal"|"Bold"|"Festive"|"Corporate"
 *   heroPromptOverride string   optional — bypasses BannerPromptService when set
 *
 * Response:
 *   heroImageUrl       string   — Supabase public URL of the AI-generated hero image
 *   heroPrompt         string   — actual prompt used (for display in UI)
 *   generationTime     number   — wall-clock ms
 *   wasCompressed      boolean
 */

import { NextRequest, NextResponse } from "next/server";
import { GeminiProvider } from "@/lib/ai/provider/gemini";
import { BannerPromptService } from "@/lib/ai/services/banner-prompt";
import { generateImageCore } from "@/lib/ai/services/image-generation-core";
import {
  AIError,
  QuotaExceededError,
  ContentFilterError,
  InvalidRequestError,
  ProviderUnavailableError,
} from "@/lib/ai/errors";
import { aiProviderConfig } from "@/lib/config";
import type { ImageStyle } from "@/lib/ai/types/image";
import {
  detectSubjectCategory,
  resolveCameraFraming,
  buildCompositionBlock,
  COMPOSITION_AVOID_INLINE,
  BANNER_CANVAS_SPECS,
  DEFAULT_CANVAS_KEY,
} from "@/lib/ai/services/banner-composition";

export const runtime    = "nodejs";
export const maxDuration = 120;

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

// ── Gemini provider singleton ─────────────────────────────────────────────────

let _gemini: GeminiProvider | null = null;
function getGemini(): GeminiProvider {
  if (!_gemini) _gemini = new GeminiProvider(aiProviderConfig.gemini);
  return _gemini;
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

  // ── Step 1: Build hero-only visual prompt ─────────────────────────────────
  let heroPrompt: string;

  if (heroPromptOverride?.trim()) {
    heroPrompt = heroPromptOverride.trim();
  } else {
    try {
      const promptService = new BannerPromptService(getGemini());
      const result = await promptService.execute(
        {
          campaignName:       campaignName ?? "",
          tagline1:           tagline1     ?? "",
          tagline2:           tagline2     ?? "",
          product:            product!,
          audience,
          heroStyle,
        },
        { timeoutMs: 30_000 },
      );
      heroPrompt = result.optimizedPrompt;
    } catch (e) {
      const msg = (e as Error).message ?? "Unknown error";
      console.error("[POST /api/generate-banner] Step 1 — Prompt build failed:", msg);

      if (e instanceof InvalidRequestError) {
        return NextResponse.json(
          { error: `Cấu hình Gemini không hợp lệ: ${msg}` },
          { status: 400 },
        );
      }
      if (e instanceof QuotaExceededError) {
        return NextResponse.json(
          { error: `Gemini quota exceeded. Check GEMINI_API_KEY and billing. Detail: ${msg}` },
          { status: 429 },
        );
      }
      return NextResponse.json(
        { error: `Xây dựng prompt thất bại: ${msg}` },
        { status: 500 },
      );
    }
  }

  // ── Step 2: Build final composition-enforced prompt ──────────────────────
  //
  // Composition rules are injected at TWO layers:
  //   Layer 1 (already done): BannerPromptService (Gemini) wrote a composition-
  //           aware scene description using buildCompositionBlock() in its prompt.
  //   Layer 2 (here): we prepend the same safe-area block to the final prompt
  //           sent to Higgsfield so the image model receives hard composition
  //           constraints regardless of how the LLM paraphrased them.
  //
  // aspectRatio "1:1" — hero is generated at square (matching the 1200×1200 canvas)
  // so the AI's composition maps 1:1 onto the canvas with no surprise cropping.
  const subject    = product ?? heroPromptOverride ?? "";
  const category   = detectSubjectCategory(subject);
  const framing    = resolveCameraFraming(category);
  const canvasSpec = BANNER_CANVAS_SPECS[DEFAULT_CANVAS_KEY];

  const compositionBlock = buildCompositionBlock({ category, framing, canvasSpec });

  const finalHeroPrompt = [
    compositionBlock,
    "",
    "SCENE:",
    heroPrompt,
    "",
    `AVOID: ${COMPOSITION_AVOID_INLINE}`,
  ].join("\n");

  // ── Step 3: Generate hero image via shared Higgsfield pipeline ────────────
  let generated: Awaited<ReturnType<typeof generateImageCore>>;

  try {
    generated = await generateImageCore({
      prompt:      finalHeroPrompt,
      style:       imageStyle,
      aspectRatio: "1:1",
      quality:     "hd",
    });
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
      // ProviderUnavailableError.message now contains real CLI detail (ENOENT, stderr, etc.)
      return NextResponse.json({ error: msg }, { status: 503 });
    }
    if (e instanceof AIError) {
      return NextResponse.json({ error: msg }, { status: 500 });
    }

    return NextResponse.json({ error: msg }, { status: 500 });
  }

  return NextResponse.json({
    heroImageUrl:   generated.imageUrl,
    heroPrompt,
    generationTime: generated.generationTime,
    wasCompressed:  generated.wasCompressed,
    // Legacy fields for any cached frontend code still expecting them
    imageDataUrl:   generated.imageUrl,
    prompt:         heroPrompt,
  });
}
