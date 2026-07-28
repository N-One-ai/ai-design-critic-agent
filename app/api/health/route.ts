import { NextResponse } from "next/server";
import { aiProviderConfig, AI_DEFAULT_PROVIDER } from "@/lib/config";

export const runtime = "nodejs";

export function GET() {
  const geminiCfg = aiProviderConfig.gemini;

  return NextResponse.json({
    status: "ok",
    defaultProvider:    AI_DEFAULT_PROVIDER,
    // Boolean only — never expose any part of an API key in a response
    geminiConfigured:   !!geminiCfg.apiKey,
    openaiConfigured:   !!aiProviderConfig.openai.apiKey,
    claudeConfigured:   !!aiProviderConfig.claude.apiKey,
    model:              geminiCfg.model,
    fallbackModels:     geminiCfg.fallbackModels,
    runtime:            "nextjs",
  });
}
