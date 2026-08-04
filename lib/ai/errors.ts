/**
 * AI error hierarchy.
 *
 * All errors thrown by providers and services extend AIError.
 * The `retryable` flag tells AIService.execute() whether a retry is safe.
 *
 * Error taxonomy:
 *   QuotaExceededError    — daily/monthly quota hit; do NOT retry, surface to user
 *   RateLimitError        — per-minute rate limit; safe to retry with backoff
 *   TimeoutError          — provider took too long; safe to retry
 *   ProviderUnavailableError — provider returned 5xx; safe to retry
 *   InvalidRequestError   — bad input (size, format, missing field); never retry
 *   ContentFilterError    — provider refused the content; never retry
 *   ParseError            — provider replied but JSON was unparseable; safe to retry once
 */

export type AIErrorCode =
  | "QUOTA_EXCEEDED"
  | "RATE_LIMITED"
  | "TIMEOUT"
  | "PROVIDER_UNAVAILABLE"
  | "INVALID_REQUEST"
  | "CONTENT_FILTERED"
  | "PARSE_ERROR"
  | "UNKNOWN";

export class AIError extends Error {
  readonly code: AIErrorCode;
  readonly provider: string | undefined;
  readonly retryable: boolean;

  constructor(
    message: string,
    code: AIErrorCode,
    provider?: string,
    retryable = false,
  ) {
    super(message);
    this.name = "AIError";
    this.code = code;
    this.provider = provider;
    this.retryable = retryable;
    // Restore prototype chain in transpiled environments
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class QuotaExceededError extends AIError {
  constructor(provider?: string) {
    super(
      "AI provider quota exceeded. Please try again later.",
      "QUOTA_EXCEEDED",
      provider,
      false,
    );
    this.name = "QuotaExceededError";
  }
}

export class RateLimitError extends AIError {
  readonly retryAfterMs: number | undefined;

  constructor(provider?: string, retryAfterMs?: number) {
    super(
      "AI provider rate limit reached. Retrying after backoff.",
      "RATE_LIMITED",
      provider,
      true,
    );
    this.name = "RateLimitError";
    this.retryAfterMs = retryAfterMs;
  }
}

export class TimeoutError extends AIError {
  constructor(provider?: string, timeoutMs?: number) {
    super(
      `AI provider request timed out${timeoutMs ? ` after ${timeoutMs}ms` : ""}.`,
      "TIMEOUT",
      provider,
      true,
    );
    this.name = "TimeoutError";
  }
}

export class ProviderUnavailableError extends AIError {
  constructor(provider?: string, detail?: string) {
    super(
      [
        "AI provider is temporarily unavailable.",
        provider && `[${provider}]`,
        detail && `— ${detail}`,
      ]
        .filter(Boolean)
        .join(" "),
      "PROVIDER_UNAVAILABLE",
      provider,
      true,
    );
    this.name = "ProviderUnavailableError";
  }
}

export class InvalidRequestError extends AIError {
  constructor(message: string, provider?: string) {
    super(message, "INVALID_REQUEST", provider, false);
    this.name = "InvalidRequestError";
  }
}

export class ContentFilterError extends AIError {
  constructor(provider?: string) {
    super(
      "Content was blocked by the AI provider's safety filters.",
      "CONTENT_FILTERED",
      provider,
      false,
    );
    this.name = "ContentFilterError";
  }
}

export class ParseError extends AIError {
  constructor(detail: string, provider?: string) {
    super(`Failed to parse AI response: ${detail}`, "PARSE_ERROR", provider, true);
    this.name = "ParseError";
  }
}

/** Map a raw error message to the appropriate AIError subclass. */
export function classifyError(err: unknown, provider?: string): never {
  if (err instanceof AIError) throw err;
  const msg = String((err as Error)?.message ?? "");

  // Auth / bad key — must be checked BEFORE quota so a 400 API_KEY_INVALID
  // is never misidentified as a quota error and never retried pointlessly.
  if (
    msg.includes("API_KEY_INVALID") ||
    msg.includes("UNAUTHENTICATED") ||
    msg.toLowerCase().includes("api key not valid") ||
    msg.toLowerCase().includes("invalid api key") ||
    msg.includes("[401 ]")
  ) {
    throw new InvalidRequestError(
      "API key không hợp lệ. Vui lòng kiểm tra biến môi trường GEMINI_API_KEY.",
      provider,
    );
  }

  if (
    msg.includes("429") ||
    msg.includes("RESOURCE_EXHAUSTED") ||
    msg.toLowerCase().includes("quota") ||
    msg.toLowerCase().includes("too many requests")
  ) {
    throw new QuotaExceededError(provider);
  }

  if (msg.includes("503") || msg.includes("UNAVAILABLE") || msg.includes("502")) {
    throw new ProviderUnavailableError(provider);
  }

  if (
    msg.toUpperCase().includes("SAFETY") ||
    msg.toLowerCase().includes("blocked") ||
    msg.toLowerCase().includes("harmful")
  ) {
    throw new ContentFilterError(provider);
  }

  throw err instanceof Error ? err : new Error(String(err));
}
