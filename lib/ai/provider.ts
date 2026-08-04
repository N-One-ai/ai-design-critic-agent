/**
 * AIProvider interface.
 *
 * Every AI provider — Gemini, OpenAI, Claude, Imagen, Veo, Flux, Recraft,
 * Runway — must implement this interface. Services talk only to this interface;
 * they never import a concrete provider class.
 *
 * Adding a new provider:
 *   1. Create lib/ai/provider/<name>.ts
 *   2. Implement AIProvider
 *   3. Register at startup: AIProviderRegistry.register(new MyProvider(config))
 *   No other file needs to change.
 */

import type { GenerateRequest, GenerateResponse, ProviderCapability } from "./types";

export interface AIProvider {
  /** Unique identifier, e.g. "gemini", "openai", "claude". */
  readonly name: string;

  /**
   * Capabilities this provider supports.
   * The registry uses this to route service requests to the correct provider.
   */
  readonly capabilities: ProviderCapability[];

  /**
   * Core generation call. This is the single method all services call.
   * Providers translate the provider-agnostic GenerateRequest into their
   * native SDK format and return a provider-agnostic GenerateResponse.
   *
   * Throws: QuotaExceededError | RateLimitError | TimeoutError |
   *         ProviderUnavailableError | InvalidRequestError | ContentFilterError
   */
  generate(request: GenerateRequest): Promise<GenerateResponse>;

  /**
   * Lightweight liveness check. Should complete within 2–3 seconds.
   * Returns true if the provider endpoint is reachable and the API key is valid.
   * Used by GET /api/health.
   */
  healthCheck(): Promise<boolean>;
}
