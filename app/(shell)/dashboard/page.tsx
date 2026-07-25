"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  Target, Sparkles, Image, Video, Palette, PenTool, Archive, FolderOpen,
  TrendingUp, Clock, Star, ArrowRight, Plus, CheckCircle2, Zap,
  Bell, BarChart2, GitBranch, Rocket, ChevronRight, ChevronLeft,
} from "lucide-react";
import { Card, PanelSection } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatusBadge, StatusDot } from "@/components/ui/status-indicator";
import { ProgressBar } from "@/components/ui/progress";
import { Avatar, AvatarGroup } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { SectionDivider } from "@/components/ui/section";
import { useRightPanel } from "@/contexts/right-panel-context";

/* ═══════════════════════════════════════════════
   HERO CAROUSEL — Slide Illustrations (SVG)
═══════════════════════════════════════════════ */

function BrandCheckerIllus() {
  return (
    <svg viewBox="0 0 300 280" width="300" height="280" aria-hidden="true">
      <circle cx="150" cy="140" r="122" fill="none" stroke="white" strokeOpacity="0.06" strokeWidth="1" strokeDasharray="4 8"/>
      <circle cx="150" cy="140" r="86"  fill="none" stroke="white" strokeOpacity="0.09" strokeWidth="1" strokeDasharray="3 5"/>
      <circle cx="150" cy="140" r="54"  fill="white" fillOpacity="0.05"/>
      {/* Shield */}
      <path d="M150 46 L206 70 V137 C206 171 180 198 150 212 C120 198 94 171 94 137 V70 Z"
        fill="white" fillOpacity="0.09" stroke="white" strokeOpacity="0.4" strokeWidth="1.5"/>
      <path d="M150 62 L196 82 V137 C196 165 174 188 150 199 C126 188 104 165 104 137 V82 Z"
        fill="white" fillOpacity="0.05"/>
      {/* Checkmark */}
      <path d="M127 139 L143 155 L175 117" stroke="#00cf6a" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      {/* Score badge */}
      <circle cx="240" cy="80" r="28" fill="white" fillOpacity="0.12" stroke="white" strokeOpacity="0.22" strokeWidth="1"/>
      <text x="240" y="75" textAnchor="middle" fill="white" fontSize="13" fontWeight="700">9.2</text>
      <text x="240" y="90" textAnchor="middle" fill="white" fontSize="9" fillOpacity="0.65">SCORE</text>
      {/* Pass tag */}
      <rect x="42" y="183" width="82" height="26" rx="13" fill="white" fillOpacity="0.12" stroke="#00cf6a" strokeOpacity="0.55" strokeWidth="1"/>
      <text x="83" y="200" textAnchor="middle" fill="#00cf6a" fontSize="10" fontWeight="700">✓ PASS</text>
      {/* Dot grid */}
      {Array.from({ length: 9 }).map((_, i) => (
        <circle key={i} cx={249 + (i % 3) * 15} cy={180 + Math.floor(i / 3) * 15} r="2.5" fill="white" fillOpacity="0.14"/>
      ))}
    </svg>
  );
}

function BannerGeneratorIllus() {
  return (
    <svg viewBox="0 0 300 280" width="300" height="280" aria-hidden="true">
      {/* 16:9 main banner */}
      <rect x="48" y="58" width="204" height="114" rx="10" fill="white" fillOpacity="0.09" stroke="white" strokeOpacity="0.32" strokeWidth="1.5"/>
      <rect x="60" y="70" width="76" height="12" rx="4" fill="white" fillOpacity="0.28"/>
      <rect x="60" y="88" width="54" height="8" rx="3" fill="white" fillOpacity="0.16"/>
      <rect x="60" y="103" width="42" height="22" rx="6" fill="#00cf6a" fillOpacity="0.7"/>
      <rect x="150" y="70" width="88" height="90" rx="7" fill="white" fillOpacity="0.07"/>
      <circle cx="194" cy="115" r="24" fill="white" fillOpacity="0.09"/>
      {/* Label */}
      <rect x="88" y="182" width="48" height="18" rx="9" fill="white" fillOpacity="0.14"/>
      <text x="112" y="195" textAnchor="middle" fill="white" fontSize="9" fontWeight="600">16 : 9</text>
      {/* 1:1 frame */}
      <rect x="216" y="155" width="68" height="68" rx="8" fill="white" fillOpacity="0.07" stroke="white" strokeOpacity="0.18" strokeWidth="1"/>
      <rect x="226" y="165" width="48" height="48" rx="4" fill="white" fillOpacity="0.05"/>
      <rect x="236" y="192" width="28" height="11" rx="5.5" fill="#00cf6a" fillOpacity="0.55"/>
      <rect x="238" y="213" width="24" height="16" rx="8" fill="white" fillOpacity="0.12"/>
      <text x="250" y="225" textAnchor="middle" fill="white" fontSize="8" fontWeight="600">1:1</text>
      {/* 9:16 story */}
      <rect x="14" y="150" width="56" height="100" rx="8" fill="white" fillOpacity="0.07" stroke="white" strokeOpacity="0.18" strokeWidth="1"/>
      <rect x="24" y="160" width="36" height="80" rx="4" fill="white" fillOpacity="0.05"/>
      <rect x="29" y="240" width="26" height="10" rx="5" fill="white" fillOpacity="0.22"/>
      <text x="42" y="249" textAnchor="middle" fill="white" fontSize="8" fontWeight="600">9:16</text>
      {/* Palette dots */}
      {["#0033c9", "#00cf6a", "#f59e0b", "#ffffff", "#e53e3e"].map((color, i) => (
        <circle key={color} cx={88 + i * 23} cy={258} r="8" fill={color} fillOpacity="0.85" stroke="white" strokeOpacity="0.18" strokeWidth="1"/>
      ))}
    </svg>
  );
}

