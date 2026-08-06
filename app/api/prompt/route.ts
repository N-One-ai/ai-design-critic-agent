/**
 * POST /api/prompt
 *
 * Lightweight AI helper for the Hero Image Prompt Studio.
 *
 * Actions:
 *   optimize  — rewrites a prompt into a clearer, more detailed AI-image-generation prompt
 *   translate — translates a prompt while preserving photography / AI-gen terminology
 *
 * Request body:
 *   action      "optimize" | "translate"
 *   prompt      string   — the prompt text
 *   targetLang  "en" | "vi"   — required for translate action
 */
import { NextRequest, NextResponse } from "next/server";
import { GeminiProvider } from "@/lib/ai/provider/gemini";
import { aiProviderConfig } from "@/lib/config";

export const runtime = "nodejs";

// ── System prompts ────────────────────────────────────────────────────────────

const SYS_OPTIMIZE = `\
You are an expert AI image-generation prompt engineer specialising in commercial advertising photography for mobile fintech brands.

Task: rewrite the provided prompt to be clearer, richer, and better suited for generating a high-quality advertising hero image.

Rules:
- Preserve the original subject, intent, and language (Vietnamese or English).
- Add specifics for: lighting, composition, camera angle, color palette, mood, and style.
- Use precise photography/cinematography vocabulary.
- Always include: no text, no typography, no logo, no watermark in the image.
- Keep output to 3–6 dense sentences or a tight bullet list.
- Return ONLY the optimised prompt — no preamble, no explanation.`;

const SYS_TRANSLATE_EN = `\
You are a professional translator specialising in AI image-generation prompts and photography terminology.
Translate the prompt below into English. Preserve all technical terms exactly.
Return ONLY the translated prompt — no explanation.`;

const SYS_TRANSLATE_VI = `\
Bạn là chuyên gia dịch thuật chuyên về prompt tạo ảnh AI và thuật ngữ nhiếp ảnh.
Dịch prompt bên dưới sang tiếng Việt. Giữ nguyên mọi thuật ngữ kỹ thuật.
Chỉ trả về bản dịch — không giải thích.`;

// ── Route handler ─────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, prompt, targetLang } = body as {
      action: string;
      prompt: string;
      targetLang?: string;
    };

    if (!action || typeof prompt !== "string" || !prompt.trim()) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    let system: string;
    if (action === "optimize") {
      system = SYS_OPTIMIZE;
    } else if (action === "translate") {
      system = targetLang === "en" ? SYS_TRANSLATE_EN : SYS_TRANSLATE_VI;
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    const provider = new GeminiProvider(aiProviderConfig.gemini);
    const res = await provider.generate({
      messages: [
        { role: "system",  content: system },
        { role: "user",    content: prompt.trim() },
      ],
      maxTokens:   1000,
      temperature: action === "translate" ? 0.1 : 0.4,
    });

    return NextResponse.json({ result: res.text.trim() });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
