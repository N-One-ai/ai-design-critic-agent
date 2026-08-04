"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";
import type { HeroMaskStyle, BannerTaglineAlign, LogoVariant } from "@/lib/types";
import { resolveLogoPath, LOGO_VARIANT_DEFAULT } from "@/lib/assets/logo-assets";

// ── Canvas coordinate space ───────────────────────────────────────────────────

const W    = 1200;
const H    = 1200;
const SAFE = 64;

// ── Brand colours (immutable — never override) ────────────────────────────────

// Logo path is resolved dynamically via resolveLogoPath() — never hardcoded here.
const BG_TOP    = "#0ED46C";
const BG_MID    = "#00C060";
const BG_BOTTOM = "#00934A";
const BLUE      = "#0033C9";
const WHITE     = "#FFFFFF";
const FONT      = '"Aeonik Pro", "Aeonik", system-ui, -apple-system, "Helvetica Neue", Arial, sans-serif';

// Brand colour RGB channel strings for gradient stops
const BG_RGB     = "0,147,74";    // #00934A — BG_BOTTOM (dark brand green)
const BG_MID_RGB = "0,192,96";    // #00C060
const BG_TOP_RGB = "14,212,108";  // #0ED46C — BG_TOP (light brand green)

// ── Design tokens — exported so controls can use the same values ──────────────

/** CSS display size of the canvas (used by drag overlay for coordinate mapping) */
export const BANNER_CANVAS_DISPLAY_SIZE = 560;

/** Base logo width before scale is applied */
export const BANNER_LOGO_W_BASE    = 200;
/** Default logo scale — 1.26 (≈+5% vs previous 1.2) */
export const BANNER_LOGO_SCALE     = 1.26;

export const BANNER_T1_FS_DEFAULT  = 32;
export const BANNER_T1_FS_MIN      = 20;
export const BANNER_T1_FS_MAX      = 48;

export const BANNER_T2_FS_DEFAULT  = 80;
export const BANNER_T2_FS_MIN      = 48;
export const BANNER_T2_FS_MAX      = 120;

export const BANNER_T1_TEXT_TRANSFORM_DEFAULT: "none" | "uppercase" = "none";
export const BANNER_T1_ALIGN_DEFAULT: BannerTaglineAlign = "center";
export const BANNER_T2_ALIGN_DEFAULT: BannerTaglineAlign = "center";
export const BANNER_HERO_MASK_DEFAULT: HeroMaskStyle = "RoundedRect";

export const BANNER_HERO_BLEND_DEFAULT = 40;
export const BANNER_HERO_BLEND_MIN     = 0;
export const BANNER_HERO_BLEND_MAX     = 100;

/**
 * Future-ready effect params for the hero image rendering pipeline.
 * Add new fields here when new effect controls are built — existing
 * rendering code never needs to be rewritten; just add a new branch
 * inside renderHeroEffects().
 */
export interface HeroEffectParams {
  blend: number; // 0–100 · 40 = default
  // Future:
  // backgroundBlur?: number;
  // glowStrength?:   number;
  // shadowStrength?: number;
  // colorOverlay?:   string;
  // vignette?:       number;
  // lightWrap?:      number;
  // noise?:          number;
  // atmosphere?:     number;
}

export const HERO_EFFECT_DEFAULT: HeroEffectParams = { blend: BANNER_HERO_BLEND_DEFAULT };

// Tagline 1 geometry (padding — height computed from font size)
const T1_PX             = 24;
const T1_PY             = 14;
const T1_LETTER_SPACING = "1px";

// ── Layout spacing tokens (1200×1200 canvas coordinate space) ─────────────────
// At the 560px CSS display size, 1 canvas px ≈ 0.467 display px.
//
//   logoToLabel      52 canvas ≈ 24 display px  — logo bottom → T1 pill top
//   labelToHeadline  16 canvas → visual gap ≈ 17–18 display px at T2 fs=80
//                    (textBaseline="alphabetic" adds fs*0.27 of ascender space,
//                    so true visual gap = 16 + fs*0.27; at fs=80 → ~38 canvas)
//   t2LineHeight     tight 1.05 multiplier — premium editorial feel
//
// To support additional canvas sizes in the future, multiply these tokens
// by (canvasWidth / 1200) in the relevant renderBanner call.
const LAYOUT_SP = {
  logoToLabel:     52,
  labelToHeadline: 16,
  t2LineHeight:    1.05,
} as const;

