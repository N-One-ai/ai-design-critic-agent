/**
 * Shared image generation core — server-side only.
 *
 * Single implementation used by every API route that generates images.
 * Encapsulates the full pipeline:
 *   raw prompt → prompt enrichment → compression → brand context
 *   → HiggsFieldProvider → logo compositing → Supabase upload
 *
 * Both Image Generator and Banner Generator call this function.
 * Changing providers (Higgsfield → Imagen → Flux → etc.) requires
 * editing only this file and the provider implementation.
 *
 * All AI errors are re-thrown as-is so callers can format HTTP responses
 * with the correct status code and user-facing message.
 */

import { HiggsFieldProvider } from "@/lib/ai/provider/higgsfield";
import { uploadGeneratedImage } from "@/lib/supabase/storage";
import { aiProviderConfig } from "@/lib/config";
import { resolveBrandContext } from "@/lib/brand/policy";
import { compositeLogoOntoImage } from "@/lib/brand/compositor";
import { compressPrompt, MAX_PROMPT_LENGTH } from "@/lib/ai/services/prompt-compressor";
import { buildImagePrompt } from "@/lib/ai/services/image-prompt-builder";
import {
  ASPECT_RATIO_DIMENSIONS,
  type ImageStyle,
  type ImageQuality,
  type AspectRatio,
} from "@/lib/ai/types/image";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface GenerateImageCoreInput {
  /** Raw user prompt — brand context is detected from this. */
  prompt: string;
  style?:       ImageStyle;
  aspectRatio?: AspectRatio;
  quality?:     ImageQuality;
  referenceImages?: string[];
}

export interface GenerateImageCoreOutput {
  /** Supabase public URL or data: URL when storage is unavailable. */
  imageUrl:       string;
  storagePath:    string;
  mimeType:       string;
  wasCompressed:  boolean;
  provider:       string;
  model:          string;
  generationTime: number;
  dimensions:     { width: number; height: number };
}

// ── Providers that accept a filesystem logo reference ─────────────────────────

const PROVIDERS_WITH_REFERENCE_SUPPORT = new Set<string>(["higgsfield"]);

// ── Singleton provider ────────────────────────────────────────────────────────
// One instance per cold-start, shared across requests in the same process.

let _provider: HiggsFieldProvider | null = null;

function getProvider(): HiggsFieldProvider {
  if (!_provider) _provider = new HiggsFieldProvider(aiProviderConfig.higgsfield);
  return _provider;
}

// ── Core pipeline ─────────────────────────────────────────────────────────────

/**
 * Generates an image from a raw text prompt using the Higgsfield provider.
 *
 * Throws typed AIError subclasses on failure — callers are responsible for
 * catching and converting to HTTP responses.
 */
export async function generateImageCore(
  input: GenerateImageCoreInput,
): Promise<GenerateImageCoreOutput> {
  const start = Date.now();

  const {
    prompt:         rawPrompt,
    style         = "realistic",
    aspectRatio   = "1:1",
    quality       = "standard",
    referenceImages = [],
  } = input;

  const dimensions = ASPECT_RATIO_DIMENSIONS[aspectRatio];

  // ── 1. Enrich prompt ───────────────────────────────────────────────────────
  const enrichedPrompt = buildImagePrompt(rawPrompt, style, quality, aspectRatio);

  // ── 2. Compress if needed ──────────────────────────────────────────────────
  let prompt        = enrichedPrompt;
  let wasCompressed = false;

  if (enrichedPrompt.length > MAX_PROMPT_LENGTH) {
    const compression = await compressPrompt(enrichedPrompt);
    prompt        = compression.compressed;
    wasCompressed = compression.wasCompressed;
  }

  // ── 3. Brand context ───────────────────────────────────────────────────────
  const provider     = getProvider();
  const brandCtx     = resolveBrandContext(rawPrompt);
  const useReference = brandCtx.detected && PROVIDERS_WITH_REFERENCE_SUPPORT.has(provider.name);
  const useComposite = brandCtx.detected && !useReference;

  // ── 4. Generate via HiggsFieldProvider ────────────────────────────────────
  const response = await provider.generate({
    messages: [{ role: "user", content: prompt }],
    meta: {
      operationType:  "text-to-image",
      aspectRatio,
      referenceImages,
      ...(useReference && brandCtx.detected
        ? { logoReferencePath: brandCtx.logoPath }
        : {}),
    },
  });

  if (!response.imageDataUrl) {
    throw new Error("Provider returned no image data.");
  }

  let imageDataUrl  = response.imageDataUrl;
  const model       = response.model;
  const providerName = response.provider;
  let mimeType      = "image/png";

  const mimeMatch = imageDataUrl.match(/^data:([^;]+);base64,/);
  if (mimeMatch) mimeType = mimeMatch[1];

  // ── 5. Logo compositing (fallback path) ───────────────────────────────────
  if (useComposite && brandCtx.detected) {
    try {
      imageDataUrl = await compositeLogoOntoImage(
        imageDataUrl,
        brandCtx.logoPath,
        { position: "bottom-right" },
      );
      const m2 = imageDataUrl.match(/^data:([^;]+);base64,/);
      if (m2) mimeType = m2[1];
    } catch (e) {
      console.error("[generateImageCore] Logo compositing failed:", (e as Error).message);
    }
  }

  // ── 6. Upload to Supabase ──────────────────────────────────────────────────
  let publicUrl   = imageDataUrl;
  let storagePath = `local/${Date.now()}.png`;

  try {
    const base64Data = imageDataUrl.replace(/^data:[^;]+;base64,/, "");
    const ext        = mimeType.split("/")[1] ?? "png";
    const filename   = `${Date.now()}-${crypto.randomUUID()}.${ext}`;
    const upload     = await uploadGeneratedImage(base64Data, mimeType, filename);
    publicUrl    = upload.publicUrl;
    storagePath  = upload.storagePath;
  } catch (e) {
    console.error("[generateImageCore] Storage upload failed:", (e as Error).message);
    // Graceful degradation: return the data URL so the user keeps their image.
  }

  return {
    imageUrl:       publicUrl,
    storagePath,
    mimeType,
    wasCompressed,
    provider:       providerName,
    model,
    generationTime: Date.now() - start,
    dimensions,
  };
}
