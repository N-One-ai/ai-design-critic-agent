import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { GeminiProvider } from "@/lib/ai/providers/gemini";
import { ImagenProvider } from "@/lib/ai/providers/imagen";
import { BannerPromptService } from "@/lib/ai/services/banner-prompt";
import { BannerGenerationService } from "@/lib/ai/services/banner-generation";
import { QuotaExceededError, InvalidRequestError } from "@/lib/ai/errors";
import { aiProviderConfig } from "@/lib/config";

export const runtime = "nodejs";

function loadBrandGuideline(): Record<string, unknown> | null {
  try {
    const raw = fs.readFileSync(path.join(process.cwd(), "brand-guideline.json"), "utf-8");
    return JSON.parse(raw) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function getBrandColors(bg: Record<string, unknown> | null): string[] {
  if (!bg?.colors) return [];
  const c = bg.colors as Record<string, unknown>;
  const palette: string[] = [];
  const primary   = (c.primary   as { hex?: string } | undefined)?.hex;
  const secondary = (c.secondary as { hex?: string } | undefined)?.hex;
  if (primary)   palette.push(primary);
  if (secondary) palette.push(secondary);
  return palette;
}

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
    dimensions = { width: 1200, height: 628 },
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
  const brandColors    = getBrandColors(brandGuideline);

  try {
    let finalPrompt: string;
    let negativePrompt: string | undefined;

    if (customPrompt?.trim()) {
      // User edited the prompt directly — skip Gemini step
      finalPrompt = customPrompt.trim();
    } else {
      // Step 1: Gemini builds an optimised Imagen 3 prompt from the brief
      const geminiProvider = new GeminiProvider(aiProviderConfig.gemini);
      const promptService  = new BannerPromptService(geminiProvider);

      const promptResult = await promptService.execute(
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

      finalPrompt   = promptResult.optimizedPrompt;
      negativePrompt = promptResult.negativePrompt;
    }

    // Step 2: Gemini image model generates the banner from the optimised prompt
    const imagenProvider     = new ImagenProvider(aiProviderConfig.imagen);
    const generationService  = new BannerGenerationService(imagenProvider);

    let result;
    try {
      result = await generationService.execute(
        {
          prompt: finalPrompt,
          dimensions,
          brandColors,
          brandGuideline: brandGuideline ?? undefined,
          negativePrompt,
        },
        { timeoutMs: 90_000 },
      );
    } catch (imgErr) {
      // Image generation has free-tier limit=0 — requires billing.
      // Return the optimised prompt so the user still gets value from Step 1.
      const imgMsg = (imgErr as Error).message ?? "";
      const isQuota =
        imgErr instanceof QuotaExceededError ||
        imgMsg.includes("429") ||
        imgMsg.toLowerCase().includes("quota");

      if (isQuota) {
        return NextResponse.json(
          {
            error:
              "Tạo ảnh thất bại: tính năng này yêu cầu kích hoạt billing trên Google AI Studio (free tier không hỗ trợ image generation). " +
              "Truy cập https://aistudio.google.com để nâng cấp tài khoản.",
            errorCode: "IMAGE_QUOTA_EXCEEDED",
            // Return the prompt so the user can use it elsewhere
            prompt: finalPrompt,
            negativePrompt,
          },
          { status: 402 },
        );
      }
      throw imgErr; // re-throw unexpected errors
    }

    return NextResponse.json({
      imageDataUrl:  result.imageUrl,
      prompt:        finalPrompt,
      negativePrompt,
      generationId:  result.generationId,
      dimensions,
      platform,
      visualStyle,
    });
  } catch (err) {
    console.error("Banner generation failed:", err);

    if (err instanceof InvalidRequestError) {
      return NextResponse.json(
        { error: "Lỗi xác thực API. Vui lòng kiểm tra GEMINI_API_KEY trong cấu hình.", errorCode: "INVALID_REQUEST" },
        { status: 500 },
      );
    }

    if (err instanceof QuotaExceededError) {
      return NextResponse.json(
        { error: "Đã vượt quá giới hạn API Gemini. Vui lòng thử lại sau vài phút.", errorCode: "QUOTA_EXCEEDED" },
        { status: 429 },
      );
    }

    const msg = (err as Error).message ?? "";
    if (msg.includes("429") || msg.toLowerCase().includes("quota") || msg.includes("Too Many Requests")) {
      return NextResponse.json(
        { error: "Đã vượt quá giới hạn API Gemini. Vui lòng thử lại sau vài phút.", errorCode: "QUOTA_EXCEEDED" },
        { status: 429 },
      );
    }

    return NextResponse.json(
      { error: "Tạo banner thất bại. Vui lòng thử lại." },
      { status: 500 },
    );
  }
}
