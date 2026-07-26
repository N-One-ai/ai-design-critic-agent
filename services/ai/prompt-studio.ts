/**
 * Prompt Optimization Service — extension point.
 *
 * CURRENT: Not implemented (returns a "not available" stub).
 * FUTURE:  Use Gemini to analyze and optimize prompts for brand-specific
 *          content generation tasks.
 *
 * Integration steps:
 * 1. Create app/api/prompt/optimize/route.ts
 * 2. Build a system prompt that applies ZaloPay brand guidelines
 * 3. Return optimized prompt + variants
 * 4. Replace the stub below with the real fetch call
 */

import type { AIServiceResult, PromptOptimizationInput, PromptOptimizationOutput } from "./types";

export async function optimizePrompt(
  input: PromptOptimizationInput
): Promise<AIServiceResult<PromptOptimizationOutput>> {
  // TODO: Replace stub with real Gemini prompt optimization call
  void input;
  return {
    status: "error",
    error: "Prompt optimization is not yet available. Check back soon.",
  };
}
