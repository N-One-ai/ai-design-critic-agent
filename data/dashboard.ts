/**
 * Dashboard mock data.
 *
 * TODO (CMS): Replace each export with a typed API call to the backend
 * data service. The types below define the contract the API must satisfy.
 *
 * Example: const RECENT_PROJECTS = await fetch('/api/projects?limit=4').then(r => r.json())
 */

/* ─── Projects ─────────────────────────────────────────────────────── */

export type ProjectStatus = "active" | "review" | "done";

export interface DashboardProject {
  id: string;
  name: string;
  module: string;
  /** Relative time string, e.g. "10 phút" */
  updated: string;
  status: ProjectStatus;
  /** Hex color for the project avatar */
  color: string;
  files: number;
  members: string[];
}

export const RECENT_PROJECTS: DashboardProject[] = [
  { id: "1", name: "Tết Nguyên Đán 2025",  module: "Banner Generator", updated: "10 phút",  status: "active",  color: "#0033c9", files: 24, members: ["Ngọc NA", "Minh TT"] },
  { id: "2", name: "Campaign Q1/2025",      module: "Image Generator",  updated: "2 giờ",    status: "review",  color: "#00cf6a", files: 12, members: ["Ngọc NA"] },
  { id: "3", name: "ZaloPay App Rebrand",   module: "Brand Checker",    updated: "Hôm qua",  status: "done",    color: "#8b5cf6", files: 8,  members: ["Ngọc NA", "Tuan LM", "Lan PH"] },
  { id: "4", name: "Cashback Q4 Campaign",  module: "Creative Studio",  updated: "3 ngày",   status: "active",  color: "#f59e0b", files: 18, members: ["Ngọc NA"] },
];

export const PROJECT_STATUS_CONFIG: Record<ProjectStatus, { variant: "success" | "warning" | "default"; label: string }> = {
  active: { variant: "success", label: "Đang chạy" },
  review: { variant: "warning", label: "Đang duyệt" },
  done:   { variant: "default", label: "Hoàn thành" },
};

/* ─── Assets ────────────────────────────────────────────────────────── */

export type AssetType = "image" | "banner";

export interface DashboardAsset {
  id: string;
  type: AssetType;
  name: string;
  /** Gradient start color */
  c1: string;
  /** Gradient end color */
  c2: string;
}

export const RECENT_ASSETS: DashboardAsset[] = [
  { id: "1", type: "image",  name: "Hero Banner Tết",      c1: "#0033c9", c2: "#1a44dd" },
  { id: "2", type: "image",  name: "ZaloPay Icon Set",      c1: "#00cf6a", c2: "#00a354" },
  { id: "3", type: "banner", name: "Flash Sale Banner",      c1: "#e53e3e", c2: "#c53030" },
  { id: "4", type: "image",  name: "Lifestyle Photo",        c1: "#8b5cf6", c2: "#6d28d9" },
  { id: "5", type: "image",  name: "App Screenshot",         c1: "#06b6d4", c2: "#0891b2" },
  { id: "6", type: "banner", name: "Cashback Campaign",      c1: "#f59e0b", c2: "#d97706" },
  { id: "7", type: "image",  name: "Brand Pattern",          c1: "#2f6bff", c2: "#0033c9" },
  { id: "8", type: "image",  name: "Festive Illustration",   c1: "#ec4899", c2: "#db2777" },
];

/* ─── Platform statistics ───────────────────────────────────────────── */

/** iconId maps to a Lucide icon in the page component */
export type StatIconId = "projects" | "assets" | "credits" | "reports" | "images" | "videos";

export interface PlatformStat {
  id: StatIconId;
  label: string;
  /** Formatted display value, e.g. "1,482" */
  value: string;
  color: string;
}

export const PLATFORM_STATS: PlatformStat[] = [
  { id: "projects", label: "Projects",      value: "24",    color: "#2f6bff" },
  { id: "assets",   label: "Assets",        value: "1,482", color: "#00cf6a" },
  { id: "credits",  label: "AI Credits",    value: "9,160", color: "#f59e0b" },
  { id: "reports",  label: "Brand Reports", value: "248",   color: "#0033c9" },
  { id: "images",   label: "Gen. Images",   value: "1,024", color: "#8b5cf6" },
  { id: "videos",   label: "Gen. Videos",   value: "38",    color: "#ec4899" },
];

/* ─── News & updates ────────────────────────────────────────────────── */

export type NewsIconId = "check" | "rocket" | "bell";
export type NewsBadgeVariant = "primary" | "accent" | "default";

export interface NewsItem {
  id: string;
  /** Maps to Lucide icon in page component */
  iconId: NewsIconId;
  title: string;
  desc: string;
  badge: NewsBadgeVariant;
  badgeLabel: string;
  time: string;
}

export const NEWS_ITEMS: NewsItem[] = [
  { id: "1", iconId: "check",  title: "Brand Checker 2.0",           desc: "Phân tích nhanh hơn 3×, báo cáo chi tiết và score breakdown mới.",    badge: "primary", badgeLabel: "Cập nhật", time: "Hôm nay" },
  { id: "2", iconId: "rocket", title: "42 Template Tết 2025",         desc: "Template Tết Nguyên Đán 2025 đã sẵn sàng trong thư viện.",             badge: "accent",  badgeLabel: "Mới",       time: "Hôm qua" },
  { id: "3", iconId: "bell",   title: "ZaloPay Brand Guideline v2.4", desc: "Tài liệu brand guideline phiên bản mới đã được cập nhật hệ thống.",    badge: "default", badgeLabel: "Thông báo", time: "3 ngày"  },
];
