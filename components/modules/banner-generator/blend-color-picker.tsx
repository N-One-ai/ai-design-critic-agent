"use client";

import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import { Copy, Check, Clipboard } from "lucide-react";
import { BLEND_PRESET_LIST, BLEND_COLOR_DEFAULT, findPresetByHex } from "@/lib/brand/blend-presets";

// ── Color math (pure functions — no library) ──────────────────────────────────

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
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d   = max - min;
  let h = 0;
  const s = max === 0 ? 0 : d / max;
  const v = max;
  if (d !== 0) {
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
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
    const p = v * (1 - s);
    const q = v * (1 - f * s);
    const t = v * (1 - (1 - f) * s);
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

// ── Recent colors (localStorage) ─────────────────────────────────────────────

const RECENT_KEY = "banner-blend-recent";
const MAX_RECENT = 6;

function loadRecent(): string[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(RECENT_KEY) ?? "[]"); }
  catch { return []; }
}

function pushRecent(hex: string, current: string[]): string[] {
  const norm    = hex.toUpperCase();
  const filtered = current.filter((c) => c.toUpperCase() !== norm);
  const next    = [norm, ...filtered].slice(0, MAX_RECENT);
  try { localStorage.setItem(RECENT_KEY, JSON.stringify(next)); } catch {}
  return next;
}

// ── Shared input style ────────────────────────────────────────────────────────

const INPUT_STYLE: React.CSSProperties = {
  width:       "100%",
  height:      26,
  fontSize:    11,
  fontFamily:  "monospace",
  background:  "rgba(255,255,255,0.04)",
  border:      "1px solid var(--border-default)",
  borderRadius: 6,
  color:       "var(--fg-default)",
  outline:     "none",
};

// ── Component ─────────────────────────────────────────────────────────────────

interface BlendColorPickerProps {
  value:     string;
  onChange:  (hex: string) => void;
  disabled?: boolean;
}

