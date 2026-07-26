/**
 * AI Video Generation Service — extension point.
 *
 * CURRENT: Not implemented (returns a "not available" stub).
 * FUTURE:  Integrate Google Veo 2 by implementing POST /api/generate/video.
 *
 * Integration steps:
 * 1. Create app/api/generate/video/route.ts
 * 2. Add VEO_API_KEY to .env (when available in Google AI Studio)
 * 3. Implement video generation using the Veo 2 API
 * 4. Handle the async nature of video generation (poll or webhook)
 * 5. Replace the stub below with the real fetch + polling logic
 */

import type { AIServiceResult, VideoGenerationInput, VideoGenerationOutput } from "./types";

export async function generateVideo(
  input: VideoGenerationInput
): Promise<AIServiceResult<VideoGenerationOutput>> {
  // TODO: Replace stub with real Veo 2 API call
  void input;
  return {
    status: "error",
    error: "Video generation is not yet available. Coming soon with Veo 2.",
  };
}
