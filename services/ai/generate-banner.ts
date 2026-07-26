/**
 * AI Banner Generation Service — extension point.
 *
 * CURRENT: Not implemented (returns a "not available" stub).
 * FUTURE:  Integrate a design-to-image model (Imagen 3, Stable Diffusion, or
 *          a template rendering service) by implementing POST /api/generate/banner.
 *
 * Integration steps:
 * 1. Create app/api/generate/banner/route.ts
 * 2. Implement template selection + AI fill logic
 * 3. Return a preview URL + download URL
 * 4. Replace the stub below with the real fetch call
 */

import type { AIServiceResult, BannerGenerationInput, BannerGenerationOutput } from "./types";

export async function generateBanner(
  input: BannerGenerationInput
): Promise<AIServiceResult<BannerGenerationOutput>> {
  // TODO: Replace stub with real banner generation API call
  void input;
  return {
    status: "error",
    error: "Banner generation is not yet available. Check back soon.",
  };
}
