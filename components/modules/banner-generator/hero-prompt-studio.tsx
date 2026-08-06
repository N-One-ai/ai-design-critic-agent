"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import {
  Sparkles, Copy, Trash2, Undo2, Redo2,
  Maximize2, Minimize2, Languages, X, Check,
  ChevronDown, ChevronUp, History, AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/cn";

// ── Constants ─────────────────────────────────────────────────────────────────

const MIN_H     = 220;
const MAX_H     = 600;
const MAX_CHARS = 4000;
const WARN_AT   = 3800;
const HISTORY_KEY = "banner-hero-prompt-history";
const MAX_HISTORY = 20;

const PLACEHOLDER = `Ví dụ:
Một cô gái Việt Nam khoảng 22 tuổi đang cầm điện thoại có ứng dụng Zalopay.
Phong cách quảng cáo cao cấp.
Ánh sáng studio.
Background hiện đại.
Màu sắc tươi sáng.
Không có chữ. Không có watermark.
Để khoảng trống phía trên cho Logo và Typography.
Ảnh phù hợp banner quảng cáo.`;

const CHIPS: { label: string; value: string }[] = [
  { label: "Studio Lighting",    value: "studio lighting"                         },
  { label: "Commercial",         value: "commercial advertising photography"       },
  { label: "Vietnamese Model",   value: "Vietnamese model"                         },
  { label: "Luxury Style",       value: "luxury premium style"                     },
  { label: "Minimal Background", value: "minimal clean background"                 },
  { label: "Modern Fintech",     value: "modern fintech aesthetic"                 },
  { label: "Lifestyle",          value: "lifestyle photography"                    },
  { label: "No Text",            value: "no text, no words, no typography"         },
  { label: "No Logo",            value: "no logo, no watermark"                    },
  { label: "Premium",            value: "premium quality, high-end production"     },
  { label: "Close-up",           value: "close-up shot"                            },
  { label: "Wide Angle",         value: "wide angle"                               },
  { label: "Hero Composition",   value: "hero composition, centered subject"       },
  { label: "Warm Tones",         value: "warm golden tones"                        },
];

const PROMPT_CHECKS = [
  { id: "subject",  label: "Chủ thể / Nhân vật",  pattern: /người|cô gái|cậu|model|nhân vật|person|girl|boy|woman|man|child|product|sản phẩm/i },
  { id: "env",      label: "Môi trường / Nền",     pattern: /nền|background|scene|phòng|studio|outdoor|indoor|street|office|setting/i           },
  { id: "lighting", label: "Ánh sáng",             pattern: /ánh sáng|lighting|light|đèn|golden hour|soft light|hard light|backlight/i          },
  { id: "angle",    label: "Góc máy",              pattern: /góc|angle|close.?up|wide|portrait|overhead|eye.?level|low angle|shot/i             },
  { id: "style",    label: "Phong cách / Style",   pattern: /phong cách|style|realist|photo|cinematic|editorial|commercial/i                    },
  { id: "color",    label: "Màu sắc / Tông màu",   pattern: /màu|color|tông|palette|warm|cool|vibrant|muted|pastel/i                           },
];

// ── Types ─────────────────────────────────────────────────────────────────────

interface HistoryItem {
  id: string;
  text: string;
  date: string;
  campaignName: string;
}

export interface HeroPromptStudioProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  campaignName?: string;
  onGenerate?: () => void;
}

// ── Toolbar button ────────────────────────────────────────────────────────────

interface TBtnProps {
  onClick: () => void;
  icon?: React.ReactNode;
  label: string;
  loading?: boolean;
  disabled?: boolean;
  accent?: boolean;
}

function TBtn({ onClick, icon, label, loading, disabled, accent }: TBtnProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || loading}
      title={label}
      aria-label={label}
      className={cn(
        "flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium shrink-0 whitespace-nowrap",
        "transition-colors duration-150 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--brand-default)]",
        accent
          ? "text-[var(--brand-default)] hover:bg-[var(--brand-default)]/10"
          : "text-[var(--fg-muted)] hover:text-[var(--fg-default)] hover:bg-[var(--bg-surface-2)]",
        "disabled:opacity-40 disabled:pointer-events-none",
      )}
    >
      {loading
        ? <span className="block w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
        : icon}
      <span>{label}</span>
    </button>
  );
}

