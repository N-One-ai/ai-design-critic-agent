/**
 * AIService — abstract base class for all AI service implementations.
 *
 * Provides retry, timeout, and logging for free. Subclasses implement
 * only two methods:
 *   buildRequest()   — map domain input to a provider-agnostic GenerateRequest
 *   parseResponse()  — map GenerateResponse back to the domain output type
 *
 * Retry policy:
 *   Retryable errors (RateLimitError, TimeoutError, ProviderUnavailableError)
 *   are retried with exponential backoff: 1s → 2s → 4s.
 *   Non-retryable errors (QuotaExceededError, InvalidRequestError,
 *   ContentFilterError) propagate immediately.
 *
 * Adding a new service:
 *   1. Create lib/ai/services/<name>.ts
 *   2. export class MyService extends AIService<MyInput, MyOutput>
 *   3. Implement serviceName, requiredCapability, buildRequest, parseResponse
 *   4. Instantiate with: new MyService(AIProviderRegistry.getCapable("my-capability"))
 */

import type { AIProvider } from "../provider";
import type {
  GenerateRequest,
  GenerateResponse,
  ProviderCapability,
  ServiceExecuteOptions,
} from "../types";
import { AIError, TimeoutError } from "../errors";
import { aiLogger } from "../logger";

const DEFAULT_TIMEOUT_MS  = 30_000;
const DEFAULT_MAX_RETRIES = 3;
const BASE_BACKOFF_MS     = 1_000;

export abstract class AIService<TInput, TOutput> {
  /** Human-readable name shown in logs, e.g. "ImageAnalysisService". */
  abstract readonly serviceName: string;

  /** The provider capability this service requires. */
  abstract readonly requiredCapability: ProviderCapability;

  constructor(protected readonly provider: AIProvider) {}

  /**
   * Map domain input to a provider-agnostic GenerateRequest.
   * Must not call the provider; must be synchronous.
   */
  protected abstract buildRequest(input: TInput): GenerateRequest;

  /**
   * Map the provider's GenerateResponse to the domain output type.
   * May throw ParseError if the response cannot be parsed.
   */
  protected abstract parseResponse(
    response: GenerateResponse,
    input: TInput,
  ): TOutput;

  /**
   * Execute the service call with retry, timeout, and logging.
   * This is the only entry point callers should use.
   */
  async execute(input: TInput, options: ServiceExecuteOptions = {}): Promise<TOutput> {
    const maxRetries = options.maxRetries ?? DEFAULT_MAX_RETRIES;
    const timeoutMs  = options.timeoutMs  ?? DEFAULT_TIMEOUT_MS;
    const startTime  = Date.now();

    let lastError: unknown;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        aiLogger.info("Executing", {
          provider: this.provider.name,
          service: this.serviceName,
          meta: { attempt, maxRetries },
        });

        const request = this.buildRequest(input);
        const response = await withTimeout(
          () => this.provider.generate({ ...request, timeoutMs }),
          timeoutMs,
          this.provider.name,
        );
        const output = this.parseResponse(response, input);

        aiLogger.info("Completed", {
          provider: this.provider.name,
          service: this.serviceName,
          durationMs: Date.now() - startTime,
        });

        return output;
      } catch (err) {
        lastError = err;

        const retryable  = err instanceof AIError ? err.retryable : true;
        const isLastAttempt = attempt === maxRetries;

        aiLogger.warn(`Attempt ${attempt} failed`, {
          provider: this.provider.name,
          service: this.serviceName,
          meta: {
            error: (err as Error).message,
            retryable,
            willRetry: retryable && !isLastAttempt,
          },
        });

        if (!retryable || isLastAttempt) break;

        const delay = BASE_BACKOFF_MS * Math.pow(2, attempt - 1); // 1s, 2s, 4s
        await sleep(delay);
      }
    }

    aiLogger.error("All attempts failed", {
      provider: this.provider.name,
      service: this.serviceName,
      durationMs: Date.now() - startTime,
      meta: { maxRetries, error: (lastError as Error)?.message },
    });

    throw lastError;
  }
}

// ── Internal helpers ──────────────────────────────────────────────────────────

function withTimeout<T>(
  fn: () => Promise<T>,
  ms: number,
  provider?: string,
): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new TimeoutError(provider, ms)), ms);
    fn().then(
      (v) => { clearTimeout(timer); resolve(v); },
      (e) => { clearTimeout(timer); reject(e); },
    );
  });
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
