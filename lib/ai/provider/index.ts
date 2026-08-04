/**
 * lib/ai/provider — AI provider implementations.
 *
 * Every provider here implements the AIProvider interface (lib/ai/provider.ts).
 *
 * Active providers:
 *   HiggsFieldProvider  — image generation via CLI  (primary, all image routes)
 *   GeminiProvider      — text generation + analysis (prompt optimization, brand analysis)
 *   GoogleImageProvider — Google Gemini image generation (registered, not yet used by routes)
 *
 * Future providers (stubs — implement and register when needed):
 *   OpenAIProvider    — DALL-E 3 / GPT-4o image generation
 *   FalProvider       — fal.ai open-source model inference
 *   ReplicateProvider — Replicate.com prediction API
 *
 * Usage:
 *   import { HiggsFieldProvider } from "@/lib/ai/provider/higgsfield"
 *   import { GeminiProvider }     from "@/lib/ai/provider/gemini"
 *   // or from the barrel:
 *   import { HiggsFieldProvider, GeminiProvider } from "@/lib/ai/provider"
 */

export { HiggsFieldProvider }  from "./higgsfield";
export { GeminiProvider }      from "./gemini";
export { GoogleImageProvider } from "./google";
export { OpenAIProvider }      from "./openai";
export { FalProvider }         from "./fal";
export { ReplicateProvider }   from "./replicate";