// ── Stat badge ────────────────────────────────────────────────────────────────

function StatBadge({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex flex-col items-center gap-px">
      <span className="text-[12px] font-semibold tabular-nums text-[var(--fg-default)]">
        {value.toLocaleString("vi-VN")}
      </span>
      <span className="text-[9px] text-[var(--fg-subtle)] uppercase tracking-wide">
        {label}
      </span>
    </div>
  );
}

// ── Divider ───────────────────────────────────────────────────────────────────

function TDiv() {
  return <div className="w-px h-4 bg-[var(--border-default)] mx-0.5 shrink-0" />;
}

// ── Main component ────────────────────────────────────────────────────────────

export function HeroPromptStudio({
  value,
  onChange,
  disabled,
  campaignName,
  onGenerate,
}: HeroPromptStudioProps) {
  const textareaRef    = useRef<HTMLTextAreaElement>(null);
  const undoStackRef   = useRef<string[]>([]);
  const redoStackRef   = useRef<string[]>([]);
  const selStartRef    = useRef<number>(0);
  const selEndRef      = useRef<number>(0);

  const [isFullscreen,    setFullscreen]    = useState(false);
  const [isMounted,       setMounted]       = useState(false);
  const [isOptimizing,    setOptimizing]    = useState(false);
  const [isTranslating,   setTranslating]   = useState<"en" | "vi" | null>(null);
  const [optimizedPrompt, setOptimized]     = useState<string | null>(null);
  const [showHistory,     setShowHistory]   = useState(false);
  const [showWarnings,    setShowWarnings]  = useState(true);
  const [history,         setHistory]       = useState<HistoryItem[]>([]);

  useEffect(() => { setMounted(true); }, []);

  // ── Load history ────────────────────────────────────────────────────────────
  useEffect(() => {
    try {
      const raw = localStorage.getItem(HISTORY_KEY);
      if (raw) setHistory(JSON.parse(raw));
    } catch { /* ignore */ }
  }, []);

  // ── Auto-grow ───────────────────────────────────────────────────────────────
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    const h = Math.min(Math.max(el.scrollHeight, MIN_H), MAX_H);
    el.style.height       = `${h}px`;
    el.style.overflowY    = el.scrollHeight > MAX_H ? "auto" : "hidden";
  }, [value]);

  // ── Computed ─────────────────────────────────────────────────────────────────
  const chars   = value.length;
  const words   = value.trim() ? value.trim().split(/\s+/).length : 0;
  const tokens  = Math.ceil(chars / 4);
  const missing = value.trim().length > 15
    ? PROMPT_CHECKS.filter(c => !c.pattern.test(value))
    : [];

  // ── Core change handler ─────────────────────────────────────────────────────
  const pushUndo = useCallback((prev: string) => {
    undoStackRef.current.push(prev);
    if (undoStackRef.current.length > 100) undoStackRef.current.shift();
    redoStackRef.current = [];
  }, []);

  const handleChange = useCallback((newVal: string) => {
    pushUndo(value);
    onChange(newVal);
  }, [value, onChange, pushUndo]);

  // ── Undo / Redo ─────────────────────────────────────────────────────────────
  const handleUndo = useCallback(() => {
    if (!undoStackRef.current.length) return;
    const prev = undoStackRef.current.pop()!;
    redoStackRef.current.push(value);
    onChange(prev);
  }, [value, onChange]);

  const handleRedo = useCallback(() => {
    if (!redoStackRef.current.length) return;
    const next = redoStackRef.current.pop()!;
    undoStackRef.current.push(value);
    onChange(next);
  }, [value, onChange]);

  const canUndo = undoStackRef.current.length > 0;
  const canRedo = redoStackRef.current.length > 0;

  // ── Insert at cursor ────────────────────────────────────────────────────────
  const insertAtCursor = useCallback((text: string) => {
    const el    = textareaRef.current;
    const start = el?.selectionStart ?? selStartRef.current ?? value.length;
    const end   = el?.selectionEnd   ?? selEndRef.current   ?? value.length;
    const before = value.slice(0, start);
    const sep    = before.length > 0 && !/[\s,]$/.test(before) ? ", " : "";
    const newVal = before + sep + text + value.slice(end);
    pushUndo(value);
    onChange(newVal);
    requestAnimationFrame(() => {
      if (!el) return;
      const pos = start + sep.length + text.length;
      el.setSelectionRange(pos, pos);
      el.focus();
    });
  }, [value, onChange, pushUndo]);

  // ── Copy / Clear ────────────────────────────────────────────────────────────
  const handleCopy = useCallback(async () => {
    if (!value) return;
    try { await navigator.clipboard.writeText(value); } catch { /* ignore */ }
  }, [value]);

  const handleClear = useCallback(() => {
    if (!value) return;
    pushUndo(value);
    onChange("");
  }, [value, onChange, pushUndo]);

  // ── Save to history (on blur) ───────────────────────────────────────────────
  const saveToHistory = useCallback(() => {
    if (!value.trim() || value.trim().length < 20) return;
    setHistory(prev => {
      const filtered = prev.filter(h => h.text !== value.trim());
      const item: HistoryItem = {
        id: Date.now().toString(),
        text: value.trim(),
        date: new Date().toLocaleString("vi-VN", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }),
        campaignName: campaignName ?? "",
      };
      const next = [item, ...filtered].slice(0, MAX_HISTORY);
      try { localStorage.setItem(HISTORY_KEY, JSON.stringify(next)); } catch { /* ignore */ }
      return next;
    });
  }, [value, campaignName]);

  const deleteHistoryItem = useCallback((id: string) => {
    setHistory(prev => {
      const next = prev.filter(h => h.id !== id);
      try { localStorage.setItem(HISTORY_KEY, JSON.stringify(next)); } catch { /* ignore */ }
      return next;
    });
  }, []);

  // ── Optimize ────────────────────────────────────────────────────────────────
  const handleOptimize = useCallback(async () => {
    if (!value.trim() || isOptimizing) return;
    setOptimizing(true);
    setOptimized(null);
    try {
      const res  = await fetch("/api/prompt", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ action: "optimize", prompt: value }),
      });
      const data = await res.json() as { result?: string };
      if (data.result) setOptimized(data.result);
    } catch { /* ignore */ }
    finally { setOptimizing(false); }
  }, [value, isOptimizing]);

  const applyOptimized = useCallback(() => {
    if (!optimizedPrompt) return;
    pushUndo(value);
    onChange(optimizedPrompt);
    setOptimized(null);
  }, [optimizedPrompt, value, onChange, pushUndo]);

  // ── Translate ───────────────────────────────────────────────────────────────
  const handleTranslate = useCallback(async (lang: "en" | "vi") => {
    if (!value.trim() || isTranslating) return;
    setTranslating(lang);
    try {
      const res  = await fetch("/api/prompt", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ action: "translate", prompt: value, targetLang: lang }),
      });
      const data = await res.json() as { result?: string };
      if (data.result) { pushUndo(value); onChange(data.result); }
    } catch { /* ignore */ }
    finally { setTranslating(null); }
  }, [value, isTranslating, onChange, pushUndo]);

  // ── Keyboard shortcuts ──────────────────────────────────────────────────────
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const mod = e.ctrlKey || e.metaKey;
    if (mod && e.key === "Enter")                          { e.preventDefault(); onGenerate?.(); }
    if (mod && e.key.toLowerCase() === "l")               { e.preventDefault(); handleClear(); }
    if (mod && e.shiftKey && e.key.toUpperCase() === "O") { e.preventDefault(); handleOptimize(); }
    if (mod && !e.shiftKey && e.key.toLowerCase() === "z"){ e.preventDefault(); handleUndo(); }
    if (mod && (e.key.toLowerCase() === "y" || (e.shiftKey && e.key.toUpperCase() === "Z"))) {
      e.preventDefault(); handleRedo();
    }
  }, [onGenerate, handleClear, handleOptimize, handleUndo, handleRedo]);

  // ── Shared editor UI (normal + fullscreen) ──────────────────────────────────
  const renderEditor = (fsMode: boolean, fsRef?: React.RefObject<HTMLTextAreaElement | null>) => {
    const taRef = fsMode ? (fsRef ?? null) : textareaRef;
    const taH   = fsMode ? "calc(90vh - 380px)" : undefined;

    return (
      <>
        {/* Toolbar */}
        <div className="flex items-center gap-0.5 overflow-x-auto scrollbar-none pb-px">
          <TBtn onClick={handleCopy}              icon={<Copy     size={12} />} label="Copy"     disabled={!value} />
          <TBtn onClick={handleClear}             icon={<Trash2   size={12} />} label="Clear"    disabled={!value} />
          <TDiv />
          <TBtn onClick={handleUndo}              icon={<Undo2    size={12} />} label="Undo"     disabled={!canUndo} />
          <TBtn onClick={handleRedo}              icon={<Redo2    size={12} />} label="Redo"     disabled={!canRedo} />
          <TDiv />
          <TBtn onClick={handleOptimize}          icon={<Sparkles size={12} />} label="Optimize" loading={isOptimizing} disabled={!value.trim()} accent />
          <TBtn onClick={() => handleTranslate("en")} icon={<Languages size={12} />} label="→ EN"  loading={isTranslating === "en"} disabled={!value.trim()} />
          <TBtn onClick={() => handleTranslate("vi")} icon={<Languages size={12} />} label="→ VI"  loading={isTranslating === "vi"} disabled={!value.trim()} />
          <div className="ml-auto shrink-0">
            <TDiv />
          </div>
          <TBtn
            onClick={() => setFullscreen(f => !f)}
            icon={fsMode ? <Minimize2 size={12} /> : <Maximize2 size={12} />}
            label={fsMode ? "Thu lại" : "Mở rộng"}
          />
        </div>

        {/* Textarea */}
        <div className="relative rounded-[var(--radius-md)] overflow-hidden">
          <textarea
            ref={taRef as React.RefObject<HTMLTextAreaElement>}
            value={value}
            onChange={e => {
              selStartRef.current = e.target.selectionStart;
              selEndRef.current   = e.target.selectionEnd;
              handleChange(e.target.value);
            }}
            onSelect={e => {
              const t = e.target as HTMLTextAreaElement;
              selStartRef.current = t.selectionStart;
              selEndRef.current   = t.selectionEnd;
            }}
            onBlur={saveToHistory}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            aria-label="Hero image prompt"
            aria-describedby="prompt-hint"
            style={{
              height:    taH ?? `${MIN_H}px`,
              minHeight: `${MIN_H}px`,
              overflowY: "hidden",
              transition: "height 200ms ease",
            }}
            className={cn(
              "w-full resize-none",
              "text-[13.5px] text-[var(--fg-default)] bg-[var(--bg-surface-1)]",
              "border rounded-[var(--radius-md)] outline-none",
              "px-3 py-2.5 pb-7 leading-relaxed",
              "transition-[border-color,box-shadow] duration-150",
              "disabled:opacity-50 disabled:pointer-events-none",
              "border-[var(--border-default)] focus:border-[var(--brand-default)] focus:[box-shadow:var(--input-focus-shadow)]",
            )}
          />

          {/* Multi-line placeholder overlay */}
          {!value && (
            <div
              aria-hidden="true"
              className="absolute top-0 left-0 right-0 bottom-7 pointer-events-none overflow-hidden px-3 py-2.5 text-[13.5px] text-[var(--fg-subtle)] leading-relaxed whitespace-pre-wrap"
            >
              {PLACEHOLDER}
            </div>
          )}

          {/* Character counter */}
          <span
            className={cn(
              "absolute bottom-2 right-3 text-[10.5px] select-none pointer-events-none tabular-nums",
              chars >= WARN_AT ? "text-red-400" : "text-[var(--fg-subtle)]",
            )}
          >
            {chars.toLocaleString("vi-VN")} / {MAX_CHARS.toLocaleString("vi-VN")}
          </span>
        </div>

        {/* Stats bar */}
        <div className="flex items-center gap-3 px-3 py-2 rounded-[var(--radius-md)] bg-[var(--bg-surface-1)] border border-[var(--border-default)]">
          <StatBadge label="Ký tự"    value={chars}  />
          <div className="w-px h-7 bg-[var(--border-default)]" />
          <StatBadge label="Từ"       value={words}  />
          <div className="w-px h-7 bg-[var(--border-default)]" />
          <StatBadge label="~Tokens"  value={tokens} />
          {missing.length > 0 && (
            <button
              type="button"
              onClick={() => setShowWarnings(w => !w)}
              className="ml-auto flex items-center gap-1 text-[10.5px] text-amber-400 hover:text-amber-300 transition-colors"
              title="Gợi ý cải thiện prompt"
            >
              <AlertCircle size={11} />
              <span>{missing.length} gợi ý</span>
              {showWarnings ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
            </button>
          )}
        </div>

        {/* Warnings */}
        {showWarnings && missing.length > 0 && (
          <div className="rounded-[var(--radius-md)] border border-amber-500/20 bg-amber-500/5 p-3 space-y-1.5">
            <p className="text-[10px] font-semibold text-amber-400 uppercase tracking-widest">
              Gợi ý thêm chi tiết
            </p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
              {missing.map(c => (
                <div key={c.id} className="flex items-center gap-2 text-[11px] text-[var(--fg-muted)]">
                  <span className="w-3 h-3 rounded-full border border-amber-500/40 shrink-0" />
                  {c.label}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Optimize confirm */}
        {optimizedPrompt && (
          <div className="rounded-[var(--radius-md)] border border-[var(--brand-default)]/25 bg-[var(--brand-default)]/5 p-3 space-y-2.5">
            <div className="flex items-center justify-between">
              <p className="flex items-center gap-1.5 text-[11px] font-semibold text-[var(--brand-default)]">
                <Sparkles size={11} />
                Prompt đã tối ưu
              </p>
              <button
                type="button"
                onClick={() => setOptimized(null)}
                className="p-0.5 rounded text-[var(--fg-subtle)] hover:text-[var(--fg-default)] transition-colors"
                aria-label="Đóng"
              >
                <X size={13} />
              </button>
            </div>
            <div className="max-h-[160px] overflow-y-auto rounded p-2.5 bg-[var(--bg-surface-0)] text-[12px] text-[var(--fg-default)] leading-relaxed whitespace-pre-wrap">
              {optimizedPrompt}
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={applyOptimized}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded text-[11.5px] font-medium bg-[var(--brand-default)] text-white hover:opacity-90 transition-opacity"
              >
                <Check size={12} />
                Dùng bản tối ưu
              </button>
              <button
                type="button"
                onClick={() => setOptimized(null)}
                className="px-3 py-1.5 rounded text-[11.5px] text-[var(--fg-muted)] hover:text-[var(--fg-default)] hover:bg-[var(--bg-surface-2)] transition-colors"
              >
                Hủy
              </button>
            </div>
          </div>
        )}

        {/* Quick Insert */}
        <div className="space-y-1.5">
          <p className="text-[9.5px] font-semibold text-[var(--fg-subtle)] uppercase tracking-widest">
            Quick Insert
          </p>
          <div className="flex flex-wrap gap-1.5">
            {CHIPS.map(chip => (
              <button
                key={chip.label}
                type="button"
                onClick={() => insertAtCursor(chip.value)}
                disabled={disabled}
                className={cn(
                  "px-2 py-0.5 rounded-full text-[11px]",
                  "border border-[var(--border-default)] bg-[var(--bg-surface-1)]",
                  "text-[var(--fg-muted)] hover:text-[var(--fg-default)]",
                  "hover:border-[var(--brand-default)]/50 hover:bg-[var(--brand-default)]/5",
                  "transition-colors duration-150 disabled:opacity-40 disabled:pointer-events-none",
                )}
              >
                {chip.label}
              </button>
            ))}
          </div>
        </div>

        {/* Prompt history */}
        <div>
          <button
            type="button"
            onClick={() => setShowHistory(h => !h)}
            className="flex items-center gap-1.5 text-[10.5px] text-[var(--fg-subtle)] hover:text-[var(--fg-default)] transition-colors"
          >
            <History size={11} />
            <span>Lịch sử prompt ({history.length})</span>
            {showHistory ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
          </button>

          {showHistory && (
            <div className="mt-2 space-y-1.5 max-h-[200px] overflow-y-auto pr-0.5">
              {history.length === 0 && (
                <p className="text-[11px] text-[var(--fg-subtle)] px-1">Chưa có lịch sử.</p>
              )}
              {history.map(item => (
                <div
                  key={item.id}
                  className="flex items-start gap-2 p-2 rounded border border-[var(--border-default)] bg-[var(--bg-surface-1)] group hover:border-[var(--brand-default)]/30 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] text-[var(--fg-default)] line-clamp-2 leading-relaxed">
                      {item.text}
                    </p>
                    <p className="text-[9.5px] text-[var(--fg-subtle)] mt-0.5">
                      {item.date}{item.campaignName ? ` · ${item.campaignName}` : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      title="Khôi phục"
                      onClick={() => { pushUndo(value); onChange(item.text); }}
                      className="p-1 rounded text-[var(--fg-muted)] hover:text-[var(--brand-default)] hover:bg-[var(--brand-default)]/10 transition-colors"
                    >
                      <Undo2 size={11} />
                    </button>
                    <button
                      type="button"
                      title="Xoá"
                      onClick={() => deleteHistoryItem(item.id)}
                      className="p-1 rounded text-[var(--fg-muted)] hover:text-red-400 hover:bg-red-400/10 transition-colors"
                    >
                      <X size={11} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </>
    );
  };

  // ── Fullscreen overlay ──────────────────────────────────────────────────────
  const FullscreenPortal = () => {
    const fsRef = useRef<HTMLTextAreaElement>(null);
    return createPortal(
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Prompt Studio — Toàn màn hình"
        tabIndex={-1}
        onKeyDown={e => { if (e.key === "Escape") setFullscreen(false); }}
        onClick={e => { if (e.target === e.currentTarget) setFullscreen(false); }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      >
        <div className="relative flex flex-col w-[90vw] max-w-4xl h-[90vh] bg-[var(--bg-surface-0)] rounded-[var(--radius-lg)] border border-[var(--border-default)] shadow-2xl overflow-hidden">
          {/* FS header */}
          <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-[var(--border-default)] shrink-0">
            <div className="flex items-center gap-2">
              <Sparkles size={14} className="text-[var(--brand-default)]" />
              <span className="text-[14px] font-semibold text-[var(--fg-default)]">
                Hero Image Prompt Studio
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[10.5px] text-[var(--fg-subtle)]">ESC để đóng</span>
              <button
                type="button"
                onClick={() => setFullscreen(false)}
                aria-label="Đóng"
                className="p-1.5 rounded hover:bg-[var(--bg-surface-2)] text-[var(--fg-muted)] hover:text-[var(--fg-default)] transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* FS body */}
          <div className="flex-1 overflow-y-auto min-h-0 p-4 space-y-3">
            {renderEditor(true, fsRef)}
          </div>
        </div>
      </div>,
      document.body,
    );
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div
      className="space-y-2"
      role="region"
      aria-label="Hero Image Prompt Studio"
      id="prompt-hint"
    >
      {/* Header */}
      <div>
        <div className="flex items-center gap-1.5 text-[13px] font-semibold text-[var(--fg-default)]">
          <Sparkles size={13} className="text-[var(--brand-default)] shrink-0" />
          <span>Hero Image Prompt</span>
        </div>
        <p className="text-[11px] text-[var(--fg-muted)] mt-0.5 ml-[19px]">
          Mô tả chi tiết hình ảnh AI sẽ tạo cho Banner.
        </p>
      </div>

      {renderEditor(false)}

      {isMounted && isFullscreen && <FullscreenPortal />}
    </div>
  );
}
