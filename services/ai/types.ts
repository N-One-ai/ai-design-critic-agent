/**
 * Shared type definitions for all AI service modules.
 *
 * These types define the contract between the frontend and the AI backend.
 * When a real AI model is integrated, these interfaces must be satisfied.
 */

export type AIServiceStatus = "idle" | "loading" | "success" | "error" | "quota_exceeded";

export interface AIServiceResult<T> {
  status: AIServiceStatus;
  data?: T;
  error?: string;
}

/* ─── Brand Analysis ─────────────────────────────────────────────────── */

export interface BrandAnalysisInput {
  /** Base64-encoded image or data URL */
  imageDataUrl: string;
  designName?: string;
}

export interface BrandAnalysisOutput {
  overallScore: number | null;
  categories: Record<string, { score: number | null; conclusion: string }>;
  summary: string;
  mainIssues: string[];
  improvementSuggestions: string[];
}

/* ─── Image Generation ──────────────────────────────────────────────── */

export interface ImageGenerationInput {
  prompt: string;
  style?: "realistic" | "illustration" | "brand";
  aspectRatio?: "1:1" | "16:9" | "9:16" | "4:3";
  quality?: "standard" | "high";
}

export interface ImageGenerationOutput {
  imageUrl: string;
  revisedPrompt?: string;
  generationId: string;
}

/* ─── Banner Generation ─────────────────────────────────────────────── */

export interface BannerGenerationInput {
  prompt: string;
  templateId?: string;
  dimensions: { width: number; height: number };
  brandColors?: string[];
}

export interface BannerGenerationOutput {
  previewUrl: string;
  downloadUrl: string;
  generationId: string;
}

/* ─── Video Generation ──────────────────────────────────────────────── */

export interface VideoGenerationInput {
  script: string;
  duration?: 15 | 30 | 60;
  format?: "landscape" | "portrait" | "square";
  style?: "corporate" | "dynamic" | "minimal";
}

export interface VideoGenerationOutput {
  videoUrl: string;
  thumbnailUrl: string;
  duration: number;
  generationId: string;
}

/* ─── Prompt Optimization ───────────────────────────────────────────── */

export interface PromptOptimizationInput {
  originalPrompt: string;
  targetAudience?: string;
  tone?: string;
  platform?: "banner" | "social" | "email" | "video";
}

export interface PromptOptimizationOutput {
  optimizedPrompt: string;
  variants: string[];
  improvements: string[];
}
