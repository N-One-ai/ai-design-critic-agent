/**
 * Banner Composition System — safe-area specs, subject detection, camera framing.
 *
 * Single source of truth for how hero images must be composed for ZaloPay
 * banner templates. Both the LLM prompt builder (banner-prompt.ts) and the
 * image generation route (generate-banner/route.ts) import from here so the
 * composition rules are defined once and enforced at two layers:
 *
 *   Layer 1 — LLM (Gemini): buildCompositionBlock() instructs the scene writer
 *             to produce a composition-aware visual description.
 *   Layer 2 — Image model (Higgsfield): the same block is prepended to the
 *             final prompt as hard constraints before generation.
 *
 * Adding a new canvas size:
 *   Add an entry to BANNER_CANVAS_SPECS. The route resolves the correct spec
 *   from the dimensions passed in the request.
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
    "Medium Shot — waist-up, subject clearly visible, generous headroom above",
  "medium-full-shot":
    "Medium Full Shot — full body from knees up, subject in lower frame, open sky above",
  "close-up":
    "Close-Up — subject fills lower 60% of frame, fine detail, dramatic proximity, sky or blur above",
  "three-quarter-shot":
    "Three-Quarter Shot — head to below knees, fashion-editorial framing, negative space above",
  "hero-product-shot":
    "Hero Product Shot — product centred in lower 55%, 45° hero angle, clean shadow, soft blur above",
  "wide-establishing-shot":
    "Wide Establishing Shot — environment-first, subject anchored at bottom third, vast negative space above",
};

// ── Canvas safe-area specifications ──────────────────────────────────────────

export interface CanvasSpec {
  /** Display label, e.g. "1200×1200" */
  label:        string;
  /** Fraction of canvas height reserved for logo + typography (0–1). E.g. 0.40 = top 40% */
  safeAreaTop:  number;
  /** Aspect ratio string passed to the image model, e.g. "1:1" */
  aspectRatio:  string;
}

/** All officially supported ZaloPay banner canvas sizes. */
export const BANNER_CANVAS_SPECS: Readonly<Record<string, CanvasSpec>> = {
  "1200x1200": { label: "1200×1200 (Square)",       safeAreaTop: 0.40, aspectRatio: "1:1"  },
  "1200x628":  { label: "1200×628 (Landscape)",      safeAreaTop: 0.35, aspectRatio: "16:9" },
  "1080x1920": { label: "1080×1920 (Story/Reel)",    safeAreaTop: 0.38, aspectRatio: "9:16" },
  "720x360":   { label: "720×360 (Banner strip)",    safeAreaTop: 0.32, aspectRatio: "16:9" },
  "1440x360":  { label: "1440×360 (Leaderboard)",    safeAreaTop: 0.28, aspectRatio: "16:9" },
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
 * Both layers receive the same rules so composition intent survives the
 * prompt-rewrite step.
 */
export function buildCompositionBlock({
  category,
  framing,
  canvasSpec = BANNER_CANVAS_SPECS[DEFAULT_CANVAS_KEY],
}: CompositionBlockOptions): string {
  const safeTopPct = Math.round(canvasSpec.safeAreaTop * 100);
  const heroPct    = Math.round((1 - canvasSpec.safeAreaTop) * 100);

  return [
    `BANNER SAFE-AREA COMPOSITION [${canvasSpec.label}]:`,
    `  TOP ${safeTopPct}%  ← CLEAN ZONE — open sky, soft blur, or neutral gradient ONLY.`,
    "             No faces. No hands. No products. No important objects.",
    "             This zone is overlaid by logo and taglines in the final banner.",
    `  LOWER ${heroPct}%  ← HERO ZONE — place the primary subject here.`,
    `             ${FRAMING_DESCRIPTIONS[framing]}`,
    "             Subject lower-center (or lower-left/right if natural to the scene).",
    "             Never crop heads. Never crop key product edges.",
    "  DEPTH:     Shallow focus in upper portion; background softly blurs toward top.",
    "             Smooth visual transition from background into the upper clean zone.",
    "  INTENT:    Image must look intentionally composed for a premium advertising banner.",
    "             Not randomly framed. Not snapshot-style. Deliberate cinematic composition.",
  ].join("\n");
}

// ── Negative constraints ──────────────────────────────────────────────────────

/** Full negative prompt for providers that accept a separate negative parameter. */
export const COMPOSITION_NEGATIVE =
  "text in image, logo in image, watermark, typography, words, letters, numbers, " +
  "UI overlay, HUD, banner layout, brand guidelines overlay, " +
  "subject in top half of frame, face near top edge, face at top third, " +
  "product near top edge, object near top, " +
  "symmetrical composition, centered subject with no negative space, " +
  "cluttered top area, busy background in upper portion, " +
  "head cropped, head cut off, product cropped, feet cropped, " +
  "random framing, accidental composition, snapshot aesthetic, " +
  "distorted, deformed hands, duplicate subjects, " +
  "oversaturated, grainy, amateurish, stock photo look, low quality";

/**
 * Compact avoid clause for inline injection when a separate negative param is
 * unavailable (e.g. Higgsfield CLI which has no --negative_prompt flag).
 * Kept short so it doesn't dominate the prompt budget.
 */
export const COMPOSITION_AVOID_INLINE =
  "no text, no logos, no watermarks, " +
  "no faces in upper half, no subject in top 40%, " +
  "no head cropping, no symmetrical layout, " +
  "no snapshot framing, no stock-photo aesthetic";
