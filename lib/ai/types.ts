/**
 * Core AI types — the shared contract between providers and services.
 *
 * These types are provider-agnostic. A GeminiProvider, OpenAIProvider,
 * or ClaudeProvider all consume GenerateRequest and return GenerateResponse.
 * Services build GenerateRequests and parse GenerateResponses without
 * knowing which provider is underneath.
 */

// ── Capabilities ──────────────────────────────────────────────────────────────

/**
 * Discrete capabilities a provider can advertise.
 * Services declare which capability they require; the registry routes accordingly.
 */
export type ProviderCapability =
  | "text-generation"
  | "image-analysis"
  | "image-generation"
  | "video-generation"
  | "banner-generation"
  | "prompt-optimization";

// ── Message format ────────────────────────────────────────────────────────────

export type MessageRole = "system" | "user" | "assistant";

export interface TextPart {
  type: "text";
  text: string;
}

export interface ImagePart {
  type: "image";
  /** Must be a fully-formed data URL: data:image/png;base64,… */
  imageDataUrl: string;
}

export type AIContentPart = TextPart | ImagePart;

export interface AIMessage {
  role: MessageRole;
  /** String shorthand for text-only messages; array for multimodal. */
  content: string | AIContentPart[];
}

// ── Generation request / response ─────────────────────────────────────────────

export interface GenerateRequest {
  messages: AIMessage[];
  /** Override the provider's default model for this call. */
  model?: string;
  maxTokens?: number;
  temperature?: number;
  /** Per-request timeout in ms. Takes precedence over ProviderConfig.timeoutMs. */
  timeoutMs?: number;
  /** Provider-specific extras (e.g. aspectRatio, outputMimeType for image generation). */
  meta?: Record<string, unknown>;
}

export interface TokenUsage {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
}

export interface GenerateResponse {
  text: string;
  /** Actual model used (may differ from requested if the provider fell back). */
  model: string;
  provider: string;
  usage?: TokenUsage;
  /** Base64 data URL returned by image-generation providers (e.g. Imagen). */
  imageDataUrl?: string;
}

// ── Provider configuration ────────────────────────────────────────────────────

/**
 * Per-provider runtime configuration, populated from environment variables.
 * Never stored in source code — always read from process.env.
 */
export interface ProviderConfig {
  /** API key for the provider — NEVER logged or returned to the client. */
  apiKey: string;
  /** Primary model name, e.g. "gemini-2.5-pro" or "gpt-4o". */
  model: string;
  /** Ordered list of fallback models tried when the primary hits quota/rate-limit. */
  fallbackModels: string[];
  /** Default request timeout in ms. */
  timeoutMs: number;
  /** Maximum retry attempts before propagating the error. */
  maxRetries: number;
}

// ── Service execution options ─────────────────────────────────────────────────

/** Per-call overrides passed to AIService.execute(). */
export interface ServiceExecuteOptions {
  timeoutMs?: number;
  maxRetries?: number;
}
