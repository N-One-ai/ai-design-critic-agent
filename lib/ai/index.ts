/**
 * lib/ai — AI Provider abstraction layer.
 *
 * Public barrel export. Import everything AI-related from "@/lib/ai".
 *
 * Architecture overview:
 *
 *   AIProvider (interface)  — lib/ai/provider.ts
 *     lib/ai/provider/
 *       ├── higgsfield.ts    — HiggsFieldProvider  — image-generation via CLI (primary)
 *       ├── gemini.ts        — GeminiProvider      — text-generation, image-analysis
 *       ├── google.ts        — GoogleImageProvider — image-generation via Gemini SDK
 *       ├── openai.ts        — OpenAIProvider      — stub (DALL-E 3)
 *       ├── fal.ts           — FalProvider         — stub (fal.ai)
 *       └── replicate.ts     — ReplicateProvider   — stub (Replicate.com)
 *
 *   AIProviderRegistry
 *     — Maps provider names to live instances
 *     — Routes service requests to the correct provider by capability
 *
 *   AIService<TInput, TOutput> (abstract)
 *     ├── ImageAnalysisService   — brand compliance analysis  [stub]
 *     └── BannerGenerationService — banner image generation   [stub]
 *         (future: ImageGenerationService, VideoGenerationService, PromptOptimizationService)
 *
 *   Error hierarchy:
 *     AIError → QuotaExceededError | RateLimitError | TimeoutError |
 *               ProviderUnavailableError | InvalidRequestError |
 *               ContentFilterError | ParseError
 */

// Provider interface + registry
export type { AIProvider }          from "./provider";
export { AIProviderRegistry }       from "./registry";

// Error hierarchy
export {
  AIError,
  QuotaExceededError,
  RateLimitError,
  TimeoutError,
  ProviderUnavailableError,
  InvalidRequestError,
  ContentFilterError,
  ParseError,
  classifyError,
}                                   from "./errors";
export type { AIErrorCode }         from "./errors";

// Core types
export type {
  ProviderCapability,
  MessageRole,
  TextPart,
  ImagePart,
  AIContentPart,
  AIMessage,
  GenerateRequest,
  GenerateResponse,
  TokenUsage,
  ProviderConfig,
  ServiceExecuteOptions,
}                                   from "./types";

// Logger
export { aiLogger }                 from "./logger";
export type { LogLevel, AILogContext } from "./logger";

// Providers — import from the canonical provider/ directory
export { GeminiProvider }           from "./provider/gemini";
export { GoogleImageProvider }      from "./provider/google";
export { HiggsFieldProvider }       from "./provider/higgsfield";
export { OpenAIProvider }           from "./provider/openai";
export { FalProvider }              from "./provider/fal";
export { ReplicateProvider }        from "./provider/replicate";

// Image generation types
export type {
  AspectRatio,
  ImageStyle,
  ImageQuality,
  ImageOperationType,
  ImageGenerateRequest,
  ImageGenerateResponse,
  ImageGenerateErrorResponse,
  ImageMetadata,
}                                   from "./types/image";
export { ASPECT_RATIO_DIMENSIONS }  from "./types/image";

// Services
export { AIService }                from "./services/base";
export { ImageAnalysisService }     from "./services/image-analysis";
export type {
  ImageAnalysisInput,
  ImageAnalysisRawOutput,
}                                   from "./services/image-analysis";
export { BannerGenerationService }  from "./services/banner-generation";
export type {
  BannerGenerationInput,
  BannerGenerationOutput,
}                                   from "./services/banner-generation";
export { BannerPromptService }      from "./services/banner-prompt";
export type {
  BannerPromptInput,
  BannerPromptOutput,
}                                   from "./services/banner-prompt";
