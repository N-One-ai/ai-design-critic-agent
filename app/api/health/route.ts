import { NextResponse } from "next/server";
import { aiProviderConfig, AI_DEFAULT_PROVIDER } from "@/lib/config";

export const runtime = "nodejs";

export function GET() {
  const geminiCfg     = aiProviderConfig.gemini;
  const googleImageCfg = aiProviderConfig.googleImage;

  return NextResponse.json({
    status:                  "ok",
    defaultProvider:         AI_DEFAULT_PROVIDER,
    // Booleans only — API keys are never exposed in responses
    geminiConfigured:        !!geminiCfg.apiKey,
    openaiConfigured:        !!aiProviderConfig.openai.apiKey,
    claudeConfigured:        !!aiProviderConfig.claude.apiKey,
    googleImageConfigured:   !!googleImageCfg.apiKey,
    supabaseConfigured:      !!(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY),
    model:                   geminiCfg.model,
    imageModel:              googleImageCfg.model,
    fallbackModels:          geminiCfg.fallbackModels,
    runtime:                 "nextjs",
  });
}
