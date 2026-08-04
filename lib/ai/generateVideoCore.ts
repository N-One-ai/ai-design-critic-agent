/**
 * Shared video generation core — server-side only.
 *
 * Future counterpart to generateImageCore(). Every API route that generates
 * video will call this function — no route should call a video provider directly.
 *
 * Planned pipeline:
 *   prompt → prompt enrichment → compression → brand context
 *   → VideoProvider (Higgsfield / Fal / Replicate) → Supabase upload
 *
 * Provider switch: changing from one video provider to another requires editing
 * only this file and the provider implementation — no route or UI changes needed.
 *
 * Status: NOT YET IMPLEMENTED.
 * Throws ProviderUnavailableError until a video provider is wired up.
 */

import { ProviderUnavailableError } from "./errors";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface GenerateVideoCoreInput {
  prompt:         string;
  durationSec?:   number;       // target clip length (default: 5)
  aspectRatio?:   "16:9" | "9:16" | "1:1";
  referenceImage?: string;      // first-frame reference (data URL or public URL)
}

export interface GenerateVideoCoreOutput {
  videoUrl:       string;       // Supabase public URL or data URL
  storagePath:    string;
  mimeType:       string;
  provider:       string;
  model:          string;
  generationTime: number;
  dimensions:     { width: number; height: number };
  durationSec:    number;
}

// ── Core pipeline ─────────────────────────────────────────────────────────────

/**
 * Generates a video clip from a text prompt.
 *
 * Currently throws — implement when a video provider is ready.
 * Callers should catch ProviderUnavailableError and display a "coming soon" message.
 */
export async function generateVideoCore(
  _input: GenerateVideoCoreInput,
): Promise<GenerateVideoCoreOutput> {
  throw new ProviderUnavailableError(
    "video",
    "Video generation is not yet implemented. " +
    "Wire up FalProvider or ReplicateProvider in this function when ready.",
  );
}
