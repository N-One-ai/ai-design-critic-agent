import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs";
import { compareDesigns, QuotaExceededError } from "@/lib/llm-client";
import { renderCompareReport } from "@/lib/report";

export const runtime = "nodejs";

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

export async function POST(req: NextRequest) {
  let body: {
    myDesign?: { image?: { url?: string; base64?: string; mimeType?: string }; designName?: string };
    competitorDesign?: { image?: { url?: string; base64?: string; mimeType?: string }; designName?: string };
    brandGuideline?: Record<string, unknown>;
  };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { myDesign, competitorDesign, brandGuideline: requestBrandGuideline } = body;

  if (!myDesign || !competitorDesign) {
    return NextResponse.json(
      { error: "Request body must include 'myDesign' and 'competitorDesign'." },
      { status: 400 }
    );
  }

  let myImageContent: string | null;
  let competitorImageContent: string | null;

  try {
    myImageContent = resolveImageContent(myDesign.image);
    competitorImageContent = resolveImageContent(competitorDesign.image);
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 400 });
  }

  if (!myImageContent) {
    return NextResponse.json(
      { error: "myDesign.image.url or myDesign.image.base64 (with mimeType) is required." },
      { status: 400 }
    );
  }
  if (!competitorImageContent) {
    return NextResponse.json(
      {
        error:
          "competitorDesign.image.url or competitorDesign.image.base64 (with mimeType) is required.",
      },
      { status: 400 }
    );
  }

  const defaultBrandGuideline = loadBrandGuideline();
  const brandGuideline = requestBrandGuideline ?? defaultBrandGuideline ?? undefined;

  try {
    const comparison = await compareDesigns({
      myImageContent,
      competitorImageContent,
      brandGuideline,
      myDesignName: myDesign.designName,
      competitorDesignName: competitorDesign.designName,
    });

    const report = renderCompareReport(comparison);
    return NextResponse.json({ ...comparison, report });
  } catch (err) {
    console.error("Comparison failed:", err);

    if (err instanceof QuotaExceededError) {
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
      { error: "So sánh thất bại. Vui lòng thử lại." },
      { status: 500 }
    );
  }
}
