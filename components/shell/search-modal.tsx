"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search, X, LayoutDashboard, Target, Image, Sparkles, Video,
  Palette, PenTool, Archive, FolderOpen, Clock, Star, Users,
  Settings, Layers, ArrowRight, Hash,
} from "lucide-react";
import { useSearch } from "@/contexts/search-context";

const SEARCH_ITEMS = [
  { id: "dashboard",        label: "Dashboard",          desc: "Tổng quan & hoạt động",       href: "/dashboard",        icon: LayoutDashboard, group: "Modules" },
  { id: "brand-checker",   label: "Brand Checker",       desc: "Kiểm tra brand compliance",   href: "/brand-checker",    icon: Target,          group: "Modules" },
  { id: "banner-generator",label: "Banner Generator",    desc: "Tạo banner với AI",           href: "/banner-generator", icon: Image,           group: "Modules" },
  { id: "image-generator", label: "Image Generator",     desc: "Sinh ảnh bằng AI",            href: "/image-generator",  icon: Sparkles,        group: "Modules" },
  { id: "video-generator", label: "Video Generator",     desc: "Tạo video marketing",          href: "/video-generator",  icon: Video,           group: "Modules" },
  { id: "creative-studio", label: "Creative Studio",     desc: "Thiết kế tích hợp AI",        href: "/creative-studio",  icon: Palette,         group: "Modules" },
  { id: "prompt-studio",   label: "Prompt Studio",       desc: "Thư viện & tối ưu prompt",    href: "/prompt-studio",    icon: PenTool,         group: "Modules" },
  { id: "asset-library",   label: "Asset Library",       desc: "Kho tài nguyên thiết kế",     href: "/asset-library",    icon: Archive,         group: "Quản lý" },
  { id: "projects",        label: "Projects",             desc: "Dự án và workspace nhóm",    href: "/projects",         icon: FolderOpen,      group: "Quản lý" },
  { id: "history",         label: "History",              desc: "Lịch sử phân tích & tạo",    href: "/history",          icon: Clock,           group: "Quản lý" },
  { id: "favorites",       label: "Favorites",            desc: "Thiết kế yêu thích",         href: "/favorites",        icon: Star,            group: "Quản lý" },
  { id: "team",            label: "Team Workspace",       desc: "Cộng tác và phân quyền",     href: "/team",             icon: Users,           group: "Quản lý" },
  { id: "design-system",   label: "Design System",        desc: "Component library & tokens", href: "/design-system",    icon: Layers,          group: "Developer" },
  { id: "settings",        label: "Settings",             desc: "Tài khoản & cài đặt",        href: "/settings",         icon: Settings,        group: "Developer" },
];

const QUICK_ACTIONS = [
  { label: "Phân tích thiết kế mới",   href: "/brand-checker",    icon: Target },
  { label: "Tạo banner quảng cáo",     href: "/banner-generator", icon: Image },
  { label: "Xem lịch sử phân tích",    href: "/history",          icon: Clock },
];

