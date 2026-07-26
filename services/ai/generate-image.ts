/**
 * AI Image Generation Service — extension point.
 *
 * CURRENT: Not implemented (returns a "not available" stub).
 * FUTURE:  Integrate Google Imagen 3 (or similar) by implementing the
 *          POST /api/generate/image route and wiring it below.
 *
 * Integration steps:
 * 1. Create app/api/generate/image/route.ts
 * 2. Add IMAGEN_API_KEY to .env
 * 3. Implement generateImageFromPrompt() using @google/generative-ai
 * 4. Replace the stub below with the real fetch call
 */

import type { AIServiceResult, ImageGenerationInput, ImageGenerationOutput } from "./types";

export async function generateImage(
  input: ImageGenerationInput
): Promise<AIServiceResult<ImageGenerationOutput>> {
  // TODO: Replace stub with real Imagen 3 API call
  void input;
  return {
    status: "error",
    error: "Image generation is not yet available. Check back soon.",
  };
}
