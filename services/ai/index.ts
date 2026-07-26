/**
 * AI Services barrel export.
 *
 * Import AI service functions from this module:
 *   import { analyzeDesignImage, generateImage } from "@/services/ai"
 */

export { analyzeDesignImage }   from "./analyze";
export { generateImage }        from "./generate-image";
export { generateBanner }       from "./generate-banner";
export { generateVideo }        from "./generate-video";
export { optimizePrompt }       from "./prompt-studio";
export type {
  AIServiceStatus,
  AIServiceResult,
  BrandAnalysisInput,
  BrandAnalysisOutput,
  ImageGenerationInput,
  ImageGenerationOutput,
  BannerGenerationInput,
  BannerGenerationOutput,
  VideoGenerationInput,
  VideoGenerationOutput,
  PromptOptimizationInput,
  PromptOptimizationOutput,
} from "./types";
