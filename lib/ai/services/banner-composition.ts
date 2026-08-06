/**
 * Banner Composition System — subject detection, camera framing, prompt blocks.
 *
 * Single source of truth for how hero images must be composed for ZaloPay
 * banner templates. Both the LLM prompt builder (banner-prompt.ts) and the
 * image generation route (generate-banner/route.ts) import from here so the
 * composition rules are defined once and enforced at two layers:
 *
 *   Layer 1 — LLM (Gemini): buildCompositionBlock() instructs the scene writer
 *             to produce a full-bleed, lower-third composition.
 *   Layer 2 — Image model (Higgsfield): COMPOSITION_PREFIX + the same block are
 *             prepended to the final prompt as hard constraints before generation.
 *
 * Design principle: the AI image must fill the entire canvas with a natural
 * scene. The subject is positioned in the lower 55–65% of the frame. The upper
 * portion is filled with natural background continuation — never a blank
 * rectangle or intentionally empty sky.
 */

// ── Safe area constants ───────────────────────────────────────────────────────

/**
 * Fraction of canvas height reserved for branding, logo, and typography.
 * Nothing important (face, product, action) may appear above this line.
 * Used by: prompt builder, composition validator, visual guide overlay.
 */
export const SAFE_AREA_TOP_RATIO  = 0.35;   // Top 35%  — Brand / Typography Zone
export const HERO_AREA_TOP_RATIO  = 0.35;   // Hero starts here (same value, semantic alias)

// ── Subject categories ────────────────────────────────────────────────────────

export type SubjectCategory =
  | "person"
  | "product"
  | "food"
  | "fashion"
  | "technology"
  | "scene"
  | "generic";

// ── Camera framings ───────────────────────────────────────────────────────────

export type CameraFraming =
  | "medium-shot"
  | "medium-full-shot"
  | "close-up"
  | "three-quarter-shot"
  | "hero-product-shot"
  | "wide-establishing-shot";

const FRAMING_DESCRIPTIONS: Readonly<Record<CameraFraming, string>> = {
  "medium-shot":
    "Medium Shot — waist-up, subject anchored in lower portion, natural environment fills above",
  "medium-full-shot":
    "Medium Full Shot — full body from knees up, subject in lower frame, scene continues naturally above",
  "close-up":
    "Close-Up — subject fills lower 55–65%, fine detail, dramatic proximity, environment and depth above",
  "three-quarter-shot":
    "Three-Quarter Shot — head to below knees, fashion-editorial lower-frame placement, natural space above",
  "hero-product-shot":
    "Hero Product Shot — product in lower 55%, 45° hero angle, dramatic shadow, environment extends above",
  "wide-establishing-shot":
    "Wide Establishing Shot — environment-first, subject anchored at bottom third, full scene fills frame",
};

// ── Canvas specifications ─────────────────────────────────────────────────────

export interface CanvasSpec {
  /** Display label, e.g. "1200×1200" */
  label:        string;
  /**
   * Fraction of canvas height the brand overlay covers (logo + taglines).
   * Kept for canvas renderer reference — NOT used in AI composition prompts.
   * The AI must fill the full canvas; the overlay is composited client-side.
   */
  safeAreaTop:  number;
  /** Aspect ratio string passed to the image model, e.g. "1:1" */
  aspectRatio:  string;
}

/** All officially supported ZaloPay banner canvas sizes. */
export const BANNER_CANVAS_SPECS: Readonly<Record<string, CanvasSpec>> = {
  "1200x1200": { label: "1200×1200 (Square)",        safeAreaTop: 0.40, aspectRatio: "1:1"  },
  "1200x628":  { label: "1200×628 (Landscape)",       safeAreaTop: 0.35, aspectRatio: "16:9" },
  "1080x1920": { label: "1080×1920 (Story/Reel)",     safeAreaTop: 0.38, aspectRatio: "9:16" },
  "720x360":   { label: "720×360 (Banner strip)",     safeAreaTop: 0.32, aspectRatio: "16:9" },
  "1440x360":  { label: "1440×360 (Leaderboard)",     safeAreaTop: 0.28, aspectRatio: "16:9" },
  "1080x360":  { label: "1080×360 (Banner strip HD)", safeAreaTop: 0.30, aspectRatio: "16:9" },
};

export const DEFAULT_CANVAS_KEY = "1200x1200";

