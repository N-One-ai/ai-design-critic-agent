/**
 * GoogleImageProvider — Google Gemini image generation.
 *
 * Implements AIProvider for the "image-generation" capability using the
 * @google/genai SDK (v2+) with the gemini-3-pro-image model family.
 *
 * This is the sole Google image provider. It fully replaces the legacy
 * ImagenProvider (lib/ai/providers/imagen.ts, now deleted).
 *
 * Configuration (environment variables):
 *   GOOGLE_API_KEY       — required. Also accepts GEMINI_API_KEY as fallback.
 *   GOOGLE_IMAGE_MODEL   — model ID (default: gemini-3-pro-image)
 *
 * Currently implemented:
 *   text-to-image     — POST /api/image/generate with prompt + style + quality
 *
 * Future-ready dispatch (throws InvalidRequestError until implemented):
 *   image-to-image, inpaint, outpaint, background-removal, variation, upscale
 */

import { GoogleGenAI } from "@google/genai";
import type { AIProvider } from "../provider";
import type {
  GenerateRequest,
  GenerateResponse,
  ProviderCapability,
  ProviderConfig,
} from "../types";
import type { ImageOperationType } from "../types/image";
import {
  classifyError,
  InvalidRequestError,
  AIError,
} from "../errors";
import { aiLogger } from "../logger";

// ── Style and quality prompt modifiers ────────────────────────────────────────

const STYLE_MODIFIERS: Readonly<Record<string, string>> = {
  "realistic":    "photorealistic, high-quality photography, natural lighting, 4K, professional",
  "illustration": "digital illustration, vibrant colors, clean lines, artistic",
  "flat-design":  "flat design, minimal, geometric shapes, solid colors, modern UI aesthetic",
  "3d-render":    "3D CGI render, physically based rendering, studio lighting, high detail",
  "watercolor":   "watercolor painting, soft washes, artistic, hand-painted texture",
  "pixel-art":    "pixel art, retro game aesthetic, crisp pixels, 8-bit style",
  "cinematic":    "cinematic photography, film grain, dramatic lighting, anamorphic lens",
  "editorial":    "editorial photography, magazine quality, professional composition",
};

const QUALITY_MODIFIERS: Readonly<Record<string, string>> = {
  "draft":    "rough draft quality, sketch-like",
  "standard": "high quality, professional, detailed",
  "hd":       "ultra-high definition, extremely detailed, crisp, sharp",
  "ultra-hd": "maximum quality, 8K, photorealistic detail, perfect composition, masterpiece",
};

// ── Internal types ────────────────────────────────────────────────────────────

interface ImageGenerationMeta {
  operationType?:   ImageOperationType;
  aspectRatio?:     string;
  quality?:         string;
  style?:           string;
  maskDataUrl?:     string;
  referenceImages?: string[];
}

interface GenerationResult {
  imageDataUrl: string;
  mimeType: string;
  model: string;
}

// ── Provider ──────────────────────────────────────────────────────────────────

export class GoogleImageProvider implements AIProvider {
  readonly name = "google-image";
  readonly capabilities: ProviderCapability[] = ["image-generation"];

  private readonly ai: GoogleGenAI;
  private readonly defaultModel: string;

  constructor(private readonly config: ProviderConfig) {
    if (!config.apiKey) {
      throw new Error(
        "GoogleImageProvider requires GOOGLE_API_KEY (or GEMINI_API_KEY as fallback). " +
        "Add it to your .env file.",
      );
    }
    this.ai = new GoogleGenAI({ apiKey: config.apiKey });
    this.defaultModel = config.model;
  }

