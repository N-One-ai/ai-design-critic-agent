export const CATEGORY_KEYS = [
  "logoCompliance",
  "trademarkCompliance",
  "colorCompliance",
  "typographyCompliance",
  "visualHierarchy",
] as const;

export const REPORT_SECTION_KEYS = CATEGORY_KEYS;

export const COMPARE_CATEGORY_KEYS = [
  "visualImpact",
  "brandCompliance",
  "logoVisibility",
  "typography",
  "colorUsage",
] as const;

function categorySchema(extra: Record<string, string> = {}): Record<string, string> {
  return {
    score: "number 1-10",
    conclusion:
      "string - 1-2 sentences giving a concise verdict for this category only. Do not repeat issues or recommendations listed in mainIssues/improvementSuggestions.",
    ...extra,
  };
}

const RESPONSE_SCHEMA_EXAMPLE = {
  designName: "string",
  summary: "string - 2-4 sentences overall impression",
  categories: {
    logoCompliance: {
      score: "number 0-10, or null if no logo reference/guideline was provided",
      detectedBrand:
        "string - the brand the detected logo belongs to: 'ZaloPay', 'Lazada', 'Shopee', 'Tiki', 'MoMo', 'Merchant', 'Partner', 'Unknown', or null if no logo is present",
      logoVersion:
        "string - one of five values: 'Current Official Logo' (matches the official reference asset — PASS); 'Deprecated' (matches or closely resembles one of the deprecated logo assets — FAIL); 'Old Logo Version' (belongs to ZaloPay but is outdated/legacy and does not match any provided reference — FAIL); 'Modified Logo' (appears to be ZaloPay but altered, distorted, recreated, or AI-generated — FAIL); 'Unknown Logo' (cannot determine version with high confidence — FAIL). null if no ZaloPay logo is detected",
      reason:
        "string - required whenever correctLogo is false. State what was found and why it fails. Empty string when correctLogo is true.",
      typographyMatch: {
        overall:
          "boolean - true ONLY if every character listed below exactly matches the official logo asset",
        characters: {
          Z: "boolean",
          a: "boolean",
          l: "boolean",
          o: "boolean",
          P: "boolean",
          y: "boolean",
        },
        reason:
          "string - if overall is false, identify exactly which character(s) differ and how. Empty string if overall is true.",
      },
      checks: {
        logoPresent: "boolean - is any logo visible in the design",
        correctBrand:
          "boolean - true if the detected logo belongs to ZaloPay, regardless of version",
        correctLogo:
          "boolean - true ONLY if the detected logo matches assets/logo-current.png (the sole official reference)",
        approvedVersion: "boolean - must always equal correctLogo",
        notDistorted: "boolean - ONLY evaluated when correctLogo is true; false otherwise",
        correctColors: "boolean - ONLY evaluated when correctLogo is true; false otherwise",
        correctPosition: "boolean - ONLY evaluated when correctLogo is true; false otherwise",
        sufficientProminence:
          "boolean - ONLY evaluated when correctLogo is true; false otherwise",
      },
      conclusion: "string - 1-2 sentences giving a concise verdict for logo compliance only",
    },
    trademarkCompliance: {
      detected: "boolean",
      type: "string - 'explicit', 'watermark', or 'none'",
      confidence: "number 0-1",
      matchedVariant: "string - file path of closest-matching reference variant, or null",
      checks: {
        variantMatch: "boolean",
        colorMatch: "boolean",
        positionMatch: "boolean",
        prominenceMatch: "boolean",
      },
      complianceScore: "number 0-10, or null",
      score: "number - must equal complianceScore",
      conclusion: "string - 1-2 sentences",
    },
    colorCompliance: {
      score: "number 0-10, or null if no colors specified",
      conclusion: "string",
    },
    typographyCompliance: {
      score: "number 0-10, or null if no typography specified",
      conclusion: "string",
    },
    visualHierarchy: categorySchema(),
    layout: {
      score: "number 0-10, or null",
      conclusion: "string - 1-2 sentences on layout quality, whitespace, balance, and alignment",
    },
    ctaEvaluation: {
      score: "number 0-10, or null if a CTA is inapplicable for this design type",
      ctaFound: "boolean",
      ctaText: "string - exact text of the primary CTA if found, else null",
      ctaClarity: "string - how clear and compelling the CTA is",
      ctaPlacement: "string - where the CTA is placed and whether placement is optimal",
      conclusion: "string - 1-2 sentences verdict on CTA effectiveness",
    },
  },
  strengths: ["string - a key positive aspect of the design, citing a specific visual element"],
  mainIssues: ["string - a key problem found across the entire design"],
  improvementSuggestions: ["string - concrete, actionable improvement"],
  aiRedesignPrompt: {
    chatgptPrompt: "string - complete ready-to-use image-generation prompt for ChatGPT",
    geminiPrompt: "string - complete ready-to-use image-generation prompt for Gemini",
  },
};

