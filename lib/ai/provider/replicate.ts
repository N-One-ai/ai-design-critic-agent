/**
 * ReplicateProvider — stub for future Replicate.com integration.
 *
 * Capabilities (planned): image-generation, video-generation
 * Env vars (planned):     REPLICATE_API_TOKEN
 *
 * Replicate hosts community and proprietary models via a prediction API.
 * Models of interest: SDXL, Flux Pro, Wan Video, Stable Video Diffusion.
 *
 * To implement:
 *   1. Install replicate package
 *   2. Replace this stub with a full AIProvider implementation
 *   3. Register in lib/config.ts and lib/ai/index.ts
 */

import type { AIProvider } from "../provider";
import type { GenerateRequest, GenerateResponse, ProviderCapability } from "../types";
import { ProviderUnavailableError } from "../errors";

export class ReplicateProvider implements AIProvider {
  readonly name = "replicate";
  readonly capabilities: ProviderCapability[] = ["image-generation", "video-generation"];

  async generate(_request: GenerateRequest): Promise<GenerateResponse> {
    throw new ProviderUnavailableError(this.name, "Replicate provider is not yet implemented.");
  }

  async healthCheck(): Promise<boolean> {
    return false;
  }
}
