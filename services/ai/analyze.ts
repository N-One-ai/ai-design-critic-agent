/**
 * Brand Analysis AI Service.
 *
 * CURRENT: Delegates to the existing /api/analyze route (Google Gemini).
 * FUTURE:  Swap the fetch URL or provider as new models become available.
 *
 * Extension points:
 * - Change model: update GEMINI_API_KEY + model name in /lib/config.ts
 * - Add provider: implement a Provider interface and swap here
 * - Add streaming: replace fetch with EventSource / ReadableStream
 */

import type { AIServiceResult, BrandAnalysisInput, BrandAnalysisOutput } from "./types";

export async function analyzeDesignImage(
  input: BrandAnalysisInput
): Promise<AIServiceResult<BrandAnalysisOutput>> {
  try {
    const response = await fetch("/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        image: input.imageDataUrl,
        designName: input.designName,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      return { status: "error", error };
    }

    const data = await response.json();
    return { status: "success", data };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    const status = message.includes("quota") ? "quota_exceeded" : "error";
    return { status, error: message };
  }
}
