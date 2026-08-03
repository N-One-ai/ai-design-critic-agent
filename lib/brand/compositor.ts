/**
 * lib/brand/compositor.ts — Post-generation logo compositing.
 *
 * Overlays an official brand logo onto a generated image using sharp.
 * Used as the fallback path when the image provider does NOT support
 * reference images — per the brand policy workflow:
 *
 *   Provider supports reference images → attach logo as reference asset
 *   Provider does NOT support reference images → generate, then composite here
 *
 * The logo is placed in the bottom-right corner by default, at 18% of the
 * base image width, with a 4% margin. All values are configurable.
 *
 * Input:  base64 data URL (data:image/png;base64,…) + absolute logo path
 * Output: base64 data URL with logo composited in
 */

import sharp from "sharp";

// ── Types ─────────────────────────────────────────────────────────────────────

export type LogoPosition =
  | "bottom-right"
  | "bottom-left"
  | "top-right"
  | "top-left"
  | "center";

export interface CompositeOptions {
  /**
   * Placement of the logo relative to the base image.
   * @default "bottom-right"
   */
  position?: LogoPosition;

  /**
   * Logo width as a fraction of the base image width. 0 < value ≤ 1.
   * @default 0.18
   */
  logoWidthRatio?: number;

  /**
   * Padding between logo and image edge, as a fraction of the shorter side.
   * @default 0.04
   */
  marginRatio?: number;
}

// ── Core function ─────────────────────────────────────────────────────────────

/**
 * Composites `logoPath` onto `imageDataUrl` and returns a new data URL.
 *
 * @param imageDataUrl  Base64 data URL of the generated image
 * @param logoPath      Absolute path to the logo PNG file
 * @param options       Placement and sizing overrides
 */
export async function compositeLogoOntoImage(
  imageDataUrl: string,
  logoPath: string,
  options: CompositeOptions = {},
): Promise<string> {
  const {
    position       = "bottom-right",
    logoWidthRatio = 0.18,
    marginRatio    = 0.04,
  } = options;

  // ── Decode base image ─────────────────────────────────────────────────────

  const mimeMatch = imageDataUrl.match(/^data:([^;]+);base64,/);
  const separator = "base64,";
  const sepIndex  = imageDataUrl.indexOf(separator);
  if (!mimeMatch || sepIndex === -1) {
    throw new Error(
      "compositeLogoOntoImage: imageDataUrl is not a valid base64 data URL",
    );
  }
  const mimeType   = mimeMatch[1];
  const base64Data = imageDataUrl.slice(sepIndex + separator.length);
  const imageBuffer = Buffer.from(base64Data, "base64");

  // ── Get base image dimensions ─────────────────────────────────────────────

  const baseSharp = sharp(imageBuffer);
  const { width: baseWidth = 1024, height: baseHeight = 1024 } =
    await baseSharp.metadata();

  // ── Resize logo ───────────────────────────────────────────────────────────

  const targetLogoWidth = Math.max(64, Math.round(baseWidth * logoWidthRatio));
  const margin          = Math.round(Math.min(baseWidth, baseHeight) * marginRatio);

  const { data: logoData, info: logoInfo } = await sharp(logoPath)
    .resize({ width: targetLogoWidth, withoutEnlargement: false })
    .png()
    .toBuffer({ resolveWithObject: true });

  const logoW = logoInfo.width;
  const logoH = logoInfo.height;

  // ── Compute placement ─────────────────────────────────────────────────────

  let left: number;
  let top: number;

  switch (position) {
    case "bottom-right":
      left = baseWidth  - logoW - margin;
      top  = baseHeight - logoH - margin;
      break;
    case "bottom-left":
      left = margin;
      top  = baseHeight - logoH - margin;
      break;
    case "top-right":
      left = baseWidth - logoW - margin;
      top  = margin;
      break;
    case "top-left":
      left = margin;
      top  = margin;
      break;
    case "center":
      left = Math.round((baseWidth  - logoW) / 2);
      top  = Math.round((baseHeight - logoH) / 2);
      break;
    default: {
      const exhaustive: never = position;
      left = 0;
      top  = 0;
      void exhaustive;
    }
  }

  // ── Composite ─────────────────────────────────────────────────────────────

  const outputBuffer = await baseSharp
    .composite([{
      input: logoData,
      left:  Math.max(0, left),
      top:   Math.max(0, top),
      blend: "over",
    }])
    .toBuffer();

  const outputBase64 = outputBuffer.toString("base64");
  return `data:${mimeType};base64,${outputBase64}`;
}