function ImageGeneratorIllus() {
  const sparkles = [
    { x: 60,  y: 88,  s: 1.2 },
    { x: 256, y: 72,  s: 0.9 },
    { x: 250, y: 178, s: 1.0 },
    { x: 76,  y: 198, s: 0.8 },
    { x: 156, y: 32,  s: 1.1 },
  ];
  return (
    <svg viewBox="0 0 300 280" width="300" height="280" aria-hidden="true">
      {/* Image frame */}
      <rect x="58" y="42" width="184" height="162" rx="14" fill="white" fillOpacity="0.09" stroke="white" strokeOpacity="0.32" strokeWidth="1.5"/>
      {/* Camera notch */}
      <rect x="126" y="34" width="48" height="18" rx="9" fill="white" fillOpacity="0.17"/>
      <circle cx="150" cy="43" r="4.5" fill="white" fillOpacity="0.28"/>
      {/* Preview areas */}
      <rect x="70" y="56" width="160" height="138" rx="8" fill="white" fillOpacity="0.04"/>
      <rect x="78" y="64" width="92" height="66" rx="6" fill="#0044cc" fillOpacity="0.4"/>
      <rect x="178" y="64" width="44" height="66" rx="6" fill="#00cf6a" fillOpacity="0.28"/>
      <rect x="78" y="138" width="144" height="48" rx="6" fill="white" fillOpacity="0.06"/>
      <rect x="86" y="148" width="72" height="7" rx="3.5" fill="white" fillOpacity="0.18"/>
      <rect x="86" y="160" width="52" height="7" rx="3.5" fill="white" fillOpacity="0.11"/>
      {/* Sparkles */}
      {sparkles.map(({ x, y, s }, i) => (
        <g key={i} transform={`translate(${x},${y}) scale(${s})`}>
          <path d="M0-9 L2.1-2.1 L9 0 L2.1 2.1 L0 9 L-2.1 2.1 L-9 0 L-2.1-2.1 Z" fill="#00cf6a" fillOpacity="0.85"/>
        </g>
      ))}
      {/* AI badge */}
      <rect x="93" y="218" width="114" height="34" rx="17" fill="white" fillOpacity="0.14" stroke="white" strokeOpacity="0.28" strokeWidth="1"/>
      <text x="150" y="240" textAnchor="middle" fill="white" fontSize="11" fontWeight="700">✦ AI Generated</text>
    </svg>
  );
}

function VideoGeneratorIllus() {
  const wave = [20, 32, 26, 44, 52, 36, 28, 46, 54, 38, 22, 32, 42, 28, 36];
  return (
    <svg viewBox="0 0 300 280" width="300" height="280" aria-hidden="true">
      {/* Rings */}
      <circle cx="150" cy="128" r="116" fill="none" stroke="white" strokeOpacity="0.05" strokeWidth="1" strokeDasharray="3 8"/>
      <circle cx="150" cy="128" r="80"  fill="none" stroke="white" strokeOpacity="0.08" strokeWidth="1"/>
      {/* Play glow */}
      <circle cx="150" cy="128" r="58" fill="white" fillOpacity="0.08"/>
      <circle cx="150" cy="128" r="50" fill="white" fillOpacity="0.14" stroke="white" strokeOpacity="0.38" strokeWidth="1.5"/>
      {/* Play triangle */}
      <path d="M139 110 L178 128 L139 146 Z" fill="white" fillOpacity="0.95"/>
      {/* Film strip */}
      {[-2, -1, 0, 1, 2].map((n) => (
        <g key={n}>
          <rect x={110 + n * 22} y={32} width="18" height="28" rx="3"
            fill="white" fillOpacity={n === 0 ? 0.22 : 0.08}
            stroke="white" strokeOpacity={n === 0 ? 0.45 : 0.18} strokeWidth="1"/>
          <rect x={113 + n * 22} y={35} width="5" height="6" rx="1" fill="white" fillOpacity="0.25"/>
          <rect x={121 + n * 22} y={35} width="5" height="6" rx="1" fill="white" fillOpacity="0.25"/>
        </g>
      ))}
      {/* Waveform */}
      {wave.map((h, i) => (
        <rect key={i}
          x={50 + i * 13.5} y={254 - h / 2}
          width="9" height={h} rx="4.5"
          fill="#00cf6a" fillOpacity={0.45 + (i % 5) * 0.1}
        />
      ))}
      {/* Duration badge */}
      <rect x="188" y="170" width="56" height="24" rx="12" fill="white" fillOpacity="0.14"/>
      <text x="216" y="186" textAnchor="middle" fill="white" fontSize="10" fontWeight="600">00:30</text>
    </svg>
  );
}

