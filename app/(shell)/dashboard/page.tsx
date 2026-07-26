"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  Target, Sparkles, Image, Archive, FolderOpen, Film,
  Star, ArrowRight, Plus, Zap, Bell, Rocket,
  ChevronRight, ChevronLeft, CheckCircle2, TrendingUp,
  type LucideIcon,
} from "lucide-react";
import { Card, PanelSection } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatusDot } from "@/components/ui/status-indicator";
import { ProgressBar } from "@/components/ui/progress";
import { Avatar, AvatarGroup } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useRightPanel } from "@/contexts/right-panel-context";
import {
  RECENT_PROJECTS,
  RECENT_ASSETS,
  PLATFORM_STATS,
  NEWS_ITEMS,
  PROJECT_STATUS_CONFIG,
  type StatIconId,
  type NewsIconId,
} from "@/data/dashboard";

/* ── Icon lookup maps (icon refs cannot live in data files) ── */
const STAT_ICON_MAP: Record<StatIconId, LucideIcon> = {
  projects: FolderOpen,
  assets:   Archive,
  credits:  Zap,
  reports:  Target,
  images:   Image,
  videos:   Film,
};

const NEWS_ICON_MAP: Record<NewsIconId, LucideIcon> = {
  check:  CheckCircle2,
  rocket: Rocket,
  bell:   Bell,
};

/* ═══════════════════════════════════════════════════════
   HERO CAROUSEL — SVG Illustrations
═══════════════════════════════════════════════════════ */

function BannerSlideIllus() {
  return (
    <svg viewBox="0 0 300 280" width="220" height="195" aria-hidden="true">
      <rect x="48" y="52" width="204" height="118" rx="10" fill="white" fillOpacity="0.09" stroke="white" strokeOpacity="0.32" strokeWidth="1.5"/>
      <rect x="60" y="66" width="76" height="12" rx="4" fill="white" fillOpacity="0.28"/>
      <rect x="60" y="84" width="54" height="8" rx="3" fill="white" fillOpacity="0.16"/>
      <rect x="60" y="99" width="42" height="22" rx="6" fill="#00cf6a" fillOpacity="0.7"/>
      <rect x="150" y="66" width="88" height="90" rx="7" fill="white" fillOpacity="0.07"/>
      <circle cx="194" cy="111" r="24" fill="white" fillOpacity="0.09"/>
      <rect x="88" y="182" width="48" height="18" rx="9" fill="white" fillOpacity="0.14"/>
      <text x="112" y="195" textAnchor="middle" fill="white" fontSize="9" fontWeight="600">16 : 9</text>
      <rect x="216" y="158" width="66" height="66" rx="8" fill="white" fillOpacity="0.07" stroke="white" strokeOpacity="0.18" strokeWidth="1"/>
      <rect x="226" y="168" width="46" height="46" rx="4" fill="white" fillOpacity="0.05"/>
      <rect x="234" y="194" width="30" height="11" rx="5.5" fill="#00cf6a" fillOpacity="0.55"/>
      <rect x="236" y="216" width="26" height="16" rx="8" fill="white" fillOpacity="0.12"/>
      <text x="249" y="228" textAnchor="middle" fill="white" fontSize="8" fontWeight="600">1:1</text>
      <rect x="14" y="152" width="56" height="100" rx="8" fill="white" fillOpacity="0.07" stroke="white" strokeOpacity="0.18" strokeWidth="1"/>
      <rect x="24" y="162" width="36" height="80" rx="4" fill="white" fillOpacity="0.05"/>
      <text x="42" y="248" textAnchor="middle" fill="white" fontSize="8" fontWeight="600">9:16</text>
      {["#0033c9","#00cf6a","#f59e0b","#ffffff","#e53e3e"].map((c,i) => (
        <circle key={c} cx={88+i*23} cy={258} r="8" fill={c} fillOpacity="0.85" stroke="white" strokeOpacity="0.18" strokeWidth="1"/>
      ))}
    </svg>
  );
}