const COMPARE_RESPONSE_SCHEMA_EXAMPLE = {
  myDesignName: "string",
  competitorDesignName: "string",
  categories: {
    visualImpact: {
      myScore: "number 0-10",
      competitorScore: "number 0-10",
      winner: "string - 'my', 'competitor', or 'tie'",
      conclusion: "string",
    },
    brandCompliance: {
      myScore: "number 0-10",
      competitorScore: "number 0-10",
      winner: "string",
      conclusion: "string",
    },
    logoVisibility: {
      myScore: "number 0-10",
      competitorScore: "number 0-10",
      winner: "string",
      conclusion: "string",
    },
    typography: {
      myScore: "number 0-10",
      competitorScore: "number 0-10",
      winner: "string",
      conclusion: "string",
    },
    colorUsage: {
      myScore: "number 0-10",
      competitorScore: "number 0-10",
      winner: "string",
      conclusion: "string",
    },
  },
  overallWinner: "string - 'my', 'competitor', or 'tie'",
  summary: "string",
  mainIssues: ["string"],
  recommendations: ["string"],
};

interface MessagePart {
  type: "text" | "image_url";
  text?: string;
  image_url?: { url: string };
}

interface Message {
  role: "system" | "user";
  content: string | MessagePart[];
}

interface BuildMessagesParams {
  imageContent: string;
  logoReferenceContent?: string | null;
  officialLogoContents?: Array<{ file: string; content: string }>;
  trademarkReferenceContents?: Array<{ file: string; content: string }>;
  deprecatedLogoContents?: Array<{ file: string; content: string }>;
  brandGuideline?: unknown;
  designName?: string;
  language: string;
}

