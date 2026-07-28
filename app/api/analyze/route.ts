import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs";
import { GeminiProvider } from "@/lib/ai/providers/gemini";
import { ImageAnalysisService } from "@/lib/ai/services/image-analysis";
import { QuotaExceededError as AIQuotaExceededError, InvalidRequestError } from "@/lib/ai/errors";
import { aiProviderConfig } from "@/lib/config";
import { renderMarkdownReport, computeOverallScore } from "@/lib/report";

export const runtime = "nodejs";

function readAssetAsDataUrl(filePath: string): string | null {
  try {
    const abs = path.isAbsolute(filePath)
      ? filePath
      : path.join(process.cwd(), filePath);
    const buffer = fs.readFileSync(abs);
    const ext = path.extname(filePath).slice(1) || "png";
    return `data:image/${ext};base64,${buffer.toString("base64")}`;
  } catch {
    return null;
  }
}

function loadBrandGuideline() {
  try {
    const raw = fs.readFileSync(
      path.join(process.cwd(), "brand-guideline.json"),
      "utf-8"
    );
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function loadLogoContent(brandGuideline: Record<string, unknown> | null): string | null {
  const logoPath =
    (brandGuideline?.logo as Record<string, string> | undefined)?.primaryLogo ||
    "assets/logo-primary.png";
  return readAssetAsDataUrl(logoPath);
}

function loadAssetList(files: string[]): Array<{ file: string; content: string }> {
  return files
    .map((file) => {
      const content = readAssetAsDataUrl(file);
      return content ? { file, content } : null;
    })
    .filter(Boolean) as Array<{ file: string; content: string }>;
}

function resolveImageContent(
  image: { url?: string; base64?: string; mimeType?: string } | undefined
): string | null {
  if (!image) return null;
  if (image.url) return image.url;
  if (image.base64) {
    if (!image.mimeType)
      throw new Error("'mimeType' is required when providing an image as base64.");
    return `data:${image.mimeType};base64,${image.base64}`;
  }
  return null;
}

function getService(): ImageAnalysisService {
  const provider = new GeminiProvider(aiProviderConfig.gemini);
  return new ImageAnalysisService(provider);
}

export async function POST(req: NextRequest) {
  if (req.headers.get("content-length")) {
    const len = parseInt(req.headers.get("content-length") || "0", 10);
    if (len > 15 * 1024 * 1024) {
      return NextResponse.json(
        { error: "Ảnh quá lớn. Vui lòng chọn ảnh nhỏ hơn 15MB." },
        { status: 413 }
      );
    }
  }

  let body: {
    image?: { url?: string; base64?: string; mimeType?: string };
    brandGuideline?: Record<string, unknown>;
    designName?: string;
  };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { image, brandGuideline: requestBrandGuideline, designName } = body;

  let imageContent: string | null;
  try {
    imageContent = resolveImageContent(image);
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 400 }
    );
  }

  if (!imageContent) {
    return NextResponse.json(
      {
        error:
          "Request body must include 'image.url' or 'image.base64' (with 'image.mimeType').",
      },
      { status: 400 }
    );
  }

  const defaultBrandGuideline = loadBrandGuideline();
  const brandGuideline = requestBrandGuideline ?? defaultBrandGuideline ?? undefined;

  const logoReferencePath = (brandGuideline?.logo as Record<string, string> | undefined)
    ?.primaryLogo;
  let logoReferenceContent: string | null = null;
  if (logoReferencePath) {
    logoReferenceContent = readAssetAsDataUrl(logoReferencePath);
  }
  if (!logoReferenceContent) {
    logoReferenceContent = loadLogoContent(defaultBrandGuideline);
  }

  const logoReferenceImages =
    (brandGuideline?.logo as Record<string, string[]> | undefined)?.referenceImages || [];
  const deprecatedAssets =
    (brandGuideline?.logo as Record<string, string[]> | undefined)?.deprecatedAssets || [];
  const trademarkVariants =
    (brandGuideline?.trademark as Record<string, (string | { file: string })[]> | undefined)
      ?.variants || [];

  const officialLogoContents     = loadAssetList(logoReferenceImages);
  const deprecatedLogoContents   = loadAssetList(deprecatedAssets);
  const trademarkReferenceContents = loadAssetList(
    trademarkVariants.map((v) => (typeof v === "string" ? v : v.file))
  );

  try {
    const service  = getService();
    const analysis = await service.execute(
      {
        imageDataUrl: imageContent,
        designName,
        brandGuideline,
        referenceAssets: {
          logoDataUrl:   logoReferenceContent,
          officialLogos: officialLogoContents.map((i) => ({ file: i.file, dataUrl: i.content })),
          trademarks:    trademarkReferenceContents.map((i) => ({ file: i.file, dataUrl: i.content })),
          deprecatedLogos: deprecatedLogoContents.map((i) => ({ file: i.file, dataUrl: i.content })),
        },
        language: process.env.REPORT_LANGUAGE ?? "vi",
      },
      { timeoutMs: 90_000 },
    );

    const categories = analysis.categories as
      | Record<string, Record<string, unknown>>
      | undefined;

    const overallScore = computeOverallScore(
      categories as Record<string, { score?: number | null }>
    );

    const assetMap: Record<string, string> = {};
    officialLogoContents.forEach((item) => { assetMap[item.file] = item.content; });
    trademarkReferenceContents.forEach((item) => { assetMap[item.file] = item.content; });
    deprecatedLogoContents.forEach((item) => { assetMap[item.file] = item.content; });
    if (logoReferenceContent) assetMap["assets/logo-current.png"] = logoReferenceContent;

    const report = renderMarkdownReport(analysis, overallScore, assetMap);

    const toUrl = (file: string | undefined) => (file ? `/${file}` : null);
    const assets = {
      referenceLogo: toUrl(
        (brandGuideline?.logo as Record<string, string> | undefined)?.primaryLogo
      ),
      officialLogos:      logoReferenceImages.map(toUrl),
      deprecatedLogos:    deprecatedAssets.map(toUrl),
      trademarkVariants:  trademarkVariants.map((v) =>
        toUrl(typeof v === "string" ? v : v.file)
      ),
      matchedTrademark:
        toUrl(
          (categories?.trademarkCompliance?.matchedVariant as string | undefined) ?? undefined
        ) || null,
    };

    return NextResponse.json({
      designName:           analysis.designName,
      overallScore,
      categories:           analysis.categories,
      summary:              analysis.summary,
      strengths:            analysis.strengths,
      mainIssues:           analysis.mainIssues,
      improvementSuggestions: analysis.improvementSuggestions,
      aiRedesignPrompt:     analysis.aiRedesignPrompt,
      assets,
      report,
    });
  } catch (err) {
    console.error("Analysis failed:", err);

    if (err instanceof InvalidRequestError) {
      return NextResponse.json(
        { error: "Lỗi xác thực API. Vui lòng kiểm tra GEMINI_API_KEY trong cấu hình.", errorCode: "INVALID_REQUEST" },
        { status: 500 },
      );
    }

    if (err instanceof AIQuotaExceededError) {
      return NextResponse.json(
        {
          error: "Đã vượt quá giới hạn API Gemini. Vui lòng thử lại sau vài phút.",
          errorCode: "QUOTA_EXCEEDED",
        },
        { status: 429 }
      );
    }

    const msg = (err as Error).message ?? "";
    if (msg.includes("429") || msg.includes("quota") || msg.includes("Too Many Requests")) {
      return NextResponse.json(
        {
          error: "Đã vượt quá giới hạn API Gemini. Vui lòng thử lại sau vài phút.",
          errorCode: "QUOTA_EXCEEDED",
        },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { error: "Phân tích thất bại. Vui lòng thử lại." },
      { status: 500 }
    );
  }
}