/** Resolve a CanvasSpec from a "WxH" key, width+height numbers, or fall back to default. */
export function resolveCanvasSpec(widthOrKey: string | number, height?: number): CanvasSpec {
  if (typeof widthOrKey === "string" && height === undefined) {
    return BANNER_CANVAS_SPECS[widthOrKey] ?? BANNER_CANVAS_SPECS[DEFAULT_CANVAS_KEY];
  }
  const key = `${widthOrKey}x${height}`;
  return BANNER_CANVAS_SPECS[key] ?? BANNER_CANVAS_SPECS[DEFAULT_CANVAS_KEY];
}

// ── Subject detection ─────────────────────────────────────────────────────────

const SUBJECT_KEYWORDS: Readonly<Record<SubjectCategory, readonly string[]>> = {
  person: [
    "người", "phụ nữ", "đàn ông", "nam", "nữ", "bạn trẻ", "khách hàng", "cô gái", "chàng trai",
    "woman", "man", "person", "people", "girl", "boy", "professional", "model",
    "customer", "human", "face", "portrait", "student", "worker", "couple",
  ],
  food: [
    "thức ăn", "món ăn", "đồ uống", "cà phê", "trà", "bánh", "ẩm thực", "nhà hàng",
    "food", "drink", "beverage", "coffee", "tea", "cake", "meal", "dish",
    "restaurant", "cuisine", "snack", "fruit", "boba", "bubble tea", "smoothie",
  ],
  fashion: [
    "thời trang", "quần áo", "giày", "phụ kiện", "túi xách", "đồng hồ", "trang phục",
    "fashion", "clothing", "outfit", "wear", "dress", "shoes", "bag",
    "accessory", "watch", "jewellery", "style", "luxury", "apparel",
  ],
  technology: [
    "điện thoại", "smartphone", "laptop", "máy tính", "thiết bị", "ứng dụng", "app",
    "phone", "tablet", "computer", "device", "tech", "gadget", "software",
    "digital", "electronic", "zalopay", "mobile", "fintech", "banking", "qr",
  ],
  product: [
    "sản phẩm", "hàng hóa", "chai", "hộp", "gói", "thẻ", "bao bì",
    "product", "bottle", "box", "package", "card", "item", "object",
    "merchandise", "goods", "container", "packaging",
  ],
  scene: [
    "phong cảnh", "không gian", "nền", "cảnh quan", "thành phố", "đường phố",
    "landscape", "scene", "background", "environment", "city", "street",
    "outdoor", "indoor", "interior", "architecture", "nature", "abstract",
  ],
  generic: [],
};

/**
 * Classify the subject description into a category by keyword frequency.
 * Returns "generic" when no keywords match.
 */
export function detectSubjectCategory(text: string): SubjectCategory {
  const lower = text.toLowerCase();
  let bestCat: SubjectCategory = "generic";
  let bestScore = 0;

  for (const [cat, keywords] of Object.entries(SUBJECT_KEYWORDS)) {
    if (cat === "generic") continue;
    const score = (keywords as readonly string[]).filter((kw) => lower.includes(kw)).length;
    if (score > bestScore) {
      bestScore = score;
      bestCat   = cat as SubjectCategory;
    }
  }

  return bestCat;
}

// ── Camera framing resolution ─────────────────────────────────────────────────

const CATEGORY_TO_FRAMING: Readonly<Record<SubjectCategory, CameraFraming>> = {
  person:     "medium-full-shot",
  product:    "hero-product-shot",
  food:       "close-up",
  fashion:    "three-quarter-shot",
  technology: "hero-product-shot",
  scene:      "wide-establishing-shot",
  generic:    "medium-shot",
};

export function resolveCameraFraming(category: SubjectCategory): CameraFraming {
  return CATEGORY_TO_FRAMING[category];
}

// ── Mandatory generation prefix ───────────────────────────────────────────────

/**
 * Prepended verbatim before every prompt sent to the image model.
 * Sets global composition quality and safe-area constraints — no subject injection.
 *
 * SAFE AREA CONTRACT (35 / 65 split):
 *   TOP 35%  = Brand / Typography Zone — reserved for logo and tagline overlay.
 *              The AI must fill this region with natural background continuation
 *              (sky, bokeh, environment depth) — NEVER blank, NEVER important content.
 *   BOTTOM 65% = Hero Area — ALL important content lives here: face, head,
 *              hands, product, action, body.
 */
