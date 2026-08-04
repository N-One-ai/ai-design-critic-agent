/**
 * Image generation service — client-side.
 *
 * Thin fetch wrapper over POST /api/image/generate.
 * Translates the AIServiceResult shape consumed by frontend components.
 */

import type { AIServiceResult, ImageGenerationInput, ImageGenerationOutput } from "./types";

export async function generateImage(
  input: ImageGenerationInput,
): Promise<AIServiceResult<ImageGenerationOutput>> {
  try {
    const res = await fetch("/api/image/generate", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({
        prompt:      input.prompt,
        style:       input.style,
        aspectRatio: input.aspectRatio,
        quality:     input.quality === "high" ? "hd" : input.quality,
      }),
    });

    const data = await res.json() as { success: boolean; error?: string; imageUrl?: string; metadata?: { storagePath?: string } };

    if (!res.ok || !data.success) {
      if (res.status === 429) {
        return { status: "quota_exceeded", error: data.error ?? "Quota tạo ảnh đã hết." };
      }
      return { status: "error", error: data.error ?? "Tạo ảnh thất bại." };
    }

    return {
      status: "success",
      data: {
        imageUrl:     data.imageUrl!,
        generationId: data.metadata?.storagePath ?? `gen-${Date.now()}`,
      },
    };
  } catch (e) {
    return {
      status: "error",
      error:  (e as Error)?.message ?? "Kết nối thất bại. Vui lòng thử lại.",
    };
  }
}
