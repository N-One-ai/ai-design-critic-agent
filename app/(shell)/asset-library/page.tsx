"use client";

import { useEffect } from "react";
import { Archive, Image as ImageIcon, FileText, Download, Filter, Grid, List, Search } from "lucide-react";
import { useRightPanel } from "@/contexts/right-panel-context";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs } from "@/components/ui/tabs";
import { WorkspaceHeader } from "@/components/ui/section";

const ASSETS = [
  { id: "1",  name: "ZaloPay Logo Full",        type: "SVG",  size: "12 KB",  cat: "Logo",   color: "#0033c9" },
  { id: "2",  name: "ZaloPay Logo Mark",         type: "SVG",  size: "8 KB",   cat: "Logo",   color: "#0033c9" },
  { id: "3",  name: "Brand Blue Gradient",       type: "PNG",  size: "240 KB", cat: "Background", color: "#3b5bdb" },
  { id: "4",  name: "Icon Set — Payments",       type: "SVG",  size: "64 KB",  cat: "Icons",  color: "#00cf6a" },
  { id: "5",  name: "Icon Set — Security",       type: "SVG",  size: "48 KB",  cat: "Icons",  color: "#0033c9" },
  { id: "6",  name: "Brand Typography Guide",    type: "PDF",  size: "2.1 MB", cat: "Guides", color: "#6366f1" },
  { id: "7",  name: "Campaign Photo — Lifestyle",type: "JPG",  size: "1.8 MB", cat: "Photos", color: "#f59e0b" },
  { id: "8",  name: "Pattern — Blue Dots",       type: "PNG",  size: "180 KB", cat: "Patterns", color: "#0033c9" },
  { id: "9",  name: "Social Media Kit",          type: "ZIP",  size: "8.4 MB", cat: "Kits",   color: "#ec4899" },
  { id: "10", name: "Tết 2025 Assets",           type: "ZIP",  size: "12 MB",  cat: "Seasonal", color: "#e53e3e" },
  { id: "11", name: "Color Palette",             type: "ASE",  size: "4 KB",   cat: "Guides", color: "#06b6d4" },
  { id: "12", name: "Motion Guidelines",         type: "PDF",  size: "3.2 MB", cat: "Guides", color: "#8b5cf6" },
];

const CATS = ["Tất cả", "Logo", "Icons", "Photos", "Guides", "Kits"];

function AssetCard({ name, type, size, cat, color }: { name: string; type: string; size: string; cat: string; color: string }) {
  const isImage = ["PNG", "JPG", "SVG"].includes(type);
  return (
    <div className="bg-[var(--bg-surface-1)] border border-[var(--border-default)] rounded-[var(--radius-xl)] overflow-hidden group cursor-pointer hover:border-[var(--brand-default)] transition-all">
      <div
        className="w-full aspect-video flex items-center justify-center relative"
        style={{ background: `linear-gradient(135deg, ${color}14, ${color}28)` }}
      >
        {isImage
          ? <ImageIcon size={24} strokeWidth={1} style={{ color }} className="opacity-40" />
          : <FileText size={24} strokeWidth={1} style={{ color }} className="opacity-40" />
        }
        <div className="absolute top-2 right-2">
          <span className="text-[9px] font-bold text-white/80 bg-black/40 backdrop-blur-sm px-1.5 py-0.5 rounded uppercase">
            {type}
          </span>
        </div>
        <button className="absolute bottom-2 right-2 w-7 h-7 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
          <Download size={12} />
        </button>
      </div>
      <div className="p-2.5">
        <p className="text-[12.5px] font-medium text-[var(--fg-default)] truncate">{name}</p>
        <div className="flex items-center justify-between mt-1">
          <Badge variant="default" size="sm">{cat}</Badge>
          <span className="text-[10.5px] text-[var(--fg-subtle)]">{size}</span>
        </div>
      </div>
    </div>
  );
}

export default function AssetLibraryPage() {
  const { setContent } = useRightPanel();

  useEffect(() => {
    setContent(null);
    return () => setContent(null);
  }, [setContent]);

  return (
    <div>
      <WorkspaceHeader
        title="Asset Library"
        description="Kho tài nguyên thiết kế đã được kiểm duyệt của ZaloPay"
        icon={<Archive size={18} className="text-[var(--brand-default)]" />}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" icon={<Filter size={13} />}>Lọc</Button>
            <Button variant="secondary" size="sm" icon={<Download size={13} />}>Tải về</Button>
          </div>
        }
      />

      <div className="p-4 sm:p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="flex-1 flex items-center gap-2 px-3 py-2 bg-[var(--bg-surface-1)] border border-[var(--border-default)] rounded-[var(--radius-lg)]">
            <Search size={14} className="text-[var(--fg-subtle)] shrink-0" />
            <input
              type="text"
              placeholder="Tìm asset..."
              className="flex-1 text-[13.5px] bg-transparent outline-none text-[var(--fg-default)] placeholder:text-[var(--fg-subtle)]"
            />
          </div>
          <div className="flex items-center gap-1.5">
            <button className="w-8 h-8 flex items-center justify-center rounded-[var(--radius-md)] bg-[var(--brand-subtle)] text-[var(--brand-default)]">
              <Grid size={14} />
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-[var(--radius-md)] text-[var(--fg-muted)] hover:bg-[var(--bg-surface-2)]">
              <List size={14} />
            </button>
          </div>
        </div>

        <Tabs
          variant="pill"
          defaultValue="Tất cả"
          items={CATS.map((c) => ({ id: c, label: c }))}
        >
          {() => (
            <div className="mt-5 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
              {ASSETS.map((a) => (
                <AssetCard key={a.id} {...a} />
              ))}
            </div>
          )}
        </Tabs>
      </div>
    </div>
  );
}