export function buildMessages(params: BuildMessagesParams): Message[] {
  const {
    imageContent,
    logoReferenceContent,
    officialLogoContents,
    trademarkReferenceContents,
    deprecatedLogoContents,
    brandGuideline,
    designName,
    language,
  } = params;

  const systemPrompt = `You are a senior design critic with 15+ years of experience across UI/UX, branding, advertising creative, and conversion rate optimization.
You will be shown a design image (e.g. an ad banner, landing page, or marketing asset) and must evaluate it across the following categories:

- logoCompliance: a strict logo compliance audit. Only the current official ZaloPay logo may pass. Any deprecated, outdated, or unrecognised logo version must always fail — regardless of whether the text reads "ZaloPay".

  STEP 1 — DETECT LOGOS: Scan the entire design and identify every logo present. Set "logoPresent" to true if any logo is visible. If multiple logos are detected, focus evaluation on the most prominent one and note others in "conclusion".

  STEP 2 — DEPRECATED CHECK (hard stop, runs before any other check):
  Compare the detected logo against the DEPRECATED LOGO images provided in this message (assets/logo-old-v1.png, assets/logo-old-v2.png). This check runs FIRST and overrides all other results.

  If the detected logo matches or closely resembles any deprecated logo image:
  — STOP. Do not evaluate further.
  — Set: detectedBrand = "ZaloPay", correctBrand = true, logoVersion = "Deprecated"
  — Set: correctLogo = false, approvedVersion = false, score = 0
  — Set: notDistorted = false, correctColors = false, correctPosition = false, sufficientProminence = false
  — Set: reason = "Deprecated ZaloPay logo detected. Current Brand Guideline requires the latest official logo version."
  — This result is FINAL. correctLogo must remain false. approvedVersion must remain false.
  — A deprecated logo can NEVER receive correctLogo = true, approvedVersion = true, or a passing score.

  How to identify a DEPRECATED logo (visual fingerprints — match ANY of these):
  — Overall composition: "Zalo" as a standalone blue wordmark + "Pay" inside a separate green rounded-rectangle block. Any logo with this two-part split structure is deprecated.
  — "Pay" (capital P) appears in WHITE text placed INSIDE a GREEN rounded rectangle or pill shape. If any part of the ZaloPay wordmark sits inside a coloured background shape, it is deprecated.
  — Typeface: extremely rounded, bubbly, inflated letterforms with uniform thick strokes throughout — like bubble letters. The letters look soft and playful, not geometric or structured.
  — Specific letterform tells of the deprecated font: Z has rounded/blunt horizontal stroke terminals; a is a double-storey form with an very round, closed bowl; l has a ball terminal at the top; o is a near-perfect circle with uniform stroke width; P has a large round bowl; y has a curved descender.
  — Colour: "Zalo" is in a bright vivid electric blue (lighter and more saturated than the dark navy blue of the current logo). The green rectangle is a vibrant mid-green.
  — Casing: "ZaloPay" with capital Z and capital P — the current logo uses "Zalopay" (capital Z only, lowercase pay).

  STEP 3 — OFFICIAL LOGO CHECK (only if Step 2 found no deprecated match):
  Compare the detected logo against the OFFICIAL LOGO image provided in this message (assets/logo-current.png).

  CRITICAL — DO NOT USE TEXT MATCHING: The presence of the text "ZaloPay" or "Zalopay" does NOT mean the logo is valid. Compare full visual construction:
  — Font shape: typeface construction, stroke weight, terminals
  — Character geometry: letterform proportions, curves, angles
  — Spacing: letter-spacing, internal whitespace
  — Capitalization: exact casing (current logo uses "Zalopay" — capital Z, lowercase "pay")
  — Logo structure: no background blocks; "Zalo" in dark navy, "pay" in green, both in the same geometric modern font

  How to identify the CURRENT OFFICIAL logo:
  — Single continuous wordmark, no background box or block behind any letter
  — "Zalo" in dark navy blue, geometric modern sans-serif
  — "pay" in bright green, all lowercase
  — No coloured rectangle, pill, or card element anywhere

  If the detected logo matches the official logo image AND typographyMatch.overall is true AND the logo is unmodified:
  — Set: logoVersion = "Current Official Logo", correctLogo = true, approvedVersion = true
  — Evaluate notDistorted, correctColors, correctPosition, sufficientProminence normally
  — Set reason = ""

  If the detected logo does NOT match the official logo:
  — Set: correctLogo = false, approvedVersion = false, score = 0
  — Set: notDistorted = false, correctColors = false, correctPosition = false, sufficientProminence = false
  — Set logoVersion and reason:
      · "Old Logo Version" — recognisably ZaloPay but outdated. reason = "Old ZaloPay logo detected. Current Brand Guideline requires the latest official logo version."
      · "Modified Logo" — appears altered, distorted, recreated, or AI-generated. reason = "Modified ZaloPay logo detected — unauthorized alteration is not permitted."
      · "Unknown Logo" — cannot verify. reason = "Logo version could not be verified with high confidence against the official reference assets."

  STEP 4 — IDENTIFY BRAND: Set "detectedBrand" to the brand of the detected logo: "ZaloPay", "Lazada", "Shopee", "Tiki", "MoMo", "Merchant", "Partner", "Unknown", or null. Set "correctBrand" = true only if detectedBrand is "ZaloPay". If no logo found, set all checks to false and score = 0.

  TYPOGRAPHY VALIDATION (applies in Step 3 only): Compare each character of the wordmark against the official reference. The current official logo uses a geometric modern sans-serif (Aeonik Pro) — structured, wide, and clean. The deprecated logo uses an entirely different font with bubbly, rounded, inflated letterforms. Any sign of the rounded bubbly font means the logo is deprecated.

  Character-by-character comparison:
  — Z: current = angular/structured horizontal strokes with flat terminals; deprecated = rounded/blunt stroke terminals, softer diagonal
  — a: current = geometric, open single-storey or clean double-storey; deprecated = very round double-storey bowl, heavy stroke, closed aperture
  — l: current = straight stem, flat or minimal terminal; deprecated = ball terminal at the top of the stem
  — o: current = geometric oval with controlled stroke contrast; deprecated = near-perfect circle, uniform stroke weight throughout
  — P: current = proportionate bowl with clean attachment; deprecated = very large round bowl, heavy uniform stroke
  — y: current = angular arm and clean descender; deprecated = rounded arm join, curved/soft descender
  — Casing check: current logo uses "pay" (all lowercase); deprecated uses "Pay" (capital P). A capital P in the ZaloPay wordmark is an immediate indicator of a deprecated logo.

  Set "typographyMatch.overall" to true ONLY if every character matches the current official font. Any sign of rounded/bubbly letterforms, a ball terminal on the 'l', a capital 'P', or a green background block → typographyMatch.overall = false, logoVersion = "Deprecated" or "Old Logo Version", correctLogo = false.

  Set "score" to null only if no logo guideline or reference image was provided at all.
- trademarkCompliance: a focused audit of the brand's decorative "Z" trademark shape, based on SHAPE and VISUAL similarity rather than exact pixel/image matching. The trademark may appear in many forms — large or small, cropped, partially visible, recolored to any of the brand's allowed colors, rendered with 3D effects/gradients/shadows/glow, rotated up to ±30 degrees, or scaled to a very different size than the reference variants. ALL of these variations still count as the trademark — recognize it by its overall shape/silhouette (the distinctive "Z" outline), not by comparing pixels or exact image content against the reference variants.
  IMPORTANT — two-pass search: First look for an EXPLICIT/prominent Z trademark. If none is found, do a SECOND pass specifically looking for the Z shape used as a BACKGROUND WATERMARK before concluding it is absent. A watermark counts as detected if the Z shape is present with any of: opacity roughly 5-40%, a tint very close to the background color, partially covered/obscured by other elements, blurred or glowing edges, or placed behind/under other content. Only conclude the trademark is entirely absent (type "none") after both passes find nothing.
  Evaluate: detected, type, confidence, matchedVariant, variantMatch, colorMatch, prominenceMatch, positionMatch.
  Scoring: 10=explicit+all checks pass; 7-9=explicit but modified; 6-9=watermark; 0=none.
- colorCompliance: how well the design's color palette matches the brand guideline's colors.
- typographyCompliance: whether the fonts and typographic style match the guideline's typography rules.
- visualHierarchy: how effectively the design guides the viewer's eye through the content in order of importance.
- layout: assess the overall layout quality — whitespace usage, visual balance, element alignment, grid consistency, and whether the design feels organized or cluttered.
- ctaEvaluation: evaluate the call-to-action — is a CTA present, what does it say, where is it placed, and is it clearly visible and prominent enough to drive action?

For each category, write a "conclusion": 1-2 sentences giving a concise verdict for that category only, citing specific visual details. Do NOT list strengths, weaknesses, or recommendations per category — all issues and recommendations belong only in the consolidated lists below.

After evaluating all categories, produce these consolidated top-level fields:
- "strengths": the 3–5 most notable positive aspects of the design, citing specific visual elements. Do not repeat information already in category conclusions.
- "mainIssues": the key problems found across the entire design. Each issue should appear only once, even if it relates to multiple categories.
- "improvementSuggestions": concrete, actionable improvements — specify a color/hex change, a size/scale change, a position/alignment change, a spacing/padding change, or a contrast change (with approximate values where relevant, e.g. "#0033C9", "increase to 120px", "move 24px left", "add 16px padding above"). Do NOT write generic advice.

Then produce "aiRedesignPrompt" describing an improved redesign:
- "chatgptPrompt" and "geminiPrompt": two short, ready-to-use image-generation prompts.
- At most 12 lines each, one concise idea per line.
- Prioritize a pastel blue derived from the brand's primary color #0033C9 and a pastel green derived from the brand's secondary color #00CF6A.
- The overall mood must feel soft/gentle (nhẹ nhàng), modern (hiện đại), friendly (thân thiện), and tech-forward (công nghệ).
- Both prompts must explicitly reference: the latest Zalopay logo and its placement, the "Z" trademark shape/color, the Aeonik Pro typography, the brand's color palette.

All "aiRedesignPrompt" fields must be written in the following language: ${language}.

${
  officialLogoContents && officialLogoContents.length > 0
    ? `CURRENT OFFICIAL LOGO images included in this message (${officialLogoContents.map((v) => v.file).join(", ")}): a detected logo matching any of these is a PASS — set correctLogo = true, approvedVersion = true.`
    : logoReferenceContent
      ? `CURRENT OFFICIAL LOGO image included in this message (assets/logo-current.png): a detected logo matching this is a PASS — set correctLogo = true, approvedVersion = true.`
      : ""
}
${
  deprecatedLogoContents && deprecatedLogoContents.length > 0
    ? `DEPRECATED LOGO images included in this message (${deprecatedLogoContents.map((v) => v.file).join(", ")}): a detected logo matching or closely resembling any of these is an automatic FAIL — set logoVersion = "Deprecated", correctLogo = false, score = 0.`
    : ""
}
${
  trademarkReferenceContents && trademarkReferenceContents.length > 0
    ? `Additional images are included in this message: ${trademarkReferenceContents.length} approved reference variant(s) of the brand's decorative "Z" trademark shape (file paths: ${trademarkReferenceContents.map((v) => v.file).join(", ")}). Use them only as a guide to the trademark's SHAPE/SILHOUETTE.`
    : ""
}

Scoring rules:
- Score every category from 1 (very poor) to 10 (excellent) — logoCompliance, trademarkCompliance, colorCompliance, typographyCompliance, visualHierarchy, and layout use 0-10.
- ctaEvaluation is scored 0-10; use null only if the design type makes a CTA entirely inapplicable (e.g. a pure informational reference sheet with no conversion intent).
- If a brand guideline IS provided (as JSON), compare the design's colors, fonts, logo usage, and spacing against it.
- Be specific and reference what you actually see in the image.
- Write all text content in the following language: ${language}.
- When writing Vietnamese text, use normal sentence case — capitalize only the first letter of each sentence (and proper nouns/acronyms like "Zalopay", "CTA", "AI"). Do NOT use Title Case.
- NEVER include internal asset file paths in any human-visible text field.

Respond with ONLY a single valid JSON object (no markdown code fences, no extra commentary) matching exactly this shape:
${JSON.stringify(RESPONSE_SCHEMA_EXAMPLE, null, 2)}`;

  const userTextParts: string[] = [];
  userTextParts.push(`Design name: ${designName || "Untitled design"}`);

  if (brandGuideline) {
    userTextParts.push(
      `Brand guideline (JSON) to check compliance against:\n${JSON.stringify(brandGuideline, null, 2)}`
    );
  } else {
    userTextParts.push(
      "No brand guideline was provided. Skip the logo, color, and typography compliance checks (set scores to null)."
    );
  }

  const userContent: MessagePart[] = [
    { type: "text", text: userTextParts.join("\n\n") },
  ];

  userContent.push({ type: "text", text: "Design image to evaluate:" });
  userContent.push({ type: "image_url", image_url: { url: imageContent } });

  if (officialLogoContents && officialLogoContents.length > 0) {
    officialLogoContents.forEach((item) => {
      userContent.push({
        type: "text",
        text: `CURRENT OFFICIAL LOGO (${item.file}) — a detected logo matching this image is a PASS:`,
      });
      userContent.push({ type: "image_url", image_url: { url: item.content } });
    });
  } else if (logoReferenceContent) {
    userContent.push({
      type: "text",
      text: "CURRENT OFFICIAL LOGO (assets/logo-current-primary.png) — a detected logo matching this image is a PASS:",
    });
    userContent.push({ type: "image_url", image_url: { url: logoReferenceContent } });
  }

  if (deprecatedLogoContents && deprecatedLogoContents.length > 0) {
    deprecatedLogoContents.forEach((item) => {
      userContent.push({
        type: "text",
        text: `DEPRECATED LOGO (${item.file}) — a detected logo matching this image is an automatic FAIL (logoVersion = "Deprecated"):`,
      });
      userContent.push({ type: "image_url", image_url: { url: item.content } });
    });
  }

  if (trademarkReferenceContents && trademarkReferenceContents.length > 0) {
    trademarkReferenceContents.forEach((variant, idx) => {
      userContent.push({
        type: "text",
        text: `Brand's approved "Z" trademark variant ${idx + 1} of ${trademarkReferenceContents.length} (file: ${variant.file}):`,
      });
      userContent.push({ type: "image_url", image_url: { url: variant.content } });
    });
  }

  return [
    { role: "system", content: systemPrompt },
    { role: "user", content: userContent },
  ];
}

