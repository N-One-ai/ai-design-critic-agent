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
import { generateImageCore } from "@/lib/ai/services/image-generation-core";
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

// ── Route handler ─────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
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

  // ── 3–8. Generate via shared pipeline ────────────────────────────────────
  // Prompt enrichment, compression, brand context, Higgsfield generation,
  // logo compositing, and Supabase upload are all handled by generateImageCore.
  let generated: Awaited<ReturnType<typeof generateImageCore>>;

  try {
    generated = await generateImageCore({
      prompt:         rawPrompt,
      style:          style          ?? "realistic",
      aspectRatio:    aspectRatio    ?? "1:1",
      quality:        quality        ?? "standard",
      referenceImages: referenceImages ?? [],
    });
  } catch (e) {
    if (e instanceof QuotaExceededError) {
      return err("Quota tạo ảnh AI đã hết. Vui lòng thử lại sau.", "QUOTA_EXCEEDED", 429);
    }
    if (e instanceof ContentFilterError) {
      return err("Nội dung không được phép. Vui lòng điều chỉnh prompt và thử lại.", "CONTENT_FILTERED", 422);
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
    return err("Lỗi hệ thống khi tạo ảnh. Vui lòng thử lại sau.", "INTERNAL_ERROR", 500);
  }

  if (!generated.imageUrl) {
    return err("Tạo ảnh thành công nhưng không nhận được dữ liệu ảnh. Vui lòng thử lại.", "NO_IMAGE_DATA", 502);
  }

  // ── 9. Return structured response ────────────────────────────────────────
  const result: ImageGenerateResponse = {
    success:  true,
    imageUrl: generated.imageUrl,
    metadata: {
      prompt:      rawPrompt,
      style:       style       ?? "realistic",
      aspectRatio: aspectRatio ?? "1:1",
      quality:     quality     ?? "standard",
      width:       dimensions.width,
      height:      dimensions.height,
      mimeType:    generated.mimeType,
      storagePath: generated.storagePath,
      generatedAt: new Date().toISOString(),
    },
    provider:       generated.provider,
    model:          generated.model,
    generationTime: generated.generationTime,
    wasCompressed:  generated.wasCompressed,
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
