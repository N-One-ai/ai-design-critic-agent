/**
 * BannerGenerationService — generate brand-compliant banner images via Imagen 3.
 *
 * Provider requirement: "image-generation"
 * Default provider: ImagenProvider (imagen-3.0-generate-001)
 *
 * Usage:
 *   AIProviderRegistry.register(new ImagenProvider(aiProviderConfig.imagen));
 *   const service = new BannerGenerationService(AIProviderRegistry.getCapable("image-generation"));
 *   const result = await service.execute({ prompt, dimensions, brandColors });
 *   // result.imageUrl is a data URL ready for <img src> or storage upload
 */

import type { GenerateRequest, GenerateResponse } from "../types";
import { ParseError } from "../errors";
import { AIService } from "./base";

// ── Input / Output types ──────────────────────────────────────────────────────

export interface BannerGenerationInput {
  prompt: string;
  templateId?: string;
  dimensions: { width: number; height: number };
  brandColors?: string[];
  brandGuideline?: unknown;
  negativePrompt?: string;
}

export interface BannerGenerationOutput {
  /** URL or data URL of the generated banner image. */
  imageUrl: string;
  /** Prompt actually used by the provider (may differ if the provider revised it). */
  revisedPrompt?: string;
  generationId: string;
}

// ── Service ───────────────────────────────────────────────────────────────────

export class BannerGenerationService extends AIService<
  BannerGenerationInput,
  BannerGenerationOutput
> {
  readonly serviceName      = "BannerGenerationService";
  readonly requiredCapability = "image-generation" as const;

  protected buildRequest(input: BannerGenerationInput): GenerateRequest {
    const parts: string[] = [input.prompt];

    if (input.brandColors?.length) {
      parts.push(`Use brand color palette: ${input.brandColors.join(", ")}.`);
    }

    return {
      messages: [{ role: "user", content: parts.join(" ") }],
      meta: {
        aspectRatio: dimsToAspectRatio(input.dimensions),
        outputMimeType: "image/jpeg",
        ...(input.negativePrompt ? { negativePrompt: input.negativePrompt } : {}),
      },
    };
  }

  protected parseResponse(
    response: GenerateResponse,
    input: BannerGenerationInput,
  ): BannerGenerationOutput {
    if (!response.imageDataUrl) {
      throw new ParseError("No image data in Imagen response", "imagen");
    }

    return {
      imageUrl: response.imageDataUrl,
      generationId: stableId(input.prompt, input.dimensions),
    };
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function dimsToAspectRatio(dims: { width: number; height: number }): string {
  const r = dims.width / dims.height;
  if (r >= 1.7)  return "16:9";
  if (r >= 1.2)  return "4:3";
  if (r <= 0.59) return "9:16";
  if (r <= 0.84) return "3:4";
  return "1:1";
}

// djb2 hash — no Date/Math.random (would break Workflow resume caching)
function stableId(prompt: string, dims: { width: number; height: number }): string {
  const raw = `${prompt.slice(0, 32)}-${dims.width}x${dims.height}`;
  let h = 5381;
  for (let i = 0; i < raw.length; i++) h = ((h << 5) + h) ^ raw.charCodeAt(i);
  return (h >>> 0).toString(36);
}
