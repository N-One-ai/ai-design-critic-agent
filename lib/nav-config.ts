import {
  LayoutDashboard,
  Target,
  Image,
  Sparkles,
  Video,
  Palette,
  PenTool,
  Archive,
  Clock,
  Star,
  Users,
  Settings,
  Layers,
  type LucideIcon,
} from "lucide-react";

export type NavBadge = "beta" | "soon" | "new";

export interface NavItem {
  id: string;
  label: string;
  href: string;
  Icon: LucideIcon;
  badge?: NavBadge;
  description?: string;
}

export interface NavGroup {
  label?: string;
  items: NavItem[];
}

export const NAV_GROUPS: NavGroup[] = [
  {
    items: [
      {
        id: "dashboard",
        label: "Dashboard",
        href: "/dashboard",
        Icon: LayoutDashboard,
        description: "Tổng quan hoạt động",
      },
    ],
  },
  {
    label: "Tạo nội dung",
    items: [
      {
        id: "brand-checker",
        label: "Brand Checker",
        href: "/brand-checker",
        Icon: Target,
        description: "Kiểm tra tuân thủ thương hiệu",
      },
      {
        id: "banner-generator",
        label: "Banner Generator",
        href: "/banner-generator",
        Icon: Image,
        badge: "soon",
        description: "Tạo banner tự động",
      },
      {
        id: "image-generator",
        label: "Image Generator",
        href: "/image-generator",
        Icon: Sparkles,
        badge: "soon",
        description: "Sinh ảnh bằng AI",
      },
      {
        id: "video-generator",
        label: "Video Generator",
        href: "/video-generator",
        Icon: Video,
        badge: "soon",
        description: "Tạo video marketing",
      },
      {
        id: "creative-studio",
        label: "Creative Studio",
        href: "/creative-studio",
        Icon: Palette,
        badge: "soon",
        description: "Không gian sáng tác",
      },
      {
        id: "prompt-studio",
        label: "Prompt Studio",
        href: "/prompt-studio",
        Icon: PenTool,
        badge: "soon",
        description: "Thư viện prompt AI",
      },
    ],
  },
  {
    label: "Quản lý",
    items: [
      {
        id: "asset-library",
        label: "Asset Library",
        href: "/asset-library",
        Icon: Archive,
        badge: "soon",
        description: "Kho tài nguyên thiết kế",
      },
      {
        id: "history",
        label: "History",
        href: "/history",
        Icon: Clock,
        description: "Lịch sử phân tích",
      },
      {
        id: "favorites",
        label: "Favorites",
        href: "/favorites",
        Icon: Star,
        description: "Thiết kế đã lưu",
      },
      {
        id: "team",
        label: "Team Workspace",
        href: "/team",
        Icon: Users,
        badge: "soon",
        description: "Cộng tác nhóm",
      },
    ],
  },
  {
    items: [
      {
        id: "design-system",
        label: "Design System",
        href: "/design-system",
        Icon: Layers,
        badge: "new",
        description: "Component library & tokens",
      },
      {
        id: "settings",
        label: "Settings",
        href: "/settings",
        Icon: Settings,
        description: "Cài đặt tài khoản",
      },
    ],
  },
];

export const ALL_NAV_ITEMS: NavItem[] = NAV_GROUPS.flatMap((g) => g.items);

export function findNavItem(id: string): NavItem | undefined {
  return ALL_NAV_ITEMS.find((item) => item.id === id);
}
