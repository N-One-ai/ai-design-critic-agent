/**
 * FalProvider — stub for future fal.ai integration.
 *
 * Capabilities (planned): image-generation, video-generation
 * Env vars (planned):     FAL_API_KEY
 *
 * fal.ai hosts open-source models (Flux, SDXL, AnimateDiff, etc.) via a
 * serverless inference API. Useful as a fallback when Higgsfield quota runs out.
 *
 * To implement:
 *   1. Install @fal-ai/client
 *   2. Replace this stub with a full AIProvider implementation
 *   3. Register in lib/config.ts and lib/ai/index.ts
 */

import type { AIProvider } from "../provider";
import type { GenerateRequest, GenerateResponse, ProviderCapability } from "../types";
import { ProviderUnavailableError } from "../errors";

export class FalProvider implements AIProvider {
  readonly name = "fal";
  readonly capabilities: ProviderCapability[] = ["image-generation", "video-generation"];

  async generate(_request: GenerateRequest): Promise<GenerateResponse> {
    throw new ProviderUnavailableError(this.name, "fal.ai provider is not yet implemented.");
  }

  async healthCheck(): Promise<boolean> {
    return false;
  }
}
