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
 * Sets the global composition intent before any scene-specific instructions.
 */
export const COMPOSITION_PREFIX =
  "Create a premium commercial advertising hero image. " +
  "Use a full-bleed composition — the background must naturally fill the entire canvas. " +
  "Position the main subject in the lower third of the frame. " +
  "Maintain generous natural negative space above the subject using depth, " +
  "architecture, bokeh, or environment — not blank space. " +
  "Do not intentionally leave an empty top area. " +
  "The scene should feel professionally photographed. " +
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
    `BANNER COMPOSITION [${canvasSpec.label}]:`,
    `  CANVAS:     Full-bleed ${canvasSpec.aspectRatio}. Background fills the entire frame.`,
    "              No artificial empty zones. No reserved rectangles at top.",
    "  SUBJECT:    Position the primary subject in the lower 55–65% of the canvas.",
    "              Head should appear around 40–50% from the top of the image.",
    "              Body occupies the lower portion. Never crop heads or product edges.",
    `              ${FRAMING_DESCRIPTIONS[framing]}`,
    "              Subject lower-center (or slightly left/right if natural to scene).",
    "  BACKGROUND: The upper portion must contain natural background continuation.",
    "              Examples: café interior, stadium, office, city skyline, park,",
    "              restaurant, gradient wall, soft bokeh, trees, architecture.",
    "              The background is part of the same scene — never a blank patch.",
    "  DEPTH:      Natural depth separates subject from background.",
    "              Shallow depth-of-field on subject; background continues naturally above.",
    "  INTENT:     Premium commercial photography. Cinematic. Full-bleed. Deliberately composed.",
    `  SUBJECT CATEGORY: ${category} — ${FRAMING_DESCRIPTIONS[framing]}`,
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
  "empty sky, blank gradients at top, reserved clean rectangle, artificial empty zone, " +
  "blank upper half, plain white top area, grey empty background, " +
  "centered subject, subject in exact center of frame, " +
  "face cropped, head cut off, product cropped at edges, feet cropped, " +
  "important objects near top edge, " +
  "text in image, logo in image, watermark, typography, words, letters, numbers, " +
  "UI overlay, HUD, banner layout, brand guidelines overlay, " +
  "distorted, deformed hands, duplicate subjects, " +
  "oversaturated, grainy, amateurish, stock photo look, low quality";

/**
 * Compact avoid clause for inline injection when a separate negative param is
 * unavailable (e.g. Higgsfield CLI which has no --negative_prompt flag).
 */
export const COMPOSITION_AVOID_INLINE =
  "no text, no logos, no watermarks, " +
  "do not create empty sky or blank gradients at top, " +
  "do not reserve a clean rectangle at top, " +
  "do not center the subject, " +
  "do not crop the face or head, " +
  "do not place important objects near the top edge";
