/**
 * OpenAIProvider — stub for future OpenAI / DALL-E 3 integration.
 *
 * Capabilities (planned): image-generation, text-generation
 * Env vars (planned):     OPENAI_API_KEY, OPENAI_IMAGE_MODEL
 *
 * To implement:
 *   1. Install @openai/sdk
 *   2. Replace this stub with a full AIProvider implementation
 *   3. Register in lib/config.ts and lib/ai/index.ts
 */

import type { AIProvider } from "../provider";
import type { GenerateRequest, GenerateResponse, ProviderCapability } from "../types";
import { ProviderUnavailableError } from "../errors";

export class OpenAIProvider implements AIProvider {
  readonly name = "openai";
  readonly capabilities: ProviderCapability[] = ["image-generation", "text-generation"];

  async generate(_request: GenerateRequest): Promise<GenerateResponse> {
    throw new ProviderUnavailableError(this.name, "OpenAI provider is not yet implemented.");
  }

  async healthCheck(): Promise<boolean> {
    return false;
  }
}
