import { GoogleGenerativeAI } from "@google/generative-ai";
import { config } from "./config";
import { buildMessages, buildCompareMessages } from "./prompt-builder";

const VALID_JSON_ESCAPES = new Set(['"', "\\", "/", "b", "f", "n", "r", "t", "u"]);

function repairJsonEscapes(text: string): string {
  let result = "";
  let inString = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];

    if (!inString) {
      if (char === '"') inString = true;
      result += char;
      continue;
    }

    if (char === "\\") {
      const next = text[i + 1];
      if (next !== undefined && VALID_JSON_ESCAPES.has(next)) {
        result += char + next;
        i++;
        continue;
      }
      result += "\\\\";
      continue;
    }

    if (char === '"') {
      inString = false;
      result += char;
      continue;
    }

    if (char === "\n") { result += "\\n"; continue; }
    if (char === "\r") { result += "\\r"; continue; }
    if (char === "\t") { result += "\\t"; continue; }

    result += char;
  }

  return result;
}

function isolateJsonPayload(rawText: string): string {
  let text = rawText.trim();

  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (fenced) {
    text = fenced[1].trim();
  }

  const start = text.search(/[{[]/);
  if (start > 0) {
    text = text.slice(start);
  }

  const end = Math.max(text.lastIndexOf("}"), text.lastIndexOf("]"));
  if (end !== -1 && end < text.length - 1) {
    text = text.slice(0, end + 1);
  }

  return text;
}

export function extractJson(rawText: string): unknown {
  if (typeof rawText !== "string") {
    throw new Error("LLM response is not a string");
  }

  const cleaned = isolateJsonPayload(rawText);

  try {
    return JSON.parse(cleaned);
  } catch (firstError) {
    const repaired = repairJsonEscapes(cleaned);
    try {
      return JSON.parse(repaired);
    } catch (secondError) {
      const err = new Error(
        `${(secondError as Error).message} (repair attempt also failed; original error: ${(firstError as Error).message})`
      ) as Error & { cleanedText?: string; repairedText?: string };
      err.cleanedText = cleaned;
      err.repairedText = repaired;
      throw err;
    }
  }
}

function fallbackCategory(message: string) {
  return { score: null, conclusion: message };
}

function buildFallbackAnalysis(designName: string | undefined, message: string) {
  return {
    designName: designName || "Thiết kế chưa có tên",
    summary: message,
    categories: {
      logoCompliance: { ...fallbackCategory(message), checks: {} },
      trademarkCompliance: {
        ...fallbackCategory(message),
        detected: false,
        type: "none",
        confidence: 0,
        matchedVariant: null,
        checks: {},
      },
      colorCompliance: fallbackCategory(message),
      typographyCompliance: fallbackCategory(message),
      visualHierarchy: fallbackCategory(message),
    },
    mainIssues: [message],
    improvementSuggestions: [],
    aiRedesignPrompt: { chatgptPrompt: "", geminiPrompt: "" },
    _parseError: true,
  };
}

function buildFallbackComparison(
  myDesignName: string | undefined,
  competitorDesignName: string | undefined,
  message: string
) {
  const category = {
    myScore: null,
    competitorScore: null,
    winner: "tie",
    conclusion: message,
  };
  return {
    myDesignName: myDesignName || "Thiết kế của tôi",
    competitorDesignName: competitorDesignName || "Thiết kế đối thủ",
    categories: {
      visualImpact: { ...category },
      brandCompliance: { ...category },
      logoVisibility: { ...category },
      typography: { ...category },
      colorUsage: { ...category },
    },
    overallWinner: "tie",
    summary: message,
    mainIssues: [message],
    recommendations: [],
    _parseError: true,
  };
}

interface ParseOptions {
  kind?: "analyze" | "compare";
  designName?: string;
  myDesignName?: string;
  competitorDesignName?: string;
}

export function safeParseLlmResponse(
  rawText: string,
  options: ParseOptions = {}
): { ok: boolean; data: Record<string, unknown>; error?: Error } {
  const { kind = "analyze", designName, myDesignName, competitorDesignName } = options;

  try {
    const data = extractJson(rawText);
    return { ok: true, data: data as Record<string, unknown> };
  } catch (err) {
    console.error("Failed to parse LLM response as JSON:", (err as Error).message);
    console.error("Raw LLM response:\n", rawText);

    const message =
      "AI trả về dữ liệu không hợp lệ, không thể phân tích kết quả. Vui lòng thử lại.";
    const data =
      kind === "compare"
        ? buildFallbackComparison(myDesignName, competitorDesignName, message)
        : buildFallbackAnalysis(designName, message);

    return {
      ok: false,
      error: err as Error,
      data: data as Record<string, unknown>,
    };
  }
}

interface GeminiMessage {
  role: "system" | "user" | "assistant";
  content:
    | string
    | Array<{ type: string; text?: string; image_url?: { url: string } }>;
}

function convertMessagesForGemini(messages: GeminiMessage[]) {
  const systemMsg = messages.find((m) => m.role === "system");
  const chatMessages = messages.filter((m) => m.role !== "system");

  const contents = chatMessages.map((msg) => ({
    role: msg.role === "assistant" ? "model" : "user",
    parts: Array.isArray(msg.content)
      ? msg.content.map((part) => {
          if (part.type === "text") return { text: part.text ?? "" };
          if (part.type === "image_url") {
            const url = part.image_url!.url;
            if (url.startsWith("data:")) {
              const [meta, data] = url.split(",");
              const mimeType = meta.replace("data:", "").replace(";base64", "");
              return { inlineData: { mimeType, data } };
            }
            return { text: url };
          }
          return {
            text: typeof part === "string" ? part : JSON.stringify(part),
          };
        })
      : [{ text: msg.content as string }],
  })) as import("@google/generative-ai").Content[];

  return { systemInstruction: systemMsg?.content as string | undefined, contents };
}

async function callLlm(
  messages: GeminiMessage[],
  parseOptions: ParseOptions
): Promise<Record<string, unknown>> {
  if (!config.llm.apiKey) {
    throw new Error("GEMINI_API_KEY is not configured");
  }

  const { systemInstruction, contents } = convertMessagesForGemini(messages);

  const genAI = new GoogleGenerativeAI(config.llm.apiKey);
  const model = genAI.getGenerativeModel({
    model: config.llm.model,
    systemInstruction,
  });

  const geminiResult = await model.generateContent({
    contents,
    generationConfig: { maxOutputTokens: 8192 },
  });

  const content = geminiResult.response.text();
  if (!content) {
    throw new Error("LLM response did not contain any content");
  }

  const { data: result } = safeParseLlmResponse(content, parseOptions);
  return result;
}

interface AnalyzeParams {
  imageContent: string;
  logoReferenceContent?: string | null;
  officialLogoContents?: Array<{ file: string; content: string }>;
  trademarkReferenceContents?: Array<{ file: string; content: string }>;
  deprecatedLogoContents?: Array<{ file: string; content: string }>;
  brandGuideline?: unknown;
  designName?: string;
}

export async function analyzeDesign(
  params: AnalyzeParams
): Promise<Record<string, unknown>> {
  const messages = buildMessages({
    ...params,
    language: config.reportLanguage,
  });
  return callLlm(messages as GeminiMessage[], {
    kind: "analyze",
    designName: params.designName,
  });
}

interface CompareParams {
  myImageContent: string;
  competitorImageContent: string;
  brandGuideline?: unknown;
  myDesignName?: string;
  competitorDesignName?: string;
}

export async function compareDesigns(
  params: CompareParams
): Promise<Record<string, unknown>> {
  const messages = buildCompareMessages({
    ...params,
    language: config.reportLanguage,
  });
  return callLlm(messages as GeminiMessage[], {
    kind: "compare",
    myDesignName: params.myDesignName,
    competitorDesignName: params.competitorDesignName,
  });
}
