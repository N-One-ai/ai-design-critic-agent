import { NextResponse } from "next/server";
import path from "path";
import fs from "fs";

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

function loadLogoUrl(brandGuideline: Record<string, unknown> | null): string | null {
  const logoPath =
    (brandGuideline?.logo as Record<string, string> | undefined)?.primaryLogo ||
    "assets/logo-primary.png";
  try {
    const buffer = fs.readFileSync(path.join(process.cwd(), logoPath));
    const ext = path.extname(logoPath).slice(1) || "png";
    return `data:image/${ext};base64,${buffer.toString("base64")}`;
  } catch {
    return null;
  }
}

export function GET() {
  const brandGuideline = loadBrandGuideline();
  const logoUrl = loadLogoUrl(brandGuideline);

  return NextResponse.json({ brandGuideline, logoUrl });
}