/* ─── Slide data ─── */
type SlideData = {
  id: string;
  tag: string;
  headline: string;
  desc: string;
  primaryCTA: { label: string; href: string };
  secondaryCTA: { label: string };
  gradient: string;
  Illustration: React.ComponentType;
};

const SLIDES: SlideData[] = [
  {
    id: "brand-checker",
    tag: "Tính năng chính",
    headline: "AI Brand Guideline\nChecker",
    desc: "Phân tích tự động theo 42+ tiêu chuẩn ZaloPay — màu sắc, font, bố cục và tỷ lệ logo. Kết quả ngay lập tức.",
    primaryCTA: { label: "Bắt đầu phân tích", href: "/brand-checker" },
    secondaryCTA: { label: "Xem demo" },
    gradient: "linear-gradient(135deg, #001266 0%, #0033c9 52%, #003ee6 100%)",
    Illustration: BrandCheckerIllus,
  },
  {
    id: "banner-generator",
    tag: "Tạo nội dung",
    headline: "AI Banner\nGenerator",
    desc: "Tạo banner quảng cáo đúng chuẩn ZaloPay trong vài giây — hỗ trợ 12+ định dạng, 40+ template có sẵn.",
    primaryCTA: { label: "Tạo banner ngay", href: "/banner-generator" },
    secondaryCTA: { label: "Duyệt template" },
    gradient: "linear-gradient(135deg, #080830 0%, #0022a8 42%, #0033c9 68%, #1a44dd 100%)",
    Illustration: BannerGeneratorIllus,
  },
  {
    id: "image-generator",
    tag: "AI Image",
    headline: "AI Image\nGenerator",
    desc: "Sinh hình ảnh sáng tạo từ văn bản với Imagen 3 — phong cách thương hiệu, tỷ lệ linh hoạt, 4K output.",
    primaryCTA: { label: "Tạo ảnh AI", href: "/image-generator" },
    secondaryCTA: { label: "Xem gallery" },
    gradient: "linear-gradient(135deg, #003060 0%, #0033c9 42%, #0066b2 76%, #0088cc 100%)",
    Illustration: ImageGeneratorIllus,
  },
  {
    id: "video-generator",
    tag: "Sắp ra mắt",
    headline: "AI Video\nGenerator",
    desc: "Tự động tạo video marketing từ script với Veo 2 — social formats, caption thông minh và nhạc nền tích hợp.",
    primaryCTA: { label: "Đăng ký sớm", href: "/video-generator" },
    secondaryCTA: { label: "Tìm hiểu thêm" },
    gradient: "linear-gradient(135deg, #0c0d2e 0%, #0a1870 32%, #0033c9 66%, #1948c0 100%)",
    Illustration: VideoGeneratorIllus,
  },
];