export function SearchModal() {
  const { isOpen, close } = useSearch();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = query.trim()
    ? SEARCH_ITEMS.filter(
        (item) =>
          item.label.toLowerCase().includes(query.toLowerCase()) ||
          item.desc.toLowerCase().includes(query.toLowerCase())
      )
    : SEARCH_ITEMS;

  // Group results
  const groups: Record<string, typeof filtered> = {};
  for (const item of filtered) {
    if (!groups[item.group]) groups[item.group] = [];
    groups[item.group].push(item);
  }

  const flat = filtered;

  useEffect(() => { setActiveIndex(0); }, [query]);
  useEffect(() => { if (isOpen) { setQuery(""); setTimeout(() => inputRef.current?.focus(), 50); } }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") { close(); return; }
      if (e.key === "ArrowDown") { e.preventDefault(); setActiveIndex((i) => Math.min(i + 1, flat.length - 1)); }
      if (e.key === "ArrowUp")   { e.preventDefault(); setActiveIndex((i) => Math.max(i - 1, 0)); }
      if (e.key === "Enter" && flat[activeIndex]) {
        router.push(flat[activeIndex].href);
        close();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, flat, activeIndex, router, close]);

  if (!isOpen) return null;

  const navigate = (href: string) => { router.push(href); close(); };

  let flatIndex = 0;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center pt-[12vh]"
      onClick={(e) => { if (e.target === e.currentTarget) close(); }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className="relative w-full max-w-[540px] mx-4 bg-[var(--bg-surface-1)] rounded-[var(--radius-xl)] shadow-[var(--shadow-modal)] border border-[var(--border-default)] overflow-hidden animate-in"
        style={{ maxHeight: "70vh" }}
      >
        {/* Input */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-[var(--border-default)]">
          <Search size={17} strokeWidth={1.8} className="shrink-0 text-[var(--fg-muted)]" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tìm kiếm module, tính năng, cài đặt..."
            className="flex-1 bg-transparent text-[14px] text-[var(--fg-default)] outline-none placeholder:text-[var(--fg-subtle)]"
          />
          {query && (
            <button onClick={() => setQuery("")} className="w-8 h-8 flex items-center justify-center rounded-[var(--radius-md)] text-[var(--fg-subtle)] hover:text-[var(--fg-muted)] hover:bg-[var(--bg-surface-2)] shrink-0">
              <X size={14} />
            </button>
          )}
          <kbd className="shrink-0 text-[11px] text-[var(--fg-subtle)] bg-[var(--bg-surface-3)] border border-[var(--border-default)] rounded-[var(--radius-sm)] px-1.5 py-0.5 font-mono">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div className="overflow-y-auto" style={{ maxHeight: "calc(70vh - 60px)" }}>
          {/* Quick actions (only when no query) */}
          {!query && (
            <div className="px-2 py-2 border-b border-[var(--border-subtle)]">
              <p className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-widest text-[var(--fg-subtle)]">
                Thao tác nhanh
              </p>
              {QUICK_ACTIONS.map(({ label, href, icon: Icon }) => (
                <button
                  key={href}
                  onClick={() => navigate(href)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius-md)] text-left hover:bg-[var(--bg-surface-2)] transition-colors group"
                >
                  <div className="w-7 h-7 rounded-[var(--radius-md)] bg-[var(--brand-subtle)] flex items-center justify-center shrink-0">
                    <Icon size={14} className="text-[var(--brand-default)]" />
                  </div>
                  <span className="text-[13.5px] text-[var(--fg-default)]">{label}</span>
                  <ArrowRight size={13} className="ml-auto text-[var(--fg-subtle)] opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
            </div>
          )}

          {/* Module results */}
          {Object.entries(groups).map(([groupName, items]) => (
            <div key={groupName} className="px-2 py-2">
              <p className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-widest text-[var(--fg-subtle)]">
                {groupName}
              </p>
              {items.map((item) => {
                const idx = flatIndex++;
                const isActive = idx === activeIndex;
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => navigate(item.href)}
                    onMouseEnter={() => setActiveIndex(idx)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius-md)] text-left transition-colors ${
                      isActive ? "bg-[var(--brand-subtle)]" : "hover:bg-[var(--bg-surface-2)]"
                    }`}
                  >
                    <div className={`w-7 h-7 rounded-[var(--radius-md)] flex items-center justify-center shrink-0 ${
                      isActive ? "bg-[var(--brand-default)]" : "bg-[var(--bg-surface-3)]"
                    }`}>
                      <Icon size={14} className={isActive ? "text-white" : "text-[var(--fg-muted)]"} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className={`text-[13.5px] font-medium truncate ${isActive ? "text-[var(--brand-default)]" : "text-[var(--fg-default)]"}`}>
                        {item.label}
                      </p>
                      <p className="text-[12px] text-[var(--fg-subtle)] truncate">{item.desc}</p>
                    </div>
                    {isActive && <Hash size={13} className="shrink-0 text-[var(--brand-default)]" />}
                  </button>
                );
              })}
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 gap-2">
              <Search size={24} strokeWidth={1.2} className="text-[var(--fg-subtle)]" />
              <p className="text-[13px] text-[var(--fg-muted)]">Không tìm thấy kết quả cho "{query}"</p>
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between px-4 py-2.5 border-t border-[var(--border-subtle)]">
            <div className="flex items-center gap-3 text-[11px] text-[var(--fg-subtle)]">
              <span className="flex items-center gap-1">
                <kbd className="bg-[var(--bg-surface-3)] border border-[var(--border-default)] rounded px-1 py-0.5 font-mono text-[10px]">↑↓</kbd>
                điều hướng
              </span>
              <span className="flex items-center gap-1">
                <kbd className="bg-[var(--bg-surface-3)] border border-[var(--border-default)] rounded px-1 py-0.5 font-mono text-[10px]">↵</kbd>
                mở
              </span>
            </div>
            <span className="text-[11px] text-[var(--fg-subtle)]">{filtered.length} kết quả</span>
          </div>
        </div>
      </div>
    </div>
  );
}
