/**
 * GeminiProvider — Google Gemini implementation of AIProvider.
 *
 * Translates the provider-agnostic GenerateRequest into the @google/generative-ai
 * SDK format, calls the API, and returns a provider-agnostic GenerateResponse.
 *
 * Supported capabilities: text-generation, image-analysis, prompt-optimization
 * Not yet supported: image-generation, video-generation (requires Imagen/Veo — separate providers)
 *
 * Configuration (all via environment variables — see lib/config.ts):
 *   GEMINI_API_KEY         — required
 *   GEMINI_MODEL           — primary model (default: gemini-2.5-pro)
 *   GEMINI_FALLBACK_MODELS — comma-separated list tried when primary hits quota
 *   GEMINI_TIMEOUT_MS      — request timeout (default: 30000)
 *   GEMINI_MAX_RETRIES     — max retry attempts (default: 3)
 */

import { GoogleGenerativeAI } from "@google/generative-ai";
import type { Content } from "@google/generative-ai";
import type { AIProvider } from "../provider";
import type {
  GenerateRequest,
  GenerateResponse,
  ProviderCapability,
  ProviderConfig,
  AIMessage,
} from "../types";
import { classifyError } from "../errors";
import { aiLogger } from "../logger";

// ── Message conversion ────────────────────────────────────────────────────────

function toGeminiContents(messages: AIMessage[]): {
  systemInstruction: string | undefined;
  contents: Content[];
} {
  const systemMsg = messages.find((m) => m.role === "system");
  const chatMessages = messages.filter((m) => m.role !== "system");

  const systemInstruction = systemMsg
    ? typeof systemMsg.content === "string"
      ? systemMsg.content
      : systemMsg.content
          .filter((p) => p.type === "text")
          .map((p) => (p as { type: "text"; text: string }).text)
          .join("\n")
    : undefined;

  const contents: Content[] = chatMessages.map((msg) => ({
    role: msg.role === "assistant" ? "model" : "user",
    parts:
      typeof msg.content === "string"
        ? [{ text: msg.content }]
        : msg.content.map((part) => {
            if (part.type === "text") {
              return { text: part.text };
            }
            const [meta, data] = part.imageDataUrl.split(",");
            const mimeType = meta.replace("data:", "").replace(";base64", "");
            return { inlineData: { mimeType, data } };
          }),
  }));

  return { systemInstruction, contents };
}

// ── Provider implementation ───────────────────────────────────────────────────

export class GeminiProvider implements AIProvider {
  readonly name = "gemini";
  readonly capabilities: ProviderCapability[] = [
    "text-generation",
    "image-analysis",
    "prompt-optimization",
  ];

  private readonly genAI: GoogleGenerativeAI;

  constructor(private readonly config: ProviderConfig) {
    if (!config.apiKey) {
      throw new Error("GeminiProvider: GEMINI_API_KEY is not configured.");
    }
    this.genAI = new GoogleGenerativeAI(config.apiKey);
  }

  async generate(request: GenerateRequest): Promise<GenerateResponse> {
    const model = request.model ?? this.config.model;
    const { systemInstruction, contents } = toGeminiContents(request.messages);
    const start = Date.now();

    try {
      const geminiModel = this.genAI.getGenerativeModel({ model, systemInstruction });

      const result = await geminiModel.generateContent({
        contents,
        generationConfig: {
          maxOutputTokens: request.maxTokens ?? 8192,
          temperature: request.temperature,
        },
      });

      const text = result.response.text();
      if (!text) throw new Error("Gemini returned an empty response.");

      const meta = result.response.usageMetadata;

      aiLogger.info("Generation complete", {
        provider: "gemini",
        durationMs: Date.now() - start,
        meta: {
          model,
          inputTokens: meta?.promptTokenCount,
          outputTokens: meta?.candidatesTokenCount,
        },
      });

      return {
        text,
        model,
        provider: "gemini",
        usage: meta
          ? {
              inputTokens: meta.promptTokenCount ?? 0,
              outputTokens: meta.candidatesTokenCount ?? 0,
              totalTokens: meta.totalTokenCount ?? 0,
            }
          : undefined,
      };
    } catch (err) {
      aiLogger.error("Generation failed", {
        provider: "gemini",
        durationMs: Date.now() - start,
        meta: { model, error: (err as Error).message },
      });
      return classifyError(err, "gemini");
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      const model = this.genAI.getGenerativeModel({ model: this.config.model });
      const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: "ping" }] }],
        generationConfig: { maxOutputTokens: 4 },
      });
      return !!result.response.text();
    } catch {
      return false;
    }
  }
}
