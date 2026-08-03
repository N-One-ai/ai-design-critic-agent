/**
 * POST /api/image/generate
 *
 * Accepts a text prompt and generation parameters, calls HiggsFieldProvider,
 * uploads the result to Supabase Storage, and returns a public URL.
 *
 * Request body (ImageGenerateRequest):
 *   prompt         string   required  — text description, max 2000 chars
 *   style          string   optional  — visual style (default: "realistic")
 *   aspectRatio    string   optional  — output ratio (default: "1:1")
 *   quality        string   optional  — quality tier (default: "standard")
 *   referenceImages string[] optional — base64 data URLs (future: image-to-image)
 *
 * Success response (200, ImageGenerateResponse):
 *   success        true
 *   imageUrl       string   — Supabase public URL (data: URL in dev without Supabase)
 *   metadata       object   — prompt, style, ratio, dimensions, storagePath, timestamp
 *   provider       string   — "higgsfield"
 *   model          string   — actual CLI job_set_type used
 *   generationTime number   — wall-clock ms
 *
 * Error response (4xx/5xx, ImageGenerateErrorResponse):
 *   success        false
 *   error          string   — human-readable message
 *   code           string   — machine-readable error code
 */

import { NextRequest, NextResponse } from "next/server";
import { HiggsFieldProvider } from "@/lib/ai/providers/higgsfield";
import { uploadGeneratedImage } from "@/lib/supabase/storage";
import { aiProviderConfig } from "@/lib/config";
import { resolveBrandContext } from "@/lib/brand/policy";
import { compositeLogoOntoImage } from "@/lib/brand/compositor";
import { compressPrompt, MAX_PROMPT_LENGTH } from "@/lib/ai/services/prompt-compressor";
import { buildImagePrompt } from "@/lib/ai/services/image-prompt-builder";
import {
  AIError,
  QuotaExceededError,
  ContentFilterError,
  InvalidRequestError,
  ProviderUnavailableError,
} from "@/lib/ai/errors";
import {
  ASPECT_RATIO_DIMENSIONS,
  type ImageGenerateRequest,
  type ImageGenerateResponse,
  type ImageGenerateErrorResponse,
  type AspectRatio,
  type ImageStyle,
  type ImageQuality,
} from "@/lib/ai/types/image";

export const runtime = "nodejs";
export const maxDuration = 120; // Higgsfield image gen can take 30–90s

// ── Brand policy: which providers support reference images ────────────────────
// Providers in this set receive the brand logo via the meta.logoReferencePath
// field (which the provider passes as --image to the CLI).
// Providers NOT in this set trigger post-generation compositing instead.

const PROVIDERS_WITH_REFERENCE_SUPPORT = new Set<string>([
  "higgsfield",
]);

// ── Valid value sets ──────────────────────────────────────────────────────────

const VALID_ASPECT_RATIOS = new Set<string>(
  Object.keys(ASPECT_RATIO_DIMENSIONS),
);

const VALID_STYLES = new Set<string>([
  "realistic", "illustration", "flat-design",
  "3d-render", "watercolor", "pixel-art", "cinematic", "editorial",
]);

const VALID_QUALITIES = new Set<string>([
  "draft", "standard", "hd", "ultra-hd",
]);

// ── Validation ────────────────────────────────────────────────────────────────

function validate(body: unknown): ImageGenerateRequest {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw new InvalidRequestError("Request body must be a JSON object.");
  }

  const req = body as Record<string, unknown>;

  if (typeof req.prompt !== "string" || !req.prompt.trim()) {
    throw new InvalidRequestError(
      "'prompt' is required and must be a non-empty string.",
    );
  }

  if (req.prompt.length > 4000) {
    throw new InvalidRequestError(
      "'prompt' must not exceed 4000 characters.",
    );
  }

  if (req.aspectRatio !== undefined && !VALID_ASPECT_RATIOS.has(String(req.aspectRatio))) {
    throw new InvalidRequestError(
      `'aspectRatio' must be one of: ${[...VALID_ASPECT_RATIOS].join(", ")}.`,
    );
  }

  if (req.style !== undefined && !VALID_STYLES.has(String(req.style))) {
    throw new InvalidRequestError(
      `'style' must be one of: ${[...VALID_STYLES].join(", ")}.`,
    );
  }

  if (req.quality !== undefined && !VALID_QUALITIES.has(String(req.quality))) {
    throw new InvalidRequestError(
      `'quality' must be one of: ${[...VALID_QUALITIES].join(", ")}.`,
    );
  }

  if (req.referenceImages !== undefined) {
    if (!Array.isArray(req.referenceImages)) {
      throw new InvalidRequestError(
        "'referenceImages' must be an array of base64 data URLs.",
      );
    }
    if (req.referenceImages.length > 5) {
      throw new InvalidRequestError(
        "'referenceImages' must contain 5 items or fewer.",
      );
    }
  }

  return {
    prompt:          req.prompt.trim(),
    style:           (req.style          as ImageStyle   | undefined) ?? "realistic",
    aspectRatio:     (req.aspectRatio    as AspectRatio  | undefined) ?? "1:1",
    quality:         (req.quality        as ImageQuality | undefined) ?? "standard",
    referenceImages: (req.referenceImages as string[]    | undefined) ?? [],
  };
}

