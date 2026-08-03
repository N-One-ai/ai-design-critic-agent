/**
 * Image generation types — provider-agnostic.
 *
 * Defines the public contract for POST /api/image/generate.
 * Intentionally separate from GenerateRequest/GenerateResponse so that
 * image-specific parameters (aspect ratio, style, operation type) can evolve
 * independently of the text-generation contract.
 */

// ── Dimension lookup ──────────────────────────────────────────────────────────

export const ASPECT_RATIO_DIMENSIONS = {
  "1:1":  { width: 1024, height: 1024 },
  "16:9": { width: 1536, height: 864  },
  "9:16": { width: 864,  height: 1536 },
  "4:3":  { width: 1408, height: 1056 },
  "3:2":  { width: 1536, height: 1024 },
} as const;

export type AspectRatio = keyof typeof ASPECT_RATIO_DIMENSIONS;

export type ImageStyle =
  | "realistic"
  | "illustration"
  | "flat-design"
  | "3d-render"
  | "watercolor"
  | "pixel-art"
  | "cinematic"
  | "editorial";

export type ImageQuality = "draft" | "standard" | "hd" | "ultra-hd";

/**
 * Operation type dispatched internally by GoogleImageProvider.
 * "text-to-image" is fully implemented; the rest are future-ready stubs
 * that throw InvalidRequestError until implemented.
 */
export type ImageOperationType =
  | "text-to-image"       // ✅ Implemented
  | "image-to-image"      // 🔜 Future: style transfer / img2img
  | "inpaint"             // 🔜 Future: replace masked region
  | "outpaint"            // 🔜 Future: extend canvas boundaries
  | "background-removal"  // 🔜 Future: isolate subject
  | "variation"           // 🔜 Future: seed-anchored variation
  | "upscale";            // 🔜 Future: 2× / 4× resolution upscale

// ── API request ───────────────────────────────────────────────────────────────

export interface ImageGenerateRequest {
  /** Text description of the image to generate. Max 4000 chars (compressed server-side if needed). */
  prompt: string;
  /** Visual style applied to generation. Default: "realistic". */
  style?: ImageStyle;
  /** Target aspect ratio. Default: "1:1". */
  aspectRatio?: AspectRatio;
  /** Quality tier mapping to model generation params. Default: "standard". */
  quality?: ImageQuality;
  /**
   * Reference images as base64 data URLs.
   * Used by image-to-image, inpaint, and variation operations (future).
   * Ignored by text-to-image (current implementation).
   */
  referenceImages?: string[];
}

// ── API response ──────────────────────────────────────────────────────────────

export interface ImageMetadata {
  prompt: string;
  style: ImageStyle;
  aspectRatio: AspectRatio;
  quality: ImageQuality;
  width: number;
  height: number;
  mimeType: string;
  /** Storage path inside the Supabase bucket, e.g. "images/abc123.png". */
  storagePath: string;
  /** ISO 8601 timestamp of when the image was generated. */
  generatedAt: string;
}

export interface ImageGenerateResponse {
  success: true;
  /** Supabase public URL — falls back to data: URL in dev when Supabase is unconfigured. */
  imageUrl: string;
  metadata: ImageMetadata;
  provider: string;
  model: string;
  /** Wall-clock ms from route entry to response. */
  generationTime: number;
  /** True when the prompt was automatically compressed to fit the model's character limit. */
  wasCompressed?: boolean;
}

export interface ImageGenerateErrorResponse {
  success: false;
  error: string;
  code: string;
}
