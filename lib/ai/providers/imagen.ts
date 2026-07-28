/**
 * ImagenProvider — Gemini native image generation via generateContent.
 *
 * Uses @google/genai to call Gemini image models (gemini-3.1-flash-image-preview,
 * gemini-3.1-flash-image, etc.) with responseModalities: ['IMAGE'].
 * Reuses the same GEMINI_API_KEY.
 *
 * NOTE: Image generation models require billing to be enabled on your Google AI
 * Studio account (free-tier limit is 0). Enable billing at https://aistudio.google.com.
 *
 * Supported capability: image-generation
 * Provider name: "imagen"
 *
 * Configuration (all via environment variables — see lib/config.ts):
 *   GEMINI_API_KEY — required (shared with GeminiProvider)
 *   IMAGEN_MODEL   — primary model (default: gemini-3.1-flash-image-preview)
 */

import { GoogleGenAI } from "@google/genai";
import type { AIProvider } from "../provider";
import type {
  GenerateRequest,
  GenerateResponse,
  ProviderCapability,
  ProviderConfig,
} from "../types";
import { classifyError, InvalidRequestError } from "../errors";
import { aiLogger } from "../logger";

export class ImagenProvider implements AIProvider {
  readonly name = "imagen";
  readonly capabilities: ProviderCapability[] = ["image-generation"];

  private readonly ai: GoogleGenAI;

  constructor(private readonly config: ProviderConfig) {
    if (!config.apiKey) {
      throw new Error("ImagenProvider: GEMINI_API_KEY is required.");
    }
    this.ai = new GoogleGenAI({ apiKey: config.apiKey });
  }

  async generate(request: GenerateRequest): Promise<GenerateResponse> {
    const model = request.model ?? this.config.model;
    const prompt = extractTextPrompt(request);
    if (!prompt) {
      throw new InvalidRequestError(
        "A non-empty text prompt is required for image generation.",
        "imagen",
      );
    }

    const start = Date.now();

    try {
      const response = await this.ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          responseModalities: ["IMAGE", "TEXT"] as string[],
        },
      });

      const parts = response.candidates?.[0]?.content?.parts ?? [];
      const imagePart = parts.find(
        (p: { inlineData?: { mimeType?: string; data?: string } }) =>
          p.inlineData?.mimeType?.startsWith("image"),
      );

      if (!imagePart?.inlineData?.data) {
        throw new Error("Gemini image model returned no image data.");
      }

      const mimeType = imagePart.inlineData.mimeType ?? "image/jpeg";
      const imageDataUrl = `data:${mimeType};base64,${imagePart.inlineData.data}`;

      aiLogger.info("Image generation complete", {
        provider: "imagen",
        durationMs: Date.now() - start,
        meta: { model, promptLength: prompt.length },
      });

      return { text: "", imageDataUrl, model, provider: "imagen" };
    } catch (err) {
      aiLogger.error("Image generation failed", {
        provider: "imagen",
        durationMs: Date.now() - start,
        meta: { model, error: (err as Error).message },
      });
      return classifyError(err, "imagen");
    }
  }

  async healthCheck(): Promise<boolean> {
    return !!this.config.apiKey;
  }
}

function extractTextPrompt(request: GenerateRequest): string {
  const userMessages = request.messages.filter((m) => m.role === "user");
  const last = userMessages[userMessages.length - 1];
  if (!last) return "";
  if (typeof last.content === "string") return last.content;
  return last.content
    .filter((p) => p.type === "text")
    .map((p) => (p as { type: "text"; text: string }).text)
    .join("\n");
}
