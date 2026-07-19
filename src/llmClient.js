import Anthropic from "@anthropic-ai/sdk";
import { config } from "./config.js";
import { buildMessages, buildCompareMessages } from "./promptBuilder.js";

const VALID_JSON_ESCAPES = new Set(["\"", "\\", "/", "b", "f", "n", "r", "t", "u"]);

// Repairs raw newline/tab/CR characters and invalid backslash escapes inside
// JSON string literals (common artifacts in LLM-generated JSON).
function repairJsonEscapes(text) {
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
      // Invalid escape sequence (e.g. "\d", "\#") -- escape the backslash
      // itself so the next character is treated as a literal.
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

// Strips markdown code fences and any leading/trailing commentary so only
// the JSON object/array remains.
function isolateJsonPayload(rawText) {
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

/**
 * Extracts and parses a JSON object/array from raw LLM text output.
 * Handles markdown code fences, surrounding commentary, raw newlines inside
 * strings, and invalid backslash escape sequences.
 *
 * Throws an error (with `cleanedText`/`repairedText` attached for logging)
 * if the content cannot be parsed even after repair.
 */
export function extractJson(rawText) {
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
        `${secondError.message} (repair attempt also failed; original error: ${firstError.message})`
      );
      err.cleanedText = cleaned;
      err.repairedText = repaired;
      throw err;
    }
  }
}

function fallbackCategory(message) {
  return { score: null, conclusion: message };
}

function buildFallbackAnalysis(designName, message) {
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

function buildFallbackComparison(myDesignName, competitorDesignName, message) {
  const category = { myScore: null, competitorScore: null, winner: "tie", conclusion: message };
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

/**
 * Safely parses a raw LLM response into the expected analysis/comparison
 * object. Never throws -- on failure it logs the raw response and returns a
 * fallback object matching the expected schema so callers/UI don't crash.
 *
 * @param {string} rawText - raw LLM message content
 * @param {object} [options]
 * @param {"analyze"|"compare"} [options.kind] - fallback shape to use on failure
 * @param {string} [options.designName]
 * @param {string} [options.myDesignName]
 * @param {string} [options.competitorDesignName]
 * @returns {{ ok: boolean, data: object, error?: Error }}
 */
export function safeParseLlmResponse(rawText, options = {}) {
  const { kind = "analyze", designName, myDesignName, competitorDesignName } = options;

  try {
    const data = extractJson(rawText);
    return { ok: true, data };
  } catch (err) {
    console.error("Failed to parse LLM response as JSON:", err.message);
    console.error("Raw LLM response:\n", rawText);
    if (err.cleanedText) console.error("Cleaned candidate:\n", err.cleanedText);
    if (err.repairedText) console.error("Repaired candidate:\n", err.repairedText);

    const message = "AI trả về dữ liệu không hợp lệ, không thể phân tích kết quả. Vui lòng thử lại.";
    const data = kind === "compare"
      ? buildFallbackComparison(myDesignName, competitorDesignName, message)
      : buildFallbackAnalysis(designName, message);

    return { ok: false, error: err, data };
  }
}

function convertContentForAnthropic(content) {
  if (typeof content === "string") return content;
  if (!Array.isArray(content)) return content;
  return content.map((part) => {
    if (part.type === "image_url") {
      const url = part.image_url.url;
      if (url.startsWith("data:")) {
        const [meta, data] = url.split(",");
        const mediaType = meta.replace("data:", "").replace(";base64", "");
        return { type: "image", source: { type: "base64", media_type: mediaType, data } };
      }
      return { type: "image", source: { type: "url", url } };
    }
    return part;
  });
}

async function callLlm(messages, parseOptions) {
  if (!config.llm.apiKey) {
    throw new Error("ANTHROPIC_API_KEY is not configured");
  }

  const anthropic = new Anthropic({ apiKey: config.llm.apiKey });

  const systemMessage = messages.find((m) => m.role === "system");
  const userMessages = messages
    .filter((m) => m.role !== "system")
    .map((m) => ({ role: m.role, content: convertContentForAnthropic(m.content) }));

  const stream = anthropic.messages.stream({
    model: config.llm.model,
    max_tokens: 8192,
    system: systemMessage?.content,
    messages: userMessages,
  });

  const response = await stream.finalMessage();
  const content = response.content?.[0]?.text;
  if (!content) {
    throw new Error("LLM response did not contain any content");
  }

  const { data: result } = safeParseLlmResponse(content, parseOptions);
  return result;
}

export async function analyzeDesign({ imageContent, logoReferenceContent, officialLogoContents, trademarkReferenceContents, deprecatedLogoContents, brandGuideline, designName }) {
  const messages = buildMessages({
    imageContent,
    logoReferenceContent,
    officialLogoContents,
    trademarkReferenceContents,
    deprecatedLogoContents,
    brandGuideline,
    designName,
    language: config.reportLanguage,
  });

  return callLlm(messages, { kind: "analyze", designName });
}

export async function compareDesigns({ myImageContent, competitorImageContent, brandGuideline, myDesignName, competitorDesignName }) {
  const messages = buildCompareMessages({
    myImageContent,
    competitorImageContent,
    brandGuideline,
    myDesignName,
    competitorDesignName,
    language: config.reportLanguage,
  });

  return callLlm(messages, { kind: "compare", myDesignName, competitorDesignName });
}