function BrandSlideIllus() {
  return (
    <svg viewBox="0 0 300 280" width="220" height="195" aria-hidden="true">
      <circle cx="150" cy="140" r="122" fill="none" stroke="white" strokeOpacity="0.06" strokeWidth="1" strokeDasharray="4 8"/>
      <circle cx="150" cy="140" r="86" fill="none" stroke="white" strokeOpacity="0.09" strokeWidth="1" strokeDasharray="3 5"/>
      <circle cx="150" cy="140" r="54" fill="white" fillOpacity="0.05"/>
      <path d="M150 46 L206 70 V137 C206 171 180 198 150 212 C120 198 94 171 94 137 V70 Z" fill="white" fillOpacity="0.09" stroke="white" strokeOpacity="0.4" strokeWidth="1.5"/>
      <path d="M127 139 L143 155 L175 117" stroke="#00cf6a" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      <circle cx="240" cy="80" r="28" fill="white" fillOpacity="0.12" stroke="white" strokeOpacity="0.22" strokeWidth="1"/>
      <text x="240" y="75" textAnchor="middle" fill="white" fontSize="13" fontWeight="700">9.2</text>
      <text x="240" y="90" textAnchor="middle" fill="white" fontSize="9" fillOpacity="0.65">SCORE</text>
      <rect x="42" y="183" width="82" height="26" rx="13" fill="white" fillOpacity="0.12" stroke="#00cf6a" strokeOpacity="0.55" strokeWidth="1"/>
      <text x="83" y="200" textAnchor="middle" fill="#00cf6a" fontSize="10" fontWeight="700">✓ PASS</text>
      {Array.from({length:9}).map((_,i) => (
        <circle key={i} cx={249+(i%3)*15} cy={180+Math.floor(i/3)*15} r="2.5" fill="white" fillOpacity="0.14"/>
      ))}
    </svg>
  );
}

function ImageSlideIllus() {
  const sparkles = [{x:60,y:88,s:1.2},{x:256,y:72,s:0.9},{x:250,y:178,s:1.0},{x:76,y:198,s:0.8},{x:156,y:32,s:1.1}];
  return (
    <svg viewBox="0 0 300 280" width="220" height="195" aria-hidden="true">
      <rect x="58" y="42" width="184" height="162" rx="14" fill="white" fillOpacity="0.09" stroke="white" strokeOpacity="0.32" strokeWidth="1.5"/>
      <rect x="126" y="34" width="48" height="18" rx="9" fill="white" fillOpacity="0.17"/>
      <circle cx="150" cy="43" r="4.5" fill="white" fillOpacity="0.28"/>
      <rect x="70" y="56" width="160" height="138" rx="8" fill="white" fillOpacity="0.04"/>
      <rect x="78" y="64" width="92" height="66" rx="6" fill="#0044cc" fillOpacity="0.4"/>
      <rect x="178" y="64" width="44" height="66" rx="6" fill="#00cf6a" fillOpacity="0.28"/>
      <rect x="78" y="138" width="144" height="48" rx="6" fill="white" fillOpacity="0.06"/>
      <rect x="86" y="148" width="72" height="7" rx="3.5" fill="white" fillOpacity="0.18"/>
      <rect x="86" y="160" width="52" height="7" rx="3.5" fill="white" fillOpacity="0.11"/>
      {sparkles.map(({x,y,s},i) => (
        <g key={i} transform={`translate(${x},${y}) scale(${s})`}>
          <path d="M0-9 L2.1-2.1 L9 0 L2.1 2.1 L0 9 L-2.1 2.1 L-9 0 L-2.1-2.1 Z" fill="#00cf6a" fillOpacity="0.85"/>
        </g>
      ))}
      <rect x="93" y="218" width="114" height="34" rx="17" fill="white" fillOpacity="0.14" stroke="white" strokeOpacity="0.28" strokeWidth="1"/>
      <text x="150" y="240" textAnchor="middle" fill="white" fontSize="11" fontWeight="700">✦ AI Generated</text>
    </svg>
  );
}

function VideoSlideIllus() {
  const wave = [20,32,26,44,52,36,28,46,54,38,22,32,42,28,36];
  return (
    <svg viewBox="0 0 300 280" width="220" height="195" aria-hidden="true">
      <circle cx="150" cy="128" r="116" fill="none" stroke="white" strokeOpacity="0.05" strokeWidth="1" strokeDasharray="3 8"/>
      <circle cx="150" cy="128" r="80" fill="none" stroke="white" strokeOpacity="0.08" strokeWidth="1"/>
      <circle cx="150" cy="128" r="58" fill="white" fillOpacity="0.08"/>
      <circle cx="150" cy="128" r="50" fill="white" fillOpacity="0.14" stroke="white" strokeOpacity="0.38" strokeWidth="1.5"/>
      <path d="M139 110 L178 128 L139 146 Z" fill="white" fillOpacity="0.95"/>
      {[-2,-1,0,1,2].map((n) => (
        <g key={n}>
          <rect x={110+n*22} y={32} width="18" height="28" rx="3" fill="white" fillOpacity={n===0?0.22:0.08} stroke="white" strokeOpacity={n===0?0.45:0.18} strokeWidth="1"/>
          <rect x={113+n*22} y={35} width="5" height="6" rx="1" fill="white" fillOpacity="0.25"/>
          <rect x={121+n*22} y={35} width="5" height="6" rx="1" fill="white" fillOpacity="0.25"/>
        </g>
      ))}
      {wave.map((h,i) => (
        <rect key={i} x={50+i*13.5} y={254-h/2} width="9" height={h} rx="4.5" fill="#00cf6a" fillOpacity={0.45+(i%5)*0.1}/>
      ))}
      <rect x="188" y="170" width="56" height="24" rx="12" fill="white" fillOpacity="0.14"/>
      <text x="216" y="186" textAnchor="middle" fill="white" fontSize="10" fontWeight="600">00:30</text>
    </svg>
  );
}

