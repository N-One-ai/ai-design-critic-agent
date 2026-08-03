/**
 * POST /api/generate-banner
 *
 * Banner Generator pipeline — uses the SAME image generation service as
 * POST /api/image/generate (Higgsfield → Gemini Image model).
 *
 * Architecture:
 *   Step 1  BannerPromptService (Gemini text model)
 *           → converts marketing brief into an optimized visual scene description
 *   Step 2  generateImageCore (HiggsFieldProvider)
 *           → generates the image from the optimized prompt
 *
 * Banner Generator is a Prompt Builder on top of Image Generator.
 * No separate image provider. No separate generation pipeline.
 * Changing the image provider requires editing only image-generation-core.ts.
 *
 * Request body:
 *   campaignObjective  string   required
 *   promotion          string   optional
 *   brand              string   optional
 *   targetAudience     string   optional
 *   platform           string   optional  ("facebook"|"instagram"|"story"|"web")
 *   language           string   optional  ("vi"|"en")
 *   visualStyle        string   optional  ("Modern"|"Minimal"|"Bold"|"Festive"|"Corporate")
 *   dimensions         object   optional  { width, height }
 *   customPrompt       string   optional  — bypasses prompt builder when provided
 *   referenceImageDataUrl string optional — sent to Gemini as style inspiration
 *
 * Response (compatible with existing BannerGeneratorPage parser):
 *   imageDataUrl       string   — Supabase public URL or data: URL
 *   prompt             string   — final prompt used for generation
 *   negativePrompt     string?  — negative prompt (for display)
 *   generationId       string
 *   dimensions         object
 *   platform           string?
 *   visualStyle        string?
 *   generationTime     number   — wall-clock ms
 *   wasCompressed      boolean
 */

import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { GeminiProvider } from "@/lib/ai/providers/gemini";
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
import type { ImageStyle, AspectRatio } from "@/lib/ai/types/image";

export const runtime   = "nodejs";
export const maxDuration = 120;

// ── Platform → AspectRatio ────────────────────────────────────────────────────

const PLATFORM_TO_RATIO: Record<string, AspectRatio> = {
  facebook:  "16:9",
  instagram: "1:1",
  story:     "9:16",
  web:       "16:9",
};

function platformToAspectRatio(
  platform: string | undefined,
  dims: { width: number; height: number },
): AspectRatio {
  if (platform && PLATFORM_TO_RATIO[platform]) return PLATFORM_TO_RATIO[platform];
  // Infer from custom dimensions
  const r = dims.width / dims.height;
  if (r > 1.6)  return "16:9";
  if (r > 1.2)  return "4:3";
  if (r < 0.7)  return "9:16";
  return "1:1";
}

// ── VisualStyle → ImageStyle ──────────────────────────────────────────────────

const STYLE_MAP: Record<string, ImageStyle> = {
  Modern:    "realistic",
  Minimal:   "flat-design",
  Bold:      "cinematic",
  Festive:   "illustration",
  Corporate: "editorial",
};

function visualStyleToImageStyle(visualStyle: string | undefined): ImageStyle {
  return (visualStyle ? STYLE_MAP[visualStyle] : undefined) ?? "realistic";
}

// ── Brand guideline loader ────────────────────────────────────────────────────

function loadBrandGuideline(): Record<string, unknown> | null {
  try {
    const raw = fs.readFileSync(
      path.join(process.cwd(), "brand-guideline.json"),
      "utf-8",
    );
    return JSON.parse(raw) as Record<string, unknown>;
  } catch {
    return null;
  }
}

// ── Gemini provider singleton ─────────────────────────────────────────────────

let _gemini: GeminiProvider | null = null;
function getGemini(): GeminiProvider {
  if (!_gemini) _gemini = new GeminiProvider(aiProviderConfig.gemini);
  return _gemini;
}