// ── Render params ─────────────────────────────────────────────────────────────

export interface BannerRenderParams {
  t1FontSize?:        number;
  t2FontSize?:        number;
  logoScale?:         number;
  logoVariant?:       LogoVariant;
  t1TextTransform?:   "none" | "uppercase";
  t1Align?:           BannerTaglineAlign;
  t2Align?:           BannerTaglineAlign;
  heroMaskStyle?:     HeroMaskStyle;
  heroOffsetX?:       number;
  heroOffsetY?:       number;
  heroScale?:         number;
  heroBlend?:         number;
  /** Called synchronously once hero bounds are determined (before hero image is drawn). */
  onHeroBoundsReady?: (bounds: { x: number; y: number; w: number; h: number }) => void;
}

// ── Image cache (module-level — reused across renders) ────────────────────────

const imageCache = new Map<string, HTMLImageElement>();

function loadImage(src: string): Promise<HTMLImageElement> {
  const cached = imageCache.get(src);
  if (cached) return Promise.resolve(cached);
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload  = () => { imageCache.set(src, img); resolve(img); };
    img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
    img.src = src;
  });
}

// ── Geometry helpers ──────────────────────────────────────────────────────────

function roundedRectPath(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number,
  tl: number, tr: number, br: number, bl: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + tl, y);
  ctx.lineTo(x + w - tr, y);
  ctx.quadraticCurveTo(x + w, y,     x + w, y + tr);
  ctx.lineTo(x + w, y + h - br);
  ctx.quadraticCurveTo(x + w, y + h, x + w - br, y + h);
  ctx.lineTo(x + bl, y + h);
  ctx.quadraticCurveTo(x, y + h,     x, y + h - bl);
  ctx.lineTo(x, y + tl);
  ctx.quadraticCurveTo(x, y,         x + tl, y);
  ctx.closePath();
}

function clamp(v: number, min: number, max: number) {
  return Math.min(max, Math.max(min, v));
}

// ── Hero image helpers ────────────────────────────────────────────────────────

/**
 * Cover-fit an image into the target rect with optional pan/zoom transform.
 * offsetX/Y are canvas-space px from the centre of the zone; scale multiplies
 * the cover-fit dimensions (1.0 = exact cover-fit, no pan room).
 */
function drawImageCoverTransformed(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number, y: number, w: number, h: number,
  offsetX = 0, offsetY = 0, scale = 1.0,
) {
  const ir = img.width / img.height;
  const zr = w / h;
  let fw: number, fh: number;
  if (ir > zr) { fh = h; fw = fh * ir; }
  else         { fw = w; fh = fw / ir; }
  const sw = fw * scale;
  const sh = fh * scale;
  const dx = x + w / 2 - sw / 2 + offsetX;
  const dy = y + h / 2 - sh / 2 + offsetY;
  ctx.drawImage(img, dx, dy, sw, sh);
}

// ── Brightness detection ──────────────────────────────────────────────────────

/**
 * Sample average perceptual luminance (0=dark, 1=bright) from a canvas region.
 * Reads an 80×80 downsampled area for speed. Returns 0.5 on any error (CORS, etc.).
 */
function sampleRegionBrightness(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number,
): number {
  try {
    const data = ctx.getImageData(x, y, Math.min(w, 80), Math.min(h, 80)).data;
    let sum = 0;
    for (let i = 0; i < data.length; i += 4) {
      // BT.709 perceptual luminance
      sum += 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2];
    }
    return sum / (data.length / 4) / 255;
  } catch {
    return 0.5;
  }
}

// ── Background layers ─────────────────────────────────────────────────────────

/**
 * HeroCanvas — solid brand gradient used when no hero image is present.
 */
function drawBrandBackground(ctx: CanvasRenderingContext2D) {
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0,    BG_TOP);
  bg.addColorStop(0.45, BG_MID);
  bg.addColorStop(1,    BG_BOTTOM);
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);
}

/**
 * Ambient texture: diagonal highlight streak + two soft glow orbs.
 * Drawn over whatever background is in place; confined to the upper half.
 */
