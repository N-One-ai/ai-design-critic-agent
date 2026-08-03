/**
 * Prompt length validation and semantic compression.
 *
 * Image models impose a hard character limit on prompts. After the AI Prompt
 * Optimizer expands a user's input, the enriched prompt can exceed that limit.
 * This module detects the overflow and compresses the prompt via Gemini Flash
 * without truncating or losing semantic content.
 *
 * Compression is transparent to the user — the UI surface shows a notice
 * ("AI đã tự tối ưu prompt…") rather than an error.
 *
 * Flow:
 *   original prompt → compressPrompt() → { compressed, wasCompressed }
 *
 * Two-pass strategy:
 *   Pass 1 — ask the model to compress to < MAX_PROMPT_LENGTH
 *   Pass 2 — if pass 1 output is still over limit, compress again
 *   Safety  — word-boundary truncation as a last resort (should never fire)
 */

import { GoogleGenerativeAI } from "@google/generative-ai";
import { config } from "@/lib/config";

// ── Constants ─────────────────────────────────────────────────────────────────

/** Maximum characters sent to the image model (pre-enrichment). */
export const MAX_PROMPT_LENGTH = 1800;

/** Gemini Flash model used for compression — fast and cheap. */
const COMPRESSOR_MODEL = "gemini-2.0-flash";

// ── System prompt ─────────────────────────────────────────────────────────────

const COMPRESS_SYSTEM = `You are an expert image prompt editor specializing in semantic compression.
Your task: shorten the given image generation prompt to under ${MAX_PROMPT_LENGTH} characters
while preserving ALL visual intent and instructions.

MUST PRESERVE — do not remove or weaken:
• Primary subject(s), scene, and narrative
• Composition, framing, and spatial arrangement
• Camera angle and perspective
• Visual style and aesthetic direction
• Lighting type, source, and direction
• Color palette, tones, and mood
• Brand identity instructions (names, logos, trademarks)
• Logo placement and usage rules
• Aspect ratio and quality level hints

REMOVE OR SIMPLIFY — in order of priority:
1. Duplicate adjectives describing the same quality ("beautiful, gorgeous, stunning" → "stunning")
2. Repeated camera angle instructions
3. Multiple lighting descriptions saying the same thing
4. Repeated style or rendering keywords (e.g., "4K, ultra 4K, 8K resolution" → "8K")
5. Filler intensifiers ("incredibly", "amazingly", "absolutely")
6. Verbose paraphrasing of the same concept

OUTPUT RULES:
- Return ONLY the compressed prompt text. No preamble, no explanation, no quotes.
- Write in English.
- Preserve brand-specific terms exactly as written (e.g., "Zalopay", trademark names).
- Target strictly under ${MAX_PROMPT_LENGTH} characters.`;

// ── Core compressor ───────────────────────────────────────────────────────────

async function callCompressorOnce(prompt: string): Promise<string> {
  const apiKey = config.llm.apiKey;
  if (!apiKey) throw new Error("GEMINI_API_KEY is not configured for prompt compression");

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: COMPRESSOR_MODEL,
    systemInstruction: COMPRESS_SYSTEM,
  });

  const result = await model.generateContent({
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    generationConfig: { maxOutputTokens: 800 },
  });

  const text = result.response.text().trim();
  if (!text) throw new Error("Prompt compressor returned an empty response");
  return text;
}

/**
 * Compresses a prompt to fit within MAX_PROMPT_LENGTH.
 *
 * Returns the original unchanged if it is already within the limit.
 * On compression failure, falls back to a word-boundary truncation so the
 * request never hard-errors — the caller receives `wasCompressed: true`
 * either way.
 */
export async function compressPrompt(
  prompt: string,
): Promise<{ compressed: string; wasCompressed: boolean }> {
  if (prompt.length <= MAX_PROMPT_LENGTH) {
    return { compressed: prompt, wasCompressed: false };
  }

  let compressed: string;

  try {
    // Pass 1
    compressed = await callCompressorOnce(prompt);

    // Pass 2 — if the model over-ran the target on the first pass
    if (compressed.length > MAX_PROMPT_LENGTH) {
      compressed = await callCompressorOnce(compressed);
    }
  } catch {
    // Compression service unavailable — fall through to safety truncation
    compressed = prompt;
  }

  // Safety: word-boundary truncation (should never be needed after two LLM passes)
  if (compressed.length > MAX_PROMPT_LENGTH) {
    const cut = compressed.slice(0, MAX_PROMPT_LENGTH);
    const lastSpace = cut.lastIndexOf(" ");
    compressed = lastSpace > MAX_PROMPT_LENGTH / 2 ? cut.slice(0, lastSpace) : cut;
  }

  return { compressed, wasCompressed: true };
}
