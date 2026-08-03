/**
 * Image prompt builder — route-level enrichment layer.
 *
 * Constructs the final prompt sent to the image model by combining:
 *   User's raw prompt  +  Style modifiers  +  Quality modifiers  +  Aspect-ratio hint
 *
 * This layer runs in the API route BEFORE the prompt compressor, so the
 * compressor sees the fully-enriched text and preserves its meaning when
 * trimming. The provider receives the already-enriched prompt and does NOT
 * add further style/quality modifiers.
 *
 * Separation of concerns:
 *   lib/ai/services/image-prompt-builder.ts  ← this file  (semantic enrichment)
 *   lib/ai/services/prompt-compressor.ts                  (length management)
 *   lib/ai/providers/higgsfield.ts                        (CLI adapter)
 */

import type { ImageStyle, ImageQuality, AspectRatio } from "@/lib/ai/types/image";

// ── Style modifiers ───────────────────────────────────────────────────────────
// Each value describes the visual rendering language of the chosen style.
// Modifiers are short enough to survive a compression pass.

const STYLE_MODIFIERS: Readonly<Record<ImageStyle, string>> = {
  "realistic":    "photorealistic, natural lighting, high detail, DSLR camera realism, sharp focus",
  "illustration": "digital illustration, clean vector lines, editorial style, vibrant colors, artistic",
  "flat-design":  "flat design illustration, minimal, vector graphics, solid colors, geometric shapes, modern",
  "3d-render":    "cinematic 3D render, Octane render, PBR materials, studio lighting, high detail, ray tracing",
  "watercolor":   "watercolor painting, soft paper texture, artistic brushstrokes, delicate tones, hand-painted",
  "pixel-art":    "pixel art, 8-bit style, retro game aesthetic, crisp pixels",
  "cinematic":    "cinematic photography, film grain, dramatic lighting, anamorphic lens, movie quality",
  "editorial":    "editorial photography, magazine quality, professional composition",
};

// ── Quality modifiers ─────────────────────────────────────────────────────────
// "standard" adds nothing — it is the implicit baseline.

const QUALITY_MODIFIERS: Readonly<Record<ImageQuality, string | null>> = {
  "draft":    "rough draft quality",
  "standard": null,
  "hd":       "ultra high definition, highly detailed, crisp and sharp",
  "ultra-hd": "masterpiece quality, maximum detail, 8K resolution, perfect composition, professional grade",
};

// ── Aspect-ratio composition hints ───────────────────────────────────────────
// Tells the model how to frame the composition. Keeps it to one phrase so
// the compressor never strips it (it fits within the 1800-char budget even
// after the other modifiers are added).

const RATIO_HINTS: Readonly<Record<AspectRatio, string>> = {
  "1:1":  "square composition",
  "16:9": "widescreen landscape composition, cinematic format",
  "9:16": "vertical portrait composition, mobile screen format",
  "4:3":  "landscape composition, classic horizontal format",
  "3:2":  "landscape composition, photography aspect ratio",
};

// ── Builder ───────────────────────────────────────────────────────────────────

/**
 * Constructs the enriched prompt from user input and generation parameters.
 *
 * The result is the text passed to the image model.  It is compressed by
 * `compressPrompt` if it exceeds MAX_PROMPT_LENGTH, but semantic intent
 * (style, quality, composition) is always preserved.
 */
export function buildImagePrompt(
  userPrompt:  string,
  style:       ImageStyle,
  quality:     ImageQuality,
  aspectRatio: AspectRatio,
): string {
  const parts: string[] = [userPrompt];

  const styleMod = STYLE_MODIFIERS[style];
  if (styleMod) parts.push(styleMod);

  const qualityMod = QUALITY_MODIFIERS[quality];
  if (qualityMod) parts.push(qualityMod);

  const ratioHint = RATIO_HINTS[aspectRatio];
  if (ratioHint) parts.push(ratioHint);

  return parts.join(". ");
}