/* ─── Slide data ─── */
type SlideData = {
  id: string; tag: string; headline: string; desc: string;
  primaryCTA: { label: string; href: string };
  secondaryCTA: { label: string };
  gradient: string;
  Illustration: React.ComponentType;
};

const SLIDES: SlideData[] = [
  {
    id: "banner-generator",
    tag: "Tạo nội dung",
    headline: "AI Banner\nGenerator",
    desc: "Tạo banner quảng cáo đúng chuẩn ZaloPay trong vài giây — 12+ định dạng, 40+ template.",
    primaryCTA: { label: "Tạo banner ngay", href: "/banner-generator" },
    secondaryCTA: { label: "Duyệt template" },
    gradient: "linear-gradient(135deg, #080830 0%, #0022a8 42%, #0033c9 68%, #1a44dd 100%)",
    Illustration: BannerSlideIllus,
  },
  {
    id: "brand-checker",
    tag: "Tính năng chính",
    headline: "AI Brand Guideline\nChecker",
    desc: "Phân tích tự động theo 42+ tiêu chuẩn ZaloPay — màu sắc, font, bố cục và tỷ lệ logo.",
    primaryCTA: { label: "Bắt đầu phân tích", href: "/brand-checker" },
    secondaryCTA: { label: "Xem demo" },
    gradient: "linear-gradient(135deg, #001266 0%, #0033c9 52%, #003ee6 100%)",
    Illustration: BrandSlideIllus,
  },
  {
    id: "image-generator",
    tag: "AI Image",
    headline: "AI Image\nGenerator",
    desc: "Sinh hình ảnh sáng tạo từ văn bản với Imagen 3 — phong cách thương hiệu, 4K output.",
    primaryCTA: { label: "Tạo ảnh AI", href: "/image-generator" },
    secondaryCTA: { label: "Xem gallery" },
    gradient: "linear-gradient(135deg, #003060 0%, #0033c9 42%, #0066b2 76%, #0088cc 100%)",
    Illustration: ImageSlideIllus,
  },
  {
    id: "video-generator",
    tag: "Sắp ra mắt",
    headline: "AI Video\nGenerator",
    desc: "Tự động tạo video marketing từ script với Veo 2 — social formats, caption thông minh.",
    primaryCTA: { label: "Đăng ký sớm", href: "/video-generator" },
    secondaryCTA: { label: "Tìm hiểu thêm" },
    gradient: "linear-gradient(135deg, #0c0d2e 0%, #0a1870 32%, #0033c9 66%, #1948c0 100%)",
    Illustration: VideoSlideIllus,
  },
];

