/**
 * BannerPromptService — generate an optimised Imagen 3 prompt from a high-level
 * banner brief (campaign objective, brand, audience, etc.).
 *
 * Provider requirement: "text-generation" (satisfied by GeminiProvider).
 *
 * Step 1 of the two-step banner pipeline:
 *   1. BannerPromptService   — brief → optimised Imagen 3 prompt  (this file)
 *   2. BannerGenerationService — prompt → banner image             (banner-generation.ts)
 *
 * The service sends the brief (and an optional reference image) to Gemini and
 * receives a JSON response with `optimizedPrompt` + `negativePrompt`.
 * If JSON parsing fails, the raw response text is used as the prompt.
 */

import type { GenerateRequest, GenerateResponse, AIContentPart } from "../types";
import { AIService } from "./base";
import { ParseError } from "../errors";
import { extractJson } from "@/lib/llm-client";

// ── Input / Output types ──────────────────────────────────────────────────────

export interface BannerPromptInput {
  campaignObjective: string;
  promotion?: string;
  brand?: string;
  targetAudience?: string;
  platform?: string;
  language?: string;
  visualStyle?: string;
  dimensions: { width: number; height: number };
  brandGuideline?: unknown;
  referenceImageDataUrl?: string;
}

export interface BannerPromptOutput {
  optimizedPrompt: string;
  negativePrompt?: string;
}

// ── Service ───────────────────────────────────────────────────────────────────

export class BannerPromptService extends AIService<BannerPromptInput, BannerPromptOutput> {
  readonly serviceName      = "BannerPromptService";
  readonly requiredCapability = "text-generation" as const;

  protected buildRequest(input: BannerPromptInput): GenerateRequest {
    const textContent = buildTextContent(input);

    if (input.referenceImageDataUrl) {
      const content: AIContentPart[] = [
        { type: "image", imageDataUrl: input.referenceImageDataUrl },
        {
          type: "text",
          text: `Use the visual style of this reference image as inspiration for the banner design.\n\n${textContent}`,
        },
      ];
      return {
        messages: [{ role: "user", content }],
        maxTokens: 1024,
        temperature: 0.7,
      };
    }

    return {
      messages: [{ role: "user", content: textContent }],
      maxTokens: 1024,
      temperature: 0.7,
    };
  }

  protected parseResponse(
    response: GenerateResponse,
    _input: BannerPromptInput,
  ): BannerPromptOutput {
    const parsed = extractJson(response.text);

    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      const obj = parsed as Record<string, unknown>;
      if (typeof obj.optimizedPrompt === "string" && obj.optimizedPrompt.trim()) {
        return {
          optimizedPrompt: obj.optimizedPrompt.trim(),
          negativePrompt:
            typeof obj.negativePrompt === "string" ? obj.negativePrompt.trim() : undefined,
        };
      }
    }

    // Fallback: use raw response text as the prompt
    const fallback = response.text.trim();
    if (!fallback) throw new ParseError("Empty prompt response from provider", "gemini");
    return { optimizedPrompt: fallback };
  }
}

// ── Prompt builder ────────────────────────────────────────────────────────────

function buildTextContent(input: BannerPromptInput): string {
  const { width, height } = input.dimensions;

  const lines: string[] = [
    "You are an expert prompt engineer for Google Imagen 3.",
    "Create a detailed, high-quality image generation prompt for a marketing banner.",
    "",
    "BANNER BRIEF:",
    `- Campaign objective: ${input.campaignObjective}`,
  ];

  if (input.promotion?.trim())      lines.push(`- Promotion / offer: ${input.promotion}`);
  if (input.brand?.trim())          lines.push(`- Brand: ${input.brand}`);
  if (input.targetAudience?.trim()) lines.push(`- Target audience: ${input.targetAudience}`);
  if (input.platform?.trim())       lines.push(`- Platform: ${input.platform}`);
  if (input.language)               lines.push(`- Banner language: ${input.language === "vi" ? "Vietnamese" : "English"}`);
  if (input.visualStyle?.trim())    lines.push(`- Visual style: ${input.visualStyle}`);

  lines.push(`- Dimensions / aspect ratio: ${width}×${height}px`);

  const bg = input.brandGuideline as Record<string, unknown> | undefined;
  if (bg?.colors) {
    const c   = bg.colors as Record<string, unknown>;
    const palette: string[] = [];
    const primary   = (c.primary   as { hex?: string } | undefined)?.hex;
    const secondary = (c.secondary as { hex?: string } | undefined)?.hex;
    if (primary)   palette.push(`primary ${primary}`);
    if (secondary) palette.push(`secondary ${secondary}`);
    if (palette.length) lines.push(`- Brand colors: ${palette.join(", ")}`);
  }
  if (bg?.brandName) lines.push(`- Brand name to feature: ${String(bg.brandName)}`);

  lines.push(
    "",
    "REQUIREMENTS:",
    "- Write a detailed Imagen 3 prompt covering composition, lighting, mood, and colour palette.",
    "- Emphasise a modern, tech-forward, trustworthy fintech aesthetic suitable for a payment app.",
    "- If visible text must appear in the banner, specify the exact wording and typography style.",
    "- Keep the prompt under 300 words.",
    "",
    "Return ONLY a JSON object — no markdown fences, no explanation:",
    `{"optimizedPrompt": "…detailed Imagen 3 prompt…", "negativePrompt": "blurry, low quality, distorted text, watermark, ugly, amateurish, grainy"}`,
  );

  return lines.join("\n");
}