/* ─── Hero Carousel component ─── */
function HeroCarousel() {
  const [active, setActive] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchX = useRef(0);

  useEffect(() => {
    if (isPaused) return;
    const id = setInterval(() => setActive((a) => (a + 1) % SLIDES.length), 5000);
    return () => clearInterval(id);
  }, [isPaused, active]);

  const prev = () => setActive((a) => (a - 1 + SLIDES.length) % SLIDES.length);
  const next = () => setActive((a) => (a + 1) % SLIDES.length);

  return (
    <div
      className="relative overflow-hidden select-none"
      style={{ height: 420 }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={(e) => { touchX.current = e.touches[0].clientX; }}
      onTouchEnd={(e) => {
        const dx = e.changedTouches[0].clientX - touchX.current;
        if (dx < -50) next();
        if (dx > 50) prev();
      }}
    >
      {SLIDES.map((slide, i) => {
        const Illus = slide.Illustration;
        return (
          <div
            key={slide.id}
            className="absolute inset-0 transition-transform duration-500 ease-in-out"
            style={{ transform: `translateX(${(i - active) * 100}%)`, background: slide.gradient }}
            aria-hidden={i !== active}
          >
            {/* Ambient glow orbs */}
            <div
              className="absolute -top-28 -right-20 w-96 h-96 rounded-full blur-3xl pointer-events-none"
              style={{ background: "#00cf6a", opacity: 0.18 }}
            />
            <div
              className="absolute -bottom-28 -left-16 w-80 h-80 rounded-full blur-3xl pointer-events-none"
              style={{ background: "#4466ff", opacity: 0.14 }}
            />

            {/* Content */}
            <div className="relative z-10 h-full max-w-6xl mx-auto px-8 md:px-14 grid grid-cols-1 lg:grid-cols-2 gap-0 items-center">
              {/* Text column */}
              <div className="flex flex-col gap-4 max-w-lg">
                {/* Tag chip */}
                <span className="inline-flex items-center self-start gap-1.5 px-3 py-1 rounded-full text-[10.5px] font-bold uppercase tracking-widest text-white/80" style={{ background: "rgba(255,255,255,0.12)" }}>
                  <Sparkles size={9} />
                  {slide.tag}
                </span>
                {/* Headline */}
                <h2
                  className="text-[38px] font-black text-white leading-tight tracking-tight whitespace-pre-line"
                  style={{ textShadow: "0 2px 20px rgba(0,0,0,0.2)" }}
                >
                  {slide.headline}
                </h2>
                {/* Description */}
                <p className="text-[14.5px] leading-relaxed text-white/72">
                  {slide.desc}
                </p>
                {/* CTAs */}
                <div className="flex items-center gap-3 flex-wrap pt-1">
                  <Link
                    href={slide.primaryCTA.href}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[var(--radius-lg)] text-[13.5px] font-bold bg-white text-[#0033c9] hover:bg-white/92 transition-colors shadow-lg"
                  >
                    {slide.primaryCTA.label}
                    <ArrowRight size={14} />
                  </Link>
                  <button className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[var(--radius-lg)] text-[13.5px] font-semibold text-white border border-white/40 hover:bg-white/10 transition-colors">
                    {slide.secondaryCTA.label}
                  </button>
                </div>
              </div>

              {/* Illustration column */}
              <div className="hidden lg:flex items-center justify-center">
                <Illus />
              </div>
            </div>
          </div>
        );
      })}

      {/* Prev / Next arrows */}
      <button
        onClick={prev}
        aria-label="Previous slide"
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full flex items-center justify-center text-white backdrop-blur-sm transition-colors"
        style={{ background: "rgba(255,255,255,0.12)" }}
        onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.22)")}
        onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.12)")}
      >
        <ChevronLeft size={18} />
      </button>
      <button
        onClick={next}
        aria-label="Next slide"
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full flex items-center justify-center text-white backdrop-blur-sm transition-colors"
        style={{ background: "rgba(255,255,255,0.12)" }}
        onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.22)")}
        onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.12)")}
      >
        <ChevronRight size={18} />
      </button>

      {/* Dot indicators */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => { setActive(i); setIsPaused(false); }}
            aria-label={`Slide ${i + 1}`}
            className="rounded-full bg-white transition-all duration-300"
            style={{
              width: i === active ? 24 : 8,
              height: 8,
              opacity: i === active ? 1 : 0.35,
            }}
          />
        ))}
      </div>

      {/* Slide counter */}
      <div className="absolute bottom-5 right-7 z-20 text-white/45 text-[12px] font-mono tabular-nums">
        0{active + 1} <span className="opacity-50">/</span> 0{SLIDES.length}
      </div>

      {/* Progress line */}
      <div className="absolute bottom-0 left-0 right-0 h-[2px]" style={{ background: "rgba(255,255,255,0.08)" }}>
        <div
          className="h-full transition-all duration-300"
          style={{ width: `${((active + 1) / SLIDES.length) * 100}%`, background: "rgba(255,255,255,0.35)" }}
        />
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   FEATURE CARDS
═══════════════════════════════════════════════ */
const FEATURE_CARDS = [
  {
    id: "brand-checker",
    Icon: Target,
    title: "AI Brand Guideline Checker",
    desc: "Phân tích hình ảnh tự động theo 42+ tiêu chuẩn ZaloPay — màu sắc, font, bố cục và tỷ lệ logo.",
    cta: "Kiểm tra ngay",
    href: "/brand-checker",
    gradFrom: "#0033c9",
    gradTo: "#004ef0",
    available: true,
  },
  {
    id: "image-generator",
    Icon: Sparkles,
    title: "AI Image Generator",
    desc: "Sinh ảnh sáng tạo chất lượng cao từ mô tả văn bản. Tích hợp Imagen 3 với style matching thương hiệu.",
    cta: "Tạo ảnh AI",
    href: "/image-generator",
    gradFrom: "#0055aa",
    gradTo: "#0099cc",
    available: true,
  },
  {
    id: "video-generator",
    Icon: Video,
    title: "AI Video Generator",
    desc: "Tự động tạo video marketing từ script với Veo 2 — social formats, caption thông minh và nhạc nền.",
    cta: "Sắp ra mắt",
    href: "/video-generator",
    gradFrom: "#1a0a5c",
    gradTo: "#0033c9",
    available: false,
  },
];

/* ═══════════════════════════════════════════════
   MOCK DATA (existing)
═══════════════════════════════════════════════ */
const STATS = [
  { label: "Phân tích hôm nay",  value: "12",    delta: "+4",   color: "var(--brand-default)",   icon: Target },
  { label: "Tổng phân tích",     value: "248",   delta: "+18%", color: "var(--accent-default)",  icon: TrendingUp },
  { label: "Điểm TB (30 ngày)",  value: "7.8",   delta: "+0.5", color: "var(--warning-default)", icon: BarChart2 },
  { label: "Credits còn lại",    value: "9,160", delta: "91%",  color: "var(--success-default)", icon: Zap },
];