/* ─── Hero Carousel ─── */
function HeroCarousel() {
  const [active, setActive] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchX = useRef(0);

  const prev = () => setActive((a) => (a - 1 + SLIDES.length) % SLIDES.length);
  const next = () => setActive((a) => (a + 1) % SLIDES.length);

  useEffect(() => {
    if (isPaused) return;
    const id = setInterval(() => setActive((a) => (a + 1) % SLIDES.length), 5000);
    return () => clearInterval(id);
  }, [isPaused, active]);

  return (
    <div
      className="relative overflow-hidden select-none rounded-[var(--radius-2xl)] h-[240px] sm:h-[300px]"
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
            <div className="absolute -top-24 -right-16 w-80 h-80 rounded-full blur-3xl pointer-events-none" style={{ background: "#00cf6a", opacity: 0.16 }}/>
            <div className="absolute -bottom-24 -left-12 w-72 h-72 rounded-full blur-3xl pointer-events-none" style={{ background: "#4466ff", opacity: 0.12 }}/>
            <div className="relative z-10 h-full max-w-6xl mx-auto px-8 md:px-14 grid grid-cols-1 lg:grid-cols-2 gap-0 items-center">
              <div className="flex flex-col gap-2.5 max-w-lg">
                <span className="inline-flex items-center self-start gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest text-white/80" style={{ background: "rgba(255,255,255,0.12)" }}>
                  <Sparkles size={8} />
                  {slide.tag}
                </span>
                <h2 className="text-[27px] font-black text-white leading-tight tracking-tight whitespace-pre-line" style={{ textShadow: "0 2px 20px rgba(0,0,0,0.2)" }}>
                  {slide.headline}
                </h2>
                <p className="text-[13px] leading-snug text-white/72">{slide.desc}</p>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <Link href={slide.primaryCTA.href} className="inline-flex items-center gap-2 px-4 py-2 rounded-[var(--radius-lg)] text-[12.5px] font-bold bg-white text-[#0033c9] hover:bg-white/92 transition-colors shadow-lg">
                    {slide.primaryCTA.label}
                    <ArrowRight size={13} />
                  </Link>
                  <button className="inline-flex items-center gap-2 px-4 py-2 rounded-[var(--radius-lg)] text-[12.5px] font-semibold text-white border border-white/40 hover:bg-white/10 transition-colors">
                    {slide.secondaryCTA.label}
                  </button>
                </div>
              </div>
              <div className="hidden lg:flex items-center justify-center">
                <Illus />
              </div>
            </div>
          </div>
        );
      })}

      {/* Prev / Next */}
      <button onClick={prev} aria-label="Previous slide" className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full flex items-center justify-center text-white backdrop-blur-sm transition-colors" style={{ background: "rgba(255,255,255,0.12)" }} onMouseEnter={(e) => (e.currentTarget.style.background="rgba(255,255,255,0.22)")} onMouseLeave={(e) => (e.currentTarget.style.background="rgba(255,255,255,0.12)")}>
        <ChevronLeft size={16} />
      </button>
      <button onClick={next} aria-label="Next slide" className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full flex items-center justify-center text-white backdrop-blur-sm transition-colors" style={{ background: "rgba(255,255,255,0.12)" }} onMouseEnter={(e) => (e.currentTarget.style.background="rgba(255,255,255,0.22)")} onMouseLeave={(e) => (e.currentTarget.style.background="rgba(255,255,255,0.12)")}>
        <ChevronRight size={16} />
      </button>

      {/* Dots */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
        {SLIDES.map((_,i) => (
          <button key={i} onClick={() => { setActive(i); setIsPaused(false); }} aria-label={`Slide ${i+1}`} className="rounded-full bg-white transition-all duration-300" style={{ width: i===active?24:8, height:8, opacity: i===active?1:0.35 }}/>
        ))}
      </div>

      {/* Counter */}
      <div className="absolute bottom-3 right-7 z-20 text-white/45 text-[11px] font-mono tabular-nums">
        0{active+1} <span className="opacity-50">/</span> 0{SLIDES.length}
      </div>

      {/* Progress line */}
      <div className="absolute bottom-0 left-0 right-0 h-[2px]" style={{ background: "rgba(255,255,255,0.08)" }}>
        <div className="h-full transition-all duration-300" style={{ width: `${((active+1)/SLIDES.length)*100}%`, background: "rgba(255,255,255,0.35)" }}/>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   FEATURE CARDS — Rich promotional banner cards
═══════════════════════════════════════════════════════ */

function BrandCardIllus() {
  const cx = 112, cy = 60, r = 44;
  const angles = Array.from({length:6}, (_,i) => (i*60-90)*(Math.PI/180));
  const hexPts = angles.map(a => ({x: cx+r*Math.cos(a), y: cy+r*Math.sin(a)}));
  const hex = hexPts.map((p,i) => `${i?"L":"M"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join("")+"Z";
  const scales = [0.9,0.72,0.85,0.95,0.68,0.9];
  const dataPath = angles.map((a,i) => {
    const ri = r*scales[i];
    return `${i?"L":"M"}${(cx+ri*Math.cos(a)).toFixed(1)},${(cy+ri*Math.sin(a)).toFixed(1)}`;
  }).join("")+"Z";

  return (
    <svg viewBox="0 0 360 120" width="100%" height="100%" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      {hexPts.map((p,i) => <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="white" strokeOpacity="0.1" strokeWidth="1"/>)}
      {[1,0.67,0.33].map((s,i) => {
        const d = angles.map((a,j) => `${j?"L":"M"}${(cx+r*s*Math.cos(a)).toFixed(1)},${(cy+r*s*Math.sin(a)).toFixed(1)}`).join("")+"Z";
        return <path key={i} d={d} fill="none" stroke="white" strokeOpacity={0.18-i*0.05} strokeWidth="1"/>;
      })}
      <path d={dataPath} fill="#00cf6a" fillOpacity="0.15" stroke="#00cf6a" strokeOpacity="0.5" strokeWidth="1.5"/>
      <path d={hex} fill="none" stroke="white" strokeOpacity="0.2" strokeWidth="1"/>
      <path d="M168 12 L194 24 V56 C194 72 182 82 168 88 C154 82 142 72 142 56 V24 Z" fill="white" fillOpacity="0.07" stroke="white" strokeOpacity="0.3" strokeWidth="1.2"/>
      <path d="M160 50 L167 57 L180 42" stroke="#00cf6a" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      <circle cx="272" cy="40" r="30" fill="rgba(0,51,201,0.18)" stroke="white" strokeOpacity="0.15" strokeWidth="1"/>
      <circle cx="272" cy="40" r="23" fill="rgba(0,207,106,0.1)" stroke="#00cf6a" strokeOpacity="0.4" strokeWidth="1"/>
      <text x="272" y="36" textAnchor="middle" fill="white" fontSize="13" fontWeight="700">9.2</text>
      <text x="272" y="50" textAnchor="middle" fill="white" fontSize="8" fillOpacity="0.55">SCORE</text>
      <rect x="220" y="85" width="70" height="22" rx="11" fill="rgba(0,207,106,0.14)" stroke="#00cf6a" strokeOpacity="0.5" strokeWidth="1"/>
      <text x="255" y="100" textAnchor="middle" fill="#00cf6a" fontSize="9" fontWeight="700">✓ PASS</text>
      {Array.from({length:15},(_,i) => (
        <circle key={i} cx={316+(i%5)*10} cy={8+Math.floor(i/5)*10} r="1.8" fill="white" fillOpacity="0.15"/>
      ))}
      {["#0033c9","#00cf6a","#f59e0b","#ffffff","#e53e3e"].map((c,i) => (
        <circle key={c} cx={12+i*18} cy={108} r="6.5" fill={c} fillOpacity="0.72" stroke="white" strokeOpacity="0.15" strokeWidth="0.5"/>
      ))}
    </svg>
  );
}

function ImageCardIllus() {
  const sparkles = [{x:52,y:22,s:1.1},{x:298,y:18,s:0.9},{x:316,y:78,s:0.75},{x:30,y:88,s:0.7},{x:196,y:8,s:0.85},{x:340,y:48,s:0.65}];
  return (
    <svg viewBox="0 0 360 120" width="100%" height="100%" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <linearGradient id="imgCardGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0055cc" stopOpacity="0.65"/>
          <stop offset="100%" stopColor="#00cf6a" stopOpacity="0.45"/>
        </linearGradient>
      </defs>
      {/* Back frame */}
      <g transform="rotate(-7 155 58)">
        <rect x="78" y="14" width="152" height="94" rx="10" fill="#002288" fillOpacity="0.7" stroke="white" strokeOpacity="0.12" strokeWidth="1"/>
        <rect x="88" y="24" width="132" height="74" rx="6" fill="#001266" fillOpacity="0.8"/>
        <circle cx="154" cy="61" r="18" fill="#0044cc" fillOpacity="0.35"/>
      </g>
      {/* Mid frame */}
      <g transform="rotate(5 165 58)">
        <rect x="88" y="18" width="152" height="94" rx="10" fill="#0066bb" fillOpacity="0.5" stroke="white" strokeOpacity="0.18" strokeWidth="1"/>
        <rect x="98" y="28" width="132" height="74" rx="6" fill="#003a88" fillOpacity="0.8"/>
        <rect x="106" y="36" width="80" height="50" rx="4" fill="#0055cc" fillOpacity="0.45"/>
        <circle cx="160" cy="61" r="13" fill="#00cf6a" fillOpacity="0.3"/>
      </g>
      {/* Front frame */}
      <rect x="94" y="16" width="156" height="88" rx="12" fill="white" fillOpacity="0.08" stroke="white" strokeOpacity="0.35" strokeWidth="1.5"/>
      <rect x="102" y="24" width="140" height="72" rx="8" fill="url(#imgCardGrad)"/>
      {/* Sparkles */}
      {sparkles.map(({x,y,s},i) => (
        <g key={i} transform={`translate(${x},${y}) scale(${s})`}>
          <path d="M0-8 L1.9-1.9 L8 0 L1.9 1.9 L0 8 L-1.9 1.9 L-8 0 L-1.9-1.9 Z" fill="#00cf6a" fillOpacity="0.85"/>
        </g>
      ))}
      {/* AI badge */}
      <rect x="254" y="84" width="78" height="24" rx="12" fill="rgba(0,51,201,0.45)" stroke="white" strokeOpacity="0.28" strokeWidth="1"/>
      <text x="293" y="100" textAnchor="middle" fill="white" fontSize="9.5" fontWeight="700">✦ AI Art</text>
    </svg>
  );
}

function VideoCardIllus() {
  const waveH = [12,20,16,28,33,22,18,30,33,24,14,22,28,18,24];
  return (
    <svg viewBox="0 0 360 120" width="100%" height="100%" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      {/* Film strip */}
      {Array.from({length:13},(_,i) => (
        <g key={i}>
          <rect x={8+i*26} y={3} width={20} height={22} rx="2.5" fill="white" fillOpacity={i===6?0.18:0.07} stroke="white" strokeOpacity="0.14" strokeWidth="1"/>
          <rect x={11+i*26} y={6} width={6} height={7} rx="1" fill="white" fillOpacity="0.25"/>
          <rect x={20+i*26} y={6} width={6} height={7} rx="1" fill="white" fillOpacity="0.25"/>
        </g>
      ))}
      {/* Timeline */}
      <rect x="52" y="30" width="256" height="2" rx="1" fill="white" fillOpacity="0.12"/>
      <rect x="52" y="30" width="110" height="2" rx="1" fill="#00cf6a" fillOpacity="0.7"/>
      <circle cx="162" cy="31" r="4.5" fill="#00cf6a" stroke="white" strokeWidth="1.5" strokeOpacity="0.4"/>
      {/* Play button */}
      <circle cx="180" cy="68" r="26" fill="white" fillOpacity="0.06"/>
      <circle cx="180" cy="68" r="20" fill="white" fillOpacity="0.12" stroke="white" strokeOpacity="0.3" strokeWidth="1.5"/>
      <path d="M173 59 L194 68 L173 77 Z" fill="white" fillOpacity="0.92"/>
      {/* Waveform */}
      {waveH.map((h,i) => (
        <rect key={i} x={40+i*19} y={117-h} width={13} height={h} rx="6.5" fill="#00cf6a" fillOpacity={0.38+(i%5)*0.09}/>
      ))}
      {/* Duration */}
      <rect x="258" y="36" width="56" height="18" rx="9" fill="white" fillOpacity="0.12"/>
      <text x="286" y="49" textAnchor="middle" fill="white" fontSize="8.5" fontWeight="600">00:30</text>
      {/* Coming Soon badge */}
      <rect x="8" y="36" width="62" height="18" rx="9" fill="rgba(251,191,36,0.14)" stroke="rgba(251,191,36,0.42)" strokeWidth="1"/>
      <text x="39" y="49" textAnchor="middle" fill="#fbbf24" fontSize="8.5" fontWeight="700">SOON</text>
    </svg>
  );
}

type FeatureCardData = {
  id: string; title: string; desc: string;
  cta: string; href: string;
  gradient: string; available: boolean;
  Illustration: React.ComponentType;
};

const FEATURE_CARDS: FeatureCardData[] = [
  {
    id: "brand-checker",
    title: "AI Brand Guideline Checker",
    desc: "Phân tích tự động theo 42+ tiêu chuẩn ZaloPay. Kết quả tức thì với báo cáo chi tiết.",
    cta: "Kiểm tra ngay",
    href: "/brand-checker",
    gradient: "linear-gradient(140deg, #001266 0%, #0033c9 58%, #1a44e0 100%)",
    available: true,
    Illustration: BrandCardIllus,
  },
  {
    id: "image-generator",
    title: "AI Image Generator",
    desc: "Sinh ảnh sáng tạo từ mô tả văn bản với Imagen 3. Style matching thương hiệu ZaloPay.",
    cta: "Tạo ảnh AI",
    href: "/image-generator",
    gradient: "linear-gradient(140deg, #001f5c 0%, #0044bb 50%, #0077cc 100%)",
    available: true,
    Illustration: ImageCardIllus,
  },
  {
    id: "video-generator",
    title: "AI Video Generator",
    desc: "Tạo video marketing tự động từ script với Veo 2. Social formats, caption, nhạc nền.",
    cta: "Đăng ký sớm",
    href: "/video-generator",
    gradient: "linear-gradient(140deg, #0a0830 0%, #140a52 45%, #2010a0 100%)",
    available: false,
    Illustration: VideoCardIllus,
  },
];

/* ═══════════════════════════════════════════════════════
   DATA
═══════════════════════════════════════════════════════ */


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
                { label: "API Gateway",   ok: true },
                { label: "AI Models",     ok: true },
                { label: "Asset Storage", ok: true },
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
                { text: "Brand guideline ZaloPay v2.4 đã được cập nhật", Icon: Bell },
                { text: "42 template Tết 2025 đã sẵn sàng",              Icon: Star },
              ].map(({ text, Icon: IconComp }) => (
                <div key={text} className="flex items-start gap-2 p-2.5 rounded-[var(--radius-md)] bg-[var(--bg-surface-2)]">
                  <IconComp size={13} className="text-[var(--brand-default)] mt-0.5 shrink-0" />
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

/* ═══════════════════════════════════════════════════════
   PAGE
═══════════════════════════════════════════════════════ */
export default function DashboardPage() {
  const { setContent } = useRightPanel();
  useEffect(() => {
    setContent(<DashboardPanel />);
    return () => setContent(null);
  }, [setContent]);

  return (
    <div className="p-4 sm:p-6 max-w-5xl space-y-6 sm:space-y-7">

      {/* ── 1. Hero Carousel ── */}
      <HeroCarousel />

      {/* ── 2. Feature Cards ── */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <p className="type-label text-[var(--fg-subtle)]">Tính năng nổi bật</p>
          <Link href="/brand-checker" className="text-[12.5px] text-[var(--brand-default)] hover:underline flex items-center gap-1">
            Khám phá tất cả <ChevronRight size={12} />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {FEATURE_CARDS.map(({ id, title, desc, cta, href, gradient, available, Illustration: Illus }) => (
            <div
              key={id}
              className={`rounded-[var(--radius-xl)] overflow-hidden border border-[var(--border-default)] group transition-all duration-200 ${available ? "hover:border-[var(--brand-default)] hover:shadow-[var(--shadow-3)] cursor-pointer" : "opacity-80"}`}
            >
              {/* Illustration zone */}
              <div className="relative overflow-hidden" style={{ height: 120, background: gradient }}>
                <div className="absolute inset-0 w-full h-full">
                  <Illus />
                </div>
                {!available && (
                  <div className="absolute top-3 right-3 z-10">
                    <span className="text-[10px] font-bold text-amber-300 bg-amber-400/15 border border-amber-400/30 px-2 py-0.5 rounded-full">Coming Soon</span>
                  </div>
                )}
              </div>
              {/* Content zone */}
              <div className="p-4 bg-[var(--bg-surface-1)]">
                <h3 className="text-[14px] font-bold text-[var(--fg-default)] leading-tight mb-1.5">{title}</h3>
                <p className="text-[12px] text-[var(--fg-muted)] leading-relaxed mb-3 line-clamp-2">{desc}</p>
                {available ? (
                  <Link href={href}>
                    <Button variant="outline" size="sm">{cta}</Button>
                  </Link>
                ) : (
                  <Button variant="secondary" size="sm" disabled>{cta}</Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 4. Recent Projects ── */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <p className="type-label text-[var(--fg-subtle)]">Dự án gần đây</p>
          <Link href="/projects" className="text-[12.5px] text-[var(--brand-default)] hover:underline flex items-center gap-1">
            Xem tất cả <ChevronRight size={12} />
          </Link>
        </div>
        <div className="space-y-2.5">
          {RECENT_PROJECTS.map((p) => {
            const st = PROJECT_STATUS_CONFIG[p.status];
            return (
              <div
                key={p.id}
                className="flex items-center gap-4 px-4 py-3 bg-[var(--bg-surface-1)] border border-[var(--border-default)] rounded-[var(--radius-xl)] hover:border-[var(--brand-default)] hover:shadow-[var(--shadow-1)] transition-all cursor-pointer group"
              >
                <div
                  className="w-10 h-10 rounded-[var(--radius-lg)] shrink-0 flex items-center justify-center font-bold text-white text-[13px]"
                  style={{ background: `linear-gradient(135deg, ${p.color}, ${p.color}88)` }}
                >
                  {p.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13.5px] font-semibold text-[var(--fg-default)] truncate">{p.name}</p>
                  <p className="text-[12px] text-[var(--fg-muted)] truncate">{p.module} · {p.files} files</p>
                </div>
                <AvatarGroup avatars={p.members.map((m) => ({ name: m }))} size="xs" max={3} />
                <div className="hidden sm:flex items-center gap-2 shrink-0">
                  <span className="text-[11.5px] text-[var(--fg-subtle)]">{p.updated} trước</span>
                  <Badge variant={st.variant} size="sm">{st.label}</Badge>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── 5. Platform Statistics ── */}
      <section>
        <p className="type-label text-[var(--fg-subtle)] mb-4">Thống kê nền tảng</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {PLATFORM_STATS.map(({ id, label, value, color }) => {
            const Icon = STAT_ICON_MAP[id];
            return (
              <Card key={id} variant="default" padding="sm" interactive>
                <div className="w-8 h-8 rounded-[var(--radius-md)] flex items-center justify-center mb-3" style={{ background: `${color}1a` }}>
                  <Icon size={15} strokeWidth={1.8} style={{ color }} />
                </div>
                <p className="text-[22px] font-bold text-[var(--fg-default)] leading-none tabular-nums mb-1">{value}</p>
                <p className="text-[11.5px] text-[var(--fg-muted)]">{label}</p>
              </Card>
            );
          })}
        </div>
      </section>

      {/* ── 6. Recent Assets ── */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <p className="type-label text-[var(--fg-subtle)]">Assets gần đây</p>
          <Link href="/asset-library" className="text-[12.5px] text-[var(--brand-default)] hover:underline flex items-center gap-1">
            Thư viện <ChevronRight size={12} />
          </Link>
        </div>
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2.5">
          {RECENT_ASSETS.map((asset) => (
            <div
              key={asset.id}
              className="aspect-square rounded-[var(--radius-lg)] overflow-hidden cursor-pointer group relative"
              style={{ background: `linear-gradient(135deg, ${asset.c1}, ${asset.c2})` }}
            >
              <div className="absolute inset-0 flex items-center justify-center opacity-20 group-hover:opacity-40 transition-opacity">
                <Sparkles size={16} className="text-white" />
              </div>
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-1.5">
                <p className="text-[9px] text-white/85 font-medium truncate leading-tight">{asset.name}</p>
              </div>
              <div className="absolute top-1.5 left-1.5">
                <span className="text-[8px] font-bold text-white/80 bg-black/30 px-1 py-0.5 rounded">
                  {asset.type === "banner" ? "BNNER" : "IMG"}
                </span>
              </div>
            </div>
          ))}
          <div className="aspect-square rounded-[var(--radius-lg)] border-2 border-dashed border-[var(--border-default)] flex items-center justify-center cursor-pointer hover:border-[var(--brand-default)] hover:bg-[var(--bg-surface-2)] transition-all group">
            <Plus size={18} className="text-[var(--fg-subtle)] group-hover:text-[var(--brand-default)] transition-colors" />
          </div>
        </div>
      </section>

      {/* ── 7. Platform News ── */}
      <section>
        <Card variant="default" padding="none">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border-subtle)]">
            <p className="text-[13.5px] font-bold text-[var(--fg-default)]">Tin tức &amp; Cập nhật</p>
            <Badge variant="accent" size="sm">3 mới</Badge>
          </div>
          <div className="divide-y divide-[var(--border-subtle)]">
            {NEWS_ITEMS.map(({ id, iconId, title, desc, badge, badgeLabel, time }) => {
              const IconComp = NEWS_ICON_MAP[iconId];
              return (
              <div key={id} className="flex items-start gap-3.5 px-5 py-4 hover:bg-[var(--bg-surface-2)] transition-colors cursor-pointer">
                <div className="w-8 h-8 rounded-[var(--radius-md)] bg-[var(--brand-subtle)] flex items-center justify-center shrink-0 mt-0.5">
                  <IconComp size={14} strokeWidth={1.8} className="text-[var(--brand-default)]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-[13px] font-semibold text-[var(--fg-default)]">{title}</p>
                    <Badge variant={badge} size="sm">{badgeLabel}</Badge>
                  </div>
                  <p className="text-[12px] text-[var(--fg-muted)] leading-relaxed">{desc}</p>
                </div>
                <span className="text-[11px] text-[var(--fg-subtle)] shrink-0 mt-0.5">{time}</span>
              </div>
              );
            })}
          </div>
          <div className="px-5 py-3 border-t border-[var(--border-default)] flex items-center justify-between">
            <span className="text-[12px] text-[var(--fg-subtle)]">ZaloPay AI Creative Platform v1.0</span>
            <Link href="/settings" className="text-[12.5px] font-medium text-[var(--brand-default)] hover:underline flex items-center gap-1">
              <TrendingUp size={12} />
              Xem changelog
            </Link>
          </div>
        </Card>
      </section>

      <div className="h-6" />
    </div>
  );
}
