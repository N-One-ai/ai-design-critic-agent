/**
 * Application configuration.
 *
 * ALL values come from environment variables — never hardcoded.
 * See .env.example for the full list of supported variables.
 *
 * SECURITY: API keys are read here and passed to provider constructors.
 * They must never be returned to the client, logged, or stored elsewhere.
 */

import type { ProviderConfig } from "./ai/types";

// ── Per-provider configuration ────────────────────────────────────────────────

function parseList(raw: string | undefined, fallback: string): string[] {
  return (raw || fallback)
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function parseMs(raw: string | undefined, fallbackMs: number): number {
  const n = parseInt(raw ?? "", 10);
  return isNaN(n) ? fallbackMs : n;
}

export const aiProviderConfig: Record<string, ProviderConfig> = {
  gemini: {
    apiKey:         process.env.GEMINI_API_KEY         ?? "",
    model:          process.env.GEMINI_MODEL           ?? process.env.LLM_MODEL ?? "gemini-2.5-pro",
    fallbackModels: parseList(
                      process.env.GEMINI_FALLBACK_MODELS ?? process.env.LLM_FALLBACK_MODELS,
                      "gemini-flash-latest",
                    ),
    timeoutMs:      parseMs(process.env.GEMINI_TIMEOUT_MS, 30_000),
    maxRetries:     parseMs(process.env.GEMINI_MAX_RETRIES, 3),
  },

  // Future provider slots — add API keys to .env when ready.
  // The keys default to empty string so the config object is safe to import
  // even before the providers are available; the provider constructors will
  // throw if apiKey is empty and they are actually instantiated.
  openai: {
    apiKey:         process.env.OPENAI_API_KEY         ?? "",
    model:          process.env.OPENAI_MODEL           ?? "gpt-4o",
    fallbackModels: parseList(process.env.OPENAI_FALLBACK_MODELS, "gpt-4o-mini"),
    timeoutMs:      parseMs(process.env.OPENAI_TIMEOUT_MS, 30_000),
    maxRetries:     parseMs(process.env.OPENAI_MAX_RETRIES, 3),
  },

  claude: {
    apiKey:         process.env.ANTHROPIC_API_KEY      ?? "",
    model:          process.env.CLAUDE_MODEL           ?? "claude-opus-4-8",
    fallbackModels: parseList(process.env.CLAUDE_FALLBACK_MODELS, "claude-haiku-4-5"),
    timeoutMs:      parseMs(process.env.CLAUDE_TIMEOUT_MS, 30_000),
    maxRetries:     parseMs(process.env.CLAUDE_MAX_RETRIES, 3),
  },

  // Imagen 3 reuses the same GEMINI_API_KEY — no separate credential needed.
  imagen: {
    apiKey:         process.env.GEMINI_API_KEY         ?? "",
    model:          process.env.IMAGEN_MODEL           ?? "gemini-3.1-flash-image-preview",
    fallbackModels: parseList(process.env.IMAGEN_FALLBACK_MODELS, "gemini-3.1-flash-image"),
    timeoutMs:      parseMs(process.env.IMAGEN_TIMEOUT_MS, 60_000),
    maxRetries:     parseMs(process.env.IMAGEN_MAX_RETRIES, 2),
  },
};

/** Which provider the application uses by default. */
export const AI_DEFAULT_PROVIDER =
  process.env.AI_DEFAULT_PROVIDER ?? "gemini";

// ── Application settings ──────────────────────────────────────────────────────

export const appConfig = {
  reportLanguage:     process.env.REPORT_LANGUAGE      ?? "vi",
  brandGuidelinePath: process.env.BRAND_GUIDELINE_PATH ?? "./brand-guideline.json",
  logoPath:           process.env.LOGO_PATH            ?? "./assets/logo-primary.png",
};

// ── Backward-compatible export ────────────────────────────────────────────────
// lib/llm-client.ts and any existing code that imports `config` continues to work.

export const config = {
  llm: {
    apiKey:         aiProviderConfig.gemini.apiKey,
    model:          aiProviderConfig.gemini.model,
    fallbackModels: aiProviderConfig.gemini.fallbackModels,
  },
  reportLanguage:     appConfig.reportLanguage,
  brandGuidelinePath: appConfig.brandGuidelinePath,
  logoPath:           appConfig.logoPath,
};