const RECENT_ACTIVITY = [
  { id: "1", icon: Target,   title: "Brand Analysis hoàn thành",   sub: "Banner Tết 2025.png — Score 8.5/10",   time: "2 phút",  badge: "success" },
  { id: "2", icon: Image,    title: "Banner đã tạo thành công",     sub: "4 biến thể Facebook 1200×628",         time: "14 phút", badge: "accent"  },
  { id: "3", icon: Target,   title: "Brand Analysis hoàn thành",   sub: "Holiday_Banner_v2.jpg — Score 6.2/10", time: "1 giờ",   badge: "warning" },
  { id: "4", icon: Sparkles, title: "Image generated",              sub: "ZaloPay Hero Banner — 4 variants",     time: "2 giờ",   badge: "accent"  },
  { id: "5", icon: Target,   title: "Brand Analysis hoàn thành",   sub: "Q4_Campaign.psd — Score 9.1/10",       time: "3 giờ",   badge: "success" },
  { id: "6", icon: PenTool,  title: "Prompt tối ưu hóa",           sub: "Marketing copy cho Tết 2025",          time: "5 giờ",   badge: "info"    },
];

const QUICK_MODULES = [
  { id: "brand-checker",    Icon: Target,   label: "Brand Checker",    desc: "Kiểm tra brand",  color: "var(--brand-default)",   bg: "var(--brand-subtle)",   available: true  },
  { id: "banner-generator", Icon: Image,    label: "Banner Generator", desc: "Tạo banner",      color: "var(--brand-default)",   bg: "var(--brand-subtle)",   available: true  },
  { id: "image-generator",  Icon: Sparkles, label: "Image Generator",  desc: "Sinh ảnh AI",     color: "var(--accent-default)",  bg: "var(--accent-subtle)",  available: true  },
  { id: "creative-studio",  Icon: Palette,  label: "Creative Studio",  desc: "Thiết kế AI",     color: "var(--warning-default)", bg: "var(--warning-subtle)", available: true  },
  { id: "prompt-studio",    Icon: PenTool,  label: "Prompt Studio",    desc: "Tối ưu prompt",   color: "var(--info-default)",    bg: "var(--info-subtle)",    available: true  },
  { id: "video-generator",  Icon: Video,    label: "Video Generator",  desc: "Video marketing", color: "var(--fg-subtle)",       bg: "var(--bg-surface-3)",   available: false },
];

const AI_MODELS = [
  { name: "Gemini 2.0 Flash", provider: "Google",    status: "online" as const, usage: 68, calls: "1,240" },
  { name: "Claude Sonnet 4.6",provider: "Anthropic", status: "online" as const, usage: 24, calls: "420"   },
  { name: "Imagen 3",          provider: "Google",    status: "online" as const, usage: 8,  calls: "86"    },
];

const RECENT_PROJECTS = [
  { id: "1", name: "Tết Nguyên Đán 2025", count: 24, color: "#0033c9", members: ["Ngọc NA", "Minh TT", "Lan PH"] },
  { id: "2", name: "Campaign Q1/2025",    count: 12, color: "#00cf6a", members: ["Ngọc NA", "Tuan LM"]           },
  { id: "3", name: "ZaloPay Rebrand",      count: 8,  color: "#f59e0b", members: ["Ngọc NA", "An DT", "Duc NQ"]  },
];

const ROADMAP = [
  { q: "Q1 2025", items: ["Video Generator",     "Team collaboration",    "Asset versioning"]   },
  { q: "Q2 2025", items: ["AI prompt optimizer", "Multi-language support","Canva integration"]  },
  { q: "Q3 2025", items: ["API marketplace",     "White-label export",    "Advanced analytics"] },
];