export function BlendColorPicker({
  value    = BLEND_COLOR_DEFAULT,
  onChange,
  disabled,
}: BlendColorPickerProps) {
  // "custom" mode = preset swatch not selected
  const [isCustom, setIsCustom] = useState(() => !findPresetByHex(value));
  const [hexInput,  setHexInput]  = useState(value.toUpperCase());
  const [recent,    setRecent]    = useState<string[]>([]);
  const [copied,    setCopied]    = useState(false);

  const sbRef  = useRef<HTMLDivElement>(null);
  const hueRef = useRef<HTMLDivElement>(null);

  // Hydrate recent colors
  useEffect(() => { setRecent(loadRecent()); }, []);

  // Sync hex input and custom mode when value changes externally
  useEffect(() => {
    setHexInput(value.toUpperCase());
    if (findPresetByHex(value)) setIsCustom(false);
  }, [value]);

  // Derive HSV from current value (never store separately — prevents drift)
  const [r, g, b] = useMemo(() => hexToRgb(value), [value]);
  const [hue, sat, val] = useMemo(() => rgbToHsv(r, g, b), [r, g, b]);

  // Pure-hue color for the SB square background
  const pureHue = useMemo(() => {
    const [pr, pg, pb] = hsvToRgb(hue, 100, 100);
    return rgbToHex(pr, pg, pb);
  }, [hue]);

  // ── Commit a confirmed color to recent list ────────────────────────────────
  const commitRecent = useCallback(
    (hex: string) => setRecent((prev) => pushRecent(hex, prev)),
    [],
  );

  // ── SB square (saturation × brightness) ──────────────────────────────────
  const updateSB = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!sbRef.current) return;
      const rect = sbRef.current.getBoundingClientRect();
      const newS = Math.max(0, Math.min(100, ((e.clientX - rect.left)  / rect.width)  * 100));
      const newV = Math.max(0, Math.min(100, (1 - (e.clientY - rect.top) / rect.height) * 100));
      const [nr, ng, nb] = hsvToRgb(hue, newS, newV);
      onChange(rgbToHex(nr, ng, nb));
    },
    [hue, onChange],
  );

  const onSBDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      sbRef.current?.setPointerCapture(e.pointerId);
      updateSB(e);
    },
    [updateSB],
  );
  const onSBMove  = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => { if (e.buttons === 1) updateSB(e); },
    [updateSB],
  );
  const onSBUp = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      sbRef.current?.releasePointerCapture(e.pointerId);
      commitRecent(value);
    },
    [value, commitRecent],
  );

  // ── Hue slider ────────────────────────────────────────────────────────────
  const updateHue = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!hueRef.current) return;
      const rect  = hueRef.current.getBoundingClientRect();
      const newH  = Math.max(0, Math.min(360, ((e.clientX - rect.left) / rect.width) * 360));
      const [nr, ng, nb] = hsvToRgb(newH, sat, val);
      onChange(rgbToHex(nr, ng, nb));
    },
    [sat, val, onChange],
  );

  const onHueDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      hueRef.current?.setPointerCapture(e.pointerId);
      updateHue(e);
    },
    [updateHue],
  );
  const onHueMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => { if (e.buttons === 1) updateHue(e); },
    [updateHue],
  );
  const onHueUp = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      hueRef.current?.releasePointerCapture(e.pointerId);
      commitRecent(value);
    },
    [value, commitRecent],
  );

  // ── Hex input ─────────────────────────────────────────────────────────────
  const onHexChange = useCallback(
    (raw: string) => {
      const clean = raw.replace(/[^0-9A-Fa-f]/g, "").slice(0, 6);
      const full  = "#" + clean.toUpperCase();
      setHexInput(full);
      if (isValidHex(full)) onChange(full);
    },
    [onChange],
  );

  const onHexBlur = useCallback(() => {
    if (isValidHex(hexInput)) {
      commitRecent(hexInput);
    } else {
      setHexInput(value.toUpperCase());
    }
  }, [hexInput, value, commitRecent]);

  // ── RGB inputs ────────────────────────────────────────────────────────────
  const onRgbChange = useCallback(
    (ch: 0 | 1 | 2, rawVal: string) => {
      const n   = Math.max(0, Math.min(255, parseInt(rawVal, 10) || 0));
      const rgb: [number, number, number] = [r, g, b];
      rgb[ch]   = n;
      onChange(rgbToHex(...rgb));
    },
    [r, g, b, onChange],
  );

  // ── Copy / Paste ──────────────────────────────────────────────────────────
  const onCopy = useCallback(() => {
    navigator.clipboard.writeText(value).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }).catch(() => {});
  }, [value]);

  const onPaste = useCallback(() => {
    navigator.clipboard.readText().then((text) => {
      const t  = text.trim();
      const hx = t.startsWith("#") ? t : "#" + t;
      if (isValidHex(hx)) {
        onChange(hx.toUpperCase());
        commitRecent(hx.toUpperCase());
      }
    }).catch(() => {});
  }, [onChange, commitRecent]);

  // ── Cursor positions ──────────────────────────────────────────────────────
  const sbCursorX    = sat;                   // 0–100 (left % in SB square)
  const sbCursorY    = 100 - val;             // 0–100 (top % in SB square)
  const hueCursorPct = (hue / 360) * 100;     // 0–100 (left % on hue bar)

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-2">

      {/* ── Section label ───────────────────────────────────────────────── */}
      <div className="flex items-center gap-1.5">
        <span
          className="text-[11px] font-semibold uppercase tracking-wide"
          style={{ color: "var(--fg-subtle)" }}
        >
          Màu nền
        </span>
        <div className="flex-1 h-px" style={{ background: "var(--border-default)" }} />
      </div>

      {/* ── Preset swatches ─────────────────────────────────────────────── */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {BLEND_PRESET_LIST.map((preset) => {
          const isSelected =
            !isCustom && value.toUpperCase() === preset.hex.toUpperCase();
          return (
            <button
              key={preset.id}
              type="button"
              disabled={disabled}
              title={preset.labelVi}
              onClick={() => {
                onChange(preset.hex);
                setIsCustom(false);
              }}
              style={{
                width:        28,
                height:       28,
                borderRadius: "50%",
                background:   preset.hex,
                border:       isSelected
                  ? "2.5px solid var(--fg-default)"
                  : "1.5px solid rgba(255,255,255,0.15)",
                outline:      isSelected ? "2px solid rgba(255,255,255,0.20)" : "none",
                outlineOffset: "2px",
                flexShrink:   0,
                cursor:       "pointer",
                transition:   "transform 0.1s, border-color 0.1s",
              }}
              className="hover:scale-110 disabled:opacity-40 disabled:cursor-not-allowed"
            />
          );
        })}

        {/* Custom toggle */}
        <button
          type="button"
          disabled={disabled}
          title="Tuỳ chọn màu"
          onClick={() => setIsCustom(true)}
          style={{
            width:        28,
            height:       28,
            borderRadius: "50%",
            background:   isCustom ? value : "transparent",
            border:       isCustom
              ? "2.5px solid var(--fg-default)"
              : "1.5px dashed rgba(255,255,255,0.25)",
            outline:      isCustom ? "2px solid rgba(255,255,255,0.20)" : "none",
            outlineOffset: "2px",
            flexShrink:   0,
            cursor:       "pointer",
            fontSize:     14,
            lineHeight:   1,
            display:      "flex",
            alignItems:   "center",
            justifyContent: "center",
            color:        "var(--fg-muted)",
            transition:   "transform 0.1s",
          }}
          className="hover:scale-110 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {!isCustom && <span style={{ fontSize: 16, lineHeight: 1 }}>+</span>}
        </button>
      </div>

      {/* ── Custom color picker panel ────────────────────────────────────── */}
      {isCustom && (
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
              height:       148,
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
            {/* White → transparent (left→right = 0% sat → 100% sat) */}
            <div
              style={{
                position: "absolute", inset: 0, borderRadius: "inherit",
                background: "linear-gradient(to right, #ffffff, transparent)",
              }}
            />
            {/* Transparent → black (top→bottom = 100% val → 0% val) */}
            <div
              style={{
                position: "absolute", inset: 0, borderRadius: "inherit",
                background: "linear-gradient(to bottom, transparent, #000000)",
              }}
            />
            {/* Cursor ring */}
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
                pointerEvents: "none",
                background:   value,
              }}
            />
          </div>

          {/* Hue rainbow bar */}
          <div
            ref={hueRef}
            style={{
              position:     "relative",
              height:       14,
              borderRadius: 7,
              background:
                "linear-gradient(to right, #f00 0%, #ff0 17%, #0f0 33%, #0ff 50%, #00f 67%, #f0f 83%, #f00 100%)",
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
                width:        16,
                height:       16,
                borderRadius: "50%",
                border:       "2px solid #fff",
                boxShadow:    "0 0 0 1px rgba(0,0,0,0.45), 0 1px 4px rgba(0,0,0,0.45)",
                background:   pureHue,
                pointerEvents: "none",
              }}
            />
          </div>

          {/* HEX row */}
          <div className="flex items-center gap-1.5">
            {/* Current color swatch */}
            <div
              style={{
                width:        28,
                height:       28,
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
                  position:  "absolute",
                  left:      7,
                  top:       "50%",
                  transform: "translateY(-50%)",
                  fontSize:  11,
                  color:     "var(--fg-muted)",
                  fontWeight: 600,
                  userSelect: "none",
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
                style={{ ...INPUT_STYLE, paddingLeft: 18, paddingRight: 6 }}
              />
            </div>

            {/* Copy */}
            <button
              type="button"
              onClick={onCopy}
              disabled={disabled}
              title="Copy HEX"
              style={{
                width: 28, height: 28, borderRadius: 6,
                border: "1px solid var(--border-default)",
                background: "transparent",
                color: copied ? "var(--brand-default)" : "var(--fg-muted)",
                cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0,
                transition: "color 0.15s",
              }}
            >
              {copied ? <Check size={11} /> : <Copy size={11} />}
            </button>

            {/* Paste */}
            <button
              type="button"
              onClick={onPaste}
              disabled={disabled}
              title="Paste HEX"
              style={{
                width: 28, height: 28, borderRadius: 6,
                border: "1px solid var(--border-default)",
                background: "transparent",
                color: "var(--fg-muted)",
                cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0,
              }}
              className="hover:text-[var(--fg-default)] transition-colors"
            >
              <Clipboard size={11} />
            </button>
          </div>

          {/* RGB row */}
          <div className="flex items-center gap-1">
            {(
              [
                ["R", r,  0 as const],
                ["G", g,  1 as const],
                ["B", b,  2 as const],
              ] as [string, number, 0 | 1 | 2][]
            ).map(([label, channelVal, idx]) => (
              <div key={label} className="flex-1 relative">
                <span
                  style={{
                    position: "absolute", left: 5, top: "50%",
                    transform: "translateY(-50%)",
                    fontSize: 9, fontWeight: 700,
                    color: "var(--fg-muted)",
                    userSelect: "none", pointerEvents: "none",
                  }}
                >
                  {label}
                </span>
                <input
                  type="number"
                  min={0} max={255}
                  value={channelVal}
                  onChange={(e) => onRgbChange(idx, e.target.value)}
                  disabled={disabled}
                  style={{ ...INPUT_STYLE, paddingLeft: 16, paddingRight: 4 }}
                />
              </div>
            ))}
          </div>

          {/* Recent colors */}
          {recent.length > 0 && (
            <div className="flex items-center gap-1.5">
              <span
                style={{
                  fontSize: 10,
                  color: "var(--fg-muted)",
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
                    onClick={() => onChange(rc)}
                    style={{
                      width:        20,
                      height:       20,
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