// ── Route ─────────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const contentLen = req.headers.get("content-length");
  if (contentLen && parseInt(contentLen, 10) > 20 * 1024 * 1024) {
    return NextResponse.json(
      { error: "Ảnh tham khảo quá lớn. Vui lòng chọn ảnh nhỏ hơn 20MB." },
      { status: 413 },
    );
  }

  let body: {
    campaignObjective?: string;
    promotion?: string;
    brand?: string;
    targetAudience?: string;
    platform?: string;
    language?: string;
    visualStyle?: string;
    dimensions?: { width: number; height: number };
    customPrompt?: string;
    referenceImageDataUrl?: string;
  };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const {
    campaignObjective,
    promotion,
    brand,
    targetAudience,
    platform,
    language,
    visualStyle,
    dimensions      = { width: 1200, height: 628 },
    customPrompt,
    referenceImageDataUrl,
  } = body;

  if (!customPrompt?.trim() && !campaignObjective?.trim()) {
    return NextResponse.json(
      { error: "Vui lòng nhập mục tiêu chiến dịch." },
      { status: 400 },
    );
  }

  const brandGuideline = loadBrandGuideline();
  const aspectRatio    = platformToAspectRatio(platform, dimensions);
  const imageStyle     = visualStyleToImageStyle(visualStyle);

  // ── Step 1: Build advertising prompt ─────────────────────────────────────
  // If the user supplied a custom/edited prompt, use it directly.
  // Otherwise, delegate to BannerPromptService (Gemini) to convert the brief
  // into a rich visual scene description optimized for Higgsfield.
  let finalPrompt: string;
  let negativePrompt: string | undefined;

  try {
    if (customPrompt?.trim()) {
      finalPrompt = customPrompt.trim();
    } else {
      const promptService = new BannerPromptService(getGemini());
      const promptResult  = await promptService.execute(
        {
          campaignObjective: campaignObjective!,
          promotion,
          brand,
          targetAudience,
          platform,
          language,
          visualStyle,
          dimensions,
          brandGuideline: brandGuideline ?? undefined,
          referenceImageDataUrl,
        },
        { timeoutMs: 30_000 },
      );
      finalPrompt    = promptResult.optimizedPrompt;
      negativePrompt = promptResult.negativePrompt;
    }
  } catch (e) {
    const msg = (e as Error).message ?? "";
    console.error("[POST /api/generate-banner] Prompt building failed:", msg);
    return NextResponse.json(
      { error: `Tối ưu hóa prompt thất bại: ${msg}` },
      { status: 500 },
    );
  }

  // ── Step 2: Generate image via shared Higgsfield pipeline ─────────────────
  // Same provider, same service, same model as Image Generator.
  // Banner Generator adds no separate generation implementation.
  let generated: Awaited<ReturnType<typeof generateImageCore>>;

  try {
    generated = await generateImageCore({
      prompt:      finalPrompt,
      style:       imageStyle,
      aspectRatio,
      quality:     "hd",    // banners always render at HD quality
    });
  } catch (e) {
    // Surface the exact provider error so developers can diagnose failures.
    const msg = (e as Error).message ?? "Lỗi không xác định.";

    if (e instanceof QuotaExceededError) {
      return NextResponse.json(
        { error: `Quota Higgsfield đã hết: ${msg}` },
        { status: 429 },
      );
    }
    if (e instanceof ContentFilterError) {
      return NextResponse.json(
        { error: `Nội dung bị từ chối bởi provider: ${msg}` },
        { status: 422 },
      );
    }
    if (e instanceof InvalidRequestError) {
      return NextResponse.json(
        { error: `Yêu cầu không hợp lệ: ${msg}` },
        { status: 400 },
      );
    }
    if (e instanceof ProviderUnavailableError) {
      return NextResponse.json(
        { error: `Higgsfield CLI không khả dụng. ${msg}` },
        { status: 503 },
      );
    }
    if (e instanceof AIError) {
      return NextResponse.json({ error: msg }, { status: 500 });
    }

    console.error("[POST /api/generate-banner] Generation error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }

  // ── Response ──────────────────────────────────────────────────────────────
  // Field name `imageDataUrl` preserved for backward compatibility with
  // BannerGeneratorPage (which stores results in localStorage under that key).
  return NextResponse.json({
    imageDataUrl:  generated.imageUrl,
    prompt:        finalPrompt,
    negativePrompt,
    generationId:  `banner-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    dimensions,
    platform,
    visualStyle,
    generationTime: generated.generationTime,
    wasCompressed:  generated.wasCompressed,
  });
}