  async generate(request: GenerateRequest): Promise<GenerateResponse> {
    const model = request.model ?? this.defaultModel;
    const meta = (request.meta ?? {}) as ImageGenerationMeta;
    const operationType: ImageOperationType = meta.operationType ?? "text-to-image";
    const start = Date.now();

    try {
      let result: GenerationResult;

      switch (operationType) {
        case "text-to-image":
          result = await this._textToImage(request, model, meta);
          break;

        case "image-to-image":
          throw new InvalidRequestError(
            "image-to-image is not yet implemented. Use operationType 'text-to-image'.",
            this.name,
          );
        case "inpaint":
          throw new InvalidRequestError("inpaint is not yet implemented.", this.name);
        case "outpaint":
          throw new InvalidRequestError("outpaint is not yet implemented.", this.name);
        case "background-removal":
          throw new InvalidRequestError("background-removal is not yet implemented.", this.name);
        case "variation":
          throw new InvalidRequestError("variation is not yet implemented.", this.name);
        case "upscale":
          throw new InvalidRequestError("upscale is not yet implemented.", this.name);

        default: {
          const exhaustive: never = operationType;
          throw new InvalidRequestError(
            `Unknown operationType: "${exhaustive}".`,
            this.name,
          );
        }
      }

      aiLogger.info("Image generation complete", {
        provider: this.name,
        durationMs: Date.now() - start,
        meta: { model: result.model, operationType, mimeType: result.mimeType },
      });

      return {
        text: "",
        imageDataUrl: result.imageDataUrl,
        model: result.model,
        provider: this.name,
      };
    } catch (err) {
      aiLogger.error("Image generation failed", {
        provider: this.name,
        durationMs: Date.now() - start,
        meta: { model, operationType, error: (err as Error).message },
      });

      if (err instanceof AIError) throw err;
      return classifyError(err, this.name);
    }
  }

  async healthCheck(): Promise<boolean> {
    return !!this.config.apiKey;
  }

  // ── Private: text-to-image ────────────────────────────────────────────────

  private async _textToImage(
    request: GenerateRequest,
    model: string,
    meta: ImageGenerationMeta,
  ): Promise<GenerationResult> {
    const basePrompt = this._extractPrompt(request);

    if (!basePrompt.trim()) {
      throw new InvalidRequestError(
        "A non-empty text prompt is required for image generation.",
        this.name,
      );
    }

    const enrichedPrompt = this._enrichPrompt(basePrompt, meta);

    const response = await this.ai.models.generateContent({
      model,
      contents: enrichedPrompt,
      config: {
        responseModalities: ["IMAGE", "TEXT"] as string[],
      },
    });

    return this._extractImageFromResponse(response, model);
  }

  private _extractPrompt(request: GenerateRequest): string {
    const userMessages = request.messages.filter((m) => m.role === "user");
    const last = userMessages[userMessages.length - 1];
    if (!last) return "";
    if (typeof last.content === "string") return last.content;
    return last.content
      .filter((p) => p.type === "text")
      .map((p) => (p as { type: "text"; text: string }).text)
      .join("\n");
  }

  private _enrichPrompt(basePrompt: string, meta: ImageGenerationMeta): string {
    const parts: string[] = [basePrompt];
    const styleMod  = meta.style   ? STYLE_MODIFIERS[meta.style]    : undefined;
    const qualMod   = meta.quality ? QUALITY_MODIFIERS[meta.quality] : undefined;
    if (styleMod) parts.push(styleMod);
    if (qualMod)  parts.push(qualMod);
    return parts.join(". ");
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private _extractImageFromResponse(response: any, model: string): GenerationResult {
    const parts = response.candidates?.[0]?.content?.parts ?? [];

    const imagePart = parts.find(
      (p: { inlineData?: { mimeType?: string; data?: string } }) =>
        p.inlineData?.mimeType?.startsWith("image"),
    );

    if (!imagePart?.inlineData?.data) {
      throw new Error(
        "Google Gemini image model returned no image data. " +
        "Ensure billing is enabled on your Google AI Studio account " +
        "(https://aistudio.google.com) and that the model '" +
        model +
        "' supports image generation.",
      );
    }

    const mimeType    = imagePart.inlineData.mimeType ?? "image/png";
    const imageDataUrl = `data:${mimeType};base64,${imagePart.inlineData.data}`;

    return { imageDataUrl, mimeType, model };
  }
}
