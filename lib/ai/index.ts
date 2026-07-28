/**
 * lib/ai — AI Provider abstraction layer.
 *
 * Public barrel export. Import everything AI-related from "@/lib/ai".
 *
 * Architecture overview:
 *
 *   AIProvider (interface)
 *     ├── GeminiProvider   — text-generation, image-analysis, prompt-optimization
 *     ├── ImagenProvider   — image-generation  (imagen-3.0-generate-001)
 *         (future: OpenAIProvider, ClaudeProvider, VeoProvider, FluxProvider, RecraftProvider)
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

// Providers
export { GeminiProvider }           from "./providers/gemini";
export { ImagenProvider }           from "./providers/imagen";

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