// ── Lazy provider singleton ───────────────────────────────────────────────────
// Instantiated once per cold start; re-used across requests in the same process.

let _provider: HiggsFieldProvider | null = null;

function getProvider(): HiggsFieldProvider {
  if (!_provider) {
    _provider = new HiggsFieldProvider(aiProviderConfig.higgsfield);
  }
  return _provider;
}

// ── Route handler ─────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const start = Date.now();

  // ── 1. Parse JSON body ────────────────────────────────────────────────────
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return err("Request body must be valid JSON.", "INVALID_REQUEST", 400);
  }

  // ── 2. Validate ───────────────────────────────────────────────────────────
  let validated: ImageGenerateRequest;
  try {
    validated = validate(body);
  } catch (e) {
    if (e instanceof InvalidRequestError) {
      return err(e.message, "INVALID_REQUEST", 400);
    }
    return err("Invalid request.", "INVALID_REQUEST", 400);
  }

  const { prompt: rawPrompt, style, aspectRatio, quality, referenceImages } = validated;
  const dimensions = ASPECT_RATIO_DIMENSIONS[aspectRatio ?? "1:1"];

  // ── 3. Build enriched prompt ──────────────────────────────────────────────
  // Combine the user's raw prompt with style modifiers, quality modifiers, and
  // an aspect-ratio composition hint. This happens BEFORE compression so the
  // compressor can apply semantic reduction to the fully-enriched text.
  const enrichedPrompt = buildImagePrompt(
    rawPrompt,
    style       ?? "realistic",
    quality     ?? "standard",
    aspectRatio ?? "1:1",
  );

  // ── 4. Compress if the enriched prompt exceeds the model character limit ──
  // Compression is semantic (Gemini Flash) and transparent — the UI shows a
  // notice instead of an error. The provider receives a prompt already enriched
  // with style/quality/ratio context and does NOT re-enrich (no style/quality
  // in meta).
  let prompt = enrichedPrompt;
  let wasCompressed = false;

  if (enrichedPrompt.length > MAX_PROMPT_LENGTH) {
    const compression = await compressPrompt(enrichedPrompt);
    prompt        = compression.compressed;
    wasCompressed = compression.wasCompressed;
  }

  // ── 5. Resolve brand context ──────────────────────────────────────────────
  // Detect on the original raw prompt — brand keywords survive compression,
  // but the original is the most reliable signal.
  const provider        = getProvider();
  const brandCtx        = resolveBrandContext(rawPrompt);
  const useReference    = brandCtx.detected &&
                          PROVIDERS_WITH_REFERENCE_SUPPORT.has(provider.name);
  const useComposite    = brandCtx.detected && !useReference;

  // ── 6. Generate image via HiggsFieldProvider ─────────────────────────────
  // style and quality are intentionally absent from meta — they are already
  // embedded in the enriched (and possibly compressed) prompt above.
  // aspectRatio is still needed so the provider can pass --aspect_ratio to
  // the Higgsfield CLI.
  let imageDataUrl: string;
  let model: string;
  let providerName: string;
  let mimeType = "image/png";

  try {
    const response = await provider.generate({
      messages: [{ role: "user", content: prompt }],
      meta: {
        operationType: "text-to-image",
        aspectRatio,
        referenceImages,
        // Attach official logo when the provider supports reference images.
        ...(useReference && brandCtx.detected
          ? { logoReferencePath: brandCtx.logoPath }
          : {}),
      },
    });

    if (!response.imageDataUrl) {
      return err(
        "Tạo ảnh thành công nhưng không nhận được dữ liệu ảnh. Vui lòng thử lại.",
        "NO_IMAGE_DATA",
        502,
      );
    }

    imageDataUrl = response.imageDataUrl;
    model        = response.model;
    providerName = response.provider;

    // Extract mime type from the data URL header
    const mimeMatch = imageDataUrl.match(/^data:([^;]+);base64,/);
    if (mimeMatch) mimeType = mimeMatch[1];

  } catch (e) {
    if (e instanceof QuotaExceededError) {
      return err(
        "Quota tạo ảnh AI đã hết. Vui lòng thử lại sau.",
        "QUOTA_EXCEEDED",
        429,
      );
    }
    if (e instanceof ContentFilterError) {
      return err(
        "Nội dung không được phép. Vui lòng điều chỉnh prompt và thử lại.",
        "CONTENT_FILTERED",
        422,
      );
    }
    if (e instanceof InvalidRequestError) {
      return err(e.message, "INVALID_REQUEST", 400);
    }
    if (e instanceof ProviderUnavailableError) {
      return err(
        "Higgsfield CLI không khả dụng. Đảm bảo `higgsfield` đã được cài đặt và xác thực.",
        "PROVIDER_UNAVAILABLE",
        503,
      );
    }
    if (e instanceof AIError) {
      return err(e.message, e.code, 500);
    }
    const message = (e as Error)?.message ?? "Lỗi không xác định.";
    console.error("[POST /api/image/generate] Generation error:", message);
    return err(
      "Lỗi hệ thống khi tạo ảnh. Vui lòng thử lại sau.",
      "INTERNAL_ERROR",
      500,
    );
  }

  // ── 7. Brand logo compositing (fallback path) ────────────────────────────
  // Triggered only when the provider does NOT support reference images.
  // For providers that do (e.g. HiggsFieldProvider), the logo was already
  // passed to the model as a creative reference — no compositing needed.
  if (useComposite && brandCtx.detected) {
    try {
      imageDataUrl = await compositeLogoOntoImage(
        imageDataUrl,
        brandCtx.logoPath,
        { position: "bottom-right" },
      );
      // Re-extract mime type after compositing (sharp always outputs PNG).
      const mimeMatch = imageDataUrl.match(/^data:([^;]+);base64,/);
      if (mimeMatch) mimeType = mimeMatch[1];
    } catch (e) {
      // Compositing failure must never surface as a generation error.
      // Log it and continue with the un-composited image.
      console.error("[POST /api/image/generate] Logo compositing failed:", (e as Error).message);
    }
  }

  // ── 8. Upload to Supabase Storage ─────────────────────────────────────────
  let publicUrl: string;
  let storagePath: string;

  try {
    const base64Data = imageDataUrl.replace(/^data:[^;]+;base64,/, "");
    const ext = mimeType.split("/")[1] ?? "png";
    const filename = `${Date.now()}-${crypto.randomUUID()}.${ext}`;

    const upload = await uploadGeneratedImage(base64Data, mimeType, filename);
    publicUrl   = upload.publicUrl;
    storagePath = upload.storagePath;
  } catch (e) {
    // Graceful degradation: storage failed but we still have the image.
    // Return the data: URL so the user doesn't lose their result.
    console.error("[POST /api/image/generate] Storage upload failed:", (e as Error).message);
    publicUrl   = imageDataUrl;
    storagePath = `local/${Date.now()}.png`;
  }

  // ── 9. Return structured response ────────────────────────────────────────
  const result: ImageGenerateResponse = {
    success: true,
    imageUrl: publicUrl,
    metadata: {
      prompt: rawPrompt,  // store original prompt, not compressed version
      style:       style       ?? "realistic",
      aspectRatio: aspectRatio ?? "1:1",
      quality:     quality     ?? "standard",
      width:       dimensions.width,
      height:      dimensions.height,
      mimeType,
      storagePath,
      generatedAt: new Date().toISOString(),
    },
    provider:       providerName!,
    model:          model!,
    generationTime: Date.now() - start,
    wasCompressed,
  };

  return NextResponse.json(result, { status: 200 });
}

// ── Helper ────────────────────────────────────────────────────────────────────

function err(
  error: string,
  code: string,
  status: number,
): NextResponse<ImageGenerateErrorResponse> {
  return NextResponse.json({ success: false, error, code }, { status });
}