export const COMPOSITION_PREFIX =
  "Full-bleed commercial advertising photography. " +
  "CRITICAL SAFE-AREA RULE: The canvas is divided into two zones. " +
  "The TOP 35% (Brand Zone) must contain ONLY natural background continuation — " +
  "sky, atmosphere, bokeh, or environment depth. " +
  "ALL important content (face, head, eyes, hands, product, body, action) " +
  "MUST be positioned ENTIRELY within the BOTTOM 65% (Hero Area). " +
  "The subject's face begins at or below 40% from the top. " +
  "No face, no eyes, no hands, no product may appear in the top 35%. " +
  "The top area fills naturally from the scene — it is NOT blank. " +
  "Professionally composed. Cinematic depth of field. " +
  "No text. No logos. No typography.";

// ── Composition block builder ─────────────────────────────────────────────────

export interface CompositionBlockOptions {
  category:    SubjectCategory;
  framing:     CameraFraming;
  canvasSpec?: CanvasSpec;
}

/**
 * Builds a structured composition block suitable for injection into:
 *   - LLM prompts (Gemini) — instructs the scene writer
 *   - Image model prompts (Higgsfield) — hard composition constraints
 *
 * The AI image must fill the entire canvas. The subject lives in the lower
 * 55–65% of the frame. The upper portion is filled with natural background
 * continuation — never a blank rectangle or artificial clean zone.
 */
export function buildCompositionBlock({
  category,
  framing,
  canvasSpec = BANNER_CANVAS_SPECS[DEFAULT_CANVAS_KEY],
}: CompositionBlockOptions): string {
  return [
    `COMPOSITION [${canvasSpec.label} ${canvasSpec.aspectRatio}]:`,
    `  FRAMING:    ${FRAMING_DESCRIPTIONS[framing]}`,
    "  SAFE AREA:  Canvas split into two strict zones:",
    "              ┌─────────────────────────────────────────────┐",
    "              │  TOP 35%   — BRAND / TYPOGRAPHY ZONE        │",
    "              │  Fill with natural background only.          │",
    "              │  NO face, NO head, NO hands, NO product.     │",
    "              ├─────────────────────────────────────────────┤",
    "              │  BOTTOM 65% — HERO AREA                      │",
    "              │  ALL important content HERE: face, body,     │",
    "              │  product, action, hands, eyes.               │",
    "              └─────────────────────────────────────────────┘",
    "  POSITION:   Subject face/head begins at or BELOW 40% from top.",
    "              Subject lower-center or slightly off-center — natural.",
    "              Never crop the subject's head, face, or product edges.",
    "  BACKGROUND: Upper Brand Zone fills naturally from the scene —",
    "              sky, bokeh, atmosphere, or environment depth.",
    "              It is NOT blank, NOT artificial, NOT a clean rectangle.",
    "  DEPTH:      Shallow depth-of-field on subject; natural recession above.",
    `  CATEGORY:   ${category}`,
  ].join("\n");
}

// ── Negative constraints ──────────────────────────────────────────────────────

/**
 * Full negative prompt for providers that accept a separate negative parameter.
 * Per spec: focus on preventing blank areas, wrong subject position, and
 * common AI image defects. Does NOT ban upper-half content — that would
 * recreate the artificial clean-zone behavior.
 */
export const COMPOSITION_NEGATIVE =
  "text in image, watermark, logo, typography, words, letters, numbers, " +
  "UI overlay, HUD, banner layout, " +
  "extra fingers, deformed hands, duplicate limbs, blurry face, cropped head, " +
  "cropped body at knees, product cropped at edges, deformed anatomy, " +
  "face in upper half, face near top of frame, head above center, " +
  "subject in upper 35% of canvas, important content in top third, " +
  "centered subject, subject in exact vertical center, " +
  "artificial empty top area, blank white rectangle at top, " +
  "oversaturated, grainy, low quality, amateurish, stock photo look";

/**
 * Compact avoid clause for inline injection when a separate negative param is
 * unavailable (e.g. Higgsfield CLI which has no --negative_prompt flag).
 */
export const COMPOSITION_AVOID_INLINE =
  "no text, no logos, no watermarks, " +
  "do not place face or head in the top 35%, " +
  "do not place any important subject (face, hands, product) above 40% from top, " +
  "do not create empty sky or blank gradients at top, " +
  "do not reserve a clean rectangle at top, " +
  "do not center the subject vertically, " +
  "do not crop the face or head, " +
  "do not place important objects near the top edge";
