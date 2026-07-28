/**
 * ImageAnalysisService — analyse a design image against brand guidelines.
 *
 * Provider requirement: "image-analysis" (satisfied by GeminiProvider).
 *
 * Build path:
 *   1. buildRequest()  — delegates to lib/prompt-builder.buildMessages(), then
 *      converts the legacy message format to AIMessage[] (ImagePart + TextPart)
 *   2. parseResponse() — calls lib/llm-client.extractJson() to parse the
 *      structured JSON returned by Gemini
 *
 * The service is provider-agnostic: swap GeminiProvider for any provider
 * that declares "image-analysis" capability without touching this file.
 */

import type { GenerateRequest, GenerateResponse, AIMessage, AIContentPart } from "../types";
import { AIService } from "./base";
import { ParseError } from "../errors";
import { buildMessages } from "@/lib/prompt-builder";
import { extractJson } from "@/lib/llm-client";

// ── Input / Output types ──────────────────────────────────────────────────────

export interface ImageAnalysisInput {
  /** Fully-formed data URL: data:image/png;base64,… */
  imageDataUrl: string;
  designName?: string;
  brandGuideline?: unknown;
  referenceAssets?: {
    logoDataUrl?: string | null;
    officialLogos?: Array<{ file: string; dataUrl: string }>;
    trademarks?: Array<{ file: string; dataUrl: string }>;
    deprecatedLogos?: Array<{ file: string; dataUrl: string }>;
  };
  language?: string;
}

/** Raw structured JSON returned by the provider. Shape is defined by the prompt schema. */
export type ImageAnalysisRawOutput = Record<string, unknown>;

// ── Legacy message types (matches lib/prompt-builder return shape) ─────────────

type LegacyTextPart  = { type: "text";      text?: string };
type LegacyImagePart = { type: "image_url"; image_url: { url: string } };
type LegacyPart      = LegacyTextPart | LegacyImagePart;
type LegacyMessage   = { role: "system" | "user"; content: string | LegacyPart[] };

// ── Format conversion ─────────────────────────────────────────────────────────

function toAIMessages(legacy: LegacyMessage[]): AIMessage[] {
  return legacy.map((m) => ({
    role: m.role,
    content:
      typeof m.content === "string"
        ? m.content
        : (m.content as LegacyPart[]).map((p): AIContentPart => {
            if (p.type === "text") {
              return { type: "text", text: (p as LegacyTextPart).text ?? "" };
            }
            return {
              type: "image",
              imageDataUrl: (p as LegacyImagePart).image_url.url,
            };
          }),
  }));
}

// ── Service ───────────────────────────────────────────────────────────────────

export class ImageAnalysisService extends AIService<
  ImageAnalysisInput,
  ImageAnalysisRawOutput
> {
  readonly serviceName      = "ImageAnalysisService";
  readonly requiredCapability = "image-analysis" as const;

  protected buildRequest(input: ImageAnalysisInput): GenerateRequest {
    const assets = input.referenceAssets ?? {};

    const legacy = buildMessages({
      imageContent:               input.imageDataUrl,
      logoReferenceContent:       assets.logoDataUrl ?? null,
      officialLogoContents:       assets.officialLogos?.map((l) => ({ file: l.file, content: l.dataUrl })),
      trademarkReferenceContents: assets.trademarks?.map((t) => ({ file: t.file, content: t.dataUrl })),
      deprecatedLogoContents:     assets.deprecatedLogos?.map((d) => ({ file: d.file, content: d.dataUrl })),
      brandGuideline:             input.brandGuideline,
      designName:                 input.designName,
      language:                   input.language ?? "vi",
    });

    return {
      messages:  toAIMessages(legacy as LegacyMessage[]),
      maxTokens: 8192,
    };
  }

  protected parseResponse(
    response: GenerateResponse,
    _input: ImageAnalysisInput,
  ): ImageAnalysisRawOutput {
    const parsed = extractJson(response.text);

    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      throw new ParseError("AI response was not a valid JSON object", "gemini");
    }

    const data = parsed as Record<string, unknown>;

    // Normalise trademarkCompliance.score (Gemini sometimes returns it as complianceScore)
    const categories = data.categories as
      | Record<string, Record<string, unknown>>
      | undefined;
    if (
      categories?.trademarkCompliance &&
      typeof categories.trademarkCompliance.score !== "number"
    ) {
      categories.trademarkCompliance.score =
        categories.trademarkCompliance.complianceScore ?? null;
    }

    return data;
  }
}