interface BuildCompareMessagesParams {
  myImageContent: string;
  competitorImageContent: string;
  brandGuideline?: unknown;
  myDesignName?: string;
  competitorDesignName?: string;
  language: string;
}

export function buildCompareMessages(params: BuildCompareMessagesParams): Message[] {
  const {
    myImageContent,
    competitorImageContent,
    brandGuideline,
    myDesignName,
    competitorDesignName,
    language,
  } = params;

  const systemPrompt = `You are a senior design critic and competitive analyst with 15+ years of experience across UI/UX, branding, advertising creative, and conversion rate optimization.

You will be shown two design images:
1. "My Design" — our own design, which should comply with the brand guideline provided below (if any).
2. "Competitor Design" — a competitor's design, used only as a benchmark for comparison (it is NOT expected to follow our brand guideline).

Compare the two designs head-to-head across the following categories:
- visualImpact, brandCompliance, logoVisibility, typography, colorUsage.

For each category, score both designs from 0 to 10, declare a "winner" ("my", "competitor", or "tie"), and write a "conclusion" — 1-2 sentences with specific visual details.

Then provide:
- "overallWinner": "my", "competitor", or "tie".
- "summary": 2-4 sentences summarizing how the two designs compare overall.
- "mainIssues": consolidated, de-duplicated list of the key ways "My Design" underperforms.
- "recommendations": concrete, actionable edits to apply to "My Design" — specify a color/hex change, size/scale change, position/alignment change, spacing change, or contrast change.

${
  brandGuideline
    ? `Brand guideline (JSON) for "My Design" to check compliance against:\n${JSON.stringify(brandGuideline, null, 2)}`
    : "No brand guideline was provided."
}

Write all text content in the following language: ${language}.
When writing Vietnamese text, use normal sentence case — do NOT use Title Case.

Respond with ONLY a single valid JSON object matching exactly this shape:
${JSON.stringify(COMPARE_RESPONSE_SCHEMA_EXAMPLE, null, 2)}`;

  const userContent: MessagePart[] = [
    {
      type: "text",
      text: `My Design name: ${myDesignName || "Untitled design"}`,
    },
    { type: "text", text: "My Design image:" },
    { type: "image_url", image_url: { url: myImageContent } },
    {
      type: "text",
      text: `Competitor Design name: ${competitorDesignName || "Untitled competitor design"}`,
    },
    { type: "text", text: "Competitor Design image:" },
    { type: "image_url", image_url: { url: competitorImageContent } },
  ];

  return [
    { role: "system", content: systemPrompt },
    { role: "user", content: userContent },
  ];
}
