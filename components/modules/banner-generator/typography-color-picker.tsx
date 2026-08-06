"use client";

import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import { Copy, Check } from "lucide-react";
import {
  TYPOGRAPHY_PRESET_LIST,
  T_COLOR_DEFAULT,
  T_OPACITY_DEFAULT,
  findTypographyPresetByHex,
} from "@/lib/brand/typography-presets";

// ── Color math (pure — no library) ───────────────────────────────────────────

function hexToRgb(hex: string): [number, number, number] {
  const c = hex.replace("#", "");
  return [
    parseInt(c.slice(0, 2), 16) || 0,
    parseInt(c.slice(2, 4), 16) || 0,
    parseInt(c.slice(4, 6), 16) || 0,
  ];
}

function rgbToHex(r: number, g: number, b: number): string {
  return (
    "#" +
    [r, g, b]
      .map((v) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, "0"))
      .join("")
      .toUpperCase()
  );
}

function rgbToHsv(r: number, g: number, b: number): [number, number, number] {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min;
  let h = 0;
  const s = max === 0 ? 0 : d / max;
  const v = max;
  if (d !== 0) {
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6;                break;
      case b: h = ((r - g) / d + 4) / 6;                break;
    }
  }
  return [h * 360, s * 100, v * 100];
}

function hsvToRgb(h: number, s: number, v: number): [number, number, number] {
  h /= 360; s /= 100; v /= 100;
  let r = v, g = v, b = v;
  if (s !== 0) {
    const i = Math.floor(h * 6);
    const f = h * 6 - i;
    const p = v * (1 - s), q = v * (1 - f * s), t = v * (1 - (1 - f) * s);
    switch (i % 6) {
      case 0: r = v; g = t; b = p; break;
      case 1: r = q; g = v; b = p; break;
      case 2: r = p; g = v; b = t; break;
      case 3: r = p; g = q; b = v; break;
      case 4: r = t; g = p; b = v; break;
      case 5: r = v; g = p; b = q; break;
    }
  }
  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

function isValidHex(hex: string): boolean {
  return /^#[0-9A-Fa-f]{6}$/.test(hex);
}

// ── WCAG contrast ─────────────────────────────────────────────────────────────

function relativeLuminance(r: number, g: number, b: number): number {
  const lin = (c: number) => {
    const n = c / 255;
    return n <= 0.04045 ? n / 12.92 : Math.pow((n + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

function wcagContrastRatio(
  fg: [number, number, number],
  bg: [number, number, number],
): number {
  const l1 = relativeLuminance(...fg);
  const l2 = relativeLuminance(...bg);
  const hi = Math.max(l1, l2), lo = Math.min(l1, l2);
  return (hi + 0.05) / (lo + 0.05);
}

// ── Recent colours (localStorage) ────────────────────────────────────────────

const MAX_RECENT = 5;

function loadRecent(storageKey: string): string[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(storageKey) ?? "[]"); }
  catch { return []; }
}

function persistRecent(hex: string, current: string[], storageKey: string): string[] {
  const norm     = hex.toUpperCase();
  const filtered = current.filter((c) => c.toUpperCase() !== norm);
  const next     = [norm, ...filtered].slice(0, MAX_RECENT);
  try { localStorage.setItem(storageKey, JSON.stringify(next)); } catch {}
  return next;
}

// ── Shared input style ────────────────────────────────────────────────────────

const INPUT_STYLE: React.CSSProperties = {
  width:        "100%",
  height:       26,
  fontSize:     11,
  fontFamily:   "monospace",
  background:   "rgba(255,255,255,0.04)",
  border:       "1px solid var(--border-default)",
  borderRadius: 6,
  color:        "var(--fg-default)",
  outline:      "none",
};

// ── Eyedropper SVG (inline — avoids lucide-react version dependency) ──────────

function DropperIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m2 22 1-1h3l9-9" />
      <path d="M3 21v-3l9-9" />
      <path d="m15 6 3.4-3.4a2.1 2.1 0 1 1 3 3L18 9l.4.4a2.1 2.1 0 1 1-3 3l-3.8-3.8" />
    </svg>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────

interface TypographyColorPickerProps {
  /** Short label displayed as the section title, e.g. "Màu chữ Tagline 1". */
  label:          string;
  /** Current colour as #RRGGBB hex. */
  value:          string;
  /** Opacity 0–100. */
  opacity:        number;
  /** Called whenever colour OR opacity changes. */
  onChange:       (hex: string, opacity: number) => void;
  /** Called by the Reset button; parent should restore defaults. */
  onReset:        () => void;
  disabled?:      boolean;
  /** When true, the custom picker and + button are hidden. Only presets are clickable. */
  brandLocked?:   boolean;
  /**
   * Background hex used for WCAG contrast check.
   * T1 default: #0033C9 (blue pill background).
   * T2 default: #00934A (dark brand green).
   */
  bgForContrast?: string;
  /** localStorage key for recent colours. Use distinct keys per tagline. */
  recentKey?:     string;
}

export function TypographyColorPicker({
  label,
  value       = T_COLOR_DEFAULT,
  opacity     = T_OPACITY_DEFAULT,
  onChange,
  onReset,
  disabled,
  brandLocked,
  bgForContrast = "#00934A",
  recentKey     = "banner-typo-recent",
}: TypographyColorPickerProps) {
  const [isCustom,   setIsCustom]   = useState(() => !findTypographyPresetByHex(value));
  const [hexInput,   setHexInput]   = useState(value.toUpperCase());
  const [recent,     setRecent]     = useState<string[]>([]);
  const [copied,     setCopied]     = useState(false);
  const [hasDropper, setHasDropper] = useState(false);

  const sbRef    = useRef<HTMLDivElement>(null);
  const hueRef   = useRef<HTMLDivElement>(null);
  const alphaRef = useRef<HTMLDivElement>(null);

  // Detect EyeDropper API support (client-only)
  useEffect(() => {
    setHasDropper(typeof window !== "undefined" && "EyeDropper" in window);
  }, []);

  // Hydrate recent colours
  useEffect(() => { setRecent(loadRecent(recentKey)); }, [recentKey]);

  // Sync inputs when value changes externally
  useEffect(() => {
    setHexInput(value.toUpperCase());
    if (findTypographyPresetByHex(value)) setIsCustom(false);
  }, [value]);

  // Close custom picker when brand lock turns ON
  useEffect(() => {
    if (brandLocked) setIsCustom(false);
  }, [brandLocked]);

  // Derived HSV from current hex
  const [r, g, b]       = useMemo(() => hexToRgb(value),       [value]);
  const [hue, sat, val] = useMemo(() => rgbToHsv(r, g, b),     [r, g, b]);
  const pureHue         = useMemo(() => {
    const [pr, pg, pb] = hsvToRgb(hue, 100, 100);
    return rgbToHex(pr, pg, pb);
  }, [hue]);

  // WCAG contrast
  const bgRgb     = useMemo(() => hexToRgb(bgForContrast), [bgForContrast]);
  const contrast  = useMemo(() => wcagContrastRatio([r, g, b], bgRgb), [r, g, b, bgRgb]);
  const isLowCont = contrast < 3.0;
  const bgLum     = useMemo(() => relativeLuminance(...bgRgb), [bgRgb]);
  const suggestedHex = bgLum > 0.18 ? "#001B4A" : "#FFFFFF";

  const isChanged = value.toUpperCase() !== T_COLOR_DEFAULT || opacity !== T_OPACITY_DEFAULT;

  const commitRecent = useCallback(
    (hex: string) => setRecent((prev) => persistRecent(hex, prev, recentKey)),
    [recentKey],
  );

  // ── SB square ────────────────────────────────────────────────────────────
  const updateSB = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!sbRef.current) return;
      const rect = sbRef.current.getBoundingClientRect();
      const newS = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
      const newV = Math.max(0, Math.min(100, (1 - (e.clientY - rect.top) / rect.height) * 100));
      const [nr, ng, nb] = hsvToRgb(hue, newS, newV);
      onChange(rgbToHex(nr, ng, nb), opacity);
    },
    [hue, opacity, onChange],
  );
  const onSBDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    sbRef.current?.setPointerCapture(e.pointerId); updateSB(e);
  }, [updateSB]);
  const onSBMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (e.buttons === 1) updateSB(e);
  }, [updateSB]);
  const onSBUp   = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    sbRef.current?.releasePointerCapture(e.pointerId); commitRecent(value);
  }, [value, commitRecent]);

  // ── Hue slider ────────────────────────────────────────────────────────────
  const updateHue = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!hueRef.current) return;
      const rect = hueRef.current.getBoundingClientRect();
      const newH = Math.max(0, Math.min(360, ((e.clientX - rect.left) / rect.width) * 360));
      const [nr, ng, nb] = hsvToRgb(newH, sat, val);
      onChange(rgbToHex(nr, ng, nb), opacity);
    },
    [sat, val, opacity, onChange],
  );
  const onHueDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    hueRef.current?.setPointerCapture(e.pointerId); updateHue(e);
  }, [updateHue]);
  const onHueMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (e.buttons === 1) updateHue(e);
  }, [updateHue]);
  const onHueUp   = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    hueRef.current?.releasePointerCapture(e.pointerId); commitRecent(value);
  }, [value, commitRecent]);

  // ── Alpha / opacity slider ────────────────────────────────────────────────
  const updateAlpha = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!alphaRef.current) return;
      const rect   = alphaRef.current.getBoundingClientRect();
      const newOpa = Math.round(Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100)));
      onChange(value, newOpa);
    },
    [value, onChange],
  );
  const onAlphaDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    alphaRef.current?.setPointerCapture(e.pointerId); updateAlpha(e);
  }, [updateAlpha]);
  const onAlphaMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (e.buttons === 1) updateAlpha(e);
  }, [updateAlpha]);
  const onAlphaUp   = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    alphaRef.current?.releasePointerCapture(e.pointerId);
  }, []);

  // ── Hex input ─────────────────────────────────────────────────────────────
  const onHexChange = useCallback(
    (raw: string) => {
      const clean = raw.replace(/[^0-9A-Fa-f]/g, "").slice(0, 6);
      const full  = "#" + clean.toUpperCase();
      setHexInput(full);
      if (isValidHex(full)) onChange(full, opacity);
    },
    [opacity, onChange],
  );
  const onHexBlur = useCallback(() => {
    if (isValidHex(hexInput)) commitRecent(hexInput);
    else setHexInput(value.toUpperCase());
  }, [hexInput, value, commitRecent]);

  // ── RGB inputs ────────────────────────────────────────────────────────────
  const onRgbChange = useCallback(
    (ch: 0 | 1 | 2, rawVal: string) => {
      const n   = Math.max(0, Math.min(255, parseInt(rawVal, 10) || 0));
      const rgb: [number, number, number] = [r, g, b];
      rgb[ch]   = n;
      onChange(rgbToHex(...rgb), opacity);
    },
    [r, g, b, opacity, onChange],
  );

  // ── Copy ──────────────────────────────────────────────────────────────────
  const onCopy = useCallback(() => {
    navigator.clipboard.writeText(value).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }).catch(() => {});
  }, [value]);

  // ── EyeDropper ───────────────────────────────────────────────────────────
  const onEyeDropper = useCallback(async () => {
    if (!hasDropper) return;
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const ed     = new (window as any).EyeDropper();
      const result = await ed.open();
      const hex    = (result.sRGBHex as string).toUpperCase();
      if (isValidHex(hex)) {
        onChange(hex, opacity);
        commitRecent(hex);
        setIsCustom(true);
      }
    } catch { /* user cancelled */ }
  }, [hasDropper, opacity, onChange, commitRecent]);

  // ── Cursor positions ──────────────────────────────────────────────────────
  const sbCursorX      = sat;
  const sbCursorY      = 100 - val;
  const hueCursorPct   = (hue / 360) * 100;
  const alphaCursorPct = opacity;

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-2">

      {/* Section header */}
      <div className="flex items-center justify-between gap-2">
        <span
          className="text-[11px] font-semibold uppercase tracking-wide"
          style={{ color: "var(--fg-subtle)" }}
        >
          {label}
        </span>
        {isChanged && (
          <button
            type="button"
            onClick={onReset}
            disabled={disabled}
            className="text-[11px] text-[var(--fg-muted)] hover:text-[var(--fg-default)] transition-colors shrink-0"
          >
            Đặt lại
          </button>
        )}
      </div>

      {/* Brand preset swatches */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {TYPOGRAPHY_PRESET_LIST.map((preset) => {
          const isSel = !isCustom && value.toUpperCase() === preset.hex.toUpperCase();
          return (
            <button
              key={preset.id}
              type="button"
              disabled={disabled}
              title={preset.labelVi}
              onClick={() => { onChange(preset.hex, opacity); setIsCustom(false); }}
              style={{
                width:         26,
                height:        26,
                borderRadius:  "50%",
                background:    preset.hex,
                border:        isSel
                  ? "2.5px solid var(--fg-default)"
                  : "1.5px solid rgba(255,255,255,0.15)",
                outline:       isSel ? "2px solid rgba(255,255,255,0.20)" : "none",
                outlineOffset: 2,
                flexShrink:    0,
                cursor:        "pointer",
                transition:    "transform 0.1s, border-color 0.1s",
              }}
              className="hover:scale-110 disabled:opacity-40 disabled:cursor-not-allowed"
            />
          );
        })}

        {/* Custom (+) toggle — hidden when brand is locked */}
        {!brandLocked && (
          <button
            type="button"
            disabled={disabled}
            title="Màu tuỳ chọn"
            onClick={() => setIsCustom(true)}
            style={{
              width:           26,
              height:          26,
              borderRadius:    "50%",
              background:      isCustom ? value : "transparent",
              border:          isCustom
                ? "2.5px solid var(--fg-default)"
                : "1.5px dashed rgba(255,255,255,0.25)",
              outline:         isCustom ? "2px solid rgba(255,255,255,0.20)" : "none",
              outlineOffset:   2,
              flexShrink:      0,
              cursor:          "pointer",
              display:         "flex",
              alignItems:      "center",
              justifyContent:  "center",
              color:           "var(--fg-muted)",
              transition:      "transform 0.1s",
            }}
            className="hover:scale-110 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {!isCustom && <span style={{ fontSize: 16, lineHeight: 1 }}>+</span>}
          </button>
        )}
      </div>

      {/* Opacity / alpha slider — always visible */}
      <div className="flex items-center gap-2">
        <span
          className="text-[10px] shrink-0"
          style={{ color: "var(--fg-muted)", width: 32 }}
        >
          Mờ
        </span>

        {/* Slider track */}
        <div
          ref={alphaRef}
          style={{
            position:    "relative",
            flex:         1,
            height:       12,
            borderRadius: 6,
            cursor:       "ew-resize",
            userSelect:   "none",
            touchAction:  "none",
            overflow:     "hidden",
            flexShrink:   0,
          }}
          onPointerDown={onAlphaDown}
          onPointerMove={onAlphaMove}
          onPointerUp={onAlphaUp}
        >
          {/* Checkerboard base (shows transparency) */}
          <div
            style={{
              position:        "absolute",
              inset:           0,
              backgroundImage: "linear-gradient(45deg, #888 25%, transparent 25%), linear-gradient(-45deg, #888 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #888 75%), linear-gradient(-45deg, transparent 75%, #888 75%)",
              backgroundSize:  "8px 8px",
              backgroundPosition: "0 0, 0 4px, 4px -4px, -4px 0",
              backgroundColor: "#ffffff",
            }}
          />
          {/* Colour gradient overlay */}
          <div
            style={{
              position:   "absolute",
              inset:       0,
              background:  `linear-gradient(to right, rgba(${r},${g},${b},0), rgba(${r},${g},${b},1))`,
            }}
          />
          {/* Cursor */}
          <div
            style={{
              position:     "absolute",
              left:         `${alphaCursorPct}%`,
              top:          "50%",
              transform:    "translate(-50%, -50%)",
              width:        14,
              height:       14,
              borderRadius: "50%",
              border:       "2px solid #fff",
              boxShadow:    "0 0 0 1px rgba(0,0,0,0.45), 0 1px 4px rgba(0,0,0,0.45)",
              background:   `rgba(${r},${g},${b},${(opacity / 100).toFixed(2)})`,
              pointerEvents: "none",
            }}
          />
        </div>

        <span
          className="text-right shrink-0 font-mono"
          style={{ fontSize: 11, color: "var(--fg-muted)", width: 32 }}
        >
          {opacity}%
        </span>
      </div>

      {/* WCAG contrast warning */}
      {isLowCont && (
        <div
          className="flex items-start gap-1.5 rounded-md px-2 py-1.5"
          style={{
            background: "rgba(234,179,8,0.10)",
            border:     "1px solid rgba(234,179,8,0.25)",
          }}
        >
          <span style={{ fontSize: 11, flexShrink: 0, marginTop: 0 }}>⚠</span>
          <span style={{ fontSize: 11, color: "var(--fg-subtle)", lineHeight: 1.4 }}>
            Độ tương phản thấp ({contrast.toFixed(1)}:1).{" "}
            <button
              type="button"
              onClick={() => {
                onChange(suggestedHex, opacity);
                setIsCustom(false);
              }}
              disabled={disabled}
              style={{
                textDecoration: "underline",
                background:     "none",
                border:         "none",
                padding:        0,
                cursor:         "pointer",
                fontSize:       11,
                color:          "inherit",
              }}
            >
              Dùng {suggestedHex}
            </button>
          </span>
        </div>
      )}

      {/* Custom colour picker panel */}
      {isCustom && !brandLocked && (
        <div
          className="flex flex-col gap-2 p-2.5 rounded-xl"
          style={{
            background: "rgba(0,0,0,0.20)",
            border:     "1px solid rgba(255,255,255,0.06)",
          }}
        >
          {/* Saturation / Brightness square */}
          <div
            ref={sbRef}
            style={{
              position:     "relative",
              width:        "100%",
              height:       140,
              borderRadius: 8,
              background:   pureHue,
              cursor:       "crosshair",
              userSelect:   "none",
              touchAction:  "none",
              overflow:     "hidden",
              flexShrink:   0,
            }}
            onPointerDown={onSBDown}
            onPointerMove={onSBMove}
            onPointerUp={onSBUp}
          >
            <div
              style={{
                position: "absolute", inset: 0, borderRadius: "inherit",
                background: "linear-gradient(to right, #ffffff, transparent)",
              }}
            />
            <div
              style={{
                position: "absolute", inset: 0, borderRadius: "inherit",
                background: "linear-gradient(to bottom, transparent, #000000)",
              }}
            />
            <div
              style={{
                position:     "absolute",
                left:         `${sbCursorX}%`,
                top:          `${sbCursorY}%`,
                transform:    "translate(-50%, -50%)",
                width:        14,
                height:       14,
                borderRadius: "50%",
                border:       "2px solid #fff",
                boxShadow:    "0 0 0 1px rgba(0,0,0,0.45), 0 1px 4px rgba(0,0,0,0.45)",
                background:   value,
                pointerEvents: "none",
              }}
            />
          </div>

          {/* Hue rainbow bar */}
          <div
            ref={hueRef}
            style={{
              position:    "relative",
              height:       12,
              borderRadius: 6,
              background:   "linear-gradient(to right, #f00 0%, #ff0 17%, #0f0 33%, #0ff 50%, #00f 67%, #f0f 83%, #f00 100%)",
              cursor:       "ew-resize",
              userSelect:   "none",
              touchAction:  "none",
              flexShrink:   0,
            }}
            onPointerDown={onHueDown}
            onPointerMove={onHueMove}
            onPointerUp={onHueUp}
          >
            <div
              style={{
                position:     "absolute",
                left:         `${hueCursorPct}%`,
                top:          "50%",
                transform:    "translate(-50%, -50%)",
                width:        14,
                height:       14,
                borderRadius: "50%",
                border:       "2px solid #fff",
                boxShadow:    "0 0 0 1px rgba(0,0,0,0.45), 0 1px 4px rgba(0,0,0,0.45)",
                background:   pureHue,
                pointerEvents: "none",
              }}
            />
          </div>

          {/* HEX + tool row */}
          <div className="flex items-center gap-1.5">
            {/* Current colour swatch */}
            <div
              style={{
                width:        26,
                height:       26,
                borderRadius: 6,
                background:   value,
                border:       "1px solid rgba(255,255,255,0.12)",
                flexShrink:   0,
              }}
            />

            {/* HEX input */}
            <div className="flex-1 relative">
              <span
                style={{
                  position:      "absolute",
                  left:          6,
                  top:           "50%",
                  transform:     "translateY(-50%)",
                  fontSize:      11,
                  color:         "var(--fg-muted)",
                  fontWeight:    600,
                  userSelect:    "none",
                  pointerEvents: "none",
                }}
              >
                #
              </span>
              <input
                type="text"
                value={hexInput.replace("#", "")}
                onChange={(e) => onHexChange(e.target.value)}
                onBlur={onHexBlur}
                disabled={disabled}
                maxLength={6}
                spellCheck={false}
                autoComplete="off"
                style={{ ...INPUT_STYLE, paddingLeft: 16, paddingRight: 6 }}
              />
            </div>

            {/* Copy */}
            <button
              type="button"
              onClick={onCopy}
              disabled={disabled}
              title="Copy HEX"
              style={{
                width:      26,
                height:     26,
                borderRadius: 6,
                border:     "1px solid var(--border-default)",
                background: "transparent",
                color:      copied ? "var(--brand-default)" : "var(--fg-muted)",
                cursor:     "pointer",
                display:    "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                transition: "color 0.15s",
              }}
            >
              {copied ? <Check size={11} /> : <Copy size={11} />}
            </button>

            {/* EyeDropper — only when browser supports */}
            {hasDropper && (
              <button
                type="button"
                onClick={onEyeDropper}
                disabled={disabled}
                title="Lấy màu từ màn hình"
                style={{
                  width:      26,
                  height:     26,
                  borderRadius: 6,
                  border:     "1px solid var(--border-default)",
                  background: "transparent",
                  color:      "var(--fg-muted)",
                  cursor:     "pointer",
                  display:    "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
                className="hover:text-[var(--fg-default)] transition-colors"
              >
                <DropperIcon />
              </button>
            )}
          </div>

          {/* RGB row */}
          <div className="flex items-center gap-1">
            {(
              [["R", r, 0], ["G", g, 1], ["B", b, 2]] as [string, number, 0 | 1 | 2][]
            ).map(([lbl, ch, idx]) => (
              <div key={lbl} className="flex-1 relative">
                <span
                  style={{
                    position:      "absolute",
                    left:          5,
                    top:           "50%",
                    transform:     "translateY(-50%)",
                    fontSize:      9,
                    fontWeight:    700,
                    color:         "var(--fg-muted)",
                    userSelect:    "none",
                    pointerEvents: "none",
                  }}
                >
                  {lbl}
                </span>
                <input
                  type="number"
                  min={0}
                  max={255}
                  value={ch}
                  onChange={(e) => onRgbChange(idx, e.target.value)}
                  disabled={disabled}
                  style={{ ...INPUT_STYLE, paddingLeft: 14, paddingRight: 4 }}
                />
              </div>
            ))}
          </div>

          {/* Recent colours */}
          {recent.length > 0 && (
            <div className="flex items-center gap-1.5">
              <span
                style={{
                  fontSize:   10,
                  color:      "var(--fg-muted)",
                  flexShrink: 0,
                  userSelect: "none",
                }}
              >
                Gần đây
              </span>
              <div className="flex gap-1 flex-wrap">
                {recent.map((rc) => (
                  <button
                    key={rc}
                    type="button"
                    disabled={disabled}
                    title={rc}
                    onClick={() => { onChange(rc, opacity); commitRecent(rc); }}
                    style={{
                      width:        18,
                      height:       18,
                      borderRadius: "50%",
                      background:   rc,
                      border:
                        rc.toUpperCase() === value.toUpperCase()
                          ? "2px solid var(--fg-default)"
                          : "1px solid rgba(255,255,255,0.15)",
                      cursor:     "pointer",
                      flexShrink: 0,
                      transition: "transform 0.1s",
                    }}
                    className="hover:scale-110"
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