/* ─── Dashboard right panel ─── */
function DashboardPanel() {
  return (
    <div className="flex flex-col h-full">
      <div className="px-5 py-4 border-b border-[var(--border-default)]">
        <p className="text-[13px] font-semibold text-[var(--fg-default)]">Tổng quan tài khoản</p>
      </div>
      <div className="flex-1 overflow-y-auto">
        <div className="px-5 py-4 space-y-5">
          <PanelSection title="Credits sử dụng">
            <div className="space-y-3">
              <div className="flex items-center justify-between text-[13px]">
                <span className="text-[var(--fg-muted)]">Đã dùng</span>
                <span className="font-semibold text-[var(--fg-default)]">840 / 10,000</span>
              </div>
              <ProgressBar value={8.4} variant="brand" showValue={false} />
              <p className="text-[11.5px] text-[var(--fg-subtle)]">Reset vào ngày 01/02/2025</p>
            </div>
          </PanelSection>

          <PanelSection title="Trạng thái hệ thống">
            <div className="space-y-2">
              {[
                { label: "API Gateway",   ok: true  },
                { label: "AI Models",     ok: true  },
                { label: "Asset Storage", ok: true  },
                { label: "Analytics",     ok: false },
              ].map(({ label, ok }) => (
                <div key={label} className="flex items-center justify-between">
                  <span className="text-[13px] text-[var(--fg-muted)]">{label}</span>
                  <StatusDot status={ok ? "online" : "warning"} />
                </div>
              ))}
            </div>
          </PanelSection>

          <PanelSection title="Hoạt động nhóm">
            <div className="space-y-2">
              {[
                { name: "Ngọc NA", action: "Tạo banner",     time: "2m"  },
                { name: "Minh TT", action: "Brand analysis", time: "14m" },
                { name: "Lan PH",  action: "Upload asset",   time: "1h"  },
              ].map(({ name, action, time }) => (
                <div key={name} className="flex items-center gap-2.5">
                  <Avatar size="xs" name={name} />
                  <div className="flex-1 min-w-0">
                    <p className="text-[12.5px] font-medium text-[var(--fg-default)] truncate">{name}</p>
                    <p className="text-[11px] text-[var(--fg-subtle)] truncate">{action}</p>
                  </div>
                  <span className="text-[11px] text-[var(--fg-subtle)] shrink-0">{time}</span>
                </div>
              ))}
            </div>
          </PanelSection>

          <PanelSection title="Thông báo quan trọng">
            <div className="space-y-2">
              {[
                { text: "Brand guideline ZaloPay v2.4 đã được cập nhật", icon: Bell },
                { text: "42 template Tết 2025 đã sẵn sàng",              icon: Star },
              ].map(({ text, icon: Icon }) => (
                <div key={text} className="flex items-start gap-2 p-2.5 rounded-[var(--radius-md)] bg-[var(--bg-surface-2)]">
                  <Icon size={13} className="text-[var(--brand-default)] mt-0.5 shrink-0" />
                  <p className="text-[12px] text-[var(--fg-muted)] leading-relaxed">{text}</p>
                </div>
              ))}
            </div>
          </PanelSection>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   PAGE
═══════════════════════════════════════════════ */
export default function DashboardPage() {
  const { setContent } = useRightPanel();
  useEffect(() => {
    setContent(<DashboardPanel />);
    return () => setContent(null);
  }, [setContent]);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Chào buổi sáng" : hour < 18 ? "Chào buổi chiều" : "Chào buổi tối";

  return (
    <div>
      {/* ── Hero Carousel ── */}
      <HeroCarousel />

      {/* ── Padded content ── */}
      <div className="p-6 max-w-5xl space-y-8">

        {/* ── Feature Cards ── */}
        <div>
          <p className="type-label text-[var(--fg-subtle)] mb-4">Khả năng AI nổi bật</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {FEATURE_CARDS.map(({ id, Icon, title, desc, cta, href, gradFrom, gradTo, available }) => (
              <div
                key={id}
                className={`relative bg-[var(--bg-surface-1)] border border-[var(--border-default)] rounded-[var(--radius-xl)] p-5 overflow-hidden group transition-all duration-200 ${available ? "hover:border-[var(--brand-default)] hover:shadow-[0_4px_20px_rgba(0,51,201,0.12)] cursor-pointer" : "opacity-70"}`}
              >
                {/* Hover glow */}
                <div
                  className="absolute -top-12 -right-12 w-36 h-36 rounded-full blur-2xl pointer-events-none opacity-0 group-hover:opacity-15 transition-opacity"
                  style={{ background: gradFrom }}
                />
                {/* Icon */}
                <div
                  className="w-12 h-12 rounded-[var(--radius-xl)] flex items-center justify-center mb-4"
                  style={{ background: `linear-gradient(135deg, ${gradFrom}, ${gradTo})` }}
                >
                  <Icon size={22} strokeWidth={1.8} className="text-white" />
                </div>
                {/* Content */}
                <h3 className="text-[14.5px] font-bold text-[var(--fg-default)] mb-2 leading-snug">{title}</h3>
                <p className="text-[12.5px] text-[var(--fg-muted)] leading-relaxed mb-4">{desc}</p>
                {/* CTA */}
                {available ? (
                  <Link
                    href={href}
                    className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[var(--brand-default)] hover:underline"
                  >
                    {cta} <ArrowRight size={13} />
                  </Link>
                ) : (
                  <Badge variant="default" size="sm">Sắp ra mắt</Badge>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ── Welcome ── */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-[24px] font-bold text-[var(--fg-default)] tracking-tight">
              {greeting}, Ngọc 👋
            </h1>
            <p className="text-[14px] text-[var(--fg-muted)] mt-1">
              Hôm nay bạn đã thực hiện <strong className="text-[var(--fg-default)]">12 phân tích</strong>. Nền tảng hoạt động tốt.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button variant="secondary" size="sm" icon={<FolderOpen size={14} />}>Dự án</Button>
            <Button variant="primary" size="sm" icon={<Plus size={14} />}>Tạo mới</Button>
          </div>
        </div>

        {/* ── Stats ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {STATS.map(({ label, value, delta, color, icon: Icon }) => (
            <Card key={label} variant="default" padding="md" interactive>
              <div className="flex items-center justify-between mb-3">
                <div
                  className="w-9 h-9 rounded-[var(--radius-lg)] flex items-center justify-center"
                  style={{ background: `color-mix(in srgb, ${color} 14%, transparent)` }}
                >
                  <Icon size={17} strokeWidth={1.8} style={{ color }} />
                </div>
                <Badge variant="success" size="sm">{delta}</Badge>
              </div>
              <div className="text-[26px] font-bold text-[var(--fg-default)] leading-none mb-1 tabular-nums">{value}</div>
              <div className="text-[12px] text-[var(--fg-muted)]">{label}</div>
            </Card>
          ))}
        </div>

        {/* ── Quick modules ── */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <p className="type-label text-[var(--fg-subtle)]">Modules</p>
            <Link href="/brand-checker" className="text-[12.5px] text-[var(--brand-default)] hover:underline flex items-center gap-1">
              Xem tất cả <ChevronRight size={12} />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {QUICK_MODULES.map(({ id, Icon, label, desc, color, bg, available }) => (
              available ? (
                <Link key={id} href={`/${id}`}>
                  <Card variant="default" padding="sm" interactive className="text-center h-full">
                    <div className="w-10 h-10 rounded-[var(--radius-xl)] mx-auto mb-2.5 flex items-center justify-center" style={{ background: bg }}>
                      <Icon size={18} strokeWidth={1.8} style={{ color }} />
                    </div>
                    <p className="text-[12.5px] font-semibold text-[var(--fg-default)] leading-tight">{label}</p>
                    <p className="text-[11px] text-[var(--fg-subtle)] mt-0.5">{desc}</p>
                  </Card>
                </Link>
              ) : (
                <Card key={id} variant="flat" padding="sm" className="text-center opacity-50">
                  <div className="w-10 h-10 rounded-[var(--radius-xl)] mx-auto mb-2.5 bg-[var(--bg-surface-3)] flex items-center justify-center">
                    <Icon size={18} strokeWidth={1.8} className="text-[var(--fg-subtle)]" />
                  </div>
                  <p className="text-[12.5px] font-semibold text-[var(--fg-default)] leading-tight">{label}</p>
                  <Badge variant="default" size="sm" className="mt-1 mx-auto">Soon</Badge>
                </Card>
              )
            ))}
          </div>
        </div>

        <SectionDivider />

        {/* ── Recent activity + Recent projects ── */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3">
            <div className="flex items-center justify-between mb-4">
              <p className="type-label text-[var(--fg-subtle)]">Hoạt động gần đây</p>
              <Link href="/history" className="text-[12.5px] text-[var(--brand-default)] hover:underline flex items-center gap-1">
                Xem tất cả <ChevronRight size={12} />
              </Link>
            </div>
            <Card variant="default" padding="none">
              {RECENT_ACTIVITY.map((item, i) => {
                const Icon = item.icon;
                return (
                  <div key={item.id} className={`flex items-start gap-3 px-4 py-3.5 ${i < RECENT_ACTIVITY.length - 1 ? "border-b border-[var(--border-subtle)]" : ""} hover:bg-[var(--bg-surface-2)] transition-colors cursor-pointer`}>
                    <div className="w-7 h-7 rounded-[var(--radius-md)] bg-[var(--bg-surface-3)] flex items-center justify-center shrink-0 mt-0.5">
                      <Icon size={13} strokeWidth={1.8} className="text-[var(--fg-muted)]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-medium text-[var(--fg-default)] truncate">{item.title}</p>
                      <p className="text-[12px] text-[var(--fg-subtle)] truncate">{item.sub}</p>
                    </div>
                    <p className="text-[11px] text-[var(--fg-subtle)] shrink-0">{item.time}</p>
                  </div>
                );
              })}
            </Card>
          </div>

          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <p className="type-label text-[var(--fg-subtle)]">Dự án gần đây</p>
              <Link href="/projects" className="text-[12.5px] text-[var(--brand-default)] hover:underline flex items-center gap-1">
                Xem tất cả <ChevronRight size={12} />
              </Link>
            </div>
            <div className="space-y-3">
              {RECENT_PROJECTS.map((p) => (
                <Card key={p.id} variant="default" padding="sm" interactive>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-[var(--radius-lg)] flex items-center justify-center shrink-0 text-white text-[11px] font-bold" style={{ background: `linear-gradient(135deg, ${p.color}, ${p.color}99)` }}>
                      {p.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-semibold text-[var(--fg-default)] truncate">{p.name}</p>
                      <p className="text-[11px] text-[var(--fg-subtle)]">{p.count} files</p>
                    </div>
                    <AvatarGroup avatars={p.members.map((m) => ({ name: m }))} size="xs" max={3} />
                  </div>
                </Card>
              ))}
              <Link href="/projects">
                <Card variant="flat" padding="sm" interactive>
                  <div className="flex items-center gap-2 text-[var(--fg-muted)] hover:text-[var(--brand-default)] transition-colors">
                    <Plus size={14} />
                    <span className="text-[13px]">Tạo dự án mới</span>
                  </div>
                </Card>
              </Link>
            </div>
          </div>
        </div>

        <SectionDivider />

        {/* ── AI Models + Roadmap ── */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-2">
            <p className="type-label text-[var(--fg-subtle)] mb-4">Mô hình AI</p>
            <div className="space-y-3">
              {AI_MODELS.map((m) => (
                <Card key={m.name} variant="default" padding="sm">
                  <div className="flex items-center gap-3 mb-2">
                    <StatusDot status={m.status} />
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-medium text-[var(--fg-default)] truncate">{m.name}</p>
                      <p className="text-[11px] text-[var(--fg-subtle)]">{m.provider} · {m.calls} calls</p>
                    </div>
                  </div>
                  <ProgressBar value={m.usage} variant="brand" size="xs" />
                </Card>
              ))}
            </div>
          </div>

          <div className="lg:col-span-3">
            <p className="type-label text-[var(--fg-subtle)] mb-4">Roadmap</p>
            <Card variant="default" padding="none">
              {ROADMAP.map((r, ri) => (
                <div key={r.q} className={`px-5 py-4 ${ri < ROADMAP.length - 1 ? "border-b border-[var(--border-subtle)]" : ""}`}>
                  <div className="flex items-center gap-2 mb-2.5">
                    <Badge variant="primary" size="sm">{r.q}</Badge>
                    <GitBranch size={12} className="text-[var(--fg-subtle)]" />
                  </div>
                  <div className="space-y-1.5">
                    {r.items.map((item) => (
                      <div key={item} className="flex items-center gap-2">
                        <div className="w-1 h-1 rounded-full bg-[var(--fg-subtle)] shrink-0" />
                        <span className="text-[13px] text-[var(--fg-muted)]">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              <div className="px-5 py-3 border-t border-[var(--border-default)] flex items-center justify-between">
                <span className="text-[12px] text-[var(--fg-subtle)]">Vote cho tính năng bạn muốn</span>
                <button className="text-[12.5px] font-medium text-[var(--brand-default)] hover:underline flex items-center gap-1">
                  <Rocket size={12} />
                  Đề xuất
                </button>
              </div>
            </Card>
          </div>
        </div>

        {/* ── Team & Favorites ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <div className="flex items-center justify-between mb-4">
              <p className="type-label text-[var(--fg-subtle)]">Nhóm</p>
              <Link href="/team" className="text-[12.5px] text-[var(--brand-default)] hover:underline flex items-center gap-1">
                Quản lý <ChevronRight size={12} />
              </Link>
            </div>
            <Card variant="default" padding="md">
              <div className="flex items-center justify-between mb-4">
                <AvatarGroup avatars={[{ name: "Ngọc NA" }, { name: "Minh TT" }, { name: "Lan PH" }, { name: "Tuan LM" }, { name: "Duc NQ" }]} size="sm" max={4} />
                <Button variant="ghost" size="xs" icon={<Plus size={12} />}>Thêm</Button>
              </div>
              <div className="space-y-2">
                {[
                  { name: "Ngọc NA", role: "Admin",    online: true  },
                  { name: "Minh TT", role: "Designer", online: true  },
                  { name: "Lan PH",  role: "Designer", online: false },
                ].map(({ name, role, online }) => (
                  <div key={name} className="flex items-center gap-2.5">
                    <Avatar name={name} size="xs" />
                    <div className="flex-1">
                      <p className="text-[12.5px] font-medium text-[var(--fg-default)]">{name}</p>
                      <p className="text-[11px] text-[var(--fg-subtle)]">{role}</p>
                    </div>
                    <StatusBadge status={online ? "online" : "offline"} label={online ? "Online" : "Offline"} />
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <p className="type-label text-[var(--fg-subtle)]">Yêu thích</p>
              <Link href="/favorites" className="text-[12.5px] text-[var(--brand-default)] hover:underline flex items-center gap-1">
                Xem tất cả <ChevronRight size={12} />
              </Link>
            </div>
            <div className="space-y-2">
              {[
                { icon: Target,   label: "ZaloPay Tết Analysis",   score: "9.1", type: "Brand Check" },
                { icon: Image,    label: "Holiday Campaign Banner", score: "—",   type: "Banner"      },
                { icon: Sparkles, label: "ZP Hero Image v3",        score: "—",   type: "Image"       },
              ].map(({ icon: Icon, label, score, type }) => (
                <Card key={label} variant="default" padding="sm" interactive>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-[var(--radius-md)] bg-[var(--brand-subtle)] flex items-center justify-center shrink-0">
                      <Icon size={14} strokeWidth={1.8} className="text-[var(--brand-default)]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-medium text-[var(--fg-default)] truncate">{label}</p>
                      <p className="text-[11px] text-[var(--fg-subtle)]">{type}</p>
                    </div>
                    {score !== "—" && <Badge variant="success" size="sm">{score}/10</Badge>}
                    <Star size={14} className="text-[var(--warning-default)] fill-current shrink-0" />
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* ── Platform news ── */}
        <div>
          <p className="type-label text-[var(--fg-subtle)] mb-4">Platform Updates</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { title: "Sprint 5 Application Shell", desc: "Shell hoàn chỉnh: navigation, panels, search ⌘K và 11 module pages.", badge: "new",     icon: CheckCircle2 },
              { title: "Brand Checker 2.0",           desc: "Phân tích nhanh hơn 3×, báo cáo chi tiết và score breakdown.",       badge: "updated", icon: Rocket      },
              { title: "Template Library",            desc: "42 template Tết Nguyên Đán 2025 mới thêm vào thư viện.",             badge: "new",     icon: Bell        },
            ].map(({ title, desc, badge, icon: Icon }) => (
              <Card key={title} variant="default" padding="md" interactive>
                <div className="flex items-start gap-3">
                  <Icon size={16} strokeWidth={1.8} className="text-[var(--brand-default)] mt-0.5 shrink-0" />
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-[13px] font-semibold text-[var(--fg-default)]">{title}</p>
                      <Badge variant={badge === "new" ? "accent" : "primary"} size="sm">{badge}</Badge>
                    </div>
                    <p className="text-[12px] text-[var(--fg-muted)] leading-relaxed">{desc}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        <div className="h-8" />
      </div>
    </div>
  );
}
