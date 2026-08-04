/**
 * POST /api/generate-banner
 *
 * Template-based Banner Generator — generates ONLY the hero image.
 * Logo, taglines, and background are rendered client-side by BannerCanvas.
 *
 * Architecture:
 *   Step 1  BannerPromptService (Gemini) converts the brief into a visual scene
 *           description for the hero area (no text, no logos in the prompt).
 *   Step 2  generateImageCore (HiggsField) generates the hero image at 16:9.
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

  // ── Step 2: Generate hero image via shared Higgsfield pipeline ────────────
  // Same pipeline as Image Generator — one shared generateImageCore(), one provider.
  let generated: Awaited<ReturnType<typeof generateImageCore>>;

  try {
    generated = await generateImageCore({
      prompt:      heroPrompt,
      style:       imageStyle,
      aspectRatio: "16:9",
      quality:     "hd",
    });
  } catch (e) {
    const msg = (e as Error).message ?? "Lỗi không xác định.";
    console.error("[POST /api/generate-banner] Step 2 — Higgsfield generation failed:", msg);

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