function drawAmbientTexture(ctx: CanvasRenderingContext2D) {
  const streak = ctx.createLinearGradient(0, 0, W * 0.55, H * 0.45);
  streak.addColorStop(0,   "rgba(255,255,255,0.07)");
  streak.addColorStop(0.6, "rgba(255,255,255,0.00)");
  ctx.fillStyle = streak;
  ctx.fillRect(0, 0, W, H * 0.50);

  ctx.save();
  ctx.fillStyle = "rgba(255,255,255,0.042)";
  ctx.beginPath(); ctx.arc(W - 80, 190, 175, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "rgba(255,255,255,0.025)";
  ctx.beginPath(); ctx.arc(100, 480, 125, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

/**
 * HeroGradientOverlay — brand green overlay drawn directly over the full-canvas
 * hero image to create a text-safe area at the top and a smooth reveal below.
 *
 * The overlay is the visual bridge between the AI-generated hero and the ZaloPay
 * brand identity: the top of the banner reads as pure brand green; the hero image
 * emerges from it as the eye travels downward.
 *
 * `blend` (0–100, default 40) controls how deep the green extends:
 *   blend = 0  → covers ~28% of canvas  (minimal — logo safe area only)
 *   blend = 40 → covers ~54% of canvas  (default — logo + both taglines)
 *   blend = 100 → covers ~80% of canvas (heavy brand presence)
 *
 * `brightnessBias` (0=dark image, 1=bright) auto-adapts top opacity so WCAG
 * contrast is maintained regardless of the hero image tone.
 *
 * Rendering layers (all additive):
 *   1. Main green→transparent gradient (top-down)
 *   2. Cinematic side vignette (dark neutral, photographic framing)
 *   3. Subtle bottom depth vignette (depth / grounding)
 */
function drawBrandGradientOverlay(
  ctx: CanvasRenderingContext2D,
  blend: number,
  brightnessBias: number,
) {
  // How far down (fraction of H) the gradient extends to fully transparent
  const fadeEnd = blend <= 40
    ? 0.28 + (blend / 40) * 0.26   // blend 0→40:  0.28→0.54
    : 0.54 + ((blend - 40) / 60) * 0.26; // blend 40→100: 0.54→0.80

  // Adaptive top opacity — brighter images need stronger overlay for contrast
  const topA = Math.min(0.97, Math.max(0.74, 0.87 + (brightnessBias - 0.5) * 0.26));

  const fadeEndPx = H * fadeEnd;

  // Main gradient: dark brand green → lighter → transparent
  const g = ctx.createLinearGradient(0, 0, 0, fadeEndPx);
  g.addColorStop(0,    `rgba(${BG_RGB},${topA.toFixed(2)})`);
  g.addColorStop(0.20, `rgba(${BG_MID_RGB},${(topA * 0.95).toFixed(2)})`);
  g.addColorStop(0.48, `rgba(${BG_MID_RGB},${(topA * 0.48).toFixed(2)})`);
  g.addColorStop(0.76, `rgba(${BG_RGB},${(topA * 0.12).toFixed(2)})`);
  g.addColorStop(1.00, `rgba(${BG_RGB},0)`);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, fadeEndPx);

  // Side vignette — neutral dark for cinematic framing (no colour cast)
  const sideW = W * 0.11;

  const lG = ctx.createLinearGradient(0, 0, sideW, 0);
  lG.addColorStop(0,   "rgba(0,0,0,0.22)");
  lG.addColorStop(1,   "rgba(0,0,0,0)");
  ctx.fillStyle = lG;
  ctx.fillRect(0, 0, sideW, H);

  const rG = ctx.createLinearGradient(W, 0, W - sideW, 0);
  rG.addColorStop(0,   "rgba(0,0,0,0.22)");
  rG.addColorStop(1,   "rgba(0,0,0,0)");
  ctx.fillStyle = rG;
  ctx.fillRect(W - sideW, 0, sideW, H);

  // Bottom depth vignette — grounds the image, adds dimension
  const btmH = H * 0.14;
  const bG   = ctx.createLinearGradient(0, H, 0, H - btmH);
  bG.addColorStop(0,   "rgba(0,30,15,0.30)");
  bG.addColorStop(1,   "rgba(0,30,15,0)");
  ctx.fillStyle = bG;
  ctx.fillRect(0, H - btmH, W, btmH);
}

// ── No-image placeholder ──────────────────────────────────────────────────────

/** Subtle hint rendered in the lower canvas when no hero image has been generated. */
function drawHeroPlaceholder(ctx: CanvasRenderingContext2D) {
  ctx.save();

  // Dashed oval outline to suggest the image zone
  const cx = W / 2, cy = H * 0.72, rx = W * 0.28, ry = H * 0.12;
  ctx.beginPath();
  ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
  ctx.setLineDash([12, 8]);
  ctx.strokeStyle = "rgba(255,255,255,0.22)";
  ctx.lineWidth   = 1.5;
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.fillStyle    = "rgba(255,255,255,0.32)";
  ctx.font         = `400 18px ${FONT}`;
  ctx.textAlign    = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("Nhấn Generate để tạo hình ảnh hero", cx, cy);
  ctx.restore();
}

// ── Render pipeline ───────────────────────────────────────────────────────────
//
// Layered composition order:
//   1  HeroBackgroundImage  — full-canvas cover-fit hero (or brand background)
//   2  HeroGradientOverlay  — brand green text-safe area, fades to transparent
//   3  AmbientTexture       — diagonal streak + glow orbs (brand texture)
//   4  HeroLogoLayer        — ZaloPay logo (top-left, always on top)
//   5  HeroTypographyLayer  — Tagline 1 (pill) + Tagline 2 (headline)
//   6  Placeholder hint     — shown only when no hero image has been generated

async function renderBanner(
  canvas:       HTMLCanvasElement,
  tagline1:     string,
  tagline2:     string,
  heroImageUrl: string | null,
  stale:        () => boolean,
  onComplete?:  (dataUrl: string) => void,
  params?:      BannerRenderParams,
) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  canvas.width  = W;
  canvas.height = H;

  // Resolved params
  const t1Fs        = clamp(params?.t1FontSize    ?? BANNER_T1_FS_DEFAULT, BANNER_T1_FS_MIN, BANNER_T1_FS_MAX);
  const t2FsBase    = clamp(params?.t2FontSize    ?? BANNER_T2_FS_DEFAULT, BANNER_T2_FS_MIN, BANNER_T2_FS_MAX);
  const logoW       = Math.round(BANNER_LOGO_W_BASE * (params?.logoScale ?? BANNER_LOGO_SCALE));
  const t1Transform = params?.t1TextTransform     ?? BANNER_T1_TEXT_TRANSFORM_DEFAULT;
  const t1Align     = params?.t1Align             ?? BANNER_T1_ALIGN_DEFAULT;
  const t2Align     = params?.t2Align             ?? BANNER_T2_ALIGN_DEFAULT;
  const heroOffsetX = params?.heroOffsetX         ?? 0;
  const heroOffsetY = params?.heroOffsetY         ?? 0;
  const heroScale   = params?.heroScale           ?? 1.0;
  const blend       = params?.heroBlend           ?? BANNER_HERO_BLEND_DEFAULT;
  const logoPath    = resolveLogoPath(params?.logoVariant ?? LOGO_VARIANT_DEFAULT);

  // Emit hero drag bounds immediately — full canvas in the new pipeline.
  // Synchronous, before any await, so the drag overlay positions correctly.
  params?.onHeroBoundsReady?.({ x: 0, y: 0, w: W, h: H });

  try { await document.fonts.ready; } catch { /* fallback font */ }
  if (stale()) return;

  // ── Layer 1 · HeroBackgroundImage ───────────────────────────────────────────
  // Hero image fills the entire 1200×1200 canvas (cover-fit + pan/zoom).
  // Falls back to solid brand gradient when no image has been generated.
  let heroLoaded    = false;
  let topBrightness = 0.5; // default: medium; updated from pixel sample when hero is drawn

  if (heroImageUrl) {
    try {
      const hero = await loadImage(heroImageUrl);
      if (stale()) return;
      drawImageCoverTransformed(ctx, hero, 0, 0, W, H, heroOffsetX, heroOffsetY, heroScale);
      // Sample top 42% to auto-adapt overlay opacity for WCAG readability
      topBrightness = sampleRegionBrightness(ctx, 0, 0, W, Math.floor(H * 0.42));
      heroLoaded = true;
    } catch {
      if (stale()) return;
    }
  }

  if (!heroLoaded) {
    // No hero yet (or load failed) — show pure brand background
    drawBrandBackground(ctx);
  }

  // ── Layer 2 · HeroGradientOverlay ────────────────────────────────────────────
  // Brand green safe area: ensures logo + taglines are always legible.
  // Only drawn over the hero image; the brand background covers this naturally.
  if (heroLoaded) {
    drawBrandGradientOverlay(ctx, blend, topBrightness);
  }

  // ── Layer 3 · AmbientTexture ─────────────────────────────────────────────────
  drawAmbientTexture(ctx);

  // ── Layer 4 · HeroLogoLayer ──────────────────────────────────────────────────
  // Logo is loaded from the asset registry path for the selected variant.
  // If the variant file is missing (e.g. primary PNG not yet added), we fall
  // back to the white logo — never a broken image, never an AI-generated substitute.
  let cursorY = SAFE;
  let logoH   = Math.round(BANNER_LOGO_W_BASE * 0.31 * (params?.logoScale ?? BANNER_LOGO_SCALE));

  let logoImg: HTMLImageElement | null = null;
  try {
    logoImg = await loadImage(logoPath);
  } catch {
    // Primary variant missing → try white fallback
    const whitePath = resolveLogoPath("white");
    if (logoPath !== whitePath) {
      try { logoImg = await loadImage(whitePath); } catch { /* both failed */ }
    }
  }
  if (stale()) return;

  if (logoImg) {
    logoH = Math.round((logoImg.height / logoImg.width) * logoW);
    ctx.drawImage(logoImg, SAFE, cursorY, logoW, logoH);
  } else {
    ctx.fillStyle = "rgba(255,255,255,0.25)";
    roundedRectPath(ctx, SAFE, cursorY, 130, 40, 8, 8, 8, 8);
    ctx.fill();
    ctx.fillStyle    = WHITE;
    ctx.font         = `700 20px ${FONT}`;
    ctx.textAlign    = "left";
    ctx.textBaseline = "middle";
    ctx.fillText("ZaloPay", SAFE + 14, cursorY + 20);
    logoH = 40;
  }

  cursorY += logoH + LAYOUT_SP.logoToLabel;

  // ── Layer 5 · HeroTypographyLayer ────────────────────────────────────────────

  // Tagline 1 — blue pill badge
  const t1Raw  = tagline1.trim() || "Tagline 1";
  const t1Text = t1Transform === "uppercase" ? t1Raw.toUpperCase() : t1Raw;

  ctx.font          = `700 ${t1Fs}px ${FONT}`;
  ctx.textAlign     = "center";
  ctx.textBaseline  = "middle";
  ctx.letterSpacing = T1_LETTER_SPACING;

  let t1FsActual = t1Fs;
  while (ctx.measureText(t1Text).width + T1_PX * 2 > W - 2 * SAFE && t1FsActual > BANNER_T1_FS_MIN) {
    t1FsActual -= 1;
    ctx.font = `700 ${t1FsActual}px ${FONT}`;
  }
  const t1H    = t1FsActual + T1_PY * 2;
  const t1TxtW = ctx.measureText(t1Text).width;
  const t1BoxW = t1TxtW + T1_PX * 2;

  let t1BoxX: number;
  switch (t1Align) {
    case "left":  t1BoxX = SAFE; break;
    case "right": t1BoxX = W - SAFE - t1BoxW; break;
    default:      t1BoxX = (W - t1BoxW) / 2;
  }

  ctx.fillStyle = BLUE;
  roundedRectPath(ctx, t1BoxX, cursorY, t1BoxW, t1H, 10, 10, 10, 10);
  ctx.fill();

  ctx.fillStyle = WHITE;
  ctx.fillText(t1Text, t1BoxX + t1BoxW / 2, cursorY + t1H / 2);
  ctx.letterSpacing = "0px";
  cursorY += t1H + LAYOUT_SP.labelToHeadline;

  // Tagline 2 — main headline
  const rawLines = tagline2.split("\n").map((l) => l.trim()).filter(Boolean);
  const t2Lines  = rawLines.length > 0 ? rawLines.slice(0, 2) : ["Tagline 2"];

  let t2X: number;
  let t2CanvasAlign: CanvasTextAlign;
  switch (t2Align) {
    case "left":  t2X = SAFE;     t2CanvasAlign = "left";   break;
    case "right": t2X = W - SAFE; t2CanvasAlign = "right";  break;
    default:      t2X = W / 2;    t2CanvasAlign = "center";
  }

  ctx.fillStyle    = WHITE;
  ctx.textAlign    = t2CanvasAlign;
  ctx.textBaseline = "alphabetic";

  for (const line of t2Lines) {
    let fs = t2FsBase;
    ctx.font = `700 ${fs}px ${FONT}`;
    while (ctx.measureText(line).width > W - 2 * SAFE - 16 && fs > BANNER_T2_FS_MIN) {
      fs -= 2;
      ctx.font = `700 ${fs}px ${FONT}`;
    }
    // Enhanced shadow for readability over hero image
    ctx.shadowColor = "rgba(0,0,0,0.28)";
    ctx.shadowBlur  = 24;
    ctx.fillText(line, t2X, cursorY + fs);
    ctx.shadowBlur  = 0;
    ctx.shadowColor = "transparent";
    cursorY += Math.round(fs * LAYOUT_SP.t2LineHeight);
  }

  // ── Layer 6 · Placeholder hint ───────────────────────────────────────────────
  if (!heroLoaded) {
    drawHeroPlaceholder(ctx);
  }

  if (stale()) return;
  onComplete?.(canvas.toDataURL("image/png"));
}

// ── Component ─────────────────────────────────────────────────────────────────

export interface BannerCanvasHandle {
  exportPNG:  (filename?: string) => void;
  getDataURL: () => string | null;
}

interface BannerCanvasProps {
  tagline1:           string;
  tagline2:           string;
  heroImageUrl:       string | null;
  t1FontSize?:        number;
  t2FontSize?:        number;
  logoScale?:         number;
  logoVariant?:       LogoVariant;
  t1TextTransform?:   "none" | "uppercase";
  t1Align?:           BannerTaglineAlign;
  t2Align?:           BannerTaglineAlign;
  heroMaskStyle?:     HeroMaskStyle;
  heroOffsetX?:       number;
  heroOffsetY?:       number;
  heroScale?:         number;
  heroBlend?:         number;
  onHeroBoundsReady?: (bounds: { x: number; y: number; w: number; h: number }) => void;
  /** CSS display size in px — canvas internal resolution is always 1200 × 1200 */
  displaySize?:       number;
  onRenderComplete?:  (dataUrl: string) => void;
  className?:         string;
}

export const BannerCanvas = forwardRef<BannerCanvasHandle, BannerCanvasProps>(
  function BannerCanvas(
    {
      tagline1, tagline2, heroImageUrl,
      t1FontSize, t2FontSize, logoScale, logoVariant,
      t1TextTransform, t1Align, t2Align, heroMaskStyle,
      heroOffsetX, heroOffsetY, heroScale, heroBlend,
      onHeroBoundsReady,
      displaySize, onRenderComplete, className,
    },
    ref,
  ) {
    const canvasRef   = useRef<HTMLCanvasElement>(null);
    const renderIdRef = useRef(0);

    const redraw = useCallback(() => {
      const id     = ++renderIdRef.current;
      const canvas = canvasRef.current;
      if (!canvas) return;
      renderBanner(
        canvas,
        tagline1,
        tagline2,
        heroImageUrl,
        () => renderIdRef.current !== id,
        onRenderComplete,
        {
          t1FontSize, t2FontSize, logoScale, logoVariant,
          t1TextTransform, t1Align, t2Align, heroMaskStyle,
          heroOffsetX, heroOffsetY, heroScale, heroBlend,
          onHeroBoundsReady,
        },
      );
    }, [
      tagline1, tagline2, heroImageUrl,
      t1FontSize, t2FontSize, logoScale, logoVariant,
      t1TextTransform, t1Align, t2Align, heroMaskStyle,
      heroOffsetX, heroOffsetY, heroScale, heroBlend,
      onHeroBoundsReady,
      onRenderComplete,
    ]);

    useEffect(() => { redraw(); }, [redraw]);

    useImperativeHandle(ref, () => ({
      exportPNG(filename = `zalopay-banner-${Date.now()}.png`) {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const url = canvas.toDataURL("image/png");
        const a   = document.createElement("a");
        a.href     = url;
        a.download = filename;
        a.click();
      },
      getDataURL() {
        return canvasRef.current?.toDataURL("image/png") ?? null;
      },
    }));

    const cssSize = displaySize ?? 560;

    return (
      <canvas
        ref={canvasRef}
        width={W}
        height={H}
        style={{ width: cssSize, height: cssSize }}
        className={className}
      />
    );
  },
);
