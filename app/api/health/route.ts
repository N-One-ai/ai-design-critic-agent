import { NextResponse } from "next/server";
import { config } from "@/lib/config";

export const runtime = "nodejs";

export function GET() {
  return NextResponse.json({
    status: "ok",
    geminiApiKey: process.env.GEMINI_API_KEY
      ? `set (${process.env.GEMINI_API_KEY.slice(0, 6)}...)`
      : "NOT SET",
    model: config.llm.model,
    runtime: "nextjs",
  });
}
